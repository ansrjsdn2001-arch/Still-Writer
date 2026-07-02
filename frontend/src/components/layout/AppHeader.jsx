import { useEffect, useRef, useState } from "react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";

/**
 * 모든 화면에서 로고, 테마, 로그인 상태별 계정 기능을 일관되게 제공합니다.
 * 모바일 로그인 상태에서는 프로필 메뉴를 숨기고 하단 내비게이션으로 분리합니다.
 */
export default function AppHeader({
  currentUser,
  theme,
  showMobileMenu,
  onMobileMenuOpen,
  onThemeToggle,
  onLogout,
}) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();
  const nickname = currentUser?.nickname?.trim() || "사용자";

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsAccountMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    onLogout();
    navigate("/", { replace: true });
  };

  return (
    <header className="app-header">
      {showMobileMenu && (
        <button
          className="app-header__mobile-menu"
          type="button"
          onClick={onMobileMenuOpen}
          aria-label="전체 메뉴 열기"
          aria-haspopup="dialog"
        >
          <MenuRoundedIcon />
        </button>
      )}
      <Link
        className="app-header__brand"
        to="/"
        aria-label="Still Writer 메인 페이지로 이동"
      >
        <BrandLogo />
        <span className="app-header__mobile-wordmark-frame">
          <img
            className="app-header__mobile-wordmark"
            src="/images/still-writer-wordmark-centered.png"
            alt="Still Writer"
          />
        </span>
      </Link>

      <div className="app-header__actions">
        <button
          className="app-header__theme"
          type="button"
          onClick={onThemeToggle}
          aria-label={
            theme === "light" ? "다크 테마로 변경" : "라이트 테마로 변경"
          }
          title={theme === "light" ? "다크 테마" : "라이트 테마"}
        >
          {theme === "light" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
          <span>{theme === "light" ? "다크 모드" : "라이트 모드"}</span>
        </button>

        {currentUser ? (
          <div className="account-menu" ref={accountMenuRef}>
            <button
              className="account-menu__trigger"
              type="button"
              onClick={() => setIsAccountMenuOpen((current) => !current)}
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
            >
              <span>{nickname}</span>
              <ExpandMoreRoundedIcon
                className={isAccountMenuOpen ? "is-open" : ""}
              />
            </button>

            {isAccountMenuOpen && (
              <div className="account-menu__popover" role="menu">
                <Link
                  role="menuitem"
                  to="/profile"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <ManageAccountsOutlinedIcon />
                  <span>프로필 설정</span>
                </Link>
                <button role="menuitem" type="button" onClick={handleLogout}>
                  <LogoutRoundedIcon />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <nav className="app-header__auth" aria-label="회원 메뉴">
            <Link className="app-header__login" to="/login">
              로그인
            </Link>
            <Link className="app-header__join" to="/join">
              회원가입
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
