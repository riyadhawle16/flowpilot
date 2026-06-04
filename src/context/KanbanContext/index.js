import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from '../AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

export const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const LABEL_COLORS = [
  { id: 'red',    hex: '#ef4444', bg: '#fee2e2', name: 'Red' },
  { id: 'orange', hex: '#f97316', bg: '#fff7ed', name: 'Orange' },
  { id: 'yellow', hex: '#eab308', bg: '#fefce8', name: 'Yellow' },
  { id: 'green',  hex: '#22c55e', bg: '#f0fdf4', name: 'Green' },
  { id: 'blue',   hex: '#3b82f6', bg: '#eff6ff', name: 'Blue' },
  { id: 'purple', hex: '#a855f7', bg: '#faf5ff', name: 'Purple' },
  { id: 'pink',   hex: '#ec4899', bg: '#fdf2f8', name: 'Pink' },
  { id: 'gray',   hex: '#6b7280', bg: '#f9fafb', name: 'Gray' },
];

const STORAGE_KEY = 'flowpilot_kanban_tasks';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateId(prefix = 'task') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // quota exceeded — silently continue
  }
}

// ─── Task shape ───────────────────────────────────────────────────────────────
//
// {
//   id, workspaceId, title, description,
//   priority, dueDate, assignee, column,
//   labels: [{ id, text, colorId }],
//   attachments: [{ id, name, size, addedAt }],
//   createdBy, createdAt, updatedAt
// }

// ─── Context ──────────────────────────────────────────────────────────────────

const KanbanContext = createContext(null);

export function KanbanProvider({ children, workspaceId }) {
  const { user } = useAuth();

  const [tasks, setTasks]   = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError]   = useState(null);

  // Load tasks for the current workspace
  useEffect(() => {
    if (!user || !workspaceId) {
      setTasks([]);
      setStatus('idle');
      return;
    }
    const load = async () => {
      setStatus('loading');
      try {
        await delay(200);
        const all = loadAll();
        const mine = all.filter((t) => t.workspaceId === workspaceId);
        // Migrate old tasks that lack Phase 4 fields
        const migrated = mine.map((t) => ({
          labels: [],
          attachments: [],
          ...t,
        }));
        setTasks(migrated);
        setStatus('idle');
      } catch {
        setError('Failed to load tasks');
        setStatus('error');
      }
    };
    load();
  }, [user, workspaceId]);

  const clearError = useCallback(() => setError(null), []);

  const persist = useCallback(
    (updatedTasks) => {
      const all = loadAll();
      const others = all.filter((t) => t.workspaceId !== workspaceId);
      saveAll([...others, ...updatedTasks]);
      setTasks(updatedTasks);
    },
    [workspaceId]
  );

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (formData) => {
      setStatus('loading');
      setError(null);
      try {
        await delay(300);
        const newTask = {
          id: generateId('task'),
          workspaceId,
          title:       formData.title.trim(),
          description: formData.description?.trim() || '',
          priority:    formData.priority || 'Medium',
          dueDate:     formData.dueDate || '',
          assignee:    formData.assignee?.trim() || '',
          column:      formData.column || 'Todo',
          labels:      formData.labels || [],
          attachments: formData.attachments || [],
          createdBy:   user.id,
          createdAt:   new Date().toISOString(),
          updatedAt:   new Date().toISOString(),
        };
        const updated = [...tasks, newTask];
        persist(updated);
        setStatus('idle');
        return newTask;
      } catch (err) {
        setError(err.message || 'Failed to create task');
        setStatus('error');
        throw err;
      }
    },
    [tasks, persist, workspaceId, user]
  );

  const editTask = useCallback(
    async (taskId, formData) => {
      setStatus('loading');
      setError(null);
      try {
        await delay(250);
        const updated = tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                title:       formData.title.trim(),
                description: formData.description?.trim() || '',
                priority:    formData.priority || t.priority,
                dueDate:     formData.dueDate || '',
                assignee:    formData.assignee?.trim() || '',
                labels:      formData.labels ?? t.labels,
                attachments: formData.attachments ?? t.attachments,
                updatedAt:   new Date().toISOString(),
              }
            : t
        );
        persist(updated);
        setStatus('idle');
      } catch (err) {
        setError(err.message || 'Failed to update task');
        setStatus('error');
        throw err;
      }
    },
    [tasks, persist]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      setStatus('loading');
      setError(null);
      try {
        await delay(200);
        persist(tasks.filter((t) => t.id !== taskId));
        setStatus('idle');
      } catch (err) {
        setError(err.message || 'Failed to delete task');
        setStatus('error');
        throw err;
      }
    },
    [tasks, persist]
  );

  const moveTask = useCallback(
    async (taskId, targetColumn) => {
      setError(null);
      try {
        const updated = tasks.map((t) =>
          t.id === taskId
            ? { ...t, column: targetColumn, updatedAt: new Date().toISOString() }
            : t
        );
        persist(updated);
      } catch (err) {
        setError(err.message || 'Failed to move task');
      }
    },
    [tasks, persist]
  );

  // ── Derived ─────────────────────────────────────────────────────────────────

  const tasksByColumn = useMemo(() => {
    const map = {};
    COLUMNS.forEach((col) => {
      map[col] = tasks.filter((t) => t.column === col);
    });
    return map;
  }, [tasks]);

  /** Unique assignee names across all tasks in this workspace */
  const assignees = useMemo(() => {
    const set = new Set(tasks.map((t) => t.assignee).filter(Boolean));
    return [...set].sort();
  }, [tasks]);

  // ── Value ────────────────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      tasks,
      tasksByColumn,
      assignees,
      status,
      error,
      clearError,
      createTask,
      editTask,
      deleteTask,
      moveTask,
    }),
    [tasks, tasksByColumn, assignees, status, error, clearError, createTask, editTask, deleteTask, moveTask]
  );

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban must be used inside <KanbanProvider>');
  return ctx;
}
