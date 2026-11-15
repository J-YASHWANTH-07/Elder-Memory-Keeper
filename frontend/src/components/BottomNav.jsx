import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/schedule', icon: '💊', label: 'Medicines' },
  { to: '/history', icon: '📅', label: 'History' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="nav" aria-label="Main">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav__item${isActive ? ' nav__item--active' : ''}`}
        >
          <span className="nav__icon" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
