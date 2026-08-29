import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { GraphicComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { api, ApiError, clearSession, getSession, saveSession } from "./api.js";

echarts.use([PieChart, GraphicComponent, TooltipComponent, CanvasRenderer]);

const navLinks = document.querySelectorAll(".bottom-nav a, .nav-list a");
const sideNav = document.querySelector(".side-nav");
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
const calendarMonthTrigger = document.querySelector("#calendarMonthTrigger");
const calendarMonthText = document.querySelector("#calendarMonthText");
const calendarMonthPopover = document.querySelector("#calendarMonthPopover");
const calendarMonthGrid = document.querySelector("#calendarMonthGrid");
const prevYear = document.querySelector("#prevYear");
const nextYear = document.querySelector("#nextYear");
const prevMonth = document.querySelector("#prevMonth");
const nextMonth = document.querySelector("#nextMonth");
const prevDetailDay = document.querySelector("#prevDetailDay");
const nextDetailDay = document.querySelector("#nextDetailDay");
const detailDatePicker = document.querySelector("#detailDatePicker");
const detailDateTrigger = document.querySelector("#detailDateTrigger");
const detailDateText = document.querySelector("#detailDateText");
const detailDatePopover = document.querySelector("#detailDatePopover");
const detailPickerTitle = document.querySelector("#detailPickerTitle");
const detailPickerGrid = document.querySelector("#detailPickerGrid");
const detailPickerPrevMonth = document.querySelector("#detailPickerPrevMonth");
const detailPickerNextMonth = document.querySelector("#detailPickerNextMonth");
const detailPickerToday = document.querySelector("#detailPickerToday");
const dayPie = document.querySelector(".day-pie");
const entryForm = document.querySelector("#entryForm");
const entryModal = document.querySelector("#quick-add");
const entryModalBackdrop = document.querySelector("#entryModalBackdrop");
const entryModalClose = document.querySelector("#entryModalClose");
const entryAmount = document.querySelector("#entryAmount");
const entryCategory = document.querySelector("#entryCategory");
const entryAccount = document.querySelector("#entryAccount");
const entryTargetAccountField = document.querySelector("#entryTargetAccountField");
const entryTargetAccount = document.querySelector("#entryTargetAccount");
const entryTag = document.querySelector("#entryTag");
const entryRemark = document.querySelector("#entryRemark");
const saveRecordButton = document.querySelector("#saveRecordButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const entryModeHint = document.querySelector("#entryModeHint");
const periodButtons = document.querySelectorAll(".period-switch button");
const trendTitle = document.querySelector("#trendTitle");
const trendAi = document.querySelector("#trendAi");
const trendArea = document.querySelector("#trendArea");
const trendLine = document.querySelector("#trendLine");
const trendDots = document.querySelector("#trendDots");
const trendLabels = document.querySelector("#trendLabels");
const trendChart = document.querySelector(".expense-line-chart");
const trendGuide = document.querySelector("#trendGuide");
const trendFocus = document.querySelector("#trendFocus");
const trendTooltipText = document.querySelector("#trendTooltipText");
let currentTrendPoints = [];
let currentTrendValues = [];
const expensePieChartElement = document.querySelector("#expensePieChart");
const categoryRankTitle = document.querySelector("#categoryRankTitle");
const statsStructureAi = document.querySelector("#statsStructureAi");
const rankList = document.querySelector(".rank-list");
const monthBalance = document.querySelector("#monthBalance");
const monthExpense = document.querySelector("#monthExpense");
const monthExpenseHint = document.querySelector("#monthExpenseHint");
const monthTransactionCount = document.querySelector("#monthTransactionCount");
const monthTransactionHint = document.querySelector("#monthTransactionHint");
const monthlyBudgetProgress = document.querySelector("#monthlyBudgetProgress");
const monthlyBudgetHint = document.querySelector("#monthlyBudgetHint");
let expensePieData = [];
let expensePieChart = null;
let currentStatsPeriod = "day";
const privacyToggle = document.querySelector("#privacyToggle");
const profilePanel = document.querySelector(".profile-panel");
const logoutButton = document.querySelector("#logoutButton");
const profileMain = document.querySelector("#profileMain");
const profileSubpages = document.querySelectorAll(".profile-subpage");
const profileDisplayName = document.querySelector("#profileDisplayName");
const profileName = document.querySelector("#profileName");
const profileEmail = document.querySelector("#profileEmail");
const saveProfileInfo = document.querySelector("#saveProfileInfo");
const profileInfoStatus = document.querySelector("#profileInfoStatus");
const boundPhone = document.querySelector("#boundPhone");
const phoneNumber = document.querySelector("#phoneNumber");
const phoneCode = document.querySelector("#phoneCode");
const sendPhoneCode = document.querySelector("#sendPhoneCode");
const bindPhone = document.querySelector("#bindPhone");
const unbindPhone = document.querySelector("#unbindPhone");
const phoneStatus = document.querySelector("#phoneStatus");
const currentPassword = document.querySelector("#currentPassword");
const newPassword = document.querySelector("#newPassword");
const confirmPassword = document.querySelector("#confirmPassword");
const updatePassword = document.querySelector("#updatePassword");
const passwordStatus = document.querySelector("#passwordStatus");
const fundAccountList = document.querySelector("#fundAccountList");
const accountEditor = document.querySelector("#accountEditor");
const editingAccountId = document.querySelector("#editingAccountId");
const accountName = document.querySelector("#accountName");
const accountType = document.querySelector("#accountType");
const saveAccountButton = document.querySelector("#saveAccount");
const cancelAccountEdit = document.querySelector("#cancelAccountEdit");
const accountSettingsStatus = document.querySelector("#accountSettingsStatus");
const accountBalanceEditor = document.querySelector("#accountBalanceEditor");
const balanceAccountName = document.querySelector("#balanceAccountName");
const balanceAccountId = document.querySelector("#balanceAccountId");
const targetAccountBalance = document.querySelector("#targetAccountBalance");
const balanceAdjustmentNote = document.querySelector("#balanceAdjustmentNote");
const cancelBalanceAdjustment = document.querySelector("#cancelBalanceAdjustment");
const expenseCategoryList = document.querySelector("#expenseCategoryList");
const customTagList = document.querySelector("#customTagList");
const newExpenseCategory = document.querySelector("#newExpenseCategory");
const newCustomTag = document.querySelector("#newCustomTag");
const addExpenseCategory = document.querySelector("#addExpenseCategory");
const cancelCategoryEdit = document.querySelector("#cancelCategoryEdit");
const categorySettingsStatus = document.querySelector("#categorySettingsStatus");
const monthlyBudget = document.querySelector("#monthlyBudget");
const foodBudget = document.querySelector("#foodBudget");
const shoppingBudget = document.querySelector("#shoppingBudget");
const budgetAlert = document.querySelector("#budgetAlert");
const budgetSettingsStatus = document.querySelector("#budgetSettingsStatus");
const exportStartDate = document.querySelector("#exportStartDate");
const exportEndDate = document.querySelector("#exportEndDate");
const exportFormat = document.querySelector("#exportFormat");
const exportStatus = document.querySelector("#exportStatus");
const feedbackType = document.querySelector("#feedbackType");
const feedbackContent = document.querySelector("#feedbackContent");
const feedbackStatus = document.querySelector("#feedbackStatus");
const apiBaseUrl = document.querySelector("#apiBaseUrl");
const apiKey = document.querySelector("#apiKey");
const apiModel = document.querySelector("#apiModel");
const saveApiSettings = document.querySelector("#saveApiSettings");
const toggleApiKey = document.querySelector("#toggleApiKey");
const currentModelName = document.querySelector("#currentModelName");
const localModelStatus = document.querySelector("#localModelStatus");
const localModelProgress = document.querySelector("#localModelProgress");
const aiApiFields = document.querySelector("#aiApiFields");
const aiModeButtons = document.querySelectorAll("[data-ai-mode]");
const LOCAL_MODEL_NAME = "Qwen2.5-0.5B-Instruct";
const TRANSACTION_QUERY_LIMIT = 100;
let activeAiMode = "local";
let qwenWorker;
let qwenRequestId = 0;
const pendingQwenRequests = new Map();
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
const loginForm = document.querySelector(".login-card");
const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");
const loginNicknameField = document.querySelector("#loginNicknameField");
const loginNickname = document.querySelector("#loginNickname");
const loginStatus = document.querySelector("#loginStatus");
const loginSubmit = document.querySelector(".login-submit");
const authModeButtons = document.querySelectorAll("[data-auth-mode]");
let currentCalendarYear = 2026;
let currentCalendarMonth = 7;
let selectedCalendarDay = 8;
let dayExpensePieChart = null;
let currentDayPieData = null;
let editingRecordId = "";
let editingRecordDateKey = "";
let activeAuthMode = "login";
const backendState = {
  authenticated: false,
  user: null,
  ledger: null,
  accounts: [],
  categories: { EXPENSE: [], INCOME: [] },
  calendarDays: {},
  dayRecords: {},
  budgets: []
};
let refreshProfileManagement = () => {};
let storedDayRecords = {};
try {
  storedDayRecords = JSON.parse(localStorage.getItem("qianji-day-records") || "{}");
} catch {
  storedDayRecords = {};
}

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

const categoryVisuals = {
  food: { name: "餐饮", icon: "餐", color: "#d7ff32" },
  phone: { name: "通讯", icon: "讯", color: "#39c6ff" },
  fun: { name: "娱乐", icon: "娱", color: "#a98bff" },
  beauty: { name: "美容", icon: "美", color: "#ff8a5b" },
  traffic: { name: "交通", icon: "行", color: "#57f28f" }
};

const statsDatasets = {
  day: {
    scopeLabel: "本月支出",
    rankTitle: "本月每日支出分类",
    structureAi: "按日观察，餐饮是最稳定的高频支出；通讯和娱乐更集中在少数日期，建议优先检查高峰日。",
    trend: {
      title: "本月每日支出走势",
      ai: "AI：12 日是本月明显高点，单日购物和娱乐共同推高了峰值。",
      labels: ["07.01", "07.05", "07.08", "07.10", "07.12", "07.15", "07.18"],
      values: [46, 92, 168, 58, 310, 73, 25]
    },
    categories: [
      { category: "food", value: 51 }, { category: "phone", value: 37 },
      { category: "fun", value: 35 }, { category: "beauty", value: 29.65 },
      { category: "traffic", value: 13 }
    ],
    details: {
      food: { title: "餐饮日明细", days: [{ date: "7 月 8 日", records: ["午餐套餐 · 12:18 · ¥42"] }, { date: "7 月 10 日", records: ["工作餐 · 12:30 · ¥32", "酸奶 · 20:11 · ¥20"] }] },
      phone: { title: "通讯日明细", days: [{ date: "7 月 6 日", records: ["手机话费 · 10:02 · ¥30"] }, { date: "7 月 18 日", records: ["云盘会员 · 21:20 · ¥7"] }] },
      fun: { title: "娱乐日明细", days: [{ date: "7 月 12 日", records: ["电影票 · 19:40 · ¥35"] }] },
      beauty: { title: "美容日明细", days: [{ date: "7 月 15 日", records: ["洗护用品 · 18:21 · ¥29.65"] }] },
      traffic: { title: "交通日明细", days: [{ date: "7 月 1 日", records: ["地铁通勤 · 08:26 · ¥6"] }, { date: "7 月 8 日", records: ["地铁通勤 · 18:42 · ¥7"] }] }
    }
  },
  week: {
    scopeLabel: "本月周汇总",
    rankTitle: "本月每周支出分类",
    structureAi: "第二周支出最高，餐饮和通讯都有集中支付；第三周娱乐占比上升，适合单独核对计划外消费。",
    trend: {
      title: "本月每周支出走势",
      ai: "AI：第二周达到峰值，第四周已经回落，周度节奏正在恢复。",
      labels: ["第 1 周", "第 2 周", "第 3 周", "第 4 周"],
      values: [174, 612, 286, 198]
    },
    categories: [
      { category: "food", value: 216 }, { category: "phone", value: 128 },
      { category: "fun", value: 96 }, { category: "beauty", value: 72 },
      { category: "traffic", value: 64 }
    ],
    details: {
      food: { title: "餐饮周明细", days: [{ date: "第 1 周 · 07.01-07.07", records: ["工作餐与饮品 · 8 笔 · ¥86"] }, { date: "第 2 周 · 07.08-07.14", records: ["聚餐与外卖 · 11 笔 · ¥130"] }] },
      phone: { title: "通讯周明细", days: [{ date: "第 1 周 · 07.01-07.07", records: ["手机话费 · 1 笔 · ¥30"] }, { date: "第 3 周 · 07.15-07.21", records: ["会员与云服务 · 3 笔 · ¥98"] }] },
      fun: { title: "娱乐周明细", days: [{ date: "第 2 周 · 07.08-07.14", records: ["电影与游戏 · 3 笔 · ¥61"] }, { date: "第 3 周 · 07.15-07.21", records: ["线下活动 · 1 笔 · ¥35"] }] },
      beauty: { title: "美容周明细", days: [{ date: "第 3 周 · 07.15-07.21", records: ["洗护与理发 · 2 笔 · ¥72"] }] },
      traffic: { title: "交通周明细", days: [{ date: "第 1 周 · 07.01-07.07", records: ["公共交通 · 6 笔 · ¥28"] }, { date: "第 2 周 · 07.08-07.14", records: ["通勤与打车 · 7 笔 · ¥36"] }] }
    }
  },
  month: {
    scopeLabel: "近 6 个月",
    rankTitle: "近 6 个月支出分类",
    structureAi: "半年维度中餐饮仍是首位，但娱乐增长更快；建议把月度固定支出与偶发消费分开观察。",
    trend: {
      title: "近 6 个月支出走势",
      ai: "AI：5 月和 7 月支出较高，近两个月整体波动扩大。",
      labels: ["02 月", "03 月", "04 月", "05 月", "06 月", "07 月"],
      values: [760, 880, 930, 1080, 1044, 1166]
    },
    categories: [
      { category: "food", value: 2100 }, { category: "phone", value: 1190 },
      { category: "fun", value: 1080 }, { category: "beauty", value: 910 },
      { category: "traffic", value: 580 }
    ],
    details: {
      food: { title: "餐饮月明细", days: [{ date: "2026 年 7 月", records: ["工作餐与聚餐 · 36 笔 · ¥420"] }, { date: "2026 年 6 月", records: ["餐饮合计 · 41 笔 · ¥398"] }, { date: "2026 年 5 月", records: ["餐饮合计 · 39 笔 · ¥372"] }] },
      phone: { title: "通讯月明细", days: [{ date: "2026 年 7 月", records: ["话费与数字服务 · ¥207"] }, { date: "2026 年 6 月", records: ["话费与会员 · ¥198"] }] },
      fun: { title: "娱乐月明细", days: [{ date: "2026 年 7 月", records: ["电影、游戏与活动 · ¥245"] }, { date: "2026 年 5 月", records: ["旅行娱乐 · ¥286"] }] },
      beauty: { title: "美容月明细", days: [{ date: "2026 年 7 月", records: ["洗护与理发 · ¥168"] }, { date: "2026 年 4 月", records: ["护肤补货 · ¥214"] }] },
      traffic: { title: "交通月明细", days: [{ date: "2026 年 7 月", records: ["通勤与打车 · ¥108"] }, { date: "2026 年 6 月", records: ["通勤合计 · ¥96"] }] }
    }
  },
  year: {
    scopeLabel: "近 5 年",
    rankTitle: "近 5 年支出分类",
    structureAi: "年度趋势连续上升，其中餐饮长期占比最高，娱乐增长速度最快；需要结合收入增幅判断是否真实超支。",
    trend: {
      title: "近 5 年支出走势",
      ai: "AI：年度支出逐年增长，2026 年增速较明显，建议对照年度收入和大额一次性消费复盘。",
      labels: ["2022", "2023", "2024", "2025", "2026"],
      values: [7280, 8640, 9960, 11820, 14700]
    },
    categories: [
      { category: "food", value: 18200 }, { category: "phone", value: 11200 },
      { category: "fun", value: 9600 }, { category: "beauty", value: 7800 },
      { category: "traffic", value: 5600 }
    ],
    details: {
      food: { title: "餐饮年明细", days: [{ date: "2026 年", records: ["餐饮合计 · 预计 ¥4,620"] }, { date: "2025 年", records: ["餐饮合计 · ¥4,180"] }, { date: "2024 年", records: ["餐饮合计 · ¥3,760"] }] },
      phone: { title: "通讯年明细", days: [{ date: "2026 年", records: ["通讯与数字服务 · 预计 ¥2,760"] }, { date: "2025 年", records: ["通讯与数字服务 · ¥2,310"] }] },
      fun: { title: "娱乐年明细", days: [{ date: "2026 年", records: ["娱乐合计 · 预计 ¥2,640"] }, { date: "2025 年", records: ["娱乐合计 · ¥2,060"] }] },
      beauty: { title: "美容年明细", days: [{ date: "2026 年", records: ["美容洗护 · 预计 ¥1,980"] }, { date: "2025 年", records: ["美容洗护 · ¥1,620"] }] },
      traffic: { title: "交通年明细", days: [{ date: "2026 年", records: ["交通合计 · 预计 ¥1,420"] }, { date: "2025 年", records: ["交通合计 · ¥1,260"] }] }
    }
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

function formatDateTimeForInput(value = new Date()) {
  const date = new Date(value);
  date.setSeconds(0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatNowForInput() {
  return formatDateTimeForInput();
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

function openEntryModal() {
  entryModalBackdrop.hidden = false;
  entryModal.hidden = false;
  document.body.classList.add("entry-modal-open");
  requestAnimationFrame(() => entryAmount?.focus());
}

function closeEntryModal() {
  entryModalBackdrop.hidden = true;
  entryModal.hidden = true;
  document.body.classList.remove("entry-modal-open");
}

function playViewTransition(activeView) {
  if (!canUseRichMotion) {
    return;
  }

  const activeModules = Array.from(moduleViews).filter((item) => item.dataset.view === activeView);
  const cardSelector = [
    ".balance-card",
    ".metric-card",
    ".panel:not(.module-view)",
    ".trend-card",
    ".report-card",
    ".day-stat-card",
    ".calendar-grid button",
    ".record-item",
    ".rank-row",
    ".category-detail",
    ".product-summary",
    ".product-card",
    ".product-detail",
    ".profile-head",
    ".profile-grid > *",
    ".profile-actions > *",
    ".settings-panel"
  ].join(",");

  activeModules.forEach((module, moduleIndex) => {
    module.classList.remove("view-entering");
    module.querySelectorAll(".view-card-entering").forEach((item) => {
      item.classList.remove("view-card-entering");
      item.style.removeProperty("--view-card-delay");
    });

    void module.offsetWidth;
    module.classList.add("view-entering");

    module.querySelectorAll(cardSelector).forEach((card, cardIndex) => {
      card.style.setProperty("--view-card-delay", `${80 + moduleIndex * 45 + Math.min(cardIndex, 8) * 55}ms`);
      card.classList.add("view-card-entering");
    });
  });
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

  if (activeView === "details") {
    requestAnimationFrame(() => {
      updateDayPie(currentDayPieData || getDayData(selectedCalendarDay, currentCalendarYear, currentCalendarMonth));
      dayExpensePieChart?.resize();
    });
  }

  if (activeView === "stats") {
    requestAnimationFrame(() => {
      setupExpensePieChart();
      updateExpensePieChart(statsDatasets[currentStatsPeriod] || statsDatasets.day);
      expensePieChart?.resize();
    });
  }

  requestAnimationFrame(() => playViewTransition(activeView));
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
    const lightLayer = document.createElement("span");
    lightLayer.className = "tilt-light-layer";
    lightLayer.setAttribute("aria-hidden", "true");
    card.append(lightLayer);
    const followLabel = document.createElement("span");
    followLabel.className = "tilt-follow-label";
    followLabel.setAttribute("aria-hidden", "true");
    followLabel.textContent = card.querySelector(":scope > span")?.textContent?.trim() || "钱迹数据";
    card.append(followLabel);

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const pointerX = Math.max(0, Math.min(1, x + 0.5));
      const pointerY = Math.max(0, Math.min(1, y + 0.5));
      const edgeDistance = Math.min(pointerX, 1 - pointerX, pointerY, 1 - pointerY) * 2;
      const edgeNearness = 1 - Math.max(0, Math.min(1, edgeDistance));

      card.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 10).toFixed(2)}deg`);
      card.style.setProperty("--tilt-label-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--tilt-label-y", `${event.clientY - rect.top}px`);
      card.style.setProperty("--tilt-light-x", `${(pointerX * 100).toFixed(2)}%`);
      card.style.setProperty("--tilt-light-y", `${(pointerY * 100).toFixed(2)}%`);
      card.style.setProperty("--tilt-edge-nearness", edgeNearness.toFixed(3));
      card.style.setProperty("--tilt-border-alpha", (0.56 + edgeNearness * 0.38).toFixed(3));
      card.style.setProperty("--tilt-surface-alpha", (0.08 + edgeNearness * 0.08).toFixed(3));
      card.style.setProperty("--tilt-glow-blur", `${(6 + edgeNearness * 12).toFixed(2)}px`);
      card.style.setProperty("--tilt-scale", "1.012");
      card.style.setProperty("--lift", "-3px");
      card.classList.add("is-tilting");
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-scale", "1");
      card.style.setProperty("--lift", "0px");
      card.style.setProperty("--tilt-light-x", "50%");
      card.style.setProperty("--tilt-light-y", "50%");
      card.style.setProperty("--tilt-edge-nearness", "0");
      card.style.setProperty("--tilt-border-alpha", "0.56");
      card.style.setProperty("--tilt-surface-alpha", "0.08");
      card.style.setProperty("--tilt-glow-blur", "6px");
      card.classList.remove("is-tilting");
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
  const interactiveCards = document.querySelectorAll(".balance-card, .metric-card");
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

function getDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getDayRange(year, month, day) {
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

function getTransactionTypeLabel(type) {
  return { EXPENSE: "支出", INCOME: "收入", TRANSFER: "转账" }[type] || type;
}

function mapBackendRecord(transaction) {
  const occurredAt = new Date(transaction.occurredAt);
  const category = transaction.categoryName || getTransactionTypeLabel(transaction.type);
  const visual = getRecordVisual(category);
  const accountText = transaction.type === "TRANSFER"
    ? `${transaction.accountName} → ${transaction.targetAccountName}`
    : transaction.accountName;
  return {
    id: String(transaction.id),
    icon: transaction.type === "INCOME" ? "收" : transaction.type === "TRANSFER" ? "转" : visual.icon,
    type: transaction.type === "INCOME" ? "income" : transaction.type === "TRANSFER" ? "transfer" : visual.type,
    title: transaction.note || category,
    meta: `${category} · ${accountText} · ${occurredAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
    category,
    categoryId: transaction.categoryId,
    accountId: transaction.accountId,
    targetAccountId: transaction.targetAccountId,
    transactionType: transaction.type,
    occurredAt: transaction.occurredAt,
    amount: Number(transaction.amount),
    version: Number(transaction.version)
  };
}

function buildRemoteDayData(dateKey, records) {
  const expenseRecords = records.filter((record) => record.transactionType === "EXPENSE");
  const total = expenseRecords.reduce((sum, record) => sum + Number(record.amount), 0);
  const [year, month, day] = dateKey.split("-").map(Number);
  const topCategory = Object.entries(expenseRecords.reduce((totals, record) => {
    totals[record.category] = (totals[record.category] || 0) + Number(record.amount);
    return totals;
  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    total,
    records,
    ai: records.length
      ? `${year} 年 ${month} 月 ${day} 日有 ${records.length} 笔流水${topCategory ? `，支出以${topCategory}为主` : ""}。`
      : `${year} 年 ${month} 月 ${day} 日暂无记录。添加账单后会自动更新分析。`
  };
}

function getRecordCategory(record) {
  return record.category || record.meta.split(" · ")[0] || "其他";
}

function normalizeDayData(data, dateKey) {
  const records = data.records.map((record, index) => ({
    ...record,
    id: record.id || `${dateKey}-${index}-${record.type}`,
    category: getRecordCategory(record)
  }));
  return { ...data, records, total: records.reduce((sum, record) => sum + Number(record.amount), 0) };
}

function getDayData(day, year = currentCalendarYear, month = currentCalendarMonth) {
  const dateKey = getDateKey(year, month, day);
  if (backendState.authenticated) {
    if (backendState.dayRecords[dateKey]) {
      return backendState.dayRecords[dateKey];
    }
    const calendarDay = backendState.calendarDays[dateKey];
    return {
      total: Number(calendarDay?.expense || 0),
      ai: calendarDay?.transactionCount
        ? `${year} 年 ${month} 月 ${day} 日有 ${calendarDay.transactionCount} 笔流水，进入详情查看具体记录。`
        : `${year} 年 ${month} 月 ${day} 日暂无记录。`,
      records: []
    };
  }
  if (storedDayRecords[dateKey]) {
    return normalizeDayData(storedDayRecords[dateKey], dateKey);
  }

  const source = year === 2026 && month === 7 && dayRecords[day]
    ? dayRecords[day]
    : getGeneratedRecords(day, year, month);
  return normalizeDayData(source, dateKey);
}

function persistDayRecords() {
  localStorage.setItem("qianji-day-records", JSON.stringify(storedDayRecords));
}

function ensureEditableDayData(dateKey) {
  if (!storedDayRecords[dateKey]) {
    const [year, month, day] = dateKey.split("-").map(Number);
    storedDayRecords[dateKey] = getDayData(day, year, month);
  }
  return storedDayRecords[dateKey];
}

function recalculateDayData(data, dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  data.total = data.records.reduce((sum, record) => sum + Number(record.amount), 0);
  const categoryTotals = data.records.reduce((totals, record) => {
    const category = getRecordCategory(record);
    totals[category] = (totals[category] || 0) + Number(record.amount);
    return totals;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  data.ai = data.records.length
    ? `${year} 年 ${month} 月 ${day} 日有 ${data.records.length} 笔消费，${topCategory}金额最高。AI 已根据最新账单重新分析。`
    : `${year} 年 ${month} 月 ${day} 日暂无记录。AI 会在你记第一笔后自动分析当天消费结构。`;
}

const dayCategoryColors = {
  "餐饮": "#d7ff32",
  "交通": "#57f28f",
  "购物": "#ff7a45",
  "娱乐": "#a98bff",
  "医疗": "#ff5f7a",
  "学习": "#39c6ff",
  "教育": "#39c6ff",
  "其他": "#8d9992"
};

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.classList.toggle("is-error", isError);
}

function populateBackendSelectors() {
  const accountOptions = backendState.accounts
    .filter((account) => account.status === "ACTIVE")
    .map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`)
    .join("");
  entryAccount.innerHTML = accountOptions;
  entryTargetAccount.innerHTML = accountOptions;

  const type = document.querySelector(".entry-form .type-switch button.active")?.textContent.trim() === "收入"
    ? "INCOME"
    : "EXPENSE";
  const categories = backendState.categories[type] || [];
  entryCategory.innerHTML = categories
    .map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`)
    .join("");
}

async function loadBackendBaseData() {
  const [user, ledgers, accounts, expenseCategories, incomeCategories] = await Promise.all([
    api.me(),
    api.ledgers(),
    api.accounts(),
    api.categories("EXPENSE"),
    api.categories("INCOME")
  ]);
  backendState.user = user;
  backendState.ledger = ledgers.find((ledger) => ledger.isDefault) || ledgers[0] || null;
  backendState.accounts = accounts;
  backendState.categories = { EXPENSE: expenseCategories, INCOME: incomeCategories };
  backendState.authenticated = Boolean(backendState.ledger);
  if (!backendState.ledger) {
    throw new ApiError("当前账号没有可用账本，请重新注册或联系管理员。");
  }
  populateBackendSelectors();
  if (profileDisplayName) {
    profileDisplayName.textContent = user.nickname || getSession().user?.nickname || "钱迹用户";
  }
  refreshProfileManagement();
}

async function loadBackendMonth(year = currentCalendarYear, month = currentCalendarMonth) {
  if (!backendState.authenticated) {
    return;
  }
  const result = await api.monthlyCalendar(backendState.ledger.id, getMonthKey(year, month));
  Object.keys(backendState.calendarDays)
    .filter((key) => key.startsWith(`${getMonthKey(year, month)}-`))
    .forEach((key) => delete backendState.calendarDays[key]);
  result.days.forEach((day) => {
    backendState.calendarDays[day.date] = day;
  });
}

async function loadBackendDay(year, month, day) {
  if (!backendState.authenticated) {
    return;
  }
  const dateKey = getDateKey(year, month, day);
  const transactions = await api.transactions({
    ledgerId: backendState.ledger.id,
    ...getDayRange(year, month, day),
    limit: TRANSACTION_QUERY_LIMIT
  });
  backendState.dayRecords[dateKey] = buildRemoteDayData(dateKey, transactions.map(mapBackendRecord));
}

async function refreshBackendDate(year, month, day) {
  try {
    await Promise.all([
      loadBackendMonth(year, month),
      loadBackendDay(year, month, day)
    ]);
    renderCalendar(year, month);
    renderRecords(day, year, month);
  } catch (error) {
    window.alert(error.message || "账单数据加载失败。");
  }
}

function getStatsRange(period, now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  let start;
  let end;
  let granularity;
  let scopeLabel;

  if (period === "month") {
    start = new Date(currentYear, currentMonth - 5, 1);
    end = new Date(currentYear, currentMonth + 1, 1);
    granularity = "MONTH";
    scopeLabel = "近 6 个月";
  } else if (period === "year") {
    start = new Date(currentYear - 4, 0, 1);
    end = new Date(currentYear + 1, 0, 1);
    granularity = "YEAR";
    scopeLabel = "近 5 年";
  } else {
    start = new Date(currentYear, currentMonth, 1);
    end = new Date(currentYear, currentMonth + 1, 1);
    granularity = period === "week" ? "WEEK" : "DAY";
    scopeLabel = period === "week" ? "本月每周" : "本月每日";
  }

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    granularity,
    scopeLabel
  };
}

function formatTrendBucket(bucket, period) {
  if (period === "year") {
    return bucket;
  }
  if (period === "month") {
    const [year, month] = bucket.split("-");
    return `${year}.${month}`;
  }
  const [, month, day] = bucket.split("-");
  return period === "week" ? `${month}.${day} 周` : `${month}.${day}`;
}

function getBackendCategoryVisual(category, index) {
  const colors = ["#d7ff32", "#57f28f", "#ff7a45", "#a98bff", "#39c6ff", "#ff5f7a", "#ffd84a", "#7be7d7"];
  const knownIcons = {
    "餐饮": "餐", "交通": "行", "购物": "购", "住房": "住",
    "医疗": "医", "娱乐": "娱", "人情": "礼", "教育": "学"
  };
  return {
    name: category.categoryName || "其他",
    icon: knownIcons[category.categoryName] || (category.categoryName || "其").slice(0, 1),
    color: colors[index % colors.length]
  };
}

async function loadBackendStats(period) {
  const range = getStatsRange(period);
  const query = {
    ledgerId: backendState.ledger.id,
    startAt: range.startAt,
    endAt: range.endAt
  };
  const [trend, categories] = await Promise.all([
    api.reportTrend({ ...query, granularity: range.granularity }),
    api.reportCategories({ ...query, type: "EXPENSE" })
  ]);
  const mappedCategories = categories.map((category, index) => {
    const key = `category-${category.categoryId}`;
    categoryVisuals[key] = getBackendCategoryVisual(category, index);
    return {
      category: key,
      categoryId: category.categoryId,
      value: Number(category.amount),
      transactionCount: Number(category.transactionCount)
    };
  });
  const values = trend.map((point) => Number(point.expense));
  statsDatasets[period] = {
    scopeLabel: range.scopeLabel,
    rankTitle: `${range.scopeLabel}支出分类`,
    structureAi: mappedCategories.length
      ? `${categoryVisuals[mappedCategories[0].category].name}是当前周期支出最高的分类，共 ¥${formatStatsAmount(mappedCategories[0].value)}。`
      : "当前周期暂无支出数据，新增账单后分类结构会自动更新。",
    trend: {
      title: `${range.scopeLabel}支出走势`,
      ai: values.length
        ? `自动分析：当前周期最高支出为 ¥${formatStatsAmount(Math.max(...values))}。`
        : "自动分析：当前周期暂无可分析的支出趋势。",
      labels: trend.length ? trend.map((point) => formatTrendBucket(point.bucket, period)) : ["暂无"],
      values: values.length ? values : [0]
    },
    categories: mappedCategories,
    details: {},
    range
  };
  return statsDatasets[period];
}

async function loadBackendCategoryDetail(categoryKey) {
  const dataset = statsDatasets[currentStatsPeriod];
  const category = dataset?.categories.find((item) => item.category === categoryKey);
  if (!category || dataset.details[categoryKey]) {
    return;
  }
  const transactions = await api.transactions({
    ledgerId: backendState.ledger.id,
    startAt: dataset.range.startAt,
    endAt: dataset.range.endAt,
    type: "EXPENSE",
    categoryId: category.categoryId,
    limit: TRANSACTION_QUERY_LIMIT
  });
  const grouped = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.occurredAt);
    let bucket;
    if (currentStatsPeriod === "year") {
      bucket = `${date.getFullYear()} 年`;
    } else if (currentStatsPeriod === "month") {
      bucket = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
    } else if (currentStatsPeriod === "week") {
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      bucket = `${monday.getMonth() + 1} 月 ${monday.getDate()} 日当周`;
    } else {
      bucket = `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
    }
    groups[bucket] ||= [];
    groups[bucket].push(`${transaction.note || transaction.categoryName} · ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })} · ¥${formatStatsAmount(transaction.amount)}`);
    return groups;
  }, {});
  dataset.details[categoryKey] = {
    title: `${categoryVisuals[categoryKey].name}明细`,
    days: Object.entries(grouped).map(([date, records]) => ({ date, records }))
  };
}

async function loadBackendDashboard() {
  if (!backendState.authenticated) {
    return;
  }
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = getMonthKey(now.getFullYear(), now.getMonth() + 1);
  const [summary, budgets] = await Promise.all([
    api.reportSummary({
      ledgerId: backendState.ledger.id,
      startAt: start.toISOString(),
      endAt: end.toISOString()
    }),
    api.budgets(backendState.ledger.id, month)
  ]);
  backendState.budgets = budgets;
  setCounterText(monthBalance, Number(summary.balance), { prefix: "¥ ", decimals: 2 });
  setCounterText(monthExpense, Number(summary.expense), { prefix: "¥ ", decimals: 2 });
  setCounterText(monthTransactionCount, Number(summary.transactionCount), { suffix: " 笔" });
  monthExpenseHint.textContent = summary.transactionCount
    ? `自动汇总：本月收入 ¥${formatStatsAmount(summary.income)}，支出 ¥${formatStatsAmount(summary.expense)}。`
    : "本月暂无账单，记一笔后自动更新。";
  monthTransactionHint.textContent = `本月已记录 ${summary.transactionCount} 笔流水。`;

  const monthly = budgets.find((budget) => !budget.categoryId);
  if (monthly) {
    monthlyBudget.value = Number(monthly.amount);
    const usage = Math.min(100, Number(monthly.usagePercentage));
    monthlyBudgetProgress.style.width = `${usage}%`;
    monthlyBudgetHint.textContent = monthly.exceeded
      ? `预算已超出 ¥${formatStatsAmount(Math.abs(Number(monthly.remaining)))}。`
      : `本月预算已使用 ${usage.toFixed(0)}%，剩余 ¥${formatStatsAmount(monthly.remaining)}。`;
  } else {
    monthlyBudgetProgress.style.width = "0%";
    monthlyBudgetHint.textContent = "尚未设置本月预算。";
  }

  const food = budgets.find((budget) => budget.categoryName === "餐饮");
  const shopping = budgets.find((budget) => budget.categoryName === "购物");
  if (food) {
    foodBudget.value = Number(food.amount);
  }
  if (shopping) {
    shoppingBudget.value = Number(shopping.amount);
  }
}

async function bootstrapBackendSession() {
  if (!getSession().refreshToken && !getSession().accessToken) {
    backendState.authenticated = false;
    setActiveView("login", true);
    return false;
  }
  try {
    await loadBackendBaseData();
    const now = new Date();
    currentCalendarYear = now.getFullYear();
    currentCalendarMonth = now.getMonth() + 1;
    selectedCalendarDay = now.getDate();
    await Promise.all([
      loadBackendMonth(currentCalendarYear, currentCalendarMonth),
      loadBackendDay(currentCalendarYear, currentCalendarMonth, selectedCalendarDay),
      loadBackendDashboard(),
      loadBackendStats(currentStatsPeriod)
    ]);
    renderCalendar(currentCalendarYear, currentCalendarMonth);
    renderRecords(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
    updateStats(currentStatsPeriod, false);
    const restoredView = normalizeViewName(window.location.hash) === "login"
      ? "overview"
      : normalizeViewName(window.location.hash);
    if (restoredView === "overview" && window.location.hash === "#login") {
      history.replaceState(null, "", "#overview");
    }
    setActiveView(restoredView, false);
    return true;
  } catch (error) {
    clearSession();
    backendState.authenticated = false;
    setLoginStatus(error.message || "登录状态已失效，请重新登录。", true);
    setActiveView("login", true);
    return false;
  }
}

function setRecordCategoryHighlight(category = "") {
  recordList.querySelectorAll(".record-item").forEach((item) => {
    item.classList.toggle("is-chart-active", item.dataset.category === category);
  });
}

function updateDayPie(data) {
  currentDayPieData = data;
  if (!dayPie) {
    return;
  }
  if (!dayExpensePieChart && !dayPie.offsetParent) {
    return;
  }

  const totals = data.records.reduce((result, record) => {
    const key = getRecordCategory(record);
    result[key] = (result[key] || 0) + record.amount;
    return result;
  }, {});
  const chartData = Object.entries(totals).map(([name, value]) => ({
    name,
    value,
    category: name,
    itemStyle: { color: dayCategoryColors[name] || dayCategoryColors["其他"] }
  }));

  if (!dayExpensePieChart) {
    dayExpensePieChart = echarts.init(dayPie, null, { renderer: "canvas" });
    dayExpensePieChart.on("mouseover", ({ data: item }) => setRecordCategoryHighlight(item?.category));
    dayExpensePieChart.on("globalout", () => setRecordCategoryHighlight());
    dayExpensePieChart.on("click", ({ data: item }) => setRecordCategoryHighlight(item?.category));
    new ResizeObserver(() => dayExpensePieChart?.resize()).observe(dayPie);
  }

  dayExpensePieChart.setOption({
    animationDuration: 700,
    animationEasing: "cubicOut",
    tooltip: {
      trigger: "item",
      formatter: ({ name, value, percent }) => `${name}<br><strong>¥${Number(value).toFixed(2)}</strong> · ${percent}%`,
      backgroundColor: "rgba(7, 12, 15, 0.96)",
      borderColor: "rgba(215, 255, 50, 0.42)",
      textStyle: { color: "#f4f8ef", fontWeight: 700 }
    },
    graphic: chartData.length ? [
      {
        type: "text",
        left: "center",
        top: "43%",
        style: { text: "当天支出", fill: "#8d9992", font: "700 12px sans-serif", textAlign: "center" }
      },
      {
        type: "text",
        left: "center",
        top: "51%",
        style: { text: `¥${Number(data.total).toFixed(2)}`, fill: "#f4f8ef", font: "900 18px sans-serif", textAlign: "center" }
      }
    ] : [
      {
        type: "text",
        left: "center",
        top: "48%",
        style: { text: "暂无支出", fill: "#8d9992", font: "800 15px sans-serif", textAlign: "center" }
      }
    ],
    series: [
      {
        type: "pie",
        radius: ["36%", "62%"],
        center: ["50%", "50%"],
        selectedMode: "multiple",
        selectedOffset: 9,
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#11191d", borderWidth: 3, borderRadius: 5 },
        label: { color: "#c5cec7", fontSize: 12, fontWeight: 800, formatter: "{b} {d}%" },
        labelLine: {
          length: 12,
          length2: 10,
          smooth: 0.35,
          lineStyle: { color: "rgba(215, 255, 50, 0.38)", width: 1.5 }
        },
        emphasis: {
          scale: true,
          scaleSize: 11,
          itemStyle: { shadowBlur: 24, shadowColor: "rgba(215, 255, 50, 0.28)" },
          label: { color: "#d7ff32", fontSize: 14 }
        },
        data: chartData
      }
    ]
  }, true);
}

function renderCalendar(year = currentCalendarYear, month = currentCalendarMonth) {
  currentCalendarYear = Number(year);
  currentCalendarMonth = Number(month);
  calendarYear.textContent = String(currentCalendarYear);
  calendarMonthText.textContent = `${currentCalendarMonth} 月`;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRecords(day, year = currentCalendarYear, month = currentCalendarMonth) {
  selectedCalendarDay = Number(day);
  const data = getDayData(selectedCalendarDay, Number(year), Number(month)) || {
    total: 0,
    ai: `${year} 年 ${month} 月 ${day} 日暂无记录。AI 会在你记第一笔后自动分析当天消费结构。`,
    records: []
  };

  selectedDate.textContent = `${year} 年 ${month} 月 ${selectedCalendarDay} 日`;
  detailDatePicker.value = getDateKey(year, month, selectedCalendarDay);
  detailDateText.textContent = `${year}/${String(month).padStart(2, "0")}/${String(selectedCalendarDay).padStart(2, "0")}`;
  updateCounterText(selectedTotal, data.total, { prefix: "- ¥", decimals: 2 });
  updateCounterText(todayTotal, data.total, { prefix: "¥ ", decimals: 2 });
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
    <div class="record-item" data-record-id="${escapeHtml(record.id)}" data-category="${escapeHtml(getRecordCategory(record))}">
      <span class="record-icon ${record.type}">${record.icon}</span>
      <div><strong>${escapeHtml(record.title)}</strong><small>${escapeHtml(record.meta)}</small></div>
      <div class="record-side">
        <b>${record.transactionType === "INCOME" ? "+ " : record.transactionType === "TRANSFER" ? "↔ " : "- "}¥${record.amount}</b>
        <div class="record-actions">
          <button class="record-action" type="button" data-action="edit">编辑</button>
          <button class="record-action delete" type="button" data-action="delete">删除</button>
        </div>
      </div>
    </div>
  `).join("");
  recordList.querySelectorAll(".record-item b").forEach((amountElement, index) => {
    const transactionType = data.records[index].transactionType;
    const prefix = transactionType === "INCOME" ? "+ ¥" : transactionType === "TRANSFER" ? "↔ ¥" : "- ¥";
    setCounterText(amountElement, data.records[index].amount, { prefix, decimals: 2 });
  });
}

function getRecordVisual(category) {
  const visuals = {
    "餐饮": { icon: "餐", type: "food" },
    "交通": { icon: "行", type: "ride" },
    "购物": { icon: "购", type: "shop" },
    "娱乐": { icon: "娱", type: "fun" },
    "医疗": { icon: "医", type: "medical" },
    "学习": { icon: "学", type: "study" },
    "教育": { icon: "学", type: "study" }
  };
  return visuals[category] || { icon: "记", type: "study" };
}

function updateEntryTypeFields() {
  const activeType = document.querySelector(".entry-form .type-switch button.active")?.textContent.trim() || "支出";
  const isTransfer = activeType === "转账";
  entryTargetAccountField.hidden = !isTransfer;
  entryCategory.closest("label").hidden = isTransfer;
  entryTag.closest("label").hidden = isTransfer;
  if (backendState.authenticated && !isTransfer) {
    const type = activeType === "收入" ? "INCOME" : "EXPENSE";
    entryCategory.innerHTML = (backendState.categories[type] || [])
      .map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`)
      .join("");
  }
}

function resetEntryForm() {
  editingRecordId = "";
  editingRecordDateKey = "";
  saveRecordButton.textContent = "添加记录";
  cancelEditButton.hidden = true;
  entryModeHint.textContent = "添加后可在每日明细中修改或删除。";
  entryAmount.value = "";
  entryRemark.value = "";
  entryTime.value = formatNowForInput();
  updateEntryTypeFields();
}

function beginRecordEdit(recordId) {
  const dateKey = getDateKey(currentCalendarYear, currentCalendarMonth, selectedCalendarDay);
  const data = getDayData(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
  const record = data.records.find((item) => item.id === recordId);
  if (!record) {
    return;
  }

  const [category = "餐饮", account = "微信", time = "12:00"] = record.meta.split(" · ");
  editingRecordId = record.id;
  editingRecordDateKey = dateKey;
  entryAmount.value = String(record.amount);
  if (backendState.authenticated) {
    const typeLabel = getTransactionTypeLabel(record.transactionType);
    document.querySelectorAll(".entry-form .type-switch button").forEach((button) => {
      button.classList.toggle("active", button.textContent.trim() === typeLabel);
    });
    updateEntryTypeFields();
    entryCategory.value = record.categoryId || "";
    entryAccount.value = record.accountId || "";
    entryTargetAccount.value = record.targetAccountId || "";
  } else {
    entryCategory.value = category;
    entryAccount.value = account;
  }
  entryTag.value = record.tag || "日常";
  entryRemark.value = record.title;
  entryTime.value = record.occurredAt
    ? formatDateTimeForInput(new Date(record.occurredAt))
    : `${dateKey}T${time}`;
  saveRecordButton.textContent = "保存修改";
  cancelEditButton.hidden = false;
  entryModeHint.textContent = `正在修改：${record.title}`;
  openEntryModal();
}

async function saveRecord() {
  const amount = Number(entryAmount.value);
  if (!Number.isFinite(amount) || amount <= 0 || !entryTime.value) {
    window.alert("请填写有效金额和记账时间。");
    return;
  }

  const [datePart, time = "00:00"] = entryTime.value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (backendState.authenticated) {
    const typeText = document.querySelector(".entry-form .type-switch button.active")?.textContent.trim() || "支出";
    const type = { "支出": "EXPENSE", "收入": "INCOME", "转账": "TRANSFER" }[typeText];
    const currentRecord = editingRecordId
      ? getDayData(selectedCalendarDay, currentCalendarYear, currentCalendarMonth).records.find((item) => item.id === editingRecordId)
      : null;
    const body = {
      ledgerId: Number(backendState.ledger.id),
      type,
      accountId: Number(entryAccount.value),
      targetAccountId: type === "TRANSFER" ? Number(entryTargetAccount.value) : null,
      categoryId: type === "TRANSFER" ? null : Number(entryCategory.value),
      amount: Number(amount.toFixed(2)),
      occurredAt: new Date(entryTime.value).toISOString(),
      note: entryRemark.value.trim() || null,
      tagIds: []
    };
    if (!body.accountId || (type === "TRANSFER" && (!body.targetAccountId || body.targetAccountId === body.accountId))) {
      window.alert(type === "TRANSFER" ? "请选择不同的转出与转入账户。" : "请选择账户。");
      return;
    }
    if (type !== "TRANSFER" && !body.categoryId) {
      window.alert("请选择分类。");
      return;
    }

    saveRecordButton.disabled = true;
    entryModeHint.textContent = editingRecordId ? "正在保存修改…" : "正在保存账单…";
    try {
      if (editingRecordId) {
        await api.updateTransaction(editingRecordId, { ...body, version: currentRecord.version });
      } else {
        await api.createTransaction({
          ...body,
          requestId: crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}`
        });
      }
      currentCalendarYear = year;
      currentCalendarMonth = month;
      selectedCalendarDay = day;
      resetEntryForm();
      await refreshBackendDate(year, month, day);
      await loadBackendDashboard();
      await updateStats(currentStatsPeriod);
      closeEntryModal();
      setActiveView("details", true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      entryModeHint.textContent = error.message || "账单保存失败。";
      window.alert(error.message || "账单保存失败。");
    } finally {
      saveRecordButton.disabled = false;
    }
    return;
  }

  const category = entryCategory.value;
  const account = entryAccount.value;
  const visual = getRecordVisual(category);
  const nextRecord = {
    id: editingRecordId || `record-${Date.now()}`,
    icon: visual.icon,
    type: visual.type,
    title: entryRemark.value.trim() || category,
    meta: `${category} · ${account} · ${time}`,
    category,
    account,
    tag: entryTag.value,
    amount: Number(amount.toFixed(2))
  };

  if (editingRecordId) {
    const sourceData = ensureEditableDayData(editingRecordDateKey);
    const sourceIndex = sourceData.records.findIndex((item) => item.id === editingRecordId);
    if (editingRecordDateKey === datePart && sourceIndex >= 0) {
      sourceData.records[sourceIndex] = nextRecord;
      recalculateDayData(sourceData, datePart);
    } else {
      if (sourceIndex >= 0) {
        sourceData.records.splice(sourceIndex, 1);
        recalculateDayData(sourceData, editingRecordDateKey);
      }
      const targetData = ensureEditableDayData(datePart);
      targetData.records.push(nextRecord);
      recalculateDayData(targetData, datePart);
    }
  } else {
    const targetData = ensureEditableDayData(datePart);
    targetData.records.push(nextRecord);
    recalculateDayData(targetData, datePart);
  }

  persistDayRecords();
  currentCalendarYear = year;
  currentCalendarMonth = month;
  selectedCalendarDay = day;
  resetEntryForm();
  renderCalendar(year, month);
  renderRecords(day, year, month);
  closeEntryModal();
  setActiveView("details", true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteRecord(recordId) {
  const dateKey = getDateKey(currentCalendarYear, currentCalendarMonth, selectedCalendarDay);
  if (backendState.authenticated) {
    const data = getDayData(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
    const record = data.records.find((item) => item.id === recordId);
    if (!record || !window.confirm(`确定删除“${record.title}”这笔账单吗？`)) {
      return;
    }
    try {
      await api.deleteTransaction(record.id, record.version);
      if (editingRecordId === recordId) {
        resetEntryForm();
      }
      await refreshBackendDate(currentCalendarYear, currentCalendarMonth, selectedCalendarDay);
      await loadBackendDashboard();
      await updateStats(currentStatsPeriod);
    } catch (error) {
      window.alert(error.message || "账单删除失败。");
    }
    return;
  }
  const data = ensureEditableDayData(dateKey);
  const record = data.records.find((item) => item.id === recordId);
  if (!record || !window.confirm(`确定删除“${record.title}”这笔账单吗？`)) {
    return;
  }

  data.records = data.records.filter((item) => item.id !== recordId);
  recalculateDayData(data, dateKey);
  persistDayRecords();
  if (editingRecordId === recordId) {
    resetEntryForm();
  }
  renderCalendar(currentCalendarYear, currentCalendarMonth);
  renderRecords(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
}

async function shiftCalendarMonth(offset) {
  const nextDate = new Date(currentCalendarYear, currentCalendarMonth - 1 + offset, 1);
  selectedCalendarDay = Math.min(selectedCalendarDay, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth() + 1));
  if (backendState.authenticated) {
    await refreshBackendDate(nextDate.getFullYear(), nextDate.getMonth() + 1, selectedCalendarDay);
    return;
  }
  renderCalendar(nextDate.getFullYear(), nextDate.getMonth() + 1);
  renderRecords(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
}

function updateTrend(period) {
  const dataset = (statsDatasets[period] || statsDatasets.day).trend;
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
  currentTrendPoints = points;
  currentTrendValues = values;
  trendChart?.classList.remove("is-tracking");
  trendLine.classList.remove("is-drawing");
  requestAnimationFrame(() => trendLine.classList.add("is-drawing"));
}

function updateTrendFocus(event) {
  if (!trendChart || !currentTrendPoints.length) {
    return;
  }

  const rect = trendChart.getBoundingClientRect();
  const pointerX = Math.max(0, Math.min(320, (event.clientX - rect.left) / rect.width * 320));
  const pointIndex = currentTrendPoints.reduce((nearestIndex, point, index) => (
    Math.abs(point.x - pointerX) < Math.abs(currentTrendPoints[nearestIndex].x - pointerX) ? index : nearestIndex
  ), 0);
  const point = currentTrendPoints[pointIndex];

  trendGuide.setAttribute("x1", point.x.toFixed(1));
  trendGuide.setAttribute("x2", point.x.toFixed(1));
  trendFocus.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
  trendTooltipText.textContent = `¥${currentTrendValues[pointIndex]}`;
  trendChart.classList.add("is-tracking");
}

function renderCategoryDetail(category) {
  const details = statsDatasets[currentStatsPeriod]?.details || statsDatasets.day.details;
  const detail = details[category];
  if (!detail || detail.days.length === 0) {
    return "<strong>暂无明细</strong><div class=\"empty-record\">当前周期没有可展示的分类账单。</div>";
  }
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

function createExpensePieData(dataset) {
  return dataset.categories.map((item) => {
    const visual = categoryVisuals[item.category];
    return {
      value: item.value,
      name: visual.name,
      category: item.category,
      itemStyle: { color: visual.color }
    };
  });
}

function formatStatsAmount(value) {
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderStatsRanks(dataset) {
  const total = dataset.categories.reduce((sum, item) => sum + Number(item.value), 0);
  if (!dataset.categories.length) {
    rankList.innerHTML = "<div class=\"empty-record\">当前周期暂无支出分类数据。</div>";
    return;
  }
  rankList.innerHTML = dataset.categories.map((item, index) => {
    const visual = categoryVisuals[item.category];
    const percentage = total > 0 ? Math.round(Number(item.value) / total * 100) : 0;
    return `
      <div class="rank-row" data-category="${escapeHtml(item.category)}" style="--rank-color:${visual.color};--rank-progress:${percentage}%">
        <span class="rank-no">${index + 1}</span>
        <span class="rank-icon">${escapeHtml(visual.icon)}</span>
        <strong>${escapeHtml(visual.name)}</strong>
        <em>${percentage}%</em>
        <b>- ¥${formatStatsAmount(item.value)}</b>
        <i></i>
      </div>
      <div class="category-detail" data-category-detail="${escapeHtml(item.category)}"></div>
    `;
  }).join("");
}

function updateExpensePieChart(dataset) {
  expensePieData = createExpensePieData(dataset);
  const total = expensePieData.reduce((sum, item) => sum + Number(item.value), 0);
  expensePieChart?.dispatchAction({ type: "downplay", seriesIndex: 0 });
  expensePieChart?.setOption({
    graphic: [
      { id: "expenseScope", style: { text: dataset.scopeLabel } },
      { id: "expenseTotal", style: { text: `¥${formatStatsAmount(total)}` } }
    ],
    series: [{ id: "expenseCategories", data: expensePieData }]
  });
}

async function updateStats(period, reload = backendState.authenticated) {
  if (reload) {
    categoryRankTitle.textContent = "正在加载支出分类…";
    statsStructureAi.textContent = "正在读取当前账本的统计数据。";
    try {
      await loadBackendStats(period);
    } catch (error) {
      statsStructureAi.textContent = error.message || "统计数据加载失败。";
      return;
    }
  }
  const dataset = statsDatasets[period] || statsDatasets.day;
  currentStatsPeriod = statsDatasets[period] ? period : "day";
  categoryRankTitle.textContent = dataset.rankTitle;
  statsStructureAi.textContent = dataset.structureAi;
  renderStatsRanks(dataset);
  updateTrend(currentStatsPeriod);
  updateExpensePieChart(dataset);
  setPieActiveCategory("");
}

function setPieActiveCategory(category) {
  const donut = document.querySelector(".report-donut");
  const hasCategory = Boolean(category);

  donut?.classList.toggle("is-interacting", hasCategory);
  donut?.setAttribute("data-active-category", category || "");

  document.querySelectorAll(".rank-row").forEach((row) => {
    row.classList.toggle("is-pie-active", row.dataset.category === category);
  });

  if (expensePieChart) {
    expensePieChart.dispatchAction({ type: "downplay", seriesIndex: 0 });
    const item = expensePieData.find((entry) => entry.category === category);
    if (item) {
      expensePieChart.dispatchAction({ type: "highlight", seriesIndex: 0, name: item.name });
    }
  }
}

function setupExpensePieChart() {
  if (!expensePieChartElement || expensePieChart || !expensePieChartElement.offsetParent) {
    return;
  }

  const initialDataset = statsDatasets.day;
  expensePieData = createExpensePieData(initialDataset);
  const initialTotal = expensePieData.reduce((sum, item) => sum + Number(item.value), 0);
  expensePieChart = echarts.init(expensePieChartElement, null, { renderer: "canvas" });
  expensePieChart.setOption({
    animationDuration: 850,
    animationEasing: "cubicOut",
    tooltip: {
      trigger: "item",
      formatter: ({ name, value, percent }) => `${name}<br><strong>¥${Number(value).toFixed(2)}</strong> · ${percent}%`,
      backgroundColor: "rgba(7, 12, 15, 0.96)",
      borderColor: "rgba(215, 255, 50, 0.42)",
      textStyle: { color: "#f4f8ef", fontWeight: 700 }
    },
    graphic: [
      {
        id: "expenseScope",
        type: "text",
        left: "center",
        top: "43%",
        style: { text: initialDataset.scopeLabel, fill: "#8d9992", font: "700 13px sans-serif", textAlign: "center" }
      },
      {
        id: "expenseTotal",
        type: "text",
        left: "center",
        top: "51%",
        style: { text: `¥${formatStatsAmount(initialTotal)}`, fill: "#f4f8ef", font: "900 20px sans-serif", textAlign: "center" }
      }
    ],
    series: [
      {
        id: "expenseCategories",
        name: "支出分类",
        type: "pie",
        radius: ["36%", "62%"],
        center: ["50%", "50%"],
        startAngle: 90,
        selectedMode: "multiple",
        selectedOffset: 10,
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: "#0b1114",
          borderWidth: 3,
          borderRadius: 5
        },
        label: {
          show: true,
          color: "#c5cec7",
          fontSize: 13,
          fontWeight: 800,
          formatter: "{b} {d}%"
        },
        labelLine: {
          show: true,
          length: 14,
          length2: 12,
          smooth: 0.35,
          lineStyle: { color: "rgba(215, 255, 50, 0.38)", width: 1.5 }
        },
        emphasis: {
          scale: true,
          scaleSize: 12,
          itemStyle: { shadowBlur: 24, shadowColor: "rgba(215, 255, 50, 0.28)" },
          label: { color: "#d7ff32", fontSize: 15 }
        },
        select: {
          itemStyle: { shadowBlur: 28, shadowColor: "rgba(215, 255, 50, 0.34)" }
        },
        data: expensePieData
      }
    ]
  });

  expensePieChart.on("mouseover", ({ data }) => setPieActiveCategory(data?.category || ""));
  expensePieChart.on("globalout", () => {
    const opened = document.querySelector(".rank-row.is-open");
    setPieActiveCategory(opened?.dataset.category || "");
  });
  expensePieChart.on("click", ({ data }) => {
    if (data?.category) {
      toggleCategoryDetail(data.category);
    }
  });

  new ResizeObserver(() => expensePieChart?.resize()).observe(expensePieChartElement);
}

async function toggleCategoryDetail(category) {
  const row = document.querySelector(`.rank-row[data-category="${category}"]`);
  const panel = document.querySelector(`[data-category-detail="${category}"]`);
  if (!row || !panel) {
    return;
  }

  const shouldOpen = !panel.classList.contains("is-open");
  row.classList.toggle("is-open", shouldOpen);
  panel.classList.toggle("is-open", shouldOpen);
  if (shouldOpen && !panel.innerHTML.trim()) {
    panel.innerHTML = "<div class=\"empty-record\">正在加载分类明细…</div>";
    if (backendState.authenticated) {
      try {
        await loadBackendCategoryDetail(category);
      } catch (error) {
        panel.innerHTML = `<div class="empty-record">${escapeHtml(error.message || "分类明细加载失败。")}</div>`;
        return;
      }
    }
    panel.innerHTML = renderCategoryDetail(category);
  }

  if (shouldOpen) {
    const selectedItem = expensePieData.find((item) => item.category === category);
    expensePieChart?.dispatchAction({ type: "pieSelect", seriesIndex: 0, name: selectedItem?.name });
    setPieActiveCategory(category);
    return;
  }

  const unselectedItem = expensePieData.find((item) => item.category === category);
  expensePieChart?.dispatchAction({ type: "pieUnSelect", seriesIndex: 0, name: unselectedItem?.name });

  const opened = document.querySelector(".rank-row.is-open");
  setPieActiveCategory(opened?.dataset.category || "");
}

function setupStatsInteractions() {
  periodButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      periodButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      await updateStats(button.dataset.period);
    });
  });

  rankList.addEventListener("click", (event) => {
    const item = event.target.closest(".rank-row");
    if (item) {
      toggleCategoryDetail(item.dataset.category);
    }
  });

  trendChart?.addEventListener("pointerenter", updateTrendFocus);
  trendChart?.addEventListener("pointermove", updateTrendFocus);
  trendChart?.addEventListener("pointerleave", () => trendChart.classList.remove("is-tracking"));

  updateStats("day");
}

function setupCalendarControls() {
  let pickerYear = currentCalendarYear;
  let pickerMonth = currentCalendarMonth;

  const showDetailDate = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (year < 2000 || year > 2100) {
      return;
    }
    if (backendState.authenticated) {
      await refreshBackendDate(year, month, day);
    } else {
      renderCalendar(year, month);
      renderRecords(day, year, month);
    }
  };

  const renderDetailPicker = () => {
    detailPickerTitle.textContent = `${pickerYear} 年 ${pickerMonth} 月`;
    const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
    const firstWeekday = (new Date(pickerYear, pickerMonth - 1, 1).getDay() + 6) % 7;
    const cells = weekdays.map((day) => `<span>${day}</span>`);
    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push("<span></span>");
    }
    for (let day = 1; day <= getDaysInMonth(pickerYear, pickerMonth); day += 1) {
      const data = getDayData(day, pickerYear, pickerMonth);
      const isSelected = pickerYear === currentCalendarYear && pickerMonth === currentCalendarMonth && day === selectedCalendarDay;
      cells.push(`<button class="${data.total > 0 ? "has-bill" : ""} ${isSelected ? "is-selected" : ""}" type="button" data-picker-day="${day}">${day}</button>`);
    }
    detailPickerGrid.innerHTML = cells.join("");
  };

  const closeDetailPicker = () => {
    detailDatePopover.hidden = true;
    detailDateTrigger.setAttribute("aria-expanded", "false");
  };

  const openDetailPicker = () => {
    pickerYear = currentCalendarYear;
    pickerMonth = currentCalendarMonth;
    renderDetailPicker();
    detailDatePopover.hidden = false;
    detailDateTrigger.setAttribute("aria-expanded", "true");
  };

  calendarGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-day]");
    if (!button || button.disabled) {
      return;
    }

    document.querySelectorAll(".calendar-grid button").forEach((item) => item.classList.remove("today"));
    button.classList.add("today");
    if (backendState.authenticated) {
      await loadBackendDay(currentCalendarYear, currentCalendarMonth, Number(button.dataset.day));
    }
    renderRecords(button.dataset.day, currentCalendarYear, currentCalendarMonth);
    setActiveView("details", true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const renderMonthPicker = () => {
    calendarMonthGrid.innerHTML = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return `<button class="${month === currentCalendarMonth ? "is-selected" : ""}" type="button" data-month="${month}">${month} 月</button>`;
    }).join("");
  };
  const closeMonthPicker = () => {
    calendarMonthPopover.hidden = true;
    calendarMonthTrigger.setAttribute("aria-expanded", "false");
  };
  calendarMonthTrigger.addEventListener("click", () => {
    renderMonthPicker();
    calendarMonthPopover.hidden = !calendarMonthPopover.hidden;
    calendarMonthTrigger.setAttribute("aria-expanded", String(!calendarMonthPopover.hidden));
  });
  calendarMonthGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-month]");
    if (!button) {
      return;
    }
    const month = Number(button.dataset.month);
    const day = Math.min(selectedCalendarDay, getDaysInMonth(currentCalendarYear, month));
    if (backendState.authenticated) {
      await refreshBackendDate(currentCalendarYear, month, day);
    } else {
      renderCalendar(currentCalendarYear, month);
      renderRecords(day, currentCalendarYear, month);
    }
    closeMonthPicker();
  });
  prevYear.addEventListener("click", async () => {
    const nextYearValue = Math.max(2000, currentCalendarYear - 1);
    const day = Math.min(selectedCalendarDay, getDaysInMonth(nextYearValue, currentCalendarMonth));
    if (backendState.authenticated) {
      await refreshBackendDate(nextYearValue, currentCalendarMonth, day);
    } else {
      renderCalendar(nextYearValue, currentCalendarMonth);
      renderRecords(day, nextYearValue, currentCalendarMonth);
    }
  });
  nextYear.addEventListener("click", async () => {
    const nextYearValue = Math.min(2100, currentCalendarYear + 1);
    const day = Math.min(selectedCalendarDay, getDaysInMonth(nextYearValue, currentCalendarMonth));
    if (backendState.authenticated) {
      await refreshBackendDate(nextYearValue, currentCalendarMonth, day);
    } else {
      renderCalendar(nextYearValue, currentCalendarMonth);
      renderRecords(day, nextYearValue, currentCalendarMonth);
    }
  });
  prevMonth.addEventListener("click", () => shiftCalendarMonth(-1));
  nextMonth.addEventListener("click", () => shiftCalendarMonth(1));
  prevDetailDay.addEventListener("click", () => {
    showDetailDate(new Date(currentCalendarYear, currentCalendarMonth - 1, selectedCalendarDay - 1));
  });
  nextDetailDay.addEventListener("click", () => {
    showDetailDate(new Date(currentCalendarYear, currentCalendarMonth - 1, selectedCalendarDay + 1));
  });
  detailDatePicker.addEventListener("change", () => {
    if (!detailDatePicker.value) {
      return;
    }
    const [year, month, day] = detailDatePicker.value.split("-").map(Number);
    showDetailDate(new Date(year, month - 1, day));
  });
  detailDateTrigger.addEventListener("click", () => {
    if (detailDatePopover.hidden) {
      openDetailPicker();
    } else {
      closeDetailPicker();
    }
  });
  detailPickerPrevMonth.addEventListener("click", () => {
    const date = new Date(pickerYear, pickerMonth - 2, 1);
    pickerYear = date.getFullYear();
    pickerMonth = date.getMonth() + 1;
    renderDetailPicker();
  });
  detailPickerNextMonth.addEventListener("click", () => {
    const date = new Date(pickerYear, pickerMonth, 1);
    pickerYear = date.getFullYear();
    pickerMonth = date.getMonth() + 1;
    renderDetailPicker();
  });
  detailPickerGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-picker-day]");
    if (!button) {
      return;
    }
    showDetailDate(new Date(pickerYear, pickerMonth - 1, Number(button.dataset.pickerDay)));
    closeDetailPicker();
  });
  detailPickerToday.addEventListener("click", () => {
    showDetailDate(new Date());
    closeDetailPicker();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".month-picker")) {
      closeMonthPicker();
    }
    if (!event.target.closest(".detail-date-picker")) {
      closeDetailPicker();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetailPicker();
    }
  });
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
  const readSetting = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const writeSetting = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const profileState = readSetting("qianji-profile", { name: "钱迹用户", email: "", phone: "" });
  let expenseCategories = readSetting("qianji-expense-categories", ["餐饮", "交通", "购物", "住房", "医疗", "娱乐", "人情", "教育"]);
  let customTags = readSetting("qianji-custom-tags", ["日常", "聚餐", "出差", "情侣", "家用"]);

  const maskPhone = (phone) => phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : "未绑定";
  const openProfilePage = (panelId) => {
    profileMain.hidden = true;
    profileSubpages.forEach((panel) => panel.toggleAttribute("hidden", panel.id !== panelId));
    profilePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const closeProfilePage = () => {
    profileSubpages.forEach((panel) => panel.hidden = true);
    profileMain.hidden = false;
    profilePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.querySelectorAll("[data-profile-page]").forEach((button) => {
    button.addEventListener("click", () => openProfilePage(button.dataset.profilePage));
  });
  document.querySelectorAll("[data-profile-back]").forEach((button) => button.addEventListener("click", closeProfilePage));

  profileName.value = profileState.name;
  profileEmail.value = profileState.email;
  profileDisplayName.textContent = profileState.name;
  boundPhone.textContent = maskPhone(profileState.phone);

  saveProfileInfo?.addEventListener("click", () => {
    const name = profileName.value.trim();
    if (!name) {
      profileInfoStatus.textContent = "用户名不能为空。";
      return;
    }
    profileState.name = name;
    profileState.email = profileEmail.value.trim();
    writeSetting("qianji-profile", profileState);
    profileDisplayName.textContent = name;
    profileInfoStatus.textContent = "基本信息已保存。";
  });

  sendPhoneCode?.addEventListener("click", () => {
    phoneStatus.textContent = /^1\d{10}$/.test(phoneNumber.value.trim())
      ? "验证码已生成：123456（本地原型）"
      : "请输入 11 位手机号。";
  });
  bindPhone?.addEventListener("click", () => {
    const phone = phoneNumber.value.trim();
    if (!/^1\d{10}$/.test(phone) || phoneCode.value.trim() !== "123456") {
      phoneStatus.textContent = "手机号或验证码不正确。";
      return;
    }
    profileState.phone = phone;
    writeSetting("qianji-profile", profileState);
    boundPhone.textContent = maskPhone(phone);
    phoneStatus.textContent = "手机号已绑定。";
    phoneCode.value = "";
  });
  unbindPhone?.addEventListener("click", () => {
    if (!profileState.phone) {
      phoneStatus.textContent = "当前没有绑定手机号。";
      return;
    }
    if (!window.confirm("确定解除当前手机号绑定吗？")) {
      return;
    }
    profileState.phone = "";
    writeSetting("qianji-profile", profileState);
    boundPhone.textContent = "未绑定";
    phoneStatus.textContent = "手机号已解除绑定。";
  });

  updatePassword?.addEventListener("click", () => {
    if (!currentPassword.value || newPassword.value.length < 8) {
      passwordStatus.textContent = "请填写当前密码，新密码至少 8 位。";
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      passwordStatus.textContent = "两次输入的新密码不一致。";
      return;
    }
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    passwordStatus.textContent = "校验通过，接入后端后将在服务器更新密码。";
  });

  const syncEntryOptions = () => {
    if (backendState.authenticated) {
      populateBackendSelectors();
    } else {
      const currentCategory = entryCategory.value;
      entryCategory.innerHTML = expenseCategories.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
      entryCategory.value = expenseCategories.includes(currentCategory) ? currentCategory : expenseCategories[0];
    }
    const currentTag = entryTag.value;
    entryTag.innerHTML = customTags.map((name) => `<option>${escapeHtml(name)}</option>`).join("");
    entryTag.value = customTags.includes(currentTag) ? currentTag : customTags[0];
  };
  const accountTypeLabels = {
    CASH: "现金",
    WECHAT: "微信",
    ALIPAY: "支付宝",
    BANK_CARD: "银行卡",
    CREDIT_CARD: "信用卡",
    CHANGE: "零钱通",
    OTHER: "其他"
  };
  let editingCategoryId = "";

  const setAccountStatus = (message, isError = false) => {
    accountSettingsStatus.textContent = message;
    accountSettingsStatus.classList.toggle("is-error", isError);
  };
  const resetAccountEditor = () => {
    editingAccountId.value = "";
    accountName.value = "";
    accountType.value = "CASH";
    saveAccountButton.textContent = "新增账户";
    cancelAccountEdit.hidden = true;
  };
  const closeBalanceEditor = () => {
    accountBalanceEditor.hidden = true;
    balanceAccountId.value = "";
    targetAccountBalance.value = "";
    balanceAdjustmentNote.value = "";
  };
  const renderAccounts = () => {
    if (!backendState.authenticated) {
      fundAccountList.innerHTML = '<p class="settings-empty">登录后加载资金账户。</p>';
      return;
    }
    if (!backendState.accounts.length) {
      fundAccountList.innerHTML = '<p class="settings-empty">还没有资金账户，可在下方新增。</p>';
      return;
    }
    fundAccountList.innerHTML = backendState.accounts.map((account) => `
      <article class="fund-account-item" data-account-id="${escapeHtml(account.id)}">
        <div class="fund-account-summary">
          <span>${escapeHtml(accountTypeLabels[account.type] || account.type)}</span>
          <strong>${escapeHtml(account.name)}</strong>
          <b>¥${Number(account.balance || 0).toFixed(2)}</b>
        </div>
        <div class="fund-account-actions">
          <button type="button" data-account-action="edit">编辑</button>
          <button type="button" data-account-action="balance">校准余额</button>
          <button class="danger-button" type="button" data-account-action="delete">删除</button>
        </div>
      </article>
    `).join("");
  };
  const refreshAccounts = async () => {
    backendState.accounts = await api.accounts();
    populateBackendSelectors();
    renderAccounts();
  };

  accountEditor?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!backendState.authenticated) {
      setAccountStatus("请先登录。", true);
      return;
    }
    const name = accountName.value.trim();
    if (!name) {
      setAccountStatus("请输入账户名称。", true);
      return;
    }
    saveAccountButton.disabled = true;
    try {
      const current = backendState.accounts.find((account) => account.id === editingAccountId.value);
      if (current) {
        await api.updateAccount(current.id, { name, type: accountType.value, version: current.version });
        setAccountStatus("账户信息已更新。");
      } else {
        await api.createAccount({ ledgerId: backendState.ledger.id, name, type: accountType.value, currency: "CNY" });
        setAccountStatus("账户已新增。");
      }
      resetAccountEditor();
      await refreshAccounts();
    } catch (error) {
      setAccountStatus(error.message || "账户保存失败，请稍后重试。", true);
    } finally {
      saveAccountButton.disabled = false;
    }
  });
  cancelAccountEdit?.addEventListener("click", resetAccountEditor);
  cancelBalanceAdjustment?.addEventListener("click", closeBalanceEditor);
  fundAccountList?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-account-action]");
    const item = button?.closest("[data-account-id]");
    const account = backendState.accounts.find((entry) => entry.id === item?.dataset.accountId);
    if (!button || !account) {
      return;
    }
    const action = button.dataset.accountAction;
    if (action === "edit") {
      editingAccountId.value = account.id;
      accountName.value = account.name;
      accountType.value = account.type;
      saveAccountButton.textContent = "保存修改";
      cancelAccountEdit.hidden = false;
      accountEditor.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (action === "balance") {
      balanceAccountId.value = account.id;
      balanceAccountName.textContent = `校准 ${account.name} 的余额`;
      targetAccountBalance.value = Number(account.balance || 0).toFixed(2);
      accountBalanceEditor.hidden = false;
      accountBalanceEditor.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!window.confirm(`确定删除账户“${account.name}”吗？余额必须先校准为 0。`)) {
      return;
    }
    button.disabled = true;
    try {
      await api.deleteAccount(account.id, account.version);
      setAccountStatus("账户已删除。");
      await refreshAccounts();
    } catch (error) {
      setAccountStatus(error.message || "账户删除失败，请稍后重试。", true);
      button.disabled = false;
    }
  });
  accountBalanceEditor?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const account = backendState.accounts.find((entry) => entry.id === balanceAccountId.value);
    if (!account) {
      setAccountStatus("账户数据已变化，请刷新后重试。", true);
      return;
    }
    try {
      await api.adjustAccountBalance(account.id, {
        requestId: crypto.randomUUID ? crypto.randomUUID() : `balance-${Date.now()}`,
        targetBalance: Number(targetAccountBalance.value),
        occurredAt: new Date().toISOString(),
        note: balanceAdjustmentNote.value.trim() || null,
        version: account.version
      });
      closeBalanceEditor();
      setAccountStatus("余额已校准，并生成余额调整流水。");
      await Promise.all([refreshAccounts(), loadBackendDashboard()]);
    } catch (error) {
      setAccountStatus(error.message || "余额校准失败，请稍后重试。", true);
    }
  });

  const renderEditableLists = () => {
    const categories = backendState.authenticated
      ? backendState.categories.EXPENSE
      : expenseCategories.map((name) => ({ id: name, name, system: false }));
    expenseCategoryList.innerHTML = categories.map((category) => category.system
      ? `<span class="editable-chip is-system"><span>${escapeHtml(category.name)}</span><small>系统</small></span>`
      : `<span class="editable-chip" data-category-id="${escapeHtml(category.id)}"><span>${escapeHtml(category.name)}</span><button type="button" data-category-action="edit" aria-label="编辑 ${escapeHtml(category.name)}">改</button><button type="button" data-category-action="delete" aria-label="删除 ${escapeHtml(category.name)}">删</button></span>`
    ).join("");
    customTagList.innerHTML = customTags.map((name) => `<button type="button" data-list="tag" data-value="${escapeHtml(name)}"><span>${escapeHtml(name)}</span><b aria-label="删除 ${escapeHtml(name)}">×</b></button>`).join("");
    syncEntryOptions();
  };
  const saveExpenseCategory = async () => {
    const value = newExpenseCategory.value.trim();
    if (!value) {
      categorySettingsStatus.textContent = "请输入分类名称。";
      return;
    }
    if (!backendState.authenticated) {
      if (expenseCategories.includes(value)) {
        categorySettingsStatus.textContent = "名称已存在。";
        return;
      }
      expenseCategories.push(value);
      writeSetting("qianji-expense-categories", expenseCategories);
      newExpenseCategory.value = "";
      renderEditableLists();
      return;
    }
    addExpenseCategory.disabled = true;
    try {
      const current = backendState.categories.EXPENSE.find((category) => category.id === editingCategoryId);
      if (current) {
        await api.updateCategory(current.id, {
          type: current.type,
          name: value,
          icon: current.icon,
          color: current.color,
          sortOrder: current.sortOrder
        });
        categorySettingsStatus.textContent = "分类已更新。";
      } else {
        const maxSortOrder = Math.max(0, ...backendState.categories.EXPENSE.map((category) => category.sortOrder || 0));
        await api.createCategory({ type: "EXPENSE", name: value, icon: "circle", color: "#D7FF32", sortOrder: maxSortOrder + 10 });
        categorySettingsStatus.textContent = "分类已新增。";
      }
      editingCategoryId = "";
      newExpenseCategory.value = "";
      addExpenseCategory.textContent = "新增分类";
      cancelCategoryEdit.hidden = true;
      backendState.categories.EXPENSE = await api.categories("EXPENSE");
      renderEditableLists();
    } catch (error) {
      categorySettingsStatus.textContent = error.message || "分类保存失败，请稍后重试。";
    } finally {
      addExpenseCategory.disabled = false;
    }
  };
  addExpenseCategory?.addEventListener("click", saveExpenseCategory);
  cancelCategoryEdit?.addEventListener("click", () => {
    editingCategoryId = "";
    newExpenseCategory.value = "";
    addExpenseCategory.textContent = "新增分类";
    cancelCategoryEdit.hidden = true;
  });
  document.querySelector("#addCustomTag")?.addEventListener("click", () => {
    const value = newCustomTag.value.trim();
    if (!value || customTags.includes(value)) {
      categorySettingsStatus.textContent = value ? "名称已存在。" : "请输入名称。";
      return;
    }
    customTags.push(value);
    newCustomTag.value = "";
    writeSetting("qianji-custom-tags", customTags);
    categorySettingsStatus.textContent = `${value}已新增，仅保存在当前浏览器。`;
    renderEditableLists();
  });
  document.querySelector("#categorySettingsPanel")?.addEventListener("click", async (event) => {
    const categoryAction = event.target.closest("button[data-category-action]");
    const categoryItem = categoryAction?.closest("[data-category-id]");
    if (categoryAction && categoryItem) {
      const category = backendState.categories.EXPENSE.find((entry) => entry.id === categoryItem.dataset.categoryId);
      if (!category) {
        return;
      }
      if (categoryAction.dataset.categoryAction === "edit") {
        editingCategoryId = category.id;
        newExpenseCategory.value = category.name;
        addExpenseCategory.textContent = "保存修改";
        cancelCategoryEdit.hidden = false;
        newExpenseCategory.focus();
        return;
      }
      if (!window.confirm(`确定删除自定义分类“${category.name}”吗？`)) {
        return;
      }
      categoryAction.disabled = true;
      try {
        await api.deleteCategory(category.id);
        backendState.categories.EXPENSE = await api.categories("EXPENSE");
        categorySettingsStatus.textContent = "分类已删除。";
        renderEditableLists();
      } catch (error) {
        categorySettingsStatus.textContent = error.message || "分类删除失败，请稍后重试。";
        categoryAction.disabled = false;
      }
      return;
    }
    const item = event.target.closest("button[data-list]");
    if (!item || event.target.tagName !== "B" || item.dataset.list !== "tag") {
      return;
    }
    if (customTags.length <= 1) {
      categorySettingsStatus.textContent = "至少保留一个标签。";
      return;
    }
    customTags = customTags.filter((name) => name !== item.dataset.value);
    writeSetting("qianji-custom-tags", customTags);
    categorySettingsStatus.textContent = `${item.dataset.value}已删除，仅影响当前浏览器。`;
    renderEditableLists();
  });
  refreshProfileManagement = () => {
    renderAccounts();
    renderEditableLists();
  };
  renderEditableLists();

  const budgetState = readSetting("qianji-budget", { monthly: 6000, food: 1800, shopping: 1200, alert: true });
  monthlyBudget.value = budgetState.monthly;
  foodBudget.value = budgetState.food;
  shoppingBudget.value = budgetState.shopping;
  budgetAlert.checked = budgetState.alert;
  document.querySelector("#saveBudgetSettings")?.addEventListener("click", async () => {
    const nextBudget = {
      monthly: Number(monthlyBudget.value),
      food: Number(foodBudget.value),
      shopping: Number(shoppingBudget.value),
      alert: budgetAlert.checked
    };
    if (!nextBudget.monthly || nextBudget.food + nextBudget.shopping > nextBudget.monthly) {
      budgetSettingsStatus.textContent = "请检查预算金额，分类预算不能超过总预算。";
      return;
    }
    if (backendState.authenticated) {
      const month = getMonthKey(new Date().getFullYear(), new Date().getMonth() + 1);
      const threshold = nextBudget.alert ? 80 : 100;
      const monthly = backendState.budgets.find((budget) => !budget.categoryId);
      const foodCategory = backendState.categories.EXPENSE.find((category) => category.name === "餐饮");
      const shoppingCategory = backendState.categories.EXPENSE.find((category) => category.name === "购物");
      budgetSettingsStatus.textContent = "正在保存预算…";
      try {
        const requests = [
          api.saveMonthlyBudget({
            ledgerId: Number(backendState.ledger.id),
            month,
            amount: nextBudget.monthly,
            alertThreshold: threshold,
            enabled: true,
            version: monthly?.version ?? null
          })
        ];
        if (foodCategory && nextBudget.food > 0) {
          const current = backendState.budgets.find((budget) => budget.categoryId === foodCategory.id);
          requests.push(api.saveCategoryBudget(foodCategory.id, {
            ledgerId: Number(backendState.ledger.id),
            month,
            amount: nextBudget.food,
            alertThreshold: threshold,
            enabled: true,
            version: current?.version ?? null
          }));
        }
        if (shoppingCategory && nextBudget.shopping > 0) {
          const current = backendState.budgets.find((budget) => budget.categoryId === shoppingCategory.id);
          requests.push(api.saveCategoryBudget(shoppingCategory.id, {
            ledgerId: Number(backendState.ledger.id),
            month,
            amount: nextBudget.shopping,
            alertThreshold: threshold,
            enabled: true,
            version: current?.version ?? null
          }));
        }
        await Promise.all(requests);
        await loadBackendDashboard();
        budgetSettingsStatus.textContent = "预算已保存到当前账本。";
      } catch (error) {
        budgetSettingsStatus.textContent = error.message || "预算保存失败。";
      }
      return;
    }
    writeSetting("qianji-budget", nextBudget);
    budgetSettingsStatus.textContent = "预算设置已保存。";
  });

  document.querySelector("#exportRecords")?.addEventListener("click", () => {
    const start = new Date(`${exportStartDate.value}T00:00:00`);
    const end = new Date(`${exportEndDate.value}T00:00:00`);
    if (!exportStartDate.value || !exportEndDate.value || start > end) {
      exportStatus.textContent = "请选择有效日期范围。";
      return;
    }
    const rows = [];
    const cursor = new Date(start);
    while (cursor <= end && rows.length < 10000) {
      const date = getDateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
      const data = getDayData(cursor.getDate(), cursor.getFullYear(), cursor.getMonth() + 1);
      data.records.forEach((record) => rows.push({ date, title: record.title, category: getRecordCategory(record), meta: record.meta, amount: record.amount }));
      cursor.setDate(cursor.getDate() + 1);
    }
    const isCsv = exportFormat.value === "csv";
    const csvCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const content = isCsv
      ? [["日期", "账目", "分类", "信息", "金额"], ...rows.map((row) => [row.date, row.title, row.category, row.meta, row.amount])].map((row) => row.map(csvCell).join(",")).join("\n")
      : JSON.stringify(rows, null, 2);
    const blob = new Blob([isCsv ? `\uFEFF${content}` : content], { type: isCsv ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `钱迹账单-${exportStartDate.value}-${exportEndDate.value}.${exportFormat.value}`;
    link.click();
    URL.revokeObjectURL(link.href);
    exportStatus.textContent = `已生成 ${rows.length} 条账单。`;
  });

  document.querySelector("#submitFeedback")?.addEventListener("click", () => {
    const content = feedbackContent.value.trim();
    if (content.length < 5) {
      feedbackStatus.textContent = "请至少填写 5 个字。";
      return;
    }
    const feedback = readSetting("qianji-feedback", []);
    feedback.push({ type: feedbackType.value, content, createdAt: new Date().toISOString() });
    writeSetting("qianji-feedback", feedback);
    feedbackContent.value = "";
    feedbackStatus.textContent = "反馈已保存，接入后端后将提交给产品团队。";
  });

  saveApiSettings?.addEventListener("click", () => {
    const base = apiBaseUrl?.value.trim();
    const model = apiModel?.value.trim();
    const hasKey = Boolean(apiKey?.value.trim());
    const status = activeAiMode === "local"
      ? `当前使用内嵌模型：${LOCAL_MODEL_NAME}`
      : (base && model && hasKey ? `已保存：${model} · ${base}` : "请完整填写 API 地址、API Key 和模型名称");

    apiSettingsStatus.textContent = status;
    if (aiConnectionStatus) {
      aiConnectionStatus.textContent = activeAiMode === "local" ? `当前模型：${LOCAL_MODEL_NAME}` : `当前模型：${model || "自定义 API（未填写）"}`;
    }
  });

  const updateModelDisplay = () => {
    const model = activeAiMode === "local" ? LOCAL_MODEL_NAME : (apiModel?.value.trim() || "自定义 API（未填写模型）");
    currentModelName.textContent = model;
    aiConnectionStatus.textContent = `当前模型：${model}`;
    aiApiFields.hidden = activeAiMode !== "api";
    aiModeButtons.forEach((button) => button.classList.toggle("active", button.dataset.aiMode === activeAiMode));
  };

  aiModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeAiMode = button.dataset.aiMode;
      updateModelDisplay();
    });
  });
  apiModel?.addEventListener("input", updateModelDisplay);
  toggleApiKey?.addEventListener("click", () => {
    const shouldShow = apiKey.type === "password";
    apiKey.type = shouldShow ? "text" : "password";
    toggleApiKey.textContent = shouldShow ? "隐藏" : "显示";
    toggleApiKey.setAttribute("aria-label", shouldShow ? "隐藏 API Key" : "显示 API Key");
  });
  updateModelDisplay();

  logoutButton?.addEventListener("click", async () => {
    try {
      await api.logout();
    } catch {
      // 本地仍需退出，避免失效令牌把用户困在页面中。
    }
    clearSession();
    backendState.authenticated = false;
    backendState.dayRecords = {};
    backendState.calendarDays = {};
    closeProfilePage();
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

function getLocalAnalysisContext() {
  const data = getDayData(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
  const categories = data.records.reduce((result, record) => {
    const category = getRecordCategory(record);
    result[category] = (result[category] || 0) + Number(record.amount);
    return result;
  }, {});
  return `当前日期：${currentCalendarYear}-${currentCalendarMonth}-${selectedCalendarDay}；当天支出：${data.total} 元；分类汇总：${JSON.stringify(categories)}。`;
}

function isReadableModelText(text) {
  const content = String(text || "").trim();
  if (!content || content.includes("�") || content.includes("锟")) {
    return false;
  }

  const compact = content.replace(/\s/g, "");
  const uniqueRatio = new Set([...compact]).size / Math.max(compact.length, 1);
  const pairs = compact.match(/.{2}/gu) || [];
  const pairCounts = pairs.reduce((counts, pair) => {
    counts[pair] = (counts[pair] || 0) + 1;
    return counts;
  }, {});
  const maxPairRepeats = Math.max(0, ...Object.values(pairCounts));
  return compact.length < 24 || (uniqueRatio >= 0.24 && maxPairRepeats < 4);
}

function buildLocalAnalysisFallback() {
  const data = getDayData(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
  if (!data.records.length) {
    return "本地模型输出异常，已切换基础分析：当天暂无账单，可以先记录一笔，再获取消费结构建议。";
  }

  const categories = data.records.reduce((result, record) => {
    const category = getRecordCategory(record);
    result[category] = (result[category] || 0) + Number(record.amount);
    return result;
  }, {});
  const [topCategory, topAmount] = Object.entries(categories).sort((left, right) => right[1] - left[1])[0];
  const percent = data.total > 0 ? Math.round((topAmount / data.total) * 100) : 0;
  return `本地模型输出异常，已切换基础分析：当天共 ${data.records.length} 笔支出，合计 ¥${Number(data.total).toFixed(2)}；${topCategory}占比最高，为 ${percent}%。建议优先检查该分类是否存在可减少的非必要消费。`;
}

function getQwenWorker() {
  if (!qwenWorker) {
    qwenWorker = new Worker(new URL("./qwen-worker.js", import.meta.url), { type: "module" });
    qwenWorker.addEventListener("message", (event) => {
      const message = event.data || {};
      if (message.type === "progress") {
        const progress = message.progress || {};
        const percent = Number.isFinite(progress.progress)
          ? Math.round(progress.progress)
          : (progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0);
        localModelProgress.hidden = false;
        localModelProgress.value = Math.max(0, Math.min(100, percent));
        localModelStatus.textContent = percent > 0 ? `正在下载模型 ${percent}%` : `正在准备模型：${progress.status || "初始化"}`;
        return;
      }
      if (message.type === "ready") {
        localModelProgress.hidden = true;
        localModelStatus.textContent = "模型已加载，可在浏览器本地分析";
        return;
      }
      const pending = pendingQwenRequests.get(message.requestId);
      if (!pending) {
        return;
      }
      pendingQwenRequests.delete(message.requestId);
      if (message.type === "result") {
        pending.resolve(message.text || "模型没有返回有效内容。");
      } else {
        pending.reject(new Error(message.message || "模型运行失败"));
      }
    });
  }
  return qwenWorker;
}

function runLocalQwen(question) {
  const requestId = ++qwenRequestId;
  const prompt = `${getLocalAnalysisContext()}\n用户问题：${question}\n请用中文给出不超过 120 字的记账分析建议。`;
  localModelStatus.textContent = "正在加载本地 Qwen 模型，首次使用需要下载较大文件";
  getQwenWorker().postMessage({ type: "generate", requestId, prompt });
  return new Promise((resolve, reject) => pendingQwenRequests.set(requestId, { resolve, reject }))
    .then((text) => {
      if (isReadableModelText(text)) {
        return text;
      }
      localModelStatus.textContent = "模型输出异常，已使用本地规则分析";
      return buildLocalAnalysisFallback();
    });
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

  aiChatForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = aiChatInput?.value.trim();
    if (!question) {
      return;
    }

    appendAiMessage(question, "user");
    aiChatInput.value = "";

    if (activeAiMode === "api") {
      appendAiMessage(`当前已切换为 ${apiModel?.value.trim() || "自定义 API"}。API 请求将在后端接入后启用，避免把密钥暴露在网页中。`);
      return;
    }

    appendAiMessage(`正在使用 ${LOCAL_MODEL_NAME} 分析，首次使用需要下载并缓存模型……`);
    try {
      appendAiMessage(await runLocalQwen(question));
    } catch (error) {
      localModelStatus.textContent = "模型加载失败，请检查网络或浏览器 WebGPU 支持";
      appendAiMessage(`本地模型暂时无法运行：${error.message}`);
    }
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
  bindTiltCards(productList.querySelectorAll(".product-summary"));
  renderProductDetail(products[0]);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView(normalizeViewName(link.getAttribute("href")), true);
    link.blur();
    if (link.closest(".side-nav")) {
      sideNav?.classList.add("is-forced-collapsed");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

sideNav?.addEventListener("pointerleave", () => {
  sideNav.classList.remove("is-forced-collapsed");
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

document.querySelectorAll(".entry-form .type-switch button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".entry-form .type-switch button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateEntryTypeFields();
  });
});

entryForm.addEventListener("submit", (event) => event.preventDefault());
saveRecordButton.addEventListener("click", saveRecord);
cancelEditButton.addEventListener("click", () => {
  resetEntryForm();
  closeEntryModal();
});
entryModalClose.addEventListener("click", closeEntryModal);
entryModalBackdrop.addEventListener("click", closeEntryModal);
recordList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  const recordItem = actionButton?.closest(".record-item");
  if (!actionButton || !recordItem) {
    return;
  }

  if (actionButton.dataset.action === "edit") {
    beginRecordEdit(recordItem.dataset.recordId);
    return;
  }

  if (actionButton.dataset.action === "delete") {
    deleteRecord(recordItem.dataset.recordId);
  }
});

document.querySelector(".floating-add").addEventListener("click", () => {
  resetEntryForm();
  openEntryModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !entryModal.hidden) {
    closeEntryModal();
  }
});

authModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeAuthMode = button.dataset.authMode;
    authModeButtons.forEach((item) => item.classList.toggle("active", item === button));
    loginNicknameField.hidden = activeAuthMode !== "register";
    loginPassword.autocomplete = activeAuthMode === "register" ? "new-password" : "current-password";
    loginSubmit.textContent = activeAuthMode === "register" ? "注册并进入钱迹" : "登录并进入钱迹";
    setLoginStatus(activeAuthMode === "register"
      ? "用户名只能包含字母、数字和下划线，密码长度为 8-72 位。"
      : "登录后使用真实账本数据。");
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  const nickname = loginNickname.value.trim();
  if (!username || !password || (activeAuthMode === "register" && !nickname)) {
    setLoginStatus("请完整填写认证信息。", true);
    return;
  }

  loginSubmit.disabled = true;
  setLoginStatus(activeAuthMode === "register" ? "正在创建账号和默认账本…" : "正在登录…");
  try {
    const request = {
      username,
      password,
      deviceId: "qianji-web",
      deviceName: navigator.userAgentData?.mobile ? "钱迹移动网页" : "钱迹网页端"
    };
    const tokenResponse = activeAuthMode === "register"
      ? await api.register({ ...request, nickname })
      : await api.login(request);
    saveSession(tokenResponse);
    await loadBackendBaseData();
    const now = new Date();
    currentCalendarYear = now.getFullYear();
    currentCalendarMonth = now.getMonth() + 1;
    selectedCalendarDay = now.getDate();
    await Promise.all([
      loadBackendMonth(currentCalendarYear, currentCalendarMonth),
      loadBackendDay(currentCalendarYear, currentCalendarMonth, selectedCalendarDay),
      loadBackendDashboard(),
      loadBackendStats(currentStatsPeriod)
    ]);
    renderCalendar(currentCalendarYear, currentCalendarMonth);
    renderRecords(selectedCalendarDay, currentCalendarYear, currentCalendarMonth);
    updateStats(currentStatsPeriod, false);
    setActiveView("overview", true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setLoginStatus(error.message || "认证失败，请稍后重试。", true);
  } finally {
    loginSubmit.disabled = false;
  }
});

window.addEventListener("qianji:auth-expired", () => {
  backendState.authenticated = false;
  setLoginStatus("登录已过期，请重新登录。", true);
  setActiveView("login", true);
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
bootstrapBackendSession();

window.addEventListener("popstate", () => {
  setActiveView(normalizeViewName(window.location.hash), false);
});
