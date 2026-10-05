import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

import {
  createFeedbackRequestEmailSender,
  sanitizeFeedbackEmailFailure,
  type FeedbackRequestEmailResult,
  type FeedbackRequestEmailSender
} from "./email";
import type { FeedbackUploadRow } from "./validation";

export type CreateFeedbackBatchInput = {
  uploadedById: string;
  sourceFileName: string;
  rows: FeedbackUploadRow[];
};

export type CreateFeedbackBatchResult = {
  batchId: string;
  createdCount: number;
  emailSentCount: number;
  emailFailedCount: number;
};

export async function createFeedbackBatchFromRows(
  input: CreateFeedbackBatchInput,
  sender: FeedbackRequestEmailSender = createFeedbackRequestEmailSender()
): Promise<CreateFeedbackBatchResult> {
  const feedbackRows = await withUniqueLinkIdentifiers(input.rows);

  const batch = await prisma.$transaction(async (transaction) => {
    const createdBatch = await transaction.feedbackBatch.create({
      data: {
        uploadedById: input.uploadedById,
        sourceFileName: input.sourceFileName,
        totalRows: input.rows.length,
        createdCount: feedbackRows.length,
        status: "created",
        feedbacks: {
          create: feedbackRows.map((row) => ({
            email: row.email,
            type: row.type,
            productCode: row.productCode,
            productName: row.productName,
            purchaseDate: row.purchaseDate,
            linkIdentifier: row.linkIdentifier
          }))
        }
      },
      include: { feedbacks: true }
    });

    return createdBatch;
  });

  let emailSentCount = 0;
  let emailFailedCount = 0;

  for (const feedback of batch.feedbacks) {
    const result = await safelySendFeedbackRequestEmail({
      id: feedback.id,
      email: feedback.email,
      productName: feedback.productName,
      purchaseDate: feedback.purchaseDate,
      linkIdentifier: feedback.linkIdentifier
    }, sender);

    if (result.status === "sent") {
      emailSentCount += 1;
      await prisma.feedback.update({
        where: { id: feedback.id },
        data: {
          emailStatus: "sent",
          emailAttemptedAt: new Date(),
          emailSentAt: new Date(),
          emailError: null
        }
      });
    } else {
      emailFailedCount += 1;
      await prisma.feedback.update({
        where: { id: feedback.id },
        data: {
          emailStatus: "failed",
          emailAttemptedAt: new Date(),
          emailError: toFeedbackEmailFailure(result)
        }
      });
    }
  }

  await prisma.feedbackBatch.update({
    where: { id: batch.id },
    data: {
      emailSentCount,
      emailFailedCount,
      status: emailFailedCount > 0 ? "completed-with-email-failures" : "completed"
    }
  });

  return {
    batchId: batch.id,
    createdCount: batch.feedbacks.length,
    emailSentCount,
    emailFailedCount
  };
}

export function generateFeedbackLinkIdentifier() {
  return randomBytes(24).toString("base64url");
}

async function withUniqueLinkIdentifiers(rows: FeedbackUploadRow[]) {
  const used = new Set<string>();
  return Promise.all(rows.map(async (row) => {
    let attempts = 0;
    let linkIdentifier = generateFeedbackLinkIdentifier();

    while (used.has(linkIdentifier) || await prisma.feedback.findUnique({ where: { linkIdentifier } })) {
      attempts += 1;
      if (attempts > 5) {
        throw new Error("Could not generate a unique feedback link identifier.");
      }
      linkIdentifier = generateFeedbackLinkIdentifier();
    }

    used.add(linkIdentifier);
    return { ...row, linkIdentifier };
  }));
}

async function safelySendFeedbackRequestEmail(
  request: Parameters<FeedbackRequestEmailSender>[0],
  sender: FeedbackRequestEmailSender
): Promise<FeedbackRequestEmailResult> {
  try {
    return await sender(request);
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error && error.message ? error.message : "Feedback request email delivery failed."
    };
  }
}

function toFeedbackEmailFailure(result: Exclude<FeedbackRequestEmailResult, { status: "sent" }>) {
  if (result.status === "missing-configuration") {
    return `Missing Gmail configuration: ${result.missingKeys.join(", ")}`;
  }

  if (result.status === "invalid-recipient") {
    return "The feedback recipient email address is invalid.";
  }

  return sanitizeFeedbackEmailFailure(result.error);
}
