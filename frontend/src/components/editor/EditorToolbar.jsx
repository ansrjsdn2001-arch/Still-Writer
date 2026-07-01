import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import EditorMenu from './EditorMenu';

const formatActions = [
  ['bold', '굵게', FormatBoldRoundedIcon], ['italic', '기울임', FormatItalicRoundedIcon],
  ['underline', '밑줄', FormatUnderlinedRoundedIcon],
  ['insertUnorderedList', '글머리 기호', FormatListBulletedRoundedIcon],
  ['insertOrderedList', '번호 목록', FormatListNumberedRoundedIcon],
];
const alignActions = [
  ['justifyLeft', '왼쪽 정렬', FormatAlignLeftRoundedIcon],
  ['justifyCenter', '가운데 정렬', FormatAlignCenterRoundedIcon],
  ['justifyRight', '오른쪽 정렬', FormatAlignRightRoundedIcon],
];

export default function EditorToolbar({ activeFormats, characterCount, includeSpaces, onFormat, onQuotes, onCountToggle, menuProps }) {
  return <div className="write-toolbar" role="toolbar" aria-label="본문 서식">
    <select defaultValue="p" onChange={(event) => onFormat('formatBlock', event.target.value)} aria-label="문단 형식">
      <option value="p">본문</option><option value="h1">제목 1</option><option value="h2">제목 2</option><option value="h3">제목 3</option>
    </select>
    {formatActions.map(([command, label, Icon]) => <button key={command} className={activeFormats[command] ? 'is-active' : ''} type="button" onClick={() => onFormat(command)} aria-label={label} aria-pressed={Boolean(activeFormats[command])} title={label}><Icon /></button>)}
    <button type="button" onClick={() => onQuotes('“', '”')} aria-label="큰따옴표 삽입" title="큰따옴표 삽입"><span className="write-quote-icon" aria-hidden="true">“ ”</span></button>
    <button type="button" onClick={() => onQuotes('‘', '’')} aria-label="작은따옴표 삽입" title="작은따옴표 삽입"><span className="write-quote-icon" aria-hidden="true">‘ ’</span></button>
    <button className="write-history-button" type="button" onClick={() => onFormat('undo')} aria-label="되돌리기" title="되돌리기"><UndoRoundedIcon /></button>
    <button className="write-history-button" type="button" onClick={() => onFormat('redo')} aria-label="다시 실행" title="다시 실행"><RedoRoundedIcon /></button>
    <span className="write-toolbar__divider" aria-hidden="true" />
    {alignActions.map(([command, label, Icon]) => <button key={command} className={activeFormats[command] ? 'is-active' : ''} type="button" onClick={() => onFormat(command)} aria-label={label} aria-pressed={Boolean(activeFormats[command])} title={label}><Icon /></button>)}
    <span className="write-toolbar__spacer" />
    <button className="write-count-button" type="button" onClick={onCountToggle} aria-label={`글자 수 ${characterCount}자, ${includeSpaces ? '공백 포함' : '공백 제외'}`}>{characterCount.toLocaleString()}자</button>
    <EditorMenu {...menuProps} onFormat={onFormat} />
  </div>;
}
