import pg from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app";
import { Role } from "../../src/roles";
import { createUserWithPassword } from "../../src/users";
import { truncateAll } from "../db";

const databaseUrl = process.env["DATABASE_URL"]!;
// Better Auth checks the Origin of state-changing requests.
const origin = process.env["BETTER_AUTH_URL"]!;
const SESSION_COOKIE = "better-auth.session_token";

const agent = { email: "agent@example.com", password: "agent-password-123", name: "Agent Smith", role: Role.Agent };
const admin = { email: "admin@example.com", password: "admin-password-123", name: "Ada Admin", role: Role.Admin };

const db = new pg.Client({ connectionString: databaseUrl });

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.end();
});

beforeEach(async () => {
  await truncateAll(databaseUrl);
});

async function count(table: "user" | "session"): Promise<number> {
  const { rows } = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM "${table}"`);
  return rows[0]!.n;
}

function setCookies(res: request.Response): string[] {
  const header = res.headers["set-cookie"] as string | string[] | undefined;
  if (!header) return [];
  return Array.isArray(header) ? header : [header];
}

function signIn(email: string, password: string) {
  return request(app).post("/api/auth/sign-in/email").set("Origin", origin).send({ email, password });
}

/** Signs in and returns the cookies to send on later requests. */
async function signedInCookies(user: { email: string; password: string }): Promise<string[]> {
  const res = await signIn(user.email, user.password);
  expect(res.status).toBe(200);
  return setCookies(res).map((cookie) => cookie.split(";")[0]!);
}

describe("POST /api/auth/sign-in/email", () => {
  it("signs in with the right password and sets an HTTP-only session cookie", async () => {
    await createUserWithPassword(agent);

    const res = await signIn(agent.email, agent.password);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: agent.email, name: agent.name });
    const sessionCookie = setCookies(res).find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toMatch(/;\s*HttpOnly/i);
    expect(await count("session")).toBe(1);
  });

  it("returns 401 for a wrong password and sets no session cookie", async () => {
    await createUserWithPassword(agent);

    const res = await signIn(agent.email, "wrong-password");

    expect(res.status).toBe(401);
    expect(setCookies(res).some((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))).toBe(false);
    expect(await count("session")).toBe(0);
  });

  it("returns 401 for an unknown email and sets no session cookie", async () => {
    const res = await signIn("nobody@example.com", "whatever-password");

    expect(res.status).toBe(401);
    expect(setCookies(res).some((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))).toBe(false);
    expect(await count("session")).toBe(0);
  });
});

describe("POST /api/auth/sign-up/email", () => {
  it("rejects public sign-up and creates no user", async () => {
    const res = await request(app)
      .post("/api/auth/sign-up/email")
      .set("Origin", origin)
      .send({ email: "new@example.com", password: "new-password-123", name: "New User" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("EMAIL_PASSWORD_SIGN_UP_DISABLED");
    expect(setCookies(res).some((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))).toBe(false);
    expect(await count("user")).toBe(0);
  });
});

describe("GET /api/auth/get-session", () => {
  it("returns the signed-in user with the agent role by default", async () => {
    await createUserWithPassword(agent);
    const cookies = await signedInCookies(agent);

    const res = await request(app).get("/api/auth/get-session").set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: agent.email, name: agent.name, role: "agent" });
    expect(res.body.session).toBeDefined();
  });

  it("returns the admin role for an admin", async () => {
    await createUserWithPassword(admin);
    const cookies = await signedInCookies(admin);

    const res = await request(app).get("/api/auth/get-session").set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: admin.email, role: "admin" });
  });

  it("returns no session when signed out", async () => {
    const res = await request(app).get("/api/auth/get-session");

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});

describe("POST /api/auth/sign-out", () => {
  it("ends the session so get-session no longer returns it", async () => {
    await createUserWithPassword(agent);
    const cookies = await signedInCookies(agent);

    const res = await request(app).post("/api/auth/sign-out").set("Origin", origin).set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(await count("session")).toBe(0);
    const after = await request(app).get("/api/auth/get-session").set("Cookie", cookies);
    expect(after.body).toBeNull();
  });
});
