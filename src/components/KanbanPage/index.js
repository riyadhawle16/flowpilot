import React, { useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { KanbanProvider, useKanban } from '../../context/KanbanContext';
import KanbanBoard from '../KanbanBoard';
import './KanbanPage.css';

function KanbanPageInner({ workspaceName }) {
  const { moveTask } = useKanban();

  useEffect(() => {
    window.__kanbanTouchDrop = (taskId, column) => {
      moveTask(taskId, column);
    };
    return () => {
      window.__kanbanTouchDrop = null;
    };
  }, [moveTask]);

  return <KanbanBoard workspaceName={workspaceName} />;
}

function KanbanPage() {
  const { workspaceId } = useParams();
  const history = useHistory();

  const workspaceName = workspaceId
    ? decodeURIComponent(workspaceId.replace(/-/g, ' '))
    : 'My Workspace';

  return (
    <div className="kanban-page">
      {/* Top nav: back + breadcrumb + analytics link */}
      <nav className="kanban-page__nav" aria-label="Board navigation">
        <button
          className="kanban-page__back"
          onClick={() => history.push('/dashboard')}
          type="button"
        >
          ← Dashboard
        </button>
        <span className="kanban-page__breadcrumb" aria-current="page">
          {workspaceName}
        </span>
        <Link
          to={`/workspace/${workspaceId}/analytics`}
          className="kanban-page__analytics-link"
          aria-label={`View analytics for ${workspaceName}`}
        >
          📊 Analytics
        </Link>
        <Link
          to={`/workspace/${workspaceId}/ai-insights`}
          className="kanban-page__analytics-link kanban-page__ai-link"
          aria-label={`View AI insights for ${workspaceName}`}
        >
          🤖 AI
        </Link>
      </nav>

      <KanbanProvider workspaceId={workspaceId}>
        <KanbanPageInner workspaceName={workspaceName} />
      </KanbanProvider>
    </div>
  );
}

export default KanbanPage;
