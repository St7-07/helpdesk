import { createAuthClient } from "better-auth/react";

// Same origin as the app: Vite proxies /api/auth to the server in dev.
export const authClient = createAuthClient();
