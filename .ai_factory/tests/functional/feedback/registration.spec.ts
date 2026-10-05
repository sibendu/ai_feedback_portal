import { expect, test } from "@playwright/test";

const secretTerms = [
  "client_secret",
  "refresh_token",
  "access_token",
  "id_token",
  "NEXTAUTH_SECRET",
  "AUTH_SECRET",
  "DATABASE_URL"
];

test.describe("feedback registration", () => {
  test("renders customer registration actions for Google and GitHub", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("link", { name: "Customer Feedback Portal home" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create your account or sign in." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
    await expect(page.getByText(/administrator/i)).toHaveCount(0);
  });

  test("shows a safe provider failure message", async ({ page }) => {
    await page.goto("/sign-in?error=OAuthCallback");

    await expect(page.locator(".sign-in-alert")).toContainText(
      "We could not finish registration with that provider. Try again when you are ready."
    );

    const bodyText = await page.locator("body").innerText();
    for (const term of secretTerms) {
      expect(bodyText).not.toContain(term);
    }
  });

  test("exposes only the expected OAuth providers through Auth.js", async ({ request }) => {
    const response = await request.get("/api/auth/providers");
    expect(response.ok()).toBeTruthy();

    const providers = await response.json();
    expect(Object.keys(providers).sort()).toEqual(["github", "google"]);
    expect(providers.google).toMatchObject({ id: "google", name: "Google", type: "oidc" });
    expect(providers.github).toMatchObject({ id: "github", name: "GitHub", type: "oauth" });
  });
});
