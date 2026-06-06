import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './ProductivityTrendChart.css';

/**
 * ProductivityTrendChart — 14-day area chart showing tasks created vs completed.
 *
 * Props:
 *   data    {Array<{ fullLabel, completed, created }>}
 *   loading {boolean}
 */
function ProductivityTrendChart({ data = [], loading = false }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <div className="chart-tooltip__label">{label}</div>
          {payload.map((p) => (
            <div key={p.name} className="chart-tooltip__row">
              <span
                className="chart-tooltip__dot"
                style={{ background: p.color }}
              />
              <span className="chart-tooltip__key">{p.name}:</span>
              <span className="chart-tooltip__value">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const isEmpty = !data.length || data.every((d) => d.completed === 0 && d.created === 0);

  return (
    <div className="chart-card chart-card--wide" role="figure" aria-label="14-day productivity trend">
      <div className="chart-card__header">
        <h3 className="chart-card__title">Productivity Trend</h3>
        <span className="chart-card__subtitle">Last 14 days</span>
      </div>

      {loading ? (
        <div className="chart-card__skeleton chart-card__skeleton--tall" aria-hidden="true" />
      ) : isEmpty ? (
        <div className="chart-card__empty">No activity in the last 14 days</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="fullLabel"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={28}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ fontSize: '0.78rem', paddingTop: '0.5rem' }}
              iconType="circle"
              iconSize={8}
            />

            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#gradCompleted)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1' }}
            />
            <Area
              type="monotone"
              dataKey="created"
              name="Created"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradCreated)"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ProductivityTrendChart;
