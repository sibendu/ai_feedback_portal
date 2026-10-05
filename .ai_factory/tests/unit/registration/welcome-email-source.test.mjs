import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");

test("welcome email state is persisted with nullable compatibility fields", () => {
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20260914183000_welcome_email_status/migration.sql");

  assert.match(schema, /model User \{[\s\S]*welcomeEmailAttemptedAt\s+DateTime\?/);
  assert.match(schema, /model User \{[\s\S]*welcomeEmailSentAt\s+DateTime\?/);
  assert.match(schema, /model User \{[\s\S]*welcomeEmailStatus\s+String\?/);
  assert.match(migration, /ADD COLUMN "welcomeEmailAttemptedAt" TIMESTAMP\(3\);/);
  assert.match(migration, /ADD COLUMN "welcomeEmailSentAt" TIMESTAMP\(3\);/);
  assert.match(migration, /ADD COLUMN "welcomeEmailStatus" TEXT;/);
  assert.doesNotMatch(migration, /NOT NULL/);
});

test("Gmail sender reads expected env keys and remains injectable", () => {
  const source = read("src/features/registration/welcome-email.ts");

  assert.match(source, /import "server-only"/);
  assert.match(source, /GMAIL_USER/);
  assert.match(source, /GMAIL_APP_PASSWORD/);
  assert.match(source, /GMAIL_FROM/);
  assert.match(source, /export function createWelcomeEmailSender\(/);
  assert.match(source, /transport: SmtpTransport = \(message\) => sendWithGmailSmtp\(message, env\)/);
  assert.match(source, /smtp\.gmail\.com/);
});

test("welcome sender has deterministic non-secret outcomes", () => {
  const source = read("src/features/registration/welcome-email.ts");

  assert.match(source, /status: "sent"/);
  assert.match(source, /status: "missing-configuration"; missingKeys: string\[\]/);
  assert.match(source, /status: "invalid-recipient"/);
  assert.match(source, /status: "failed"; error: string/);
  assert.match(source, /isValidEmailAddress\(recipient\)/);
  assert.doesNotMatch(source, /console\.log\(.*appPassword/s);
  assert.doesNotMatch(source, /console\.warn\(.*appPassword/s);
});

test("SMTP waits reject on timeout, socket error, or connection close", () => {
  const source = read("src/features/registration/welcome-email.ts");

  assert.match(source, /SMTP command timed out after/);
  assert.match(source, /socket\.once\("error", onError\)/);
  assert.match(source, /socket\.once\("close", onClose\)/);
  assert.match(source, /SMTP connection closed before the server replied/);
  assert.doesNotMatch(source, /setTimeout\(check, 25\)/);
});

test("Auth createUser event triggers welcome delivery only for persisted new users", () => {
  const authSource = read("src/auth.ts");
  const signInCallback = authSource.slice(authSource.indexOf("async signIn"), authSource.indexOf("async session"));

  assert.match(authSource, /events:\s*\{/);
  assert.match(authSource, /async createUser\(\{ user \}\)/);
  assert.match(authSource, /deliverWelcomeEmailForNewUser\(\{/);
  assert.doesNotMatch(signInCallback, /deliverWelcomeEmailForNewUser/);
});

test("welcome delivery claims a single attempt, audits safe failures, and preserves completed registrations", () => {
  const deliverySource = read("src/features/registration/welcome-delivery.ts");

  assert.match(deliverySource, /import "server-only"/);
  assert.match(deliverySource, /WelcomeEmailSender = createWelcomeEmailSender\(\)/);
  assert.match(deliverySource, /welcomeEmailAttemptedAt: null/);
  assert.match(deliverySource, /if \(claimed\.count === 0\)/);
  assert.match(deliverySource, /duplicate-skipped/);
  assert.match(deliverySource, /safelySendWelcomeEmail\(user, sender\)/);
  assert.match(deliverySource, /catch \(error\)/);
  assert.match(deliverySource, /registrationFailure\.create/);
  assert.match(deliverySource, /transaction\.user\.update/);
  assert.match(deliverySource, /welcomeEmailStatus: "failed"/);
  assert.match(deliverySource, /status: "failed"/);
  assert.match(deliverySource, /sanitizeFailureMessage/);
  assert.match(deliverySource, /Welcome email delivery failed after registration completed/);
  assert.doesNotMatch(deliverySource, /transaction\.user\.delete/);
  assert.doesNotMatch(deliverySource, /GMAIL_APP_PASSWORD|DATABASE_URL|AUTH_SECRET|NEXTAUTH_SECRET/);
});
