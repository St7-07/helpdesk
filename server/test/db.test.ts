import { describe, expect, it } from "vitest";
import { assertSafeTestDatabase } from "./db";

const dev = "postgresql://st7@localhost:5432/helpdesk";

describe("assertSafeTestDatabase", () => {
  it("accepts a separate database whose name ends in _test", () => {
    expect(() => assertSafeTestDatabase("postgresql://st7@localhost:5432/helpdesk_test", [dev])).not.toThrow();
  });

  it("rejects a dev database that itself ends in _test", () => {
    const devTest = "postgresql://st7@localhost:5432/helpdesk_test";
    expect(() => assertSafeTestDatabase(devTest, [devTest])).toThrow(/points at the DATABASE_URL database/);
  });

  it.each([
    ["the dev URL itself", dev],
    ["the dev URL without a port", "postgresql://st7@localhost/helpdesk"],
    ["the dev URL with query options", `${dev}?sslmode=disable`],
    ["the dev URL via 127.0.0.1", "postgresql://st7@127.0.0.1:5432/helpdesk"],
  ])("rejects %s (name doesn't end in _test)", (_, url) => {
    expect(() => assertSafeTestDatabase(url, [dev])).toThrow(/must end in "_test"/);
  });

  it("rejects DATABASE_URL and TEST_DATABASE_URL set to the same database with no .env", () => {
    expect(() => assertSafeTestDatabase(dev, [undefined, dev])).toThrow(/must end in "_test"/);
  });

  it("rejects a _test URL that is the dev database spelled differently", () => {
    const devTest = "postgresql://st7@localhost:5432/helpdesk_test";
    expect(() => assertSafeTestDatabase("postgresql://st7@127.0.0.1/helpdesk_test", [devTest])).toThrow(
      /points at the DATABASE_URL database/,
    );
  });
});
