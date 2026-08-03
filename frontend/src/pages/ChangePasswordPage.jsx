import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import '../styles/profile.css';

const INITIAL_FORM = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
};

function validatePasswordForm(form) {
  const errors = {};

  if (!form.currentPassword) {
    errors.currentPassword = '현재 비밀번호를 입력해 주세요.';
  }

  if (!form.newPassword) {
    errors.newPassword = '새 비밀번호를 입력해 주세요.';
  } else if (form.newPassword.length < 8) {
    errors.newPassword = '새 비밀번호는 8자 이상이어야 합니다.';
  } else if (form.newPassword.length > 72) {
    errors.newPassword = '새 비밀번호는 최대 72자까지 입력할 수 있습니다.';
  } else if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
    errors.newPassword = '새 비밀번호에는 영문과 숫자를 하나 이상 포함해 주세요.';
  } else if (form.currentPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = '새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.';
  }

  if (!form.newPasswordConfirm) {
    errors.newPasswordConfirm = '새 비밀번호를 한 번 더 입력해 주세요.';
  } else if (form.newPassword !== form.newPasswordConfirm) {
    errors.newPasswordConfirm = '새 비밀번호가 일치하지 않습니다.';
  }

  return errors;
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [visibleFields, setVisibleFields] = useState({
    currentPassword: false,
    newPassword: false,
    newPasswordConfirm: false,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatusMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validatePasswordForm(form);
    setErrors(nextErrors);

    const firstInvalidName = Object.keys(nextErrors)[0];
    if (firstInvalidName) {
      event.currentTarget.elements.namedItem(firstInvalidName)?.focus();
      return;
    }

    setForm(INITIAL_FORM);
    setStatusMessage('비밀번호 변경 API 연결 후 실제 비밀번호가 변경됩니다. 현재는 화면 검증만 완료되었습니다.');
  };

  const renderPasswordField = ({ name, label, autoComplete }) => {
    const isVisible = visibleFields[name];

    return (
      <label className={`profile-form__field${errors[name] ? ' is-invalid' : ''}`}>
        <span>{label}</span>
        <div>
          <LockOutlinedIcon aria-hidden="true" />
          <input
            type={isVisible ? 'text' : 'password'}
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={label}
            autoComplete={autoComplete}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
            required
          />
          <button
            className="profile-password-visibility"
            type="button"
            onClick={() => setVisibleFields((current) => ({ ...current, [name]: !current[name] }))}
            aria-label={`${label} ${isVisible ? '숨기기' : '표시'}`}
            aria-pressed={isVisible}
          >
            {isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
          </button>
        </div>
        {errors[name] && <p className="profile-form__error" id={`${name}-error`}>{errors[name]}</p>}
      </label>
    );
  };

  return (
    <div className="profile-settings-page">
      <button className="profile-back-button" type="button" onClick={() => navigate('/profile')}>
        <ArrowBackRoundedIcon />
        <span>프로필 설정으로 돌아가기</span>
      </button>

      <header className="profile-settings-heading">
        <div className="profile-settings-heading__icon" aria-hidden="true">
          <SecurityOutlinedIcon />
        </div>
        <div>
          <h1>비밀번호 변경</h1>
          <p>계정 보호를 위해 현재 비밀번호 확인 후 새 비밀번호를 설정합니다.</p>
        </div>
      </header>

      <div className="profile-settings-layout profile-settings-layout--single">
        <main className="profile-settings-content">
          <section className="profile-settings-card" aria-labelledby="change-password-title">
            <header>
              <div>
                <h2 id="change-password-title">새 비밀번호 설정</h2>
                <p>비밀번호는 8~72자이며, 영문과 숫자를 하나 이상 포함해야 합니다.</p>
              </div>
            </header>

            <form className="profile-form" onSubmit={handleSubmit} noValidate>
              {renderPasswordField({
                name: 'currentPassword',
                label: '현재 비밀번호',
                autoComplete: 'current-password',
              })}
              {renderPasswordField({
                name: 'newPassword',
                label: '새 비밀번호',
                autoComplete: 'new-password',
              })}
              {renderPasswordField({
                name: 'newPasswordConfirm',
                label: '새 비밀번호 확인',
                autoComplete: 'new-password',
              })}

              {statusMessage && <p className="profile-form__status" role="status">{statusMessage}</p>}

              <div className="profile-form__actions">
                <button
                  className="profile-form__secondary"
                  type="button"
                  onClick={() => {
                    setForm(INITIAL_FORM);
                    setErrors({});
                    setStatusMessage('');
                  }}
                >
                  입력 초기화
                </button>
                <button className="profile-form__submit" type="submit">
                  비밀번호 변경
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
