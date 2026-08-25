// ============================================================
// 新闻采集（多源融合，来源多元化）：
//   中文：华尔街见闻 API（实时快讯）+ Bing 中文 RSS
//   英文：Bing News RSS（聚合 Reuters/WSJ/Bloomberg 等）+ CNBC/NYT/FT 官方 RSS
//   出版方自动识别（域名 → 媒体名），保证报告来源多元可溯源
// ============================================================
const config = require("../config");

// 域名 → 媒体名映射（Bing 聚合条目自动标注出版方）
const OUTLET_MAP = {
  "reuters.com": "Reuters",
  "cnbc.com": "CNBC",
  "wsj.com": "WSJ",
  "bloomberg.com": "Bloomberg",
  "nytimes.com": "NYT",
  "ft.com": "Financial Times",
  "marketwatch.com": "MarketWatch",
  "barrons.com": "Barron's",
  "apnews.com": "AP",
  "cnn.com": "CNN",
  "bbc.com": "BBC",
  "forbes.com": "Forbes",
  "businessinsider.com": "Business Insider",
  "yahoo.com": "Yahoo Finance",
  "investing.com": "Investing.com",
  "foxbusiness.com": "Fox Business",
  "theguardian.com": "The Guardian",
  "fool.com": "Motley Fool",
  "fortune.com": "Fortune",
  "kiplinger.com": "Kiplinger",
};

function outletName(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const k of Object.keys(OUTLET_MAP)) {
      if (host === k || host.endsWith("." + k)) return OUTLET_MAP[k];
    }
    return host;
  } catch (e) { return url || ""; }
}

function decodeEntities(s) {
  return (s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function parseRss(xml) {
  const items = [];
  // 被反爬时源站可能返回 HTML 页面而非 RSS：直接视为失败，触发重试/回退
  if (!/<item[\s>]/.test(xml) && /<html/i.test(xml)) throw new Error("got HTML instead of RSS");
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const grab = (tag) => {
      const t = body.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">"));
      return t ? decodeEntities(t[1]) : "";
    };
    const srcUrl = (body.match(/<source[^>]*url="([^"]+)"/) || [])[1] || "";
    items.push({
      title: grab("title"),
      link: grab("link"),
      pubDate: grab("pubDate"),
      source: outletName(srcUrl) || "Bing News",
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

// 华尔街见闻（中文财经快讯，免费 API）
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

// 官方英文 RSS（多元来源）
const EN_RSS_SOURCES = [
  { id: "cnbc", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", name: "CNBC" },
  { id: "nyt-biz", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NYT" },
  { id: "ft", url: "https://www.ft.com/rss/home", name: "Financial Times" },
];
async function fetchRssSource(src) {
  try {
    const items = parseRss(await retryFetch(src.url, 2));
    for (const it of items) it.source = src.name;
    return items;
  } catch (e) {
    console.warn("[news] rss source failed:", src.id, String(e).slice(0, 80));
    return [];
  }
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

function dedupeSort(items) {
  const seen = new Set();
  const all = [];
  for (const it of items) {
    const key = normTitle(it.title).slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(it);
  }
  all.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return all;
}

// 主入口：多源融合
async function fetchNews(lang = "zh") {
  const topics = config.data.news.topics;
  const pools = [];

  // 1. 中文：华尔街见闻
  if (lang === "zh") {
    try { pools.push(await fetchWallstreetcn()); } catch (e) { console.warn("[news] wsc failed:", String(e).slice(0, 80)); }
  }

  // 2. Bing 主题（限速 4 并发）
  for (let i = 0; i < topics.length; i += 4) {
    const batch = topics.slice(i, i + 4);
    const settled = await Promise.allSettled(batch.map(async (t) => {
      try {
        if (config.data.news.provider === "google") return await fetchGoogle(t, lang);
        return await fetchBing(t, lang);
      } catch (e) {
        try { return await fetchBing(t, lang); }
        catch (e2) { console.warn("[news] topic failed:", t.id, String(e2).slice(0, 100)); return []; }
      }
    }));
    for (const r of settled) if (r.status === "fulfilled") pools.push(r.value);
    if (i + 4 < topics.length) await sleep(400);
  }

  // 3. 官方英文 RSS（中英文报告都融合，保证来源多元）
  for (const src of EN_RSS_SOURCES) pools.push(await fetchRssSource(src));

  return dedupeSort(pools.flat());
}

module.exports = { fetchNews, parseRss, outletName };
