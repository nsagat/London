// Next.js runs `register()` once when the server process starts. We use it to
// warm the Bright Data MCP connection (and prime the demo query cache) so the
// first user request — typically the live on-stage demo — isn't paying for a
// cold MCP server spawn. Best-effort and Node-runtime only.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmupBrightData } = await import("./lib/brightdata");
    warmupBrightData().catch(() => {
      /* warmup is best-effort; the app works cold too */
    });
  }
}
