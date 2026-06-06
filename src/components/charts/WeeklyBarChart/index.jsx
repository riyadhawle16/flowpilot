import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import './WeeklyBarChart.css';

/**
 * WeeklyBarChart — tasks completed per weekday (last 7 days).
 *
 * Props:
 *   data    {Array<{ day, completed, fill }>}
 *   loading {boolean}
 */
function WeeklyBarChart({ data = [], loading = false }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <span className="chart-tooltip__label">{label}</span>
          <span className="chart-tooltip__value">
            {payload[0].value} completed
          </span>
        </div>
      );
    }
    return null;
  };

  const isEmpty = !data.length || data.every((d) => d.completed === 0);

  return (
    <div className="chart-card" role="figure" aria-label="Weekly completions">
      <div className="chart-card__header">
        <h3 className="chart-card__title">Weekly Completions</h3>
        <span className="chart-card__subtitle">Last 7 days</span>
      </div>

      {loading ? (
        <div className="chart-card__skeleton" aria-hidden="true" />
      ) : isEmpty ? (
        <div className="chart-card__empty">No tasks completed this week</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default WeeklyBarChart;
