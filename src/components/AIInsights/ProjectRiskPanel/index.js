import React from 'react';
import AIInsightCard, { RiskBar, SignalDot } from '../AIInsightCard';
import './ProjectRiskPanel.css';

const RISK_COLOR = {
  Low:      '#10b981',
  Medium:   '#f59e0b',
  High:     '#ef4444',
  Critical: '#7c3aed',
};

/**
 * ProjectRiskPanel — overall project risk meter with signal breakdown.
 *
 * Props:
 *   projectRisk { score, level, signals: [{ label, score, severity, detail }] }
 */
function ProjectRiskPanel({ projectRisk }) {
  const { score = 0, level = 'Low', signals = [] } = projectRisk || {};
  const color = RISK_COLOR[level] || '#10b981';

  return (
    <AIInsightCard title="Project Risk Meter" icon="🚦" level={level}>
      {/* Overall risk score bar */}
      <div className="prp__overall">
        <div className="prp__score-row">
          <span className="prp__score-label">Overall Risk</span>
          <span className="prp__score-num" style={{ color }}>{score}</span>
          <span
            className="prp__level-badge"
            style={{ color, background: `${color}18` }}
          >
            {level}
          </span>
        </div>
        <RiskBar value={score} color={color} height={10} />
      </div>

      {/* Signal breakdown */}
      {signals.length > 0 && (
        <ul className="prp__signals" aria-label="Risk signals">
          {signals.map((sig) => (
            <li key={sig.label} className="prp__signal">
              <div className="prp__signal-top">
                <SignalDot severity={sig.severity} />
                <span className="prp__signal-label">{sig.label}</span>
                <span className="prp__signal-score">{Math.round(sig.score)}</span>
              </div>
              <p className="prp__signal-detail">{sig.detail}</p>
              <RiskBar
                value={sig.score}
                max={40}
                color={
                  sig.severity === 'danger' ? '#ef4444' :
                  sig.severity === 'warn'   ? '#f59e0b' : '#10b981'
                }
                height={4}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Advice line */}
      <p className="prp__advice">
        {level === 'Low'      && '✅ Project health looks good. Keep monitoring.'}
        {level === 'Medium'   && '⚠️ Some risks detected. Address overdue tasks soon.'}
        {level === 'High'     && '🚨 High risk! Prioritise overdue and critical tasks now.'}
        {level === 'Critical' && '🔴 Critical risk! Immediate action required.'}
      </p>
    </AIInsightCard>
  );
}

export default ProjectRiskPanel;
