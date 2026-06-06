import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1 className="not-found__code" aria-label="404 Error">404</h1>
      <h2 className="not-found__title">Page not found</h2>
      <p className="not-found__text">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard" className="not-found__link">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
