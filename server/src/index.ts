import { app } from "./app";

const port = Number(process.env.PORT ?? 3000);

app.listen(port, (error) => {
  if (error) throw error;
  console.log(`Server listening on http://localhost:${port}`);
});
