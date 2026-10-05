export const REGISTRATION_PROFILE_COOKIE = "registration_profile";
export const GOOGLE_PROFILE_CONSENT_COOKIE = "registration_google_profile_consent";
export const GOOGLE_PROFILE_CONSENT_VALUE = "accepted";

const MAX_NAME_LENGTH = 80;

export type RegistrationProfileInput = {
  firstName?: string | null;
  lastName?: string | null;
};

export type RegistrationProfile = {
  firstName: string;
  lastName: string;
};

export type RegistrationProfileValidation =
  | { ok: true; profile: RegistrationProfile }
  | { ok: false; errors: Partial<Record<keyof RegistrationProfile, string>> };

export function validateRegistrationProfile(input: RegistrationProfileInput): RegistrationProfileValidation {
  const firstName = normalizeName(input.firstName);
  const lastName = normalizeName(input.lastName);
  const errors: Partial<Record<keyof RegistrationProfile, string>> = {};

  if (!firstName) {
    errors.firstName = "Enter your first name.";
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors.firstName = `First name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!lastName) {
    errors.lastName = "Enter your last name.";
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors.lastName = `Last name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, profile: { firstName, lastName } };
}

export function normalizeName(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function splitDisplayName(displayName: string | null | undefined): RegistrationProfileInput {
  const normalized = normalizeName(displayName);

  if (!normalized) {
    return {};
  }

  const [firstName, ...rest] = normalized.split(" ");
  return {
    firstName,
    lastName: rest.join(" ")
  };
}

export function encodeRegistrationProfile(profile: RegistrationProfile) {
  return Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
}

export function decodeRegistrationProfile(value: string | undefined): RegistrationProfile | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as RegistrationProfileInput;
    const validation = validateRegistrationProfile(parsed);
    return validation.ok ? validation.profile : null;
  } catch {
    return null;
  }
}

export function getGoogleProfileNames(profile: RegistrationProfileInput & { name?: string | null }) {
  const structuredNames = validateRegistrationProfile({
    firstName: profile.firstName,
    lastName: profile.lastName
  });

  if (structuredNames.ok) {
    return structuredNames.profile;
  }

  const displayNames = validateRegistrationProfile(splitDisplayName(profile.name));
  return displayNames.ok ? displayNames.profile : null;
}
