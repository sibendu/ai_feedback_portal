import "server-only";

import {
  readGmailConfig,
  sendWithGmailSmtp,
  type SmtpMessage
} from "@/features/registration/welcome-email";

export type FeedbackRequestEmail = {
  id: string;
  email: string;
  productName: string;
  purchaseDate: Date;
  linkIdentifier: string;
};

export type FeedbackRequestEmailResult =
  | { status: "sent" }
  | { status: "missing-configuration"; missingKeys: string[] }
  | { status: "invalid-recipient" }
  | { status: "failed"; error: string };

export type FeedbackRequestEmailSender = (
  request: FeedbackRequestEmail
) => Promise<FeedbackRequestEmailResult>;

type FeedbackEmailConfig = {
  from: string;
  baseUrl: string;
};

type SmtpTransport = (message: SmtpMessage) => Promise<void>;

export function createFeedbackRequestEmailSender(
  env: NodeJS.ProcessEnv = process.env,
  transport: SmtpTransport = (message) => sendWithGmailSmtp(message, env)
): FeedbackRequestEmailSender {
  return async (request) => {
    const gmailConfig = readGmailConfig(env);
    const baseUrl = readFeedbackBaseUrl(env);

    if (!gmailConfig.ok) {
      return { status: "missing-configuration", missingKeys: gmailConfig.missingKeys };
    }

    if (!baseUrl) {
      return { status: "missing-configuration", missingKeys: ["AUTH_URL or NEXTAUTH_URL"] };
    }

    if (!isValidEmailAddress(request.email)) {
      return { status: "invalid-recipient" };
    }

    try {
      await transport(renderFeedbackRequestEmail(request, {
        from: gmailConfig.config.from,
        baseUrl
      }));
      return { status: "sent" };
    } catch (error) {
      return {
        status: "failed",
        error: error instanceof Error && error.message ? error.message : "Feedback request email delivery failed."
      };
    }
  };
}

export function renderFeedbackRequestEmail(
  request: FeedbackRequestEmail,
  config: FeedbackEmailConfig
): SmtpMessage {
  const feedbackUrl = new URL(`/feedback/${request.linkIdentifier}`, config.baseUrl).toString();
  const productName = request.productName.trim();
  const escapedProductName = escapeHtml(productName);
  const escapedFeedbackUrl = escapeHtml(feedbackUrl);
  const purchaseDate = request.purchaseDate.toISOString().slice(0, 10);

  return {
    from: config.from,
    to: request.email,
    subject: `Share feedback for ${productName}`,
    text: [
      "Hello,",
      "",
      `Please share feedback for your ${productName} purchase on ${purchaseDate}.`,
      "",
      `Feedback link: ${feedbackUrl}`,
      "",
      "Thank you."
    ].join("\n"),
    html: [
      "<p>Hello,</p>",
      `<p>Please share feedback for your <strong>${escapedProductName}</strong> purchase on ${purchaseDate}.</p>`,
      `<p><a href="${escapedFeedbackUrl}">Open your feedback form</a></p>`,
      "<p>Thank you.</p>"
    ].join("")
  };
}

export function sanitizeFeedbackEmailFailure(message: string) {
  return message
    .replace(/\b(password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function readFeedbackBaseUrl(env: NodeJS.ProcessEnv) {
  return env.AUTH_URL?.trim() || env.NEXTAUTH_URL?.trim() || "http://localhost:3000";
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
