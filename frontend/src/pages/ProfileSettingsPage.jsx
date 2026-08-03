import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import '../styles/profile.css';

function validateNickname(nickname) {
  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) return '닉네임을 입력해 주세요.';
  if (trimmedNickname.length < 2 || trimmedNickname.length > 50) return '닉네임은 2~50자로 입력해 주세요.';
  if (!/^[가-힣a-zA-Z0-9_\- ]+$/.test(trimmedNickname)) {
    return '닉네임은 한글, 영문, 숫자, 공백, 하이픈, 밑줄만 사용할 수 있습니다.';
  }

  return '';
}

function getInitials(nickname, email) {
  const source = nickname?.trim() || email?.trim() || '사용자';
  return source.slice(0, 2).toLocaleUpperCase('ko-KR');
}

export default function ProfileSettingsPage({ currentUser, onProfileUpdate }) {
  const [nickname, setNickname] = useState(currentUser?.nickname ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const email = currentUser?.email ?? '';
  const userId = currentUser?.userId ?? '-';
  const currentNickname = currentUser?.nickname?.trim() || '사용자';
  const profileInitials = useMemo(() => getInitials(nickname || currentNickname, email), [currentNickname, email, nickname]);
  const hasChanged = nickname.trim() !== currentNickname;

  const handleSubmit = (event) => {
    event.preventDefault();

    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setErrorMessage(nicknameError);
      setStatusMessage('');
      event.currentTarget.elements.namedItem('nickname')?.focus();
      return;
    }

    const nextNickname = nickname.trim();
    onProfileUpdate?.({ nickname: nextNickname });
    setErrorMessage('');
    setStatusMessage('프로필 표시 정보가 수정되었습니다. 서버 저장은 프로필 API 연결 후 적용됩니다.');
  };

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
    setErrorMessage('');
    setStatusMessage('');
  };

  return (
    <div className="profile-settings-page">
      <header className="profile-settings-heading">
        <div className="profile-settings-heading__icon" aria-hidden="true">
          <ManageAccountsOutlinedIcon />
        </div>
        <div>
          <h1 id="profile-settings-title">프로필 설정</h1>
          <p>{currentNickname}님의 프로필 정보를 확인하고 표시 이름을 수정합니다.</p>
        </div>
      </header>

      <div className="profile-settings-layout">
        <aside className="profile-summary-card" aria-label="프로필 요약">
          <div className="profile-summary-card__avatar" aria-hidden="true">
            {profileInitials}
          </div>
          <strong>{currentNickname}</strong>
          <span>{email || '이메일 정보 없음'}</span>
          <dl>
            <div>
              <dt>사용자 ID</dt>
              <dd>{userId}</dd>
            </div>
            <div>
              <dt>로그인 상태</dt>
              <dd>{currentUser?.tokenType ? '인증 완료' : '확인 필요'}</dd>
            </div>
          </dl>
        </aside>

        <main className="profile-settings-content">
          <section className="profile-settings-card" aria-labelledby="profile-edit-title">
            <header>
              <div>
                <h2 id="profile-edit-title">기본 정보</h2>
                <p>헤더와 메뉴에 표시되는 닉네임을 관리합니다.</p>
              </div>
            </header>

            <form className="profile-form" onSubmit={handleSubmit} noValidate>
              <label className="profile-form__field is-readonly">
                <span>이메일</span>
                <div>
                  <EmailOutlinedIcon aria-hidden="true" />
                  <input type="email" value={email} readOnly aria-readonly="true" />
                </div>
                <small>이메일 변경은 별도 인증 흐름이 필요하므로 아직 제공하지 않습니다.</small>
              </label>

              <label className={`profile-form__field${errorMessage ? ' is-invalid' : ''}`}>
                <span>닉네임</span>
                <div>
                  <BadgeOutlinedIcon aria-hidden="true" />
                  <input
                    type="text"
                    name="nickname"
                    value={nickname}
                    onChange={handleNicknameChange}
                    placeholder="닉네임을 입력하세요"
                    minLength={2}
                    maxLength={50}
                    autoComplete="nickname"
                    aria-invalid={Boolean(errorMessage)}
                    aria-describedby={errorMessage ? 'profile-nickname-error' : 'profile-nickname-helper'}
                    required
                  />
                </div>
                <small id="profile-nickname-helper">{nickname.length}/50 · 한글, 영문, 숫자, 공백, 하이픈, 밑줄 사용 가능</small>
              </label>
              {errorMessage && <p className="profile-form__error" id="profile-nickname-error">{errorMessage}</p>}

              {statusMessage && <p className="profile-form__status" role="status">{statusMessage}</p>}

              <div className="profile-form__actions">
                <button
                  className="profile-form__secondary"
                  type="button"
                  onClick={() => {
                    setNickname(currentNickname);
                    setErrorMessage('');
                    setStatusMessage('');
                  }}
                  disabled={!hasChanged}
                >
                  되돌리기
                </button>
                <button className="profile-form__submit" type="submit" disabled={!hasChanged}>
                  저장
                </button>
              </div>
            </form>
          </section>

          <section className="profile-settings-card profile-settings-card--pending" aria-labelledby="profile-security-title">
            <header>
              <div>
                <h2 id="profile-security-title">계정 관리</h2>
                <p>비밀번호 변경과 회원 탈퇴 화면은 다음 구현 항목에서 분리해 연결합니다.</p>
              </div>
            </header>
            <div className="profile-pending-list">
              <Link className="profile-pending-link" to="/profile/password">
                <PersonOutlineRoundedIcon aria-hidden="true" />
                <div>
                  <strong>비밀번호 변경</strong>
                  <span>일반 로그인 계정의 비밀번호 변경 화면이 필요합니다.</span>
                </div>
              </Link>
              <article>
                <PersonOutlineRoundedIcon aria-hidden="true" />
                <div>
                  <strong>회원 탈퇴</strong>
                  <span>데이터 삭제 영향 안내와 확인 절차가 필요합니다.</span>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
