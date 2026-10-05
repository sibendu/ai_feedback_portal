import "server-only";

import { Buffer } from "node:buffer";

import { parseFirstWorksheet, type WorkbookRows } from "./xlsx";

export type FeedbackUploadRow = {
  rowNumber: number;
  email: string;
  type: "purchase";
  productCode: string;
  productName: string;
  purchaseDate: Date;
};

export type FeedbackUploadValidationResult =
  | { ok: true; rows: FeedbackUploadRow[]; totalRows: number }
  | { ok: false; errors: string[] };

const REQUIRED_COLUMNS = ["email", "type", "product_code", "product_name", "purchase_date"] as const;
const MAX_ROWS = 1000;
const MAX_PRODUCT_CODE_LENGTH = 64;
const MAX_PRODUCT_NAME_LENGTH = 160;

export async function parseAndValidateFeedbackUpload(file: File): Promise<FeedbackUploadValidationResult> {
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xlsx")) {
    return { ok: false, errors: ["Upload a .xlsx workbook with the required feedback request columns."] };
  }

  if (file.size === 0) {
    return { ok: false, errors: ["The uploaded workbook is empty."] };
  }

  try {
    const rows = parseFirstWorksheet(Buffer.from(await file.arrayBuffer()));
    return validateWorkbookRows(rows);
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error && error.message ? error.message : "The uploaded workbook could not be parsed."]
    };
  }
}

export function validateWorkbookRows(rows: WorkbookRows): FeedbackUploadValidationResult {
  const header = rows[0]?.map(normalizeHeader) ?? [];
  const columnIndexes = new Map(header.map((name, index) => [name, index]));
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !columnIndexes.has(column));
  const duplicateColumns = findDuplicateRequiredColumns(header);

  if (missingColumns.length > 0) {
    return {
      ok: false,
      errors: [`Missing required column${missingColumns.length === 1 ? "" : "s"}: ${missingColumns.join(", ")}.`]
    };
  }

  if (duplicateColumns.length > 0) {
    return {
      ok: false,
      errors: [`Duplicate required column${duplicateColumns.length === 1 ? "" : "s"}: ${duplicateColumns.join(", ")}.`]
    };
  }

  const dataRows = rows.slice(1).filter((row) => row.some((value) => value.trim() !== ""));
  if (dataRows.length === 0) {
    return { ok: false, errors: ["The uploaded workbook must include at least one customer row."] };
  }

  if (dataRows.length > MAX_ROWS) {
    return { ok: false, errors: [`Upload at most ${MAX_ROWS} customer rows at a time.`] };
  }

  const errors: string[] = [];
  const validRows: FeedbackUploadRow[] = [];

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const email = getCell(row, columnIndexes, "email").toLowerCase();
    const type = getCell(row, columnIndexes, "type").toLowerCase();
    const productCode = getCell(row, columnIndexes, "product_code");
    const productName = getCell(row, columnIndexes, "product_name");
    const purchaseDateValue = getCell(row, columnIndexes, "purchase_date");
    const purchaseDate = parsePurchaseDate(purchaseDateValue);

    if (!email || !isValidEmailAddress(email)) {
      errors.push(`Row ${rowNumber}: email must be a valid email address.`);
    }
    if (type !== "purchase") {
      errors.push(`Row ${rowNumber}: type "${type || "(blank)"}" is not supported. Use purchase.`);
    }
    if (!productCode) {
      errors.push(`Row ${rowNumber}: product_code is required.`);
    } else if (productCode.length > MAX_PRODUCT_CODE_LENGTH) {
      errors.push(`Row ${rowNumber}: product_code must be ${MAX_PRODUCT_CODE_LENGTH} characters or fewer.`);
    }
    if (!productName) {
      errors.push(`Row ${rowNumber}: product_name is required.`);
    } else if (productName.length > MAX_PRODUCT_NAME_LENGTH) {
      errors.push(`Row ${rowNumber}: product_name must be ${MAX_PRODUCT_NAME_LENGTH} characters or fewer.`);
    }
    if (!purchaseDate) {
      errors.push(`Row ${rowNumber}: purchase_date must be a valid date.`);
    }

    if (
      email &&
      isValidEmailAddress(email) &&
      type === "purchase" &&
      productCode &&
      productCode.length <= MAX_PRODUCT_CODE_LENGTH &&
      productName &&
      productName.length <= MAX_PRODUCT_NAME_LENGTH &&
      purchaseDate
    ) {
      validRows.push({
        rowNumber,
        email,
        type: "purchase",
        productCode,
        productName,
        purchaseDate
      });
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, rows: validRows, totalRows: dataRows.length };
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function findDuplicateRequiredColumns(header: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const column of header) {
    if (!REQUIRED_COLUMNS.includes(column as (typeof REQUIRED_COLUMNS)[number])) continue;

    if (seen.has(column)) {
      duplicates.add(column);
    }

    seen.add(column);
  }

  return [...duplicates];
}

function getCell(row: string[], columns: Map<string, number>, column: (typeof REQUIRED_COLUMNS)[number]) {
  const index = columns.get(column);
  return index === undefined ? "" : (row[index] ?? "").trim();
}

function parsePurchaseDate(value: string) {
  if (!value) return null;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpoch + numericValue * 24 * 60 * 60 * 1000);
    return isValidDate(date) ? date : null;
  }

  const dateParts = /^(\d{4})([-/])(\d{1,2})\2(\d{1,2})(?:[T\s].*)?$/.exec(value);
  if (dateParts) {
    const year = Number(dateParts[1]);
    const month = Number(dateParts[3]);
    const day = Number(dateParts[4]);
    const date = new Date(Date.UTC(year, month - 1, day));

    return isExactUtcDate(date, year, month, day) ? date : null;
  }

  return null;
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function isExactUtcDate(value: Date, year: number, month: number, day: number) {
  return (
    isValidDate(value) &&
    value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day
  );
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
