// ─────────────────────────────────────────────────────────────────────────────
// Smoke test for the London MCP server.
//
//   npm run mcp:test
//
// Spawns mcp/server.ts as a stdio MCP server, lists its tools, then calls
// find_live_account_signals and recommend_gtm_stack and prints a summary. Use it
// to confirm London returns live Bright Data data before wiring it into a host.
// ─────────────────────────────────────────────────────────────────────────────
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const tsxBin = resolve(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx",
);
const serverPath = resolve(root, "mcp", "server.ts");

const ok = (s) => `\x1b[32m${s}\x1b[0m`;
const bad = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function callText(res) {
  const text = res?.content?.find((c) => c.type === "text")?.text ?? "";
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function main() {
  console.log(dim(`→ launching MCP server: ${serverPath}`));
  const transport = new StdioClientTransport({
    command: tsxBin,
    args: [serverPath],
    env: { ...process.env },
    stderr: "inherit", // show server's "[london-mcp] ready …" line
  });
  const client = new Client(
    { name: "london-smoke-test", version: "0.1.0" },
    { capabilities: {} },
  );

  let failures = 0;
  try {
    await client.connect(transport);
    console.log(ok("✓ connected"));

    const { tools } = await client.listTools();
    console.log(ok(`✓ tools: ${tools.map((t) => t.name).join(", ")}`));

    // ── find_account_signals ─────────────────────────────────────────────────
    console.log(dim("\n→ find_account_signals { vertical: 'AI security startups', signals: ['funding'], limit: 5 }"));
    const t0 = Date.now();
    const sigRes = callText(
      await client.callTool({
        name: "find_account_signals",
        arguments: { vertical: "AI security startups", signals: ["funding"], limit: 5 },
      }),
    );
    const ms = Date.now() - t0;
    const accounts = sigRes.data?.results ?? [];
    if (accounts.length) {
      console.log(
        ok(`✓ ${accounts.length} accounts in ${ms}ms`) +
          dim(`  (dataSource=${sigRes.dataSource}, layer=${sigRes.intelligenceLayer})`),
      );
      for (const r of accounts) {
        console.log(`   • ${r.company}  ${dim("—")} ${r.signal}  ${dim(r.confidence)}`);
      }
      if (sigRes.usage) {
        console.log(
          dim(`   usage: ${sigRes.usage.calls} calls, ${sigRes.usage.unitsConsumed} credits, ${sigRes.usage.estimatedCost}, ${sigRes.usage.creditsRemaining} left`),
        );
      }
      if (sigRes.dataSource !== "live") {
        console.log(bad("  ! dataSource is not 'live' — is BRIGHT_DATA_API_KEY set in .env.local?"));
      }
    } else {
      failures++;
      console.log(bad("✗ no results returned"));
    }

    // ── recommend_gtm_stack ──────────────────────────────────────────────────
    console.log(dim("\n→ recommend_gtm_stack { companyPrompt: 'B2B cybersecurity startup, $2,000/month outbound budget' }"));
    const recRes = callText(
      await client.callTool({
        name: "recommend_gtm_stack",
        arguments: {
          companyPrompt:
            "We are a B2B cybersecurity startup selling to mid-market SaaS. We need more outbound pipeline with a $2,000/month budget.",
        },
      }),
    );
    const agents = recRes.data?.recommendedAgents ?? [];
    if (agents.length) {
      console.log(ok(`✓ ${agents.length} agents recommended`));
      for (const a of agents) {
        console.log(`   • ${a.name}  ${dim("—")} ${a.estimatedCost ?? ""}`);
      }
    } else {
      failures++;
      console.log(bad("✗ no recommendation returned"));
    }

    await client.close();
  } catch (err) {
    failures++;
    console.log(bad(`✗ error: ${err.message}`));
  }

  console.log(failures ? bad(`\n${failures} check(s) failed`) : ok("\nAll checks passed ✓"));
  process.exit(failures ? 1 : 0);
}

main();
