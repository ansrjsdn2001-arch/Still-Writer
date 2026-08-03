import { useCallback, useMemo, useRef, useState } from 'react';

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
    if (!normalizedText) return 0;
    return normalizedText
      .split(/[.!?。！？]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean).length;
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

  const setEditorContent = useCallback((html = '', text = '') => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    setContentHtml(html);
    setPlainText(text);
  }, []);

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
    if (wasCollapsed) {
      caretRange.setStartBefore(closingNode);
    } else {
      caretRange.setStartAfter(closingNode);
    }
    caretRange.collapse(true);

    selection?.removeAllRanges();
    selection?.addRange(caretRange);
    syncContent();
  }, [syncContent]);

  const handlePaste = useCallback((event) => {
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
    setEditorContent,
    syncContent,
    syncActiveFormats,
    applyFormat,
    insertQuotes,
    handlePaste,
  };
}
