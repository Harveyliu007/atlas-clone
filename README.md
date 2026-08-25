# Atlas Clone — AI 每日宏观交易简报生成器

对 atlasworldlive.com 的**功能级克隆**：相同的页面结构（晨报/晚报/周报 · 中英双语 · 语言跳转 stub · 首页/存档），
相同的 5 部分报告模板（行情条 → 红色警报 → 全球大事记 → 社交舆情 → 大师雷达 → 大师信号台 → 场景推演），
以及相同的核心方法论——**50 位投资大师框架的全资产共识扫描**。

> ⚠️ 本项目的「大师观点」与「交易信号」均为 **AI 框架模拟推演**，并非大师本人真实观点，也不构成投资建议。
> 仅供学习与个人研究。正式对外部署前请修改 config.js 中的品牌名与文案（避免商标与版权争议）。

## 与原站的对照

| 原站 | 本项目 |
|---|---|
| Vercel 静态托管 | 同（public/ 可直接部署 Vercel） |
| Polygon.io 行情 | Yahoo Finance + FRED + CoinGecko + gold-api（全部免费无 key，多级容错） |
| Google News RSS + CNBC/WSJ 摘要 | 华尔街见闻 API（中文）+ Bing News RSS + CNBC RSS |
| 50 位投资大师「框架模拟」 | 同：src/masters.js 内置 50 位大师（巴菲特/达利欧/索罗斯/德鲁肯米勒/塔勒布…） |
| 每日晨报/晚报/周报 + 历史归档 | 同：MMDDYYYY-zh.html、MMDDYYYY-en.html、MMDDYYYY-evening.html、weekly-MMDDYYYY-*.html |
| 深色 Tailwind UI | 同（Tailwind CDN + 复刻配色与大字体适老化样式） |

## 快速开始

要求：Node.js ≥ 18（内置 fetch，零 npm 依赖）。

### 方式 A：无 API key（启发式共识引擎）

```bash
node src/generate.js daily --mock
```

- 采集真实行情与新闻（Yahoo/FRED/华尔街见闻…）
- 50 位大师立场由「静态倾向 + 实时动量/均线/RSI 规则」确定性计算，生成完整报告页并更新首页/存档
- 输出到 public/，可本地预览：npx http-server public

### 方式 B：LLM 深度生成（推荐，质量接近原站）

```bash
# 设置 DeepSeek（或任意 OpenAI 兼容接口）API key
set ATLAS_LLM_API_KEY=sk-xxxx        # Windows
export ATLAS_LLM_API_KEY=sk-xxxx     # macOS / Linux

node src/generate.js daily            # 晨报（中英双语）
node src/generate.js evening          # 晚报
node src/generate.js weekly           # 周报
node src/generate.js daily --lang zh  # 仅中文
```

LLM 端点为 OpenAI 兼容协议，默认 https://api.deepseek.com/chat/completions（模型 deepseek-chat，性价比高、中文强）。
可在 config.js → llm 中换成 OpenAI / Moonshot / Qwen 等。

### 方式 C：离线 / 复现（数据注入）

网络受限环境可预先抓取数据后注入：

```bash
# 1. 用 curl 抓取原始数据到 raw/（见 tools/from-raw.js 顶部注释）
# 2. 转换
node tools/from-raw.js          # → data.json / news-zh.json / news-en.json
# 3. 生成
node src/generate.js daily --mock --date 2026-08-26 --data-file data.json --news-file news-zh.json
```

## 报告结构（与原站一致）

1. **行情条** — SPY/QQQ/DIA/BTC/ETH/黄金/VIX/10Y/WTI/恐惧贪婪
2. **🚨 红色警报** — 当日最重要的 3 件事（带来源）
3. **📰 全球大事记** — 10 条编号新闻摘要（带来源与日期）
4. **🌡️ 社交舆情温度计** — Reddit/X/中文社区热度 + 散户 vs 机构分歧 + 热词
5. **📡 大师雷达** — 15 资产 × 50 大师多空归因共识表 + 大师视角卡片
6. **⚡ 大师执行台** — LONG/SHORT/HEDGE 信号（进场/T1/T2/止损/逻辑链/分歧/触发条件）+ 仓位汇总
7. **🔮 前瞻推演** — 牛/基准/熊三场景概率 + 本周事件日历 + 核心判断

## 目录结构

```
atlas-clone/
├── config.js              # 品牌、LLM、数据源、发布配置
├── src/
│   ├── fetchMarketData.js # 行情：Yahoo→FRED→CoinGecko 多级容错 + 限速重试
│   ├── fetchNews.js       # 新闻：华尔街见闻 + Bing/Google RSS（去重排序）
│   ├── masters.js         # 50 位投资大师框架库（含启发式特质）
│   ├── prompts.js         # LLM 提示词引擎（注入大师库 + JSON schema）
│   ├── heuristic.js       # 无 LLM 的确定性共识引擎（mock 模式）
│   ├── llm.js             # OpenAI 兼容客户端（JSON 模式 + 重试）
│   ├── render.js          # HTML 模板（报告/首页/存档/stub）
│   ├── publish.js         # 发布 + manifest + 首页/存档重建
│   └── generate.js        # CLI 入口
├── tools/
│   ├── from-raw.js        # raw/ 原始数据 → 流水线输入
│   └── build-demo.js      # 旗舰演示：2026-08-26 晨报（真实数据 + 手写分析）
├── raw/                   # curl 抓取的原始数据（可选）
├── public/                # 生成的站点（部署目录）
└── _data/reports.json     # 报告索引 manifest
```

## 部署与自动化

### GitHub Pages + Actions（推荐，全免费、无需额外账号）

项目内置三个工作流（.github/workflows/）：

| 文件 | 任务 | 时间（UTC） | 北京时间 |
|---|---|---|---|
| morning.yml | 晨报生成 + 部署 | 每天 23:00（周一至周五） | 早 7:00 |
| evening.yml | 晚报生成 + 部署 | 每天 21:00（周一至周五） | 早 5:00 |
| weekly.yml | 周报生成 + 部署 | 每周六 22:00 | 周六早 6:00 |

每次运行：采集数据 → 生成报告 → 自动提交 → 部署 GitHub Pages，网站 7×24 在线。

**开通步骤（一次性，约 3 分钟）：**

```bash
# 1. 在 github.com 新建一个公开仓库（如 atlas-clone），不要勾选初始化文件
# 2. 本地推送（把 <你的用户名>/<仓库名> 换成实际值）
cd atlas-clone
git init && git add -A && git commit -m "init: atlas clone"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main

# 3. 仓库 Settings → Pages → Source 选择 "GitHub Actions"
# 4. （可选）Settings → Secrets and variables → Actions → New secret
#    名：ATLAS_LLM_API_KEY  值：你的 DeepSeek API key（不配则自动用免费启发式引擎）
# 5. 仓库 Actions 页面点 "Atlas Morning Brief" → Run workflow 手动触发一次
# 6. 约 2 分钟后访问 https://<你的用户名>.github.io/<仓库名>/
```

### 其他平台

public/ 为纯静态站点，也可部署到 Vercel/Netlify/Cloudflare Pages（`vercel --prod` 等）。

## 数据源与免责声明

- 行情：Yahoo Finance（免费 chart API，需 User-Agent，偶发 429 自动重试）、FRED（圣路易斯联储，日线收盘，滞后一天）、CoinGecko、gold-api、alternative.me（恐惧贪婪指数）
- 新闻：华尔街见闻 API（中文财经快讯）、Bing News RSS、CNBC RSS
- **大师视角为框架模拟**：50 位大师的立场由 AI 根据其公开投资框架推演生成，不代表本人观点
- 报告中的信号、目标价、止损位均为智库推演，**不构成投资建议**；投资有风险，入市需谨慎
