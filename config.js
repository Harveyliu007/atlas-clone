// ============================================================
// Atlas 克隆项目配置
// 品牌名可自行修改（正式对外部署前建议改名，避免商标冲突）
// ============================================================
module.exports = {
  brand: {
    name: "ATLAS",
    suffix: ".",
    tagline: "World Live",
    accent: "#10b981",   // 主色（绿）
    accent2: "#3b82f6",  // 次色（蓝）
  },

  site: {
    title: "Atlas World Live | Intelligence & Signals",
    description: "The signal, not the noise. 每天开盘前，用 50 位投资大师的框架提取真正值得看的 3 件事。",
    timezone: "Asia/Shanghai",
  },

  // LLM 引擎（OpenAI 兼容接口；默认 DeepSeek，性价比高且中文强）
  llm: {
    enabled: true,
    endpoint: process.env.ATLAS_LLM_ENDPOINT || "https://api.deepseek.com/chat/completions",
    apiKey: process.env.ATLAS_LLM_API_KEY || "",
    model: process.env.ATLAS_LLM_MODEL || "deepseek-chat",
    temperature: 0.7,
    maxTokens: 8000,
    timeoutMs: 180000,
  },

  // 数据源开关（全部免费，无需 API key）
  data: {
    yahoo: {
      enabled: true,
      baseUrl: "https://query2.finance.yahoo.com/v8/finance/chart",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      symbols: {
        SPY:   { nameZh: "标普500 ETF",  nameEn: "S&P 500 ETF" },
        QQQ:   { nameZh: "纳指100 ETF",  nameEn: "Nasdaq 100 ETF" },
        DIA:   { nameZh: "道指 ETF",     nameEn: "Dow ETF" },
        "^GSPC": { nameZh: "标普500指数", nameEn: "S&P 500 Index" },
        "^IXIC": { nameZh: "纳斯达克指数", nameEn: "Nasdaq Composite" },
        "^DJI": { nameZh: "道琼斯指数",   nameEn: "Dow Jones" },
        "^N225": { nameZh: "日经225",     nameEn: "Nikkei 225" },
        "^HSI": { nameZh: "恒生指数",     nameEn: "Hang Seng" },
        "000001.SS": { nameZh: "上证综指", nameEn: "Shanghai Composite" },
        "^VIX": { nameZh: "恐慌指数VIX",  nameEn: "VIX" },
        "^TNX": { nameZh: "10年期美债收益率", nameEn: "US 10Y Yield" },
        "GC=F": { nameZh: "黄金",         nameEn: "Gold" },
        "CL=F": { nameZh: "WTI原油",      nameEn: "WTI Crude" },
        "HG=F": { nameZh: "铜",           nameEn: "Copper" },
        "DX-Y.NYB": { nameZh: "美元指数",  nameEn: "DXY" },
        "EURUSD=X": { nameZh: "欧元/美元", nameEn: "EUR/USD" },
        "BTC-USD": { nameZh: "比特币",    nameEn: "Bitcoin" },
        "ETH-USD": { nameZh: "以太坊",    nameEn: "Ethereum" },
      },
    },
    coingecko: { enabled: true, baseUrl: "https://api.coingecko.com/api/v3/simple/price" },
    fearGreed: { enabled: true, baseUrl: "https://api.alternative.me/fng/" },
    news: {
      provider: "bing", // bing | google（google 某些地区不可达时自动回退 bing）
      maxItemsPerTopic: 6,
      topics: [
        { id: "market",   zh: "美联储 美股 债券市场",      en: "Federal Reserve stock market" },
        { id: "ai",       zh: "英伟达 AI 芯片 科技股",    en: "Nvidia AI chips technology stocks" },
        { id: "geopolitics", zh: "伊朗 关税 地缘政治 战争", en: "Iran tariffs geopolitics war" },
        { id: "gold",     zh: "黄金 贵金属",              en: "gold precious metals" },
        { id: "crypto",   zh: "比特币 以太坊 加密货币",    en: "bitcoin ethereum cryptocurrency" },
        { id: "oil",      zh: "油价 原油 OPEC",           en: "oil price crude OPEC" },
        { id: "china",    zh: "中国经济 A股 港股",        en: "China economy A-shares" },
        { id: "macro",    zh: "通胀 CPI PCE 非农 央行",   en: "inflation CPI PCE jobs central bank" },
      ],
    },
  },

  publish: {
    outputDir: "public",
    manifestPath: "_data/reports.json",
    indexRecentCount: 16,   // 首页展示的最近报告数
  },
};
