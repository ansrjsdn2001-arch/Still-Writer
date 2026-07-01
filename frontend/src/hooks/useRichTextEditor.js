import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * contentEditable의 본문 상태와 서식 명령을 한곳에서 관리합니다.
 * 화면 컴포넌트는 브라우저 편집 명령의 세부 구현을 알 필요가 없습니다.
 */
export default function useRichTextEditor() {
  const editorRef = useRef(null);
  const [contentHtml, setContentHtml] = useState('');
  const [plainText, setPlainText] = useState('');
  const [includeSpaces, setIncludeSpaces] = useState(true);
  const [activeFormats, setActiveFormats] = useState({});

  const characterCount = useMemo(
    () => (includeSpaces ? plainText.length : plainText.replace(/\s/g, '').length),
    [includeSpaces, plainText],
  );
  const wordCount = useMemo(() => {
    const normalizedText = plainText.trim();
    return normalizedText ? normalizedText.split(/\s+/).length : 0;
  }, [plainText]);
  const sentenceCount = useMemo(() => {
    const normalizedText = plainText.trim();
    return normalizedText
      ? normalizedText.split(/[.!?。！？]+/).filter((sentence) => sentence.trim()).length
      : 0;
  }, [plainText]);

  const syncContent = useCallback(() => {
    const editor = editorRef.current;
    setContentHtml(editor?.innerHTML ?? '');
    setPlainText(editor?.innerText ?? '');
  }, []);

  const syncActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  }, []);

  const applyFormat = useCallback((command, value) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
    syncActiveFormats();
  }, [syncActiveFormats, syncContent]);

  const insertQuotes = useCallback((openingQuote, closingQuote) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    let range = selection?.rangeCount ? selection.getRangeAt(0) : null;

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const wasCollapsed = range.collapsed;
    const selectedContent = range.extractContents();
    const fragment = document.createDocumentFragment();
    const openingNode = document.createTextNode(openingQuote);
    const closingNode = document.createTextNode(closingQuote);
    fragment.append(openingNode, selectedContent, closingNode);
    range.insertNode(fragment);

    const caretRange = document.createRange();
    if (wasCollapsed) caretRange.setStartBefore(closingNode);
    else caretRange.setStartAfter(closingNode);
    caretRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(caretRange);
    syncContent();
  }, [syncContent]);

  const handlePaste = useCallback((event) => {
    // 외부 HTML과 스크립트 유입을 막기 위해 붙여넣기는 일반 텍스트만 허용합니다.
    event.preventDefault();
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    syncContent();
  }, [syncContent]);

  return {
    editorRef,
    contentHtml,
    plainText,
    includeSpaces,
    activeFormats,
    characterCount,
    wordCount,
    sentenceCount,
    setIncludeSpaces,
    syncContent,
    syncActiveFormats,
    applyFormat,
    insertQuotes,
    handlePaste,
  };
}
