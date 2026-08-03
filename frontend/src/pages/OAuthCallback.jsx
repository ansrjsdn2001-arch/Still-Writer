import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeOAuthCode } from '../api/auth';
import { saveAccessToken } from '../api/client';
import '../styles/login.css';

const LOGIN_REDIRECT_STORAGE_KEY = 'still-writer-login-redirect-to';

const PROVIDER_LABELS = {
  google: 'Google',
  kakao: 'Kakao',
};

const processedOAuthCallbackKeys = new Set();

function getProviderLabel(provider) {
  return PROVIDER_LABELS[provider] ?? '소셜';
}

function getOAuthCode() {
  return new URLSearchParams(window.location.search).get('code');
}

function removeOAuthResultFromUrl() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState(null, document.title, cleanUrl);
}

function getSafeRedirectPath(value) {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (value === '/login' || value === '/join') return '/';
  if (value.startsWith('/oauth/')) return '/';
  return value;
}

export default function OAuthCallback({ provider, onLogin }) {
  const navigate = useNavigate();
  const providerLabel = getProviderLabel(provider);

  useEffect(() => {
    const code = getOAuthCode();

    if (!code) {
      navigate('/login', {
        replace: true,
        state: { message: `${providerLabel} 로그인 결과를 확인할 수 없습니다. 다시 시도해 주세요.` },
      });
      return;
    }

    const callbackKey = `${provider}:${code}`;
    if (processedOAuthCallbackKeys.has(callbackKey)) return;
    processedOAuthCallbackKeys.add(callbackKey);

    async function completeOAuthLogin() {
      try {
        const result = await exchangeOAuthCode(code);
        const loginData = result.data;

        removeOAuthResultFromUrl();
        saveAccessToken(loginData.accessToken);

        onLogin({
          userId: loginData.userId,
          email: loginData.email,
          nickname: loginData.nickname,
          tokenType: loginData.tokenType,
          accessTokenExpiresAt: loginData.accessTokenExpiresAt,
          keepSignedIn: false,
        });

        const redirectTo = getSafeRedirectPath(window.sessionStorage.getItem(LOGIN_REDIRECT_STORAGE_KEY));
        window.sessionStorage.removeItem(LOGIN_REDIRECT_STORAGE_KEY);
        navigate(redirectTo, { replace: true });
      } catch (error) {
        removeOAuthResultFromUrl();
        navigate('/login', {
          replace: true,
          state: { message: error.message || `${providerLabel} 로그인에 실패했습니다. 다시 시도해 주세요.` },
        });
      }
    }

    completeOAuthLogin();
  }, [navigate, onLogin, provider, providerLabel]);

  return (
    <main className="login-layout">
      <section className="login-panel" aria-live="polite">
        <div className="login-panel__heading">
          <h1>{providerLabel} 로그인 처리 중</h1>
          <p>로그인 정보를 확인하고 있습니다.</p>
        </div>
      </section>
    </main>
  );
}
