import { useMemo, useRef, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import EditorToolbar from '../components/editor/EditorToolbar';
import EditorMenu from '../components/editor/EditorMenu';
import FindReplacePanel from '../components/editor/FindReplacePanel';
import TextSettingsDialog from '../components/editor/TextSettingsDialog';
import WordCountMenu from '../components/editor/WordCountMenu';
import MaterialPicker from '../components/editor/MaterialPicker';
import '../styles/editor.css';

const defaultSettings = { fontSize: 'medium', lineHeight: 'normal', paragraphGap: 'normal' };

export default function EditorPage({ theme, onThemeToggle }) {
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [countMenuOpen, setCountMenuOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [replaceExpanded, setReplaceExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [currentResult, setCurrentResult] = useState(0);
  const [countSpaces, setCountSpaces] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [toast, setToast] = useState('');

  const normalizedText = countSpaces ? text : text.replace(/\s/g, '');
  const resultCount = useMemo(() => query ? text.split(query).length - 1 : 0, [query, text]);

  const syncText = () => setText(editorRef.current?.innerText ?? '');
  const formatText = (command, value) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncText();
  };
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };
  const insertTimestamp = () => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date()));
    syncText();
  };
  const exportText = () => {
    const blob = new Blob([`${title}\n\n${text}`], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || '제목 없음'}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('텍스트 파일로 내보냈습니다.');
  };
  const handleMenuAction = (id) => {
    if (id === 'duplicate') showToast('현재 글의 복사본을 만들었습니다.');
    if (id === 'undo' || id === 'redo') formatText(id);
    if (id === 'find') { setFindOpen(true); setMenuOpen(false); }
    if (id === 'count') { setCountMenuOpen(true); setMenuOpen(false); }
    if (id === 'settings') { setSettingsOpen(true); setMenuOpen(false); }
    if (id === 'timestamp') { insertTimestamp(); setMenuOpen(false); }
    if (id === 'export') { exportText(); setMenuOpen(false); }
  };
  const replaceCurrent = () => {
    if (!query || !resultCount) return;
    const next = text.replace(query, replacement);
    editorRef.current.innerText = next;
    setText(next);
  };
  const replaceAll = () => {
    if (!query || !resultCount) return;
    const next = text.split(query).join(replacement);
    editorRef.current.innerText = next;
    setText(next);
    showToast(`${resultCount}개 항목을 바꿨습니다.`);
  };

  return (
    <div className="editor-page">
      <header className="editor-header">
        <button className="icon-button" type="button" aria-label="뒤로" title="뒤로"><ArrowBackIcon /></button>
        <h1>새 글 쓰기 <span aria-hidden="true">◆</span></h1>
        <div className="editor-header__actions">
          <button className="icon-button mobile-theme-toggle" type="button" onClick={onThemeToggle} aria-label="테마 전환">{theme === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}</button>
          <button className="secondary-button" type="button"><MenuBookOutlinedIcon /> 작성 가이드</button>
          <button className="secondary-button" type="button" onClick={() => setMaterialOpen(true)}><CollectionsBookmarkOutlinedIcon /> 소재</button>
        </div>
      </header>

      <section className="editor-title-field">
        <input value={title} maxLength={50} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요" aria-label="글 제목" />
        <span>{title.length}/50</span>
      </section>

      {findOpen && <FindReplacePanel query={query} replacement={replacement} resultCount={resultCount} currentResult={currentResult} expanded={replaceExpanded} onQuery={(value) => { setQuery(value); setCurrentResult(0); }} onReplacement={setReplacement} onPrevious={() => setCurrentResult((value) => resultCount ? (value - 1 + resultCount) % resultCount : 0)} onNext={() => setCurrentResult((value) => resultCount ? (value + 1) % resultCount : 0)} onToggle={() => setReplaceExpanded((value) => !value)} onReplace={replaceCurrent} onReplaceAll={replaceAll} onClose={() => setFindOpen(false)} />}

      <section className="editor-shell">
        <EditorToolbar onFormat={formatText} charCount={normalizedText.length} countSpaces={countSpaces} onCountMenu={() => { setCountMenuOpen((value) => !value); setMenuOpen(false); }} onMenu={() => { setMenuOpen((value) => !value); setCountMenuOpen(false); }} />
        <div className={`editor-content editor-content--font-${settings.fontSize} editor-content--line-${settings.lineHeight} editor-content--paragraph-${settings.paragraphGap}`} ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncText} />
        {countMenuOpen && <WordCountMenu countSpaces={countSpaces} onChange={setCountSpaces} onClose={() => setCountMenuOpen(false)} />}
        {menuOpen && <EditorMenu title={title} onAction={handleMenuAction} />}
      </section>

      {settingsOpen && <TextSettingsDialog settings={settings} onChange={(key, value) => setSettings((current) => ({ ...current, [key]: value }))} onReset={() => setSettings(defaultSettings)} onClose={() => setSettingsOpen(false)} />}
      {materialOpen && <MaterialPicker onSelect={(item) => { setMaterialOpen(false); showToast(`${item.title} 소재를 선택했습니다.`); }} onClose={() => setMaterialOpen(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
