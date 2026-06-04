import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const PASSWORD = "Test@E2E_Pass99!";

test.describe("Pricing upgrade", () => {
  test("logged-in user is not redirected to sign-up from the pricing CTA", async ({ page }) => {
    test.setTimeout(30_000);

    // Create and seed a test user
    const ts = `${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const email = `e2e-pricing-${ts}@gradifyhub.com`;

    const seed = await page.request.post(`${BASE}/api/test/seed-user`, {
      data: { email, password: PASSWORD, name: "E2E Pricing Tester" },
    });
    expect(seed.ok()).toBeTruthy();

    // Sign in the user
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation (to dashboard or onboarding)
    await page.waitForURL(/\/(dashboard|onboarding)($|\/|\?)/, { timeout: 15_000 });

    // Navigate to pricing page—user should be logged in
    await page.goto("/pricing");
    await expect(page).toHaveURL(/\/pricing/);

    // Verify logged-in state by checking for "Go to dashboard" button
    const goToDashboardBtn = page.locator('a:has-text("Go to dashboard")');
    await expect(goToDashboardBtn).toBeVisible({ timeout: 5_000 });

    // Click "Upgrade to Pro" button
    const upgradeBtn = page.getByRole("button", { name: /Upgrade to Pro/i });
    await upgradeBtn.click();

    // Wait for redirect and verify we don't go to sign-up
    await page.waitForTimeout(2_000);
    expect(page.url()).not.toContain("/sign-up");
  });
});
