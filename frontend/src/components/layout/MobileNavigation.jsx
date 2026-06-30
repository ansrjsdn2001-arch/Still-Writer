import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { useNavigate } from 'react-router-dom';

const baseItems = [
  { id: 'home', label: '홈', Icon: HomeOutlinedIcon },
  { id: 'all', label: '글', Icon: ArticleOutlinedIcon },
  { id: 'materials', label: '소재', Icon: CollectionsBookmarkOutlinedIcon },
];

export default function MobileNavigation({ activeNav, onNavigate, currentUser }) {
  const navigate = useNavigate();
  const items = [
    ...baseItems,
    currentUser
      ? { id: 'profile', label: '프로필', Icon: ManageAccountsOutlinedIcon, path: '/profile' }
      : { id: 'settings', label: '설정', Icon: SettingsOutlinedIcon },
  ];

  const handleNavigate = (item) => {
    onNavigate(item.id);
    if (item.path) navigate(item.path);
  };

  return (
    <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
      {items.map(({ id, label, Icon, primary, path }) => (
        <button key={id} className={`mobile-nav__item${activeNav === id ? ' is-active' : ''}${primary ? ' is-primary' : ''}`} onClick={() => handleNavigate({ id, path })}>
          <span className="mobile-nav__icon"><Icon /></span><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
