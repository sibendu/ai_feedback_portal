import { expect, test } from "@playwright/test";

test.describe("establish-bff-layer", () => {
  test("serves typed landing-page configuration from the BFF endpoint", async ({
    request
  }) => {
    const response = await request.get("/api/landing");

    expect(response.ok()).toBe(true);

    const payload = await response.json();

    expect(payload.data.productName).toBe("Customer Feedback Portal");
    expect(payload.data.navigation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Product", href: "#product" }),
        expect.objectContaining({ label: "Insights", href: "#insights" })
      ])
    );
    expect(payload.data.hero).toEqual(
      expect.objectContaining({
        eyebrow: "Feedback operations for growing teams",
        title: "Turn every customer signal into a clearer next move."
      })
    );
    expect(payload.data.panel.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Validated responses", value: "1,248" })
      ])
    );
  });

  test("renders the home page from the landing BFF data path", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Primary navigation", exact: true }).getByRole("link", { name: "Product", exact: true })).toHaveAttribute(
      "href",
      /#product$/
    );
    await expect(
      page.getByRole("heading", {
        name: "Turn every customer signal into a clearer next move."
      })
    ).toBeVisible();
    await expect(page.getByText("Validated responses")).toBeVisible();
    await expect(page.getByText("1,248")).toBeVisible();
  });
});
