import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/HomePage";

describe("HomePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows ok when the health check succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "ok" })));
    render(<HomePage />);
    expect(await screen.findByText("API status: ok")).toBeInTheDocument();
  });

  it("shows unreachable when the health check fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    render(<HomePage />);
    expect(await screen.findByText("API status: unreachable")).toBeInTheDocument();
  });
});
