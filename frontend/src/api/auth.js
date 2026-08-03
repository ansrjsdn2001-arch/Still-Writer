import { postJson } from './client';

const OAUTH_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function createOAuthApiUrl(path) {
  return `${OAUTH_API_BASE_URL.replace(/\/$/, '')}${path}`;
}

export async function login({ email, password }) {
  return postJson('/api/auth/login', { email, password });
}

export function startGoogleLogin() {
  window.location.href = createOAuthApiUrl('/api/auth/oauth/google/authorize');
}

export function startKakaoLogin() {
  window.location.href = createOAuthApiUrl('/api/auth/oauth/kakao/authorize');
}

export async function refreshAccessToken() {
  return postJson('/api/auth/refresh', {});
}

export async function logout() {
  return postJson('/api/auth/logout', {});
}

export async function exchangeOAuthCode(code) {
  return postJson('/api/auth/oauth/exchange', { code });
}

export async function sendEmailVerification(email) {
  return postJson('/api/auth/email-verification/send', { email });
}

export async function verifyEmailCode({ email, code }) {
  return postJson('/api/auth/email-verification/verify', { email, code });
}

export async function signup({ email, password, nickname }) {
  return postJson('/api/auth/signup', { email, password, nickname });
}
