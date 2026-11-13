import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "./auth";
import { db } from "./prisma/db";

const port = Number(process.env.PORT ?? 3000);

const app = express();

// Must be mounted before any body-parsing middleware.
app.all("/api/auth/*splat", toNodeHandler(auth));

async function checkDatabase(): Promise<"ok" | "error"> {
  try {
    await db.execute(db.raw.sql`SELECT 1`.affectedCount().build());
    return "ok";
  } catch (error) {
    console.error("Database health check failed:", error);
    return "error";
  }
}

app.get("/api/health", async (_req, res) => {
  res.json({ status: "ok", db: await checkDatabase() });
});

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`Server listening on http://localhost:${port}`);
});
