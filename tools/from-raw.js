// ============================================================
// 原始数据 → 流水线输入（data.json / news-zh.json / news-en.json）
// raw/ 目录来源（全部免费、无 key，可用 curl/浏览器抓取）：
//   raw/fred-<ID>.csv         FRED 日线（SP500 NASDAQCOM DJIA VIXCLS DGS10 DCOILWTICO DTWEXBGS DEXUSEU NIKKEI225）
//   raw/gold.json             https://api.gold-api.com/price/XAU
//   raw/coingecko.json        CoinGecko simple/price（bitcoin,ethereum）
//   raw/fg.json               alternative.me 恐慌贪婪
//   raw/wsc-<channel>.json    华尔街见闻 information-flow（global-channel 等）
//   raw/cnbc.xml              CNBC Top News RSS
//   raw/bing-en-<i>.xml       Bing News RSS（en-US，各主题）
//   raw/quote-<i>.json        （可选）Yahoo chart JSON，配合 quotes-index.json
// 用法：node tools/from-raw.js
// ============================================================
const fs = require("fs");
const path = require("path");
const { fromCloses } = require("../src/fetchMarketData");
const { parseRss } = require("../src/fetchNews");

const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "raw");

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function readText(p) { return fs.readFileSync(p, "utf8"); }
function exists(p) { return fs.existsSync(p); }

const FRED_TO_SYMBOL = {
  SP500: "^GSPC", NASDAQCOM: "^IXIC", DJIA: "^DJI", VIXCLS: "^VIX", DGS10: "^TNX",
  DCOILWTICO: "CL=F", DTWEXBGS: "DX-Y.NYB", DEXUSEU: "EURUSD=X", NIKKEI225: "^N225",
};

function main() {
  if (!exists(RAW)) { console.error("raw/ 不存在"); process.exit(1); }
  const quotes = {};

  // 1. FRED CSV
  for (const id of Object.keys(FRED_TO_SYMBOL)) {
    const f = path.join(RAW, "fred-" + id + ".csv");
    if (!exists(f)) continue;
    try {
      const closes = [];
      readText(f).split(/\r?\n/).slice(1).forEach((line) => {
        const parts = line.split(",");
        const v = parseFloat(parts[1]);
        if (parts.length >= 2 && isFinite(v)) closes.push(v); // DEXUSEU 已是 欧元/美元 口径
      });
      if (closes.length) {
        quotes[FRED_TO_SYMBOL[id]] = fromCloses(FRED_TO_SYMBOL[id], closes, { provider: "fred:" + id, ts: Date.now() });
        console.log("ok fred", id, "→", FRED_TO_SYMBOL[id], quotes[FRED_TO_SYMBOL[id]].price);
      }
    } catch (e) { console.warn("skip fred", id, String(e).slice(0, 80)); }
  }

  // 2. 黄金（gold-api）
  const gF = path.join(RAW, "gold.json");
  if (exists(gF)) {
    try {
      const j = readJson(gF);
      quotes["GC=F"] = { symbol: "GC=F", price: j.price, prevClose: null, chgPct1d: null, chgPct5d: null, chgPct20d: null, aboveMA20: null, aboveMA50: null, aboveMA200: null, rsi14: null, marketState: "live", ts: Date.now(), provider: "gold-api" };
      console.log("ok gold-api", j.price);
    } catch (e) { console.warn("skip gold"); }
  }

  // 3. 加密（CoinGecko）
  const cF = path.join(RAW, "coingecko.json");
  if (exists(cF)) {
    try {
      const j = readJson(cF);
      if (j.bitcoin) quotes["BTC-USD"] = { symbol: "BTC-USD", price: j.bitcoin.usd, prevClose: null, chgPct1d: j.bitcoin.usd_24h_change != null ? +j.bitcoin.usd_24h_change.toFixed(2) : null, chgPct5d: null, chgPct20d: null, aboveMA20: null, aboveMA50: null, aboveMA200: null, rsi14: null, marketState: "live", ts: Date.now(), provider: "coingecko" };
      if (j.ethereum) quotes["ETH-USD"] = { symbol: "ETH-USD", price: j.ethereum.usd, prevClose: null, chgPct1d: j.ethereum.usd_24h_change != null ? +j.ethereum.usd_24h_change.toFixed(2) : null, chgPct5d: null, chgPct20d: null, aboveMA20: null, aboveMA50: null, aboveMA200: null, rsi14: null, marketState: "live", ts: Date.now(), provider: "coingecko" };
      console.log("ok coingecko");
    } catch (e) { console.warn("skip coingecko"); }
  }

  // 4. 可选 Yahoo（raw/quote-<i>.json + quotes-index.json）
  const idxF = path.join(RAW, "quotes-index.json");
  if (exists(idxF)) {
    try {
      const symbols = readJson(idxF);
      symbols.forEach((sym, i) => {
        const f = path.join(RAW, "quote-" + i + ".json");
        if (!exists(f) || quotes[sym]) return;
        try {
          const j = readJson(f);
          const r = j.chart && j.chart.result && j.chart.result[0];
          if (!r) return;
          const m = r.meta;
          const closes = (r.indicators.quote[0].close || []).filter((v) => typeof v === "number");
          if (!closes.length) return;
          quotes[sym] = fromCloses(sym, closes, {
            price: m.regularMarketPrice != null ? m.regularMarketPrice : closes[closes.length - 1],
            prevClose: m.chartPreviousClose != null ? m.chartPreviousClose : closes[closes.length - 2],
            marketState: m.marketState || "unknown",
            ts: m.regularMarketTime ? m.regularMarketTime * 1000 : Date.now(),
            provider: "yahoo",
          });
          console.log("ok yahoo", sym, quotes[sym].price);
        } catch (e) { /* skip */ }
      });
    } catch (e) { console.warn("skip yahoo raw"); }
  }

  // 5. 恐惧贪婪
  let fearGreed = null;
  const fgF = path.join(RAW, "fg.json");
  if (exists(fgF)) {
    try {
      const j = readJson(fgF);
      if (j.data && j.data[0]) fearGreed = { value: +j.data[0].value, label: j.data[0].value_classification };
    } catch (e) { /* skip */ }
  }

  const data = { fetchedAt: new Date().toISOString(), quotes, fearGreed };
  fs.writeFileSync(path.join(ROOT, "data.json"), JSON.stringify(data, null, 2));
  console.log("data.json:", Object.keys(quotes).length, "symbols, fg:", fearGreed ? fearGreed.value : "n/a");

  // 6. 中文新闻：华尔街见闻
  const zhItems = [];
  const WSC_CHANNELS = ["global-channel", "us-shares", "a-shares", "gold", "forex", "commodities", "crypto"];
  for (const ch of WSC_CHANNELS) {
    const f = path.join(RAW, "wsc-" + ch + ".json");
    if (!exists(f)) continue;
    try {
      const j = readJson(f);
      for (const it of (j.data && j.data.items) || []) {
        const r = it.resource || {};
        if (!r.title) continue;
        zhItems.push({
          title: r.title,
          link: r.uri || ("https://wallstreetcn.com/articles/" + r.id),
          pubDate: r.display_time ? new Date(r.display_time * 1000).toUTCString() : "",
          source: r.source_name || "华尔街见闻",
          snippet: r.content_short || "",
        });
      }
    } catch (e) { console.warn("skip wsc", ch); }
  }
  // 7. 英文新闻：CNBC + Bing en
  const enItems = [];
  const cnbcF = path.join(RAW, "cnbc.xml");
  if (exists(cnbcF)) { try { enItems.push(...parseRss(readText(cnbcF))); } catch (e) { console.warn("skip cnbc"); } }
  for (let i = 0; i < 20; i++) {
    const f = path.join(RAW, "bing-en-" + i + ".xml");
    if (!exists(f)) break;
    try { enItems.push(...parseRss(readText(f))); } catch (e) { /* skip */ }
  }

  const dedupe = (items) => {
    const seen = new Set();
    const uniq = [];
    for (const it of items) {
      const key = (it.title || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim().slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(it);
    }
    uniq.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return uniq;
  };
  const zh = dedupe(zhItems);
  const en = dedupe(enItems);
  fs.writeFileSync(path.join(ROOT, "news-zh.json"), JSON.stringify(zh, null, 2));
  fs.writeFileSync(path.join(ROOT, "news-en.json"), JSON.stringify(en, null, 2));
  console.log("news-zh.json:", zh.length, "| news-en.json:", en.length);
}

main();
