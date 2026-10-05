import { expect, test } from "@playwright/test";

test.describe("add-header-navigation-footer", () => {
  test("renders persistent SaaS header navigation and grouped footer content", async ({
    page
  }) => {
    await page.goto("/");

    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Customer Feedback Portal home" })).toBeVisible();
    await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Product" })).toHaveAttribute(
      "href",
      /#product$/
    );
    await expect(header.getByRole("link", { name: "Workflows" })).toHaveAttribute(
      "href",
      /#workflows$/
    );
    await expect(header.getByRole("link", { name: "Insights" })).toHaveAttribute(
      "href",
      /#insights$/
    );
    await expect(header.getByRole("link", { name: "Resources" })).toHaveAttribute(
      "href",
      /#resources$/
    );
    await expect(header.getByRole("link", { name: "Request demo" })).toHaveAttribute(
      "href",
      /#demo$/
    );

    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("heading", { name: "Product" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Resources" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Company" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Security overview" })).toBeVisible();
    await expect(footer.getByRole("navigation", { name: "Legal navigation" })).toBeVisible();
  });

  test("keeps header and footer available on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("banner").getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Request demo" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("heading", { name: "Product" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("heading", { name: "Resources" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("heading", { name: "Company" })).toBeVisible();
  });
});
