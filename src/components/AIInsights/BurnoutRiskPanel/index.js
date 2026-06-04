import React from 'react';
import AIInsightCard, { RiskBar } from '../AIInsightCard';
import './BurnoutRiskPanel.css';

const LEVEL_COLOR = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

/**
 * BurnoutRiskPanel — per-assignee burnout risk scores.
 *
 * Props:
 *   riskData {Array<{ assignee, risk, level, pending, overdue, critical }>}
 */
function BurnoutRiskPanel({ riskData = [] }) {
  const topLevel =
    riskData.find((r) => r.level === 'High')
      ? 'High'
      : riskData.find((r) => r.level === 'Medium')
      ? 'Medium'
      : 'Low';

  return (
    <AIInsightCard title="Burnout Risk Indicator" icon="🔥" level={topLevel}>
      {riskData.length === 0 ? (
        <div className="brp__empty">No assignees to analyse.</div>
      ) : (
        <ul className="brp__list" aria-label="Burnout risk by assignee">
          {riskData.map((item) => {
            const color = LEVEL_COLOR[item.level] || '#6b7280';
            return (
              <li key={item.assignee} className="brp__item">
                <div className="brp__item-top">
                  <div className="brp__person">
                    <span
                      className="brp__avatar"
                      style={{ background: color }}
                      aria-hidden="true"
                    >
                      {item.assignee.charAt(0).toUpperCase()}
                    </span>
                    <span className="brp__name" title={item.assignee}>
                      {item.assignee}
                    </span>
                  </div>
                  <div className="brp__right">
                    <span
                      className="brp__level"
                      style={{ color, background: `${color}18` }}
                    >
                      {item.level}
                    </span>
                    <span className="brp__score-num" style={{ color }}>
                      {item.risk}
                    </span>
                  </div>
                </div>

                <RiskBar value={item.risk} color={color} height={6} />

                <div className="brp__stats">
                  <span>{item.pending} active</span>
                  {item.overdue > 0 && (
                    <span className="brp__stat--danger">
                      {item.overdue} overdue
                    </span>
                  )}
                  {item.critical > 0 && (
                    <span className="brp__stat--critical">
                      {item.critical} critical
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AIInsightCard>
  );
}

export default BurnoutRiskPanel;
