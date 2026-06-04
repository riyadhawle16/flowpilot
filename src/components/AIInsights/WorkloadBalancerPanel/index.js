import React from 'react';
import AIInsightCard, { ScoreGauge, RiskBar } from '../AIInsightCard';
import './WorkloadBalancerPanel.css';

const getLevel = (score) =>
  score >= 80 ? 'Low' :
  score >= 55 ? 'Medium' : 'High';

const getColor = (score) =>
  score >= 80 ? '#10b981' :
  score >= 55 ? '#f59e0b' : '#ef4444';

/**
 * WorkloadBalancerPanel — shows balance score + per-assignee task counts.
 *
 * Props:
 *   workloadBalance {
 *     score, label, recommendation,
 *     entries: [{ assignee, activeTasks, weightedLoad }]
 *   }
 */
function WorkloadBalancerPanel({ workloadBalance }) {
  const {
    score = 100,
    label = '',
    recommendation = '',
    entries = [],
  } = workloadBalance || {};

  const color = getColor(score);
  const level = getLevel(score);

  const maxTasks = entries.length > 0
    ? Math.max(...entries.map((e) => e.activeTasks), 1)
    : 1;

  return (
    <AIInsightCard
      title="Workload Balancer"
      icon="⚖️"
      level={level}
      badge={label}
    >
      {entries.length === 0 ? (
        <div className="wbp__empty">No active tasks assigned yet.</div>
      ) : (
        <>
          {/* Score gauge + label */}
          <div className="wbp__top">
            <div className="wbp__gauge-wrap" aria-label={`Balance score: ${score}`}>
              <ScoreGauge score={score} color={color} size={76} />
              <span className="wbp__gauge-label">Balance</span>
            </div>

            <ul className="wbp__bars" aria-label="Tasks per assignee">
              {entries.map((e) => (
                <li key={e.assignee} className="wbp__bar-item">
                  <div className="wbp__bar-row">
                    <span className="wbp__bar-name" title={e.assignee}>
                      {e.assignee}
                    </span>
                    <span className="wbp__bar-count">
                      {e.activeTasks} task{e.activeTasks !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <RiskBar
                    value={e.activeTasks}
                    max={maxTasks}
                    color={
                      e.activeTasks === maxTasks && maxTasks > 1
                        ? '#f59e0b'
                        : '#6366f1'
                    }
                    height={7}
                  />
                </li>
              ))}
            </ul>
          </div>

          {recommendation && (
            <p className="wbp__recommendation">
              💡 {recommendation}
            </p>
          )}
        </>
      )}
    </AIInsightCard>
  );
}

export default WorkloadBalancerPanel;
