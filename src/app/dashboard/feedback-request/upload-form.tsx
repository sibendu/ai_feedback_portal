"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { uploadFeedbackRequests } from "./actions";
import { initialFeedbackUploadState, type FeedbackUploadActionState } from "./state";

export function FeedbackRequestUploadForm() {
  const [state, formAction] = useActionState(uploadFeedbackRequests, initialFeedbackUploadState);

  return (
    <form className="feedback-upload-form" action={formAction}>
      <label className="feedback-file-field">
        <span>Excel file</span>
        <input name="feedbackFile" type="file" accept=".xlsx" required />
      </label>
      <SubmitButton />
      <UploadResult state={state} />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="provider-action feedback-upload-submit" type="submit" disabled={pending}>
      {pending ? "Processing upload" : "Upload and send requests"}
    </button>
  );
}

function UploadResult({ state }: { state: FeedbackUploadActionState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <div className={`feedback-upload-result is-${state.status}`} role={state.status === "error" ? "alert" : "status"}>
      <strong>{state.message}</strong>
      {state.status === "success" ? (
        <dl className="feedback-upload-summary">
          <div>
            <dt>Batch</dt>
            <dd>{state.batchId}</dd>
          </div>
          <div>
            <dt>Rows created</dt>
            <dd>{state.createdCount}</dd>
          </div>
          <div>
            <dt>Email sent</dt>
            <dd>{state.emailSentCount}</dd>
          </div>
          <div>
            <dt>Email failed</dt>
            <dd>{state.emailFailedCount}</dd>
          </div>
        </dl>
      ) : null}
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
