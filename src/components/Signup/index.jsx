import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css';
import './Signup.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Name is required';
  else if (v.name.trim().length < 2) e.name = 'At least 2 characters';
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email';
  if (!v.password) e.password = 'Password is required';
  else if (v.password.length < 6) e.password = 'At least 6 characters';
  if (!v.confirm) e.confirm = 'Please confirm your password';
  else if (v.confirm !== v.password) e.confirm = 'Passwords do not match';
  return e;
}

export default function SignupPage() {
  const { signup, clearError, authBusy } = useAuth();
  const history = useHistory();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
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
      await signup(values.name, values.email, values.password);
      history.replace('/dashboard');
    } catch (err) {
      setApiError(err.message);
    }
  };

  const field = (id, label, type = 'text', ph = '') => (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>
      <input
        id={id} name={id} type={type}
        className={`auth-input ${errors[id] ? 'auth-input--err' : ''}`}
        value={values[id]} onChange={handleChange}
        placeholder={ph}
        aria-required="true"
        aria-describedby={errors[id] ? `${id}-err` : undefined}
      />
      {errors[id] && <span id={`${id}-err`} className="auth-field-err" role="alert">{errors[id]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand"><span aria-hidden="true">✈️</span> FlowPilot AI</div>
        <h1 className="auth-card__title">Create an account</h1>
        <p className="auth-card__sub">Get started for free</p>
        {apiError && <div className="auth-card__error" role="alert">{apiError}</div>}
        <form onSubmit={handleSubmit} noValidate>
          {field('name', 'Full Name', 'text', 'Jane Doe')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', '••••••')}
          {field('confirm', 'Confirm Password', 'password', '••••••')}
          <button className="auth-btn" type="submit" disabled={authBusy} aria-busy={authBusy}>
            {authBusy
              ? <><span className="auth-spinner" aria-hidden="true" /> Creating…</>
              : 'Create Account'}
          </button>
        </form>
        <p className="auth-card__footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
