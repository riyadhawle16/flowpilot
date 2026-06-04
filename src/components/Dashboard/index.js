import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const demoWorkspaces = [
    { id: 'demo-project-alpha', name: 'Project Alpha', icon: '🚀', color: '#6366f1', memberCount: 3 },
    { id: 'demo-marketing', name: 'Marketing', icon: '📣', color: '#f59e0b', memberCount: 5 },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Welcome, {user?.name}! 👋</h1>
          <p className="dashboard__subtitle">Your workspaces</p>
        </div>
        <button className="dashboard__logout-btn" onClick={logout} type="button">
          Logout
        </button>
      </div>

      {/* Quick links */}
      <div className="dashboard__quick-links">
        <Link to="/analytics" className="dashboard__quick-link">
          📊 Global Analytics
        </Link>
        <Link to="/ai-insights" className="dashboard__quick-link dashboard__quick-link--ai">
          🤖 AI Insights
        </Link>
      </div>

      {/* Workspace grid */}
      <div className="dashboard__grid">
        {demoWorkspaces.map((ws) => (
          <div key={ws.id} className="ws-card-wrap">
            <Link
              to={`/workspace/${ws.id}/board`}
              className="ws-card"
              aria-label={`Open ${ws.name} kanban board`}
            >
              <div
                className="ws-card__icon"
                style={{ background: ws.color }}
                aria-hidden="true"
              >
                {ws.icon}
              </div>
              <div className="ws-card__body">
                <h2 className="ws-card__name">{ws.name}</h2>
                <span className="ws-card__members">
                  👥 {ws.memberCount} member{ws.memberCount !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="ws-card__arrow" aria-hidden="true">→</span>
            </Link>
            <Link
              to={`/workspace/${ws.id}/analytics`}
              className="ws-card__analytics-btn"
              aria-label={`View ${ws.name} analytics`}
            >
              📊 Analytics
            </Link>
          </div>
        ))}

        {/* Create workspace placeholder */}
        <div className="ws-card ws-card--new" role="button" tabIndex={0}
          aria-label="Create new workspace (Phase 2 feature)">
          <div className="ws-card__icon ws-card__icon--new" aria-hidden="true">＋</div>
          <div className="ws-card__body">
            <h2 className="ws-card__name">New Workspace</h2>
            <span className="ws-card__members">Phase 2 feature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
