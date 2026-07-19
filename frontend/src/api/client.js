/**
 * 프론트엔드 전체에서 재사용할 API 요청 함수입니다.
 * VITE_API_BASE_URL이 있으면 해당 서버로 요청하고, 없으면 현재 origin 기준 상대 경로(`/api/...`)로 요청합니다.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function createApiUrl(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

export async function postJson(path, body) {
  const response = await fetch(createApiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
  postJson,
};
