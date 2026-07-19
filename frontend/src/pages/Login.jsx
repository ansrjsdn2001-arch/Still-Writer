import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { login, startGoogleLogin } from "../api/auth";
import { getApiErrorMessage } from "../api/client";
import "../styles/login.css";

const INITIAL_FORM = {
  email: "",
  password: "",
  keepSignedIn: false,
};

function validateLoginForm(form) {
  const errors = {};
  const email = form.email.trim();

  if (!email) errors.email = "이메일을 입력해 주세요.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "올바른 이메일 형식을 입력해 주세요.";

  if (!form.password) errors.password = "비밀번호를 입력해 주세요.";

  return errors;
}

/** 백엔드 LOCAL 로그인 API와 연결된 로그인 화면입니다. */
export default function Login({ onLogin }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
    setStatusMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateLoginForm(form);
    setErrors(nextErrors);

    const firstInvalidName = Object.keys(nextErrors)[0];
    if (firstInvalidName) {
      event.currentTarget.elements.namedItem(firstInvalidName)?.focus();
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });
      const loginData = result.data;

      // Refresh Token은 백엔드가 HttpOnly 쿠키로 저장합니다. Access Token은 탭 세션 안에서만 사용하도록 분리합니다.
      window.sessionStorage.setItem("still-writer-access-token", loginData.accessToken);
      onLogin({
        userId: loginData.userId,
        email: loginData.email,
        nickname: loginData.nickname,
        tokenType: loginData.tokenType,
        accessTokenExpiresAt: loginData.accessTokenExpiresAt,
        keepSignedIn: form.keepSignedIn,
      });

      setForm((current) => ({ ...current, password: "" }));
      navigate("/", { replace: true });
    } catch (error) {
      const responseErrors = error?.response?.data?.errors;
      const message = getApiErrorMessage(error, "로그인에 실패했습니다.");

      if (responseErrors && typeof responseErrors === "object") {
        setErrors((current) => ({ ...current, ...responseErrors }));
        const firstInvalidName = Object.keys(responseErrors)[0];
        if (firstInvalidName) event.currentTarget.elements.namedItem(firstInvalidName)?.focus();
      } else {
        setErrors((current) => ({ ...current, form: message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        "--login-background-light": 'url("/images/heroimage(light).png")',
        "--login-background-dark": 'url("/images/heroimage(dark).png")',
      }}
    >
      <Link className="login-page__back" to="/" aria-label="이전 페이지로 이동">
        <ArrowBackIosNewRounded />
      </Link>

      <main className="login-layout">
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__heading">
            <h1 id="login-title">로그인</h1>
            <p>계정으로 로그인하고 글쓰기를 이어가세요.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className={`login-field${errors.email ? " is-invalid" : ""}`}>
              <MailOutlineRounded aria-hidden="true" />
              <span className="sr-only">이메일</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="이메일"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                required
              />
            </label>
            {errors.email && <p className="login-field-error" id="login-email-error">{errors.email}</p>}

            <label className={`login-field${errors.password ? " is-invalid" : ""}`}>
              <LockOutlined aria-hidden="true" />
              <span className="sr-only">비밀번호</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
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
            {errors.password && <p className="login-field-error" id="login-password-error">{errors.password}</p>}

            <div className="login-form__options">
              <label className="login-checkbox">
                <input type="checkbox" name="keepSignedIn" checked={form.keepSignedIn} onChange={handleChange} />
                <span>로그인 상태 유지</span>
              </label>
              <Link to="/find-password">비밀번호 찾기</Link>
            </div>

            {location.state?.message && <p className="login-status is-error" role="alert">{location.state.message}</p>}
            {errors.form && <p className="login-status is-error" role="alert">{errors.form}</p>}
            {statusMessage && <p className="login-status" role="status">{statusMessage}</p>}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중" : "로그인"}
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
            <button className="gsi-material-button" type="button" onClick={startGoogleLogin}>
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
