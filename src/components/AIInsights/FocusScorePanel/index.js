import React from 'react';
import AIInsightCard, { ScoreGauge } from '../AIInsightCard';
import './FocusScorePanel.css';

const getColor = (score) =>
  score >= 80 ? '#10b981' :
  score >= 60 ? '#6366f1' :
  score >= 40 ? '#f59e0b' : '#ef4444';

const getLevel = (score) =>
  score >= 80 ? 'Low' :
  score >= 60 ? 'Low' :
  score >= 40 ? 'Medium' : 'High';

/**
 * FocusScorePanel — gauge + breakdown detail rows.
 *
 * Props:
 *   focusScore { score, label, detail: [{ label, value, note }] }
 */
function FocusScorePanel({ focusScore }) {
  const { score = 0, label = '', detail = [] } = focusScore || {};
  const color = getColor(score);
  const level = getLevel(score);

  return (
    <AIInsightCard title="Focus Score" icon="🎯" level={level} badge={label}>
      <div className="fsp__body">
        {/* Gauge */}
        <div className="fsp__gauge-wrap" aria-label={`Focus score: ${score}`}>
          <ScoreGauge score={score} color={color} size={90} />
          <p className="fsp__gauge-label">{label}</p>
        </div>

        {/* Detail rows */}
        {detail.length > 0 && (
          <ul className="fsp__detail" aria-label="Focus breakdown">
            {detail.map((d) => (
              <li key={d.label} className="fsp__detail-row">
                <span className="fsp__detail-label">{d.label}</span>
                <div className="fsp__detail-right">
                  <span className="fsp__detail-value">{d.value}</span>
                  {d.note && (
                    <span
                      className={`fsp__detail-note ${
                        d.note === 'OK' ? 'fsp__detail-note--ok' : 'fsp__detail-note--warn'
                      }`}
                    >
                      {d.note}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="fsp__tip">
        {score >= 80
          ? '✅ Great focus! Keep work-in-progress low.'
          : score >= 60
          ? '👍 Good focus. Limit concurrent tasks to improve.'
          : score >= 40
          ? '⚠️ Try finishing In Progress tasks before starting new ones.'
          : '🚨 Too many tasks in flight. Reduce WIP to regain focus.'}
      </p>
    </AIInsightCard>
  );
}

export default FocusScorePanel;
