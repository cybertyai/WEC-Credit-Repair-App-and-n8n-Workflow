import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "williamsequitycapital@gmail.com";

test.describe("Portal happy path", () => {
  test("login page loads and shows magic link form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
  });

  test("unauthenticated user is redirected from portal to login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from admin to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("intake form loads on home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading")).toBeVisible();
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
  });

  test("upload page redirects unauthenticated user", async ({ page }) => {
    await page.goto("/portal/upload");
    await expect(page).toHaveURL(/\/login/);
  });

  test("disputes page redirects unauthenticated user", async ({ page }) => {
    await page.goto("/portal/disputes");
    await expect(page).toHaveURL(/\/login/);
  });

  test("learn page loads client-side shell", async ({ page }) => {
    await page.goto("/portal/learn");
    // redirects to login since unauthenticated — verify redirect
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Mobile viewport — key pages", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("login page is usable on mobile", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    const box = await page.getByRole("textbox", { name: /email/i }).boundingBox();
    expect(box?.width).toBeGreaterThan(200);
  });

  test("home page is usable on mobile", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
  });
});
