import React from 'react';
import './DueDateBadge.css';

/**
 * Returns the due-date status for a task.
 * 'overdue' | 'today' | 'soon' (within 3 days) | 'future' | null (no date)
 */
export function getDueDateStatus(iso, column) {
  if (!iso) return null;
  if (column === 'Done') return 'done';

  const now  = new Date();
  const due  = new Date(iso);

  // Normalise both to midnight for day comparisons
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffMs  = dueDay - nowDay;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0)  return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3)  return 'soon';
  return 'future';
}

const STATUS_META = {
  overdue: { label: 'Overdue', cls: 'due-badge--overdue', icon: '🔴' },
  today:   { label: 'Due today', cls: 'due-badge--today',   icon: '🟡' },
  soon:    { label: 'Due soon',  cls: 'due-badge--soon',    icon: '🟠' },
  future:  { label: null,        cls: 'due-badge--future',  icon: '📅' },
  done:    { label: null,        cls: 'due-badge--done',    icon: '📅' },
};

/**
 * DueDateBadge — shows a coloured badge for due-date status.
 *
 * Props:
 *   dueDate  {string}  — ISO date string  (e.g. "2025-06-15")
 *   column   {string}  — current column (to suppress overdue on Done tasks)
 *   short    {boolean} — compact form for use inside TaskCard
 */
function DueDateBadge({ dueDate, column, short = false }) {
  if (!dueDate) return null;

  const status = getDueDateStatus(dueDate, column);
  if (!status) return null;

  const meta = STATUS_META[status];

  const formatted = new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });

  const label = meta.label || formatted;

  return (
    <span
      className={`due-badge ${meta.cls} ${short ? 'due-badge--short' : ''}`}
      title={`Due: ${formatted}${meta.label ? ` (${meta.label})` : ''}`}
      aria-label={`${meta.label || 'Due'}: ${formatted}`}
    >
      <span className="due-badge__icon" aria-hidden="true">{meta.icon}</span>
      {!short && <span className="due-badge__text">{label !== meta.label ? formatted : label}</span>}
      {short && status !== 'future' && status !== 'done' && (
        <span className="due-badge__text">{label}</span>
      )}
      {short && (status === 'future' || status === 'done') && (
        <span className="due-badge__text">{formatted}</span>
      )}
    </span>
  );
}

export default DueDateBadge;
