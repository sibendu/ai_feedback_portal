import "server-only";

import { prisma } from "@/lib/prisma";

import { createWelcomeEmailSender, type WelcomeEmailResult, type WelcomeEmailSender, type WelcomeEmailUser } from "./welcome-email";

type RegistrationDeliveryResult =
  | { status: "sent" }
  | { status: "duplicate-skipped" }
  | { status: "failed"; errorCode: string; errorMessage: string };

export async function deliverWelcomeEmailForNewUser(
  user: WelcomeEmailUser,
  sender: WelcomeEmailSender = createWelcomeEmailSender()
): Promise<RegistrationDeliveryResult> {
  const claimed = await prisma.user.updateMany({
    where: {
      id: user.id,
      welcomeEmailAttemptedAt: null
    },
    data: {
      welcomeEmailAttemptedAt: new Date(),
      welcomeEmailStatus: "attempted"
    }
  });

  if (claimed.count === 0) {
    return { status: "duplicate-skipped" as const };
  }

  const result = await safelySendWelcomeEmail(user, sender);

  if (result.status === "sent") {
    await prisma.user.update({
      where: { id: user.id },
      data: { welcomeEmailSentAt: new Date(), welcomeEmailStatus: "sent", welcomeEmailError: null }
    });
    return result;
  }

  const failure = toFailureRecord(result);
  await prisma.$transaction(async (transaction) => {
    await transaction.registrationFailure.create({
      data: {
        registrationId: user.id,
        stage: "welcome-email",
        errorCode: failure.code,
        errorMessage: failure.message
      }
    });
    await transaction.user.update({
      where: { id: user.id },
      data: { welcomeEmailStatus: "failed", welcomeEmailError: failure.message }
    });
  });

  console.warn("Welcome email delivery failed after registration completed.", {
    registrationId: user.id,
    errorCode: failure.code
  });
  return { status: "failed", errorCode: failure.code, errorMessage: failure.message };
}

async function safelySendWelcomeEmail(user: WelcomeEmailUser, sender: WelcomeEmailSender): Promise<WelcomeEmailResult> {
  try {
    return await sender(user);
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error && error.message ? error.message : "Welcome email delivery failed."
    };
  }
}

function toFailureRecord(result: Exclude<WelcomeEmailResult, { status: "sent" }>) {
  if (result.status === "missing-configuration") {
    return {
      code: result.status,
      message: `Missing Gmail configuration: ${result.missingKeys.join(", ")}`
    };
  }
  if (result.status === "invalid-recipient") {
    return { code: result.status, message: "The registration email address is invalid." };
  }
  const smtpStatus = result.error.match(/SMTP command failed with code (\d{3})(?: \((\d\.\d\.\d)\))?/);
  if (smtpStatus) {
    const [, code, enhancedStatus] = smtpStatus;
    return {
      code: `smtp-${code}${enhancedStatus ? `-${enhancedStatus}` : ""}`,
      message: `SMTP provider rejected the message with status ${code}${enhancedStatus ? ` ${enhancedStatus}` : ""}.`
    };
  }
  return { code: result.status, message: sanitizeFailureMessage(result.error) };
}

function sanitizeFailureMessage(message: string) {
  return message
    .replace(/\b(password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}
