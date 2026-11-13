import { expect, test } from "@playwright/test";
import { admin } from "./fixtures";

test.describe("authentication", () => {
  test("signs in, shows the user, signs out, and protects pages again", async ({ page, context }) => {
    // Signed out: a protected page goes to the login page.
    await page.goto("/");
    await expect(page).toHaveURL("/login");

    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Password").fill(admin.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(admin.name)).toBeVisible();
    const sessionCookie = (await context.cookies()).find((c) => c.name === "better-auth.session_token");
    expect(sessionCookie?.httpOnly).toBe(true);

    // The session survives a reload, and /login sends a signed-in user home.
    await page.reload();
    await expect(page.getByText(admin.name)).toBeVisible();
    await page.goto("/login");
    await expect(page).toHaveURL("/");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/login");

    // Signed out again: the protected page redirects to login.
    await page.goto("/");
    await expect(page).toHaveURL("/login");
    await expect(page.getByText(admin.name)).toHaveCount(0);
  });

  test("shows an error for a wrong password and stays on the login page", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("alert")).toHaveText("Invalid email or password.");
    await expect(page).toHaveURL("/login");
  });
});
