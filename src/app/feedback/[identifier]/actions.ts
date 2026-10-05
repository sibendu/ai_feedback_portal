"use server";

import { submitPublicFeedback } from "@/features/feedback-submission/service";

export async function submitFeedbackForIdentifier(identifier: string, _previousState: unknown, formData: FormData) {
  return submitPublicFeedback(identifier, formData);
}
