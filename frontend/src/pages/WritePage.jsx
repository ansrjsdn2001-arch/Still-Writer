import { useCallback, useEffect, useRef, useState } from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CharacterCountDialog from '../components/editor/CharacterCountDialog';
import EditorToolbar from '../components/editor/EditorToolbar';
import { autoSaveDocument, createDocument, getDocument, updateDocument } from '../api/documents';
import { getApiErrorMessage } from '../api/client';
import useRichTextEditor from '../hooks/useRichTextEditor';
import '../styles/write.css';

const AUTO_SAVE_DELAY_MS = 3000;
const folderOptions = [];

function formatSavedTime(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function createSaveFingerprint({ title, contentHtml, plainText, folderId }) {
  return JSON.stringify({
    title: title.trim(),
    contentHtml,
    plainText,
    folderId: folderId ?? null,
  });
}

export default function WritePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDocumentId = searchParams.get('documentId');
  const [documentId, setDocumentId] = useState(initialDocumentId ? Number(initialDocumentId) : null);
  const [revision, setRevision] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [lastSavedLabel, setLastSavedLabel] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialDocumentId));
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const editor = useRichTextEditor();
  const { setEditorContent } = editor;
  const autoSaveTimerRef = useRef(null);
  const latestAutoSaveSequenceRef = useRef(0);
  const lastSavedFingerprintRef = useRef('');
  const latestDraftFingerprintRef = useRef('');
  const hasLoadedInitialDocumentRef = useRef(!initialDocumentId);

  useEffect(() => () => window.clearTimeout(autoSaveTimerRef.current), []);

  useEffect(() => {
    if (!initialDocumentId) return;

    let ignore = false;

    async function loadDocument() {
      try {
        setIsLoading(true);
        const response = await getDocument(initialDocumentId);
        const document = response.data;
        if (ignore) return;

        setDocumentId(document.id);
        setRevision(document.revision);
        setTitle(document.title ?? '');
        setSelectedFolderId(document.folderId ? String(document.folderId) : '');
        setEditorContent(document.contentHtml ?? '', document.plainText ?? '');
        setLastSavedLabel(formatSavedTime(new Date(document.updatedAt)));
        lastSavedFingerprintRef.current = createSaveFingerprint({
          title: document.title ?? '',
          contentHtml: document.contentHtml ?? '',
          plainText: document.plainText ?? '',
          folderId: document.folderId ?? null,
        });
        hasLoadedInitialDocumentRef.current = true;
        setStatusMessage('글을 불러왔습니다.');
      } catch (error) {
        if (!ignore) {
          setStatusMessage(getApiErrorMessage(error, '글을 불러오지 못했습니다.'));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDocument();

    return () => {
      ignore = true;
    };
  }, [initialDocumentId, setEditorContent]);

  const buildSavePayload = useCallback(() => ({
    title: title.trim(),
    type: 'GENERAL',
    folderId: selectedFolderId ? Number(selectedFolderId) : null,
    contentHtml: editor.contentHtml,
    plainText: editor.plainText,
  }), [editor.contentHtml, editor.plainText, selectedFolderId, title]);

  useEffect(() => {
    latestDraftFingerprintRef.current = createSaveFingerprint(buildSavePayload());
  }, [buildSavePayload]);

  const applySavedDocument = useCallback((savedDocument) => {
    setDocumentId(savedDocument.id);
    setRevision(savedDocument.revision);
    setTitle(savedDocument.title ?? '');
    setLastSavedLabel(formatSavedTime(new Date(savedDocument.updatedAt)));
    lastSavedFingerprintRef.current = createSaveFingerprint({
      title: savedDocument.title ?? '',
      contentHtml: savedDocument.contentHtml ?? '',
      plainText: savedDocument.plainText ?? '',
      folderId: savedDocument.folderId ?? null,
    });
  }, []);

  const handleManualSave = useCallback(async () => {
    const payload = buildSavePayload();

    if (!payload.title && !payload.plainText.trim()) {
      setStatusMessage('제목이나 본문을 입력해 주세요.');
      return;
    }

    try {
      window.clearTimeout(autoSaveTimerRef.current);
      setIsSaving(true);

      const response = documentId
        ? await updateDocument(documentId, {
            expectedRevision: revision,
            title: payload.title,
            folderId: payload.folderId,
            contentHtml: payload.contentHtml,
            plainText: payload.plainText,
          })
        : await createDocument(payload);

      const savedDocument = response.data;
      applySavedDocument(savedDocument);
      setStatusMessage(response.message ?? '저장되었습니다.');

      if (!documentId) {
        setSearchParams({ documentId: String(savedDocument.id) }, { replace: true });
      }
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, '글을 저장하지 못했습니다.'));
    } finally {
      setIsSaving(false);
    }
  }, [applySavedDocument, buildSavePayload, documentId, revision, setSearchParams]);

  const runAutoSave = useCallback(async () => {
    if (isLoading || isSaving || !hasLoadedInitialDocumentRef.current) return;

    const payload = buildSavePayload();
    const currentFingerprint = createSaveFingerprint(payload);

    if (!payload.title && !payload.plainText.trim()) return;
    if (currentFingerprint === lastSavedFingerprintRef.current) return;

    const autoSaveSequence = latestAutoSaveSequenceRef.current + 1;
    latestAutoSaveSequenceRef.current = autoSaveSequence;

    try {
      setIsAutoSaving(true);

      const response = await autoSaveDocument({
        documentId,
        expectedRevision: documentId ? revision : null,
        saveRequestId: crypto.randomUUID(),
        title: payload.title,
        type: payload.type,
        folderId: payload.folderId,
        contentHtml: payload.contentHtml,
        plainText: payload.plainText,
      });

      if (autoSaveSequence !== latestAutoSaveSequenceRef.current) return;

      const savedDocument = response.data.document;
      const responseFingerprint = createSaveFingerprint({
        title: savedDocument.title ?? '',
        contentHtml: savedDocument.contentHtml ?? '',
        plainText: savedDocument.plainText ?? '',
        folderId: savedDocument.folderId ?? null,
      });

      if (latestDraftFingerprintRef.current === currentFingerprint) {
        applySavedDocument(savedDocument);
      } else {
        setDocumentId(savedDocument.id);
        setRevision(savedDocument.revision);
        setLastSavedLabel(formatSavedTime(new Date(savedDocument.updatedAt)));
        lastSavedFingerprintRef.current = responseFingerprint;
      }
      setStatusMessage(response.data.duplicateRequest ? '이미 처리된 자동 저장입니다.' : '자동 저장되었습니다.');

      if (!documentId) {
        setSearchParams({ documentId: String(savedDocument.id) }, { replace: true });
      }
    } catch (error) {
      if (autoSaveSequence === latestAutoSaveSequenceRef.current) {
        setStatusMessage(getApiErrorMessage(error, '자동 저장에 실패했습니다.'));
      }
    } finally {
      if (autoSaveSequence === latestAutoSaveSequenceRef.current) {
        setIsAutoSaving(false);
      }
    }
  }, [applySavedDocument, buildSavePayload, documentId, isLoading, isSaving, revision, setSearchParams]);

  useEffect(() => {
    window.clearTimeout(autoSaveTimerRef.current);

    if (isLoading || isSaving || !hasLoadedInitialDocumentRef.current) return;

    autoSaveTimerRef.current = window.setTimeout(() => {
      runAutoSave();
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(autoSaveTimerRef.current);
  }, [editor.contentHtml, editor.plainText, isLoading, isSaving, runAutoSave, title]);

  const handleDuplicate = () => {
    const nextTitle = `${title.trim() || '제목 없음'} 복사본`.slice(0, 50);
    setDocumentId(null);
    setRevision(null);
    setTitle(nextTitle);
    setSelectedFolderId('');
    setSearchParams({}, { replace: true });
    lastSavedFingerprintRef.current = '';
    setStatusMessage('현재 내용을 새 글 초안으로 복사했습니다. 자동 저장되면 새 글로 생성됩니다.');
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
      handleManualSave();
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
    word: () => downloadFile(
      `<!doctype html><html><head><meta charset="utf-8"></head><body><h1>${title.trim()}</h1>${editor.contentHtml}</body></html>`,
      'application/msword;charset=utf-8',
      'doc',
    ),
    clipboard: handleClipboardCopy,
    pdf: () => {
      setStatusMessage('인쇄 화면에서 PDF로 저장해 주세요.');
      window.print();
    },
  };

  return (
    <div className="write-page" onKeyDown={handleKeyboardShortcut}>
      <header className="write-page__header">
        <button className="write-icon-button" type="button" onClick={() => navigate(-1)} aria-label="이전 페이지">
          <ArrowBackRoundedIcon />
        </button>
        <label className="write-header-title">
          <span className="sr-only">글 제목</span>
          <input
            type="text"
            value={title}
            maxLength={50}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            disabled={isLoading}
          />
          <strong>{title.length}/50</strong>
        </label>
      </header>

      <section className="write-folder-panel" aria-label="글 폴더 선택">
        <label className="write-folder-select">
          <FolderOutlinedIcon aria-hidden="true" />
          <span>저장 폴더</span>
          <select
            value={selectedFolderId}
            onChange={(event) => setSelectedFolderId(event.target.value)}
            disabled={isLoading || folderOptions.length === 0}
          >
            <option value="">미분류</option>
            {folderOptions.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </label>
        <p>
          폴더 목록 API 연결 전이라 현재는 미분류로 저장됩니다. 백엔드가 folderId를 받으면 선택한 폴더에 글을 저장할 수 있습니다.
        </p>
        <button type="button" onClick={() => navigate('/folders')}>
          폴더 관리
        </button>
      </section>

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
            lastSavedLabel,
            onSave: handleManualSave,
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
          contentEditable={!isLoading}
          suppressContentEditableWarning
          data-placeholder={isLoading ? '글을 불러오는 중입니다.' : '여기에 내용을 작성하세요...'}
          onInput={editor.syncContent}
          onPaste={editor.handlePaste}
          onKeyUp={editor.syncActiveFormats}
          onMouseUp={editor.syncActiveFormats}
          onFocus={editor.syncActiveFormats}
          aria-label="글 본문"
        />
      </section>

      <div className="write-page__footer">
        <p className="write-status" role="status">
          {isSaving ? '저장 중입니다...' : isAutoSaving ? '자동 저장 중입니다...' : statusMessage}
        </p>
      </div>

      {countDialogOpen && (
        <CharacterCountDialog
          plainText={editor.plainText}
          wordCount={editor.wordCount}
          sentenceCount={editor.sentenceCount}
          onClose={() => setCountDialogOpen(false)}
        />
      )}
    </div>
  );
}
