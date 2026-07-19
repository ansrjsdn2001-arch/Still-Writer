import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

/**
 * Google OAuth callback 후 백엔드가 전달한 로그인 결과를 프론트 세션에 저장합니다.
 *
 * 백엔드는 Refresh Token을 HttpOnly 쿠키로 저장하고,
 * 프론트가 화면 상태를 갱신할 수 있도록 Access Token과 사용자 정보를 URL hash로 전달합니다.
 */
export default function GoogleOAuthCallback({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = params.get('accessToken');
    const userId = params.get('userId');
    const email = params.get('email');
    const nickname = params.get('nickname');
    const tokenType = params.get('tokenType') || 'Bearer';
    const accessTokenExpiresAt = params.get('accessTokenExpiresAt');

    if (!accessToken || !userId || !email) {
      navigate('/login', {
        replace: true,
        state: { message: 'Google 로그인 결과를 확인할 수 없습니다. 다시 시도해 주세요.' },
      });
      return;
    }

    const loginUser = {
      userId: Number(userId),
      email,
      nickname,
      tokenType,
      accessTokenExpiresAt,
      keepSignedIn: false,
    };

    window.sessionStorage.setItem('still-writer-access-token', accessToken);
    onLogin(loginUser);

    // URL hash에 남은 토큰을 브라우저 주소창에서 제거하기 위해 replace 이동합니다.
    navigate('/', { replace: true });
  }, [navigate, onLogin]);

  return (
    <main className="login-layout">
      <section className="login-panel" aria-live="polite">
        <div className="login-panel__heading">
          <h1>Google 로그인 처리 중</h1>
          <p>로그인 정보를 확인하고 있습니다.</p>
        </div>
      </section>
    </main>
  );
}
