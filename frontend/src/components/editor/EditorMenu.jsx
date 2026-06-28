import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const actions = [
  { id: 'duplicate', label: '복사', Icon: ContentCopyOutlinedIcon },
  { id: 'undo', label: '되돌리기', Icon: UndoOutlinedIcon },
  { id: 'redo', label: '다시 실행', Icon: RedoOutlinedIcon },
  { id: 'find', label: '찾기 및 바꾸기', Icon: SearchOutlinedIcon },
  { id: 'count', label: '글자 수 보기', Icon: BarChartOutlinedIcon, next: true },
  { id: 'settings', label: '본문 설정', Icon: TuneOutlinedIcon, next: true },
  { id: 'timestamp', label: '타임스탬프', Icon: AccessTimeOutlinedIcon },
  { id: 'export', label: '내보내기', Icon: FileUploadOutlinedIcon, next: true },
];

export default function EditorMenu({ title, onAction }) {
  return (
    <aside className="editor-menu" aria-label="에디터 기능 메뉴">
      <div className="editor-menu__status">
        <strong>{title || '제목 없음'}</strong><span>마지막 저장: 방금 전</span><em><CheckCircleOutlineIcon /> 자동 저장 완료</em>
      </div>
      <div className="editor-menu__actions">
        {actions.map(({ id, label, Icon, next }) => (
          <button key={id} type="button" onClick={() => onAction(id)}><Icon /><span>{label}</span>{next && <ChevronRightIcon className="editor-menu__next" />}</button>
        ))}
      </div>
    </aside>
  );
}
