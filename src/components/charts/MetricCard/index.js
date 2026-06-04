import React from 'react';
import './MetricCard.css';

/**
 * MetricCard — single KPI summary tile.
 *
 * Props:
 *   title   {string}
 *   value   {number|string}
 *   icon    {string}  emoji icon
 *   color   {string}  CSS color for the accent bar
 *   bg      {string}  background tint
 *   trend   {number}  optional % change (positive = up, negative = down)
 *   suffix  {string}  e.g. "%" appended after value
 *   loading {boolean}
 */
function MetricCard({ title, value, icon, color, bg, trend, suffix = '', loading = false }) {
  const trendUp   = trend > 0;
  const trendDown = trend < 0;

  return (
    <div
      className="metric-card"
      style={{ '--card-color': color, '--card-bg': bg || `${color}14` }}
      role="figure"
      aria-label={`${title}: ${value}${suffix}`}
    >
      <div className="metric-card__accent" aria-hidden="true" />

      {loading ? (
        <div className="metric-card__skeleton" aria-hidden="true">
          <div className="metric-card__sk-icon" />
          <div className="metric-card__sk-line metric-card__sk-line--title" />
          <div className="metric-card__sk-line metric-card__sk-line--value" />
        </div>
      ) : (
        <>
          <div className="metric-card__top">
            <span
              className="metric-card__icon"
              aria-hidden="true"
              style={{ background: bg || `${color}20` }}
            >
              {icon}
            </span>
            {trend !== undefined && trend !== null && (
              <span
                className={`metric-card__trend ${
                  trendUp ? 'metric-card__trend--up' : trendDown ? 'metric-card__trend--down' : ''
                }`}
                aria-label={`${Math.abs(trend)}% ${trendUp ? 'increase' : trendDown ? 'decrease' : 'unchanged'}`}
              >
                {trendUp ? '↑' : trendDown ? '↓' : '→'}
                {Math.abs(trend)}%
              </span>
            )}
          </div>

          <div className="metric-card__value" aria-live="polite">
            {value}
            {suffix && <span className="metric-card__suffix">{suffix}</span>}
          </div>

          <div className="metric-card__title">{title}</div>
        </>
      )}
    </div>
  );
}

export default MetricCard;
