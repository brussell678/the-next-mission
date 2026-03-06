export type LlmJsonResult<T> = {
  ok: true;
  data: T;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
} | {
  ok: false;
  error: string;
  latencyMs?: number;
};

import OpenAI from "openai";
import { getEnv } from "@/lib/env";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  throw new Error("Model response did not contain JSON");
}

export async function generateJson<T>(prompt: string): Promise<LlmJsonResult<T>> {
  const env = getEnv();
  if (!env.OPENAI_API_KEY) return { ok: false, error: "OPENAI_API_KEY is not configured" };

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.LLM_TIMEOUT_MS);
  const started = Date.now();

  try {
    const response = await client.responses.create(
      {
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        input: [
          {
            role: "system",
            content:
              "Return valid JSON only. Do not wrap in markdown code fences. Do not include extra commentary.",
          },
          { role: "user", content: prompt },
        ],
      },
      { signal: controller.signal }
    );

    const outputText = response.output_text ?? "";
    const parsed = JSON.parse(extractJson(outputText)) as T;
    return {
      ok: true,
      data: parsed,
      tokensIn: response.usage?.input_tokens,
      tokensOut: response.usage?.output_tokens,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM request failed";
    return { ok: false, error: message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateText(prompt: string): Promise<LlmJsonResult<string>> {
  const env = getEnv();
  if (!env.OPENAI_API_KEY) return { ok: false, error: "OPENAI_API_KEY is not configured" };

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.LLM_TIMEOUT_MS);
  const started = Date.now();

  try {
    const response = await client.responses.create(
      {
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        input: prompt,
      },
      { signal: controller.signal }
    );

    return {
      ok: true,
      data: response.output_text ?? "",
      tokensIn: response.usage?.input_tokens,
      tokensOut: response.usage?.output_tokens,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM request failed";
    return { ok: false, error: message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
}
