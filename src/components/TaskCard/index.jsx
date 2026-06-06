import React, { useState, useRef, useCallback } from 'react';
import DueDateBadge from '../DueDateBadge';
import { LABEL_COLORS } from '../../context/KanbanContext';
import './TaskCard.css';

const PRIORITY_META = {
  Low:      { color: '#10b981', bg: '#ecfdf5', label: 'Low' },
  Medium:   { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
  High:     { color: '#ef4444', bg: '#fee2e2', label: 'High' },
  Critical: { color: '#7c3aed', bg: '#f5f3ff', label: 'Critical' },
};

function getLabelColor(colorId) {
  return LABEL_COLORS.find((c) => c.id === colorId) || LABEL_COLORS[4];
}

function isOverdue(iso, column) {
  if (!iso || column === 'Done') return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(iso) < now;
}

/**
 * TaskCard — Phase 4 enhanced with labels, overdue ring, attachment count,
 * and DueDateBadge.
 *
 * Props:
 *   task        {object}
 *   isDragging  {boolean}
 *   onDragStart {(taskId|null) => void}
 *   onEdit      {(task) => void}
 *   onDelete    {(task) => void}
 */
function TaskCard({ task, isDragging, onDragStart, onEdit, onDelete }) {
  const priority = PRIORITY_META[task.priority] || PRIORITY_META.Medium;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const overdue = isOverdue(task.dueDate, task.column);
  const labels  = task.labels || [];
  const attachments = task.attachments || [];

  // ── Outside click closes menu ──────────────────────────────────────────────

  const handleDocClick = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false);
    }
  }, []);

  React.useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleDocClick);
      document.addEventListener('touchstart', handleDocClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('touchstart', handleDocClick);
    };
  }, [menuOpen, handleDocClick]);

  // ── HTML5 drag ─────────────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
      onDragStart(task.id);
    },
    [task.id, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    onDragStart(null);
  }, [onDragStart]);

  // ── Touch drag ─────────────────────────────────────────────────────────────

  const touchClone = useRef(null);

  const handleTouchStart = useCallback(
    (e) => {
      onDragStart(task.id);
      const touch = e.touches[0];
      const clone = e.currentTarget.cloneNode(true);
      clone.style.cssText = `
        position:fixed; pointer-events:none; opacity:0.75; z-index:9999;
        width:${e.currentTarget.offsetWidth}px;
        left:${touch.clientX - e.currentTarget.offsetWidth / 2}px;
        top:${touch.clientY - 30}px;
        box-shadow:0 8px 24px rgba(0,0,0,0.18);
        border-radius:10px;
      `;
      document.body.appendChild(clone);
      touchClone.current = clone;
    },
    [task.id, onDragStart]
  );

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touchClone.current) {
      touchClone.current.style.left =
        `${touch.clientX - touchClone.current.offsetWidth / 2}px`;
      touchClone.current.style.top = `${touch.clientY - 30}px`;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchClone.current) {
        document.body.removeChild(touchClone.current);
        touchClone.current = null;
      }
      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const col = el.closest('[data-column]');
        if (col && window.__kanbanTouchDrop) {
          window.__kanbanTouchDrop(task.id, col.getAttribute('data-column'));
        }
      }
      onDragStart(null);
    },
    [task.id, onDragStart]
  );

  return (
    <article
      className={[
        'task-card',
        isDragging  ? 'task-card--dragging' : '',
        overdue     ? 'task-card--overdue'  : '',
      ].filter(Boolean).join(' ')}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label={`Task: ${task.title}${overdue ? ' (overdue)' : ''}`}
      data-task-id={task.id}
    >
      {/* Priority stripe */}
      <div
        className="task-card__priority-stripe"
        style={{ background: priority.color }}
        aria-hidden="true"
      />

      {/* Card body */}
      <div className="task-card__body">

        {/* Labels row */}
        {labels.length > 0 && (
          <div className="task-card__labels" aria-label="Labels">
            {labels.slice(0, 4).map((label) => {
              const col = getLabelColor(label.colorId);
              return (
                <span
                  key={label.id}
                  className="task-card__label"
                  style={{ background: col.bg, color: col.hex, borderColor: col.hex }}
                  title={label.text}
                >
                  {label.text}
                </span>
              );
            })}
            {labels.length > 4 && (
              <span className="task-card__label task-card__label--more">
                +{labels.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Title row */}
        <div className="task-card__title-row">
          <h3 className="task-card__title">{task.title}</h3>

          {/* Actions menu */}
          <div className="task-card__menu-wrap" ref={menuRef}>
            <button
              className="task-card__menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Task actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="task-card__menu" role="menu">
                <button
                  role="menuitem"
                  className="task-card__menu-item"
                  onClick={() => { setMenuOpen(false); onEdit(task); }}
                >
                  ✏️ Edit
                </button>
                <button
                  role="menuitem"
                  className="task-card__menu-item task-card__menu-item--danger"
                  onClick={() => { setMenuOpen(false); onDelete(task); }}
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}

        {/* Footer */}
        <div className="task-card__footer">
          {/* Priority badge */}
          <span
            className="task-card__priority-badge"
            style={{ color: priority.color, background: priority.bg }}
          >
            {priority.label}
          </span>

          {/* Due date badge (replaces plain date chip) */}
          {task.dueDate && (
            <DueDateBadge
              dueDate={task.dueDate}
              column={task.column}
              short
            />
          )}

          {/* Assignee */}
          {task.assignee && (
            <span
              className="task-card__assignee"
              title={`Assigned to ${task.assignee}`}
            >
              <span className="task-card__avatar" aria-hidden="true">
                {task.assignee.charAt(0).toUpperCase()}
              </span>
              <span className="task-card__assignee-name">{task.assignee}</span>
            </span>
          )}

          {/* Attachment count */}
          {attachments.length > 0 && (
            <span
              className="task-card__attachments"
              title={`${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
              aria-label={`${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
            >
              📎 {attachments.length}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default React.memo(TaskCard);
