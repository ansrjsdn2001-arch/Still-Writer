import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function CharacterCountDialog({ plainText, wordCount, sentenceCount, onClose }) {
  return <div className="write-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="write-count-dialog" role="dialog" aria-modal="true" aria-labelledby="write-count-title">
      <header><h2 id="write-count-title">글자 수 보기</h2><button type="button" onClick={onClose} aria-label="닫기"><CloseRoundedIcon /></button></header>
      <dl>
        <div><dt>공백 포함</dt><dd>{plainText.length.toLocaleString()}자</dd></div>
        <div><dt>공백 제외</dt><dd>{plainText.replace(/\s/g, '').length.toLocaleString()}자</dd></div>
        <div><dt>단어 수</dt><dd>{wordCount.toLocaleString()}개</dd></div>
        <div><dt>문장 수</dt><dd>{sentenceCount.toLocaleString()}개</dd></div>
      </dl>
    </section>
  </div>;
}
