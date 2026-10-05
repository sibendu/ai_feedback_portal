"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import {
  GOOGLE_PROFILE_CONSENT_COOKIE,
  GOOGLE_PROFILE_CONSENT_VALUE,
  REGISTRATION_PROFILE_COOKIE,
  encodeRegistrationProfile,
  validateRegistrationProfile
} from "@/features/registration/profile";

const transientCookieOptions = {
  httpOnly: true,
  maxAge: 10 * 60,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
};

export async function registerWithProvider(provider: "github" | "google", formData: FormData) {
  const validation = validateRegistrationProfile({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? "")
  });

  if (!validation.ok) {
    const params = new URLSearchParams({ error: "NameRequired", provider });
    redirect(`/register?${params.toString()}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(REGISTRATION_PROFILE_COOKIE, encodeRegistrationProfile(validation.profile), transientCookieOptions);

  if (provider === "google") {
    if (formData.get("googleConsent") !== "accepted") {
      redirect("/register/google-consent?error=consentRequired");
    }

    cookieStore.set(GOOGLE_PROFILE_CONSENT_COOKIE, GOOGLE_PROFILE_CONSENT_VALUE, transientCookieOptions);
  }

  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function acceptGoogleProfileConsent() {
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_PROFILE_CONSENT_COOKIE, GOOGLE_PROFILE_CONSENT_VALUE, transientCookieOptions);
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function rejectGoogleProfileConsent() {
  const cookieStore = await cookies();
  cookieStore.delete(GOOGLE_PROFILE_CONSENT_COOKIE);
  cookieStore.delete(REGISTRATION_PROFILE_COOKIE);
  redirect("/sign-in?error=GoogleConsentRejected");
}
