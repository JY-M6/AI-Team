const navLinks = document.querySelectorAll(".bottom-nav a, .nav-list a");
const moduleViews = document.querySelectorAll(".module-view");
const moduleGroups = document.querySelectorAll(".module-group");
const entryTime = document.querySelector("#entryTime");
const recordList = document.querySelector("#recordList");
const selectedDate = document.querySelector("#selectedDate");
const selectedTotal = document.querySelector("#selectedTotal");
const todayTotal = document.querySelector("#todayTotal");
const todayHint = document.querySelector("#todayHint");
const calendarAi = document.querySelector("#calendarAi");
const recordAi = document.querySelector("#recordAi");
const calendarGrid = document.querySelector(".calendar-grid");
const calendarTitle = document.querySelector("#calendarTitle");
const calendarYear = document.querySelector("#calendarYear");
const calendarMonth = document.querySelector("#calendarMonth");
const prevMonth = document.querySelector("#prevMonth");
const nextMonth = document.querySelector("#nextMonth");
const dayPie = document.querySelector(".day-pie");
const periodButtons = document.querySelectorAll(".period-switch button");
const trendTitle = document.querySelector("#trendTitle");
const trendAi = document.querySelector("#trendAi");
const trendArea = document.querySelector("#trendArea");
const trendLine = document.querySelector("#trendLine");
const trendDots = document.querySelector("#trendDots");
const trendLabels = document.querySelector("#trendLabels");
const categoryDetailPanels = document.querySelectorAll("[data-category-detail]");
const privacyToggle = document.querySelector("#privacyToggle");
const profilePanel = document.querySelector(".profile-panel");
const profileSettings = document.querySelector("#profileSettings");
const logoutButton = document.querySelector("#logoutButton");
const apiSettingsPanel = document.querySelector("#apiSettingsPanel");
const apiBaseUrl = document.querySelector("#apiBaseUrl");
const apiKey = document.querySelector("#apiKey");
const apiModel = document.querySelector("#apiModel");
const saveApiSettings = document.querySelector("#saveApiSettings");
const apiSettingsStatus = document.querySelector("#apiSettingsStatus");
const aiAssistantFab = document.querySelector(".ai-assistant-fab");
const aiAssistantPanel = document.querySelector(".ai-assistant-panel");
const closeAiAssistant = document.querySelector("#closeAiAssistant");
const aiConnectionStatus = document.querySelector("#aiConnectionStatus");
const aiChatList = document.querySelector("#aiChatList");
const aiChatInput = document.querySelector("#aiChatInput");
const aiChatForm = document.querySelector(".ai-chat-form");
const categoryButtons = document.querySelectorAll(".category-tabs button");
const productList = document.querySelector("#productList");
const detailCategory = document.querySelector("#detailCategory");
const detailName = document.querySelector("#detailName");
const detailCode = document.querySelector("#detailCode");
const detailChange = document.querySelector("#detailChange");
const detailLine = document.querySelector("#detailLine");
const detailHolding = document.querySelector("#detailHolding");
const detailRisk = document.querySelector("#detailRisk");
const detailTrend = document.querySelector("#detailTrend");
const detailAi = document.querySelector("#detailAi");
const recordsPanel = document.querySelector(".records-panel");
const productDetail = document.querySelector(".product-detail");
const canUseRichMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentCalendarYear = 2026;
let currentCalendarMonth = 7;
let selectedCalendarDay = 8;

const dayRecords = {
  1: {
    total: 46,
    ai: "7 月 1 日支出很轻，主要是交通和饮品，整体节奏健康。",
    records: [
      { icon: "行", type: "ride", title: "地铁通勤", meta: "交通 · 微信 · 08:26", amount: 6 },
      { icon: "饮", type: "food", title: "冰美式", meta: "餐饮 · 聚餐 · 15:42", amount: 18 },
      { icon: "餐", type: "food", title: "晚餐", meta: "餐饮 · 支付宝 · 19:05", amount: 22 }
    ]
  },
  3: {
    total: 286,
    ai: "7 月 3 日属于高支出日，购物占比较高。AI 建议标记为一次性消费，避免误判为日常开销。",
    records: [
      { icon: "购", type: "shop", title: "运动鞋", meta: "购物 · 银行卡 · 20:18", amount: 239 },
      { icon: "餐", type: "food", title: "午餐", meta: "餐饮 · 微信 · 12:22", amount: 35 },
      { icon: "行", type: "ride", title: "公交", meta: "交通 · 现金 · 18:03", amount: 12 }
    ]
  },
  5: {
    total: 92,
    ai: "7 月 5 日支出集中在餐饮，金额不高，但晚间零食可以合并到娱乐消费观察。",
    records: [
      { icon: "餐", type: "food", title: "午餐", meta: "餐饮 · 微信 · 12:16", amount: 38 },
      { icon: "饮", type: "food", title: "奶茶", meta: "餐饮 · 情侣 · 16:48", amount: 19 },
      { icon: "零", type: "shop", title: "零食", meta: "购物 · 支付宝 · 21:32", amount: 35 }
    ]
  },
  7: {
    total: 36,
    ai: "7 月 7 日消费很低，是本周控制较好的一天。",
    records: [
      { icon: "餐", type: "food", title: "早餐", meta: "餐饮 · 现金 · 08:10", amount: 12 },
      { icon: "行", type: "ride", title: "地铁", meta: "交通 · 微信 · 18:21", amount: 6 },
      { icon: "饮", type: "food", title: "咖啡", meta: "餐饮 · 支付宝 · 19:06", amount: 18 }
    ]
  },
  8: {
    total: 168,
    ai: "7 月 8 日有 3 笔消费，购物金额最大。若不是刚需，可加入本月“可减少支出”清单。",
    records: [
      { icon: "餐", type: "food", title: "午餐套餐", meta: "餐饮 · 微信 · 12:18", amount: 42 },
      { icon: "行", type: "ride", title: "地铁通勤", meta: "交通 · 微信 · 18:42", amount: 6 },
      { icon: "购", type: "shop", title: "耳机收纳包", meta: "购物 · 支付宝 · 21:10", amount: 120 }
    ]
  },
  10: {
    total: 58,
    ai: "7 月 10 日支出偏低，主要是通勤和工作餐，属于稳定日常支出。",
    records: [
      { icon: "餐", type: "food", title: "工作餐", meta: "餐饮 · 微信 · 12:30", amount: 32 },
      { icon: "行", type: "ride", title: "通勤", meta: "交通 · 微信 · 18:35", amount: 6 },
      { icon: "饮", type: "food", title: "酸奶", meta: "餐饮 · 支付宝 · 20:11", amount: 20 }
    ]
  },
  12: {
    total: 310,
    ai: "7 月 12 日是明显高支出日。AI 建议拆分购物原因，判断是否为计划内购买。",
    records: [
      { icon: "购", type: "shop", title: "键盘", meta: "购物 · 银行卡 · 16:12", amount: 249 },
      { icon: "餐", type: "food", title: "晚餐", meta: "餐饮 · 微信 · 19:20", amount: 48 },
      { icon: "行", type: "ride", title: "打车补差", meta: "交通 · 支付宝 · 22:08", amount: 13 }
    ]
  },
  15: {
    total: 73,
    ai: "7 月 15 日消费结构均衡，没有异常波动。",
    records: [
      { icon: "餐", type: "food", title: "午餐", meta: "餐饮 · 微信 · 12:09", amount: 31 },
      { icon: "学", type: "study", title: "电子书", meta: "教育 · 学习 · 20:44", amount: 36 },
      { icon: "行", type: "ride", title: "地铁", meta: "交通 · 微信 · 21:12", amount: 6 }
    ]
  },
  18: {
    total: 25,
    ai: "7 月 18 日只有小额餐饮支出，可以作为低消费日参考。",
    records: [
      { icon: "餐", type: "food", title: "早餐", meta: "餐饮 · 现金 · 08:35", amount: 10 },
      { icon: "饮", type: "food", title: "饮料", meta: "餐饮 · 微信 · 14:03", amount: 15 }
    ]
  }
};

const categoryDetails = {
  food: {
    title: "餐饮明细",
    days: [
      { date: "6 月 23 日", records: ["早餐豆浆油条 · 08:16 · ¥12", "午餐黄焖鸡 · 12:24 · ¥28", "晚间咖啡 · 20:05 · ¥18"] },
      { date: "7 月 8 日", records: ["午餐套餐 · 12:18 · ¥42"] },
      { date: "7 月 10 日", records: ["工作餐 · 12:30 · ¥32", "酸奶 · 20:11 · ¥20"] }
    ]
  },
  phone: {
    title: "通讯明细",
    days: [
      { date: "7 月 6 日", records: ["手机话费 · 10:02 · ¥30"] },
      { date: "7 月 18 日", records: ["云盘会员 · 21:20 · ¥7"] }
    ]
  },
  fun: {
    title: "娱乐明细",
    days: [
      { date: "7 月 12 日", records: ["电影票 · 19:40 · ¥35"] }
    ]
  },
  beauty: {
    title: "美容明细",
    days: [
      { date: "7 月 15 日", records: ["洗护用品 · 18:21 · ¥29.65"] }
    ]
  },
  traffic: {
    title: "交通明细",
    days: [
      { date: "7 月 1 日", records: ["地铁通勤 · 08:26 · ¥6"] },
      { date: "7 月 8 日", records: ["地铁通勤 · 18:42 · ¥6"] }
    ]
  }
};

const trendDatasets = {
  day: {
    title: "本月每日支出走势",
    ai: "AI：12 日和 3 日是明显高点，购物类支出推高了峰值。",
    labels: ["07.01", "07.06", "07.11", "07.16", "07.21", "07.26", "07.31"],
    values: [116, 92, 120, 44, 86, 68, 34, 98, 76]
  },
  week: {
    title: "本月每周支出走势",
    ai: "AI：第二周支出最高，主要由购物和娱乐共同拉高。",
    labels: ["第 1 周", "第 2 周", "第 3 周", "第 4 周"],
    values: [96, 38, 74, 62]
  },
  month: {
    title: "近 6 个月支出走势",
    ai: "AI：7 月目前低于 6 月，但餐饮占比上升，需要继续观察。",
    labels: ["02 月", "03 月", "04 月", "05 月", "06 月", "07 月"],
    values: [84, 72, 64, 88, 52, 66]
  }
};

const wealthProducts = {
  etf: [
    {
      category: "ETF 基金",
      name: "半导体 ETF",
      code: "512480 · 行业主题",
      change: "+1.86%",
      direction: "up",
      holding: "持仓：¥ 3,200",
      risk: "风险：中高",
      trend: "近 30 日：波动偏大",
      points: "0,70 32,62 64,66 96,44 128,50 160,28 192,34 228,20 260,30",
      ai: "半导体主题波动更明显，不建议用短期生活费追高，可控制在可承受比例内。"
    },
    {
      category: "ETF 基金",
      name: "沪深 300 ETF",
      code: "510300 · 宽基指数",
      change: "-0.42%",
      direction: "down",
      holding: "持仓：¥ 5,000",
      risk: "风险：中",
      trend: "近 30 日：震荡",
      points: "0,48 32,45 64,54 96,50 128,42 160,46 192,40 228,45 260,43",
      ai: "沪深 300 属于宽基指数，适合作为长期观察标的，但仍需结合收入稳定性和现金流。"
    }
  ],
  fund: [
    {
      category: "主动基金",
      name: "消费精选混合",
      code: "示例 · 主动权益",
      change: "+0.68%",
      direction: "up",
      holding: "持仓：¥ 1,600",
      risk: "风险：中高",
      trend: "近 30 日：缓慢修复",
      points: "0,64 32,58 64,60 96,52 128,46 160,48 192,38 228,36 260,34",
      ai: "主动基金更依赖基金经理能力，建议关注长期风格是否稳定，不只看短期涨跌。"
    },
    {
      category: "主动基金",
      name: "稳健债券增强",
      code: "示例 · 固收+",
      change: "+0.18%",
      direction: "up",
      holding: "持仓：¥ 2,000",
      risk: "风险：中低",
      trend: "近 30 日：小幅上行",
      points: "0,58 32,56 64,55 96,52 128,50 160,48 192,46 228,43 260,42",
      ai: "固收+适合做稳健仓位，但仍可能有回撤，需要和现金管理产品区分。"
    }
  ],
  cash: [
    {
      category: "现金管理",
      name: "零钱通",
      code: "现金管理 · 灵活取用",
      change: "+0.01%",
      direction: "up",
      holding: "持仓：¥ 2,300",
      risk: "风险：低",
      trend: "近 30 日：稳定",
      points: "0,48 32,48 64,47 96,48 128,47 160,47 192,46 228,47 260,46",
      ai: "适合放短期备用金和日常周转资金，不适合期待高收益。"
    },
    {
      category: "现金管理",
      name: "货币基金 A",
      code: "示例 · 货币基金",
      change: "+0.02%",
      direction: "up",
      holding: "持仓：¥ 1,000",
      risk: "风险：低",
      trend: "近 30 日：稳定",
      points: "0,50 32,49 64,49 96,48 128,49 160,48 192,48 228,47 260,47",
      ai: "货币基金适合现金管理，主要看流动性、费率和历史稳定性。"
    }
  ],
  deposit: [
    {
      category: "存款",
      name: "三年定期存款",
      code: "银行存款 · 固定期限",
      change: "约 2.30%",
      direction: "up",
      holding: "持仓：¥ 10,000",
      risk: "风险：低",
      trend: "期限收益固定",
      points: "0,52 32,52 64,52 96,52 128,52 160,52 192,52 228,52 260,52",
      ai: "定期存款波动低，但流动性弱。不要把短期要用的钱全部锁定。"
    },
    {
      category: "存款",
      name: "大额存单",
      code: "银行存款 · 门槛较高",
      change: "约 2.55%",
      direction: "up",
      holding: "持仓：¥ 20,000",
      risk: "风险：低",
      trend: "期限收益固定",
      points: "0,50 32,50 64,50 96,50 128,50 160,50 192,50 228,50 260,50",
      ai: "大额存单适合确定不用的资金，选择前要看提前支取规则。"
    }
  ],
  bond: [
    {
      category: "债券固收",
      name: "国债逆回购",
      code: "短期固收 · 场内",
      change: "+0.06%",
      direction: "up",
      holding: "持仓：¥ 800",
      risk: "风险：低",
      trend: "短期利率波动",
      points: "0,56 32,44 64,52 96,48 128,58 160,46 192,50 228,42 260,49",
      ai: "适合短期闲钱管理，但收益会随市场资金面变化，不应当作长期高收益工具。"
    },
    {
      category: "债券固收",
      name: "中短债基金",
      code: "债券基金 · 中低波动",
      change: "-0.08%",
      direction: "down",
      holding: "持仓：¥ 1,500",
      risk: "风险：中低",
      trend: "近 30 日：轻微回撤",
      points: "0,42 32,43 64,40 96,46 128,44 160,49 192,51 228,48 260,53",
      ai: "中短债基金通常比权益类波动低，但仍有净值回撤，不等同于存款。"
    }
  ]
};

function formatNowForInput() {
  const now = new Date();
  now.setSeconds(0, 0);
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function restartMotion(element, className) {
  if (!canUseRichMotion || !element) {
    return;
  }

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), 460);
}

function restartLineMotion() {
  if (!canUseRichMotion || !detailLine) {
    return;
  }

  detailLine.style.animation = "none";
  void detailLine.getBoundingClientRect();
  detailLine.style.animation = "";
}

function normalizeViewName(hash) {
  const view = (hash || "#overview").replace("#", "");
  if (view === "quick-add") {
    return "overview";
  }

  return view || "overview";
}

function setActiveView(viewName, updateHash = false) {
  const view = normalizeViewName(`#${viewName}`);
  const hasView = Array.from(moduleViews).some((item) => item.dataset.view === view);
  const activeView = hasView ? view : "overview";
  const isLoginView = activeView === "login";

  moduleViews.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === activeView);
  });

  moduleGroups.forEach((group) => {
    group.classList.toggle("has-active", Boolean(group.querySelector(".module-view.is-active")));
  });

  navLinks.forEach((item) => {
    item.classList.toggle("active", normalizeViewName(item.getAttribute("href")) === activeView);
  });

  document.querySelectorAll(".infinite-menu-card").forEach((item) => {
    item.classList.toggle("is-selected", normalizeViewName(item.getAttribute("href")) === activeView);
  });

  document.body.classList.toggle("login-mode", isLoginView);
  if (isLoginView && aiAssistantPanel) {
    aiAssistantPanel.classList.remove("is-open");
    aiAssistantPanel.setAttribute("aria-hidden", "true");
    aiAssistantFab?.setAttribute("aria-expanded", "false");
  }

  if (updateHash) {
    history.pushState(null, "", `#${activeView}`);
  }
}

function formatCounterValue(value, decimals = 0) {
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function setCounterText(element, value, options = {}) {
  if (!element) {
    return;
  }

  const {
    prefix = "",
    suffix = "",
    decimals = 0,
    className = ""
  } = options;
  const formatted = formatCounterValue(value, decimals);
  const displayText = `${prefix}${formatted}${suffix}`;

  if (!canUseRichMotion) {
    element.textContent = displayText;
    return;
  }

  element.setAttribute("aria-label", displayText);
  element.dataset.counterValue = String(value);
  element.innerHTML = `
    <span class="counter-container ${className}">
      ${prefix ? `<span class="counter-prefix">${prefix}</span>` : ""}
      ${Array.from(formatted).map((char) => {
        if (!/\d/.test(char)) {
          return `<span class="counter-symbol">${char}</span>`;
        }

        const digit = Number(char);
        const numbers = Array.from({ length: 10 }, (_, index) => `<span>${index}</span>`).join("");
        return `
          <span class="counter-digit">
            <span class="counter-strip" style="transform: translateY(-${digit * 1.08}em)">
              ${numbers}
            </span>
          </span>
        `;
      }).join("")}
      ${suffix ? `<span class="counter-suffix">${suffix}</span>` : ""}
    </span>
  `;
}

function updateCounterText(element, value, options = {}) {
  if (!element || !canUseRichMotion || !element.querySelector(".counter-strip")) {
    setCounterText(element, value, options);
    return;
  }

  const {
    prefix = "",
    suffix = "",
    decimals = 0
  } = options;
  const formatted = formatCounterValue(value, decimals);
  const currentDigits = element.querySelectorAll(".counter-digit");
  const nextDigits = Array.from(formatted).filter((char) => /\d/.test(char));

  if (currentDigits.length !== nextDigits.length) {
    setCounterText(element, value, options);
    return;
  }

  const displayText = `${prefix}${formatted}${suffix}`;
  element.setAttribute("aria-label", displayText);
  element.dataset.counterValue = String(value);

  currentDigits.forEach((digitElement, index) => {
    const strip = digitElement.querySelector(".counter-strip");
    strip.style.transform = `translateY(-${Number(nextDigits[index]) * 1.08}em)`;
  });

  element.querySelector(".counter-prefix")?.replaceChildren(document.createTextNode(prefix));
  element.querySelector(".counter-suffix")?.replaceChildren(document.createTextNode(suffix));
}

function setupInitialCounters() {
  setCounterText(document.querySelector(".balance-card strong"), 3428.6, { prefix: "¥ ", decimals: 2 });
  setCounterText(document.querySelector(".metric-card strong"), 4286, { prefix: "¥ " });
  setCounterText(todayTotal, 168, { prefix: "¥ " });
  setCounterText(document.querySelector(".accent-green strong"), 23, { suffix: " 天" });
  setCounterText(selectedTotal, 168, { prefix: "- ¥" });
}

function setPercentCounter(element, label) {
  const trimmed = label.trim();
  const value = Number(trimmed.replace(/[^\d.]/g, ""));
  const prefix = trimmed.startsWith("-") ? "-" : trimmed.startsWith("约") ? "约 " : "+";

  updateCounterText(element, value, {
    prefix,
    suffix: "%",
    decimals: 2
  });
}

function setHoldingCounter(element, label) {
  const value = Number(label.replace(/[^\d.]/g, ""));
  updateCounterText(element, value, {
    prefix: "持仓：¥ "
  });
}

function setupBorderGlowCards(elements) {
  if (!canUseRichMotion || !window.matchMedia("(hover: hover)").matches) {
    return;
  }

  elements.forEach((card) => {
    if (card.dataset.borderGlowBound === "true") {
      return;
    }

    card.dataset.borderGlowBound = "true";
    card.classList.add("border-glow-card");

    const edgeLight = document.createElement("span");
    edgeLight.className = "edge-light";
    edgeLight.setAttribute("aria-hidden", "true");
    card.prepend(edgeLight);

      card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distanceX = Math.abs(x - centerX) / centerX;
      const distanceY = Math.abs(y - centerY) / centerY;
      const edgeProximity = Math.min(Math.max(Math.max(distanceX, distanceY) * 100, 0), 100);
      const angle = Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 90;

      card.classList.add("glow-active");
      card.style.setProperty("--edge-proximity", edgeProximity.toFixed(2));
      card.style.setProperty("--cursor-angle", `${angle.toFixed(2)}deg`);
    });

      card.addEventListener("pointerleave", () => {
      card.classList.remove("glow-active");
      card.style.setProperty("--edge-proximity", "0");
      });

  });
}

function bindTiltCards(elements) {
  if (!canUseRichMotion || !window.matchMedia("(hover: hover)").matches) {
    return;
  }

  elements.forEach((card) => {
    if (card.dataset.tiltBound === "true") {
      return;
    }

    card.dataset.tiltBound = "true";
    card.classList.add("tilt-card");

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 10).toFixed(2)}deg`);
      card.style.setProperty("--tilt-light-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--tilt-light-y", `${((y + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--tilt-scale", "1.018");
      card.style.setProperty("--lift", "-5px");
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-scale", "1");
      card.style.setProperty("--lift", "0px");
    });
  });
}

function setupVariableProximityText() {
  if (!canUseRichMotion) {
    return;
  }

  const textTargets = document.querySelectorAll(".variable-proximity-source, .panel-title h2, .brand strong");
  const pointer = { x: -9999, y: -9999 };
  const radius = 96;

  textTargets.forEach((target) => {
    if (target.dataset.variableProximity === "true") {
      return;
    }

    const label = target.textContent.trim();
    if (!label) {
      return;
    }

    target.dataset.variableProximity = "true";
    target.classList.add("variable-proximity");
    target.setAttribute("aria-label", label);
    target.textContent = "";

    Array.from(label).forEach((char) => {
      const letter = document.createElement("span");
      letter.className = "variable-letter";
      letter.setAttribute("aria-hidden", "true");
      letter.textContent = char === " " ? "\u00a0" : char;
      target.appendChild(letter);
    });
  });

  const letters = Array.from(document.querySelectorAll(".variable-letter"));

  function updatePointer(clientX, clientY) {
    pointer.x = clientX;
    pointer.y = clientY;
  }

  function animateLetters() {
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(pointer.x - centerX, pointer.y - centerY);
      const force = Math.max(0, 1 - distance / radius);
      const weight = Math.round(520 + 420 * force);
      const opticalSize = Math.round(12 + 28 * force);

      letter.style.fontVariationSettings = `'wght' ${weight}, 'opsz' ${opticalSize}`;
      letter.style.fontWeight = weight;
      letter.style.transform = `translateY(${(-3 * force).toFixed(2)}px) scale(${(1 + 0.08 * force).toFixed(3)})`;
      letter.style.color = force > 0.08 ? "var(--neon)" : "";
      letter.style.textShadow = force > 0.08 ? `0 0 ${Math.round(18 * force)}px rgba(215, 255, 50, ${0.42 * force})` : "";
    });

    requestAnimationFrame(animateLetters);
  }

  window.addEventListener("pointermove", (event) => updatePointer(event.clientX, event.clientY));
  window.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (touch) {
      updatePointer(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  animateLetters();
}

function splitText(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("zh-CN", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }

  return Array.from(text);
}

function renderRotatingText(container, text, isExiting = false) {
  const word = document.createElement("span");
  word.className = `rotating-text-current${isExiting ? " is-exiting" : ""}`;

  splitText(text).forEach((char, index) => {
    const letter = document.createElement("span");
    letter.className = "rotate-char";
    letter.style.setProperty("--char-index", index);
    letter.textContent = char;
    word.appendChild(letter);
  });

  container.appendChild(word);
  return word;
}

function setupRotatingText() {
  document.querySelectorAll(".rotating-text").forEach((container) => {
    if (container.dataset.rotatingReady === "true") {
      return;
    }

    let texts = [];
    try {
      texts = JSON.parse(container.dataset.rotatingText || "[]");
    } catch (error) {
      texts = [];
    }

    if (texts.length === 0) {
      return;
    }

    container.dataset.rotatingReady = "true";
    container.setAttribute("aria-live", "polite");
    container.textContent = "";

    let currentIndex = 0;
    let currentWord = renderRotatingText(container, texts[currentIndex]);

    if (!canUseRichMotion || texts.length === 1) {
      return;
    }

    window.setInterval(() => {
      const nextIndex = currentIndex === texts.length - 1 ? 0 : currentIndex + 1;
      const exitingWord = currentWord;

      exitingWord.classList.add("is-exiting");
      window.setTimeout(() => {
        exitingWord.remove();
      }, 620);

      currentIndex = nextIndex;
      currentWord = renderRotatingText(container, texts[currentIndex]);
    }, 2200);
  });
}

function setupPageMotion() {
  if (!canUseRichMotion) {
    setupRotatingText();
    return;
  }

  document.body.classList.add("motion-ready");

  const motionItems = document.querySelectorAll(".hero-panel, .balance-card, .metric-card, .panel");
  motionItems.forEach((item, index) => {
    item.classList.add("motion-item");
    item.style.animationDelay = `${Math.min(index * 55, 420)}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  motionItems.forEach((item) => observer.observe(item));
  const interactiveCards = document.querySelectorAll(".balance-card, .metric-card, .panel");
  setupBorderGlowCards(interactiveCards);
  bindTiltCards(interactiveCards);
  setupRotatingText();
  setupVariableProximityText();
}

function setupInfiniteNavMenu() {
  const menuButton = document.querySelector(".menu-orb-button");
  const overlay = document.querySelector(".infinite-nav-overlay");
  const closeButton = document.querySelector(".infinite-nav-close");
  const sphere = document.querySelector(".infinite-menu-sphere");
  const cards = document.querySelectorAll(".infinite-menu-card");
  const title = document.querySelector("#infiniteNavTitle");
  const desc = document.querySelector("#infiniteNavDesc");

  if (!menuButton || !overlay || !sphere) {
    return;
  }

  let spin = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragRotationY = 0;
  let dragRotationX = -12;
  let isDragging = false;
  let animationFrameId = 0;

  function setActiveCard(card) {
    cards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    title.textContent = card.dataset.title || card.textContent.trim();
    desc.textContent = card.dataset.description || "";
  }

  function updateSphere() {
    sphere.style.setProperty("--orbit-spin", `${(spin + dragRotationY).toFixed(2)}deg`);
    sphere.style.setProperty("--menu-spin", `${spin.toFixed(2)}deg`);
    sphere.style.setProperty("--menu-ry", `${dragRotationY.toFixed(2)}deg`);
    sphere.style.setProperty("--menu-rx", `${dragRotationX.toFixed(2)}deg`);
  }

  function animateSphere() {
    if (!isDragging && canUseRichMotion) {
      spin += 0.16;
      updateSphere();
    }

    animationFrameId = window.requestAnimationFrame(animateSphere);
  }

  function openMenu() {
    overlay.classList.add("is-open");
    menuButton.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (!animationFrameId) {
      animateSphere();
    }
  }

  function closeMenu() {
    overlay.classList.remove("is-open");
    menuButton.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => setActiveCard(card));
    card.addEventListener("focus", () => setActiveCard(card));
    card.addEventListener("click", (event) => {
      event.preventDefault();
      cards.forEach((item) => item.classList.remove("is-selected"));
      card.classList.add("is-selected");
      setActiveView(normalizeViewName(card.getAttribute("href")), true);
      window.setTimeout(() => {
        closeMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 180);
    });
  });

  sphere.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    sphere.setPointerCapture(event.pointerId);
  });

  sphere.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    dragRotationY += (event.clientX - dragStartX) * 0.24;
    dragRotationX = Math.max(-34, Math.min(12, dragRotationX - (event.clientY - dragStartY) * 0.1));
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    updateSphere();
  });

  sphere.addEventListener("pointerup", () => {
    isDragging = false;
  });

  sphere.addEventListener("pointercancel", () => {
    isDragging = false;
  });

  menuButton.addEventListener("click", () => {
    if (overlay.classList.contains("is-open")) {
      closeMenu();
      return;
    }

    openMenu();
  });

  closeButton.addEventListener("click", closeMenu);
  overlay.querySelector(".infinite-nav-backdrop").addEventListener("click", closeMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  setActiveCard(cards[0]);
  updateSphere();
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getGeneratedRecords(day, year, month) {
  const seed = (year * 31 + month * 17 + Number(day) * 13) % 11;
  if (seed < 4) {
    return {
      total: 0,
      ai: `${year} 年 ${month} 月 ${day} 日暂无记录。AI 会在你记第一笔后自动分析当天消费结构。`,
      records: []
    };
  }

  const food = 18 + seed * 4;
  const traffic = seed % 3 === 0 ? 8 : 6;
  const shop = seed > 7 ? 48 + seed * 9 : 0;
  const records = [
    { icon: "餐", type: "food", title: "日常餐饮", meta: `餐饮 · 微信 · 12:${String(10 + seed).padStart(2, "0")}`, amount: food },
    { icon: "行", type: "ride", title: "通勤出行", meta: `交通 · 微信 · 18:${String(20 + seed).padStart(2, "0")}`, amount: traffic }
  ];

  if (shop > 0) {
    records.push({ icon: "购", type: "shop", title: "生活购物", meta: `购物 · 支付宝 · 21:${String(8 + seed).padStart(2, "0")}`, amount: shop });
  }

  const total = records.reduce((sum, record) => sum + record.amount, 0);
  return {
    total,
    ai: `${year} 年 ${month} 月 ${day} 日有 ${records.length} 笔消费。AI 判断支出以餐饮和日常消费为主，可继续补充备注提高分析准确度。`,
    records
  };
}

function getDayData(day, year = currentCalendarYear, month = currentCalendarMonth) {
  if (year === 2026 && month === 7 && dayRecords[day]) {
    return dayRecords[day];
  }

  return getGeneratedRecords(day, year, month);
}

function updateDayPie(data) {
  if (!dayPie) {
    return;
  }

  const totals = data.records.reduce((result, record) => {
    const key = record.type === "ride" ? "交通" : record.type === "shop" ? "购物" : "餐饮";
    result[key] = (result[key] || 0) + record.amount;
    return result;
  }, {});

  const total = Math.max(data.total, 1);
  const food = Math.round((totals["餐饮"] || 0) / total * 100);
  const traffic = Math.round((totals["交通"] || 0) / total * 100);
  const shop = Math.max(0, 100 - food - traffic);

  dayPie.style.setProperty("--day-pie", `conic-gradient(var(--neon) 0 ${food}%, var(--green) ${food}% ${food + traffic}%, var(--orange) ${food + traffic}% 100%)`);
  dayPie.innerHTML = `
    <span>餐饮 ${food}%</span>
    <span>交通 ${traffic}%</span>
    <span>购物 ${shop}%</span>
  `;
}

function renderCalendar(year = currentCalendarYear, month = currentCalendarMonth) {
  currentCalendarYear = Number(year);
  currentCalendarMonth = Number(month);
  calendarYear.value = String(currentCalendarYear);
  calendarMonth.value = String(currentCalendarMonth);
  calendarTitle.textContent = `${currentCalendarYear} 年 ${currentCalendarMonth} 月消费热力`;

  const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
  const firstWeekday = (new Date(currentCalendarYear, currentCalendarMonth - 1, 1).getDay() + 6) % 7;
  const daysInMonth = getDaysInMonth(currentCalendarYear, currentCalendarMonth);
  const prevDays = getDaysInMonth(currentCalendarYear, currentCalendarMonth - 1 || 12);
  const cells = weekdays.map((day) => `<span>${day}</span>`);

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    cells.push(`<button class="muted" type="button" disabled>${prevDays - index}</button>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const data = getDayData(day, currentCalendarYear, currentCalendarMonth);
    const classes = [
      data.total > 0 ? "spent" : "",
      data.total >= 160 ? "high" : "",
      day === selectedCalendarDay ? "today" : ""
    ].filter(Boolean).join(" ");
    cells.push(`
      <button class="${classes}" type="button" data-day="${day}">
        ${day}${data.total > 0 ? `<small>¥${data.total}</small>` : ""}
      </button>
    `);
  }

  calendarGrid.innerHTML = cells.join("");
}

function renderRecords(day, year = currentCalendarYear, month = currentCalendarMonth) {
  selectedCalendarDay = Number(day);
  const data = getDayData(selectedCalendarDay, Number(year), Number(month)) || {
    total: 0,
    ai: `${year} 年 ${month} 月 ${day} 日暂无记录。AI 会在你记第一笔后自动分析当天消费结构。`,
    records: []
  };

  selectedDate.textContent = `${year} 年 ${month} 月 ${selectedCalendarDay} 日`;
  updateCounterText(selectedTotal, data.total, { prefix: "- ¥" });
  updateCounterText(todayTotal, data.total, { prefix: "¥ " });
  todayHint.textContent = data.total > 0 ? "AI：已根据当天记录自动更新分析。" : "AI：当天暂无消费记录。";
  calendarAi.textContent = data.ai;
  recordAi.textContent = data.ai;
  updateDayPie(data);
  restartMotion(recordsPanel, "is-updating");

  if (data.records.length === 0) {
    recordList.innerHTML = `<div class="empty-record">这一天还没有消费记录，添加一笔后 AI 会自动分析。</div>`;
    return;
  }

  recordList.innerHTML = data.records.map((record) => `
    <div class="record-item">
      <span class="record-icon ${record.type}">${record.icon}</span>
      <div><strong>${record.title}</strong><small>${record.meta}</small></div>
      <b>- ¥${record.amount}</b>
    </div>
  `).join("");
  recordList.querySelectorAll(".record-item b").forEach((amountElement, index) => {
    setCounterText(amountElement, data.records[index].amount, { prefix: "- ¥" });
  });
}

function shiftCalendarMonth(offset) {
  const nextDate = new Date(currentCalendarYear, currentCalendarMonth - 1 + offset, 1);
  selectedCalendarDay = Math.min(selectedCalendarDay, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth() + 1));
  renderCalendar(nextDate.getFullYear(), nextDate.getMonth() + 1);
  renderRecords(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
}

function updateTrend(period) {
  const dataset = trendDatasets[period] || trendDatasets.day;
  const width = 320;
  const height = 150;
  const values = dataset.values;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : index * (width / (values.length - 1));
    const ratio = (value - minValue) / Math.max(maxValue - minValue, 1);
    const y = 126 - ratio * 92;
    return { x, y };
  });
  const pointText = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaText = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} ${points.slice(1).map((point) => `L${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} L${width} ${height} L0 ${height} Z`;

  trendTitle.textContent = dataset.title;
  trendAi.textContent = dataset.ai;
  trendLine.setAttribute("points", pointText);
  trendArea.setAttribute("d", areaText);
  trendDots.innerHTML = points.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4"></circle>`).join("");
  trendLabels.innerHTML = dataset.labels.map((label) => `<span>${label}</span>`).join("");
}

function renderCategoryDetail(category) {
  const detail = categoryDetails[category] || categoryDetails.food;
  return `
    <strong>${detail.title}</strong>
    <div>
      ${detail.days.map((day) => `
    <div class="category-day">
      <h4>${day.date}</h4>
      ${day.records.map((record) => {
        const parts = record.split(" · ");
        return `<div class="category-line"><span>${parts.slice(0, -1).join(" · ")}</span><b>${parts.at(-1)}</b></div>`;
      }).join("")}
    </div>
      `).join("")}
    </div>
  `;
}

function setPieActiveCategory(category) {
  const donut = document.querySelector(".report-donut");
  const hasCategory = Boolean(category);

  donut?.classList.toggle("is-interacting", hasCategory);
  donut?.setAttribute("data-active-category", category || "");

  document.querySelectorAll(".donut-slice").forEach((slice) => {
    slice.classList.toggle("is-active", slice.dataset.category === category);
  });

  document.querySelectorAll(".rank-row").forEach((row) => {
    row.classList.toggle("is-pie-active", row.dataset.category === category);
  });

  document.querySelectorAll(".donut-label").forEach((label) => {
    label.classList.toggle("is-active", label.classList.contains(`label-${category}`));
  });
}

function getDonutCategoryFromPoint(event, donut) {
  const rect = donut.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  const distance = Math.hypot(x, y);
  const innerRadius = rect.width * 0.33;
  const outerRadius = rect.width * 0.52;

  if (distance < innerRadius || distance > outerRadius) {
    return "";
  }

  const angle = (Math.atan2(y, x) * 180 / Math.PI + 450) % 360;
  const percent = angle / 360 * 100;
  if (percent <= 31) {
    return "food";
  }
  if (percent <= 54) {
    return "phone";
  }
  if (percent <= 76) {
    return "fun";
  }
  if (percent <= 94) {
    return "beauty";
  }
  return "traffic";
}

function toggleCategoryDetail(category) {
  const row = document.querySelector(`.rank-row[data-category="${category}"]`);
  const panel = document.querySelector(`[data-category-detail="${category}"]`);
  if (!row || !panel) {
    return;
  }

  const shouldOpen = !panel.classList.contains("is-open");
  row.classList.toggle("is-open", shouldOpen);
  panel.classList.toggle("is-open", shouldOpen);
  if (shouldOpen && !panel.innerHTML.trim()) {
    panel.innerHTML = renderCategoryDetail(category);
  }

  if (shouldOpen) {
    setPieActiveCategory(category);
    return;
  }

  const opened = document.querySelector(".rank-row.is-open");
  setPieActiveCategory(opened?.dataset.category || "");
}

function setupStatsInteractions() {
  periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      periodButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateTrend(button.dataset.period);
    });
  });

  document.querySelectorAll(".rank-row, .donut-slice").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (item.classList.contains("donut-slice")) {
        event.stopPropagation();
      }
      toggleCategoryDetail(item.dataset.category);
    });
  });

  document.querySelector(".report-donut")?.addEventListener("click", (event) => {
    const category = getDonutCategoryFromPoint(event, event.currentTarget);
    if (category) {
      toggleCategoryDetail(category);
    }
  });

  document.querySelector(".report-donut")?.addEventListener("pointermove", (event) => {
    const category = getDonutCategoryFromPoint(event, event.currentTarget);
    if (category) {
      setPieActiveCategory(category);
    }
  });

  document.querySelectorAll(".donut-slice").forEach((slice) => {
    slice.addEventListener("mouseenter", () => setPieActiveCategory(slice.dataset.category));
    slice.addEventListener("focus", () => setPieActiveCategory(slice.dataset.category));
  });

  document.querySelector(".report-donut")?.addEventListener("mouseleave", () => {
    const opened = document.querySelector(".rank-row.is-open");
    setPieActiveCategory(opened?.dataset.category || "");
  });

  updateTrend("day");
}

function setupCalendarControls() {
  calendarGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-day]");
    if (!button || button.disabled) {
      return;
    }

    document.querySelectorAll(".calendar-grid button").forEach((item) => item.classList.remove("today"));
    button.classList.add("today");
    renderRecords(button.dataset.day, currentCalendarYear, currentCalendarMonth);
    setActiveView("details", true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  calendarYear.addEventListener("change", () => {
    renderCalendar(calendarYear.value, calendarMonth.value);
    renderRecords(Math.min(selectedCalendarDay, getDaysInMonth(currentCalendarYear, currentCalendarMonth)));
  });
  calendarMonth.addEventListener("change", () => {
    renderCalendar(calendarYear.value, calendarMonth.value);
    renderRecords(Math.min(selectedCalendarDay, getDaysInMonth(currentCalendarYear, currentCalendarMonth)));
  });
  prevMonth.addEventListener("click", () => shiftCalendarMonth(-1));
  nextMonth.addEventListener("click", () => shiftCalendarMonth(1));
}

function setupPrivacyMode() {
  if (!privacyToggle || !profilePanel) {
    return;
  }

  const sensitiveItems = profilePanel.querySelectorAll(".sensitive");
  privacyToggle.addEventListener("click", () => {
    const isPrivate = !profilePanel.classList.contains("is-private");
    profilePanel.classList.toggle("is-private", isPrivate);
    privacyToggle.setAttribute("aria-pressed", String(isPrivate));
    privacyToggle.textContent = isPrivate ? "退出隐私" : "隐私模式";
    sensitiveItems.forEach((item) => {
      item.textContent = isPrivate ? "****" : item.dataset.private;
    });
  });
}

function setupProfileSettings() {
  profileSettings?.addEventListener("click", () => {
    const shouldShow = apiSettingsPanel?.hasAttribute("hidden");
    apiSettingsPanel?.toggleAttribute("hidden", !shouldShow);
    profileSettings.textContent = shouldShow ? "收起 AI 设置" : "AI 接口设置";
  });

  saveApiSettings?.addEventListener("click", () => {
    const base = apiBaseUrl?.value.trim() || "未填写 API 地址";
    const model = apiModel?.value.trim() || "未填写模型";
    const hasKey = Boolean(apiKey?.value.trim());
    const status = hasKey ? `已保存：${model} · ${base}` : "已保存接口信息，但还没有填写 API Key";

    apiSettingsStatus.textContent = status;
    if (aiConnectionStatus) {
      aiConnectionStatus.textContent = hasKey ? `已连接设置：${model}` : "未填写 API Key，仍使用本地原型回复";
    }
  });

  logoutButton?.addEventListener("click", () => {
    aiAssistantPanel?.classList.remove("is-open");
    aiAssistantPanel?.setAttribute("aria-hidden", "true");
    aiAssistantFab?.setAttribute("aria-expanded", "false");
    setActiveView("login", true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function appendAiMessage(text, role = "assistant") {
  if (!aiChatList) {
    return;
  }

  const message = document.createElement("p");
  message.className = `ai-message ${role}`;
  message.textContent = text;
  aiChatList.appendChild(message);
  aiChatList.scrollTop = aiChatList.scrollHeight;
}

function setupAiAssistant() {
  if (!aiAssistantFab || !aiAssistantPanel) {
    return;
  }

  function toggleAssistant(shouldOpen) {
    aiAssistantPanel.classList.toggle("is-open", shouldOpen);
    aiAssistantPanel.setAttribute("aria-hidden", String(!shouldOpen));
    aiAssistantFab.setAttribute("aria-expanded", String(shouldOpen));
    if (shouldOpen) {
      aiChatInput?.focus();
    }
  }

  aiAssistantFab.addEventListener("click", () => {
    toggleAssistant(!aiAssistantPanel.classList.contains("is-open"));
  });

  closeAiAssistant?.addEventListener("click", () => toggleAssistant(false));

  aiChatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = aiChatInput?.value.trim();
    if (!question) {
      return;
    }

    appendAiMessage(question, "user");
    aiChatInput.value = "";

    const hasKey = Boolean(apiKey?.value.trim());
    const model = apiModel?.value.trim() || "默认模型";
    const prefix = hasKey ? `已按 ${model} 的连接设置准备分析。` : "当前是页面原型回复，还没有真实调用 API。";
    appendAiMessage(`${prefix} 我会结合首页余额、日历账单、统计结构和理财持仓给你建议；正式接入后这里会走你在“我的”里配置的 AI API。`);
  });
}

function renderProductDetail(product) {
  detailCategory.textContent = product.category;
  detailName.textContent = product.name;
  detailCode.textContent = product.code;
  detailChange.className = product.direction;
  setPercentCounter(detailChange, product.change);
  detailLine.setAttribute("points", product.points);
  setHoldingCounter(detailHolding, product.holding);
  detailRisk.textContent = product.risk;
  detailTrend.textContent = product.trend;
  detailAi.textContent = product.ai;
  restartLineMotion();
  restartMotion(productDetail, "is-switching");
}

function renderProductList(category) {
  const products = wealthProducts[category];
  productList.innerHTML = products.map((product, index) => `
    <button class="product-summary ${index === 0 ? "active" : ""}" type="button" data-category="${category}" data-index="${index}">
      <span><strong>${product.name}</strong><span>${product.code}</span></span>
      <b class="${product.direction}">${product.change}</b>
    </button>
  `).join("");
  productList.querySelectorAll(".product-summary b").forEach((changeElement, index) => {
    setPercentCounter(changeElement, products[index].change);
  });
  setupBorderGlowCards(productList.querySelectorAll(".product-summary"));
  bindTiltCards(productList.querySelectorAll(".product-summary"));
  renderProductDetail(products[0]);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView(normalizeViewName(link.getAttribute("href")), true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProductList(button.dataset.category);
  });
});

productList.addEventListener("click", (event) => {
  const button = event.target.closest(".product-summary");
  if (!button) {
    return;
  }
  productList.querySelectorAll(".product-summary").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderProductDetail(wealthProducts[button.dataset.category][Number(button.dataset.index)]);
});

document.querySelectorAll(".type-switch button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".type-switch button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

document.querySelector(".floating-add").addEventListener("click", () => {
  setActiveView("overview", true);
  document.querySelector(".add-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll(".login-submit, .wechat-button").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView("overview", true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

entryTime.value = formatNowForInput();
setupPageMotion();
setupInfiniteNavMenu();
setupInitialCounters();
setupCalendarControls();
setupStatsInteractions();
setupPrivacyMode();
setupProfileSettings();
setupAiAssistant();
renderCalendar(currentCalendarYear, currentCalendarMonth);
renderRecords("8", currentCalendarYear, currentCalendarMonth);
renderProductList("etf");
setActiveView(normalizeViewName(window.location.hash), false);

window.addEventListener("popstate", () => {
  setActiveView(normalizeViewName(window.location.hash), false);
});
