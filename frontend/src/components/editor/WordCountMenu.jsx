import CheckIcon from '@mui/icons-material/Check';

export default function WordCountMenu({ countSpaces, onChange, onClose }) {
  return (
    <div className="floating-menu word-count-menu" role="menu">
      <button type="button" onClick={() => { onChange(true); onClose(); }}>공백 포함 {countSpaces && <CheckIcon />}</button>
      <button type="button" onClick={() => { onChange(false); onClose(); }}>공백 제외 {!countSpaces && <CheckIcon />}</button>
    </div>
  );
}
