import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const primaryItems = [
  { id: 'home', label: '홈', Icon: HomeOutlinedIcon },
  { id: 'write', label: '글 작성', Icon: EditOutlinedIcon },
  { id: 'all', label: '모든 글', Icon: ViewListOutlinedIcon },
  { id: 'materials', label: '소재 보관함', Icon: CollectionsBookmarkOutlinedIcon },
  { id: 'favorites', label: '즐겨찾기', Icon: StarBorderOutlinedIcon },
  { id: 'trash', label: '휴지통', Icon: DeleteOutlineOutlinedIcon },
];

export default function AppSidebar({ activeNav, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="주요 메뉴">
        {primaryItems.map(({ id, label, Icon }) => (
          <button key={id} className={`sidebar-link${activeNav === id ? ' is-active' : ''}`} onClick={() => onNavigate(id)}>
            <Icon /><span>{label}</span>
          </button>
        ))}
      </nav>

      <section className="sidebar__folders">
        <div className="sidebar__section-title">
          <span>내 폴더</span>
          <button className="icon-button icon-button--small" type="button" aria-label="새 폴더" title="새 폴더"><AddOutlinedIcon /></button>
        </div>
        <p className="sidebar__empty">생성된 폴더가 없습니다.</p>
      </section>

      <nav className="sidebar__utility" aria-label="보조 메뉴">
        <button className={`sidebar-link${activeNav === 'settings' ? ' is-active' : ''}`} onClick={() => onNavigate('settings')}>
          <SettingsOutlinedIcon /><span>설정</span>
        </button>
      </nav>
    </aside>
  );
}
