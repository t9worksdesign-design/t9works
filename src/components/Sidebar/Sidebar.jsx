import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../../data/fruits';
import './Sidebar.css';

const COLOR_LABEL = {
  red: 'RED',
  orange: 'ORANGE',
  yellow: 'YELLOW',
  green: 'GREEN',
  purple: 'PURPLE',
};

// Fixed vertical nav on desktop. Below the mobile breakpoint (see
// Sidebar.css) it collapses into a top bar with a hamburger toggle that
// reveals the same links as a dropdown, so there's only one nav to keep
// in sync between screen sizes.
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Main navigation">
      <div className="sidebar__bar">
        <NavLink to="/" className="sidebar__title">
          Beneath,
          <br />
          the Peel.
        </NavLink>

        <button
          type="button"
          className="sidebar__toggle"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="sidebar__links">
        <ul className="sidebar__group">
          <li>
            <NavLink to="/" end className="sidebar__link">
              HOME
            </NavLink>
          </li>
          <li>
            <NavLink to="/all" className="sidebar__link">
              ALL
            </NavLink>
          </li>
          <li>
            <NavLink to="/video" className="sidebar__link">
              VIDEO
            </NavLink>
          </li>
        </ul>

        <ul className="sidebar__group">
          {CATEGORIES.map((color) => (
            <li key={color}>
              <NavLink to={`/category/${color}`} className="sidebar__link">
                {COLOR_LABEL[color]}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="sidebar__account">@t9_works</p>
      </div>
    </nav>
  );
}
