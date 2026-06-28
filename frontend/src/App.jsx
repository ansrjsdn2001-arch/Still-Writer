import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppSidebar from './components/layout/AppSidebar';
import MobileNavigation from './components/layout/MobileNavigation';
import EditorPage from './pages/EditorPage';
import './styles/layout.css';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [activeNav, setActiveNav] = useState('all');
  const toggleTheme = () => {
    setTheme((value) => (value === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app" data-theme={theme}>
      <AppSidebar
        activeNav={activeNav}
        onNavigate={setActiveNav}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <main className="app__main">
        <Routes>
          <Route
            path="/"
            element={<EditorPage theme={theme} onThemeToggle={toggleTheme} />}
          />
          <Route
            path="/write"
            element={<EditorPage theme={theme} onThemeToggle={toggleTheme} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNavigation activeNav={activeNav} onNavigate={setActiveNav} />
    </div>
  );
}
