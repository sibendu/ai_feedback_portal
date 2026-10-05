import Link from "next/link";

import { resolvePublicFeedback, type PublicFeedbackData } from "@/features/feedback-submission/service";

import { CustomerFeedbackForm } from "./feedback-form";

type FeedbackPageProps = {
  params: Promise<{ identifier: string }>;
};

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { identifier } = await params;
  const lookup = await resolvePublicFeedback(identifier);

  if (lookup.status === "open") {
    return (
      <FeedbackPageShell title="Share your product feedback" feedback={lookup.feedback}>
        <CustomerFeedbackForm feedback={lookup.feedback} />
      </FeedbackPageShell>
    );
  }

  if (lookup.status === "submitted") {
    return (
      <FeedbackPageShell title="Feedback received" feedback={lookup.feedback}>
        <ReadOnlyFeedback feedback={lookup.feedback} />
      </FeedbackPageShell>
    );
  }

  if (lookup.status === "expired") {
    return (
      <FeedbackPageShell title="This feedback link has expired" feedback={lookup.feedback}>
        <div className="customer-feedback-result is-error" role="status">
          <strong>This request is no longer accepting feedback.</strong>
          <p>Feedback links remain valid for 30 days from the request date.</p>
        </div>
      </FeedbackPageShell>
    );
  }

  return <UnavailableFeedback status={lookup.status} />;
}

function FeedbackPageShell({
  title,
  feedback,
  children
}: {
  title: string;
  feedback: PublicFeedbackData;
  children: React.ReactNode;
}) {
  return (
    <main className="customer-feedback-page">
      <section className="customer-feedback-panel">
        <div className="customer-feedback-heading">
          <Link className="brand feedback-brand" href="/">
            <span className="brand-mark">CF</span>
            <span>Customer Feedback Portal</span>
          </Link>
          <p className="eyebrow">Purchase feedback</p>
          <h1>{title}</h1>
        </div>

        <dl className="feedback-product-summary">
          <div>
            <dt>Product</dt>
            <dd>{feedback.productName}</dd>
          </div>
          <div>
            <dt>Purchase date</dt>
            <dd>{formatPurchaseDate(feedback.purchaseDate)}</dd>
          </div>
        </dl>

        {children}
      </section>
    </main>
  );
}

function ReadOnlyFeedback({ feedback }: { feedback: PublicFeedbackData }) {
  return (
    <div className="readonly-feedback" aria-label="Submitted feedback">
      <dl className="feedback-product-summary submitted-summary">
        <div>
          <dt>Rating</dt>
          <dd>{feedback.rating ?? "Not provided"} / 10</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{feedback.submittedAt ? formatPurchaseDate(feedback.submittedAt) : "Received"}</dd>
        </div>
      </dl>
      <div className="readonly-message">
        <span>Feedback message</span>
        <p>{feedback.feedbackMessage}</p>
      </div>
    </div>
  );
}

function UnavailableFeedback({ status }: { status: "invalid" | "unknown" | "unavailable" }) {
  const message = status === "invalid"
    ? "This feedback link is not valid."
    : status === "unknown"
      ? "We could not find this feedback request."
      : "We could not load this feedback request right now.";

  return (
    <main className="customer-feedback-page">
      <section className="customer-feedback-panel unavailable-feedback">
        <Link className="brand feedback-brand" href="/">
          <span className="brand-mark">CF</span>
          <span>Customer Feedback Portal</span>
        </Link>
        <h1>Feedback unavailable</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

function formatPurchaseDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}
