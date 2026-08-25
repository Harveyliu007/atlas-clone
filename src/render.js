// ============================================================
// HTML 渲染：晨报/晚报/周报（中英）、首页、存档、语言跳转页
// 视觉复刻原站：深色主题 #030712、Tailwind CDN、大字体适老化
// ============================================================
const config = require("../config");

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const TAILWIND_HEAD = [
  '<script src="https://cdn.tailwindcss.com"></script>',
  "<script>",
  "tailwind.config = { theme: { extend: {",
  "  fontSize: { 'xs': ['0.875rem', { lineHeight: '1.4' }], 'sm': ['1rem', { lineHeight: '1.6' }], 'base': ['1.125rem', { lineHeight: '1.7' }], 'lg': ['1.375rem', { lineHeight: '1.5' }], 'xl': ['1.5rem', { lineHeight: '1.4' }], '2xl': ['1.75rem', { lineHeight: '1.3' }], '3xl': ['2rem', { lineHeight: '1.3' }] },",
  "  maxWidth: { '4xl': '80rem', '5xl': '80rem', '6xl': '80rem', '7xl': '80rem' },",
  "} } }",
  "</script>",
].join("\n");

const BASE_CSS = [
  "html { font-size: 15px !important; }",
  "body { font-size: 0.9375rem !important; line-height: 1.5 !important; overflow-x: hidden !important; }",
  ".max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl { max-width: 100% !important; padding-left: 12px !important; padding-right: 12px !important; }",
  ".max-w-3xl, .max-w-2xl { max-width: 100% !important; }",
  ".text-xs { font-size: 0.6875rem !important; line-height: 1.3 !important; }",
  ".text-sm { font-size: 0.8125rem !important; line-height: 1.4 !important; }",
  ".text-base { font-size: 0.9375rem !important; line-height: 1.5 !important; }",
  ".text-lg { font-size: 1.0625rem !important; line-height: 1.4 !important; }",
  ".text-xl { font-size: 1.25rem !important; line-height: 1.3 !important; }",
  ".text-2xl { font-size: 1.4375rem !important; line-height: 1.2 !important; }",
  ".text-3xl { font-size: 1.625rem !important; line-height: 1.2 !important; }",
  "td { font-size: 0.8125rem !important; padding: 5px 7px !important; line-height: 1.3 !important; }",
  "th { font-size: 0.6875rem !important; padding: 5px 7px !important; }",
  ".tag { font-size: 0.6875rem !important; padding: 2px 6px !important; }",
  ".scenario-badge { font-size: 0.75rem !important; padding: 3px 8px !important; }",
  ".text-slate-400 { color: #94a3b8 !important; }",
  ".text-slate-500 { color: #94a3b8 !important; }",
  ".text-slate-600 { color: #64748b !important; }",
  "* { word-break: break-word; overflow-wrap: break-word; }",
  ".card, .card-danger, .card-gold, .card-blue, .card-green, .card-purple, .card-red, .card-yellow { padding: 10px !important; border-radius: 8px !important; }",
  ".section-divider { margin: 1rem 0 !important; }",
  ".progress-bar { height: 4px !important; }",
  "@media (min-width: 768px) {",
  "  html { font-size: 18px !important; }",
  "  body { font-size: 1.125rem !important; line-height: 1.7 !important; }",
  "  .max-w-7xl, .max-w-6xl, .max-w-5xl, .max-w-4xl { max-width: 80rem !important; padding-left: 0 !important; padding-right: 0 !important; }",
  "  .max-w-3xl { max-width: 72rem !important; }",
  "  .max-w-2xl { max-width: 64rem !important; }",
  "  .text-xs { font-size: 0.875rem !important; line-height: 1.4 !important; }",
  "  .text-sm { font-size: 1rem !important; line-height: 1.6 !important; }",
  "  .text-base { font-size: 1.125rem !important; line-height: 1.7 !important; }",
  "  .text-lg { font-size: 1.375rem !important; line-height: 1.5 !important; }",
  "  .text-xl { font-size: 1.5rem !important; line-height: 1.4 !important; }",
  "  .text-2xl { font-size: 1.75rem !important; line-height: 1.3 !important; }",
  "  .text-3xl { font-size: 2rem !important; line-height: 1.3 !important; }",
  "  td { font-size: 0.875rem !important; padding: 6px 10px !important; }",
  "  th { font-size: 0.75rem !important; padding: 6px 10px !important; }",
  "  .tag { font-size: 0.75rem !important; padding: 2px 8px !important; }",
  "  .scenario-badge { font-size: 0.875rem !important; padding: 4px 10px !important; }",
  "}",
  "@media (max-width: 767px) {",
  "  .overflow-x-auto { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }",
  "  .overflow-x-auto table { min-width: 420px; }",
  "}",
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');",
  "body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #030712; color: #f9fafb; }",
  ".hero-gradient { background: radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, rgba(3, 7, 18, 1) 70%); }",
  ".card-gradient { background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9)); }",
  ".card-red { background: rgba(239,68,68,0.08); }",
  ".card-gold { background: rgba(234,179,8,0.08); }",
  ".card-blue { background: rgba(59,130,246,0.08); }",
  ".card-green { background: rgba(34,197,94,0.08); }",
  ".card-purple { background: rgba(168,85,247,0.08); }",
  ".signal-buy { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3); }",
  ".signal-sell { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); }",
  ".signal-watch { background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.3); }",
  ".signal-hedge { background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.3); }",
  ".progress-bar { border-radius: 2px; overflow: hidden; background: rgba(255,255,255,0.1); }",
  ".progress-fill { height: 100%; border-radius: 2px; }",
  "@keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }",
  ".live-dot { animation: pulse-dot 2s infinite ease-in-out; }",
].join("\n");

function brand() { return config.brand; }
function headHtml(title) {
  return '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + esc(title) + '</title>\n' + TAILWIND_HEAD + '\n<style>' + BASE_CSS + '</style>';
}

function navbar(lang, active) {
  const b = brand();
  const home = lang === "zh" ? "首页" : "Home";
  const archive = lang === "zh" ? "历史报告" : "Archive";
  const langLink = lang === "zh" ? "English" : "中文";
  return '<nav class="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">\n' +
    '  <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">\n' +
    '    <div class="flex items-center gap-3">\n' +
    '      <span class="text-xl font-black text-white">' + esc(b.name + b.suffix) + '</span>\n' +
    '      <span class="hidden md:inline-block px-2 py-0.5 rounded-full bg-white/10 text-sm font-semibold tracking-widest uppercase text-gray-300 border border-white/10">' + esc(b.tagline) + '</span>\n' +
    '    </div>\n' +
    '    <div class="flex items-center gap-4 text-sm font-medium text-gray-400">\n' +
    '      <a href="/" class="hover:text-white transition-colors">🏠 ' + home + '</a>\n' +
    '      <a href="/archive.html" class="hover:text-white transition-colors">📚 ' + archive + '</a>\n' +
    '      <div class="hidden sm:flex items-center">\n' +
    '        <span class="inline-block w-2 h-2 rounded-full bg-green-500 live-dot mr-2"></span>\n' +
    '        <span>' + (lang === "zh" ? "引擎运行中" : "Engine Live") + '</span>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</nav>\n';
}

const TONE_TEXT = { yellow: "text-yellow-300", purple: "text-purple-300", red: "text-red-300", orange: "text-orange-300", green: "text-green-300", blue: "text-blue-300", pink: "text-pink-300" };
const TONE_BG = { yellow: "bg-yellow-500/20", purple: "bg-purple-500/20", red: "bg-red-500/20", orange: "bg-orange-500/20", green: "bg-green-500/20", blue: "bg-blue-500/20", pink: "bg-pink-500/20" };
const SIDE_CLASS = { LONG: "signal-buy", SHORT: "signal-sell", WATCH: "signal-watch", HEDGE: "signal-hedge" };
const SIDE_TAG = { LONG: "bg-green-500/30 text-green-300", SHORT: "bg-red-500/30 text-red-300", WATCH: "bg-yellow-500/30 text-yellow-300", HEDGE: "bg-purple-500/30 text-purple-300" };
const CARD_TONE = { gold: { border: "border-yellow-500/30", title: "text-yellow-400" }, green: { border: "border-green-500/30", title: "text-green-400" }, red: { border: "border-red-500/30", title: "text-red-400" }, purple: { border: "border-purple-500/30", title: "text-purple-400" }, blue: { border: "border-blue-500/30", title: "text-blue-400" } };

function pick(r, enKey, zhKey) {
  return r[enKey] && !r[enKey].match(/^[\s-]*$/) ? r[enKey] : r[zhKey];
}

function renderDaily(report, lang) {
  const zh = lang === "zh";
  const meta = report.meta || {};
  const t = (k) => (zh ? report[k + "Zh"] : report[k + "En"]) || report[k] || "";
  const title = t("title") || (zh ? "Atlas 每日参考" : "Atlas Daily Reference");
  const dateTitle = zh ? (meta.dateZh || "") : (meta.dateEn || "");

  let html = '<!DOCTYPE html>\n<html lang="' + (zh ? "zh-CN" : "en") + '">\n<head>\n' + headHtml(title) + "\n</head>\n";
  html += '<body class="min-h-screen" style="background-color:#030712;color:#f9fafb;">\n';
  html += navbar(lang);
  html += '<main class="max-w-5xl mx-auto px-4 py-8 relative">\n';

  // Ticker bar
  if (report.ticker && report.ticker.length) {
    html += '<div class="card-gradient rounded-xl p-4 mb-6 border border-white/10">\n<div class="flex flex-wrap gap-3 text-sm">\n';
    for (const tk of report.ticker) {
      const up = tk.up !== false;
      const cls = up ? "text-green-400" : "text-red-400";
      html += '<div class="flex items-center gap-2"><span class="text-slate-400">' + esc(tk.symbol) + '</span> <span class="text-white font-bold">' + esc(tk.price) + '</span> <span class="' + cls + '">' + esc(tk.chg) + '</span></div>\n';
    }
    html += "</div>\n</div>\n";
  }

  // Title + source
  html += '<div class="mb-6">\n<h1 class="text-3xl font-black text-white mb-2">' + (zh ? "☀️ " : "☀️ ") + esc(title) + (dateTitle ? " · " + esc(dateTitle) : "") + '</h1>\n';
  if (meta.fetchedAt) html += '<p class="text-slate-400 text-sm">' + esc(report.sourceLine || "") + ' · ' + (zh ? "生成时间 " : "Generated ") + esc(meta.fetchedAt) + "</p>\n";
  html += "</div>\n";

  // Red alerts
  if (report.redAlerts && report.redAlerts.length) {
    html += '<div class="card-red rounded-xl p-5 mb-6 border border-red-500/40">\n<h2 class="text-xl font-bold text-red-400 mb-3">🚨 ' + (zh ? "红色警报" : "Red Alerts") + "</h2>\n<div class=\"space-y-3\">\n";
    for (const a of report.redAlerts) {
      const tone = TONE_TEXT[a.tone] || "text-yellow-300";
      const bg = TONE_BG[a.tone] || "bg-yellow-500/20";
      html += '<div class="flex gap-3"><span class="tag ' + bg + " " + tone + ' text-xs shrink-0">' + esc(a.tag) + '</span><div><p class="text-white font-semibold">' + esc(a.title) + '</p><p class="text-slate-400 text-sm mt-1">' + esc(a.body) + '</p><p class="text-slate-500 text-xs mt-1">' + esc(a.source || "") + "</p></div></div>\n";
    }
    html += "</div>\n</div>\n";
  }

  // Part 1: events
  html += '<div class="section-divider"></div>\n<h2 class="text-2xl font-black text-white mb-4 flex items-center gap-2">📰 ' + (zh ? "第一部分 · 全球大事记" : "Part 1 · Global Events") + '</h2>\n<div class="space-y-3">\n';
  (report.events || []).forEach((e, i) => {
    html += '<div class="card-gradient rounded-xl p-4 border border-white/10"><div class="flex items-start gap-3"><span class="text-2xl font-black text-green-500/40 shrink-0">' + String(i + 1).padStart(2, "0") + '</span><div><h3 class="font-bold text-white">' + esc(e.title) + '</h3><p class="text-slate-400 text-sm mt-1">' + esc(e.body) + '</p><p class="text-slate-500 text-xs mt-1">' + esc(e.source || "") + "</p></div></div></div>\n";
  });
  html += "</div>\n";

  // Part 2: sentiment
  if (report.sentiment) {
    const st = report.sentiment;
    html += '<div class="section-divider"></div>\n<h2 class="text-2xl font-black text-white mb-4 flex items-center gap-2">🌡️ ' + (zh ? "第二部分 · 社交舆情温度计" : "Part 2 · Social Sentiment") + '</h2>\n';
    html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">\n';
    for (const p of st.platforms || []) {
      const color = p.score >= 60 ? "#22c55e" : p.score >= 40 ? "#eab308" : "#ef4444";
      html += '<div class="card-gradient rounded-xl p-4 border border-white/10"><h3 class="font-bold text-white mb-2">' + esc(p.name) + '</h3><div class="text-3xl font-black mb-1">' + esc(String(p.score)) + '<span class="text-lg text-slate-400">/100</span></div><div class="progress-bar mb-2"><div class="progress-fill" style="width:' + esc(String(p.score)) + "%;background:" + color + ';"></div></div><p class="text-slate-400 text-xs">' + (zh ? "热度：" : "Heat: ") + esc(p.label) + '</p><ul class="space-y-1 mt-3 text-xs text-slate-400">';
      for (const pt of p.points || []) html += "<li>• " + esc(pt) + "</li>";
      html += "</ul></div>\n";
    }
    html += "</div>\n";
    html += '<div class="card-gradient rounded-xl p-4 border border-white/10 mb-4"><h3 class="font-bold text-white mb-2">📊 ' + (zh ? "散户 vs 机构分歧" : "Retail vs Institutional") + '</h3><div class="grid grid-cols-2 gap-4"><div><p class="text-green-400 font-semibold text-sm mb-1">' + (zh ? "散户观点" : "Retail") + '</p><p class="text-slate-400 text-xs">' + esc(st.retail || "") + '</p></div><div><p class="text-orange-400 font-semibold text-sm mb-1">' + (zh ? "机构观点" : "Institutional") + '</p><p class="text-slate-400 text-xs">' + esc(st.institutional || "") + "</p></div></div></div>\n";
    if (st.hotWords && st.hotWords.length) {
      html += '<div class="card-gradient rounded-xl p-4 border border-white/10"><h3 class="font-bold text-white mb-2">🔑 ' + (zh ? "核心热词" : "Key Terms") + '</h3><div class="flex flex-wrap gap-2">';
      for (const w of st.hotWords) html += '<span class="tag bg-yellow-500/20 text-yellow-300">' + esc(w) + "</span>";
      html += "</div></div>\n";
    }
  }

  // Part 3: radar
  if (report.radar) {
    const rd = report.radar;
    html += '<div class="section-divider"></div>\n<h2 class="text-2xl font-black text-white mb-4 flex items-center gap-2">📡 ' + (zh ? "第三部分 · 大师雷达 · 全资产共识扫描" : "Part 3 · Master Radar · Consensus Scan") + '</h2>\n';
    html += '<p class="text-slate-400 text-sm mb-4">' + (zh ? "基于 50 位投资大师智库框架，结合实时市场数据。以下为情报层分析，零交易建议。" : "Framework simulation across 50 master investors with live market data. Intelligence only — no trade advice.") + "</p>\n";
    html += '<div class="overflow-x-auto mb-6"><table class="w-full text-sm border-collapse"><thead><tr class="text-slate-400 border-b border-white/10"><th class="text-left py-2 px-2">' + (zh ? "资产" : "Asset") + '</th><th class="text-right py-2 px-2">' + (zh ? "价格" : "Price") + '</th><th class="text-left py-2 px-2">🐂 ' + (zh ? "多头大师" : "Bulls") + '</th><th class="text-left py-2 px-2">🐻 ' + (zh ? "空头大师" : "Bears") + '</th><th class="text-center py-2 px-2">' + (zh ? "共识强度" : "Consensus") + "</th></tr></thead><tbody>\n";
    for (const r of rd.rows || []) {
      const name = zh ? r.asset : pick(r, "assetEn", "asset");
      const bulls = zh ? (r.bulls || []) : (r.bullsEn || r.bulls || []);
      const bears = zh ? (r.bears || []) : (r.bearsEn || r.bears || []);
      const label = zh ? r.label : (r.labelEn || r.label);
      const chg = r.chgPct1d == null ? "" : '<span class="' + (r.chgPct1d >= 0 ? "text-green-400" : "text-red-400") + ' text-xs">' + (r.chgPct1d > 0 ? "+" : "") + r.chgPct1d.toFixed(2) + "%</span>";
      html += '<tr class="border-b border-white/5"><td class="py-2 px-2 text-white">' + esc(r.icon ? r.icon + " " + name : name) + "</td><td class=\"text-right text-white font-bold\">" + esc(r.price) + " " + chg + "</td><td class=\"text-green-400\">" + esc(bulls.join(", ") || "—") + "</td><td class=\"text-red-400\">" + esc(bears.join(", ") || "—") + '</td><td class="text-center">' + esc(r.strength) + ' <span class="text-xs text-slate-400">' + esc(label) + "</span></td></tr>\n";
    }
    html += "</tbody></table></div>\n";
    if (rd.cards && rd.cards.length) {
      html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">\n';
      for (const c of rd.cards) {
        const tone = CARD_TONE[c.tone] || CARD_TONE.blue;
        html += '<div class="card-gradient rounded-xl p-4 border ' + tone.border + '"><h3 class="font-bold ' + tone.title + ' mb-2">' + esc(c.icon ? c.icon + " " + (zh ? c.asset : pick(c, "assetEn", "asset")) : c.asset) + '</h3><div class="space-y-2 text-sm">';
        for (const v of c.views || []) html += '<p class="text-slate-300"><span class="' + tone.title + ' font-semibold">' + esc(zh ? v.master : (v.masterEn || v.master)) + (zh ? "：" : ": ") + "</span>" + esc(zh ? v.text : (v.textEn || v.text)) + "</p>";
        html += "</div></div>\n";
      }
      html += "</div>\n";
    }
  }

  // Part 4: signals
  if (report.signals && report.signals.length) {
    html += '<div class="section-divider"></div>\n<h2 class="text-2xl font-black text-white mb-4 flex items-center gap-2">⚡ ' + (zh ? "第四部分 · 大师执行台 · 精选信号" : "Part 4 · Master Signal Desk") + '</h2>\n<p class="text-slate-400 text-sm mb-4">' + (zh ? "源自共识矩阵最高共识信号。仅为智库推演，非投资建议。" : "Top-consensus signals from the matrix. Simulation only — not investment advice.") + "</p>\n";
    for (const s of report.signals) {
      const cls = SIDE_CLASS[s.side] || "signal-watch";
      const tagCls = SIDE_TAG[s.side] || SIDE_TAG.WATCH;
      const scoreColor = s.side === "SHORT" ? "text-red-400" : "text-green-400";
      html += '<div class="' + cls + ' rounded-xl p-5 mb-4"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><span class="tag ' + tagCls + ' text-sm font-bold">' + esc(s.side) + '</span><h3 class="font-bold text-white text-lg">' + esc(s.icon ? s.icon + " " + (zh ? s.asset : pick(s, "assetEn", "asset")) : s.asset) + "</h3></div><span class=\"text-2xl font-black " + scoreColor + '\">' + esc(String(s.score)) + '<span class="text-sm text-slate-400">/100</span></span></div>';
      html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">';
      html += '<div><span class="text-slate-400 text-xs">' + (zh ? "进场区间" : "Entry") + '</span><p class="text-white font-bold">' + esc(s.entry) + "</p></div>";
      html += '<div><span class="text-slate-400 text-xs">' + (zh ? "目标 T1" : "Target T1") + '</span><p class="text-green-400 font-bold">' + esc(s.t1) + "</p></div>";
      html += '<div><span class="text-slate-400 text-xs">' + (zh ? "目标 T2" : "Target T2") + '</span><p class="text-green-400 font-bold">' + esc(s.t2) + "</p></div>";
      html += '<div><span class="text-slate-400 text-xs">' + (zh ? "止损" : "Stop") + '</span><p class="text-red-400 font-bold">' + esc(s.stop) + "</p></div></div>";
      html += '<div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mb-3"><div><span class="text-slate-400">' + (zh ? "周期" : "Horizon") + '</span> <span class="text-white">' + esc(zh ? s.horizon : (s.horizonEn || s.horizon)) + "</span></div><div><span class=\"text-slate-400\">" + (zh ? "大师归因" : "Attribution") + '</span> <span class="text-white">' + esc(zh ? s.masters : (s.mastersEn || s.masters)) + '</span></div><div><span class="text-slate-400">' + (zh ? "共识" : "Consensus") + '</span> <span class="text-green-400">' + esc(zh ? s.consensus : (s.consensusEn || s.consensus)) + "</span></div></div>";
      html += '<div class="space-y-2 text-sm"><p class="text-slate-300"><span class="text-green-400 font-semibold">🧠 ' + (zh ? "逻辑链：" : "Logic: ") + "</span>" + esc(zh ? s.logic : (s.logicEn || s.logic)) + "</p>";
      if (s.debate || s.debateEn) html += '<p class="text-slate-300"><span class="text-orange-400 font-semibold">⚡ ' + (zh ? "分歧看点：" : "Debate: ") + "</span>" + esc(zh ? s.debate : (s.debateEn || s.debate)) + "</p>";
      if (s.trigger || s.triggerEn) html += '<p class="text-slate-300"><span class="text-blue-400 font-semibold">🎯 ' + (zh ? "触发条件：" : "Trigger: ") + "</span>" + esc(zh ? s.trigger : (s.triggerEn || s.trigger)) + "</p></div></div>\n";
    }
    if (report.allocation && report.allocation.length) {
      html += '<div class="card-gradient rounded-xl p-4 border border-white/10 mb-6"><h3 class="font-bold text-white mb-2">💼 ' + (zh ? "持仓建议汇总" : "Position Summary") + '</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">';
      for (const a of report.allocation) {
        const cls2 = a.label === "尾部对冲" ? "bg-purple-500/20 text-purple-300" : a.label === "现金" ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-300";
        html += '<div class="flex items-center gap-2"><span class="tag ' + cls2 + '">' + esc(a.label) + '</span><span class="text-white font-bold">' + esc(a.pct) + '</span><span class="text-slate-400 text-xs">' + esc(a.note) + "</span></div>";
      }
      html += "</div></div>\n";
    }
  }

  // Part 5: calendar + scenarios + judgment
  html += '<div class="section-divider"></div>\n<h2 class="text-2xl font-black text-white mb-4 flex items-center gap-2">🔮 ' + (zh ? "第五部分 · 前瞻推演 · 数据日历" : "Part 5 · Scenarios & Calendar") + "</h2>\n";
  if (report.calendar && report.calendar.length) {
    html += '<div class="card-gradient rounded-xl p-4 border border-white/10 mb-6"><h3 class="font-bold text-white mb-3">📅 ' + (zh ? "本周关键事件日历" : "Key Events This Week") + '</h3><table class="w-full text-sm"><thead><tr class="text-slate-400 border-b border-white/10"><th class="text-left py-2 px-2">' + (zh ? "日期" : "Date") + '</th><th class="text-left py-2 px-2">' + (zh ? "事件" : "Event") + '</th><th class="text-left py-2 px-2">' + (zh ? "时间" : "Time") + '</th><th class="text-left py-2 px-2">' + (zh ? "影响" : "Impact") + "</th></tr></thead><tbody>";
    for (const c of report.calendar) {
      const impactCls = c.impact === "极高" ? "bg-red-500/20 text-red-300" : c.impact === "高" ? "bg-orange-500/20 text-orange-300" : "bg-yellow-500/20 text-yellow-300";
      html += '<tr class="border-b border-white/5"><td class="py-2 px-2 text-white">' + esc(c.date) + '</td><td class="text-slate-300">' + esc(c.events) + '</td><td class="text-slate-400">' + esc(c.time) + '</td><td><span class="tag ' + impactCls + '">' + esc(c.impact) + "</span></td></tr>\n";
    }
    html += "</tbody></table></div>\n";
  }
  if (report.scenarios) {
    const sc = report.scenarios;
    html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">';
    html += '<div class="card-green rounded-xl p-4 border border-green-500/30"><div class="flex items-center justify-between mb-2"><h3 class="font-bold text-green-400">🐂 ' + (zh ? "牛市场景" : "Bull") + '</h3><span class="scenario-badge bg-green-500/20 text-green-300">' + (zh ? "概率 " : "Prob ") + esc(sc.bull.prob) + '</span></div><p class="text-slate-300 text-sm">' + esc(sc.bull.text) + "</p></div>";
    html += '<div class="card-blue rounded-xl p-4 border border-blue-500/30"><div class="flex items-center justify-between mb-2"><h3 class="font-bold text-blue-400">📊 ' + (zh ? "基准场景" : "Base") + '</h3><span class="scenario-badge bg-blue-500/20 text-blue-300">' + (zh ? "概率 " : "Prob ") + esc(sc.base.prob) + '</span></div><p class="text-slate-300 text-sm">' + esc(sc.base.text) + "</p></div>";
    html += '<div class="card-red rounded-xl p-4 border border-red-500/30"><div class="flex items-center justify-between mb-2"><h3 class="font-bold text-red-400">🐻 ' + (zh ? "熊市场景" : "Bear") + '</h3><span class="scenario-badge bg-red-500/20 text-red-300">' + (zh ? "概率 " : "Prob ") + esc(sc.bear.prob) + '</span></div><p class="text-slate-300 text-sm">' + esc(sc.bear.text) + "</p></div></div>\n";
  }
  if (report.judgment) {
    const jd = report.judgment;
    html += '<div class="card-gradient rounded-xl p-5 border border-white/10 mb-6"><h3 class="font-bold text-white text-lg mb-3">⚖️ ' + (zh ? "核心判断" : "Core Judgment") + "</h3><div class=\"space-y-2 text-sm text-slate-300\">";
    for (const p of jd.paras || []) html += "<p>" + esc(p) + "</p>";
    if (jd.coreLong) html += '<p><span class="text-green-400 font-semibold">' + (zh ? "核心做多：" : "Core Long: ") + "</span>" + esc(jd.coreLong) + "</p>";
    if (jd.coreShort) html += '<p><span class="text-red-400 font-semibold">' + (zh ? "战术做空：" : "Tactical Short: ") + "</span>" + esc(jd.coreShort) + "</p>";
    if (jd.hedge) html += '<p><span class="text-orange-400 font-semibold">' + (zh ? "风险对冲：" : "Hedge: ") + "</span>" + esc(jd.hedge) + "</p>";
    if (jd.cash) html += '<p><span class="text-blue-400 font-semibold">' + (zh ? "现金配置：" : "Cash: ") + "</span>" + esc(jd.cash) + "</p>";
    html += "</div></div>\n";
  }

  // Disclaimer footer
  html += '<div class="text-center text-slate-500 text-xs py-4 border-t border-white/5">\n';
  html += "<p>⚠️ " + (zh
    ? "本报告由 AI 引擎基于公开市场数据与新闻源自动生成；大师视角来自 50 位投资大师智库框架模拟，非本人真实观点。仅为智库推演，不构成投资建议。投资有风险，入市需谨慎。"
    : "This report is auto-generated by an AI engine from public market data and news feeds. Master perspectives are framework simulations, not the masters' actual views. Intelligence only — not investment advice.") + "</p>\n";
  html += '<p class="mt-2">' + esc(config.site.title) + " · " + esc(dateTitle) + ' · <a href="/index.html" class="text-green-400 hover:text-green-300">Home</a> · <a href="/archive.html" class="text-green-400 hover:text-green-300">Archive</a></p>\n';
  html += "</div>\n</main>\n</body>\n</html>\n";
  return html;
}

// 语言跳转 stub（复刻原站 /MMDDYYYY.html → -zh / -en）
function renderStub(dateISO, kind) {
  const base = kind === "weekly" ? "weekly-" + dateISO.replace(/-/g, "") : dateISO.replace(/-/g, "");
  const zhUrl = base + "-zh.html";
  const enUrl = base + "-en.html";
  const label = kind === "weekly" ? "Weekly Review" : kind === "evening" ? "Evening Brief" : "Morning Brief";
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + esc(config.site.title + " — " + label) + "</title>\n<script>(function(){var lang=(navigator.language||'en').toLowerCase();var t=lang.indexOf('zh')===0?'" + zhUrl + "':'" + enUrl + "';window.location.replace(t);})();</script>\n<meta http-equiv=\"refresh\" content=\"0; url=" + enUrl + '\">\n</head>\n<body style="background:#0a0a0f;color:#e2e8f0;text-align:center;padding-top:20vh;font-family:sans-serif;"><p>Redirecting... <a href="' + enUrl + '">English</a> | <a href="' + zhUrl + '">中文</a></p></body>\n</html>\n';
}

// 首页
function renderIndex(manifest, lang) {
  const zh = lang === "zh";
  const b = brand();
  const reports = (manifest.reports || []).slice(0, config.publish.indexRecentCount);
  const kindLabel = { daily: zh ? "🌅 晨报" : "🌅 Morning", evening: zh ? "🌙 晚报" : "🌙 Evening", weekly: zh ? "📊 周报" : "📊 Weekly" };
  const kindBorder = { daily: "border-green-500/60 hover:border-green-400", evening: "border-yellow-500/60 hover:border-yellow-400", weekly: "border-indigo-500/60 hover:border-indigo-400" };
  const kindText = { daily: "hover:text-green-300", evening: "hover:text-yellow-300", weekly: "hover:text-indigo-300" };
  const kindBg = { daily: "bg-green-500/20 text-green-300", evening: "bg-yellow-500/20 text-yellow-300", weekly: "bg-indigo-500/20 text-indigo-300" };

  let html = '<!DOCTYPE html>\n<html lang="' + (zh ? "zh" : "en") + '" class="scroll-smooth">\n<head>\n' + headHtml(config.site.title) + '\n<meta name="keywords" content="trading, alpha, signals, geopolitical, macro, master traders">\n<meta name="description" content="' + esc(config.site.description) + '">\n</head>\n';
  html += '<body class="min-h-screen flex flex-col antialiased selection:bg-green-500/30">\n' + navbar(lang) + "\n";
  html += '<main class="flex-grow hero-gradient relative">\n<div class="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">\n';
  html += '<div class="text-center max-w-3xl mx-auto mb-20"><h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"><span>' + (zh ? "每天早上，<br>" : "Every morning,<br>") + '</span><span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">' + (zh ? "帮你省下 2 小时研究时间。" : "save yourself 2 hours of research.") + '</span></h1><p class="text-xl text-gray-400 font-medium leading-relaxed">' + (zh ? "不要淹没在噪音中。我们用 50 位投资大师的框架，为你提取出每天开盘前真正值得看的 3 件事。" : "Not noise — signal. We distill the 3 things that actually matter before the open, through the frameworks of 50 master investors.") + "</p></div>\n";
  html += '<div class="max-w-xl mx-auto"><div class="mb-4 space-y-3">\n';
  for (const r of reports) {
    const kb = kindBorder[r.kind] || "border-white/10";
    const kt = kindText[r.kind] || "hover:text-white";
    const kbg = kindBg[r.kind] || "bg-white/10 text-gray-300";
    const title = zh ? (r.titleZh || "") : (r.titleEn || r.titleZh || "");
    const tags = zh ? (r.tagsZh || "") : (r.tagsEn || r.tagsZh || "");
    const link = r.links && r.links.zh ? r.links.zh : r.file;
    html += '<a href="/' + esc(link) + '" class="block card rounded-xl p-4 border ' + kb + ' transition-all group" style="border-width:2px;"><div class="flex items-center gap-2 mb-2"><span class="tag ' + kbg + ' text-xs">' + esc(kindLabel[r.kind] || "") + " · " + esc(tags) + '</span></div><h3 class="font-bold text-white text-sm group-hover:' + kt.replace("hover:", "group-") + ' transition-colors">' + esc(title) + "</h3>";
    const zhLink = r.links && r.links.zh ? r.links.zh : "";
    const enLink = r.links && r.links.en ? r.links.en : "";
    if (zhLink && enLink) {
      html += '<div class="flex gap-2 mt-2"><a href="/' + esc(zhLink) + '" class="text-xs text-slate-400 hover:text-green-300">中文</a><a href="/' + esc(enLink) + '" class="text-xs text-slate-400 hover:text-green-300">English</a></div>';
    }
    html += "</a>\n";
  }
  html += "</div></div>\n";
  html += '<div class="text-center mt-12"><a href="/archive.html" class="btn-secondary text-white font-bold px-6 py-3 rounded-xl">' + (zh ? "查看全部历史报告 →" : "Browse the archive →") + "</a></div>\n";
  html += "</div>\n</main>\n";
  html += '<footer class="border-t border-white/5 py-6 text-center text-slate-500 text-sm">' + esc(config.site.title) + " · " + (zh ? "AI 生成 · 智库推演 · 非投资建议" : "AI-generated · simulation · not investment advice") + "</footer>\n";
  html += "</body>\n</html>\n";
  return html;
}

// 存档页
function renderArchive(manifest, lang) {
  const zh = lang === "zh";
  const kindLabel = { daily: zh ? "🔴 晨报" : "🔴 Morning", evening: zh ? "🌙 晚报" : "🌙 Evening", weekly: zh ? "📊 周报" : "📊 Weekly" };
  const kindCls = { daily: "text-green-300 bg-green-500/10 border-green-500/30 hover:bg-green-500/30", evening: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/30", weekly: "text-purple-300 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/30" };
  const groups = {};
  for (const r of manifest.reports || []) {
    const mon = r.dateISO.slice(0, 7);
    (groups[mon] = groups[mon] || []).push(r);
  }
  let html = '<!DOCTYPE html>\n<html lang="' + (zh ? "zh" : "en") + '">\n<head>\n' + headHtml(config.site.title + " | " + (zh ? "历史报告归档" : "Archive")) + "\n</head>\n";
  html += '<body class="min-h-screen flex flex-col antialiased">\n' + navbar(lang) + "\n";
  html += '<main class="flex-grow hero-gradient relative"><div class="max-w-7xl mx-auto px-6 pt-16 pb-32 relative z-10">\n';
  html += '<div class="text-center mb-16"><h1 class="text-4xl md:text-5xl font-black mb-4 tracking-tight">📚 <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">' + (zh ? "历史报告归档" : "Report Archive") + '</span></h1><p class="text-lg text-gray-400">' + (zh ? "按日期排列 · 每日晨报 + 晚报 + 周报" : "Sorted by date · daily morning + evening + weekly") + "</p></div>\n";
  html += '<div class="space-y-4">\n';
  for (const mon of Object.keys(groups).sort().reverse()) {
    const [y, m] = mon.split("-");
    html += '<div class="card-gradient rounded-2xl p-5 md:p-6 border border-white/10"><div class="flex flex-col gap-4"><div class="md:w-44 shrink-0"><span class="text-lg font-bold text-white">' + esc(y + "-" + m) + "</span></div><div class=\"flex flex-wrap gap-3 flex-1\">";
    for (const r of groups[mon]) {
      const zhLink = r.links && r.links.zh ? r.links.zh : "";
      const enLink = r.links && r.links.en ? r.links.en : "";
      const title = zh ? (r.titleZh || "") : (r.titleEn || r.titleZh || "");
      html += '<div class="flex flex-col gap-2 w-full md:w-auto"><p class="text-xs text-slate-500">' + esc(r.dateISO) + ' <span class="text-slate-400">·</span> <span class="text-slate-400">' + esc(r.weekdayZh || "") + "</span></p>";
      html += '<div class="flex flex-wrap gap-2">';
      if (zhLink) html += '<a href="/' + esc(zhLink) + '" target="_blank" class="inline-flex items-center gap-2 text-sm font-bold ' + (kindCls[r.kind] || "") + ' px-4 py-2.5 rounded-xl border transition-all">' + esc(kindLabel[r.kind] || "") + "</a>";
      if (enLink && enLink !== zhLink) html += '<a href="/' + esc(enLink) + '" target="_blank" class="inline-flex items-center gap-2 text-sm font-bold text-blue-300 bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all">📘 EN</a>';
      html += "</div>";
      if (title) html += '<p class="text-sm text-slate-400">' + esc(title) + "</p>";
      html += "</div>";
    }
    html += "</div></div></div>\n";
  }
  html += "</div></div></main></body></html>\n";
  return html;
}

module.exports = { renderDaily, renderStub, renderIndex, renderArchive, esc };
