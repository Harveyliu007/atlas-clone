// ============================================================
// LLM 提示词引擎：将 50 位大师框架注入系统提示词，驱动报告生成
// ============================================================
const masters = require("./masters");

const SCHEMA_ZH = [
  "titleZh: 报告主标题（15-30字）",
  "tagsZh: 一行英文大写摘要标签（如 MORNING BRIEF · Aug 26 · NVDA EARNINGS · DEBASEMENT TRADE）",
  "titleEn / tagsEn: 英文标题与标签",
  "ticker: [{symbol,name,price,chg,up}] 行情条 8-10 项（含恐惧贪婪指数）",
  "redAlerts: [{tone(yellow|purple|red|orange|green|blue|pink),tag,title,body,source}] 3条",
  "events: [{title,body,source}] 全球大事记 10 条，每条 60-120 字，必须带来源",
  "sentiment: {platforms:[{name,score,label,points:[3条]}],retail,institutional,hotWords:[6-8个]}",
  "radar: {rows:[{asset,price,bulls:[大师名],bears:[大师名],strength,label}], cards:[{asset,icon,tone,views:[{master,text}]}]}（15 个资产：标普500/纳指100/道指/日经/恒生/上证/10Y美债/美元指数/欧元/黄金/WTI/铜/BTC/ETH/VIX）",
  "signals: [{side(LONG|SHORT|WATCH|HEDGE),asset,icon,score,entry,t1,t2,stop,horizon,masters,consensus,logic,debate,trigger}] 2-4 个",
  "allocation: [{label,pct,note}] 3 项（核心多仓/尾部对冲/现金）",
  "calendar: [{date,events,time,impact(极高|高|中)}] 本周事件 4-6 行",
  "scenarios: {bull:{prob,text},base:{prob,text},bear:{prob,text}} 概率总和 100%",
  "judgment: {paras:[2-4段],coreLong,coreShort,hedge,cash}",
].join("\n");

const SCHEMA_EN = SCHEMA_ZH; // 结构一致，内容用英文

function mastersBrief(lang) {
  return masters.map((m) => lang === "zh"
    ? "- " + m.zh + "（" + m.style + "）：" + m.framework
    : "- " + m.en + " (" + m.enStyle || m.style + "): " + m.framework).join("\n");
}

function buildSystemPrompt(lang, kind) {
  const zh = lang === "zh";
  if (zh) {
    return [
      "你是 ATLAS 智库首席分析师，负责生成《Atlas 每日参考》市场情报报告（" + kind + "）。",
      "核心方法论：用 50 位投资大师的投资框架做全资产共识扫描。重要：这是框架模拟推演，不是大师本人观点，报告结尾必须注明。",
      "写作规范：",
      "1. 行情数据以用户提供的 JSON 为准，不得改动数字；新闻事实必须标注来源，不要编造未提供的具体数字。",
      "2. 红色警报 3 条；全球大事记 10 条；社交舆情分数 0-100 与情绪一致。",
      "3. 大师雷达 15 个资产的多空归因必须取自下方大师库；共识强度（🔒高度共识/✅偏多/⚡分化/❌偏空）与多空人数比例自洽。",
      "4. 信号台 2-4 个信号：必须含进场区间、T1/T2、止损、周期、大师归因、逻辑链、分歧看点、触发条件；方向与雷达共识一致；给出 0-100 确信度。",
      "5. 三场景概率为整数且总和 100%，基准场景概率最大；日历事件只写本周真实事件。",
      "6. 语言风格：克制、专业、信息密度高，像顶级宏观交易台晨会纪要。",
      "7. 只输出一个 JSON 对象（schema 见用户消息），不要输出其他内容。",
      "",
      "50 位投资大师框架库（引用时使用中文名）：",
      mastersBrief("zh"),
    ].join("\n");
  }
  return [
    "You are the chief analyst of the ATLAS intelligence desk, producing the Atlas Daily Reference market briefing (" + kind + ").",
    "Methodology: run a cross-asset consensus scan through the frameworks of 50 master investors. IMPORTANT: this is a framework simulation, not the masters' actual views — the report must state this.",
    "Rules:",
    "1. Use the provided market JSON verbatim for prices; attribute every news fact to a source; never invent numbers.",
    "2. Exactly 3 red alerts and 10 global events; sentiment scores 0-100 consistent with tone.",
    "3. The master radar covers 15 assets; bullish/bearish attributions must come from the master list below; consensus strength consistent with bull/bear counts.",
    "4. 2-4 signals each with entry, T1/T2 targets, stop, horizon, master attribution, logic chain, debate points, trigger conditions; 0-100 conviction score.",
    "5. Scenario probabilities are integers summing to 100; base case is the largest; calendar lists real events this week.",
    "6. Tone: restrained, professional, high information density, like a top macro trading desk morning note.",
    "7. Output exactly one JSON object matching the schema in the user message.",
    "",
    "Master investor library:",
    mastersBrief("en"),
  ].join("\n");
}

function buildUserPrompt(data, news, lang, kind, dateInfo) {
  const payload = JSON.stringify({
    kind,
    date: dateInfo,
    quotes: data.quotes,
    fearGreed: data.fearGreed,
    news: news.slice(0, 40).map((n) => ({ title: n.title, link: n.link, pubDate: n.pubDate, source: n.source, snippet: n.snippet })),
  }, null, 1);
  const schema = lang === "zh" ? SCHEMA_ZH : SCHEMA_EN;
  return (lang === "zh"
    ? "请基于以下实时数据生成今日报告 JSON。所有行情数字以 quotes 为准；新闻事件从 news 中提炼。\nJSON schema:\n" + schema + "\n\n数据：\n"
    : "Generate today's report JSON from the data below. Prices must match quotes; events must come from news.\nJSON schema:\n" + schema + "\n\nData:\n") + payload;
}

module.exports = { buildSystemPrompt, buildUserPrompt };
