import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

const formatActions = [
  { command: 'bold', label: '굵게', Icon: FormatBoldIcon },
  { command: 'italic', label: '기울임', Icon: FormatItalicIcon },
  { command: 'underline', label: '밑줄', Icon: FormatUnderlinedIcon },
  { command: 'justifyLeft', label: '왼쪽 정렬', Icon: FormatAlignLeftIcon },
  { command: 'justifyCenter', label: '가운데 정렬', Icon: FormatAlignCenterIcon },
  { command: 'insertUnorderedList', label: '글머리 기호', Icon: FormatListBulletedIcon },
  { command: 'insertOrderedList', label: '번호 목록', Icon: FormatListNumberedIcon },
  { command: 'formatBlock', value: 'blockquote', label: '인용문', Icon: FormatQuoteIcon },
];

export default function EditorToolbar({ onFormat, charCount, countSpaces, onCountMenu, onMenu }) {
  return (
    <div className="editor-toolbar" role="toolbar" aria-label="텍스트 서식">
      <select className="editor-toolbar__heading" aria-label="제목 스타일" defaultValue="p" onChange={(event) => onFormat('formatBlock', event.target.value)}>
        <option value="p">본문</option><option value="h1">제목 1</option><option value="h2">제목 2</option><option value="h3">제목 3</option>
      </select>
      <span className="editor-toolbar__divider" />
      {formatActions.map(({ command, value, label, Icon }) => (
        <button key={command} className="icon-button" type="button" onClick={() => onFormat(command, value)} aria-label={label} title={label}><Icon /></button>
      ))}
      <span className="editor-toolbar__spacer" />
      <button className="count-button" type="button" onClick={onCountMenu}>{charCount.toLocaleString()}자 <span>({countSpaces ? '공백 포함' : '공백 제외'})</span></button>
      <button className="icon-button" type="button" onClick={onMenu} aria-label="에디터 메뉴" title="에디터 메뉴"><MenuOutlinedIcon /></button>
    </div>
  );
}
