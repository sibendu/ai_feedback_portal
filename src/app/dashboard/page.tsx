import { auth } from "@/auth";
import { getDashboardUser } from "@/features/dashboard/session";

export default async function DashboardHomePage() {
  const user = getDashboardUser(await auth());

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-home-title">
      <p className="eyebrow">Home</p>
      <h1 id="dashboard-home-title">Welcome, {user?.name ?? "there"}.</h1>
      <p className="dashboard-lead">
        Track customer feedback activity, prepare request batches, and keep response workflows organized from one workspace.
      </p>
      <div className="dashboard-summary-grid">
        <article className="dashboard-summary-card">
          <span>Requests</span>
          <strong>Ready</strong>
          <p>Feedback request upload is available from the left menu as the next workflow surface.</p>
        </article>
        <article className="dashboard-summary-card">
          <span>Reviews</span>
          <strong>Home</strong>
          <p>New feedback responses will appear here once collection workflows are connected.</p>
        </article>
      </div>
    </section>
  );
}
