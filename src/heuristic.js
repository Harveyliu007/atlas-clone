// ============================================================
// 启发式共识引擎：无 LLM / --mock 模式下的确定性"大师框架模拟"。
// 每位大师 = 静态倾向(defaults) + 特质(traits) 对实时数据的动态调整，
// 汇总得到 15 资产的多空共识，并生成模板化报告 JSON。
// ============================================================
const masters = require("./masters");
const { ASSET_SYMBOL, ASSETS } = masters;

// ETF 缺失时回退到对应指数（动量/均线指标一致，价格用指数价）
const FALLBACK_SYMBOL = { SPY: "^GSPC", QQQ: "^IXIC", DIA: "^DJI" };

function q(quotes, sym) {
  return quotes[sym] || (FALLBACK_SYMBOL[sym] ? quotes[FALLBACK_SYMBOL[sym]] : null);
}

// 解析雷达行的实际数据来源与展示名
function resolveRow(quotes, a) {
  if (quotes[a.symbol]) return { sym: a.symbol, zh: a.zh, en: a.en, icon: a.icon };
  const fb = FALLBACK_SYMBOL[a.symbol];
  if (fb && quotes[fb]) {
    const names = require("../config").data.yahoo.symbols[fb] || {};
    return { sym: fb, zh: a.zh.replace(/\([A-Z]+\)/, "指数"), en: a.en.replace(/\([A-Z]+\)/, "Index"), icon: a.icon };
  }
  return null;
}

// 单大师对单资产的立场（-2..2）
function masterStance(m, assetKey, quotes) {
  let s = m.defaults[assetKey] || 0;
  const T = m.traits || [];
  const sym = ASSET_SYMBOL[assetKey];
  const d = q(quotes, sym) || {};
  const mom20 = d.chgPct20d || 0;
  const mom5 = d.chgPct5d || 0;
  const above = (n) => d["aboveMA" + n] === true;
  const rsi = d.rsi14 == null ? 50 : d.rsi14;
  const dxy = (q(quotes, "DX-Y.NYB") || {}).chgPct20d || 0;
  const tnx = (q(quotes, "^TNX") || {}).chgPct20d || 0;
  if (T.includes("momentum")) s += mom20 > 0.5 ? 1 : mom20 < -0.5 ? -1 : 0;
  if (T.includes("trend")) s += (above(200) ? 1 : -1) + (mom20 > 0 ? 0.5 : -0.5);
  if (T.includes("contrarian")) s += mom5 > 1.5 ? -1 : mom5 < -1.5 ? 1 : 0;
  if (T.includes("meanRev")) s += mom5 > 2 ? -1 : mom5 < -2 ? 1 : 0;
  if (T.includes("growth") && assetKey === "nasdaq") s += above(50) ? 1 : -0.5;
  if (T.includes("value") && assetKey === "usEquities") { if (!above(200)) s += 0.5; if (rsi > 75) s -= 1; }
  if (T.includes("indexBull") && ["usEquities", "nasdaq", "dow"].includes(assetKey)) s += 1;
  if (T.includes("indexBear") && ["usEquities", "nasdaq", "dow"].includes(assetKey)) s -= 1;
  if (T.includes("cryptoBull") && ["btc", "eth"].includes(assetKey)) s += 1;
  if (T.includes("cryptoSkeptic") && ["btc", "eth"].includes(assetKey)) s -= 1;
  if (T.includes("commodityBull") && ["gold", "oil", "copper"].includes(assetKey)) s += 1;
  if (T.includes("debasement") && ["gold", "btc", "eth"].includes(assetKey)) s += dxy < 0 ? 1 : -0.5;
  if (T.includes("inflationHedge") && ["gold", "copper", "btc"].includes(assetKey)) s += tnx > 0 ? 1 : 0;
  if (T.includes("tailRisk")) {
    if (assetKey === "vix") s += 1;
    if (["usEquities", "nasdaq"].includes(assetKey)) s -= 0.5;
    if (assetKey === "gold") s += 0.5;
  }
  if (T.includes("dollarBear")) {
    if (assetKey === "dxy") s -= 1;
    if (["gold", "btc"].includes(assetKey)) s += 0.5;
  }
  if (T.includes("bondBear") && assetKey === "yield10y") s += 1;
  if (T.includes("bondBull") && assetKey === "yield10y") s -= 1;
  if (T.includes("chinaBull") && ["sse", "hsi"].includes(assetKey)) s += 1;
  return Math.max(-2, Math.min(2, Math.round(s)));
}

function fmtNum(v) {
  if (v == null) return "-";
  if (v >= 1000) return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (v < 100) return "$" + v.toFixed(4); // 外汇类资产保留 4 位
  return "$" + v.toFixed(2);
}

function fmtPct(v) {
  if (v == null) return "-";
  return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
}

function strengthOf(net) {
  if (net >= 0.6) return { sym: "🔒🔒🔒🔒🔒", label: "高度共识" };
  if (net >= 0.35) return { sym: "🔒🔒🔒🔒⚪", label: "高度共识" };
  if (net >= 0.15) return { sym: "✅✅✅⚪⚪", label: "一致偏多" };
  if (net > 0) return { sym: "✅✅⚪⚪⚪", label: "偏多" };
  if (net === 0) return { sym: "⚡⚡⚪⚪⚪", label: "分化" };
  if (net > -0.15) return { sym: "⚡⚡⚪⚪⚪", label: "分歧" };
  if (net > -0.35) return { sym: "❌❌❌⚪⚪", label: "偏空" };
  return { sym: "❌❌❌❌⚪", label: "对立" };
}

// 全资产共识扫描
function computeRadar(quotes) {
  const rows = [];
  for (const a of ASSETS) {
    const resolved = resolveRow(quotes, a);
    if (!resolved) continue;
    const d = q(quotes, resolved.sym);
    if (!d) continue;
    const scores = masters.map((m) => ({ m, s: masterStance(m, a.key, quotes) }));
    const bulls = scores.filter((x) => x.s >= 1);
    const bears = scores.filter((x) => x.s <= -1);
    const net = (bulls.length - bears.length) / Math.max(1, masters.length);
    const st = strengthOf(net);
    rows.push({
      key: a.key,
      symbol: resolved.sym,
      asset: resolved.zh,
      assetEn: resolved.en,
      icon: resolved.icon,
      price: a.key === "yield10y" ? d.price.toFixed(2) + "%" : fmtNum(d.price),
      chgPct1d: d.chgPct1d,
      bulls: bulls.slice(0, 4).map((x) => x.m.zh),
      bullsEn: bulls.slice(0, 4).map((x) => x.m.en),
      bears: bears.slice(0, 4).map((x) => x.m.zh),
      bearsEn: bears.slice(0, 4).map((x) => x.m.en),
      strength: st.sym,
      label: st.label,
      labelEn: st.label,
      net,
    });
  }
  return rows;
}

// 模板化大师卡片（mock 模式用；LLM 模式会生成高质量文字）
function cannedView(master, key, sign, quotes) {
  const d = q(quotes, ASSET_SYMBOL[key]);
  const mom = d ? (d.chgPct20d || 0) : 0;
  const dir = sign >= 1 ? "看多" : "看空";
  const reason = sign >= 1
    ? "20日动量 " + fmtPct(mom) + "，趋势向上，框架内维持" + dir + "。"
    : "20日动量 " + fmtPct(mom) + "，风险收益比恶化，框架内转为" + dir + "。";
  return master.zh + "（" + master.style + "）：" + reason;
}

function buildCards(radar, quotes) {
  const sorted = [...radar].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  return sorted.slice(0, 4).map((r) => {
    const scores = masters.map((m) => ({ m, s: masterStance(m, r.key, quotes) }));
    const top = scores.filter((x) => Math.abs(x.s) >= 1).sort((a, b) => Math.abs(b.s) - Math.abs(a.s)).slice(0, 4);
    return {
      asset: r.asset,
      assetEn: r.assetEn,
      icon: r.icon,
      tone: r.net >= 0.2 ? "gold" : r.net > 0 ? "green" : r.net >= -0.2 ? "purple" : "red",
      views: top.map((x) => ({ master: x.m.zh, masterEn: x.m.en, text: cannedView(x.m, r.key, x.s, quotes) })),
    };
  });
}

// 从共识推导信号（mock 模式）
function deriveSignals(radar, quotes) {
  const sorted = [...radar].filter((r) => !["vix", "yield10y", "dxy", "eurusd"].includes(r.key)).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const signals = [];
  const topLong = sorted.find((r) => r.net > 0);
  const topShort = sorted.find((r) => r.net < 0);
  const mk = (r, side) => {
    const d = q(quotes, r.symbol);
    if (!d) return null;
    const p = d.price;
    const pct = (n) => side === "LONG" ? p * (1 + n / 100) : p * (1 - n / 100);
    const fm = (v, dec) => (v >= 100 ? "$" + Math.round(v).toLocaleString() : "$" + v.toFixed(dec || 2));
    return {
      side,
      asset: r.asset,
      assetEn: r.assetEn,
      icon: r.icon,
      score: Math.min(95, Math.max(50, Math.round(50 + Math.abs(r.net) * 100))),
      entry: fm(side === "LONG" ? p * 0.992 : p * 1.008) + " - " + fm(side === "LONG" ? p * 1.008 : p * 0.992),
      t1: fm(pct(4)),
      t2: fm(pct(8)),
      stop: fm(side === "LONG" ? p * 0.97 : p * 1.03),
      horizon: "swing 1-4周",
      masters: side === "LONG" ? r.bulls.join(", ") : r.bears.join(", "),
      consensus: r.label,
      logic: "共识引擎：50 位大师框架扫描下，" + r.asset + "多空归因" + (side === "LONG" ? "偏多" : "偏空") + "（" + r.bulls.length + " 多 / " + r.bears.length + " 空）。20日动量 " + fmtPct(d.chgPct20d) + "，处于 20/50/200 日均线" + (d.aboveMA20 ? "上方" : "下方") + "。",
      debate: "反方观点：短期情绪过热与事件风险可能导致回撤；若宏观数据逆转，共识将快速瓦解。",
      trigger: side === "LONG" ? "站稳进场区间上沿并放量确认后加仓；跌破止损线离场。" : "反弹至进场区间上沿遇阻确认后加仓；突破止损线离场。",
    };
  };
  if (topLong) { const s = mk(topLong, "LONG"); if (s) signals.push(s); }
  if (topShort) { const s = mk(topShort, "SHORT"); if (s) signals.push(s); }
  const vixRow = radar.find((r) => r.key === "vix");
  if (vixRow && q(quotes, "^VIX") && q(quotes, "^VIX").price < 20) {
    signals.push({
      side: "HEDGE",
      asset: "VIX 尾部保护",
      assetEn: "VIX Tail Hedge",
      icon: "📊",
      score: 70,
      entry: "VIX < 16 买入看涨期权",
      t1: "VIX 20",
      t2: "VIX 25",
      stop: "期权费归零",
      horizon: "事件对冲 1-2周",
      masters: "塔勒布, 伯里",
      consensus: "尾部风险",
      logic: "VIX 处于低位，重大事件（财报、央行会议）密集，尾部保护成本低、赔率高。",
      debate: "低波动环境下期权时间价值持续损耗。",
      trigger: "事件落地前布局；事件后未触发则平仓。",
    });
  }
  return signals;
}

function fmtDateCN(s) {
  const d = new Date(s);
  if (isNaN(d)) return s;
  return (d.getMonth() + 1) + "月" + d.getDate() + "日";
}

// 关键词 → 红色警报（mock 模式）
const ALERT_RULES = [
  { re: /崩盘|暴跌|危机|战争|违约|警报|熔断|制裁|违约|崩|爆|恐慌/, tone: "red", tag: "风险事件" },
  { re: /财报|earnings|NVDA|英伟达|美联储|Fed|加息|降息/, tone: "purple", tag: "关键事件" },
  { re: /黄金|gold|比特币|bitcoin|加密|crypto|突破|新高/, tone: "yellow", tag: "市场异动" },
];
function pickAlerts(news) {
  const alerts = [];
  const used = new Set();
  for (const rule of ALERT_RULES) {
    for (const n of news) {
      if (used.has(n.title)) continue;
      if (rule.re.test(n.title + " " + (n.snippet || ""))) {
        used.add(n.title);
        alerts.push({
          tone: rule.tone,
          tag: rule.tag,
          title: n.title,
          body: n.snippet || n.title,
          source: (n.source ? n.source + " · " : "") + fmtDateCN(n.pubDate),
        });
        break;
      }
    }
    if (alerts.length >= 3) break;
  }
  return alerts;
}

// 构建完整报告 JSON（mock 模式）
function buildReport(data, news, opts = {}) {
  const kind = opts.kind || "daily";
  const quotes = data.quotes;
  const radar = computeRadar(quotes);
  const cards = buildCards(radar, quotes);
  const signals = deriveSignals(radar, quotes);
  const events = news.slice(0, 10).map((n) => ({
    title: n.title,
    body: n.snippet || n.title,
    source: (n.source ? n.source + " · " : "") + fmtDateCN(n.pubDate),
  }));
  const redAlerts = pickAlerts(news);
  const hotWords = news.slice(0, 8).map((n) => "#" + (n.title || "").slice(0, 12).replace(/\s+/g, ""));
  const ticker = [];
  const tk = (sym, name, price, chg) => ticker.push({ symbol: sym, name, price, chg, up: !String(chg).startsWith("-") });
  const g = (s) => q(quotes, s);
  const gname = (sym, direct) => quotes[sym] ? direct : ((require("../config").data.yahoo.symbols[FALLBACK_SYMBOL[sym]] || {}).nameZh || direct);
  if (g("SPY")) tk(quotes["SPY"] ? "SPY" : "SPX", gname("SPY", "标普500 ETF"), fmtNum(g("SPY").price), fmtPct(g("SPY").chgPct1d));
  if (g("QQQ")) tk(quotes["QQQ"] ? "QQQ" : "NDX", gname("QQQ", "纳指100 ETF"), fmtNum(g("QQQ").price), fmtPct(g("QQQ").chgPct1d));
  if (g("DIA")) tk(quotes["DIA"] ? "DIA" : "DJI", gname("DIA", "道指 ETF"), fmtNum(g("DIA").price), fmtPct(g("DIA").chgPct1d));
  if (g("BTC-USD")) tk("BTC", "比特币", fmtNum(g("BTC-USD").price), fmtPct(g("BTC-USD").chgPct1d));
  if (g("ETH-USD")) tk("ETH", "以太坊", fmtNum(g("ETH-USD").price), fmtPct(g("ETH-USD").chgPct1d));
  if (g("GC=F")) tk("黄金", "黄金", fmtNum(g("GC=F").price), fmtPct(g("GC=F").chgPct1d));
  if (g("^VIX")) tk("VIX", "恐慌指数", g("^VIX").price.toFixed(2), fmtPct(g("^VIX").chgPct1d));
  if (g("^TNX")) tk("10Y", "10年期美债收益率", g("^TNX").price.toFixed(2) + "%", fmtPct(g("^TNX").chgPct1d));
  if (g("CL=F")) tk("WTI", "WTI原油", fmtNum(g("CL=F").price), fmtPct(g("CL=F").chgPct1d));
  if (data.fearGreed) tk("Fear&Greed", "恐惧贪婪指数", String(data.fearGreed.value), data.fearGreed.label);

  const fg = data.fearGreed;
  const fear = fg ? fg.value : 50;
  const fearLabel = fg ? fg.label : "n/a";
  const sentiment = {
    platforms: [
      { name: "Reddit / WSB", score: Math.min(95, fear), label: fear > 60 ? "偏热" : "中性", points: ["AI 自动舆情扫描：以恐惧贪婪指数 " + fear + " 为代理（mock 模式）", "接入社媒 API 后可升级为真实抓取", "热门话题：" + hotWords.slice(0, 3).join(" ") ] },
      { name: "X / Twitter 金融", score: Math.max(5, Math.min(95, fear - 5)), label: "中性", points: ["以恐惧贪婪指数为代理", "财报事件期关注 NVDA 话题", "宏观叙事主导讨论"] },
      { name: "中文社区 (微博/雪球)", score: Math.max(5, Math.min(95, fear - 10)), label: "中性", points: ["A股/港股与美股联动讨论", "黄金与加密配置话题升温", "关注 NVDA 财报对 A 股映射"] },
    ],
    retail: "散户情绪以恐惧贪婪指数 " + fear + "（" + fearLabel + "）为代理，热点集中于 " + hotWords.slice(0, 3).join(" ") + "。",
    institutional: "机构关注利率路径、财报事件与地缘风险；共识引擎显示大类资产配置偏向硬资产。",
    hotWords,
  };

  const topNet = [...radar].sort((a, b) => Math.abs(b.net) - Math.abs(a.net))[0];
  return {
    kind,
    titleZh: "每日参考 · 全资产共识扫描" + (topNet ? " · " + topNet.asset + "共识最强" : ""),
    tagsZh: "DAILY BRIEF · 50 MASTERS CONSENSUS SCAN · " + (topNet ? topNet.assetEn.toUpperCase() : ""),
    titleEn: "Daily Reference · Cross-Asset Consensus Scan",
    tagsEn: "DAILY BRIEF · 50 MASTERS CONSENSUS SCAN",
    ticker,
    redAlerts,
    events,
    sentiment,
    radar: { rows: radar.map(({ key, net, ...rest }) => rest), cards },
    signals,
    allocation: [
      { label: "核心多仓", pct: "60%", note: "共识最强资产（" + (signals.filter((s) => s.side === "LONG").map((s) => s.asset).join(" + ") || "待定") + "）" },
      { label: "尾部对冲", pct: "15%", note: "VIX 尾部保护" },
      { label: "现金", pct: "25%", note: "等待事件落地" },
    ],
    calendar: [
      { date: "本周", events: "财报季与宏观数据密集（接入事件日历 API 后可自动填充）", time: "盘前/盘后", impact: "高" },
    ],
    scenarios: {
      bull: { prob: "25%", text: "共识资产延续趋势，动量加速；事件落地好于预期。" },
      base: { prob: "50%", text: "事件落地符合预期，市场区间震荡，共识方向缓慢兑现。" },
      bear: { prob: "25%", text: "事件黑天鹅导致波动率飙升，共识拥挤仓位快速回撤。" },
    },
    judgment: {
      paras: [
        "本报告由启发式共识引擎（mock 模式）生成：50 位大师框架对 15 个资产的多空立场由「静态倾向 + 实时动量/均线/RSI 规则」确定性计算得出。",
        "核心结论：全资产扫描中" + (topNet ? topNet.asset + "共识强度最高" : "共识分散") + "。配置 LLM API key 后可生成完整深度文字分析。",
      ],
      coreLong: signals.filter((s) => s.side === "LONG").map((s) => s.asset).join(" + ") || "待定",
      coreShort: signals.filter((s) => s.side === "SHORT").map((s) => s.asset).join(" + ") || "无",
      hedge: "VIX 低位买入尾部保护",
      cash: "保留 25% 现金等待信号明朗",
    },
    sourceLine: "数据源：Yahoo Finance · CoinGecko · alternative.me · Bing News RSS",
  };
}

module.exports = { computeRadar, buildReport, masterStance };
