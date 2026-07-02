const TARGET_URL = "http://127.0.0.1:3000";
const TIMEOUT_MS = 8000;

async function run() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(TARGET_URL, {
      signal: controller.signal,
      redirect: "manual",
    });
    clearTimeout(timeoutId);
    console.log(`Server responded: ${response.status} ${response.statusText}`);
    process.exit(0);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      console.error(
        `Server check timed out after ${TIMEOUT_MS}ms while requesting ${TARGET_URL}`
      );
    } else {
      console.error(
        `Server check failed for ${TARGET_URL}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    process.exit(1);
  }
}

void run();
