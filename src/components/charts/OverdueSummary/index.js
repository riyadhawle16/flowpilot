import React from 'react';
import DueDateBadge from '../../DueDateBadge';
import './OverdueSummary.css';

/**
 * OverdueSummary — table-style list of overdue tasks with assignee and due date.
 *
 * Props:
 *   tasks   {object[]}  — all tasks (filtered to overdue inside component)
 *   loading {boolean}
 */
function OverdueSummary({ tasks = [], loading = false }) {
  const overdue = tasks
    .filter((t) => {
      if (!t.dueDate || t.column === 'Done') return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return new Date(t.dueDate) < now;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) // oldest first
    .slice(0, 8); // cap list at 8 items

  const PRIORITY_COLOR = {
    Low:      '#10b981',
    Medium:   '#f59e0b',
    High:     '#ef4444',
    Critical: '#7c3aed',
  };

  return (
    <div
      className="chart-card overdue-summary"
      role="figure"
      aria-label={`Overdue tasks: ${overdue.length}`}
    >
      <div className="chart-card__header">
        <h3 className="chart-card__title">
          <span aria-hidden="true">🔴</span> Overdue Tasks
        </h3>
        <span
          className={`overdue-summary__count ${overdue.length > 0 ? 'overdue-summary__count--alert' : ''}`}
        >
          {overdue.length}
        </span>
      </div>

      {loading ? (
        <div className="chart-card__skeleton" aria-hidden="true" />
      ) : overdue.length === 0 ? (
        <div className="overdue-summary__empty">
          <span aria-hidden="true">✅</span>
          <span>No overdue tasks — great work!</span>
        </div>
      ) : (
        <ul className="overdue-summary__list" aria-label="Overdue task list">
          {overdue.map((task) => (
            <li key={task.id} className="overdue-item">
              {/* Priority dot */}
              <span
                className="overdue-item__dot"
                style={{ background: PRIORITY_COLOR[task.priority] || '#6b7280' }}
                aria-label={`${task.priority} priority`}
              />

              {/* Task info */}
              <div className="overdue-item__info">
                <span className="overdue-item__title" title={task.title}>
                  {task.title}
                </span>
                <div className="overdue-item__meta">
                  {task.assignee && (
                    <span className="overdue-item__assignee">
                      <span className="overdue-item__avatar" aria-hidden="true">
                        {task.assignee.charAt(0).toUpperCase()}
                      </span>
                      {task.assignee}
                    </span>
                  )}
                  <span className="overdue-item__column">{task.column}</span>
                </div>
              </div>

              {/* Due date badge */}
              <DueDateBadge dueDate={task.dueDate} column={task.column} short />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OverdueSummary;
