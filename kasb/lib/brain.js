// Kasb Co. — the brain layer.
// Every AI employee talks through here. If a free-tier LLM API key is
// configured (any provider from this repo's data.json — Gemini, Groq,
// Mistral, Cerebras, …), we call the real model. Otherwise we run the
// deterministic local brain so the company never stops working.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { env } from './env.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(HERE, '..', '..', 'data.json');

export function providerDirectory() {
  try {
    const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
    return data.providers.map((p) => ({
      name: p.name,
      flag: p.flag,
      baseUrl: p.baseUrl,
      url: p.url,
      description: p.description,
      models: (p.models || []).slice(0, 3).map((m) => m.name),
    }));
  } catch {
    return [];
  }
}

// Env config, e.g.:
//   KASB_LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
//   KASB_LLM_API_KEY=...
//   KASB_LLM_MODEL=gemini-2.5-flash
export function brainConfig() {
  const baseUrl = env('KASB_LLM_BASE_URL');
  const apiKey = env('KASB_LLM_API_KEY');
  const model = env('KASB_LLM_MODEL');
  return { baseUrl, apiKey, model, live: Boolean(baseUrl && apiKey && model) };
}

export function brainStatus() {
  const cfg = brainConfig();
  if (cfg.live) {
    return { mode: 'live-llm', model: cfg.model, baseUrl: cfg.baseUrl, note: 'Employees are powered by a real free-tier LLM API.' };
  }
  return { mode: 'local', model: 'kasb-local-brain', baseUrl: null, note: 'No KASB_LLM_* env set — employees run on the built-in local brain (still 24/7).' };
}

async function callLLM(system, user, { maxTokens = 700, json = false } = {}) {
  const cfg = brainConfig();
  if (!cfg.live) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`llm http ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null; // fall back to local brain — the company keeps running
  } finally {
    clearTimeout(timer);
  }
}

/** Ask an employee a question. Returns string, or null if neither live nor local could answer. */
export async function ask(agent, prompt, { json = false } = {}) {
  const live = await callLLM(agent.systemPrompt, prompt, { json });
  if (live != null) return live;
  return null; // caller decides local behavior
}

export { callLLM };
