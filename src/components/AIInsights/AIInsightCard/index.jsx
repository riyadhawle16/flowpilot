import React from 'react';
import './AIInsightCard.css';

const LEVEL_META = {
  Low:      { color: '#10b981', bg: '#d1fae5', label: 'Low' },
  Medium:   { color: '#f59e0b', bg: '#fef3c7', label: 'Medium' },
  High:     { color: '#ef4444', bg: '#fee2e2', label: 'High' },
  Critical: { color: '#7c3aed', bg: '#ede9fe', label: 'Critical' },
};

/**
 * ScoreGauge — animated radial arc showing a 0–100 score.
 */
export function ScoreGauge({ score, color, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="score-gauge"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={8}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      {/* Score label */}
      <text
        x={size / 2} y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size > 70 ? 16 : 13}
        fontWeight={700}
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

/**
 * RiskBar — horizontal bar with coloured fill.
 */
export function RiskBar({ value, max = 100, color, height = 8 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="risk-bar" style={{ height }}>
      <div
        className="risk-bar__fill"
        style={{ width: `${pct}%`, background: color, height }}
      />
    </div>
  );
}

/**
 * SignalDot — coloured status dot for risk signals.
 */
export function SignalDot({ severity }) {
  const colors = { ok: '#10b981', warn: '#f59e0b', danger: '#ef4444' };
  return (
    <span
      className="signal-dot"
      style={{ background: colors[severity] || '#9ca3af' }}
      aria-label={severity}
    />
  );
}

/**
 * AIInsightCard — wrapper card for all AI insight panels.
 *
 * Props:
 *   title    {string}
 *   icon     {string}   emoji
 *   level    {string}   'Low'|'Medium'|'High'|'Critical' — drives badge color
 *   badge    {string}   label text for the badge (defaults to level)
 *   children {ReactNode}
 */
function AIInsightCard({ title, icon, level, badge, children }) {
  const meta = LEVEL_META[level] || LEVEL_META.Low;

  return (
    <div className="ai-card" role="region" aria-label={title}>
      <div className="ai-card__header">
        <div className="ai-card__title-group">
          <span className="ai-card__icon" aria-hidden="true">{icon}</span>
          <h3 className="ai-card__title">{title}</h3>
        </div>
        {level && (
          <span
            className="ai-card__badge"
            style={{ color: meta.color, background: meta.bg }}
          >
            {badge || meta.label}
          </span>
        )}
      </div>
      <div className="ai-card__body">{children}</div>
    </div>
  );
}

export default AIInsightCard;
