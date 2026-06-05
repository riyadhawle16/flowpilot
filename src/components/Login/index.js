import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errs = {};
  if (!values.email.trim()) errs.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email)) errs.email = 'Enter a valid email';
  if (!values.password) errs.password = 'Password is required';
  else if (values.password.length < 6) errs.password = 'At least 6 characters';
  return errs;
}

export default function LoginPage() {
  const { login, clearError, isLoading } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [values, setValues]   = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => { clearError(); }, []); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((p) => ({ ...p, [name]: value }));
    setErrors((p) => { const n = {...p}; delete n[name]; return n; });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await login(values.email, values.password);
      history.replace(from);
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span aria-hidden="true">✈️</span> FlowPilot AI
        </div>
        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__sub">Sign in to your account</p>

        {apiError && (
          <div className="auth-card__error" role="alert">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email" name="email" type="email"
              className={`auth-input ${errors.email ? 'auth-input--err' : ''}`}
              value={values.email} onChange={handleChange}
              placeholder="you@example.com"
              aria-required="true"
              aria-describedby={errors.email ? 'email-err' : undefined}
            />
            {errors.email && <span id="email-err" className="auth-field-err" role="alert">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password" name="password" type="password"
              className={`auth-input ${errors.password ? 'auth-input--err' : ''}`}
              value={values.password} onChange={handleChange}
              placeholder="••••••"
              aria-required="true"
              aria-describedby={errors.password ? 'pw-err' : undefined}
            />
            {errors.password && <span id="pw-err" className="auth-field-err" role="alert">{errors.password}</span>}
          </div>

          <button className="auth-btn" type="submit" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? <span className="auth-spinner" aria-hidden="true" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
