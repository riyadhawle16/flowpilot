import { useState, useMemo, useCallback } from 'react';
import { COLUMNS } from '../context/KanbanContext';

// ─── Default filter / sort state ─────────────────────────────────────────────

export const DEFAULT_FILTERS = {
  search:       '',
  priority:     '',   // '' means all
  status:       '',   // '' means all columns
  assignee:     '',   // '' means all
  dueDateRange: '', // '' | 'overdue' | 'today' | 'week' | 'none'
  labelText:    '',   // '' means all labels
};

export const SORT_OPTIONS = [
  { value: '',            label: 'Default (creation)' },
  { value: 'dueDate_asc', label: 'Due Date ↑' },
  { value: 'dueDate_desc',label: 'Due Date ↓' },
  { value: 'priority',    label: 'Priority (High → Low)' },
  { value: 'title',       label: 'Title A–Z' },
];

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdueDate(iso) {
  if (!iso) return false;
  return new Date(iso) < startOfDay(new Date());
}

function isDueToday(iso) {
  if (!iso) return false;
  const due = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  return due.getTime() === today.getTime();
}

function isDueThisWeek(iso) {
  if (!iso) return false;
  const due = new Date(iso);
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);
  return due >= now && due <= weekEnd;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useTaskFilter — manages search / filter / sort state and returns filtered
 * tasksByColumn that respects all active criteria.
 *
 * @param {object[]} tasks - raw tasks array from KanbanContext
 * @returns {{
 *   filters, sort, activeFilterCount,
 *   setSearch, setFilter, setSort, resetFilters,
 *   filteredTasksByColumn
 * }}
 */
export function useTaskFilter(tasks) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('');

  const setSearch = useCallback((value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort('');
  }, []);

  // Count how many non-search filters are active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priority)      count++;
    if (filters.status)        count++;
    if (filters.assignee)      count++;
    if (filters.dueDateRange)  count++;
    if (filters.labelText)     count++;
    return count;
  }, [filters]);

  // ── Core filter + sort pipeline ──────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search — title + description + assignee
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.assignee || '').toLowerCase().includes(q) ||
          (t.labels || []).some((l) => l.text.toLowerCase().includes(q))
      );
    }

    // 2. Priority
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // 2b. Status (maps to column)
    if (filters.status) {
      result = result.filter((t) => t.column === filters.status);
    }

    // 3. Assignee
    if (filters.assignee) {
      result = result.filter((t) => t.assignee === filters.assignee);
    }

    // 4. Due date range
    if (filters.dueDateRange) {
      switch (filters.dueDateRange) {
        case 'overdue':
          result = result.filter(
            (t) => t.column !== 'Done' && isOverdueDate(t.dueDate)
          );
          break;
        case 'today':
          result = result.filter((t) => isDueToday(t.dueDate));
          break;
        case 'week':
          result = result.filter((t) => isDueThisWeek(t.dueDate));
          break;
        case 'none':
          result = result.filter((t) => !t.dueDate);
          break;
        default:
          break;
      }
    }

    // 5. Label text search
    if (filters.labelText.trim()) {
      const lq = filters.labelText.trim().toLowerCase();
      result = result.filter((t) =>
        (t.labels || []).some((l) => l.text.toLowerCase().includes(lq))
      );
    }

    // 6. Sort
    if (sort) {
      result = [...result].sort((a, b) => {
        switch (sort) {
          case 'dueDate_asc': {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          }
          case 'dueDate_desc': {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(b.dueDate) - new Date(a.dueDate);
          }
          case 'priority': {
            return (
              (PRIORITY_ORDER[a.priority] ?? 99) -
              (PRIORITY_ORDER[b.priority] ?? 99)
            );
          }
          case 'title': {
            return a.title.localeCompare(b.title);
          }
          default:
            return 0;
        }
      });
    }

    return result;
  }, [tasks, filters, sort]);

  // Re-group by column after filtering
  const filteredTasksByColumn = useMemo(() => {
    const map = {};
    COLUMNS.forEach((col) => {
      map[col] = filteredTasks.filter((t) => t.column === col);
    });
    return map;
  }, [filteredTasks]);

  return {
    filters,
    sort,
    activeFilterCount,
    setSearch,
    setFilter,
    setSort,
    resetFilters,
    filteredTasksByColumn,
    filteredCount: filteredTasks.length,
    totalCount:    tasks.length,
  };
}
