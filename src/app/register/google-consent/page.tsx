import Link from "next/link";

import { acceptGoogleProfileConsent, rejectGoogleProfileConsent } from "../actions";

const errorMessages: Record<string, string> = {
  consentRequired: "Google account creation needs your consent before we can continue.",
  default: "Review the consent request before continuing."
};

type GoogleConsentPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function GoogleConsentPage({ searchParams }: GoogleConsentPageProps) {
  const params = await searchParams;
  const notice = params?.error ? errorMessages[params.error] ?? errorMessages.default : null;

  return (
    <main className="sign-in-page">
      <section className="sign-in-card registration-card" aria-labelledby="google-consent-title">
        <Link className="brand" href="/" aria-label="Customer Feedback Portal home">
          <span className="brand-mark" aria-hidden="true">CF</span>
          <span>Customer Feedback Portal</span>
        </Link>
        <div>
          <p className="eyebrow">Google registration consent</p>
          <h1 id="google-consent-title">Use your Google profile?</h1>
          <p className="sign-in-copy">
            To create a new account with Google, Customer Feedback Portal will use your Google-provided email, first name, and last name for account setup.
          </p>
        </div>
        {notice ? (
          <p className="sign-in-alert" role="alert">
            {notice}
          </p>
        ) : null}
        <div className="consent-actions">
          <form action={acceptGoogleProfileConsent}>
            <button className="provider-action" type="submit">Accept and continue with Google</button>
          </form>
          <form action={rejectGoogleProfileConsent}>
            <button className="secondary-button" type="submit">Reject and return to sign in</button>
          </form>
        </div>
      </section>
    </main>
  );
}
