import React, { useState, useCallback } from 'react';
import { useKanban, COLUMNS } from '../../context/KanbanContext';
import { useTaskFilter } from '../../hooks/useTaskFilter';
import KanbanColumn from '../KanbanColumn';
import TaskForm from '../TaskForm';
import ConfirmDialog from '../ConfirmDialog';
import BoardToolbar from '../BoardToolbar';
import './KanbanBoard.css';

/**
 * KanbanBoard — Phase 4 enhanced.
 * Adds search / filter / sort toolbar on top of Phase 3 drag-and-drop board.
 *
 * Props:
 *   workspaceName {string}
 */
function KanbanBoard({ workspaceName }) {
  const {
    tasks,
    assignees,
    status,
    error,
    clearError,
    createTask,
    editTask,
    deleteTask,
    moveTask,
  } = useKanban();

  // ── Search / filter / sort ────────────────────────────────────────────────
  const {
    filters,
    sort,
    activeFilterCount,
    setSearch,
    setFilter,
    setSort,
    resetFilters,
    filteredTasksByColumn,
    filteredCount,
    totalCount,
  } = useTaskFilter(tasks);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [formMode,      setFormMode]      = useState(null);
  const [formColumn,    setFormColumn]    = useState('Todo');
  const [editingTask,   setEditingTask]   = useState(null);
  const [deletingTask,  setDeletingTask]  = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [dragTaskId, setDragTaskId] = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpenCreate = useCallback((column) => {
    setFormColumn(column || 'Todo');
    setEditingTask(null);
    setFormMode('create');
  }, []);

  const handleOpenEdit = useCallback((task) => {
    setEditingTask(task);
    setFormMode('edit');
  }, []);

  const handleOpenDelete = useCallback((task) => {
    setDeletingTask(task);
    setIsConfirmOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormMode(null);
    setEditingTask(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData) => {
      if (formMode === 'create') {
        await createTask({ ...formData, column: formColumn });
      } else if (formMode === 'edit' && editingTask) {
        await editTask(editingTask.id, formData);
      }
      handleCloseForm();
    },
    [formMode, formColumn, editingTask, createTask, editTask, handleCloseForm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (deletingTask) {
      await deleteTask(deletingTask.id);
      setIsConfirmOpen(false);
      setDeletingTask(null);
    }
  }, [deletingTask, deleteTask]);

  const handleCancelDelete = useCallback(() => {
    setIsConfirmOpen(false);
    setDeletingTask(null);
  }, []);

  const handleDrop = useCallback(
    (targetColumn) => {
      if (dragTaskId) {
        moveTask(dragTaskId, targetColumn);
        setDragTaskId(null);
      }
    },
    [dragTaskId, moveTask]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="kanban-board">
      {/* ── Board Header ──────────────────────────────────────────── */}
      <div className="kanban-board__header">
        <div className="kanban-board__title-group">
          <span className="kanban-board__icon" aria-hidden="true">📋</span>
          <h2 className="kanban-board__title">{workspaceName || 'Kanban Board'}</h2>
        </div>
        <button
          className="kanban-board__add-btn"
          onClick={() => handleOpenCreate('Todo')}
          aria-label="Add new task"
          type="button"
        >
          <span aria-hidden="true">＋</span> New Task
        </button>
      </div>

      {/* ── Search / Filter / Sort toolbar ────────────────────────── */}
      <BoardToolbar
        filters={filters}
        sort={sort}
        activeFilterCount={activeFilterCount}
        filteredCount={filteredCount}
        totalCount={totalCount}
        assignees={assignees}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onResetFilters={resetFilters}
      />

      {/* ── Global error banner ───────────────────────────────────── */}
      {error && (
        <div className="kanban-board__error" role="alert">
          <span>{error}</span>
          <button
            className="kanban-board__error-close"
            onClick={clearError}
            aria-label="Dismiss error"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Columns ───────────────────────────────────────────────── */}
      <div
        className="kanban-board__columns"
        role="list"
        aria-label="Kanban board columns"
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col}
            column={col}
            tasks={filteredTasksByColumn[col] || []}
            isLoading={status === 'loading'}
            dragTaskId={dragTaskId}
            onDragStart={setDragTaskId}
            onDrop={handleDrop}
            onAddTask={handleOpenCreate}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleOpenDelete}
          />
        ))}
      </div>

      {/* ── Task Form Modal ────────────────────────────────────────── */}
      {formMode && (
        <TaskForm
          mode={formMode}
          task={editingTask}
          defaultColumn={formColumn}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          isSubmitting={status === 'loading'}
        />
      )}

      {/* ── Delete Confirmation ────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Task"
        message={
          deletingTask
            ? `Delete "${deletingTask.title}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isDangerous
        isLoading={status === 'loading'}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default KanbanBoard;
