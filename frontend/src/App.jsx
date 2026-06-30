import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import MobileNavigation from './components/layout/MobileNavigation';
import HomePage from './pages/HomePage';
import AllWritingsPage from './pages/AllWritingsPage';
import Login from './pages/Login';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
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
    : location.pathname === '/profile'
        ? 'profile'
        : selectedNav;

  const handleNavigate = (navigationId) => {
    setSelectedNav(navigationId);
    if (navigationId === 'home') navigate('/');
    if (navigationId === 'all') navigate('/writings');
  };

  return (
    <>
      <AppSidebar activeNav={activeNav} onNavigate={handleNavigate} />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/writings" element={<AllWritingsPage />} />
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
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  const toggleTheme = () => {
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
    <div className="app" data-theme={theme}>
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
