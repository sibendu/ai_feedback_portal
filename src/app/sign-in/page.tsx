import Link from "next/link";

import { signIn } from "@/auth";

const errorMessages: Record<string, string> = {
  GoogleConsentRejected: "Google registration was not completed because consent was rejected.",
  OAuthAccountNotLinked: "Use the same provider you used when you first created your customer account.",
  OAuthCallback: "We could not finish registration with that provider. Try again when you are ready.",
  OAuthSignin: "We could not start registration with that provider. Please try again.",
  default: "Registration could not be completed. Please try again."
};

const providers = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" }
];

type SignInPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const errorMessage = error ? errorMessages[error] ?? errorMessages.default : null;

  return (
    <main className="sign-in-page">
      <section className="sign-in-card" aria-labelledby="sign-in-title">
        <Link className="brand" href="/" aria-label="Customer Feedback Portal home">
          <span className="brand-mark" aria-hidden="true">CF</span>
          <span>Customer Feedback Portal</span>
        </Link>
        <div>
          <p className="eyebrow">Customer access</p>
          <h1 id="sign-in-title">Create your account or sign in.</h1>
          <p className="sign-in-copy">Use your Google or GitHub account to access feedback intake and future customer features.</p>
        </div>
        {errorMessage ? (
          <p className="sign-in-alert" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="sign-in-providers">
          {providers.map((provider) => (
            <form action={async () => { "use server"; await signIn(provider.id, { redirectTo: "/dashboard" }); }} key={provider.id}>
              <button className="provider-action" type="submit">{provider.label}</button>
            </form>
          ))}
        </div>
        <Link className="secondary-inline" href="/register">Create a new account with profile details</Link>
      </section>
    </main>
  );
}
