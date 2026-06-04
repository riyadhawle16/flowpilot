import { useMemo } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function isoDate(d) {
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

/**
 * Short weekday label for a date: "Mon", "Tue", …
 */
function weekdayLabel(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Short month label: "Jan 1", "Jan 2", …
 */
function shortDateLabel(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isOverdueTask(task) {
  if (!task.dueDate || task.column === 'Done') return false;
  return new Date(task.dueDate) < startOfDay(new Date());
}

function isDoneTask(task) {
  return task.column === 'Done';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useProductivityMetrics
 *
 * Derives all dashboard metrics from the raw tasks array.
 *
 * @param {object[]} tasks  – raw TaskObject array (all workspaces or filtered)
 * @returns {object}        – structured metrics ready for chart components
 */
export function useProductivityMetrics(tasks) {
  return useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        summary:         emptySummary(),
        priorityData:    [],
        columnData:      [],
        trendData:       [],
        assigneeData:    [],
        completionRate:  0,
      };
    }

    // ── Summary cards ─────────────────────────────────────────────────────────

    const total      = tasks.length;
    const completed  = tasks.filter(isDoneTask).length;
    const pending    = tasks.filter((t) => t.column !== 'Done').length;
    const overdue    = tasks.filter(isOverdueTask).length;
    const inProgress = tasks.filter((t) => t.column === 'In Progress').length;
    const inReview   = tasks.filter((t) => t.column === 'Review').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // ── Priority breakdown (for PieChart / BarChart) ──────────────────────────

    const priorityCount = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    tasks.forEach((t) => {
      if (priorityCount[t.priority] !== undefined) priorityCount[t.priority]++;
    });

    const priorityData = [
      { name: 'Low',      value: priorityCount.Low,      fill: '#10b981' },
      { name: 'Medium',   value: priorityCount.Medium,   fill: '#f59e0b' },
      { name: 'High',     value: priorityCount.High,     fill: '#ef4444' },
      { name: 'Critical', value: priorityCount.Critical, fill: '#7c3aed' },
    ].filter((d) => d.value > 0);

    // ── Column distribution (for horizontal BarChart) ─────────────────────────

    const columnData = [
      { name: 'Todo',        value: tasks.filter((t) => t.column === 'Todo').length,        fill: '#6b7280' },
      { name: 'In Progress', value: inProgress,                                             fill: '#f59e0b' },
      { name: 'Review',      value: inReview,                                               fill: '#3b82f6' },
      { name: 'Done',        value: completed,                                              fill: '#10b981' },
    ];

    // ── 14-day productivity trend (tasks completed per day) ───────────────────
    // Uses task.updatedAt as proxy for "moved to Done" date.

    const today    = startOfDay(new Date());
    const trendMap = {};

    // Build a map of date → completed count
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(addDays(today, -i));
      trendMap[isoDate(d)] = { completed: 0, created: 0 };
    }

    tasks.forEach((t) => {
      // Created
      if (t.createdAt) {
        const key = isoDate(startOfDay(new Date(t.createdAt)));
        if (trendMap[key]) trendMap[key].created++;
      }
      // Completed (moved to Done)
      if (isDoneTask(t) && t.updatedAt) {
        const key = isoDate(startOfDay(new Date(t.updatedAt)));
        if (trendMap[key]) trendMap[key].completed++;
      }
    });

    const trendData = Object.entries(trendMap).map(([date, counts], idx) => ({
      date,
      label: idx % 2 === 0 ? shortDateLabel(date) : '', // every-other label to avoid clutter
      fullLabel: shortDateLabel(date),
      completed: counts.completed,
      created:   counts.created,
    }));

    // ── Weekly completion trend (last 7 days grouped by weekday) ─────────────

    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d   = startOfDay(addDays(today, -i));
      const key = isoDate(d);
      const dayCompleted = tasks.filter(
        (t) =>
          isDoneTask(t) &&
          t.updatedAt &&
          isoDate(startOfDay(new Date(t.updatedAt))) === key
      ).length;
      weekData.push({
        day:       weekdayLabel(d),
        completed: dayCompleted,
        fill:      dayCompleted > 0 ? '#6366f1' : '#e0e7ff',
      });
    }

    // ── Assignee breakdown ────────────────────────────────────────────────────

    const assigneeMap = {};
    tasks.forEach((t) => {
      const name = t.assignee?.trim() || 'Unassigned';
      if (!assigneeMap[name]) {
        assigneeMap[name] = { total: 0, done: 0 };
      }
      assigneeMap[name].total++;
      if (isDoneTask(t)) assigneeMap[name].done++;
    });

    const assigneeData = Object.entries(assigneeMap)
      .map(([name, v]) => ({
        name,
        total:    v.total,
        done:     v.done,
        pending:  v.total - v.done,
        rate:     v.total > 0 ? Math.round((v.done / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // cap at 8 assignees for readability

    return {
      summary: {
        total,
        completed,
        pending,
        overdue,
        inProgress,
        inReview,
      },
      completionRate,
      priorityData,
      columnData,
      trendData,
      weekData,
      assigneeData,
    };
  }, [tasks]);
}

function emptySummary() {
  return {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    inProgress: 0,
    inReview: 0,
  };
}
