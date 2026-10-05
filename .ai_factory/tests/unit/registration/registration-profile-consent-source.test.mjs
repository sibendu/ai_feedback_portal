import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");

test("User schema persists first and last names without a required backfill", () => {
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20260914170000_registration_profile_names/migration.sql");

  assert.match(schema, /model User \{[\s\S]*firstName\s+String\?/);
  assert.match(schema, /model User \{[\s\S]*lastName\s+String\?/);
  assert.match(migration, /ADD COLUMN "firstName" TEXT;/);
  assert.match(migration, /ADD COLUMN "lastName" TEXT;/);
  assert.doesNotMatch(migration, /NOT NULL/);
});

test("registration helper validates, trims, and serializes profile names", () => {
  const profileSource = read("src/features/registration/profile.ts");

  assert.match(profileSource, /export function validateRegistrationProfile/);
  assert.match(profileSource, /value\?\.trim\(\)\.replace\(/);
  assert.match(profileSource, /errors\.firstName = "Enter your first name\."/);
  assert.match(profileSource, /errors\.lastName = "Enter your last name\."/);
  assert.match(profileSource, /encodeRegistrationProfile/);
  assert.match(profileSource, /decodeRegistrationProfile/);
});

test("first-time Google registration requires consent while existing Google login is preserved", () => {
  const authSource = read("src/auth.ts");

  assert.match(authSource, /provider:\s*account\.provider/);
  assert.match(authSource, /providerAccountId:\s*account\.providerAccountId/);
  assert.match(authSource, /if \(existingAccount\) \{\s*return true;\s*\}/);
  assert.match(authSource, /account\.provider === "google"/);
  assert.match(authSource, /GOOGLE_PROFILE_CONSENT_COOKIE/);
  assert.match(authSource, /return "\/register\/google-consent\?error=consentRequired"/);
});

test("accepted Google consent stores names and rejected consent clears transient registration state", () => {
  const authSource = read("src/auth.ts");
  const actionsSource = read("src/app/register/actions.ts");

  assert.match(authSource, /getGoogleProfileNames/);
  assert.match(authSource, /applyNamesToUser\(user as MutableAuthUser, names\.firstName, names\.lastName\)/);
  assert.match(actionsSource, /acceptGoogleProfileConsent/);
  assert.match(actionsSource, /GOOGLE_PROFILE_CONSENT_VALUE/);
  assert.match(actionsSource, /rejectGoogleProfileConsent/);
  assert.match(actionsSource, /cookieStore\.delete\(GOOGLE_PROFILE_CONSENT_COOKIE\)/);
  assert.match(actionsSource, /cookieStore\.delete\(REGISTRATION_PROFILE_COOKIE\)/);
  assert.match(actionsSource, /GoogleConsentRejected/);
});
