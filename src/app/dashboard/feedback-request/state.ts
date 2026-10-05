export type FeedbackUploadActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: string[];
  batchId?: string;
  createdCount?: number;
  emailSentCount?: number;
  emailFailedCount?: number;
};

export const initialFeedbackUploadState: FeedbackUploadActionState = {
  status: "idle",
  message: "",
  errors: []
};
