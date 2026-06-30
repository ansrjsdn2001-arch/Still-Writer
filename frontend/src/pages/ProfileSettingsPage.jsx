import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

/**
 * 공용 헤더와 모바일 하단 내비게이션에서 프로필 설정 이동을 확인하기 위한 화면입니다.
 * 실제 저장 폼은 회원 API가 확정된 뒤 이 영역에 연결합니다.
 */
export default function ProfileSettingsPage({ currentUser }) {
  return (
    <section className="profile-settings-page" aria-labelledby="profile-settings-title">
      <div className="profile-settings-page__icon" aria-hidden="true">
        <ManageAccountsOutlinedIcon />
      </div>
      <div>
        <h1 id="profile-settings-title">프로필 설정</h1>
        <p>{currentUser?.nickname?.trim() || '사용자'}님의 프로필 정보를 관리하는 화면입니다.</p>
      </div>
    </section>
  );
}
