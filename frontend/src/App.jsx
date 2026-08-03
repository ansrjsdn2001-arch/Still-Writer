import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import MobileNavigation from './components/layout/MobileNavigation';
import MobileSidebar from './components/layout/MobileSidebar';
import HomePage from './pages/HomePage';
import AllWritingsPage from './pages/AllWritingsPage';
import FolderDetailPage from './pages/FolderDetailPage';
import FoldersPage from './pages/FoldersPage';
import FavoritesPage from './pages/FavoritesPage';
import MaterialsPage from './pages/MaterialsPage';
import TrashPage from './pages/TrashPage';
import Login from './pages/Login';
import Join from './pages/Join';
import OAuthCallback from './pages/OAuthCallback';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import SettingsPage from './pages/SettingsPage';
import WritingDetailPage from './pages/WritingDetailPage';
import WritePage from './pages/WritePage';
import { logout as requestLogout } from './api/auth';
import { clearAccessToken } from './api/client';
import './styles/layout.css';

function readStoredUser() {
  try {
    const storedUser = window.sessionStorage.getItem('still-writer-user') ?? window.localStorage.getItem('still-writer-user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function readStoredTheme() {
  const storedTheme = window.localStorage.getItem('still-writer-theme');
  return storedTheme === 'dark' ? 'dark' : 'light';
}

function ProtectedRoute({ currentUser, children }) {
  const location = useLocation();

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          message: '로그인이 필요한 기능입니다. 글 작성과 저장을 위해 로그인해 주세요.',
        }}
      />
    );
  }

  return children;
}

function Workspace({ currentUser, theme, isMobileMenuOpen, onMobileMenuClose, onProfileUpdate, onThemeToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedNav, setSelectedNav] = useState('home');
  const activeNav = location.pathname === '/'
    ? 'home'
    : location.pathname.startsWith('/writings')
      ? 'all'
    : location.pathname.startsWith('/search')
      ? 'search'
    : location.pathname === '/write'
        ? 'write'
      : location.pathname.startsWith('/folders')
        ? 'folders'
      : location.pathname === '/favorites'
        ? 'favorites'
      : location.pathname === '/materials'
        ? 'materials'
      : location.pathname === '/trash'
        ? 'trash'
      : location.pathname.startsWith('/settings')
        ? 'settings'
      : location.pathname.startsWith('/profile')
        ? 'profile'
        : selectedNav;

  const handleNavigate = (navigationId) => {
    setSelectedNav(navigationId);
    if (navigationId === 'home') navigate('/');
    if (navigationId === 'all') navigate('/writings');
    if (navigationId === 'search') navigate('/search');
    if (navigationId === 'write') navigate('/write');
    if (navigationId === 'folders') navigate('/folders');
    if (navigationId === 'favorites') navigate('/favorites');
    if (navigationId === 'materials') navigate('/materials');
    if (navigationId === 'trash') navigate('/trash');
    if (navigationId === 'settings') navigate('/settings');
    if (navigationId === 'profile') navigate('/profile');
    if (navigationId === 'login') navigate('/login');
  };

  return (
    <>
      <AppSidebar activeNav={activeNav} onNavigate={handleNavigate} />
      <MobileSidebar isOpen={isMobileMenuOpen} activeNav={activeNav} currentUser={currentUser} onClose={onMobileMenuClose} onNavigate={handleNavigate} />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<ProtectedRoute currentUser={currentUser}><HomePage currentUser={currentUser} /></ProtectedRoute>} />
          <Route path="/writings" element={<ProtectedRoute currentUser={currentUser}><AllWritingsPage /></ProtectedRoute>} />
          <Route path="/writings/:documentId" element={<ProtectedRoute currentUser={currentUser}><WritingDetailPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute currentUser={currentUser}><SearchResultsPage /></ProtectedRoute>} />
          <Route path="/folders" element={<ProtectedRoute currentUser={currentUser}><FoldersPage /></ProtectedRoute>} />
          <Route path="/folders/:folderId" element={<ProtectedRoute currentUser={currentUser}><FolderDetailPage /></ProtectedRoute>} />
          <Route path="/write" element={<ProtectedRoute currentUser={currentUser}><WritePage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute currentUser={currentUser}><FavoritesPage /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute currentUser={currentUser}><MaterialsPage /></ProtectedRoute>} />
          <Route path="/trash" element={<ProtectedRoute currentUser={currentUser}><TrashPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute currentUser={currentUser}><SettingsPage theme={theme} onThemeToggle={onThemeToggle} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute currentUser={currentUser}><ProfileSettingsPage currentUser={currentUser} onProfileUpdate={onProfileUpdate} /></ProtectedRoute>} />
          <Route path="/profile/password" element={<ProtectedRoute currentUser={currentUser}><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage currentUser={currentUser} />} />
        </Routes>
      </main>
      <MobileNavigation activeNav={activeNav} onNavigate={handleNavigate} />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(readStoredTheme);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const themeTransitionTimerRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(readStoredUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => () => window.clearTimeout(themeTransitionTimerRef.current), []);
  useEffect(() => setIsMobileMenuOpen(false), [location.pathname]);

  const toggleTheme = () => {
    // 테마가 전환되는 짧은 시간에만 전역 색상 애니메이션을 활성화합니다.
    setIsThemeTransitioning(true);
    window.clearTimeout(themeTransitionTimerRef.current);
    themeTransitionTimerRef.current = window.setTimeout(() => {
      setIsThemeTransitioning(false);
    }, 240);
    setTheme((current) => {
      const nextTheme = current === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('still-writer-theme', nextTheme);
      return nextTheme;
    });
  };

  const handleLogout = useCallback(async () => {
    try {
      await requestLogout();
    } catch {
      // 서버 로그아웃 실패 여부와 관계없이 브라우저의 로그인 정보는 제거합니다.
    }
    window.localStorage.removeItem('still-writer-user');
    window.sessionStorage.removeItem('still-writer-user');
    clearAccessToken();
    setCurrentUser(null);
  }, []);

  const handleLogin = useCallback((loginUser) => {
    const storage = loginUser.keepSignedIn ? window.localStorage : window.sessionStorage;
    const otherStorage = loginUser.keepSignedIn ? window.sessionStorage : window.localStorage;

    otherStorage.removeItem('still-writer-user');
    storage.setItem('still-writer-user', JSON.stringify(loginUser));
    setCurrentUser(loginUser);
  }, []);

  const handleProfileUpdate = useCallback((profilePatch) => {
    setCurrentUser((current) => {
      if (!current) return current;

      const nextUser = { ...current, ...profilePatch };
      const currentStorage = window.sessionStorage.getItem('still-writer-user')
        ? window.sessionStorage
        : window.localStorage;

      currentStorage.setItem('still-writer-user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  return (
    <div className={`app${isThemeTransitioning ? ' is-theme-transitioning' : ''}`} data-theme={theme}>
      <AppHeader
        currentUser={currentUser}
        theme={theme}
        showMobileMenu={!['/login', '/join', '/oauth/google/callback', '/oauth/kakao/callback'].includes(location.pathname)}
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/oauth/google/callback" element={<OAuthCallback provider="google" onLogin={handleLogin} />} />
        <Route path="/oauth/kakao/callback" element={<OAuthCallback provider="kakao" onLogin={handleLogin} />} />
        <Route path="/join" element={<Join />} />
        <Route
          path="/*"
          element={(
            <Workspace
              currentUser={currentUser}
              theme={theme}
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuClose={() => setIsMobileMenuOpen(false)}
              onProfileUpdate={handleProfileUpdate}
              onThemeToggle={toggleTheme}
            />
          )}
        />
      </Routes>
    </div>
  );
}
