import { expect, test } from "@playwright/test";

test.describe("bootstrap-nextjs-app", () => {
  test("renders the Customer Feedback Portal home route without starter boilerplate", async ({
    page
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Customer Feedback Portal/);
    await expect(
      page.getByRole("link", { name: "Customer Feedback Portal home" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Turn every customer signal into a clearer next move."
      })
    ).toBeVisible();
    await expect(page.getByText("Feedback operations for growing teams")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("Customer Feedback Portal");

    await expect(page.getByText("Get started by editing")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Deploy now" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Read our docs" })).toHaveCount(0);
  });
});
