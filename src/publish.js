// ============================================================
// 发布：写入报告页面、维护 manifest、重建首页与存档页
// ============================================================
const fs = require("fs");
const path = require("path");
const config = require("../config");
const render = require("./render");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(ROOT, config.publish.outputDir);
const MANIFEST = path.resolve(ROOT, config.publish.manifestPath);

const WEEKDAYS_ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function mmddyyyy(dateISO) { return dateISO.replace(/-/g, ""); }

function weekday(dateISO, zh) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d)); // 按日历日期计算星期，与时区无关
  if (isNaN(t)) return "";
  return zh ? WEEKDAYS_ZH[t.getUTCDay()] : WEEKDAYS_EN[t.getUTCDay()];
}

function dateLabels(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return {
    dateZh: y + "年" + m + "月" + d + "日",
    weekdayZh: weekday(dateISO, true),
    dateEn: MONTHS_EN[m - 1] + " " + d + ", " + y,
    weekdayEn: weekday(dateISO, false),
  };
}

// 各类报告的文件名规划（复刻原站命名规则）
function reportFiles(dateISO, kind) {
  const mm = mmddyyyy(dateISO);
  if (kind === "evening") return { stub: null, zh: mm + "-evening.html", en: mm + "-evening-en.html" };
  if (kind === "weekly") return { stub: "weekly-" + mm + ".html", zh: "weekly-" + mm + "-zh.html", en: "weekly-" + mm + "-en.html" };
  return { stub: mm + ".html", zh: mm + "-zh.html", en: mm + "-en.html" };
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch (e) {
    return { reports: [] };
  }
}

function saveManifest(m) {
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}

function upsertReport(entry) {
  const m = loadManifest();
  m.reports = m.reports.filter((r) => !(r.dateISO === entry.dateISO && r.kind === entry.kind));
  m.reports.push(entry);
  m.reports.sort((a, b) => (a.dateISO === b.dateISO ? b.kind.localeCompare(a.kind) : b.dateISO < a.dateISO ? 1 : -1));
  saveManifest(m);
  return m;
}

function writeFile(name, content) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), content, "utf8");
}

// 发布一份报告：写入 stub/zh/en，更新 manifest
function publishReport(dateISO, kind, report, pages) {
  const files = reportFiles(dateISO, kind);
  const labels = dateLabels(dateISO);
  const written = [];
  if (files.stub && pages.stub) { writeFile(files.stub, pages.stub); written.push(files.stub); }
  if (files.zh && pages.zh) { writeFile(files.zh, pages.zh); written.push(files.zh); }
  if (files.en && pages.en) { writeFile(files.en, pages.en); written.push(files.en); }
  upsertReport({
    dateISO,
    kind,
    titleZh: report.titleZh || "",
    tagsZh: report.tagsZh || "",
    titleEn: report.titleEn || "",
    tagsEn: report.tagsEn || "",
    weekdayZh: labels.weekdayZh,
    weekdayEn: labels.weekdayEn,
    links: { zh: files.zh, en: files.en },
    file: files.stub || files.zh,
  });
  return written;
}

// 重建首页（zh + en）与存档页
function rebuildIndexAndArchive() {
  const manifest = loadManifest();
  writeFile("index.html", render.renderIndex(manifest, "zh"));
  writeFile("index-en.html", render.renderIndex(manifest, "en"));
  writeFile("archive.html", render.renderArchive(manifest, "zh"));
  return manifest;
}

module.exports = { publishReport, rebuildIndexAndArchive, loadManifest, reportFiles, dateLabels, mmddyyyy, OUT };
