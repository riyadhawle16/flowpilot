import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard',   exact: true },
  { to: '/analytics',   icon: '📊', label: 'Analytics' },
  { to: '/ai-insights', icon: '🤖', label: 'AI Insights' },
];

const WORKSPACE_ITEMS = [
  { id: 'demo-project-alpha', name: 'Project Alpha', icon: '🚀', color: '#6366f1' },
  { id: 'demo-marketing',     name: 'Marketing',     icon: '📣', color: '#f59e0b' },
];

/**
 * Sidebar — responsive collapsible navigation sidebar.
 * On mobile: slides in as overlay from the left.
 * On tablet/desktop: persistent collapsed or expanded rail.
 */
function Sidebar() {
  const { isOpen, isMobile, close } = useSidebar();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) close();
  }, [location.pathname, isMobile, close]);

  // Close on backdrop click (mobile)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--collapsed'} ${
          isMobile ? 'sidebar--mobile' : ''
        }`}
        aria-label="Application navigation"
        aria-hidden={isMobile && !isOpen ? 'true' : undefined}
      >
        {/* Brand */}
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon" aria-hidden="true">✈️</span>
          {isOpen && (
            <span className="sidebar__brand-name">FlowPilot AI</span>
          )}
        </div>

        {/* Main nav */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          <ul className="sidebar__nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  exact={item.exact}
                  to={item.to}
                  className="sidebar__nav-item"
                  activeClassName="sidebar__nav-item--active"
                  title={!isOpen ? item.label : undefined}
                  aria-label={item.label}
                >
                  <span className="sidebar__nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {isOpen && (
                    <span className="sidebar__nav-label">{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Workspaces section */}
        {isOpen && (
          <div className="sidebar__section">
            <span className="sidebar__section-title">Workspaces</span>
            <ul className="sidebar__nav-list">
              {WORKSPACE_ITEMS.map((ws) => (
                <li key={ws.id}>
                  <NavLink
                    to={`/workspace/${ws.id}/board`}
                    className="sidebar__nav-item sidebar__nav-item--ws"
                    activeClassName="sidebar__nav-item--active"
                    aria-label={ws.name}
                  >
                    <span
                      className="sidebar__ws-icon"
                      style={{ background: ws.color }}
                      aria-hidden="true"
                    >
                      {ws.icon}
                    </span>
                    <span className="sidebar__nav-label">{ws.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom actions */}
        <div className="sidebar__bottom">
          {/* Dark mode toggle */}
          <button
            className="sidebar__action-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
            {isOpen && (
              <span className="sidebar__nav-label">
                {isDark ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>

          {/* User + logout */}
          {user && (
            <div className="sidebar__user">
              <div
                className="sidebar__user-avatar"
                aria-label={`User: ${user.name}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              {isOpen && (
                <>
                  <div className="sidebar__user-info">
                    <span className="sidebar__user-name">{user.name}</span>
                    <span className="sidebar__user-email">{user.email}</span>
                  </div>
                  <button
                    className="sidebar__logout-btn"
                    onClick={logout}
                    aria-label="Logout"
                    title="Logout"
                    type="button"
                  >
                    ↩
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
