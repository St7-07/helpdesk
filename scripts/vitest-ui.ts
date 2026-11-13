// Starts the Vitest UI (with coverage) for a workspace and opens it in the
// browser. Vitest's own `--open` opens the URL without the access token, so
// this waits for the "UI started at <url>?token=…" line and opens that URL.
import { spawn } from "node:child_process";

const workspace = process.argv[2];
if (workspace !== "client" && workspace !== "server") {
  console.error("Usage: bun scripts/vitest-ui.ts <client|server>");
  process.exit(1);
}

const vitest = spawn("bunx", ["vitest", "--ui", "--open=false", "--coverage.enabled"], {
  cwd: new URL(`../${workspace}`, import.meta.url),
  stdio: ["inherit", "pipe", "inherit"],
});

const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
let opened = false;

vitest.stdout.on("data", (chunk: Buffer) => {
  process.stdout.write(chunk);
  const url = !opened && chunk.toString().match(/UI started at (\S+token=\S+)/)?.[1];
  if (url) {
    opened = true;
    spawn(opener, [url], { stdio: "ignore", detached: true }).unref();
  }
});

vitest.on("exit", (code) => process.exit(code ?? 0));
