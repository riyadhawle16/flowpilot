import React from 'react';
import './TaskCardSkeleton.css';

/**
 * Shimmer skeleton displayed while tasks are loading.
 */
function TaskCardSkeleton() {
  return (
    <div className="task-skeleton" aria-hidden="true">
      <div className="task-skeleton__stripe" />
      <div className="task-skeleton__body">
        <div className="task-skeleton__line task-skeleton__line--title" />
        <div className="task-skeleton__line task-skeleton__line--desc" />
        <div className="task-skeleton__footer">
          <div className="task-skeleton__chip" />
          <div className="task-skeleton__chip task-skeleton__chip--sm" />
        </div>
      </div>
    </div>
  );
}

export default TaskCardSkeleton;
