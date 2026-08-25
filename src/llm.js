// ============================================================
// LLM 客户端：OpenAI 兼容接口（DeepSeek 默认），JSON 模式 + 重试
// ============================================================
async function chat(system, user, cfg) {
  const res = await fetch(cfg.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: "Bearer " + cfg.apiKey } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: cfg.temperature,
      max_tokens: cfg.maxTokens,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(cfg.timeoutMs),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("LLM HTTP " + res.status + ": " + t.slice(0, 300));
  }
  const j = await res.json();
  const content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!content) throw new Error("LLM empty response");
  return content;
}

function extractJson(text) {
  let t = String(text).trim();
  t = t.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  try { return JSON.parse(t); } catch (e) { /* fallthrough */ }
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(t.slice(start, end + 1)); } catch (e2) { /* fallthrough */ }
  }
  throw new Error("LLM output is not valid JSON: " + t.slice(0, 200));
}

// 生成报告：带一次重试
async function generateReport(data, news, kind, lang, cfg) {
  const prompts = require("./prompts");
  const dateInfo = {
    dateStr: data.fetchedAt,
    kind,
    lang,
  };
  const system = prompts.buildSystemPrompt(lang, kind);
  const user = prompts.buildUserPrompt(data, news, lang, kind, dateInfo);
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const text = await chat(system, user, cfg);
      return extractJson(text);
    } catch (e) {
      lastErr = e;
      console.warn("[llm] attempt " + attempt + " failed:", String(e).slice(0, 200));
    }
  }
  throw lastErr || new Error("LLM generation failed");
}

module.exports = { chat, extractJson, generateReport };
