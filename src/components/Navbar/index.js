import React, { useState, useEffect, memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth }    from '../../context/AuthContext';
import { useTheme }   from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import './Navbar.css';

/**
 * Navbar — top application bar.
 *
 * When the user is authenticated the sidebar handles navigation,
 * so Navbar shows: hamburger | brand | theme toggle | user avatar.
 * When unauthenticated: brand + Login / Sign Up links.
 */
function Navbar() {
  const { user }            = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toggle: toggleSidebar } = useSidebar();
  const location = useLocation();

  // Mobile unauthenticated menu
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <header className="navbar" role="banner">
      <nav className="navbar__inner" aria-label="Top navigation">

        {/* ── Left: Hamburger (auth) or brand logo ── */}
        {user ? (
          <button
            className="navbar__hamburger-btn"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            type="button"
          >
            <span className="navbar__ham-lines" aria-hidden="true">
              <span /><span /><span />
            </span>
          </button>
        ) : null}

        <NavLink
          to="/"
          className="navbar__brand"
          aria-label="FlowPilot AI home"
        >
          <span className="navbar__logo" aria-hidden="true">✈️</span>
          <span className="navbar__brand-name">FlowPilot AI</span>
        </NavLink>

        {/* ── Spacer ── */}
        <div className="navbar__spacer" aria-hidden="true" />

        {/* ── Right: auth-dependent actions ── */}
        <div className={`navbar__actions ${menuOpen ? 'navbar__actions--open' : ''}`}>

          {user ? (
            /* ── Authenticated: compact actions ── */
            <>
              {/* Dark mode toggle */}
              <button
                className="navbar__icon-btn"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
                type="button"
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* User avatar chip */}
              <div
                className="navbar__user-chip"
                aria-label={`Signed in as ${user.name}`}
                title={user.name}
              >
                <span className="navbar__user-avatar" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="navbar__user-name">{user.name}</span>
              </div>
            </>
          ) : (
            /* ── Unauthenticated: links ── */
            <>
              <NavLink
                to="/login"
                className="navbar__link"
                activeClassName="navbar__link--active"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="navbar__link navbar__link--cta"
                activeClassName="navbar__link--active"
              >
                Sign Up
              </NavLink>

              {/* Dark mode toggle (unauthenticated) */}
              <button
                className="navbar__icon-btn"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                type="button"
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Mobile hamburger for unauthenticated nav */}
              <button
                className="navbar__hamburger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                type="button"
              >
                <span
                  className={`navbar__ham-icon ${menuOpen ? 'navbar__ham-icon--open' : ''}`}
                >
                  <span /><span /><span />
                </span>
              </button>
            </>
          )}
        </div>

      </nav>

      {/* Mobile dropdown for unauthenticated links */}
      {!user && menuOpen && (
        <div className="navbar__mobile-menu" role="menu">
          <NavLink
            to="/login"
            className="navbar__mobile-link"
            activeClassName="navbar__mobile-link--active"
            role="menuitem"
          >
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className="navbar__mobile-link"
            activeClassName="navbar__mobile-link--active"
            role="menuitem"
          >
            Sign Up
          </NavLink>
        </div>
      )}
    </header>
  );
}

export default memo(Navbar);
