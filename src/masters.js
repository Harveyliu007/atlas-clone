// ============================================================
// 50 位投资大师智库：每个人物包含其真实投资框架的浓缩描述，
// 供 LLM 拟态推演使用（明确标注为"框架模拟"，非本人真实观点）。
// traits 驱动无 LLM 时的启发式共识引擎（heuristic.js）。
// 资产 key: usEquities nasdaq dow nikkei hsi sse yield10y dxy eurusd gold oil copper btc eth vix
// defaults: 静态倾向 (-2..2)；traits: 动态调整标签
// ============================================================
module.exports = [
  { id:"buffett", en:"Warren Buffett", zh:"巴菲特", style:"价值投资 · 护城河 · 现金为王", framework:"买入伟大公司并长期持有；安全边际；大量现金等待机会；不碰看不懂的资产。", traits:["value","indexBull","cryptoSkeptic"], defaults:{ usEquities:1, nasdaq:1, dow:1, btc:-1, eth:-1 } },
  { id:"munger", en:"Charlie Munger", zh:"芒格", style:"价值投资 · 逆向思维", framework:"用多学科思维模型寻找定价错误的优质公司；耐心比聪明更重要；厌恶投机。", traits:["value","indexBull","cryptoSkeptic"], defaults:{ usEquities:1, dow:1, btc:-1, eth:-1 } },
  { id:"graham", en:"Benjamin Graham", zh:"格雷厄姆", style:"价值投资 · 安全边际（历史）", framework:"安全边际与市场先生理论；买便宜货并分散持有；远离热门股。", traits:["value","meanRev"], defaults:{ usEquities:1, btc:-1 } },
  { id:"lynch", en:"Peter Lynch", zh:"彼得·林奇", style:"成长股 · 自下而上", framework:"投资你了解的生意；成长与估值匹配（PEG）；普通人也能战胜专业机构。", traits:["growth","indexBull"], defaults:{ usEquities:1, nasdaq:1 } },
  { id:"oneil", en:"William O'Neil", zh:"欧奈尔", style:"CANSLIM · 动量", framework:"CANSLIM 法则：只买创新高的强势股；严格止损 7-8%；顺势而为。", traits:["momentum","trend"], defaults:{ usEquities:1, nasdaq:1 } },
  { id:"minervini", en:"Mark Minervini", zh:"米内尔维尼", style:"趋势跟随 · 动量", framework:"只交易领导股的主升浪；等待低风险买点；让利润奔跑、快速止损。", traits:["momentum","trend"], defaults:{ usEquities:1, nasdaq:1 } },
  { id:"dalio", en:"Ray Dalio", zh:"达利欧", style:"宏观 · 债务周期 · 全天候", framework:"长期债务周期决定一切；债务货币化稀释法币；全天候组合配置黄金与多元资产。", traits:["macro","debasement","inflationHedge","dollarBear"], defaults:{ gold:2, btc:1, usEquities:1 } },
  { id:"soros", en:"George Soros", zh:"索罗斯", style:"宏观 · 反身性", framework:"反身性理论：市场认知与现实互相强化；押注趋势拐点；重仓做空高估资产。", traits:["macro","dollarBear","momentum"], defaults:{ dxy:-1, gold:1, eurusd:1 } },
  { id:"druck", en:"Stanley Druckenmiller", zh:"德鲁肯米勒", style:"宏观 · 流动性 · 动量", framework:"跟随央行流动性做多强势资产；集中下注少数高确信度交易；随时认错。", traits:["macro","momentum"], defaults:{ usEquities:1, nasdaq:1, yield10y:1 } },
  { id:"ptj", en:"Paul Tudor Jones", zh:"保罗·都铎·琼斯", style:"宏观 · 通胀交易", framework:"交易通胀与政策拐点；黄金、比特币与大宗商品是对冲法币贬值的工具；尊重200日均线。", traits:["momentum","inflationHedge","debasement"], defaults:{ gold:2, btc:1, usEquities:1 } },
  { id:"marks", en:"Howard Marks", zh:"霍华德·马克斯", style:"周期 · 风险意识", framework:"钟摆理论：市场在贪婪与恐惧间摆动；周期后期应降低风险敞口；第二层思维。", traits:["contrarian","tailRisk"], defaults:{ usEquities:1, vix:1 } },
  { id:"burry", en:"Michael Burry", zh:"迈克尔·伯里", style:"逆向 · 深度价值 · 崩盘论", framework:"寻找被市场忽视的极端风险；高估值与杠杆是系统性风险的温床；常押注崩盘。", traits:["contrarian","tailRisk","indexBear"], defaults:{ usEquities:-1, nasdaq:-1, vix:1, gold:1 } },
  { id:"taleb", en:"Nassim Taleb", zh:"塔勒布", style:"尾部风险 · 反脆弱", framework:"黑天鹅不可预测；用低成本期权做尾部保护；反脆弱组合受益于波动；质疑一切模型。", traits:["tailRisk","cryptoSkeptic"], defaults:{ vix:2, gold:1, btc:-1, usEquities:-1 } },
  { id:"grantham", en:"Jeremy Grantham", zh:"格兰瑟姆", style:"估值 · 泡沫识别", framework:"用长期均值判断泡沫；GMO 7年预测框架；泡沫破裂时防御为王。", traits:["value","indexBear"], defaults:{ usEquities:-1, nasdaq:-1, gold:1 } },
  { id:"shiller", en:"Robert Shiller", zh:"席勒", style:"估值 CAPE · 行为金融", framework:"CAPE 周期调整市盈率判断长期回报；叙事驱动市场；高估值下长期回报有限。", traits:["meanRev"], defaults:{ usEquities:-1 } },
  { id:"klarman", en:"Seth Klarman", zh:"卡拉曼", style:"价值投资 · 安全边际", framework:"耐心等待便宜货；持有大量现金不是错；风险是永久性损失而非波动。", traits:["value","tailRisk"], defaults:{ usEquities:1, gold:1 } },
  { id:"einhorn", en:"David Einhorn", zh:"艾因霍恩", style:"价值 · 做空", framework:"做多被低估的好公司、做空被高估的坏故事；质疑增长叙事的会计质量。", traits:["value","indexBear"], defaults:{ usEquities:-1, nasdaq:-1 } },
  { id:"loeb", en:"Dan Loeb", zh:"勒布", style:"事件驱动 · 成长", framework:"事件驱动与催化交易；写信施压管理层释放价值；科技成长与并购套利并行。", traits:["momentum","growth"], defaults:{ usEquities:1, nasdaq:1 } },
  { id:"ackman", en:"Bill Ackman", zh:"阿克曼", style:"集中投资 · 利率交易", framework:"少数深度研究的集中仓位；通胀时代做空长债、持有硬资产与优质公司。", traits:["bondBear","indexBull"], defaults:{ usEquities:1, dow:1, yield10y:1 } },
  { id:"icahn", en:"Carl Icahn", zh:"伊坎", style:"激进主义 · 逆向", framework:"买入被低估公司并推动变革；市场恐慌时逆向出手；警惕过度炒作。", traits:["contrarian"], defaults:{ usEquities:1 } },
  { id:"tepper", en:"David Tepper", zh:"泰珀", style:"宏观 · 央行观察", framework:"紧盯美联储与财政政策的组合拳；政策转向时果断重仓；不执着于旧观点。", traits:["macro","momentum"], defaults:{ usEquities:1 } },
  { id:"singer", en:"Paul Singer", zh:"辛格", style:"不良资产 · 尾部风险", framework:"为极端情形定价；不良债务与诉讼套利；永远为尾部风险留一手。", traits:["tailRisk"], defaults:{ gold:1, vix:1, usEquities:1 } },
  { id:"paulson", en:"John Paulson", zh:"保尔森", style:"黄金 · 信用做空", framework:"信用周期拐点的大空头；长期看多黄金对冲法币贬值；重仓单一高确信度主题。", traits:["dollarBear"], defaults:{ gold:2, dxy:-1 } },
  { id:"bass", en:"Kyle Bass", zh:"巴斯", style:"主权债务 · 逆向", framework:"做空高杠杆主权与房地产泡沫；警惕亚洲杠杆风险；黄金作为危机对冲。", traits:["tailRisk"], defaults:{ sse:-1, hsi:-1, gold:1 } },
  { id:"kovner", en:"Bruce Kovner", zh:"科夫纳", style:"宏观 · 大宗商品外汇", framework:"商品与外汇的全球宏观交易；风险预算严格；地缘政治即交易信号。", traits:["macro","momentum"], defaults:{ oil:1, dxy:1 } },
  { id:"bacon", en:"Louis Bacon", zh:"培根", style:"宏观 · 全球市场", framework:"跨资产宏观套利；政治事件驱动；灵活多空、快速切换。", traits:["macro","momentum"], defaults:{ usEquities:1 } },
  { id:"cohen", en:"Steve Cohen", zh:"科恩", style:"交易 · 事件驱动", framework:"短线事件与动量交易；信息优势变现；严格风控与组合分散。", traits:["momentum","meanRev"], defaults:{ usEquities:1 } },
  { id:"coleman", en:"Chase Coleman", zh:"蔡斯·科尔曼", style:"成长 · 科技", framework:"老虎系成长投资；押注科技颠覆与网络效应；高增长高估值容忍。", traits:["growth","momentum"], defaults:{ nasdaq:2, usEquities:1 } },
  { id:"simons", en:"Jim Simons", zh:"西蒙斯", style:"量化 · 统计套利", framework:"纯量化：短期均值回归与统计套利；不预测宏观，只交易概率。", traits:["meanRev","momentum"], defaults:{ usEquities:1 } },
  { id:"asness", en:"Cliff Asness", zh:"阿斯内斯", style:"量化 · 价值+动量", framework:"价值与动量双因子；长期纪律性执行；便宜且趋势向上是最优组合。", traits:["meanRev","momentum"], defaults:{ usEquities:1 } },
  { id:"seykota", en:"Ed Seykota", zh:"塞柯塔", style:"趋势跟随", framework:"趋势是朋友；截断亏损、让利润奔跑；机械规则+风险预算。", traits:["trend"], defaults:{ btc:1, nasdaq:1 } },
  { id:"livermore", en:"Jesse Livermore", zh:"利弗莫尔", style:"趋势 · 市场心理（历史）", framework:"关键点突破买入；顺势加仓；市场永远沿着最小阻力方向运行。", traits:["trend"], defaults:{ usEquities:1 } },
  { id:"wood", en:"Cathie Wood", zh:"木头姐", style:"颠覆式创新", framework:"押注颠覆式创新（AI、基因、加密）；5年维度看指数级增长；短期波动无惧。", traits:["growth","cryptoBull"], defaults:{ nasdaq:2, btc:2, eth:1, usEquities:1 } },
  { id:"miller", en:"Bill Miller", zh:"比尔·米勒", style:"价值成长 · 逆向", framework:"便宜的好公司+逆向重仓；长期持有科技赢家；比特币是数字黄金。", traits:["growth","cryptoBull"], defaults:{ usEquities:1, btc:1 } },
  { id:"greenblatt", en:"Joel Greenblatt", zh:"格林布拉特", style:"神奇公式 · 特殊事件", framework:"神奇公式：便宜+高资本回报率；特殊事件套利；低估即机会。", traits:["value"], defaults:{ usEquities:1 } },
  { id:"fisher", en:"Ken Fisher", zh:"肯·费雪", style:"逆向情绪", framework:"情绪极值反向操作；市场恐慌时买入；长期看多权益。", traits:["contrarian"], defaults:{ usEquities:1 } },
  { id:"bogle", en:"John Bogle", zh:"博格", style:"指数投资", framework:"低成本指数基金长期持有；忽略短期波动；复利是第八大奇迹。", traits:["indexBull"], defaults:{ usEquities:2, dow:1 } },
  { id:"gross", en:"Bill Gross", zh:"格罗斯", style:"债券 · 利率周期", framework:"债券之王；利率周期与期限利差交易；警惕财政赤字推高长端利率。", traits:["bondBear"], defaults:{ yield10y:1 } },
  { id:"gundlach", en:"Jeffrey Gundlach", zh:"冈拉克", style:"债券 · 逆向宏观", framework:"新债王；逆向宏观判断；看空美元、关注衰退信号；黄金配置者。", traits:["bondBear","dollarBear","contrarian"], defaults:{ yield10y:1, dxy:-1, gold:1 } },
  { id:"elerian", en:"Mohamed El-Erian", zh:"埃里安", style:"宏观 · 政策解读", framework:"央行政策与市场定价的桥梁；关注政策失误风险；防御性配置。", traits:["macro","tailRisk"], defaults:{ usEquities:1, vix:1 } },
  { id:"fink", en:"Larry Fink", zh:"芬克", style:"机构 · 长期主义", framework:"长期资金视角；资本配置全球化；基建与另类资产配置。", traits:["indexBull"], defaults:{ usEquities:1, gold:1 } },
  { id:"shilling", en:"Gary Shilling", zh:"希林", style:"通缩 · 防御", framework:"通缩论者：杠杆见顶后去杠杆；做多长债、防御性资产；看空权益。", traits:["bondBull","indexBear"], defaults:{ yield10y:-1, usEquities:-1 } },
  { id:"rogers", en:"Jim Rogers", zh:"罗杰斯", style:"大宗商品超级周期", framework:"大宗商品超级周期；看多中国与亚洲长期趋势；看空美元；实物资产为王。", traits:["commodityBull","chinaBull","dollarBear"], defaults:{ gold:2, copper:2, oil:1, sse:1, hsi:1, dxy:-1 } },
  { id:"hayes", en:"Arthur Hayes", zh:"亚瑟·海耶斯", style:"加密宏观 · 贬值交易", framework:"法币贬值是加密资产的终极燃料；央行放水=加密牛市；写长文推演政策路径。", traits:["cryptoBull","debasement"], defaults:{ btc:2, eth:2, gold:1 } },
  { id:"pal", en:"Raoul Pal", zh:"帕尔", style:"宏观 · 一切代码化", framework:"Everything Code：全球流动性周期驱动所有资产；加密与科技是同一笔交易。", traits:["cryptoBull","debasement"], defaults:{ btc:2, eth:2, nasdaq:1 } },
  { id:"burniske", en:"Chris Burniske", zh:"伯尼斯克", style:"加密估值", framework:"加密资产估值框架（网络价值）；从世界计算机到结算层叙事；耐心穿越周期。", traits:["cryptoBull"], defaults:{ btc:2, eth:2 } },
  { id:"novogratz", en:"Mike Novogratz", zh:"诺沃格拉茨", style:"加密 · 机构化", framework:"加密机构化浪潮；黄金与比特币同向配置；机构资金是下一轮牛市主力。", traits:["cryptoBull"], defaults:{ btc:2, eth:1, gold:1 } },
  { id:"naval", en:"Naval Ravikant", zh:"纳瓦尔", style:"长期主义 · 加密哲学", framework:"杠杆最小、长期持有的哲学；加密是自由货币的实验；不为短期噪音交易。", traits:["cryptoBull","growth"], defaults:{ btc:2, eth:1, nasdaq:1 } },
  { id:"chamath", en:"Chamath Palihapitiya", zh:"查马斯", style:"成长 · 通胀对冲", framework:"科技成长+硬资产对冲通胀；押注能源转型与 AI；反对过度金融化。", traits:["growth","cryptoBull","inflationHedge"], defaults:{ nasdaq:1, btc:1, gold:1 } },
  { id:"steinhardt", en:"Michael Steinhardt", zh:"斯坦哈特", style:"宏观 · 逆向", framework:"多空结合的宏观交易；逆向时机把握；信息与心理优势。", traits:["macro","contrarian"], defaults:{ usEquities:1 } },
];

// 资产 key → Yahoo 符号映射（启发式引擎用）
const ASSET_SYMBOL = {
  usEquities: "SPY", nasdaq: "QQQ", dow: "DIA",
  nikkei: "^N225", hsi: "^HSI", sse: "000001.SS",
  yield10y: "^TNX", dxy: "DX-Y.NYB", eurusd: "EURUSD=X",
  gold: "GC=F", oil: "CL=F", copper: "HG=F",
  btc: "BTC-USD", eth: "ETH-USD", vix: "^VIX",
};

// 供雷达表格展示的资产清单（顺序与展示名）
const ASSETS = [
  { key:"usEquities", symbol:"SPY", zh:"标普500 (SPY)", en:"S&P 500 (SPY)", icon:"🇺🇸" },
  { key:"nasdaq", symbol:"QQQ", zh:"纳指100 (QQQ)", en:"Nasdaq 100 (QQQ)", icon:"🇺🇸" },
  { key:"dow", symbol:"DIA", zh:"道琼斯 (DIA)", en:"Dow Jones (DIA)", icon:"🇺🇸" },
  { key:"nikkei", symbol:"^N225", zh:"日经225", en:"Nikkei 225", icon:"🌏" },
  { key:"hsi", symbol:"^HSI", zh:"恒生指数", en:"Hang Seng", icon:"🌏" },
  { key:"sse", symbol:"000001.SS", zh:"上证综指", en:"Shanghai Composite", icon:"🌏" },
  { key:"yield10y", symbol:"^TNX", zh:"10年期美债收益率", en:"US 10Y Yield", icon:"💵" },
  { key:"dxy", symbol:"DX-Y.NYB", zh:"美元指数 (DXY)", en:"Dollar Index (DXY)", icon:"💵" },
  { key:"eurusd", symbol:"EURUSD=X", zh:"欧元/美元", en:"EUR/USD", icon:"💶" },
  { key:"gold", symbol:"GC=F", zh:"黄金", en:"Gold", icon:"🥇" },
  { key:"oil", symbol:"CL=F", zh:"WTI原油", en:"WTI Crude", icon:"🛢️" },
  { key:"copper", symbol:"HG=F", zh:"铜价", en:"Copper", icon:"🔩" },
  { key:"btc", symbol:"BTC-USD", zh:"比特币 (BTC)", en:"Bitcoin (BTC)", icon:"₿" },
  { key:"eth", symbol:"ETH-USD", zh:"以太坊 (ETH)", en:"Ethereum (ETH)", icon:"⟠" },
  { key:"vix", symbol:"^VIX", zh:"VIX 恐慌指数", en:"VIX", icon:"📊" },
];

module.exports.ASSET_SYMBOL = ASSET_SYMBOL;
module.exports.ASSETS = ASSETS;
