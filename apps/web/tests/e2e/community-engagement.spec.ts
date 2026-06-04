import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3000";
const PASSWORD = "Test@E2E_Pass99!";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Create a pre-verified user via the dev-only seed API, then sign in normally. */
async function setupUserAndGoToCommunity(page: Page): Promise<string> {
  const ts = `${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const email = `e2e-${ts}@gradifyhub.com`;

  // 1. Seed a verified user directly (no email inbox needed)
  const seed = await page.request.post(`${BASE}/api/test/seed-user`, {
    data: { email, password: PASSWORD, name: "E2E Tester" },
  });
  expect(seed.ok()).toBeTruthy();

  // 2. Sign in via the UI
  await page.goto("/sign-in");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button:has-text("Sign in")');

  // Should land on /dashboard or /onboarding
  await page.waitForURL(/\/dashboard|\/onboarding/, { timeout: 20_000 });

  // 3. Complete onboarding if needed
  if (page.url().includes("/onboarding")) {
    await expect(page.locator("text=What is your current role")).toBeVisible({
      timeout: 15_000,
    });
    await page.selectOption('select[name="currentRole"]', { label: "Software Engineer" });
    await page.fill('input[name="yearsExp"]', "2");
    await page.fill('input[name="timelineMonths"]', "6");
    await page.selectOption('select[name="hoursPerDay"]', { label: "2-3 hours" });
    await page.selectOption('select[name="daysPerWeek"]', { label: "5-6 days" });
    await page.click('button:has-text("Next")');

    await page.click('button:has-text("AI Engineer")');
    await page.click('button:has-text("Next")');

    const skipBtn = page.locator('button:has-text("Skip")');
    if (await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skipBtn.click();
    }
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  }

  // 4. Go to community
  await page.goto("/community");
  await page.waitForURL(/\/community/, { timeout: 10_000 });
  await expect(page.locator("h1")).toContainText("Community", { timeout: 10_000 });

  return email;
}

async function createUniquePost(page: Page, body: string) {
  await page.locator("textarea").first().fill(body);
  await page.click('button:has-text("Post")');
  await expect(page.locator(`text=${body}`).first()).toBeVisible({ timeout: 10_000 });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test.describe("Community engagement", () => {
  test("reaction toggle flow", async ({ page }) => {
    await setupUserAndGoToCommunity(page);

    const body = `Reaction test post ${Date.now()}`;
    await createUniquePost(page, body);

    const post = page.locator("article", { hasText: body }).first();
    await post.locator('[data-testid^="post-reaction-trigger-"]').click();
    await page.getByTestId("reaction-emoji-👍").click();

    await expect(post.locator("text=👍")).toBeVisible({ timeout: 10_000 });
  });

  test("comment + reply flow", async ({ page }) => {
    await setupUserAndGoToCommunity(page);

    const body = `Comment test post ${Date.now()}`;
    await createUniquePost(page, body);

    // Navigate to the post thread
    const post = page.locator("article", { hasText: body }).first();
    await post.getByRole("link", { name: /View thread/i }).click();
    await page.waitForURL(/\/community\//, { timeout: 10_000 });

    const commentBody = `Top comment ${Date.now()}`;
    const replyBody = `Reply ${Date.now()}`;

    // comment-toggle opens the collapsible section on the feed card;
    // on the thread page the input is always visible
    const toggleBtn = page.locator('[data-testid^="comment-toggle-"]').first();
    if (await toggleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await toggleBtn.click();
    }

    await page.locator('[data-testid^="comment-input-"]').first().fill(commentBody);
    await page.locator('[data-testid^="comment-submit-"]').first().click();
    await expect(page.locator(`text=${commentBody}`).first()).toBeVisible({ timeout: 10_000 });

    // Reply to that comment
    await page.locator('[data-testid^="comment-reply-toggle-"]').first().click();
    await page.locator('[data-testid^="comment-reply-input-"]').first().fill(replyBody);
    await page.locator('[data-testid^="comment-reply-submit-"]').first().click();
    await expect(page.locator(`text=${replyBody}`).first()).toBeVisible({ timeout: 10_000 });
  });

  test("poll vote update flow", async ({ page }) => {
    await setupUserAndGoToCommunity(page);

    const pollOption = page.locator('[data-testid^="poll-option-"]').first();
    const count = await pollOption.count();
    test.skip(count === 0, "No poll post in feed – create one first.");

    await pollOption.click();
    await expect(pollOption).toHaveClass(/brand-green|ring/, { timeout: 10_000 });
  });
});
