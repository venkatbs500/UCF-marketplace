import { spawn } from "node:child_process";

const env = {
  ...process.env,
  NEXT_PUBLIC_AUTH_MODE: "local",
  NEXT_PUBLIC_PRODUCT_MODE: "demo",
  NEXT_PUBLIC_ADMIN_EMAILS: "admin@ucf.edu",
};

const E2E_PORT = "3100";

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "dev", "--hostname", "127.0.0.1", "-p", E2E_PORT],
  {
    env,
    stdio: "inherit",
  }
);

const shutdown = (signal) => {
  if (!child.killed) child.kill(signal);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
