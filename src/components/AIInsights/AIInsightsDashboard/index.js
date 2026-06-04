import React, { useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useAIInsights } from '../../../hooks/useAIInsights';
import SmartPriorityPanel from '../SmartPriorityPanel';
import BurnoutRiskPanel from '../BurnoutRiskPanel';
import FocusScorePanel from '../FocusScorePanel';
import WorkloadBalancerPanel from '../WorkloadBalancerPanel';
import ProjectRiskPanel from '../ProjectRiskPanel';
import './AIInsightsDashboard.css';

// ─── Load tasks from localStorage (same pattern as ProductivityDashboard) ─────
function loadTasks(workspaceId) {
  try {
    const raw = localStorage.getItem('flowpilot_kanban_tasks');
    const all = raw ? JSON.parse(raw) : [];
    const source = workspaceId
      ? all.filter((t) => t.workspaceId === workspaceId)
      : all;
    return source.map((t) => ({ labels: [], attachments: [], ...t }));
  } catch {
    return [];
  }
}

/**
 * AIInsightsDashboard — Phase 6 page.
 *
 * Routes:
 *   /ai-insights                          → global (all workspaces)
 *   /workspace/:workspaceId/ai-insights   → workspace-scoped
 */
function AIInsightsDashboard() {
  const history = useHistory();
  const { workspaceId } = useParams();

  const workspaceName = workspaceId
    ? decodeURIComponent(workspaceId.replace(/-/g, ' '))
    : null;

  const tasks = useMemo(() => loadTasks(workspaceId), [workspaceId]);

  const {
    priorityPredictions,
    burnoutRisk,
    focusScore,
    workloadBalance,
    projectRisk,
  } = useAIInsights(tasks);

  const handleBack = () => {
    if (workspaceId) {
      history.push(`/workspace/${workspaceId}/analytics`);
    } else {
      history.push('/analytics');
    }
  };

  return (
    <div className="ai-dash">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="ai-dash__header">
        <div className="ai-dash__header-left">
          <button
            className="ai-dash__back"
            onClick={handleBack}
            type="button"
            aria-label="Go back"
          >
            ←
          </button>
          <div>
            <h1 className="ai-dash__title">
              <span aria-hidden="true">🤖</span>{' '}
              {workspaceName ? `${workspaceName} — AI Insights` : 'AI Insights'}
            </h1>
            <p className="ai-dash__subtitle">
              Local AI-powered analysis of your task data — no external APIs
            </p>
          </div>
        </div>
        <div className="ai-dash__badge">
          <span aria-hidden="true">⚡</span>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} analysed
        </div>
      </div>

      {/* ── No data state ─────────────────────────────────────────── */}
      {tasks.length === 0 && (
        <div className="ai-dash__empty">
          <div className="ai-dash__empty-icon" aria-hidden="true">🤖</div>
          <h2 className="ai-dash__empty-title">No data to analyse yet</h2>
          <p className="ai-dash__empty-text">
            Create tasks in your{' '}
            {workspaceId ? (
              <button
                className="ai-dash__empty-link"
                onClick={() => history.push(`/workspace/${workspaceId}/board`)}
                type="button"
              >
                Kanban board
              </button>
            ) : 'workspaces'}{' '}
            and come back to see AI-powered insights.
          </p>
        </div>
      )}

      {/* ── Insights grid ─────────────────────────────────────────── */}
      {tasks.length > 0 && (
        <div className="ai-dash__grid">
          {/* Feature 3 — Focus Score (top left, small) */}
          <div className="ai-dash__cell ai-dash__cell--focus">
            <FocusScorePanel focusScore={focusScore} />
          </div>

          {/* Feature 5 — Project Risk Meter (top right, small) */}
          <div className="ai-dash__cell ai-dash__cell--risk">
            <ProjectRiskPanel projectRisk={projectRisk} />
          </div>

          {/* Feature 4 — Workload Balancer (middle, wide) */}
          <div className="ai-dash__cell ai-dash__cell--workload">
            <WorkloadBalancerPanel workloadBalance={workloadBalance} />
          </div>

          {/* Feature 2 — Burnout Risk (middle right) */}
          <div className="ai-dash__cell ai-dash__cell--burnout">
            <BurnoutRiskPanel riskData={burnoutRisk} />
          </div>

          {/* Feature 1 — Smart Priority Prediction (bottom, full width) */}
          <div className="ai-dash__cell ai-dash__cell--priority">
            <SmartPriorityPanel predictions={priorityPredictions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AIInsightsDashboard;
