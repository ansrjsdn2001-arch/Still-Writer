import { useEffect, useRef } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { primaryNavigationItems, settingsNavigationItem } from './navigationItems';

/** 모바일에서 데스크탑 사이드바와 동일한 전체 메뉴를 제공하는 슬라이드 패널입니다. */
export default function MobileSidebar({ isOpen, activeNav, currentUser, onClose, onNavigate }) {
  const drawerRef = useRef(null);
  const nickname = currentUser?.nickname?.trim() || '사용자';

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavigate = (navigationId) => {
    onNavigate(navigationId);
    onClose();
  };

  return (
    <div className={`mobile-drawer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <button className="mobile-drawer__backdrop" type="button" onClick={onClose} aria-label="전체 메뉴 닫기" tabIndex={isOpen ? 0 : -1} />
      <aside ref={drawerRef} className="mobile-drawer__panel" role="dialog" aria-modal="true" aria-label="전체 메뉴" tabIndex={-1} inert={!isOpen}>
        <button className="mobile-drawer__account" type="button" onClick={() => handleNavigate(currentUser ? 'profile' : 'login')}>
          <span className="mobile-drawer__avatar"><PersonOutlineRoundedIcon /></span>
          <span><strong>{currentUser ? nickname : '로그인이 필요합니다'}</strong><small>{currentUser ? '프로필 설정' : '로그인 페이지로 이동'}</small></span>
          <ChevronRightRoundedIcon />
        </button>

        <nav className="mobile-drawer__nav" aria-label="모바일 전체 메뉴">
          {primaryNavigationItems.map(({ id, label, Icon }) => (
            <button key={id} className={`sidebar-link${activeNav === id ? ' is-active' : ''}`} type="button" onClick={() => handleNavigate(id)}>
              <Icon /><span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="sidebar__folders">
          <div className="sidebar__section-title"><span>내 폴더</span><button className="icon-button icon-button--small" type="button" aria-label="새 폴더"><AddOutlinedIcon /></button></div>
          <p className="sidebar__empty">생성된 폴더가 없습니다.</p>
        </section>

        <nav className="mobile-drawer__utility" aria-label="설정 메뉴">
          <button className={`sidebar-link${activeNav === settingsNavigationItem.id ? ' is-active' : ''}`} type="button" onClick={() => handleNavigate(settingsNavigationItem.id)}>
            <settingsNavigationItem.Icon /><span>{settingsNavigationItem.label}</span>
          </button>
        </nav>
      </aside>
    </div>
  );
}
