import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

export default function FindReplacePanel({ query, replacement, resultCount, currentResult, expanded, onQuery, onReplacement, onPrevious, onNext, onToggle, onReplace, onReplaceAll, onClose }) {
  return (
    <section className={`find-panel${expanded ? ' is-expanded' : ''}`} aria-label="찾기 및 바꾸기">
      <div className="find-panel__row">
        <label className="find-panel__input"><SearchOutlinedIcon /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="검색할 단어" autoFocus /><span>{resultCount ? `${currentResult + 1} / ${resultCount}` : '0 / 0'}</span></label>
        <button className="icon-button" type="button" onClick={onPrevious} aria-label="이전 결과"><KeyboardArrowUpIcon /></button>
        <button className="icon-button" type="button" onClick={onNext} aria-label="다음 결과"><KeyboardArrowDownIcon /></button>
        <button className="secondary-button" type="button" onClick={onToggle}>바꾸기</button>
        <button className="icon-button" type="button" onClick={onClose} aria-label="닫기"><CloseIcon /></button>
      </div>
      {expanded && (
        <div className="find-panel__replace">
          <input value={replacement} onChange={(event) => onReplacement(event.target.value)} placeholder="변경할 단어 입력" />
          <button className="secondary-button" type="button" onClick={onReplace}>현재 바꾸기</button>
          <button className="primary-button" type="button" onClick={onReplaceAll}>모두 바꾸기</button>
        </div>
      )}
    </section>
  );
}
