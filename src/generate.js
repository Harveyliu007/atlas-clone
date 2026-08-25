// ============================================================
// Atlas 克隆 · 生成器入口
// 用法：
//   node src/generate.js [daily|evening|weekly] [--mock] [--lang zh|en|both] [--date 2026-08-26]
//   --mock : 无 LLM key 时用启发式共识引擎生成（zh 为主）
//   --lang : 生成语言（LLM 模式支持 both；mock 模式固定 zh）
// ============================================================
const config = require("../config");
const { fetchQuotes } = require("./fetchMarketData");
const { fetchNews } = require("./fetchNews");
const heuristic = require("./heuristic");
const llm = require("./llm");
const render = require("./render");
const publish = require("./publish");

function parseArgs(argv) {
  const args = { kind: "daily", mock: false, lang: "both", date: null, dataFile: null, newsFile: null, newsFileEn: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (["daily", "evening", "weekly"].includes(a)) args.kind = a;
    else if (a === "--mock") args.mock = true;
    else if (a === "--lang") args.lang = argv[++i] || "both";
    else if (a === "--date") args.date = argv[++i] || null;
    else if (a === "--data-file") args.dataFile = argv[++i] || null;
    else if (a === "--news-file") args.newsFile = argv[++i] || null;
    else if (a === "--news-file-en") args.newsFileEn = argv[++i] || null;
  }
  return args;
}

function loadJson(file) {
  const fs = require("fs");
  const path = require("path");
  const p = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function shanghaiToday() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.site.timezone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  return fmt.format(new Date());
}

async function main() {
  const args = parseArgs(process.argv);
  const dateISO = args.date || shanghaiToday();
  console.log("== Atlas 生成器 ==");
  console.log("kind:", args.kind, "| date:", dateISO, "| lang:", args.lang, "| mock:", args.mock);

  // 1. 数据采集（支持 --data-file/--news-file 注入，便于离线构建与复现）
  console.log("[1/5] 采集行情与新闻 ...");
  let data, newsZh;
  if (args.dataFile) {
    console.log("  使用注入行情数据:", args.dataFile);
    data = loadJson(args.dataFile);
  } else {
    data = await fetchQuotes();
  }
  if (args.newsFile) {
    newsZh = loadJson(args.newsFile);
    console.log("  使用注入新闻数据:", args.newsFile);
  } else {
    newsZh = await fetchNews("zh");
  }
  let newsEn = newsZh;
  if (!args.mock && args.lang !== "zh") {
    if (args.newsFileEn) newsEn = loadJson(args.newsFileEn);
    else { try { newsEn = await fetchNews("en"); } catch (e) { console.warn("[news] en 回退 zh"); } }
  }
  console.log("  行情:", Object.keys(data.quotes || {}).length, "项 | 新闻:", newsZh.length, "条 | 恐慌贪婪:", data.fearGreed ? data.fearGreed.value + " " + data.fearGreed.label : "n/a");

  // 2. 分析引擎
  let reportZh, reportEn = null;
  if (args.mock || !config.llm.enabled || !config.llm.apiKey) {
    console.log("[2/5] 启发式共识引擎（mock）...");
    reportZh = heuristic.buildReport(data, newsZh, { kind: args.kind });
    if (!args.mock && config.llm.enabled && !config.llm.apiKey) {
      console.warn("  ⚠ 未设置 LLM_API_KEY，已自动回退 mock 模式。设置 ATLAS_LLM_API_KEY 后可用 LLM 深度生成。");
    }
  } else {
    console.log("[2/5] LLM 引擎生成 zh ...");
    reportZh = await llm.generateReport(data, newsZh, args.kind, "zh", config.llm);
    if (args.lang !== "zh") {
      console.log("[2/5] LLM 引擎生成 en ...");
      reportEn = await llm.generateReport(data, newsEn, args.kind, "en", config.llm);
    }
  }

  // 3. 注入日期元信息
  const labels = publish.dateLabels(dateISO);
  const meta = { dateISO, kind: args.kind, fetchedAt: new Date().toLocaleString("zh-CN", { hour12: false }), ...labels };
  reportZh.meta = meta;
  if (reportEn) reportEn.meta = meta;

  // 4. 渲染页面
  console.log("[3/5] 渲染 HTML ...");
  const pages = { zh: render.renderDaily(reportZh, "zh"), en: null, stub: null };
  if (reportEn) pages.en = render.renderDaily(reportEn, "en");
  else if (args.lang !== "zh" && args.mock) pages.en = null;
  const files = publish.reportFiles(dateISO, args.kind);
  if (files.stub) pages.stub = render.renderStub(dateISO, args.kind);

  // 5. 发布 + 重建索引
  const written = publish.publishReport(dateISO, args.kind, reportZh, pages);
  console.log("[4/5] 已写入:", written.join(", ") || "(无页面)");
  console.log("[5/5] 重建 index / archive ...");
  const manifest = publish.rebuildIndexAndArchive();
  console.log("== 完成 ==");
  console.log("首页: public/index.html | 存档: public/archive.html | 报告总数:", manifest.reports.length);
  console.log("输出目录:", publish.OUT);
}

main().catch((e) => {
  console.error("[fatal]", e && e.stack ? e.stack : e);
  process.exit(1);
});
