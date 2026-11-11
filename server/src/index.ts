import express from "express";

const port = Number(process.env.PORT ?? 3000);

const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`Server listening on http://localhost:${port}`);
});
