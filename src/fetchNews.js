// 新闻采集：Bing News RSS（免费）为主，Google News RSS 兜底
const config = require("../config");

function decodeEntities(s) {
  return (s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function parseRss(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const grab = (tag) => {
      const t = body.match(new RegExp("<" + tag + "[^>]*>([\s\S]*?)<\/" + tag + ">"));
      return t ? decodeEntities(t[1]) : "";
    };
    items.push({
      title: grab("title"),
      link: grab("link"),
      pubDate: grab("pubDate"),
      source: (body.match(/<source[^>]*url="([^"]+)"/) || [])[1] || "",
      snippet: grab("description"),
    });
  }
  return items.filter((i) => i.title && i.link);
}

function normTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retryFetch(url, tries = 3) {
  let lastErr = null;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(25000) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.text();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await sleep(2000 * (i + 1));
    }
  }
  throw lastErr;
}

async function fetchBing(topic, lang) {
  const q = encodeURIComponent(lang === "zh" ? topic.zh : topic.en);
  const url = "https://www.bing.com/news/search?q=" + q + "&format=rss&setlang=" + (lang === "zh" ? "zh-hans" : "en-US");
  return parseRss(await retryFetch(url));
}

async function fetchGoogle(topic, lang) {
  const q = encodeURIComponent(lang === "zh" ? topic.zh : topic.en);
  const hl = lang === "zh" ? "zh-CN" : "en-US";
  const url = "https://news.google.com/rss/search?q=" + q + "&hl=" + hl + "&gl=" + (lang === "zh" ? "CN" : "US") + "&ceid=" + (lang === "zh" ? "CN:zh-Hans" : "US:en");
  return parseRss(await retryFetch(url));
}

// 华尔街见闻（中文高质量财经快讯，免费 API，无 key）
const WSC_CHANNELS = ["global-channel", "us-shares", "a-shares", "gold", "forex", "commodities", "crypto"];
async function fetchWallstreetcn(limit = 20) {
  const items = [];
  for (const ch of WSC_CHANNELS) {
    try {
      const url = "https://api-one.wallstcn.com/apiv1/content/information-flow?channel=" + ch + "&accept=article&limit=" + limit;
      const j = JSON.parse(await retryFetch(url, 2));
      for (const it of (j.data && j.data.items) || []) {
        const r = it.resource || {};
        if (!r.title) continue;
        items.push({
          title: r.title,
          link: r.uri || ("https://wallstreetcn.com/articles/" + r.id),
          pubDate: r.display_time ? new Date(r.display_time * 1000).toUTCString() : "",
          source: r.source_name || "华尔街见闻",
          snippet: r.content_short || "",
        });
      }
    } catch (e) { console.warn("[news] wsc channel failed:", ch, String(e).slice(0, 80)); }
  }
  return items;
}

// 主入口：抓取所有主题（限速 4 并发），去重，按时间倒序
async function fetchNews(lang = "zh") {
  const topics = config.data.news.topics;
  const results = [];
  for (let i = 0; i < topics.length; i += 4) {
    const batch = topics.slice(i, i + 4);
    const settled = await Promise.allSettled(batch.map(async (t) => {
      try {
        if (config.data.news.provider === "google") return await fetchGoogle(t, lang);
        return await fetchBing(t, lang);
      } catch (e) {
        try { return await fetchBing(t, lang); } // 回退
        catch (e2) { console.warn("[news] topic failed:", t.id, String(e2).slice(0, 100)); return []; }
      }
    }));
    for (const r of settled) {
      if (r.status === "fulfilled") results.push(...r.value);
      else results.push([]);
    }
    if (i + 4 < topics.length) await sleep(400);
  }
  let allItems = results.flat();
  // 中文模式：华尔街见闻优先，与 Bing 结果合并
  if (lang === "zh") {
    try {
      const wsc = await fetchWallstreetcn();
      if (wsc.length) allItems = [...wsc, ...allItems];
    } catch (e) { console.warn("[news] wsc failed:", String(e).slice(0, 80)); }
  }
  const seen = new Set();
  const all = [];
  for (const it of allItems) {
    const key = normTitle(it.title).slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(it);
  }
  all.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return all;
}

module.exports = { fetchNews, parseRss };
