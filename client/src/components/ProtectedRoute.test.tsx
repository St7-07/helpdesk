import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "@/lib/session";
import { fakeSession } from "../../test/session";

vi.mock("@/lib/session", () => ({ useSession: vi.fn() }));

afterEach(() => {
  vi.resetAllMocks();
});

function CurrentUrl() {
  const { pathname, search, hash } = useLocation();
  return <p data-testid="url">{`${pathname}${search}${hash}`}</p>;
}

function TestRoutes() {
  return (
    <>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<h1>Login page</h1>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/tickets" element={<h1>Tickets page</h1>} />
        </Route>
      </Routes>
      <CurrentUrl />
    </>
  );
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <TestRoutes />
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("shows the page when signed in", () => {
    vi.mocked(useSession).mockReturnValue(fakeSession());
    renderAt("/tickets");

    expect(screen.getByRole("heading", { name: "Tickets page" })).toBeInTheDocument();
    expect(screen.getByTestId("url")).toHaveTextContent("/tickets");
  });

  it("redirects to /login when signed out", () => {
    vi.mocked(useSession).mockReturnValue(null);
    renderAt("/tickets");

    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tickets page" })).not.toBeInTheDocument();
    expect(screen.getByTestId("url")).toHaveTextContent(/^\/login$/);
  });

  it("returns to the original URL (with query and hash) after signing in", () => {
    vi.mocked(useSession).mockReturnValue(null);
    const { rerender } = renderAt("/tickets?status=open#latest");
    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();

    // Signing in updates the session; GuestRoute then sends the user back.
    vi.mocked(useSession).mockReturnValue(fakeSession());
    rerender(
      <MemoryRouter initialEntries={["/tickets?status=open#latest"]}>
        <TestRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Tickets page" })).toBeInTheDocument();
    expect(screen.getByTestId("url")).toHaveTextContent("/tickets?status=open#latest");
  });
});

describe("GuestRoute", () => {
  it("shows the login page when signed out", () => {
    vi.mocked(useSession).mockReturnValue(null);
    renderAt("/login");

    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();
  });

  it("sends a signed-in user from /login to home", () => {
    vi.mocked(useSession).mockReturnValue(fakeSession());
    renderAt("/login");

    expect(screen.getByRole("heading", { name: "Home page" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Login page" })).not.toBeInTheDocument();
    expect(screen.getByTestId("url")).toHaveTextContent(/^\/$/);
  });

  it("sends a signed-in user back to the page they came from", () => {
    vi.mocked(useSession).mockReturnValue(fakeSession());
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/login", state: { from: { pathname: "/tickets", search: "?page=2", hash: "" } } }]}
      >
        <TestRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Tickets page" })).toBeInTheDocument();
    expect(screen.getByTestId("url")).toHaveTextContent("/tickets?page=2");
  });
});
