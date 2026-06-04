import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AssigneeChart.css';

/**
 * AssigneeChart — stacked bar showing done vs pending per assignee.
 *
 * Props:
 *   data    {Array<{ name, done, pending, rate }>}
 *   loading {boolean}
 */
function AssigneeChart({ data = [], loading = false }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = (payload[0]?.value || 0) + (payload[1]?.value || 0);
      return (
        <div className="chart-tooltip">
          <div className="chart-tooltip__label">{label}</div>
          {payload.map((p) => (
            <div key={p.name} className="chart-tooltip__row">
              <span className="chart-tooltip__dot" style={{ background: p.fill }} />
              <span className="chart-tooltip__key">{p.name}:</span>
              <span className="chart-tooltip__value">{p.value}</span>
            </div>
          ))}
          <div className="chart-tooltip__row chart-tooltip__row--total">
            <span className="chart-tooltip__key">Total:</span>
            <span className="chart-tooltip__value">{total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card chart-card--wide" role="figure" aria-label="Tasks by assignee">
      <div className="chart-card__header">
        <h3 className="chart-card__title">Tasks by Assignee</h3>
        <span className="chart-card__subtitle">Done vs Pending</span>
      </div>

      {loading ? (
        <div className="chart-card__skeleton chart-card__skeleton--tall" aria-hidden="true" />
      ) : data.length === 0 ? (
        <div className="chart-card__empty">No assignees yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={data.length > 4 ? -25 : 0}
              textAnchor={data.length > 4 ? 'end' : 'middle'}
              height={data.length > 4 ? 44 : 24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '0.78rem' }}
            />
            <Bar dataKey="done"    name="Done"    stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pending" name="Pending" stackId="a" fill="#e0e7ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default AssigneeChart;
