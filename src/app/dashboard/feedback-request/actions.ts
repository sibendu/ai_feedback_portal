"use server";

import { auth } from "@/auth";
import { createFeedbackBatchFromRows } from "@/features/feedback-request/service";
import { parseAndValidateFeedbackUpload } from "@/features/feedback-request/validation";

import type { FeedbackUploadActionState } from "./state";

export async function uploadFeedbackRequests(
  _previousState: FeedbackUploadActionState,
  formData: FormData
): Promise<FeedbackUploadActionState> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return {
      status: "error",
      message: "Sign in again before uploading feedback requests.",
      errors: ["Your session is no longer active."]
    };
  }

  const file = formData.get("feedbackFile");

  if (!(file instanceof File)) {
    return {
      status: "error",
      message: "Choose a .xlsx workbook before submitting.",
      errors: ["The feedback request file is required."]
    };
  }

  const parsed = await parseAndValidateFeedbackUpload(file);

  if (!parsed.ok) {
    return {
      status: "error",
      message: "Fix the workbook and upload it again.",
      errors: parsed.errors
    };
  }

  try {
    const result = await createFeedbackBatchFromRows({
      uploadedById: userId,
      sourceFileName: sanitizeUploadedFileName(file.name),
      rows: parsed.rows
    });

    return {
      status: "success",
      message: "Feedback requests were created.",
      errors: [],
      batchId: result.batchId,
      createdCount: result.createdCount,
      emailSentCount: result.emailSentCount,
      emailFailedCount: result.emailFailedCount
    };
  } catch (error) {
    return {
      status: "error",
      message: "The upload could not be completed.",
      errors: [error instanceof Error && error.message ? error.message : "Unexpected upload failure."]
    };
  }
}

function sanitizeUploadedFileName(fileName: string) {
  const baseName = fileName.split(/[\\/]/).pop() ?? "feedback-request.xlsx";
  const normalized = baseName.replace(/[^a-zA-Z0-9._ -]/g, "_").trim();
  const safeName = normalized.length > 0 ? normalized : "feedback-request.xlsx";

  return safeName.slice(0, 120);
}
