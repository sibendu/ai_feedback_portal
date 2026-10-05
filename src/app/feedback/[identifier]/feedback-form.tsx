"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { FeedbackSubmissionState, PublicFeedbackData } from "@/features/feedback-submission/service";

import { submitFeedbackForIdentifier } from "./actions";

const initialSubmissionState: FeedbackSubmissionState = {
  status: "idle",
  message: "",
  errors: []
};

export function CustomerFeedbackForm({ feedback }: { feedback: PublicFeedbackData }) {
  const [state, formAction] = useActionState(
    submitFeedbackForIdentifier.bind(null, feedback.identifier),
    initialSubmissionState
  );
  const selectedRating = state.rating;
  const message = state.feedbackMessage ?? "";

  return (
    <form className="customer-feedback-form" action={formAction}>
      <fieldset className="feedback-rating-field">
        <legend>Rating</legend>
        <div className="feedback-stars">
          {Array.from({ length: 10 }, (_, index) => {
            const value = index + 1;
            return (
              <label key={value} className="feedback-star-option">
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  defaultChecked={selectedRating === value}
                  required
                />
                <span aria-hidden="true">★</span>
                <small>{value}</small>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="feedback-message-field">
        <span>Feedback message</span>
        <textarea
          name="feedbackMessage"
          maxLength={200}
          required
          defaultValue={message}
          rows={5}
        />
      </label>

      <SubmitButton />
      <SubmissionResult state={state} />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="provider-action feedback-submit-button" type="submit" disabled={pending}>
      {pending ? "Submitting feedback" : "Submit feedback"}
    </button>
  );
}

function SubmissionResult({ state }: { state: FeedbackSubmissionState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <div className={`customer-feedback-result is-${state.status}`} role={state.status === "error" ? "alert" : "status"}>
      <strong>{state.message}</strong>
      {state.errors.length > 0 ? (
        <ul>
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
