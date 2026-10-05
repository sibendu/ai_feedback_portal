import { FeedbackRequestUploadForm } from "./upload-form";

export default function FeedbackRequestPage() {
  return (
    <section className="dashboard-page" aria-labelledby="feedback-request-title">
      <p className="eyebrow">Feedback Request</p>
      <h1 id="feedback-request-title">Feedback Request</h1>
      <p className="dashboard-lead">
        Upload an Excel workbook of purchase customers and send each customer a unique feedback link.
      </p>
      <div className="feedback-upload-panel">
        <div className="feedback-upload-guidance">
          <h2>Batch upload</h2>
          <p>Expected columns: email, type, product_code, product_name, purchase_date.</p>
          <p>Only type=purchase is supported for this iteration.</p>
        </div>
        <FeedbackRequestUploadForm />
      </div>
    </section>
  );
}
