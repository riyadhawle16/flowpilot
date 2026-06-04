import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './PriorityBreakdownChart.css';

/**
 * PriorityBreakdownChart — pie chart of task priority distribution.
 *
 * Props:
 *   data    {Array<{ name, value, fill }>}
 *   loading {boolean}
 */
function PriorityBreakdownChart({ data = [], loading = false }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className="chart-tooltip">
          <span className="chart-tooltip__dot" style={{ background: d.payload.fill }} />
          <span className="chart-tooltip__label">{d.name}:</span>
          <span className="chart-tooltip__value">{d.value} task{d.value !== 1 ? 's' : ''}</span>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null; // skip tiny slices
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700}>
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div className="chart-card" role="figure" aria-label="Priority breakdown">
      <h3 className="chart-card__title">Priority Breakdown</h3>

      {loading ? (
        <div className="chart-card__skeleton" aria-hidden="true" />
      ) : data.length === 0 ? (
        <div className="chart-card__empty">No tasks yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              outerRadius="72%"
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.78rem' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default PriorityBreakdownChart;
