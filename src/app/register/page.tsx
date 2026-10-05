import Link from "next/link";

import { registerWithProvider } from "./actions";

const errorMessages: Record<string, string> = {
  GoogleMissingNames: "Google did not provide enough profile name information. Enter your first and last name before continuing.",
  NameRequired: "Enter your first and last name before creating an account.",
  default: "Registration could not be completed. Please try again."
};

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string; provider?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] ?? errorMessages.default : null;

  return (
    <main className="sign-in-page">
      <section className="sign-in-card registration-card" aria-labelledby="register-title">
        <Link className="brand" href="/" aria-label="Customer Feedback Portal home">
          <span className="brand-mark" aria-hidden="true">CF</span>
          <span>Customer Feedback Portal</span>
        </Link>
        <div>
          <p className="eyebrow">New customer account</p>
          <h1 id="register-title">Create your account.</h1>
          <p className="sign-in-copy">Add your profile name, then choose the provider you want to use for this account.</p>
        </div>
        {errorMessage ? (
          <p className="sign-in-alert" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <form className="registration-form" action={registerWithProvider.bind(null, "github")}>
          <div className="field-grid">
            <label>
              <span>First name</span>
              <input name="firstName" autoComplete="given-name" required maxLength={80} />
            </label>
            <label>
              <span>Last name</span>
              <input name="lastName" autoComplete="family-name" required maxLength={80} />
            </label>
          </div>
          <button className="provider-action" type="submit">Create with GitHub</button>
        </form>
        <form className="registration-form" action={registerWithProvider.bind(null, "google")}>
          <div className="field-grid">
            <label>
              <span>First name</span>
              <input name="firstName" autoComplete="given-name" required maxLength={80} />
            </label>
            <label>
              <span>Last name</span>
              <input name="lastName" autoComplete="family-name" required maxLength={80} />
            </label>
          </div>
          <label className="consent-check">
            <input type="checkbox" name="googleConsent" value="accepted" required />
            <span>I consent to Customer Feedback Portal using my Google-provided email, first name, and last name to set up this account.</span>
          </label>
          <button className="provider-action" type="submit">Create with Google</button>
        </form>
        <Link className="secondary-inline" href="/sign-in">I already have an account</Link>
      </section>
    </main>
  );
}
