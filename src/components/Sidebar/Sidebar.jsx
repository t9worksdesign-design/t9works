import { NavLink } from 'react-router-dom';
import { CATEGORIES } from '../../data/fruits';
import './Sidebar.css';

const COLOR_LABEL = {
  red: 'RED',
  orange: 'ORANGE',
  yellow: 'YELLOW',
  green: 'GREEN',
  purple: 'PURPLE',
};

// Desktop-only fixed vertical nav. Kept as its own component so a
// mobile top-bar / hamburger nav can be swapped in without touching layout.
export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <NavLink to="/" className="sidebar__title">
        BENEATH<br />THE PEEL
      </NavLink>

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
    </nav>
  );
}
