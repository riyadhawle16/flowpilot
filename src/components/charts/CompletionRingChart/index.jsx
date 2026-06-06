import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './CompletionRingChart.css';

/**
 * CompletionRingChart — donut chart showing completion rate.
 *
 * Props:
 *   rate      {number}  0–100 (percentage)
 *   completed {number}
 *   total     {number}
 *   loading   {boolean}
 */
function CompletionRingChart({ rate = 0, completed = 0, total = 0, loading = false }) {
  const data = [
    { name: 'Completed', value: rate,       fill: '#6366f1' },
    { name: 'Remaining', value: 100 - rate, fill: '#e0e7ff' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className="chart-tooltip">
          <span className="chart-tooltip__label">{d.name}</span>
          <span className="chart-tooltip__value">{d.value}%</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card" role="figure" aria-label={`Completion rate: ${rate}%`}>
      <h3 className="chart-card__title">Completion Rate</h3>

      {loading ? (
        <div className="chart-card__skeleton" aria-hidden="true" />
      ) : total === 0 ? (
        <div className="chart-card__empty">No tasks yet</div>
      ) : (
        <div className="completion-ring">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="82%"
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre label */}
          <div className="completion-ring__centre" aria-hidden="true">
            <span className="completion-ring__rate">{rate}%</span>
            <span className="completion-ring__sub">complete</span>
          </div>
        </div>
      )}

      <div className="completion-ring__legend">
        <span className="completion-ring__legend-item completion-ring__legend-item--done">
          ✅ {completed} completed
        </span>
        <span className="completion-ring__legend-item">
          ⏳ {total - completed} remaining
        </span>
      </div>
    </div>
  );
}

export default CompletionRingChart;
