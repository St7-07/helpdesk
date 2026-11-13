import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/pages/LoginPage";

const { signInEmail } = vi.hoisted(() => ({ signInEmail: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signIn: { email: signInEmail } },
}));

afterEach(() => {
  vi.resetAllMocks();
});

function renderLogin() {
  const user = userEvent.setup();
  render(<LoginPage />);
  return {
    user,
    email: screen.getByLabelText("Email"),
    password: screen.getByLabelText("Password"),
    submit: () => user.click(screen.getByRole("button", { name: "Sign in" })),
  };
}

describe("LoginPage", () => {
  describe("validation", () => {
    it("requires email and password and does not call the server", async () => {
      const { email, password, submit } = renderLogin();

      await submit();

      expect(await screen.findByText("Email is required.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(email).toHaveAccessibleDescription("Email is required.");
      expect(password).toHaveAttribute("aria-invalid", "true");
      expect(signInEmail).not.toHaveBeenCalled();
    });

    it("treats a whitespace-only email as missing", async () => {
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "   ");
      await user.type(password, "secret");
      await submit();

      expect(await screen.findByText("Email is required.")).toBeInTheDocument();
      expect(signInEmail).not.toHaveBeenCalled();
    });

    it("rejects an invalid email address", async () => {
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "not-an-email");
      await user.type(password, "secret");
      await submit();

      expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
      expect(screen.queryByText("Password is required.")).not.toBeInTheDocument();
      expect(signInEmail).not.toHaveBeenCalled();
    });
  });

  describe("submitting", () => {
    it("signs in with the trimmed email and the password", async () => {
      signInEmail.mockResolvedValue({ data: {}, error: null });
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "  agent@example.com ");
      await user.type(password, "secret");
      await submit();

      expect(signInEmail).toHaveBeenCalledWith({ email: "agent@example.com", password: "secret" });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows a generic message for wrong credentials (401)", async () => {
      signInEmail.mockResolvedValue({
        data: null,
        error: { status: 401, message: "Invalid email or password" },
      });
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "agent@example.com");
      await user.type(password, "wrong");
      await submit();

      expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    });

    it("shows the server's message for other errors", async () => {
      signInEmail.mockResolvedValue({
        data: null,
        error: { status: 429, message: "Too many requests. Please try again later." },
      });
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "agent@example.com");
      await user.type(password, "secret");
      await submit();

      expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests. Please try again later.");
    });

    it("falls back to a generic message when the error has no message", async () => {
      signInEmail.mockResolvedValue({ data: null, error: { status: 500 } });
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "agent@example.com");
      await user.type(password, "secret");
      await submit();

      expect(await screen.findByRole("alert")).toHaveTextContent("Sign in failed. Please try again.");
    });

    it("tells the user when the server can't be reached", async () => {
      signInEmail.mockRejectedValue(new TypeError("Failed to fetch"));
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "agent@example.com");
      await user.type(password, "secret");
      await submit();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Could not reach the server. Please try again.",
      );
    });

    it("disables the button while signing in", async () => {
      let finish!: (value: unknown) => void;
      signInEmail.mockReturnValue(new Promise((resolve) => (finish = resolve)));
      const { user, email, password, submit } = renderLogin();

      await user.type(email, "agent@example.com");
      await user.type(password, "secret");
      await submit();

      expect(await screen.findByRole("button", { name: "Signing in…" })).toBeDisabled();
      finish({ data: {}, error: null });
      expect(await screen.findByRole("button", { name: "Sign in" })).toBeEnabled();
    });
  });
});
