import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { primaryNavigationItems, settingsNavigationItem } from './navigationItems';

export default function AppSidebar({ activeNav, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="주요 메뉴">
        {primaryNavigationItems.map(({ id, label, Icon }) => (
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
        <button className={`sidebar-link${activeNav === settingsNavigationItem.id ? ' is-active' : ''}`} onClick={() => onNavigate(settingsNavigationItem.id)}>
          <settingsNavigationItem.Icon /><span>{settingsNavigationItem.label}</span>
        </button>
      </nav>
    </aside>
  );
}
