// ============================================================
// 行情采集：多供应商容错
//   1. Yahoo Finance chart API（实时，无 key，需要 User-Agent；偶发 429 会自动重试）
//   2. FRED (St. Louis Fed) CSV（免费无 key，日线收盘，滞后一天；兜底美股指数/VIX/10Y/WTI/美元指数）
//   3. CoinGecko（BTC/ETH 实时）
// ============================================================
const config = require("../config");

const UA = config.data.yahoo.userAgent;

async function getText(url, headers = {}, timeout = 20000) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

async function getJson(url, headers = {}) {
  return JSON.parse(await getText(url, headers));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gains += d; else losses -= d;
  }
  if (losses === 0) return 100;
  const rs = gains / period / (losses / period);
  return Math.round(100 - 100 / (1 + rs));
}

// 由收盘序列计算统一指标
function fromCloses(symbol, closes, extra = {}) {
  closes = closes.filter((v) => typeof v === "number" && isFinite(v));
  if (!closes.length) throw new Error("empty closes for " + symbol);
  const price = extra.price != null ? extra.price : closes[closes.length - 1];
  const prevClose = extra.prevClose != null ? extra.prevClose : closes[closes.length - 2];
  const chg = (n) => (closes.length >= n + 1 ? +((closes[closes.length - 1] / closes[closes.length - 1 - n] - 1) * 100).toFixed(2) : null);
  const ma = (n) => (closes.length >= n ? closes.slice(-n).reduce((a, b) => a + b, 0) / n : null);
  const m20 = ma(20), m50 = ma(50), m200 = ma(200);
  return {
    symbol,
    price,
    prevClose,
    chgPct1d: prevClose ? +((price / prevClose - 1) * 100).toFixed(2) : null,
    chgPct5d: chg(5),
    chgPct20d: chg(20),
    aboveMA20: m20 ? price > m20 : null,
    aboveMA50: m50 ? price > m50 : null,
    aboveMA200: m200 ? price > m200 : null,
    rsi14: rsi(closes),
    marketState: extra.marketState || "closed",
    ts: extra.ts || Date.now(),
    provider: extra.provider || "closes",
  };
}

// ---------- Yahoo ----------
async function fetchYahoo(symbol, attempt = 0) {
  const bases = ["https://query2.finance.yahoo.com", "https://query1.finance.yahoo.com"];
  const base = bases[attempt % 2];
  const url = base + "/v8/finance/chart/" + encodeURIComponent(symbol) + "?range=1y&interval=1d";
  try {
    const j = await getJson(url);
    const r = j.chart && j.chart.result && j.chart.result[0];
    if (!r) throw new Error("no result");
    const m = r.meta;
    const closes = (r.indicators.quote[0].close || []).filter((v) => typeof v === "number");
    if (!closes.length) throw new Error("no closes");
    return fromCloses(symbol, closes, {
      price: m.regularMarketPrice != null ? m.regularMarketPrice : closes[closes.length - 1],
      prevClose: m.chartPreviousClose != null ? m.chartPreviousClose : closes[closes.length - 2],
      marketState: m.marketState,
      ts: m.regularMarketTime ? m.regularMarketTime * 1000 : Date.now(),
      provider: "yahoo",
    });
  } catch (e) {
    if (attempt < 3) { await sleep(1500 * (attempt + 1)); return fetchYahoo(symbol, attempt + 1); }
    throw new Error("yahoo failed (" + (e && e.message || e) + ")");
  }
}

// ---------- FRED ----------
const FRED_MAP = {
  "^GSPC": "SP500",
  "^IXIC": "NASDAQCOM",
  "^DJI": "DJIA",
  "^VIX": "VIXCLS",
  "^TNX": "DGS10",
  "CL=F": "DCOILWTICO",
  "DX-Y.NYB": "DTWEXBGS",
  "^N225": "NIKKEI225",
  "EURUSD=X": "DEXUSEU", // 注意：DEXUSEU 是 美元/欧元，需要取倒数
};
async function fetchFred(symbol) {
  const id = FRED_MAP[symbol];
  if (!id) throw new Error("no fred series");
  const csv = await getText("https://fred.stlouisfed.org/graph/fredgraph.csv?id=" + id);
  const closes = [];
  csv.split(/\r?\n/).slice(1).forEach((line) => {
    const parts = line.split(",");
    const v = parseFloat(parts[1]);
    if (parts.length >= 2 && isFinite(v)) closes.push(v); // DEXUSEU 已是 欧元/美元 口径
  });
  if (!closes.length) throw new Error("fred empty for " + id);
  const out = fromCloses(symbol, closes, { provider: "fred:" + id, ts: Date.now() });
  out.isFred = true; // FRED 滞后一个交易日
  return out;
}

// ---------- CoinGecko ----------
async function fetchCrypto() {
  const j = await getJson(config.data.coingecko.baseUrl + "?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true");
  return {
    "BTC-USD": { price: j.bitcoin.usd, chgPct1d: +j.bitcoin.usd_24h_change.toFixed(2), provider: "coingecko" },
    "ETH-USD": { price: j.ethereum.usd, chgPct1d: +j.ethereum.usd_24h_change.toFixed(2), provider: "coingecko" },
  };
}

async function fetchFearGreed() {
  try {
    const j = await getJson(config.data.fearGreed.baseUrl + "?limit=1");
    const d = j.data && j.data[0];
    if (!d) return null;
    return { value: +d.value, label: d.value_classification };
  } catch (e) { return null; }
}

// ---------- 并发编排：限速 + 重试 + 供应商回退 ----------
async function fetchSymbol(symbol) {
  try {
    return await fetchYahoo(symbol);
  } catch (yErr) {
    console.warn("[data] yahoo:", symbol, String(yErr).slice(0, 90), "→ 尝试 FRED");
    try { return await fetchFred(symbol); } catch (fErr) {
      console.warn("[data] fred:", symbol, String(fErr).slice(0, 80));
      return null;
    }
  }
}

async function fetchQuotes() {
  const symbols = Object.keys(config.data.yahoo.symbols);
  const quotes = {};
  // 限速：每批 3 个，间隔 250ms，降低 429 概率
  for (let i = 0; i < symbols.length; i += 3) {
    const batch = symbols.slice(i, i + 3);
    const results = await Promise.allSettled(batch.map(fetchSymbol));
    results.forEach((r, j) => {
      if (r.status === "fulfilled" && r.value) quotes[batch[j]] = r.value;
    });
    if (i + 3 < symbols.length) await sleep(250);
  }
  // CoinGecko 兜底加密资产
  if (config.data.coingecko.enabled) {
    try {
      const cg = await fetchCrypto();
      for (const k of Object.keys(cg)) {
        if (!quotes[k]) {
          const info = cg[k];
          quotes[k] = { symbol: k, price: info.price, prevClose: null, chgPct1d: info.chgPct1d, chgPct5d: null, chgPct20d: null, aboveMA20: null, aboveMA50: null, aboveMA200: null, rsi14: null, marketState: "live", ts: Date.now(), provider: info.provider };
        }
      }
    } catch (e) { console.warn("[data] coingecko:", String(e).slice(0, 80)); }
  }
  const fearGreed = config.data.fearGreed.enabled ? await fetchFearGreed() : null;
  return { fetchedAt: new Date().toISOString(), quotes, fearGreed };
}

module.exports = { fetchQuotes, fetchYahoo, fromCloses };
