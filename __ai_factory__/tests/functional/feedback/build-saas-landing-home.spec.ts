import { expect, test } from "@playwright/test";

test.describe("build-saas-landing-home", () => {
  test("renders a complete SaaS landing home page with future-ready sections", async ({
    page
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Turn every customer signal into a clearer next move."
      })
    ).toBeVisible();
    await expect(page.getByText("Feedback review preview")).toHaveCount(0);
    await expect(page.getByText("Validated feedback moving through review")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "A calm system of record for every feedback channel."
      })
    ).toBeVisible();
    await expect(page.getByText("Capture structured submissions")).toBeVisible();
    await expect(page.getByText("Validate before review")).toBeVisible();
    await expect(page.getByText("Prioritize what matters")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "From raw feedback to reviewed insight in one guided path."
      })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Collect", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Validate", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Review", exact: true })).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Designed for the people who turn customer voice into operating rhythm."
      })
    ).toBeVisible();
    await expect(page.getByText("Theme velocity")).toBeVisible();
    await expect(page.getByText("Review health")).toBeVisible();
    await expect(page.getByText("Customer impact")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Start with the landing page, then grow into intake and review workflows."
      })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Map the intake flow" })).toHaveAttribute(
      "href",
      /#workflows$/
    );
  });

  test("keeps the SaaS landing page usable at a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request demo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Turn every customer signal/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /A calm system of record/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Start with the landing page/ })).toBeVisible();
  });
});
