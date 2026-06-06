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
import './ColumnDistributionChart.css';

/**
 * ColumnDistributionChart — horizontal bar chart of tasks per column.
 *
 * Props:
 *   data    {Array<{ name, value, fill }>}
 *   loading {boolean}
 */
function ColumnDistributionChart({ data = [], loading = false }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <span className="chart-tooltip__label">{label}</span>
          <span className="chart-tooltip__value">
            {payload[0].value} task{payload[0].value !== 1 ? 's' : ''}
          </span>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chart-card" role="figure" aria-label="Tasks by column">
      <div className="chart-card__header">
        <h3 className="chart-card__title">Tasks by Status</h3>
        <span className="chart-card__subtitle">{total} total</span>
      </div>

      {loading ? (
        <div className="chart-card__skeleton" aria-hidden="true" />
      ) : total === 0 ? (
        <div className="chart-card__empty">No tasks yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
            barSize={18}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
              width={78}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
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

export default ColumnDistributionChart;
