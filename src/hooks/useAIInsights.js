import { useMemo } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_WEIGHT = { Critical: 4, High: 3, Medium: 2, Low: 1 };

// ─── Date helpers ─────────────────────────────────────────────────────────────

function daysUntilDue(iso) {
  if (!iso) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

function daysSince(iso) {
  if (!iso) return 0;
  const now = new Date();
  const then = new Date(iso);
  return Math.max(0, Math.round((now - then) / (1000 * 60 * 60 * 24)));
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// ─── 1. Smart Priority Score ──────────────────────────────────────────────────
// Combines: declared priority + due-date urgency + column progress factor.
// Returns a score 0–100 and a recommended priority label.

function computePriorityScore(task) {
  const base = (PRIORITY_WEIGHT[task.priority] || 2) * 15; // 15–60

  // Due date urgency
  const days = daysUntilDue(task.dueDate);
  let urgency = 0;
  if (days !== null) {
    if (days < 0)  urgency = 40;      // overdue
    else if (days === 0) urgency = 35; // due today
    else if (days <= 2)  urgency = 25;
    else if (days <= 7)  urgency = 15;
    else if (days <= 14) urgency = 8;
    else urgency = 2;
  }

  // Column factor: tasks stuck in Review without progress
  const colFactor =
    task.column === 'Todo' ? 0 :
    task.column === 'In Progress' ? 5 :
    task.column === 'Review' ? 3 : 0;

  // Stagnation: task not updated in > 3 days gets a nudge
  const stale = daysSince(task.updatedAt) > 3 ? 8 : 0;

  const score = clamp(base + urgency + colFactor + stale, 0, 100);

  // Recommended label
  let recommended;
  if (score >= 80) recommended = 'Critical';
  else if (score >= 60) recommended = 'High';
  else if (score >= 35) recommended = 'Medium';
  else recommended = 'Low';

  return { score, recommended, current: task.priority };
}

// ─── 2. Burnout Risk ──────────────────────────────────────────────────────────
// Analyses per-assignee workload vs completed ratio + overdue count.
// Returns a 0–100 risk score and a severity label.

function computeBurnoutRisk(tasks) {
  const byAssignee = {};

  tasks.forEach((t) => {
    const name = (t.assignee || '').trim() || 'Unassigned';
    if (!byAssignee[name]) {
      byAssignee[name] = { total: 0, done: 0, overdue: 0, critical: 0, highActive: 0 };
    }
    const a = byAssignee[name];
    a.total++;
    if (t.column === 'Done') a.done++;
    else {
      if (t.dueDate && new Date(t.dueDate) < new Date()) a.overdue++;
      if (t.priority === 'Critical') a.critical++;
      if (t.priority === 'High' && t.column !== 'Done') a.highActive++;
    }
  });

  return Object.entries(byAssignee).map(([name, d]) => {
    const pending = d.total - d.done;

    // Workload pressure: more than 5 active tasks = stress
    const loadScore = clamp((pending / 5) * 40, 0, 40);
    // Overdue weight
    const overdueScore = clamp(d.overdue * 12, 0, 30);
    // High/critical active tasks
    const critScore = clamp((d.critical * 10 + d.highActive * 5), 0, 20);
    // Low completion ratio
    const ratioScore = d.total > 0
      ? clamp((1 - d.done / d.total) * 10, 0, 10)
      : 0;

    const risk = Math.round(loadScore + overdueScore + critScore + ratioScore);

    const level =
      risk >= 75 ? 'High' :
      risk >= 45 ? 'Medium' :
      'Low';

    return {
      assignee: name,
      risk: clamp(risk, 0, 100),
      level,
      pending,
      overdue: d.overdue,
      critical: d.critical,
    };
  }).sort((a, b) => b.risk - a.risk);
}

// ─── 3. Focus Score ───────────────────────────────────────────────────────────
// Measures how well the team is focused:
// - Fewer "In Progress" tasks = better focus (single-tasking)
// - High Critical/High tasks in Review suggests bottleneck
// - Many Todo tasks = backlog pressure
// Returns a score 0–100 (100 = perfectly focused).

function computeFocusScore(tasks) {
  if (!tasks.length) return { score: 100, label: 'No data', detail: [] };

  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.column === 'In Progress').length;
  const review     = tasks.filter((t) => t.column === 'Review').length;
  const todo       = tasks.filter((t) => t.column === 'Todo').length;
  const done       = tasks.filter((t) => t.column === 'Done').length;

  // Ideal: ≤3 in-progress per person (approximate as ≤30% of total)
  const wipRatio = inProgress / total;
  const wipPenalty = clamp(wipRatio > 0.3 ? (wipRatio - 0.3) * 100 : 0, 0, 30);

  // Review bottleneck: >20% stuck in review
  const reviewRatio = review / total;
  const reviewPenalty = clamp(reviewRatio > 0.2 ? (reviewRatio - 0.2) * 80 : 0, 0, 25);

  // Backlog pressure: large todo pile
  const todoPenalty = clamp((todo / total) * 20, 0, 20);

  // Completion boost: done tasks indicate momentum
  const doneBoost = clamp((done / total) * 25, 0, 25);

  const score = Math.round(clamp(100 - wipPenalty - reviewPenalty - todoPenalty + doneBoost - 25, 0, 100));

  const label =
    score >= 80 ? 'Highly Focused' :
    score >= 60 ? 'Good Focus' :
    score >= 40 ? 'Needs Improvement' :
    'Scattered';

  const detail = [
    { label: 'In Progress',  value: inProgress, note: wipRatio > 0.3 ? 'High WIP' : 'OK' },
    { label: 'Review',       value: review,     note: reviewRatio > 0.2 ? 'Bottleneck' : 'OK' },
    { label: 'Todo (backlog)',value: todo,       note: '' },
    { label: 'Completed',    value: done,        note: '' },
  ];

  return { score, label, detail };
}

// ─── 4. Workload Balance ──────────────────────────────────────────────────────
// Returns per-assignee active task count and balance score (0–100).
// 100 = perfectly even distribution; lower = more imbalanced.

function computeWorkloadBalance(tasks) {
  const byAssignee = {};

  tasks
    .filter((t) => t.column !== 'Done')
    .forEach((t) => {
      const name = (t.assignee || '').trim() || 'Unassigned';
      if (!byAssignee[name]) byAssignee[name] = { count: 0, weight: 0 };
      byAssignee[name].count++;
      byAssignee[name].weight += PRIORITY_WEIGHT[t.priority] || 2;
    });

  const entries = Object.entries(byAssignee).map(([name, d]) => ({
    assignee: name,
    activeTasks: d.count,
    weightedLoad: round1(d.weight),
  }));

  if (entries.length < 2) {
    return {
      score: 100,
      label: entries.length === 0 ? 'No active tasks' : 'Single assignee',
      entries,
      recommendation: '',
    };
  }

  const counts = entries.map((e) => e.activeTasks);
  const avg = counts.reduce((s, c) => s + c, 0) / counts.length;
  const maxDev = Math.max(...counts.map((c) => Math.abs(c - avg)));
  // Normalise: deviation > avg means fully imbalanced
  const imbalance = avg > 0 ? clamp(maxDev / avg, 0, 1) : 0;
  const score = Math.round(100 - imbalance * 100);

  const overloaded = entries.filter((e) => e.activeTasks > avg * 1.5).map((e) => e.assignee);
  const underloaded = entries.filter((e) => e.activeTasks < avg * 0.5).map((e) => e.assignee);

  const recommendation =
    overloaded.length > 0
      ? `${overloaded.join(', ')} ${overloaded.length === 1 ? 'is' : 'are'} overloaded. Consider reassigning tasks.`
      : score >= 80
      ? 'Workload is well balanced across the team.'
      : 'Some imbalance detected — review task assignments.';

  const label =
    score >= 80 ? 'Well Balanced' :
    score >= 55 ? 'Slightly Uneven' :
    'Unbalanced';

  return { score, label, entries, recommendation };
}

// ─── 5. Project Risk Meter ────────────────────────────────────────────────────
// Aggregates multiple risk signals into a single risk score 0–100.

function computeProjectRisk(tasks) {
  if (!tasks.length) {
    return { score: 0, level: 'Low', signals: [] };
  }

  const total = tasks.length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.column !== 'Done' && new Date(t.dueDate) < new Date()
  ).length;
  const criticalActive = tasks.filter(
    (t) => t.priority === 'Critical' && t.column !== 'Done'
  ).length;
  const highActive = tasks.filter(
    (t) => t.priority === 'High' && t.column !== 'Done'
  ).length;
  const stale = tasks.filter(
    (t) => t.column !== 'Done' && daysSince(t.updatedAt) > 5
  ).length;
  const done = tasks.filter((t) => t.column === 'Done').length;
  const completionRate = total > 0 ? done / total : 0;

  // Risk signals (each contributes to total score)
  const signals = [
    {
      label: 'Overdue Tasks',
      value: overdue,
      score: clamp((overdue / total) * 50, 0, 30),
      severity: overdue === 0 ? 'ok' : overdue <= 2 ? 'warn' : 'danger',
      detail: `${overdue} of ${total} tasks are past due`,
    },
    {
      label: 'Critical Priority Active',
      value: criticalActive,
      score: clamp(criticalActive * 8, 0, 24),
      severity: criticalActive === 0 ? 'ok' : criticalActive <= 2 ? 'warn' : 'danger',
      detail: `${criticalActive} critical task${criticalActive !== 1 ? 's' : ''} not done`,
    },
    {
      label: 'High Priority Active',
      value: highActive,
      score: clamp(highActive * 3, 0, 15),
      severity: highActive === 0 ? 'ok' : highActive <= 3 ? 'warn' : 'danger',
      detail: `${highActive} high-priority task${highActive !== 1 ? 's' : ''} pending`,
    },
    {
      label: 'Stale Tasks (>5 days)',
      value: stale,
      score: clamp((stale / total) * 30, 0, 20),
      severity: stale === 0 ? 'ok' : stale <= 3 ? 'warn' : 'danger',
      detail: `${stale} task${stale !== 1 ? 's' : ''} not updated in 5+ days`,
    },
    {
      label: 'Low Completion Rate',
      value: Math.round(completionRate * 100),
      score: completionRate > 0.6 ? 0 : clamp((0.6 - completionRate) * 20, 0, 12),
      severity: completionRate >= 0.6 ? 'ok' : completionRate >= 0.3 ? 'warn' : 'danger',
      detail: `${Math.round(completionRate * 100)}% of tasks completed`,
    },
  ];

  const totalScore = Math.round(clamp(signals.reduce((s, x) => s + x.score, 0), 0, 100));

  const level =
    totalScore >= 70 ? 'Critical' :
    totalScore >= 45 ? 'High' :
    totalScore >= 20 ? 'Medium' :
    'Low';

  return { score: totalScore, level, signals };
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

/**
 * useAIInsights
 *
 * Computes all 5 AI-inspired insights from a raw tasks array.
 * Pure local algorithms — no external API calls.
 *
 * @param {object[]} tasks
 * @returns {object} insights
 */
export function useAIInsights(tasks) {
  return useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        priorityPredictions: [],
        burnoutRisk:          [],
        focusScore:           { score: 0, label: 'No data', detail: [] },
        workloadBalance:      { score: 100, label: 'No data', entries: [], recommendation: '' },
        projectRisk:          { score: 0, level: 'Low', signals: [] },
      };
    }

    // 1. Priority predictions for non-done tasks
    const activeTasks = tasks.filter((t) => t.column !== 'Done');
    const priorityPredictions = activeTasks
      .map((t) => ({ ...t, prediction: computePriorityScore(t) }))
      .filter((t) => t.prediction.recommended !== t.prediction.current) // only flag mismatches
      .sort((a, b) => b.prediction.score - a.prediction.score)
      .slice(0, 8);

    // 2. Burnout risk per assignee
    const burnoutRisk = computeBurnoutRisk(tasks);

    // 3. Focus score
    const focusScore = computeFocusScore(tasks);

    // 4. Workload balance
    const workloadBalance = computeWorkloadBalance(tasks);

    // 5. Project risk
    const projectRisk = computeProjectRisk(tasks);

    return {
      priorityPredictions,
      burnoutRisk,
      focusScore,
      workloadBalance,
      projectRisk,
    };
  }, [tasks]);
}
