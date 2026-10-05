import "server-only";

import { prisma } from "@/lib/prisma";

export const FEEDBACK_LINK_VALID_DAYS = 30;
export const FEEDBACK_MESSAGE_MAX_LENGTH = 200;

const LINK_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type PublicFeedbackData = {
  identifier: string;
  productName: string;
  purchaseDate: Date;
  rating: number | null;
  feedbackMessage: string | null;
  submittedAt: Date | null;
  expiresAt: Date;
};

export type PublicFeedbackLookup =
  | { status: "invalid" }
  | { status: "unknown" }
  | { status: "unavailable" }
  | { status: "expired"; feedback: PublicFeedbackData }
  | { status: "submitted"; feedback: PublicFeedbackData }
  | { status: "open"; feedback: PublicFeedbackData };

export type FeedbackSubmissionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: string[];
  rating?: number;
  feedbackMessage?: string;
};

type FeedbackRecord = {
  linkIdentifier: string;
  productName: string;
  purchaseDate: Date;
  rating: number | null;
  feedbackMessage: string | null;
  submittedAt: Date | null;
  createdAt: Date;
};

export async function resolvePublicFeedback(
  identifier: string,
  now = new Date()
): Promise<PublicFeedbackLookup> {
  const safeIdentifier = normalizeFeedbackIdentifier(identifier);

  if (!safeIdentifier) {
    return { status: "invalid" };
  }

  let feedback: FeedbackRecord | null;

  try {
    feedback = await prisma.feedback.findUnique({
      where: { linkIdentifier: safeIdentifier },
      select: publicFeedbackSelect()
    });
  } catch (error) {
    console.error("Unable to resolve public feedback link.", sanitizeFeedbackError(error));
    return { status: "unavailable" };
  }

  if (!feedback) {
    return { status: "unknown" };
  }

  return classifyFeedbackRecord(feedback, now);
}

export async function submitPublicFeedback(
  identifier: string,
  formData: FormData,
  now = new Date()
): Promise<FeedbackSubmissionState> {
  const lookup = await resolvePublicFeedback(identifier, now);

  if (lookup.status === "invalid" || lookup.status === "unknown" || lookup.status === "unavailable") {
    return {
      status: "error",
      message: "This feedback link is not available.",
      errors: [lookup.status === "unavailable"
        ? "Try again later."
        : "Open the feedback request from the email you received."]
    };
  }

  if (lookup.status === "expired") {
    return {
      status: "error",
      message: "This feedback link has expired.",
      errors: [`Feedback links remain valid for ${FEEDBACK_LINK_VALID_DAYS} days.`]
    };
  }

  if (lookup.status === "submitted") {
    return {
      status: "error",
      message: "Feedback has already been submitted.",
      errors: ["The existing feedback is shown on this page."]
    };
  }

  const validation = validateFeedbackSubmission(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "Fix the highlighted feedback details.",
      errors: validation.errors,
      rating: validation.rating,
      feedbackMessage: validation.feedbackMessage
    };
  }

  let update: { count: number };

  try {
    update = await prisma.feedback.updateMany({
      where: {
        linkIdentifier: lookup.feedback.identifier,
        submittedAt: null
      },
      data: {
        rating: validation.rating,
        feedbackMessage: validation.feedbackMessage,
        submittedAt: now
      }
    });
  } catch (error) {
    console.error("Unable to submit public feedback.", sanitizeFeedbackError(error));
    return {
      status: "error",
      message: "We could not save your feedback.",
      errors: ["Try again later."]
    };
  }

  if (update.count === 0) {
    return {
      status: "error",
      message: "Feedback has already been submitted.",
      errors: ["The existing feedback is shown on this page."]
    };
  }

  return {
    status: "success",
    message: "Thank you. Your feedback has been submitted.",
    errors: [],
    rating: validation.rating,
    feedbackMessage: validation.feedbackMessage
  };
}

export function validateFeedbackSubmission(formData: FormData):
  | { ok: true; rating: number; feedbackMessage: string }
  | { ok: false; errors: string[]; rating?: number; feedbackMessage?: string } {
  const errors: string[] = [];
  const ratingValue = formData.get("rating");
  const messageValue = formData.get("feedbackMessage");
  const ratingText = typeof ratingValue === "string" ? ratingValue.trim() : "";
  const rating = Number(ratingText);
  const feedbackMessage = typeof messageValue === "string" ? normalizeFeedbackMessage(messageValue) : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 10 || ratingText !== String(rating)) {
    errors.push("Choose a rating from 1 to 10.");
  }

  if (feedbackMessage.length === 0) {
    errors.push("Enter a feedback message.");
  }

  if (feedbackMessage.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    errors.push(`Feedback message must be ${FEEDBACK_MESSAGE_MAX_LENGTH} characters or fewer.`);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      rating: Number.isInteger(rating) ? rating : undefined,
      feedbackMessage
    };
  }

  return { ok: true, rating, feedbackMessage };
}

export function normalizeFeedbackIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  return LINK_IDENTIFIER_PATTERN.test(trimmed) ? trimmed : null;
}

export function getFeedbackLinkExpiresAt(createdAt: Date) {
  return new Date(createdAt.getTime() + FEEDBACK_LINK_VALID_DAYS * DAY_IN_MS);
}

export function isFeedbackLinkExpired(createdAt: Date, now = new Date()) {
  return now.getTime() > getFeedbackLinkExpiresAt(createdAt).getTime();
}

export function classifyFeedbackRecord(
  feedback: FeedbackRecord,
  now = new Date()
): PublicFeedbackLookup {
  const publicFeedback = toPublicFeedbackData(feedback);

  if (feedback.submittedAt) {
    return { status: "submitted", feedback: publicFeedback };
  }

  if (isFeedbackLinkExpired(feedback.createdAt, now)) {
    return { status: "expired", feedback: publicFeedback };
  }

  return { status: "open", feedback: publicFeedback };
}

function toPublicFeedbackData(feedback: FeedbackRecord): PublicFeedbackData {
  return {
    identifier: feedback.linkIdentifier,
    productName: feedback.productName,
    purchaseDate: feedback.purchaseDate,
    rating: feedback.rating,
    feedbackMessage: feedback.feedbackMessage,
    submittedAt: feedback.submittedAt,
    expiresAt: getFeedbackLinkExpiresAt(feedback.createdAt)
  };
}

function publicFeedbackSelect() {
  return {
    linkIdentifier: true,
    productName: true,
    purchaseDate: true,
    rating: true,
    feedbackMessage: true,
    submittedAt: true,
    createdAt: true
  };
}

function normalizeFeedbackMessage(message: string) {
  return message.replace(/\r\n/g, "\n").trim();
}

function sanitizeFeedbackError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: "Unknown feedback service error" };
}
