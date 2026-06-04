import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary — catches render errors in the subtree and shows
 * a friendly fallback UI instead of a blank crash screen.
 *
 * Props:
 *   children   {ReactNode}
 *   fallback   {ReactNode}  optional custom fallback
 *   onError    {(err, info) => void}  optional callback
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    // In production you'd send to an error tracking service here
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__icon" aria-hidden="true">💥</div>
          <h2 className="error-boundary__title">Something went wrong</h2>
          <p className="error-boundary__message">
            {this.props.message ||
              'An unexpected error occurred. Please try again.'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="error-boundary__detail">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            className="error-boundary__btn"
            onClick={this.handleReset}
            type="button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
