import React from 'react';
import AIInsightCard from '../AIInsightCard';
import './SmartPriorityPanel.css';

const PRIORITY_COLOR = {
  Low:      '#10b981',
  Medium:   '#f59e0b',
  High:     '#ef4444',
  Critical: '#7c3aed',
};

const UP_ICON   = '⬆️';
const DOWN_ICON = '⬇️';

/**
 * SmartPriorityPanel — lists tasks whose AI-predicted priority differs
 * from the current assigned priority.
 *
 * Props:
 *   predictions {Array<{ id, title, column, assignee, prediction: { score, recommended, current } }>}
 */
function SmartPriorityPanel({ predictions = [] }) {
  const hasData = predictions.length > 0;

  const PRIORITY_ORDER = { Low: 1, Medium: 2, High: 3, Critical: 4 };

  return (
    <AIInsightCard
      title="Smart Priority Prediction"
      icon="🧠"
      level={hasData ? 'Medium' : 'Low'}
      badge={hasData ? `${predictions.length} suggestion${predictions.length !== 1 ? 's' : ''}` : 'All Good'}
    >
      {!hasData ? (
        <div className="spp__empty">
          <span aria-hidden="true">✅</span>
          <span>All task priorities look correct!</span>
        </div>
      ) : (
        <ul className="spp__list" aria-label="Priority suggestions">
          {predictions.map((task) => {
            const { recommended, current, score } = task.prediction;
            const isUpgrade =
              PRIORITY_ORDER[recommended] > PRIORITY_ORDER[current];
            const arrow = isUpgrade ? UP_ICON : DOWN_ICON;

            return (
              <li key={task.id} className="spp__item">
                <div className="spp__item-top">
                  <span className="spp__task-title" title={task.title}>
                    {task.title}
                  </span>
                  <span className="spp__score">score {score}</span>
                </div>

                <div className="spp__item-bottom">
                  {/* Current priority */}
                  <span
                    className="spp__priority-chip"
                    style={{
                      color: PRIORITY_COLOR[current],
                      background: `${PRIORITY_COLOR[current]}18`,
                    }}
                  >
                    {current}
                  </span>

                  <span className="spp__arrow" aria-hidden="true">{arrow}</span>

                  {/* Recommended priority */}
                  <span
                    className="spp__priority-chip spp__priority-chip--recommended"
                    style={{
                      color: PRIORITY_COLOR[recommended],
                      background: `${PRIORITY_COLOR[recommended]}22`,
                      borderColor: PRIORITY_COLOR[recommended],
                    }}
                  >
                    {recommended}
                  </span>

                  {task.assignee && (
                    <span className="spp__assignee">
                      <span className="spp__avatar" aria-hidden="true">
                        {task.assignee.charAt(0).toUpperCase()}
                      </span>
                      {task.assignee}
                    </span>
                  )}

                  <span className="spp__column">{task.column}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AIInsightCard>
  );
}

export default SmartPriorityPanel;
