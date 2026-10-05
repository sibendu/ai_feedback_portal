import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");

test("public feedback links resolve safely without exposing internal batch details", () => {
  const service = read("src/features/feedback-submission/service.ts");
  const page = read("src/app/feedback/[identifier]/page.tsx");

  assert.match(service, /normalizeFeedbackIdentifier/);
  assert.match(service, /LINK_IDENTIFIER_PATTERN = \/\^\[A-Za-z0-9_-\]\{16,128\}\$\//);
  assert.match(service, /prisma\.feedback\.findUnique/);
  assert.match(service, /select: publicFeedbackSelect\(\)/);
  assert.match(service, /status: "invalid"/);
  assert.match(service, /status: "unknown"/);
  assert.match(service, /status: "unavailable"/);
  assert.match(service, /catch \(error\) \{\s*console\.error\("Unable to resolve public feedback link\.", sanitizeFeedbackError\(error\)\);\s*return \{ status: "unavailable" \};\s*\}/);
  assert.doesNotMatch(page, /batchId|uploadedBy|emailStatus|emailError/);
  assert.match(page, /Feedback unavailable/);
  assert.match(page, /We could not load this feedback request right now/);
});

test("feedback links expire after thirty days unless already submitted", () => {
  const service = read("src/features/feedback-submission/service.ts");
  const page = read("src/app/feedback/[identifier]/page.tsx");

  assert.match(service, /FEEDBACK_LINK_VALID_DAYS = 30/);
  assert.match(service, /getFeedbackLinkExpiresAt/);
  assert.match(service, /isFeedbackLinkExpired/);
  assert.match(service, /if \(feedback\.submittedAt\)/);
  assert.match(service, /status: "submitted"/);
  assert.match(service, /status: "expired"/);
  assert.match(service, /Feedback links remain valid for \$\{FEEDBACK_LINK_VALID_DAYS\} days/);
  assert.match(page, /This feedback link has expired/);
});

test("valid public feedback form displays product and purchase details with 1-10 stars", () => {
  const page = read("src/app/feedback/[identifier]/page.tsx");
  const form = read("src/app/feedback/[identifier]/feedback-form.tsx");

  assert.match(page, /productName/);
  assert.match(page, /purchaseDate/);
  assert.match(page, /formatPurchaseDate/);
  assert.match(form, /"use client"/);
  assert.match(form, /useActionState/);
  assert.match(form, /Array\.from\(\{ length: 10 \}/);
  assert.match(form, /name="rating"/);
  assert.match(form, /name="feedbackMessage"/);
  assert.match(form, /maxLength=\{200\}/);
});

test("submission validation enforces rating bounds and message length server-side", () => {
  const service = read("src/features/feedback-submission/service.ts");

  assert.match(service, /validateFeedbackSubmission/);
  assert.match(service, /Number\.isInteger\(rating\) \|\| rating < 1 \|\| rating > 10/);
  assert.match(service, /Choose a rating from 1 to 10/);
  assert.match(service, /Enter a feedback message/);
  assert.match(service, /FEEDBACK_MESSAGE_MAX_LENGTH = 200/);
  assert.match(service, /Feedback message must be \$\{FEEDBACK_MESSAGE_MAX_LENGTH\} characters or fewer/);
});

test("successful submission updates only response fields and repeat submissions are read-only", () => {
  const service = read("src/features/feedback-submission/service.ts");
  const page = read("src/app/feedback/[identifier]/page.tsx");

  assert.match(service, /prisma\.feedback\.updateMany/);
  assert.match(service, /linkIdentifier: lookup\.feedback\.identifier/);
  assert.match(service, /submittedAt: null/);
  assert.match(service, /rating: validation\.rating/);
  assert.match(service, /feedbackMessage: validation\.feedbackMessage/);
  assert.match(service, /submittedAt: now/);
  assert.doesNotMatch(service, /productName: validation|purchaseDate: validation|batchId: validation|email: validation/);
  assert.match(page, /ReadOnlyFeedback/);
  assert.match(page, /Submitted feedback/);
  assert.match(page, /Feedback received/);
});

test("public submission database failures return safe errors", () => {
  const service = read("src/features/feedback-submission/service.ts");

  assert.match(service, /try \{\s*update = await prisma\.feedback\.updateMany/);
  assert.match(service, /catch \(error\) \{\s*console\.error\("Unable to submit public feedback\.", sanitizeFeedbackError\(error\)\);/);
  assert.match(service, /message: "We could not save your feedback."/);
  assert.match(service, /errors: \["Try again later\."\]/);
  assert.match(service, /function sanitizeFeedbackError\(error: unknown\)/);
  assert.doesNotMatch(service, /console\.error\([^)]*formData|console\.error\([^)]*feedbackMessage|console\.error\([^)]*linkIdentifier/);
});
