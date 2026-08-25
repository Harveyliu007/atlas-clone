// ============================================================
// 旗舰演示：2026-08-26 晨报（NVDA 财报日）
// 内容由 AI 引擎（本演示中为主笔）依据真实行情与新闻、50 位大师框架撰写；
// 雷达共识表由启发式引擎对真实数据确定性计算。
// 用法：node tools/build-demo.js
// ============================================================
const config = require("../config");
const heuristic = require("../src/heuristic");
const render = require("../src/render");
const publish = require("../src/publish");

const data = require("../data.json");
const newsZh = require("../news-zh.json");

// 盘中实时价（Yahoo/CoinGecko/gold-api 2026-08-25 美盘时段采集，真实数据）
const INTRADAY = {
  "^GSPC": { price: 7669.88, chg: -0.28 },
  "^IXIC": { price: 26112.32, chg: -0.67 },
  "^DJI": { price: 53485.18, chg: 0.27 },
  "^VIX": { price: 15.47, chg: 3.90 },
  "^TNX": { price: 4.643, chg: -0.21 },
  "GC=F": { price: 4696.70, chg: 3.99 },
  "CL=F": { price: 82.15, chg: -3.32 },
  "BTC-USD": { price: 78940, chg: -0.26 },
  "ETH-USD": { price: 2457.67, chg: -0.96 },
};

function overrideRadar(rows) {
  for (const r of rows) {
    const iv = INTRADAY[r.symbol];
    if (iv) {
      r.price = r.symbol === "^TNX" ? iv.price.toFixed(2) + "%" : (iv.price >= 1000 ? "$" + iv.price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "$" + iv.price.toFixed(2));
      r.chgPct1d = iv.chg;
    }
    if (r.symbol === "DX-Y.NYB") { r.asset = "广义美元指数"; r.assetEn = "Broad USD Index"; }
  }
  return rows;
}

const rows = overrideRadar(heuristic.computeRadar(data.quotes));

const zhReport = {
  kind: "daily",
  titleZh: "NVDA 财报审判日 · 「贬值交易」全面回归 · 霍尔木兹航运突破",
  tagsZh: "MORNING BRIEF · Aug 26 · NVDA EARNINGS DAY · DEBASEMENT TRADE · HORMUZ CHANNEL · CANADA TARIFFS",
  titleEn: "NVDA Judgment Day · Debasement Trade Returns · Hormuz Breakthrough",
  tagsEn: "MORNING BRIEF · Aug 26 · NVDA EARNINGS DAY · DEBASEMENT TRADE · HORMUZ CHANNEL",
  ticker: [
    { symbol: "SPY", name: "标普500 ETF", price: "$765.23", chg: "-0.29%", up: false },
    { symbol: "QQQ", name: "纳指100 ETF", price: "$709.79", chg: "-0.47%", up: false },
    { symbol: "DIA", name: "道指 ETF", price: "$534.42", chg: "+0.34%", up: true },
    { symbol: "BTC", name: "比特币", price: "$78,940", chg: "-0.26%", up: false },
    { symbol: "ETH", name: "以太坊", price: "$2,458", chg: "-0.96%", up: false },
    { symbol: "黄金", name: "黄金(期货)", price: "$4,697", chg: "+3.99%", up: true },
    { symbol: "VIX", name: "恐慌指数", price: "15.47", chg: "+3.90%", up: true },
    { symbol: "10Y", name: "10年期美债收益率", price: "4.64%", chg: "-0.21%", up: false },
    { symbol: "WTI", name: "WTI原油", price: "$82.15", chg: "-3.32%", up: false },
    { symbol: "Fear&Greed", name: "恐惧贪婪指数", price: "74", chg: "贪婪", up: true },
  ],
  redAlerts: [
    { tone: "yellow", tag: "贬值交易", title: "「贬值交易」全面回归 — 黄金单日+4%、BTC 剑指 $80K", body: "美国财长贝森特酝酿动用 TGA 回购国债，市场将其解读为债务货币化前奏：黄金期货单日暴涨近 4% 至 $4,697，比特币隔夜一度突破 $80,000。法币贬值对冲资产重新成为市场宠儿。", source: "华尔街见闻 · CNBC · 8月25日" },
    { tone: "purple", tag: "NVDA 财报", title: "NVDA 财报今日盘后 — 期权定价 $2,800 亿市值波动", body: "英伟达连跌 7 天后迎来财报审判日：期权市场定价财报后 $2,800 亿市值波动。华尔街见闻提示英伟达 GPU 金融化争议——「把 GPU 做成房贷证券」；OpenAI 自研 JALAPENO 芯片同步叫板 GB300。", source: "华尔街见闻 · WSJ · Reuters · 8月25日" },
    { tone: "red", tag: "贸易战", title: "美加贸易战全面升级 — 加拿大 $200 亿等额报复、钢铝关税翻倍至 50%", body: "加拿大官宣对美国实施 $200 亿等额报复性关税，钢铝关税翻倍至 50%；特朗普同日威胁将安大略湖更名「美国湖」。北美贸易体系正经历数十年来最剧烈重构。", source: "华尔街见闻 · WSJ · 8月25日" },
  ],
  events: [
    { title: "霍尔木兹航运迎突破 — 伊朗与阿曼拟设临时安全通道", body: "伊朗与阿曼讨论分阶段框架：建立临时联合航运通道、联合扫雷，并就信息共享与航行安全建立机制。消息传出后国际原油跌幅扩大，布油跌破 $90，WTI 盘中跌超 4%。", source: "华尔街见闻 · 8月25日" },
    { title: "贝森特酝酿 TGA「大招」— 市场警告超级通胀风险", body: "美国财长贝森特拟动用约 $9,500 亿 TGA 资金回购国债，被视为变相 QE 前奏。华尔街见闻点评：「真干了就离超级通胀不远了」。该预期直接点燃黄金与加密的贬值交易行情。", source: "华尔街见闻 · 8月25日" },
    { title: "NVDA 财报倒计时 — AI 板块面临年度最大审判", body: "今日盘后英伟达公布财报，期权定价 $2,800 亿市值波动。市场关注点：Blackwell 后续产品节奏、金融工程化收入（租赁/回购协议）的可持续性、以及 OpenAI JALAPENO 等自研芯片的替代威胁。", source: "华尔街见闻 · Barron's · 8月25日" },
    { title: "加拿大宣布 $200 亿等额报复关税，钢铝翻倍至 50%", body: "加拿大政府以牙还牙：对美进口商品加征等额 $200 亿关税，钢铝关税从 25% 翻倍至 50%。特朗普威胁更名安大略湖。ING 策略师警告：作为更开放的小型经济体，加拿大在此轮博弈中损失更大。", source: "华尔街见闻 · WSJ · 8月25日" },
    { title: "苹果发布首款 2nm 芯片 Mac Mini — M6 本地 AI 开发攻势", body: "时隔两年 Mac Mini 更新：搭载 2nm M6 与 M5 Ultra 芯片，主打本地 AI 模型运行与微调。库克交棒前的新品攻势直指「开发者可在 Mac 上跑大模型」场景，与英伟达主导的云端算力叙事形成差异化竞争。", source: "华尔街见闻 · CNBC · 8月25日" },
    { title: "韩股杠杆泡沫教训 — 反弹 25% 后吸引力几何", body: "华尔街见闻深度复盘：韩国 Kospi 慢动作崩盘蒸发 $2.5 万亿后反弹 25%，杠杆泡沫挤出仍未完成。该案例被市场反复引用为 AI 拥挤交易的警示碑——「烧伤押注 AI 繁荣的投资者」。", source: "华尔街见闻 · WSJ · 8月25日" },
    { title: "Anthropic 预计自身 TAM 将超 30 万亿美元", body: "AI 估值叙事继续升温：Anthropic 内部预计其总可寻址市场将超过 30 万亿美元。在高盛合伙人公开警告「少用 AI，会变蠢」的同一周，AI 叙事与现实的裂痕成为财报季最大辩题。", source: "华尔街见闻 · 8月25日" },
    { title: "美股高开谨慎回暖 — 存储概念反弹、美债收益率下行", body: "市场情绪谨慎回暖：美股三大股指高开，SK 海力士涨 3% 带动存储概念反弹；比特币高位回落；美债收益率下行。资金在 NVDA 财报前呈现典型的「卖波动、买确定性」姿态。", source: "华尔街见闻 · 8月25日" },
    { title: "高盛预警：欧洲气价今冬或突破 100 欧元", body: "高盛警告欧洲天然气储量过低，若今冬再现供给扰动，TTF 气价可能重演 2022 年式危机并突破 100 欧元/MWh。能源尾部风险重新进入机构对冲清单。", source: "华尔街见闻 · 8月25日" },
    { title: "中印边界特别代表北京会晤 · 马云连日增持阿里超 6 亿港元", body: "中印边界问题特别代表在北京举行会晤，地缘缓和信号延续。同时马云出手增持阿里巴巴，连日买入超 6 亿港元，被视为对中国资产信心的民间注脚。", source: "华尔街见闻 · 澎湃新闻 · 8月25日" },
  ],
  sentiment: {
    platforms: [
      { name: "Reddit / WSB", score: 74, label: "偏热", points: ["BTC $80K 突破引发 FOMO 追多", "NVDA 财报前看涨期权赌注激增", "黄金单日 +4% 成为热门话题"] },
      { name: "X / Twitter 金融", score: 70, label: "中性偏热", points: ["「贬值交易」刷屏金融圈", "NVDA $2,800 亿波动定价大讨论", "霍尔木兹通道传闻引发油价押注"] },
      { name: "中文社区 (微博/雪球)", score: 68, label: "中性偏热", points: ["美加关税战对 A 股产业链影响评估", "黄金新高引发配置讨论", "NVDA 财报对 A 股算力映射情绪紧张"] },
    ],
    retail: "散户情绪偏热（恐惧贪婪 74 · 贪婪）：BTC $80K FOMO 与 NVDA 期权赌注并存，黄金暴涨吸引新增配置资金；但对财报结果分歧极大，看涨期权买入与避险买盘同时出现。",
    institutional: "机构聚焦 TGA 回购的货币化含义与 Jackson Hole 政策信号。NVDA 连跌 7 天 + 期权定价 $2,800 亿波动 → AI 拥挤度风险极高；VIX 低位大量买入尾部保护；对冲基金在财报前降杠杆。",
    hotWords: ["#NVDA财报", "#贬值交易", "#美加关税", "#黄金新高", "#霍尔木兹", "#TGA回购", "#苹果M6", "#BTC80K"],
  },
  radar: {
    rows,
    cards: [
      { asset: "黄金", assetEn: "Gold", icon: "🥇", tone: "gold", views: [
        { master: "达利欧", masterEn: "Dalio", text: "长期债务周期叠加 TGA 回购的债务货币化实质 → 美元购买力持续稀释 → 硬资产升值。全天候组合中黄金权重继续提升。", textEn: "Long-term debt cycle plus the monetary nature of the TGA buyback keeps diluting dollar purchasing power — hard assets benefit. Gold weight keeps rising in the All-Weather portfolio." },
        { master: "保罗·都铎·琼斯", masterEn: "Paul Tudor Jones", text: "金价站稳 200 日均线上方，单日 +4% 突破前高确认上行趋势。$4,520 为关键支撑，$4,700 上方打开 $4,850 空间。", textEn: "Gold holds above its 200-day MA; a +4% breakout day confirms the uptrend. $4,520 is key support; above $4,700 the path to $4,850 opens up." },
        { master: "罗杰斯", masterEn: "Jim Rogers", text: "大宗商品超级周期远未结束：央行购金 + 供给受限 + 美元信用损耗三重支撑不变。", textEn: "The commodity supercycle is far from over: central-bank buying, constrained supply and dollar debasement all persist." },
        { master: "塔勒布", masterEn: "Taleb", text: "「贬值交易」回归验证反脆弱逻辑：黄金在黑天鹅事件中提供非对称保护，是组合的保险而非投机。", textEn: "The return of the debasement trade validates antifragility: gold provides asymmetric protection in black-swan events — insurance, not speculation." },
      ] },
      { asset: "比特币 / 以太坊", assetEn: "Bitcoin / Ethereum", icon: "₿", tone: "green", views: [
        { master: "亚瑟·海耶斯", masterEn: "Arthur Hayes", text: "TGA 回购 $9,500 亿 = 「贬值交易」完美催化剂。法币贬值是加密资产的终极燃料，BTC 突破 $80K 只是前菜。", textEn: "A $950bn TGA buyback is the perfect catalyst for the debasement trade. Fiat debasement is crypto's ultimate fuel — BTC breaking $80K is only the appetizer." },
        { master: "帕尔", masterEn: "Raoul Pal", text: "Everything Code：全球流动性周期驱动一切。TGA 释放流动性 + ETH 金叉确认 = 加密与科技同一笔交易继续上行。", textEn: "Everything Code: the global liquidity cycle drives everything. TGA liquidity release plus a confirmed ETH golden cross keeps crypto and tech as the same trade." },
        { master: "伯尼斯克", masterEn: "Chris Burniske", text: "$80K 是关键心理与技术位：站稳则确认「结算层 + 资产层」叙事新阶段；回踩 $75K 不破仍是健康调整。", textEn: "$80K is the key psychological and technical level: holding it confirms the next phase of the settlement-layer narrative; a pullback that holds $75K is still healthy." },
        { master: "塔勒布", masterEn: "Taleb", text: "保持怀疑：加密缺乏内在价值锚，在黑天鹅事件中的「保险」属性远弱于黄金，仓位应受尾部约束。", textEn: "Remain skeptical: crypto lacks an intrinsic value anchor and its insurance property in black-swan events is far weaker than gold's — size positions for the tail." },
      ] },
      { asset: "WTI 原油", assetEn: "WTI Crude", icon: "🛢️", tone: "red", views: [
        { master: "德鲁肯米勒", masterEn: "Druckenmiller", text: "美国从军事转向经济施压伊朗 → 地缘溢价快速压缩。WTI 跌破 $83 确认短期下行趋势，$78 是下一个目标。", textEn: "The US shift from military to economic pressure on Iran compresses the geopolitical premium. WTI below $83 confirms the near-term downtrend; $78 is next." },
        { master: "科夫纳", masterEn: "Kovner", text: "霍尔木兹临时通道是真正的供给端突破；但任何擦枪走火都可能让油价 V 型反弹——仓位必须带止损。", textEn: "The temporary Hormuz channel is a genuine supply-side breakthrough; but any miscalculation can V-reverse oil — every position must carry a stop." },
        { master: "罗杰斯", masterEn: "Jim Rogers", text: "长期商品超级周期判断不变，但短期地缘溢价出清叠加需求走弱，油价阶段性承压合理。", textEn: "The long-term commodity supercycle thesis stands, but near-term premium unwind plus soft demand justifies temporary pressure on oil." },
      ] },
      { asset: "标普500 / AI 板块", assetEn: "S&P 500 / AI Complex", icon: "🇺🇸", tone: "purple", views: [
        { master: "霍华德·马克斯", masterEn: "Howard Marks", text: "周期后期 + 估值偏高 + 情绪偏热。均值回归终将发生——当前阶段应降低风险敞口，而非加码。", textEn: "Late cycle, rich valuations, warm sentiment. Mean reversion will come — this is the time to reduce risk, not add." },
        { master: "迈克尔·伯里", masterEn: "Michael Burry", text: "韩国 Kospi 蒸发 $2.5 万亿是前车之鉴：AI 拥挤交易 + 杠杆的脆弱组合被系统性低估。", textEn: "Korea's $2.5tn Kospi wipeout is the cautionary tale: the fragile combination of crowded AI trades and leverage is systemically underpriced." },
        { master: "德鲁肯米勒", masterEn: "Druckenmiller", text: "NVDA 期权定价 $2,800 亿波动 + 连跌 7 天 → AI 板块短期风险收益比极差，财报前不博方向。", textEn: "$280bn of option-priced NVDA swing after 7 straight down days — the near-term risk/reward in AI is poor. Do not gamble direction into the print." },
        { master: "木头姐", masterEn: "Cathie Wood", text: "AI 革命继续：NVDA 财报将再次证明指数级增长趋势，短期波动不改 5 年维度判断。", textEn: "The AI revolution continues: NVDA earnings will re-confirm exponential growth. Short-term volatility does not change the 5-year view." },
      ] },
    ],
  },
  signals: [
    { side: "LONG", asset: "黄金 (Gold)", assetEn: "Gold", icon: "🥇", score: 92, entry: "$4,620-4,660", t1: "$4,850", t2: "$5,000", stop: "$4,520", horizon: "swing 1-4周", horizonEn: "swing 1-4 weeks", masters: "达利欧, PTJ, 罗杰斯, 塔勒布", mastersEn: "Dalio, PTJ, Rogers, Taleb", consensus: "高度共识", consensusEn: "High consensus", logic: "贝森特 TGA 回购预期 = 债务货币化 → 美元购买力稀释 → 硬资产升值。黄金期货单日 +4% 突破前高，200 日均线上方趋势完好；美加贸易战 + 伊朗制裁提供避险溢价。", logicEn: "TGA buyback expectations equal debt monetization, diluting dollar purchasing power and lifting hard assets. Gold futures broke to new highs with a +4% day, trend intact above the 200-day MA; trade war and Iran sanctions add safe-haven premium.", debate: "若 Jackson Hole 释放鹰派信号（通胀不降 → 加息预期），实际收益率上行将压制金价。", debateEn: "If Jackson Hole turns hawkish (inflation sticky → hike bets), rising real yields would pressure gold.", trigger: "突破 $4,700 确认上行趋势 → 加仓；跌破 $4,520 止损离场。", triggerEn: "A confirmed break above $4,700 allows adding; a close below $4,520 exits the position." },
    { side: "LONG", asset: "以太坊 (ETH)", assetEn: "Ethereum", icon: "⟠", score: 84, entry: "$2,420-2,480", t1: "$2,650", t2: "$2,850", stop: "$2,320", horizon: "swing 1-3周", horizonEn: "swing 1-3 weeks", masters: "海耶斯, 帕尔, 伯尼斯克", mastersEn: "Hayes, Raoul Pal, Burniske", consensus: "高度偏多", consensusEn: "Strongly bullish", logic: "BTC 站稳 $78-80K 带动板块情绪；ETH 金叉确认 + TGA 流动性注入双利好；ETH/BTC 汇率上行趋势确立；「贬值交易」叙事推动资金流入加密。", logicEn: "BTC holding $78-80K lifts sector sentiment; confirmed ETH golden cross plus TGA liquidity are twin tailwinds; ETH/BTC ratio trend turns up; the debasement narrative funnels capital into crypto.", debate: "若 NVDA 财报不及预期引发科技整体回调，加密可能跟随下跌；BTC 跌破 $75K 将拖累 ETH。", debateEn: "An NVDA miss that drags tech lower would likely pull crypto with it; BTC below $75K weighs on ETH.", trigger: "站稳 $2,500 确认突破 → 加仓；跌破 $2,320 止损。", triggerEn: "Holding above $2,500 confirms the breakout; a break below $2,320 stops out." },
    { side: "SHORT", asset: "WTI 原油 (Oil)", assetEn: "WTI Crude", icon: "🛢️", score: 76, entry: "$82.5-84", t1: "$78", t2: "$75", stop: "$87", horizon: "swing 1-2周", horizonEn: "swing 1-2 weeks", masters: "德鲁肯米勒(短期), 科夫纳(对冲)", mastersEn: "Druckenmiller (tactical), Kovner (hedged)", consensus: "转空", consensusEn: "Turning bearish", logic: "伊朗与阿曼临时航运通道方案 → 供给风险溢价出清；美国拟遣外交官重返中东 = 局势缓和信号；布油跌破 $90、WTI 盘中跌超 4%。", logicEn: "The Iran-Oman temporary shipping channel unwinds the supply-risk premium; the US plans to send diplomats back to the Middle East — a de-escalation signal; Brent broke $90 and WTI fell over 4% intraday.", debate: "霍尔木兹任何擦枪走火或通道谈判破裂都可能引发油价 V 型反弹——仓位必须带止损。", debateEn: "Any Hormuz miscalculation or collapsed talks can V-reverse oil — the position must carry a stop.", trigger: "跌破 $80 确认下行趋势 → 加仓；反弹突破 $85 减仓，突破 $87 止损。", triggerEn: "A break below $80 confirms the downtrend; above $85 reduce, above $87 exit." },
    { side: "HEDGE", asset: "VIX 尾部保护", assetEn: "VIX Tail Hedge", icon: "📊", score: 70, entry: "VIX < 16 买看涨", t1: "VIX 20", t2: "VIX 25", stop: "期权费归零", horizon: "事件对冲 1-2周", horizonEn: "event hedge 1-2 weeks", masters: "塔勒布, 伯里", mastersEn: "Taleb, Burry", consensus: "尾部风险", consensusEn: "Tail risk", logic: "VIX ~15.5 处于低位，而 NVDA 财报 + Jackson Hole + PCE 三重事件本周密集落地，尾部保护成本低、赔率高。", logicEn: "VIX near 15.5 is cheap while NVDA earnings, Jackson Hole and PCE all land this week — tail protection offers low cost and high payoff.", debate: "低波动环境下期权时间价值持续损耗；事件平静落地则保费全损。", debateEn: "Theta decays steadily in low-vol regimes; a calm event week means the premium is lost.", trigger: "事件落地前布局；事件未触发波动则到期前平仓。", triggerEn: "Lay the hedge before the events; close before expiry if vol never triggers." },
  ],
  allocation: [
    { label: "核心多仓", pct: "60%", note: "黄金 + ETH（贬值交易主线）" },
    { label: "尾部对冲", pct: "15%", note: "VIX 尾部保护" },
    { label: "现金", pct: "25%", note: "等待财报与 Jackson Hole 落地" },
  ],
  calendar: [
    { date: "周三 8/26", events: "NVDA / Salesforce / Okta / CrowdStrike / HP 财报 | 7月 PCE | Q2 GDP 修正", time: "盘后/全天", impact: "极高" },
    { date: "周四 8/27", events: "Best Buy / Workday / Affirm / Gap 财报 | Jackson Hole 研讨会开幕", time: "盘前/全天", impact: "极高" },
    { date: "周五 8/28", events: "Jackson Hole 继续 | 个人收入/支出 | UMich 情绪终值", time: "全天", impact: "中" },
    { date: "下周一 8/31", events: "8月 ISM 制造业 | 财报季收尾周", time: "全天", impact: "中" },
  ],
  scenarios: {
    bull: { prob: "20%", text: "NVDA 超预期 → AI 叙事重燃；TGA 火力兑现 → 收益率跌破 4.6%；加拿大释放谈判信号；BTC 站稳 $80K；黄金冲 $4,850+。" },
    base: { prob: "50%", text: "NVDA 基本符合预期；收益率 4.60-4.80% 震荡；美加关税持续但未升级；Jackson Hole「数据依赖」中性表态；SPY $755-775；BTC $76-81K。" },
    bear: { prob: "30%", text: "加拿大报复关税全面生效；霍尔木兹谈判破裂油价反弹；NVDA 不及预期 → AI 恐慌（韩股前车之鉴）；Jackson Hole 鹰派 → 收益率破 4.85%；SPY 跌破 $750、VIX 20+。" },
  },
  judgment: {
    paras: [
      "今日是 NVDA 财报日，也是本周三重事件（NVDA 财报 + Jackson Hole + PCE）的第一重。全资产扫描的结论清晰：「贬值交易」是当前最高确信度的市场主线——TGA 回购预期将黄金与加密推上全市场共识之巅，而原油因中东外交突破出现短期做空窗口。",
      "美股自身的结构风险不容忽视：AI 拥挤度在 NVDA 连跌 7 天与 $2,800 亿期权波动定价中达到极值，韩股 $2.5 万亿蒸发的教训近在眼前。财报前不博方向是纪律，而不是胆怯。",
    ],
    coreLong: "维持核心仓位不变——黄金（高度共识，贬值交易 + 避险双逻辑）与 ETH（金叉确认 + 流动性利好）仍是最高确信度方向。",
    coreShort: "WTI 原油：中东外交突破导致地缘溢价出清，$82-84 区间提供短期做空窗口，止损 $87 不可省略。",
    hedge: "VIX ~15.5 低位买入尾部保护——美加贸易战 + 霍尔木兹 + Jackson Hole 三重尾部风险不可忽视。",
    cash: "现金提升至 25%：本周事件密度极高，等 NVDA 财报与 Jackson Hole 落地后再行加码。",
  },
  sourceLine: "数据源：Yahoo Finance · FRED · CoinGecko · gold-api · 华尔街见闻 · Bing News RSS",
};

const enReport = {
  kind: "daily",
  titleZh: "NVDA 财报审判日 · 「贬值交易」全面回归 · 霍尔木兹航运突破",
  tagsZh: "MORNING BRIEF · Aug 26 · NVDA EARNINGS DAY · DEBASEMENT TRADE · HORMUZ CHANNEL · CANADA TARIFFS",
  titleEn: "NVDA Judgment Day · Debasement Trade Returns · Hormuz Breakthrough",
  tagsEn: "MORNING BRIEF · Aug 26 · NVDA EARNINGS DAY · DEBASEMENT TRADE · HORMUZ CHANNEL",
  ticker: [
    { symbol: "SPY", name: "S&P 500 ETF", price: "$765.23", chg: "-0.29%", up: false },
    { symbol: "QQQ", name: "Nasdaq 100 ETF", price: "$709.79", chg: "-0.47%", up: false },
    { symbol: "DIA", name: "Dow ETF", price: "$534.42", chg: "+0.34%", up: true },
    { symbol: "BTC", name: "Bitcoin", price: "$78,940", chg: "-0.26%", up: false },
    { symbol: "ETH", name: "Ethereum", price: "$2,458", chg: "-0.96%", up: false },
    { symbol: "Gold", name: "Gold Futures", price: "$4,697", chg: "+3.99%", up: true },
    { symbol: "VIX", name: "VIX", price: "15.47", chg: "+3.90%", up: true },
    { symbol: "10Y", name: "US 10Y Yield", price: "4.64%", chg: "-0.21%", up: false },
    { symbol: "WTI", name: "WTI Crude", price: "$82.15", chg: "-3.32%", up: false },
    { symbol: "Fear&Greed", name: "Fear & Greed", price: "74", chg: "Greed", up: true },
  ],
  redAlerts: [
    { tone: "yellow", tag: "Debasement", title: "The debasement trade is back — gold +4% in a day, BTC eyes $80K", body: "Treasury Secretary Bessent's planned TGA buyback is being read as the prelude to debt monetization: gold futures surged almost 4% to $4,697 and bitcoin briefly broke $80,000 overnight. Fiat-debasement hedges are the market's favorites again.", source: "Wallstreetcn · CNBC · Aug 25" },
    { tone: "purple", tag: "NVDA Earnings", title: "NVDA reports after the close — options price a $280bn swing", body: "Nvidia faces judgment day after 7 straight down days: the options market prices a $280bn post-earnings move. Commentary flags the financialization of GPU sales — securitizing chips like mortgages — while OpenAI's in-house JALAPENO chip challenges GB300.", source: "Wallstreetcn · WSJ · Reuters · Aug 25" },
    { tone: "red", tag: "Trade War", title: "US-Canada trade war escalates — C$200bn retaliation, steel tariffs doubled to 50%", body: "Canada announced dollar-for-dollar retaliation worth $200bn and doubled steel/aluminum tariffs to 50%. Trump threatened to rename Lake Ontario the Lake of America. The North American trade system is being rewired.", source: "Wallstreetcn · WSJ · Aug 25" },
  ],
  events: [
    { title: "Hormuz breakthrough — Iran and Oman propose a temporary shipping channel", body: "Iran and Oman are discussing a phased framework: a temporary joint shipping channel and joint mine-clearing, plus information-sharing and navigation-safety mechanisms. Crude extended losses on the news, with Brent below $90 and WTI down over 4% intraday.", source: "Wallstreetcn · Aug 25" },
    { title: "Bessent's TGA move — markets warn of super-inflation", body: "Treasury Secretary Bessent is preparing to deploy roughly $950bn of TGA cash to buy back Treasuries — seen as quasi-QE. Local commentary warns this is one step away from super-inflation. The expectation alone lit the gold and crypto debasement trade.", source: "Wallstreetcn · Aug 25" },
    { title: "NVDA countdown — the AI complex faces its biggest test of the year", body: "Nvidia reports after today's close with options pricing a $280bn swing. Focus: the Blackwell roadmap, sustainability of financially engineered revenue (lease/repurchase structures), and the threat of in-house chips such as OpenAI's JALAPENO.", source: "Wallstreetcn · Barron's · Aug 25" },
    { title: "Canada retaliates with $200bn, doubling steel tariffs to 50%", body: "Ottawa matched US tariffs dollar-for-dollar and doubled steel/aluminum duties to 50%. Trump threatened to rename Lake Ontario. ING strategists warn Canada, as the smaller open economy, loses more in this fight.", source: "Wallstreetcn · WSJ · Aug 25" },
    { title: "Apple ships its first 2nm Mac Mini — the M6 local-AI push", body: "After two years, the Mac Mini gets a refresh: 2nm M6 and M5 Ultra chips aimed at running and fine-tuning large AI models locally — a direct counter-narrative to Nvidia's cloud-compute dominance.", source: "Wallstreetcn · CNBC · Aug 25" },
    { title: "Korea's leverage lesson — what is left after a 25% rebound", body: "A deep dive recaps the Kospi's slow-motion crash that vaporized $2.5tn before bouncing 25%: the leverage bubble is not fully unwound. The episode is repeatedly cited as the warning sign for crowded AI trades.", source: "Wallstreetcn · WSJ · Aug 25" },
    { title: "Anthropic sees its TAM above $30 trillion", body: "AI valuation narratives keep heating up: Anthropic reportedly expects its total addressable market to exceed $30tn — in the same week a Goldman partner publicly warned that overusing AI makes people stupid. The gap between AI narrative and reality is this earnings season's biggest debate.", source: "Wallstreetcn · Aug 25" },
    { title: "US stocks open cautiously higher — memory names rebound, yields slide", body: "Risk appetite recovered cautiously: indices opened higher, SK Hynix rose 3% leading a memory-chip rebound; bitcoin pulled back from highs; Treasury yields fell. Positioning shows a classic sell-volatility, buy-certainty stance ahead of NVDA.", source: "Wallstreetcn · Aug 25" },
    { title: "Goldman warns European gas could top EUR 100 this winter", body: "Goldman Sachs flags dangerously low European gas storage: any supply disruption this winter could replay a 2022-style crisis with TTF above EUR 100/MWh. Energy tail risk is back on institutional hedge lists.", source: "Wallstreetcn · Aug 25" },
    { title: "China-India border talks in Beijing · Jack Ma keeps buying Alibaba", body: "Special representatives for the China-India boundary question met in Beijing, extending the de-escalation theme. Meanwhile Jack Ma added to his Alibaba stake, buying over HK$600m over consecutive days — a private vote of confidence in Chinese assets.", source: "Wallstreetcn · The Paper · Aug 25" },
  ],
  sentiment: {
    platforms: [
      { name: "Reddit / WSB", score: 74, label: "Warm", points: ["BTC $80K breakout fuels FOMO", "Surge in NVDA call buying into the print", "Gold +4% day is a trending topic"] },
      { name: "X / Twitter Finance", score: 70, label: "Warm-neutral", points: ["Debasement trade is the phrase of the day", "The $280bn NVDA swing debate", "Hormuz channel rumor sparks oil positioning"] },
      { name: "Chinese Social (Weibo/Xueqiu)", score: 68, label: "Warm-neutral", points: ["US-Canada tariffs and A-share supply chains", "Gold highs spark allocation talk", "Nervousness over NVDA read-through to A-share AI names"] },
    ],
    retail: "Retail sentiment runs warm (Fear & Greed 74, Greed): BTC $80K FOMO and NVDA option gambles coexist, while the gold spike attracts new allocation money — but conviction on the earnings print is deeply split.",
    institutional: "Institutions focus on the monetization implications of the TGA buyback and the Jackson Hole signal. NVDA down 7 days with a $280bn priced swing means extreme AI crowding; tail hedges are being bought at low VIX; funds de-risk into the print.",
    hotWords: ["#NVDAearnings", "#DebasementTrade", "#CanadaTariffs", "#GoldHighs", "#Hormuz", "#TGAbuyback", "#AppleM6", "#BTC80K"],
  },
  radar: { rows, cards: zhReport.radar.cards },
  signals: [
    { side: "LONG", asset: "黄金 (Gold)", assetEn: "Gold", icon: "🥇", score: 92, entry: "$4,620-4,660", t1: "$4,850", t2: "$5,000", stop: "$4,520", horizon: "swing 1-4周", horizonEn: "swing 1-4 weeks", masters: "达利欧, PTJ, 罗杰斯, 塔勒布", mastersEn: "Dalio, PTJ, Rogers, Taleb", consensus: "高度共识", consensusEn: "High consensus", logic: zhReport.signals[0].logic, logicEn: zhReport.signals[0].logicEn, debate: zhReport.signals[0].debate, debateEn: zhReport.signals[0].debateEn, trigger: zhReport.signals[0].trigger, triggerEn: zhReport.signals[0].triggerEn },
    { side: "LONG", asset: "以太坊 (ETH)", assetEn: "Ethereum", icon: "⟠", score: 84, entry: "$2,420-2,480", t1: "$2,650", t2: "$2,850", stop: "$2,320", horizon: "swing 1-3周", horizonEn: "swing 1-3 weeks", masters: "海耶斯, 帕尔, 伯尼斯克", mastersEn: "Hayes, Raoul Pal, Burniske", consensus: "高度偏多", consensusEn: "Strongly bullish", logic: zhReport.signals[1].logic, logicEn: zhReport.signals[1].logicEn, debate: zhReport.signals[1].debate, debateEn: zhReport.signals[1].debateEn, trigger: zhReport.signals[1].trigger, triggerEn: zhReport.signals[1].triggerEn },
    { side: "SHORT", asset: "WTI 原油 (Oil)", assetEn: "WTI Crude", icon: "🛢️", score: 76, entry: "$82.5-84", t1: "$78", t2: "$75", stop: "$87", horizon: "swing 1-2周", horizonEn: "swing 1-2 weeks", masters: "德鲁肯米勒(短期), 科夫纳(对冲)", mastersEn: "Druckenmiller (tactical), Kovner (hedged)", consensus: "转空", consensusEn: "Turning bearish", logic: zhReport.signals[2].logic, logicEn: zhReport.signals[2].logicEn, debate: zhReport.signals[2].debate, debateEn: zhReport.signals[2].debateEn, trigger: zhReport.signals[2].trigger, triggerEn: zhReport.signals[2].triggerEn },
    { side: "HEDGE", asset: "VIX 尾部保护", assetEn: "VIX Tail Hedge", icon: "📊", score: 70, entry: "VIX < 16 买看涨", t1: "VIX 20", t2: "VIX 25", stop: "期权费归零", horizon: "事件对冲 1-2周", horizonEn: "event hedge 1-2 weeks", masters: "塔勒布, 伯里", mastersEn: "Taleb, Burry", consensus: "尾部风险", consensusEn: "Tail risk", logic: zhReport.signals[3].logic, logicEn: zhReport.signals[3].logicEn, debate: zhReport.signals[3].debate, debateEn: zhReport.signals[3].debateEn, trigger: zhReport.signals[3].trigger, triggerEn: zhReport.signals[3].triggerEn },
  ],
  allocation: [
    { label: "Core Longs", pct: "60%", note: "Gold + ETH (debasement mainline)" },
    { label: "Tail Hedge", pct: "15%", note: "VIX tail protection" },
    { label: "Cash", pct: "25%", note: "Wait for earnings and Jackson Hole" },
  ],
  calendar: [
    { date: "Wed 8/26", events: "NVDA / Salesforce / Okta / CrowdStrike / HP earnings | July PCE | Q2 GDP revision", time: "After close / all day", impact: "极高" },
    { date: "Thu 8/27", events: "Best Buy / Workday / Affirm / Gap earnings | Jackson Hole symposium opens", time: "Pre-market / all day", impact: "极高" },
    { date: "Fri 8/28", events: "Jackson Hole continues | Personal income/spending | UMich final", time: "All day", impact: "中" },
    { date: "Mon 8/31", events: "August ISM manufacturing | Earnings season winds down", time: "All day", impact: "中" },
  ],
  scenarios: {
    bull: { prob: "20%", text: "NVDA beats and re-ignites the AI narrative; TGA firepower delivers and yields break 4.6%; Canada signals talks; BTC holds $80K; gold runs to $4,850+." },
    base: { prob: "50%", text: "NVDA broadly in line; yields chop 4.60-4.80%; tariffs persist without escalation; Jackson Hole stays data-dependent; SPY $755-775; BTC $76-81K." },
    bear: { prob: "30%", text: "Canadian retaliation bites; Hormuz talks collapse and oil rebounds; NVDA misses and AI panic spreads (the Korea template); Jackson Hole hawkish and yields break 4.85%; SPY below $750, VIX 20+." },
  },
  judgment: {
    paras: [
      "Today is NVDA day — the first of this week's triple test (NVDA earnings, Jackson Hole, PCE). The cross-asset scan is unambiguous: the debasement trade is the highest-conviction mainline, with TGA buyback expectations putting gold and crypto at the top of the consensus board, while crude offers a tactical short window after the Middle East diplomatic breakthrough.",
      "The structural risk inside US equities should not be ignored: AI crowding is extreme after 7 down days and a $280bn priced swing, with Korea's $2.5tn lesson still fresh. Not gambling direction into the print is discipline, not timidity.",
    ],
    coreLong: "Keep core positions unchanged — gold (high consensus; debasement plus safe-haven logic) and ETH (golden cross plus liquidity tailwind) remain the highest-conviction directions.",
    coreShort: "WTI crude: the diplomatic breakthrough unwinds the geopolitical premium; the $82-84 zone offers a short window with a mandatory stop at $87.",
    hedge: "Buy tail protection with VIX near 15.5 — the trade war, Hormuz and Jackson Hole together are three tails that cannot be ignored.",
    cash: "Raise cash to 25%: the event density this week is extreme; wait for NVDA and Jackson Hole to land before adding.",
  },
  sourceLine: "Sources: Yahoo Finance · FRED · CoinGecko · gold-api · Wallstreetcn · Bing News RSS",
};

function main() {
  const dateISO = "2026-08-26";
  const labels = publish.dateLabels(dateISO);
  const meta = { dateISO, kind: "daily", fetchedAt: new Date().toLocaleString("zh-CN", { hour12: false }), ...labels };
  zhReport.meta = meta;
  enReport.meta = meta;

  const pages = {
    zh: render.renderDaily(zhReport, "zh"),
    en: render.renderDaily(enReport, "en"),
    stub: render.renderStub(dateISO, "daily"),
  };
  const written = publish.publishReport(dateISO, "daily", zhReport, pages);
  const manifest = publish.rebuildIndexAndArchive();
  console.log("已发布:", written.join(", "));
  console.log("首页/存档已重建，报告总数:", manifest.reports.length);
}

main();
