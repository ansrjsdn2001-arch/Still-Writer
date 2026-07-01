import { useState } from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

const shortcuts = [
  ['굵게', 'Ctrl/⌘ + B'], ['기울임', 'Ctrl/⌘ + I'], ['밑줄', 'Ctrl/⌘ + U'],
  ['저장', 'Ctrl/⌘ + S'], ['왼쪽 정렬', 'Ctrl/⌘ + Shift + L'],
  ['가운데 정렬', 'Ctrl/⌘ + Shift + E'], ['오른쪽 정렬', 'Ctrl/⌘ + Shift + R'],
];

/** 햄버거 메뉴의 표시 상태와 하위 메뉴를 독립적으로 관리합니다. */
export default function EditorMenu({ title, onSave, onDuplicate, onFormat, onCountOpen, onTimestamp, onExport, onHeading }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const runAndClose = (callback) => { callback(); setMenuOpen(false); };

  return (
    <div className="write-menu-wrapper">
      <button type="button" onClick={() => setMenuOpen((current) => !current)} aria-label="편집기 메뉴" aria-expanded={menuOpen}>
        <MenuRoundedIcon />
      </button>
      {menuOpen && (
        <div className="write-menu" role="menu">
          <div className="write-menu__document-info">
            <strong>{title.trim() || '제목 없음'}</strong><span>마지막 저장: 저장 전</span><em>저장 API 미연결</em>
          </div>
          <button className="write-menu__save" type="button" role="menuitem" onClick={() => runAndClose(onSave)}><SaveOutlinedIcon />저장</button>
          <button type="button" role="menuitem" onClick={() => runAndClose(onDuplicate)}><ContentCopyOutlinedIcon />복사</button>
          <button className="write-menu__mobile-history" type="button" role="menuitem" onClick={() => onFormat('undo')}><UndoRoundedIcon />되돌리기</button>
          <button className="write-menu__mobile-history" type="button" role="menuitem" onClick={() => onFormat('redo')}><RedoRoundedIcon />다시 실행</button>
          <button type="button" role="menuitem" onClick={() => runAndClose(onCountOpen)}><DescriptionOutlinedIcon />글자 수 보기</button>
          <button type="button" role="menuitem" onClick={() => runAndClose(onTimestamp)}><ScheduleRoundedIcon />타임스탬프</button>
          <button className="write-menu__submenu-trigger" type="button" role="menuitem" onClick={() => setExportOpen((current) => !current)}>
            <FileUploadOutlinedIcon />내보내기<ChevronRightRoundedIcon />
          </button>
          {exportOpen && <div className="write-menu__submenu">
            <button type="button" onClick={() => runAndClose(onExport.text)}><DescriptionOutlinedIcon />TXT 파일</button>
            <button type="button" onClick={() => runAndClose(onExport.pdf)}><PictureAsPdfOutlinedIcon />PDF 파일</button>
            <button type="button" onClick={() => runAndClose(onExport.word)}><ArticleOutlinedIcon />Word 파일</button>
            <button type="button" onClick={() => runAndClose(onExport.clipboard)}><ContentPasteOutlinedIcon />클립보드 복사</button>
          </div>}
          <button className="write-menu__submenu-trigger" type="button" role="menuitem" onClick={() => setHeadingOpen((current) => !current)}>
            <span className="write-menu__heading-icon" aria-hidden="true">H</span>제목 스타일<ChevronRightRoundedIcon />
          </button>
          {headingOpen && <div className="write-menu__heading-options">
            {['p', 'h1', 'h2', 'h3'].map((tag) => <button key={tag} type="button" onClick={() => runAndClose(() => onHeading(tag))}>{tag === 'p' ? '본문' : tag.toUpperCase()}</button>)}
          </div>}
          <button className="write-menu__submenu-trigger" type="button" role="menuitem" onClick={() => setShortcutsOpen((current) => !current)}>
            <KeyboardOutlinedIcon />단축키<ChevronRightRoundedIcon />
          </button>
          {shortcutsOpen && <dl className="write-menu__shortcuts">
            {shortcuts.map(([name, key]) => <div key={name}><dt>{name}</dt><dd>{key}</dd></div>)}
          </dl>}
        </div>
      )}
    </div>
  );
}
