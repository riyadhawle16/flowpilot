import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// ── Contexts ──────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth }  from './context/AuthContext';
import { ThemeProvider }          from './context/ThemeContext';
import { ToastProvider }          from './context/ToastContext';
import { SidebarProvider }        from './context/SidebarContext';

// ── Components ────────────────────────────────────────────────────────────────
import Sidebar          from './components/Sidebar';
import Navbar           from './components/Navbar';
import ErrorBoundary    from './components/ErrorBoundary';
import OnboardingTour   from './components/onboarding/OnboardingTour';

// ── Pages ─────────────────────────────────────────────────────────────────────
import LoginPage             from './components/Login';
import SignupPage            from './components/Signup';
import DashboardPage         from './components/Dashboard';
import KanbanPage            from './components/KanbanPage';
import ProductivityDashboard from './components/ProductivityDashboard';
import AIInsightsDashboard   from './components/AIInsights/AIInsightsDashboard';
import NotFoundPage          from './components/NotFound';

import './App.css';

// ─── Loading fallback ─────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="app-loading" aria-label="Loading page">
      <div className="app-loading__spinner" aria-hidden="true" />
    </div>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────

function ProtectedRoute({ component: Component, ...rest }) {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) {
          return (
            <Redirect
              to={{ pathname: '/login', state: { from: props.location } }}
            />
          );
        }
        return (
          <ErrorBoundary key={props.location.pathname}>
            <Component {...props} />
          </ErrorBoundary>
        );
      }}
    />
  );
}

// ─── Public Route ─────────────────────────────────────────────────────────────

function PublicRoute({ component: Component, ...rest }) {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => {
        if (user) return <Redirect to="/dashboard" />;
        return <Component {...props} />;
      }}
    />
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { user, isLoading } = useAuth();

  // Show full-page spinner during session rehydration to avoid black flash
  if (isLoading) return <PageLoader />;

  return (
    <div className="app-shell">
      {/* Top Navbar — always visible */}
      <Navbar />

      {/* Onboarding tour — auto-shows once for new users */}
      {user && <OnboardingTour />}

      <div className="app-body">
        {/* Sidebar — authenticated users only */}
        {user && <Sidebar />}

        <main className="app-main" id="main-content" aria-label="Main content">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Switch>
                {/* Root redirect */}
                <Route exact path="/">
                  <Redirect to="/dashboard" />
                </Route>

                {/* Public routes */}
                <PublicRoute exact path="/login"  component={LoginPage} />
                <PublicRoute exact path="/signup" component={SignupPage} />

                {/* Protected routes — most specific first */}
                <ProtectedRoute exact path="/dashboard"
                  component={DashboardPage} />

                <ProtectedRoute exact path="/workspace/:workspaceId/board"
                  component={KanbanPage} />

                <ProtectedRoute exact path="/workspace/:workspaceId/analytics"
                  component={ProductivityDashboard} />

                <ProtectedRoute exact path="/workspace/:workspaceId/ai-insights"
                  component={AIInsightsDashboard} />

                <ProtectedRoute exact path="/analytics"
                  component={ProductivityDashboard} />

                <ProtectedRoute exact path="/ai-insights"
                  component={AIInsightsDashboard} />

                {/* 404 */}
                <Route component={NotFoundPage} />
              </Switch>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// ─── Root App — provider order: Theme → Toast → Router → Auth → Sidebar ───────

export default function App() {
  // Wake up backend on first load (Vite: import.meta.env, silent no-op if no URL)
  useEffect(() => {
    try {
      const apiUrl =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
      if (apiUrl) fetch(`${apiUrl}/health`).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <SidebarProvider>
              <AppShell />
            </SidebarProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}
