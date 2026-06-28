import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import BrandLogo from '../common/BrandLogo';

const primaryItems = [
  { id: 'home', label: '홈', Icon: HomeOutlinedIcon },
  { id: 'all', label: '모든 글', Icon: ViewListOutlinedIcon },
  { id: 'favorites', label: '즐겨찾기', Icon: StarBorderOutlinedIcon },
  { id: 'trash', label: '휴지통', Icon: DeleteOutlineOutlinedIcon },
];

const folders = [
  { id: 'novel', label: '소설', count: 8 },
  { id: 'diary', label: '일기', count: 12 },
  { id: 'idea', label: '아이디어', count: 15 },
  { id: 'reading', label: '독서 기록', count: 6 },
  { id: 'marketing', label: '마케팅 클럽', count: 4 },
];

export default function AppSidebar({ activeNav, onNavigate, theme, onThemeToggle }) {
  return (
    <aside className="sidebar">
      <BrandLogo />
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
        {folders.map((folder) => (
          <button key={folder.id} className={`folder-link${activeNav === folder.id ? ' is-active' : ''}`} onClick={() => onNavigate(folder.id)}>
            <FolderOutlinedIcon /><span>{folder.label}</span><strong>{folder.count}</strong>
          </button>
        ))}
      </section>

      <nav className="sidebar__utility" aria-label="보조 메뉴">
        <button className={`sidebar-link${activeNav === 'materials' ? ' is-active' : ''}`} onClick={() => onNavigate('materials')}>
          <CollectionsBookmarkOutlinedIcon /><span>소재 보관함</span>
        </button>
        <button className={`sidebar-link${activeNav === 'settings' ? ' is-active' : ''}`} onClick={() => onNavigate('settings')}>
          <SettingsOutlinedIcon /><span>설정</span>
        </button>
        <button className="sidebar-link" onClick={onThemeToggle}>
          {theme === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
        </button>
      </nav>
    </aside>
  );
}
