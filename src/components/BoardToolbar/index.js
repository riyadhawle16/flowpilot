import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PRIORITIES, COLUMNS } from '../../context/KanbanContext';
import { SORT_OPTIONS } from '../../hooks/useTaskFilter';
import './BoardToolbar.css';

/**
 * BoardToolbar — search, filter, and sort controls for the Kanban board.
 *
 * Props:
 *   filters          {object}    — current filter state from useTaskFilter
 *   sort             {string}    — current sort value
 *   activeFilterCount{number}    — number of active (non-search) filters
 *   filteredCount    {number}    — tasks visible after filtering
 *   totalCount       {number}    — total tasks in board
 *   assignees        {string[]}  — unique assignee names for the dropdown
 *   onSearchChange   {(v) => void}
 *   onFilterChange   {(key, v) => void}
 *   onSortChange     {(v) => void}
 *   onResetFilters   {() => void}
 */
function BoardToolbar({
  filters,
  sort,
  activeFilterCount,
  filteredCount,
  totalCount,
  assignees,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onResetFilters,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterPanelRef = useRef(null);
  const searchRef = useRef(null);

  // Close filter panel on outside click
  const handleOutsideClick = useCallback((e) => {
    if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
      setFilterOpen(false);
    }
  }, []);

  useEffect(() => {
    if (filterOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [filterOpen, handleOutsideClick]);

  // Close panel on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setFilterOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const hasAnyFilter = activeFilterCount > 0 || filters.search.trim() !== '';
  const isFiltered   = filteredCount < totalCount;

  return (
    <div className="board-toolbar" role="toolbar" aria-label="Board toolbar">
      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="board-toolbar__search-wrap">
        <span className="board-toolbar__search-icon" aria-hidden="true">🔍</span>
        <input
          ref={searchRef}
          type="search"
          className="board-toolbar__search"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
        {filters.search && (
          <button
            className="board-toolbar__search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Filter button ───────────────────────────────────────── */}
      <div className="board-toolbar__filter-wrap" ref={filterPanelRef}>
        <button
          className={`board-toolbar__filter-btn ${activeFilterCount > 0 ? 'board-toolbar__filter-btn--active' : ''}`}
          onClick={() => setFilterOpen((o) => !o)}
          aria-label={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
          aria-expanded={filterOpen}
          aria-haspopup="true"
          type="button"
        >
          <span aria-hidden="true">⚙</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="board-toolbar__filter-count" aria-hidden="true">
              {activeFilterCount}
            </span>
          )}
        </button>

        {filterOpen && (
          <div
            className="board-toolbar__filter-panel"
            role="group"
            aria-label="Filter options"
          >
            <div className="filter-panel__header">
              <span className="filter-panel__title">Filters</span>
              {activeFilterCount > 0 && (
                <button
                  className="filter-panel__reset"
                  onClick={() => { onResetFilters(); setFilterOpen(false); }}
                  type="button"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Priority */}
            <div className="filter-panel__group">
              <label className="filter-panel__label" htmlFor="fp-priority">
                Priority
              </label>
              <select
                id="fp-priority"
                className="filter-panel__select"
                value={filters.priority}
                onChange={(e) => onFilterChange('priority', e.target.value)}
              >
                <option value="">All priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status / Column */}
            <div className="filter-panel__group">
              <label className="filter-panel__label" htmlFor="fp-status">
                Status
              </label>
              <select
                id="fp-status"
                className="filter-panel__select"
                value={filters.status || ''}
                onChange={(e) => onFilterChange('status', e.target.value)}
              >
                <option value="">All statuses</option>
                {COLUMNS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="filter-panel__group">
              <label className="filter-panel__label" htmlFor="fp-assignee">
                Assignee
              </label>
              <select
                id="fp-assignee"
                className="filter-panel__select"
                value={filters.assignee}
                onChange={(e) => onFilterChange('assignee', e.target.value)}
              >
                <option value="">All assignees</option>
                {assignees.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="filter-panel__group">
              <label className="filter-panel__label" htmlFor="fp-due">
                Due Date
              </label>
              <select
                id="fp-due"
                className="filter-panel__select"
                value={filters.dueDateRange}
                onChange={(e) => onFilterChange('dueDateRange', e.target.value)}
              >
                <option value="">Any date</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due today</option>
                <option value="week">Due this week</option>
                <option value="none">No due date</option>
              </select>
            </div>

            {/* Label search */}
            <div className="filter-panel__group">
              <label className="filter-panel__label" htmlFor="fp-label">
                Label
              </label>
              <input
                id="fp-label"
                type="text"
                className="filter-panel__input"
                placeholder="Search labels…"
                value={filters.labelText}
                onChange={(e) => onFilterChange('labelText', e.target.value)}
                maxLength={40}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sort ────────────────────────────────────────────────── */}
      <div className="board-toolbar__sort-wrap">
        <label htmlFor="bt-sort" className="board-toolbar__sort-label">
          <span aria-hidden="true">↕</span>
          <span className="sr-only">Sort by</span>
        </label>
        <select
          id="bt-sort"
          className="board-toolbar__sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort tasks"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Active filter chips + result count ──────────────────── */}
      {hasAnyFilter && (
        <div className="board-toolbar__chips" aria-live="polite" aria-atomic="true">
          {filters.priority && (
            <span className="filter-chip">
              Priority: {filters.priority}
              <button
                className="filter-chip__remove"
                onClick={() => onFilterChange('priority', '')}
                aria-label={`Remove priority filter: ${filters.priority}`}
              >✕</button>
            </span>
          )}
          {filters.assignee && (
            <span className="filter-chip">
              {filters.assignee}
              <button
                className="filter-chip__remove"
                onClick={() => onFilterChange('assignee', '')}
                aria-label={`Remove assignee filter: ${filters.assignee}`}
              >✕</button>
            </span>
          )}
          {filters.dueDateRange && (
            <span className="filter-chip">
              {{
                overdue: 'Overdue',
                today: 'Due today',
                week: 'Due this week',
                none: 'No due date',
              }[filters.dueDateRange]}
              <button
                className="filter-chip__remove"
                onClick={() => onFilterChange('dueDateRange', '')}
                aria-label="Remove due date filter"
              >✕</button>
            </span>
          )}
          {filters.labelText && (
            <span className="filter-chip">
              Label: {filters.labelText}
              <button
                className="filter-chip__remove"
                onClick={() => onFilterChange('labelText', '')}
                aria-label="Remove label filter"
              >✕</button>
            </span>
          )}

          {isFiltered && (
            <span className="board-toolbar__count" aria-live="polite">
              {filteredCount} / {totalCount} task{totalCount !== 1 ? 's' : ''}
            </span>
          )}

          {hasAnyFilter && (
            <button
              className="board-toolbar__reset"
              onClick={onResetFilters}
              type="button"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BoardToolbar;
