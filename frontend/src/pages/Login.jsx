import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import stillWriterLogo from "../../logo/logo-transparent.png";
import "../styles/login.css";

function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem("still-writer-user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser] = useState(readStoredUser);
  const nickname =
    typeof currentUser?.nickname === "string" ? currentUser.nickname.trim() : "";

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className="login-page"
      style={{ "--login-background": 'url("/images/background2.png")' }}
    >
      <header className="login-header">
        <Link
          className="login-header__brand"
          to="/"
          aria-label="Still Writer 홈으로 이동"
        >
          <img src={stillWriterLogo} alt="Still Writer" />
        </Link>
        <nav className="login-header__account" aria-label="계정 메뉴">
          {nickname ? (
            <span className="login-header__nickname">{nickname}</span>
          ) : (
            <>
              <Link className="login-header__login" to="/login">로그인</Link>
              <Link className="login-header__join" to="/join">회원가입</Link>
            </>
          )}
        </nav>
      </header>

      <Link className="login-page__back" to="/" aria-label="이전 페이지로 이동">
        <ArrowBackIosNewRounded />
      </Link>

      <main className="login-layout">
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__heading">
            <h1 id="login-title">로그인</h1>
            <p>계정으로 로그인하고 글쓰기를 이어가세요.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <MailOutlineRounded aria-hidden="true" />
              <span className="sr-only">이메일</span>
              <input
                type="email"
                name="email"
                placeholder="이메일"
                autoComplete="email"
                required
              />
            </label>

            <label className="login-field">
              <LockOutlined aria-hidden="true" />
              <span className="sr-only">비밀번호</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="비밀번호"
                autoComplete="current-password"
                required
              />
              <button
                className="login-field__visibility"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <VisibilityOutlined />
                ) : (
                  <VisibilityOffOutlined />
                )}
              </button>
            </label>

            <div className="login-form__options">
              <label className="login-checkbox">
                <input type="checkbox" name="keepSignedIn" />
                <span>로그인 상태 유지</span>
              </label>
              <Link to="/find-password">비밀번호 찾기</Link>
            </div>

            <button className="login-submit" type="submit">
              로그인
            </button>
          </form>

          <div className="login-divider">
            <span>또는</span>
          </div>

          <div className="login-socials">
            <button className="kakao-material-button" type="button">
              <div className="kakao-material-button-state" />
              <div className="kakao-material-button-content-wrapper">
                <div className="kakao-material-button-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: "block" }}
                    aria-hidden="true"
                  >
                    <path
                      fill="#191919"
                      d="M24 7C13.5 7 5 13.7 5 22c0 5.35 3.55 10.04 8.9 12.7l-2.25 8.05a1 1 0 0 0 1.46 1.12l9.33-5.4c.52.04 1.04.06 1.56.06 10.5 0 19-6.7 19-16.53S34.5 7 24 7Z"
                    />
                  </svg>
                </div>
                <span className="kakao-material-button-contents">
                  카카오로 로그인
                </span>
                <span style={{ display: "none" }}>카카오로 로그인</span>
              </div>
            </button>
            <button className="gsi-material-button" type="button">
              <div className="gsi-material-button-state" />
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: "block" }}
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  Google로 로그인
                </span>
                <span style={{ display: "none" }}>Sign in with Google</span>
              </div>
            </button>
          </div>

          <p className="login-panel__join">
            아직 계정이 없으신가요? <Link to="/join">회원가입</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
