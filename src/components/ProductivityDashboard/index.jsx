import React, { useMemo } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { useProductivityMetrics } from '../../hooks/useProductivityMetrics';
import MetricCard from '../charts/MetricCard';
import CompletionRingChart from '../charts/CompletionRingChart';
import ProductivityTrendChart from '../charts/ProductivityTrendChart';
import PriorityBreakdownChart from '../charts/PriorityBreakdownChart';
import ColumnDistributionChart from '../charts/ColumnDistributionChart';
import WeeklyBarChart from '../charts/WeeklyBarChart';
import AssigneeChart from '../charts/AssigneeChart';
import OverdueSummary from '../charts/OverdueSummary';
import '../charts/charts.css';
import './ProductivityDashboard.css';

// ─── localStorage helper (mirrors KanbanContext) ──────────────────────────────

function loadTasks(workspaceId) {
  try {
    const raw = localStorage.getItem('flowpilot_kanban_tasks');
    const all = raw ? JSON.parse(raw) : [];
    if (workspaceId) {
      return all
        .filter((t) => t.workspaceId === workspaceId)
        .map((t) => ({ labels: [], attachments: [], ...t }));
    }
    // No workspaceId → aggregate all tasks (global analytics)
    return all.map((t) => ({ labels: [], attachments: [], ...t }));
  } catch {
    return [];
  }
}

/**
 * ProductivityDashboard — Phase 5 analytics page.
 *
 * Can be used in two modes:
 *   /analytics                   → global view (all workspaces)
 *   /workspace/:workspaceId/analytics → workspace-scoped view
 */
function ProductivityDashboard() {
  const history  = useHistory();
  const { workspaceId } = useParams(); // may be undefined on /analytics

  const workspaceName = workspaceId
    ? decodeURIComponent(workspaceId.replace(/-/g, ' '))
    : null;

  // Load tasks directly from localStorage (no KanbanProvider needed here)
  const tasks = useMemo(() => loadTasks(workspaceId), [workspaceId]);

  const {
    summary,
    completionRate,
    priorityData,
    columnData,
    trendData,
    weekData,
    assigneeData,
  } = useProductivityMetrics(tasks);

  const isLoading = false; // data is synchronous from localStorage

  // ── Back navigation ────────────────────────────────────────────────────────
  const handleBack = () => {
    if (workspaceId) {
      history.push(`/workspace/${workspaceId}/board`);
    } else {
      history.push('/dashboard');
    }
  };

  return (
    <div className="prod-dashboard">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="prod-dashboard__header">
        <div className="prod-dashboard__header-left">
          <button
            className="prod-dashboard__back"
            onClick={handleBack}
            type="button"
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <h1 className="prod-dashboard__title">
              <span aria-hidden="true">📊</span>{' '}
              {workspaceName ? `${workspaceName} — Analytics` : 'Analytics'}
            </h1>
            <p className="prod-dashboard__subtitle">
              {workspaceName
                ? `Productivity insights for ${workspaceName}`
                : 'Productivity insights across all workspaces'}
            </p>
          </div>
        </div>

        <div className="prod-dashboard__badge">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* ── AI Insights CTA banner ───────────────────────────────── */}
      <div className="prod-dashboard__ai-banner">
        <div className="prod-dashboard__ai-banner-left">
          <span className="prod-dashboard__ai-banner-icon" aria-hidden="true">🤖</span>
          <div>
            <span className="prod-dashboard__ai-banner-title">AI Insights available</span>
            <span className="prod-dashboard__ai-banner-sub">
              Burnout risk, focus score, workload balance, priority predictions &amp; project risk
            </span>
          </div>
        </div>
        <Link
          to={workspaceId ? `/workspace/${workspaceId}/ai-insights` : '/ai-insights'}
          className="prod-dashboard__ai-banner-btn"
        >
          View AI Insights →
        </Link>
      </div>

      {/* ── Summary metric cards ─────────────────────────────────── */}
      <section
        className="prod-dashboard__metrics"
        aria-label="Summary metrics"
      >
        <MetricCard
          title="Total Tasks"
          value={summary.total}
          icon="📋"
          color="#6366f1"
          bg="#e0e7ff"
          loading={isLoading}
        />
        <MetricCard
          title="Completed"
          value={summary.completed}
          icon="✅"
          color="#10b981"
          bg="#d1fae5"
          loading={isLoading}
        />
        <MetricCard
          title="Pending"
          value={summary.pending}
          icon="⏳"
          color="#f59e0b"
          bg="#fef3c7"
          loading={isLoading}
        />
        <MetricCard
          title="Overdue"
          value={summary.overdue}
          icon="🔴"
          color="#ef4444"
          bg="#fee2e2"
          loading={isLoading}
        />
        <MetricCard
          title="In Progress"
          value={summary.inProgress}
          icon="🔄"
          color="#f97316"
          bg="#fff7ed"
          loading={isLoading}
        />
        <MetricCard
          title="Completion Rate"
          value={completionRate}
          suffix="%"
          icon="🎯"
          color="#8b5cf6"
          bg="#ede9fe"
          loading={isLoading}
        />
      </section>

      {/* ── Charts grid ──────────────────────────────────────────── */}
      <section className="prod-dashboard__charts" aria-label="Analytics charts">

        {/* Row 1 — Trend (wide) */}
        <ProductivityTrendChart data={trendData} loading={isLoading} />

        {/* Row 2 — Completion ring + Weekly bar */}
        <CompletionRingChart
          rate={completionRate}
          completed={summary.completed}
          total={summary.total}
          loading={isLoading}
        />
        <WeeklyBarChart data={weekData} loading={isLoading} />

        {/* Row 3 — Priority pie + Column bar */}
        <PriorityBreakdownChart data={priorityData} loading={isLoading} />
        <ColumnDistributionChart data={columnData} loading={isLoading} />

        {/* Row 4 — Assignee (wide) + Overdue list */}
        <AssigneeChart data={assigneeData} loading={isLoading} />
        <OverdueSummary tasks={tasks} loading={isLoading} />

      </section>
    </div>
  );
}

export default ProductivityDashboard;
