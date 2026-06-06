import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTheme } from '../../context/ThemeContext';

const TOUR_KEY = 'flowpilot_tour_seen';

const steps = [
  {
    target: 'body',
    placement: 'center',
    title: '👋 Welcome to FlowPilot AI!',
    content:
      "You're all set! Let us show you around so you can get the most out of the app. This will only take a minute.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar"]',
    title: '🧭 Sidebar Navigation',
    content:
      'Use the sidebar to navigate between your Dashboard, Analytics, and AI Insights. You can also switch between workspaces here.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="workspaces"]',
    title: '📁 Your Workspaces',
    content:
      'Workspaces are your projects. Each workspace has its own Kanban board to manage tasks. Click on any workspace to open its board.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="analytics"]',
    title: '📊 Analytics',
    content:
      'The Analytics page shows your productivity stats — total tasks, completion rate, overdue items, and a productivity trend chart over the last 14 days.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="ai-insights"]',
    title: '🤖 AI Insights',
    content:
      'This is the most powerful feature! AI Insights analyzes your workload and gives you burnout risk scores, focus recommendations, priority predictions, and project risk assessments.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: '🌙 Light / Dark Mode',
    content:
      'Toggle between light and dark mode using this button at the bottom of the sidebar — whatever feels comfortable for you.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="user-profile"]',
    placement: 'top',
    title: "🎉 You're Ready!",
    content:
      "That's everything! Your profile is here at the bottom. Start by opening a workspace and adding some tasks. Good luck! 🚀",
    disableBeacon: true,
  },
];

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      // Small delay so the DOM is fully rendered before Joyride scans targets
      const t = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleCallback = ({ status }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem(TOUR_KEY, 'true');
      setRun(false);
    }
  };

  const tooltipBg   = isDark ? '#1a1a2e' : '#ffffff';
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a';
  const arrowColor  = isDark ? '#1a1a2e' : '#ffffff';

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#6366f1',
          backgroundColor: tooltipBg,
          textColor: tooltipText,
          arrowColor: arrowColor,
          overlayColor: 'rgba(0, 0, 0, 0.55)',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          borderRadius: '8px',
          padding: '8px 18px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
        },
        buttonBack: {
          color: '#94a3b8',
          fontSize: '13px',
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: '13px',
        },
        buttonClose: {
          color: tooltipText,
        },
        tooltip: {
          borderRadius: '12px',
          fontSize: '14px',
          padding: '20px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '8px',
          color: tooltipText,
        },
        tooltipContent: {
          color: isDark ? '#94a3b8' : '#475569',
          lineHeight: 1.6,
        },
        spotlight: {
          borderRadius: '10px',
        },
      }}
    />
  );
}
