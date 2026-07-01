import { useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router-dom';
import CharacterCountDialog from '../components/editor/CharacterCountDialog';
import EditorToolbar from '../components/editor/EditorToolbar';
import useRichTextEditor from '../hooks/useRichTextEditor';
import '../styles/write.css';

/**
 * 페이지는 문서 제목과 저장용 데이터만 관리하고, 본문 편집 기능은 전용 훅과 컴포넌트에 위임합니다.
 */
export default function WritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const editor = useRichTextEditor();

  const handleSave = () => {
    const payload = {
      title: title.trim(),
      contentHtml: editor.contentHtml,
      plainText: editor.plainText,
      characterCountWithSpaces: editor.plainText.length,
      characterCountWithoutSpaces: editor.plainText.replace(/\s/g, '').length,
    };
    if (!payload.title && !payload.plainText.trim()) {
      setStatusMessage('제목이나 본문을 입력해 주세요.');
      return;
    }
    // API 계약이 확정되면 이 payload를 문서 저장 API 모듈에 전달합니다.
    setStatusMessage('작성 내용이 준비되었습니다. 저장 API 연결이 필요합니다.');
  };

  const handleDuplicate = () => {
    setTitle((current) => `${current.trim() || '제목 없음'} 복사본`.slice(0, 50));
    setStatusMessage('현재 내용을 새 초안으로 복사했습니다.');
  };

  const downloadFile = (content, mimeType, extension) => {
    const blob = new Blob([content], { type: mimeType });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${title.trim() || '제목 없음'}.${extension}`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    setStatusMessage(`${extension.toUpperCase()} 파일로 내보냈습니다.`);
  };

  const handleClipboardCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title.trim()}\n\n${editor.plainText}`);
      setStatusMessage('글을 클립보드에 복사했습니다.');
    } catch {
      setStatusMessage('클립보드 복사 권한을 확인해 주세요.');
    }
  };

  const handleTimestamp = () => {
    const timestamp = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
    editor.applyFormat('insertText', timestamp);
  };

  const handleKeyboardShortcut = (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    const formatCommand = { b: 'bold', i: 'italic', u: 'underline' }[key];
    if (formatCommand) {
      event.preventDefault();
      editor.applyFormat(formatCommand);
      return;
    }
    if (key === 's') {
      event.preventDefault();
      handleSave();
      return;
    }
    const alignCommand = event.shiftKey && { l: 'justifyLeft', e: 'justifyCenter', r: 'justifyRight' }[key];
    if (alignCommand) {
      event.preventDefault();
      editor.applyFormat(alignCommand);
    }
  };

  const exportHandlers = {
    text: () => downloadFile(`${title.trim()}\n\n${editor.plainText}`, 'text/plain;charset=utf-8', 'txt'),
    word: () => downloadFile(`<!doctype html><html><head><meta charset="utf-8"></head><body><h1>${title.trim()}</h1>${editor.contentHtml}</body></html>`, 'application/msword;charset=utf-8', 'doc'),
    clipboard: handleClipboardCopy,
    pdf: () => {
      setStatusMessage('인쇄 화면에서 PDF로 저장해 주세요.');
      window.print();
    },
  };

  return (
    <div className="write-page" onKeyDown={handleKeyboardShortcut}>
      <header className="write-page__header">
        <button className="write-icon-button" type="button" onClick={() => navigate(-1)} aria-label="이전 페이지"><ArrowBackRoundedIcon /></button>
        <label className="write-header-title">
          <span className="sr-only">글 제목</span>
          <input type="text" value={title} maxLength={50} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요" />
          <strong>{title.length}/50</strong>
        </label>
      </header>

      <section className="write-editor" aria-label="본문 편집기">
        <EditorToolbar
          activeFormats={editor.activeFormats}
          characterCount={editor.characterCount}
          includeSpaces={editor.includeSpaces}
          onFormat={editor.applyFormat}
          onQuotes={editor.insertQuotes}
          onCountToggle={() => editor.setIncludeSpaces((current) => !current)}
          menuProps={{
            title,
            onSave: handleSave,
            onDuplicate: handleDuplicate,
            onCountOpen: () => setCountDialogOpen(true),
            onTimestamp: handleTimestamp,
            onExport: exportHandlers,
            onHeading: (tagName) => editor.applyFormat('formatBlock', tagName),
          }}
        />
        <div
          ref={editor.editorRef}
          className="write-editor__content"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="여기에 내용을 작성하세요..."
          onInput={editor.syncContent}
          onPaste={editor.handlePaste}
          onKeyUp={editor.syncActiveFormats}
          onMouseUp={editor.syncActiveFormats}
          onFocus={editor.syncActiveFormats}
          aria-label="글 본문"
        />
      </section>

      <div className="write-page__footer"><p className="write-status" role="status">{statusMessage}</p></div>
      {countDialogOpen && <CharacterCountDialog plainText={editor.plainText} wordCount={editor.wordCount} sentenceCount={editor.sentenceCount} onClose={() => setCountDialogOpen(false)} />}
    </div>
  );
}
