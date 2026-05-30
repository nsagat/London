// ─────────────────────────────────────────────────────────────────────────────
// AI/ML API transport.
//
// AI/ML API (https://aimlapi.com) is an OpenAI-compatible gateway to many models.
// London uses it as the INTELLIGENCE layer on top of Bright Data's DATA layer:
// reasoning, structured extraction, and summarization over live web evidence.
//
// Everything here is key-gated and best-effort — with no AIMLAPI_API_KEY (or on
// any error/timeout) callers fall back to London's deterministic heuristics, so
// the app never depends on it being available.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.AIMLAPI_BASE_URL || "https://api.aimlapi.com/v1";
export const AIML_MODEL = process.env.AIMLAPI_MODEL || "gpt-4o-mini";

export function isAimlConfigured(): boolean {
  return Boolean(process.env.AIMLAPI_API_KEY);
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/**
 * Call AI/ML API's chat completions endpoint. Returns the assistant message
 * content, or null on any failure (missing key, non-200, timeout, parse error).
 */
export async function aimlChat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string | null> {
  if (!isAimlConfigured()) return null;

  const {
    json = false,
    temperature = 0.2,
    maxTokens = 1400,
    timeoutMs = 30_000,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIMLAPI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AIML_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(
        `[london] AI/ML API ${res.status}: ${(await res.text()).slice(0, 200)}`,
      );
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.warn("[london] AI/ML API call failed:", (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Parse a model response that should be JSON, tolerating code fences/extra text. */
export function parseJsonLoose<T>(text: string | null): T | null {
  if (!text) return null;
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // last resort: grab the outermost {...} or [...] block
    const match = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
