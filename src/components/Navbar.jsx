import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/scholarships', label: 'Scholarships' },
  { to: '/study-abroad', label: 'Study Abroad' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/tips', label: 'Prep Tips' },
  { to: '/smartcv', label: 'SmartCV' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the viewport grows back to desktop size.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="navbar-brand-mark">GS</span>
          <span>GamScholarship</span>
        </NavLink>

        <button
          className="navbar-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={`navbar-toggle-bar ${open ? 'open' : ''}`} />
        </button>

        <nav
          id="primary-navigation"
          className={`navbar-links ${open ? 'is-open' : ''}`}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `navbar-link${isActive ? ' active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/scholarships"
            className="btn btn-accent navbar-cta"
            onClick={() => setOpen(false)}
          >
            Find Scholarships
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
