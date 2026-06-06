import React, { useState, useRef, useCallback } from 'react';
import TaskCard from '../TaskCard';
import TaskCardSkeleton from '../TaskCardSkeleton';
import './KanbanColumn.css';

/**
 * Colour config per column — uses CSS variable fallbacks for theming.
 * Colors match: Todo→text-secondary, In Progress→warning, Review→info, Done→success
 */
const COLUMN_META = {
  'Todo':        { color: 'var(--text-secondary, #6b7280)',  bg: 'var(--surface-hover, #f3f4f6)',  emoji: '📝' },
  'In Progress': { color: 'var(--warning, #f59e0b)',          bg: 'rgba(245,158,11,0.08)',           emoji: '🔄' },
  'Review':      { color: 'var(--info, #3b82f6)',             bg: 'rgba(59,130,246,0.08)',           emoji: '👁️' },
  'Done':        { color: 'var(--success, #22c55e)',          bg: 'rgba(34,197,94,0.08)',            emoji: '✅' },
};

/**
 * KanbanColumn
 *
 * Props:
 *   column       {string}   — column name
 *   tasks        {array}    — task objects for this column
 *   isLoading    {boolean}
 *   dragTaskId   {string|null} — id of task currently being dragged
 *   onDragStart  {(taskId) => void}
 *   onDrop       {(column) => void}
 *   onAddTask    {(column) => void}
 *   onEditTask   {(task) => void}
 *   onDeleteTask {(task) => void}
 */
function KanbanColumn({
  column,
  tasks,
  isLoading,
  dragTaskId,
  onDragStart,
  onDrop,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
  const meta = COLUMN_META[column] || COLUMN_META['Todo'];
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0); // track nested drag-enter/leave

  // ── HTML5 Drag & Drop handlers ─────────────────────────────────────────────

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      onDrop(column);
    },
    [column, onDrop]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      className={`kanban-column ${isDragOver ? 'kanban-column--drag-over' : ''}`}
      aria-label={`${column} column, ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
      data-column={column}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <header
        className="kanban-column__header"
        style={{ borderTopColor: meta.color }}
      >
        <div className="kanban-column__header-left">
          <span className="kanban-column__emoji" aria-hidden="true">
            {meta.emoji}
          </span>
          <span className="kanban-column__name">{column}</span>
          <span
            className="kanban-column__count"
            style={{ background: meta.color }}
            aria-label={`${tasks.length} tasks`}
          >
            {tasks.length}
          </span>
        </div>
        <button
          className="kanban-column__add-btn"
          onClick={() => onAddTask(column)}
          aria-label={`Add task to ${column}`}
          title={`Add task to ${column}`}
        >
          ＋
        </button>
      </header>

      {/* Task list */}
      <div className="kanban-column__body">
        {isLoading && tasks.length === 0 ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : tasks.length === 0 ? (
          <div className="kanban-column__empty" aria-label="No tasks in this column">
            <span className="kanban-column__empty-icon" aria-hidden="true">
              {meta.emoji}
            </span>
            <p className="kanban-column__empty-text">No tasks yet</p>
            <button
              className="kanban-column__empty-btn"
              onClick={() => onAddTask(column)}
            >
              Add a task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={dragTaskId === task.id}
              onDragStart={onDragStart}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              allColumns={Object.keys(COLUMN_META)}
            />
          ))
        )}

        {/* Drop zone hint when dragging over */}
        {isDragOver && dragTaskId && (
          <div className="kanban-column__drop-hint" aria-hidden="true">
            Drop here
          </div>
        )}
      </div>
    </section>
  );
}

export default React.memo(KanbanColumn);
