import { useMemo, useState } from 'react';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import FormatIndentIncreaseOutlinedIcon from '@mui/icons-material/FormatIndentIncreaseOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import '../styles/settings.css';

const SETTINGS_STORAGE_KEY = 'still-writer-user-settings';

const defaultSettings = {
  editorFontFamily: 'system',
  editorFontSize: '16',
  autoIndent: true,
  autosaveInterval: '30',
  defaultExportFormat: 'txt',
  showWritingGuide: true,
};

function readStoredSettings() {
  try {
    const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function persistSettings(nextSettings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
}

function SettingCard({ icon, title, description, children }) {
  return (
    <section className="settings-card" aria-labelledby={`${title}-title`}>
      <header>
        <span aria-hidden="true">{icon}</span>
        <div>
          <h2 id={`${title}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="settings-card__body">{children}</div>
    </section>
  );
}

export default function SettingsPage({ theme, onThemeToggle }) {
  const [settings, setSettings] = useState(readStoredSettings);
  const [savedSettings, setSavedSettings] = useState(settings);
  const [statusMessage, setStatusMessage] = useState('');
  const hasChanged = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [savedSettings, settings]);

  const updateSetting = (name, value) => {
    setSettings((current) => ({ ...current, [name]: value }));
    setStatusMessage('');
  };

  const handleSave = (event) => {
    event.preventDefault();

    persistSettings(settings);
    setSavedSettings(settings);
    setStatusMessage('설정이 브라우저에 저장되었습니다. 서버 동기화는 사용자 설정 API 연결 후 적용됩니다.');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setStatusMessage('');
  };

  return (
    <div className="settings-page">
      <header className="settings-heading">
        <div className="settings-heading__icon" aria-hidden="true">
          <SettingsOutlinedIcon />
        </div>
        <div>
          <h1>설정</h1>
          <p>글쓰기 환경, 테마, 자동저장 표시 기준, 내보내기 기본값을 관리합니다.</p>
        </div>
      </header>

      <form className="settings-layout" onSubmit={handleSave}>
        <aside className="settings-summary" aria-label="설정 요약">
          <strong>현재 설정 상태</strong>
          <dl>
            <div>
              <dt>테마</dt>
              <dd>{theme === 'dark' ? '다크 모드' : '라이트 모드'}</dd>
            </div>
            <div>
              <dt>에디터 글자 크기</dt>
              <dd>{settings.editorFontSize}px</dd>
            </div>
            <div>
              <dt>자동 들여쓰기</dt>
              <dd>{settings.autoIndent ? '사용' : '사용 안 함'}</dd>
            </div>
            <div>
              <dt>기본 내보내기</dt>
              <dd>{settings.defaultExportFormat.toUpperCase()}</dd>
            </div>
          </dl>
          <p>현재 화면의 설정은 프론트엔드 로컬 설정입니다. 백엔드 `user_settings` API가 확정되면 계정 단위 동기화로 전환할 수 있습니다.</p>
        </aside>

        <main className="settings-content">
          <SettingCard
            icon={theme === 'dark' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            title="테마"
            description="라이트 모드와 다크 모드를 전환합니다."
          >
            <div className="settings-toggle-row">
              <div>
                <strong>{theme === 'dark' ? '다크 모드 사용 중' : '라이트 모드 사용 중'}</strong>
                <span>테마 값은 기존 정책대로 localStorage에 즉시 저장됩니다.</span>
              </div>
              <button className="settings-outline-button" type="button" onClick={onThemeToggle}>
                {theme === 'dark' ? <LightModeOutlinedIcon aria-hidden="true" /> : <DarkModeOutlinedIcon aria-hidden="true" />}
                {theme === 'dark' ? '라이트 모드로 변경' : '다크 모드로 변경'}
              </button>
            </div>
          </SettingCard>

          <SettingCard
            icon={<TextFieldsRoundedIcon />}
            title="글쓰기 화면"
            description="에디터에서 사용할 기본 글꼴과 글자 크기를 정합니다."
          >
            <div className="settings-grid">
              <label className="settings-field">
                <span>기본 글꼴</span>
                <select value={settings.editorFontFamily} onChange={(event) => updateSetting('editorFontFamily', event.target.value)}>
                  <option value="system">시스템 기본 글꼴</option>
                  <option value="serif">명조 계열</option>
                  <option value="sans">고딕 계열</option>
                  <option value="mono">고정폭 글꼴</option>
                </select>
              </label>

              <label className="settings-field">
                <span>글자 크기</span>
                <select value={settings.editorFontSize} onChange={(event) => updateSetting('editorFontSize', event.target.value)}>
                  <option value="15">15px</option>
                  <option value="16">16px</option>
                  <option value="17">17px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                </select>
              </label>
            </div>
          </SettingCard>

          <SettingCard
            icon={<FormatIndentIncreaseOutlinedIcon />}
            title="작성 보조"
            description="자동 들여쓰기와 자동저장 표시 기준을 관리합니다."
          >
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.autoIndent}
                onChange={(event) => updateSetting('autoIndent', event.target.checked)}
              />
              <span aria-hidden="true" />
              <div>
                <strong>새 문단 자동 들여쓰기</strong>
                <small>엔터 입력 후 다음 문단에 이전 문단의 들여쓰기 상태를 이어받도록 사용할 예정입니다.</small>
              </div>
            </label>

            <label className="settings-field">
              <span>자동저장 상태 표시 기준</span>
              <select value={settings.autosaveInterval} onChange={(event) => updateSetting('autosaveInterval', event.target.value)}>
                <option value="15">15초마다 표시</option>
                <option value="30">30초마다 표시</option>
                <option value="60">1분마다 표시</option>
              </select>
            </label>
          </SettingCard>

          <SettingCard
            icon={<DownloadOutlinedIcon />}
            title="내보내기"
            description="글을 파일로 저장할 때 사용할 기본 형식을 정합니다."
          >
            <div className="settings-segmented" role="radiogroup" aria-label="기본 내보내기 형식">
              {['txt', 'md', 'pdf'].map((format) => (
                <label key={format} className={settings.defaultExportFormat === format ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="defaultExportFormat"
                    value={format}
                    checked={settings.defaultExportFormat === format}
                    onChange={(event) => updateSetting('defaultExportFormat', event.target.value)}
                  />
                  {format.toUpperCase()}
                </label>
              ))}
            </div>
          </SettingCard>

          <SettingCard
            icon={<HelpOutlineRoundedIcon />}
            title="도움말"
            description="처음 사용하는 기능에 대한 안내 표시 여부를 설정합니다."
          >
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.showWritingGuide}
                onChange={(event) => updateSetting('showWritingGuide', event.target.checked)}
              />
              <span aria-hidden="true" />
              <div>
                <strong>작성 가이드 표시</strong>
                <small>새 기능 안내와 작성 팁을 화면 안에서 보여줄 때 사용할 설정입니다.</small>
              </div>
            </label>
          </SettingCard>

          {statusMessage && <p className="settings-status" role="status">{statusMessage}</p>}

          <div className="settings-actions">
            <button className="settings-outline-button" type="button" onClick={handleReset}>
              <RestartAltRoundedIcon aria-hidden="true" />
              기본값으로 되돌리기
            </button>
            <button className="settings-save-button" type="submit" disabled={!hasChanged}>
              <SaveOutlinedIcon aria-hidden="true" />
              설정 저장
            </button>
          </div>
        </main>
      </form>
    </div>
  );
}
