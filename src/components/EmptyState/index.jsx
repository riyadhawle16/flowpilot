import React from 'react';
import './EmptyState.css';

/**
 * EmptyState — reusable empty/zero-data placeholder.
 *
 * Props:
 *   icon        {string}  emoji icon (default "📭")
 *   title       {string}
 *   description {string}
 *   action      {ReactNode}  optional CTA button/link
 *   size        {'sm'|'md'|'lg'}  default 'md'
 */
function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  action,
  size = 'md',
}) {
  return (
    <div
      className={`empty-state empty-state--${size}`}
      role="status"
      aria-label={title}
    >
      <div className="empty-state__icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__desc">{description}</p>
      )}
      {action && (
        <div className="empty-state__action">{action}</div>
      )}
    </div>
  );
}

export default EmptyState;
