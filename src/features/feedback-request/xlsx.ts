import "server-only";

import { Buffer } from "node:buffer";
import { inflateRawSync } from "node:zlib";

export type WorkbookRows = string[][];

type ZipEntry = {
  name: string;
  content: Buffer;
};

export function parseFirstWorksheet(buffer: Buffer): WorkbookRows {
  const entries = readZipEntries(buffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml")?.content.toString("utf8") ?? "");
  const workbookXml = getRequiredXml(entries, "xl/workbook.xml");
  const relationshipsXml = getRequiredXml(entries, "xl/_rels/workbook.xml.rels");
  const sheetPath = getFirstWorksheetPath(workbookXml, relationshipsXml);
  const worksheetXml = getRequiredXml(entries, sheetPath);

  return parseWorksheet(worksheetXml, sharedStrings);
}

function readZipEntries(buffer: Buffer) {
  const entries = new Map<string, ZipEntry>();
  const endOfCentralDirectory = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = buffer.readUInt32LE(endOfCentralDirectory + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;
  let cursor = centralDirectoryOffset;

  while (cursor < centralDirectoryEnd) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error("The uploaded workbook could not be read.");
    }

    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + fileNameLength).toString("utf8");
    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const content = compressionMethod === 0
      ? Buffer.from(compressed)
      : compressionMethod === 8
        ? inflateRawSync(compressed)
        : undefined;

    if (content) {
      entries.set(name, { name, content });
    }

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer) {
  const minimumOffset = Math.max(0, buffer.length - 66000);

  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("The uploaded file is not a readable .xlsx workbook.");
}

function getRequiredXml(entries: Map<string, ZipEntry>, path: string) {
  const content = entries.get(path)?.content;

  if (!content) {
    throw new Error("The uploaded workbook is missing required worksheet data.");
  }

  return content.toString("utf8");
}

function parseSharedStrings(xml: string) {
  if (!xml) return [];

  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) => {
    const textParts = [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((textMatch) => textMatch[1]);
    return decodeXml(textParts.join(""));
  });
}

function getFirstWorksheetPath(workbookXml: string, relationshipsXml: string) {
  const firstSheet = workbookXml.match(/<sheet\b[^>]*r:id="([^"]+)"/);

  if (!firstSheet) {
    throw new Error("The uploaded workbook does not contain a worksheet.");
  }

  const relationship = new RegExp(`<Relationship\\b[^>]*Id="${escapeRegExp(firstSheet[1])}"[^>]*Target="([^"]+)"`).exec(relationshipsXml);

  if (!relationship) {
    throw new Error("The uploaded workbook worksheet relationship is invalid.");
  }

  const target = relationship[1].replace(/^\/+/, "");
  return target.startsWith("xl/") ? target : `xl/${target}`;
}

function parseWorksheet(xml: string, sharedStrings: string[]) {
  const rows: WorkbookRows = [];

  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];

    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1];
      const ref = attributes.match(/\br="([A-Z]+)\d+"/)?.[1];
      const type = attributes.match(/\bt="([^"]+)"/)?.[1];
      const columnIndex = ref ? columnNameToIndex(ref) : cells.length;
      cells[columnIndex] = parseCellValue(cellMatch[2], type, sharedStrings);
    }

    rows.push(cells.map((value) => value ?? ""));
  }

  return rows;
}

function parseCellValue(cellXml: string, type: string | undefined, sharedStrings: string[]) {
  const inlineString = cellXml.match(/<is\b[^>]*>[\s\S]*?<t\b[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/)?.[1];
  if (inlineString !== undefined) {
    return decodeXml(inlineString);
  }

  const rawValue = cellXml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "";
  if (type === "s") {
    return sharedStrings[Number(rawValue)] ?? "";
  }

  if (type === "b") {
    return rawValue === "1" ? "TRUE" : "FALSE";
  }

  return decodeXml(rawValue);
}

function columnNameToIndex(columnName: string) {
  return columnName.split("").reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
