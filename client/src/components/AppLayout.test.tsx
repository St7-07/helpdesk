import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppLayout from "@/components/AppLayout";
import { useCurrentUser } from "@/lib/session";
import { fakeSession } from "@/test/session";

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { signOut } }));
vi.mock("@/lib/session", () => ({ useCurrentUser: vi.fn() }));

afterEach(() => {
  vi.resetAllMocks();
});

function renderLayout() {
  vi.mocked(useCurrentUser).mockReturnValue(fakeSession({ name: "Agent Smith" }).user);
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<h1>Page content</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  return { user, signOutButton: () => screen.getByRole("button", { name: /Sign(ing)? out/ }) };
}

describe("AppLayout", () => {
  it("shows the signed-in user's name and the page", () => {
    renderLayout();

    expect(screen.getByText("Agent Smith")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page content" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  });

  it("signs out and disables the button while signing out", async () => {
    let finish!: (value: unknown) => void;
    signOut.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const { user, signOutButton } = renderLayout();

    await user.click(signOutButton());

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOutButton()).toHaveTextContent("Signing out…");
    expect(signOutButton()).toBeDisabled();
    // On success the session goes away and ProtectedRoute redirects; no error shown.
    await act(async () => finish({ data: { success: true }, error: null }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error and re-enables the button when the server rejects sign-out", async () => {
    signOut.mockResolvedValue({ data: null, error: { status: 500, message: "Internal error" } });
    const { user, signOutButton } = renderLayout();

    await user.click(signOutButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("Sign out failed. Please try again.");
    expect(signOutButton()).toHaveTextContent("Sign out");
    expect(signOutButton()).toBeEnabled();
  });

  it("shows an error when the server can't be reached", async () => {
    signOut.mockRejectedValue(new TypeError("Failed to fetch"));
    const { user, signOutButton } = renderLayout();

    await user.click(signOutButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("Sign out failed. Please try again.");
    expect(signOutButton()).toBeEnabled();
  });

  it("clears the previous error when retrying", async () => {
    signOut.mockResolvedValueOnce({ data: null, error: { status: 500 } });
    signOut.mockReturnValueOnce(new Promise(() => {}));
    const { user, signOutButton } = renderLayout();

    await user.click(signOutButton());
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.click(signOutButton());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(signOut).toHaveBeenCalledTimes(2);
  });
});
