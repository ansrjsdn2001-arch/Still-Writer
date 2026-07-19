import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { sendEmailVerification, signup, verifyEmailCode } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import '../styles/login.css';
import '../styles/join.css';

const INITIAL_FORM = {
  email: '',
  verificationCode: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
  agreedToTerms: false,
};

const INITIAL_EMAIL_VERIFICATION = {
  sent: false,
  verified: false,
  email: '',
  expiresAt: null,
  remainingSeconds: 0,
};

const VERIFICATION_CODE_PATTERN = /^[A-Za-z0-9]{6}$/;
const VERIFICATION_VALID_SECONDS = 180;
const RESEND_WAIT_SECONDS = 30;

function validateEmail(email) {
  if (!email) return '이메일을 입력해 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식을 입력해 주세요.';
  return '';
}

function validateForm(form, emailVerification) {
  const errors = {};
  const email = form.email.trim();
  const nickname = form.nickname.trim();
  const emailError = validateEmail(email);

  if (emailError) errors.email = emailError;
  else if (!emailVerification.sent) errors.email = '이메일 인증 메일을 먼저 발송해 주세요.';
  else if (!emailVerification.verified) errors.verificationCode = '이메일 인증을 완료해 주세요.';

  if (!nickname) errors.nickname = '닉네임을 입력해 주세요.';
  else if (nickname.length < 2 || nickname.length > 50) errors.nickname = '닉네임은 2~50자로 입력해 주세요.';
  else if (!/^[가-힣a-zA-Z0-9_\- ]+$/.test(nickname)) errors.nickname = '닉네임은 한글, 영문, 숫자, 공백, 하이픈, 밑줄만 사용할 수 있습니다.';

  if (!form.password) errors.password = '비밀번호를 입력해 주세요.';
  else if (form.password.length < 8) errors.password = '비밀번호는 8자 이상이어야 합니다.';
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errors.password = '영문과 숫자를 하나 이상 포함해 주세요.';

  if (!form.passwordConfirm) errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.';
  else if (form.password !== form.passwordConfirm) errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

  if (!form.agreedToTerms) errors.agreedToTerms = '필수 약관에 동의해 주세요.';
  return errors;
}

function getRemainingSeconds(expiresAt) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

function getFallbackExpiresAt() {
  return new Date(Date.now() + VERIFICATION_VALID_SECONDS * 1000).toISOString();
}

function formatRemainingTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** 백엔드 이메일 인증 API와 연결된 회원가입 화면입니다. */
export default function Join() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [emailVerification, setEmailVerification] = useState(INITIAL_EMAIL_VERIFICATION);
  const [resendRemainingSeconds, setResendRemainingSeconds] = useState(0);
  const [sendingVerificationEmail, setSendingVerificationEmail] = useState(false);
  const [verifyingEmailCode, setVerifyingEmailCode] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [signupCompleted, setSignupCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const formRef = useRef(null);

  const isVerificationExpired = emailVerification.sent && !emailVerification.verified && emailVerification.remainingSeconds <= 0;
  const canSendVerificationEmail = !sendingVerificationEmail && resendRemainingSeconds <= 0;
  const canSubmitSignup = emailVerification.verified && !signingUp && !signupCompleted;

  useEffect(() => {
    if (!emailVerification.expiresAt || emailVerification.verified) return undefined;

    const updateRemainingSeconds = () => {
      const nextRemainingSeconds = getRemainingSeconds(emailVerification.expiresAt);

      setEmailVerification((current) => ({
        ...current,
        remainingSeconds: nextRemainingSeconds,
      }));

      if (nextRemainingSeconds === 0) {
        setErrors((current) => {
          if (current.verificationCode) return current;
          return {
            ...current,
            verificationCode: '인증 시간이 만료되었습니다. 다시 인증 메일을 발송해 주세요.',
          };
        });
      }
    };

    updateRemainingSeconds();
    const timerId = window.setInterval(updateRemainingSeconds, 1000);
    return () => window.clearInterval(timerId);
  }, [emailVerification.expiresAt, emailVerification.verified]);

  useEffect(() => {
    if (resendRemainingSeconds <= 0) return undefined;

    const timerId = window.setInterval(() => {
      setResendRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendRemainingSeconds]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    const nextValue = name === 'verificationCode' ? value.replace(/[^A-Za-z0-9]/g, '').slice(0, 6) : value;

    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : nextValue }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatusMessage('');
    setSignupCompleted(false);

    // 인증 완료 후 이메일이 바뀌면 이전 이메일의 인증 결과가 새 이메일에 적용되지 않도록 즉시 초기화합니다.
    if (name === 'email') {
      setEmailVerification((current) => (current.sent || current.verified ? INITIAL_EMAIL_VERIFICATION : current));
      setForm((current) => ({ ...current, verificationCode: '' }));
      setErrors((current) => ({ ...current, verificationCode: undefined }));
      setResendRemainingSeconds(0);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!canSendVerificationEmail) return;

    const email = form.email.trim();
    const emailError = validateEmail(email);

    if (emailError) {
      setErrors((current) => ({ ...current, email: emailError }));
      formRef.current?.elements.namedItem('email')?.focus();
      return;
    }

    setSendingVerificationEmail(true);
    setStatusMessage('');

    try {
      const result = await sendEmailVerification(email);
      const expiresAt = result?.data?.expiresAt ?? getFallbackExpiresAt();
      const remainingSeconds = getRemainingSeconds(expiresAt) || VERIFICATION_VALID_SECONDS;

      setEmailVerification({
        sent: true,
        verified: false,
        email: result?.data?.email ?? email,
        expiresAt,
        remainingSeconds,
      });
      setForm((current) => ({ ...current, verificationCode: '' }));
      setErrors((current) => ({ ...current, email: undefined, verificationCode: undefined }));
      setResendRemainingSeconds(RESEND_WAIT_SECONDS);
      setStatusMessage(result?.message ?? '인증 코드가 이메일로 발송되었습니다.');
    } catch (error) {
      const message = getApiErrorMessage(error, '인증 메일 발송에 실패했습니다.');
      setErrors((current) => ({ ...current, email: message }));
      setStatusMessage('');
    } finally {
      setSendingVerificationEmail(false);
    }
  };

  const handleConfirmVerificationCode = async () => {
    if (verifyingEmailCode) return;

    const email = form.email.trim();
    const code = form.verificationCode.trim();

    if (!emailVerification.sent) {
      setErrors((current) => ({ ...current, verificationCode: '먼저 인증 메일을 발송해 주세요.' }));
      return;
    }

    if (isVerificationExpired) {
      setErrors((current) => ({ ...current, verificationCode: '인증 시간이 만료되었습니다. 다시 인증 메일을 발송해 주세요.' }));
      return;
    }

    if (!VERIFICATION_CODE_PATTERN.test(code)) {
      setErrors((current) => ({ ...current, verificationCode: '인증 코드는 영문 대/소문자와 숫자로 이루어진 6자리여야 합니다.' }));
      formRef.current?.elements.namedItem('verificationCode')?.focus();
      return;
    }

    setVerifyingEmailCode(true);
    setStatusMessage('');

    try {
      const result = await verifyEmailCode({ email, code });

      setEmailVerification((current) => ({
        ...current,
        verified: true,
        email: result?.data?.email ?? email,
        expiresAt: null,
        remainingSeconds: 0,
      }));
      setErrors((current) => ({ ...current, verificationCode: undefined }));
      setStatusMessage(result?.message ?? '이메일 인증이 완료되었습니다.');
    } catch (error) {
      const message = getApiErrorMessage(error, '이메일 인증에 실패했습니다.');
      setErrors((current) => ({ ...current, verificationCode: message }));
      formRef.current?.elements.namedItem('verificationCode')?.focus();
    } finally {
      setVerifyingEmailCode(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (signingUp || signupCompleted) return;

    const nextErrors = validateForm(form, emailVerification);
    setErrors(nextErrors);

    const firstInvalidName = Object.keys(nextErrors)[0];
    if (firstInvalidName) {
      formRef.current?.elements.namedItem(firstInvalidName)?.focus();
      return;
    }

    setSigningUp(true);
    setStatusMessage('');

    try {
      const result = await signup({
        email: form.email.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
      });

      setSignupCompleted(true);
      // 회원가입 성공 후에도 개인정보 입력값은 화면에 남기되, 비밀번호와 인증 코드는 즉시 비웁니다.
      setForm((current) => ({
        ...current,
        verificationCode: '',
        password: '',
        passwordConfirm: '',
      }));
      setStatusMessage(result?.message ?? '회원가입이 완료되었습니다. 로그인 페이지에서 로그인해 주세요.');
    } catch (error) {
      const responseErrors = error?.response?.data?.errors;
      const message = getApiErrorMessage(error, '회원가입에 실패했습니다.');

      if (responseErrors && typeof responseErrors === 'object') {
        setErrors((current) => ({ ...current, ...responseErrors }));
        const firstInvalidName = Object.keys(responseErrors)[0];
        if (firstInvalidName) formRef.current?.elements.namedItem(firstInvalidName)?.focus();
      } else {
        setStatusMessage(message);
      }
    } finally {
      setSigningUp(false);
    }
  };

  const renderPasswordField = ({ name, label, autoComplete, visible, onToggle }) => (
    <div className="join-field-group">
      <label className={`login-field${errors[name] ? ' is-invalid' : ''}`}>
        <LockOutlined aria-hidden="true" />
        <span className="sr-only">{label}</span>
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={label}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          required
        />
        <button className="login-field__visibility" type="button" onClick={onToggle} aria-label={`${label} ${visible ? '숨기기' : '표시'}`} aria-pressed={visible}>
          {visible ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
        </button>
      </label>
      {errors[name] && <p className="join-field-error" id={`${name}-error`}>{errors[name]}</p>}
    </div>
  );

  return (
    <div className="login-page join-page" style={{ '--login-background-light': 'url("/images/heroimage(light).png")', '--login-background-dark': 'url("/images/heroimage(dark).png")' }}>
      <Link className="login-page__back" to="/login" aria-label="로그인 페이지로 이동"><ArrowBackIosNewRounded /></Link>

      <main className="login-layout join-layout">
        <section className="login-panel join-panel" aria-labelledby="join-title">
          <div className="login-panel__heading join-panel__heading">
            <h1 id="join-title">회원가입</h1>
            <p>나만의 글을 기록하고 오래 간직해 보세요.</p>
          </div>

          <form ref={formRef} className="login-form join-form" onSubmit={handleSubmit} noValidate>
            <div className="join-field-group">
              <div className="join-email-row">
                <label className={`login-field join-email-field${errors.email ? ' is-invalid' : ''}${emailVerification.verified ? ' is-verified' : ''}`}>
                  <MailOutlineRounded aria-hidden="true" /><span className="sr-only">이메일</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="이메일" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} required />
                </label>
                <button className="join-secondary-button" type="button" onClick={handleSendVerificationEmail} disabled={!canSendVerificationEmail || emailVerification.verified}>
                  {sendingVerificationEmail ? '발송 중' : resendRemainingSeconds > 0 ? `${resendRemainingSeconds}초` : emailVerification.sent ? '재발송' : '인증 메일 발송'}
                </button>
              </div>
              {errors.email && <p className="join-field-error" id="email-error">{errors.email}</p>}
              {emailVerification.sent && !emailVerification.verified && (
                <p className="join-field-helper" role="status">
                  {emailVerification.email} 주소로 인증 메일을 보냈습니다. 인증 코드는 3분 동안 유효합니다.
                </p>
              )}
              {emailVerification.verified && <p className="join-field-helper" role="status">이메일 인증이 완료되었습니다.</p>}
            </div>

            {emailVerification.sent && (
              <div className="join-field-group">
                <div className="join-email-row">
                  <label className={`login-field join-email-field${errors.verificationCode ? ' is-invalid' : ''}${emailVerification.verified ? ' is-verified' : ''}`}>
                    <MailOutlineRounded aria-hidden="true" /><span className="sr-only">인증 코드</span>
                    <input
                      type="text"
                      name="verificationCode"
                      value={form.verificationCode}
                      onChange={handleChange}
                      placeholder="인증 코드 6자리"
                      inputMode="text"
                      autoComplete="one-time-code"
                      maxLength={6}
                      aria-invalid={Boolean(errors.verificationCode)}
                      aria-describedby={errors.verificationCode ? 'verification-code-error' : 'verification-code-helper'}
                      disabled={emailVerification.verified}
                      required
                    />
                  </label>
                  <button className="join-secondary-button" type="button" onClick={handleConfirmVerificationCode} disabled={emailVerification.verified || verifyingEmailCode || isVerificationExpired}>
                    {verifyingEmailCode ? '확인 중' : emailVerification.verified ? '완료' : '인증 확인'}
                  </button>
                </div>
                {emailVerification.sent && !emailVerification.verified && emailVerification.remainingSeconds > 0 && (
                  <p className="join-field-helper" id="verification-code-helper">
                    남은 인증 시간 {formatRemainingTime(emailVerification.remainingSeconds)}
                  </p>
                )}
                {errors.verificationCode && <p className="join-field-error" id="verification-code-error">{errors.verificationCode}</p>}
              </div>
            )}

            <div className="join-field-group">
              <label className={`login-field${errors.nickname ? ' is-invalid' : ''}`}>
                <BadgeOutlined aria-hidden="true" /><span className="sr-only">닉네임</span>
                <input type="text" name="nickname" value={form.nickname} onChange={handleChange} placeholder="닉네임 (2~50자)" autoComplete="nickname" minLength={2} maxLength={50} aria-invalid={Boolean(errors.nickname)} aria-describedby={errors.nickname ? 'nickname-error' : undefined} required />
              </label>
              {errors.nickname && <p className="join-field-error" id="nickname-error">{errors.nickname}</p>}
            </div>

            {renderPasswordField({ name: 'password', label: '비밀번호 (영문+숫자 8자 이상)', autoComplete: 'new-password', visible: showPassword, onToggle: () => setShowPassword((current) => !current) })}
            {renderPasswordField({ name: 'passwordConfirm', label: '비밀번호 확인', autoComplete: 'new-password', visible: showPasswordConfirm, onToggle: () => setShowPasswordConfirm((current) => !current) })}

            <div className="join-consent-group">
              <label className="login-checkbox join-consent">
                <input type="checkbox" name="agreedToTerms" checked={form.agreedToTerms} onChange={handleChange} aria-invalid={Boolean(errors.agreedToTerms)} aria-describedby={errors.agreedToTerms ? 'terms-error' : undefined} />
                <span><strong>[필수]</strong> 이용약관 및 개인정보 수집에 동의합니다.</span>
              </label>
              {errors.agreedToTerms && <p className="join-field-error" id="terms-error">{errors.agreedToTerms}</p>}
            </div>

            <button className="login-submit" type="submit" disabled={!canSubmitSignup}>
              {signingUp ? '가입 처리 중' : signupCompleted ? '가입 완료' : '회원가입'}
            </button>
            {statusMessage && <p className="join-status" role="status">{statusMessage}</p>}
          </form>

          <p className="login-panel__join join-panel__login">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </section>
      </main>
    </div>
  );
}
