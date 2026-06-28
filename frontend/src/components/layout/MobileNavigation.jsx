import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const items = [
  { id: 'home', label: '홈', Icon: HomeOutlinedIcon },
  { id: 'all', label: '글', Icon: ArticleOutlinedIcon },
  { id: 'write', label: '글쓰기', Icon: EditOutlinedIcon, primary: true },
  { id: 'materials', label: '소재', Icon: CollectionsBookmarkOutlinedIcon },
  { id: 'settings', label: '설정', Icon: SettingsOutlinedIcon },
];

export default function MobileNavigation({ activeNav, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
      {items.map(({ id, label, Icon, primary }) => (
        <button key={id} className={`mobile-nav__item${activeNav === id ? ' is-active' : ''}${primary ? ' is-primary' : ''}`} onClick={() => onNavigate(id)}>
          <span className="mobile-nav__icon"><Icon /></span><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
