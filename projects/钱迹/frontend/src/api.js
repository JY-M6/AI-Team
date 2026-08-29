const ACCESS_TOKEN_KEY = "qianji-access-token";
const REFRESH_TOKEN_KEY = "qianji-refresh-token";
const USER_KEY = "qianji-auth-user";

export class ApiError extends Error {
  constructor(message, code = "REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function getSession() {
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || "";
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    user = null;
  }
  return { accessToken, refreshToken, user };
}

export function saveSession(tokenResponse) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(tokenResponse.user));
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function buildUrl(path, query) {
  const url = new URL(path, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return `${url.pathname}${url.search}`;
}

async function readResponse(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.message || `请求失败（HTTP ${response.status}）`,
      payload?.code || "REQUEST_FAILED",
      response.status
    );
  }
  return payload?.data;
}

async function refreshAccessToken() {
  const { refreshToken } = getSession();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!response.ok) {
    clearSession();
    return false;
  }

  const tokenResponse = await readResponse(response);
  saveSession(tokenResponse);
  return true;
}

async function request(path, options = {}, retry = true) {
  const { query, body, auth = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  headers.set("Accept", "application/json");
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const { accessToken } = getSession();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 401 && auth && retry && await refreshAccessToken()) {
    return request(path, options, false);
  }

  if (response.status === 401 && auth) {
    clearSession();
    window.dispatchEvent(new CustomEvent("qianji:auth-expired"));
  }
  return readResponse(response);
}

export const api = {
  register: (body) => request("/api/v1/auth/register", { method: "POST", body, auth: false }),
  login: (body) => request("/api/v1/auth/login", { method: "POST", body, auth: false }),
  logout: () => request("/api/v1/auth/logout", { method: "POST" }),
  me: () => request("/api/v1/users/me"),
  ledgers: () => request("/api/v1/ledgers"),
  accounts: () => request("/api/v1/accounts"),
  createAccount: (body) => request("/api/v1/accounts", { method: "POST", body }),
  updateAccount: (id, body) => request(`/api/v1/accounts/${id}`, { method: "PUT", body }),
  deleteAccount: (id, version) => request(`/api/v1/accounts/${id}`, {
    method: "DELETE",
    query: { version }
  }),
  adjustAccountBalance: (id, body) => request(`/api/v1/accounts/${id}/balance-adjustments`, {
    method: "POST",
    body
  }),
  categories: (type) => request("/api/v1/categories", { query: { type } }),
  createCategory: (body) => request("/api/v1/categories", { method: "POST", body }),
  updateCategory: (id, body) => request(`/api/v1/categories/${id}`, { method: "PUT", body }),
  deleteCategory: (id) => request(`/api/v1/categories/${id}`, { method: "DELETE" }),
  transactions: (query) => request("/api/v1/transactions", { query }),
  createTransaction: (body) => request("/api/v1/transactions", { method: "POST", body }),
  updateTransaction: (id, body) => request(`/api/v1/transactions/${id}`, { method: "PUT", body }),
  deleteTransaction: (id, version) => request(`/api/v1/transactions/${id}`, {
    method: "DELETE",
    query: { version }
  }),
  monthlyCalendar: (ledgerId, month) => request("/api/v1/calendar/monthly", {
    query: { ledgerId, month }
  }),
  reportSummary: (query) => request("/api/v1/reports/summary", { query }),
  reportTrend: (query) => request("/api/v1/reports/trend", { query }),
  reportCategories: (query) => request("/api/v1/reports/categories", { query }),
  budgets: (ledgerId, month) => request("/api/v1/budgets", { query: { ledgerId, month } }),
  saveMonthlyBudget: (body) => request("/api/v1/budgets/monthly", { method: "PUT", body }),
  saveCategoryBudget: (categoryId, body) => request(`/api/v1/budgets/categories/${categoryId}`, {
    method: "PUT",
    body
  })
};
