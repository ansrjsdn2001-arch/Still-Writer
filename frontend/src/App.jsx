import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import MobileNavigation from './components/layout/MobileNavigation';
import HomePage from './pages/HomePage';
import AllWritingsPage from './pages/AllWritingsPage';
import Login from './pages/Login';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import WritePage from './pages/WritePage';
import './styles/layout.css';

function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem('still-writer-user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function readStoredTheme() {
  const storedTheme = window.localStorage.getItem('still-writer-theme');
  return storedTheme === 'dark' ? 'dark' : 'light';
}

function Workspace({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedNav, setSelectedNav] = useState('home');
  const activeNav = location.pathname === '/'
    ? 'home'
    : location.pathname === '/writings'
      ? 'all'
    : location.pathname === '/write'
        ? 'write'
      : location.pathname === '/profile'
        ? 'profile'
        : selectedNav;

  const handleNavigate = (navigationId) => {
    setSelectedNav(navigationId);
    if (navigationId === 'home') navigate('/');
    if (navigationId === 'all') navigate('/writings');
    if (navigationId === 'write') navigate('/write');
  };

  return (
    <>
      <AppSidebar activeNav={activeNav} onNavigate={handleNavigate} />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/writings" element={<AllWritingsPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/profile" element={<ProfileSettingsPage currentUser={currentUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNavigation activeNav={activeNav} onNavigate={handleNavigate} currentUser={currentUser} />
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(readStoredTheme);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const themeTransitionTimerRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  useEffect(() => () => window.clearTimeout(themeTransitionTimerRef.current), []);

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

  const handleLogout = () => {
    window.localStorage.removeItem('still-writer-user');
    setCurrentUser(null);
  };

  return (
    <div className={`app${isThemeTransitioning ? ' is-theme-transitioning' : ''}`} data-theme={theme}>
      <AppHeader
        currentUser={currentUser}
        theme={theme}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Workspace currentUser={currentUser} />} />
      </Routes>
    </div>
  );
}
