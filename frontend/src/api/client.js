const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ACCESS_TOKEN_STORAGE_KEY = 'still-writer-access-token';

function createApiUrl(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

export function readAccessToken() {
  return window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function saveAccessToken(accessToken) {
  if (!accessToken) return;
  window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function clearAccessToken() {
  window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

async function sendJsonRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  const accessToken = auth ? readAccessToken() : null;

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(createApiUrl(path), {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = new Error(responseData?.message ?? '요청 처리 중 오류가 발생했습니다.');
    apiError.response = {
      status: response.status,
      data: responseData,
    };
    throw apiError;
  }

  return responseData;
}

async function refreshAccessTokenFromCookie() {
  const response = await sendJsonRequest('/api/auth/refresh', {
    method: 'POST',
    body: {},
    auth: false,
  });

  const accessToken = response?.data?.accessToken;
  if (accessToken) saveAccessToken(accessToken);
  return accessToken;
}

export async function requestJson(path, { method = 'GET', body, auth = true } = {}) {
  try {
    return await sendJsonRequest(path, { method, body, auth });
  } catch (error) {
    const canTryRefresh = auth && error?.response?.status === 401 && path !== '/api/auth/refresh';

    if (!canTryRefresh) throw error;

    try {
      const refreshedToken = await refreshAccessTokenFromCookie();
      if (!refreshedToken) throw error;
      return await sendJsonRequest(path, { method, body, auth });
    } catch {
      clearAccessToken();
      throw error;
    }
  }
}

export function getJson(path, options) {
  return requestJson(path, { ...options, method: 'GET' });
}

export function postJson(path, body, options) {
  return requestJson(path, { ...options, method: 'POST', body });
}

export function patchJson(path, body, options) {
  return requestJson(path, { ...options, method: 'PATCH', body });
}

export function deleteJson(path, options) {
  return requestJson(path, { ...options, method: 'DELETE' });
}

export function getApiErrorMessage(error, fallbackMessage = '요청 처리 중 오류가 발생했습니다.') {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === 'object') {
    const messages = Object.values(responseData.errors).filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  if (responseData?.message) return responseData.message;
  return fallbackMessage;
}

export default {
  getJson,
  postJson,
  patchJson,
  deleteJson,
  requestJson,
};
