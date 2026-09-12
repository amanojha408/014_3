import React from 'react';

export default function Header({
  activeWorkspace,
  onChangeWorkspace,
  latency,
  user,
  onOpenAuthModal,
  onSignOut,
  onToggleGuide
}) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <i className="fa-solid fa-road-barrier"></i>
        </div>
        <div>
          <div className="brand-title">
            RoadSafe India 360 <span className="badge-flag">🇮🇳</span>
          </div>
          <div className="brand-subtitle">
            Continuous Road Safety Intelligence &amp; Digital Twin
          </div>
        </div>
      </div>

      {/* System Status & Cloud Connectors */}
      <div className="system-pills">
        <div className="pill pill-live" title="Real-time telemetry stream active">
          <span className="live-dot"></span> Digital Twin: Active
        </div>
        <div className="pill pill-latency">
          <i className="fa-solid fa-bolt"></i> Latency: <span>{latency}ms</span>
        </div>
      </div>

      {/* User Persona & Authentication Action Area */}
      <div className="header-actions-area">
        {/* Quick Guide Toggle */}
        <button
          type="button"
          className="btn-header-tool"
          onClick={onToggleGuide}
          title="Toggle How to Use Step-by-Step Guide"
        >
          <i className="fa-solid fa-compass"></i> Guide
        </button>

        {/* Authenticated Role Portal Indicator */}
        {user && (
          <div className="active-portal-badge">
            <i className={
              activeWorkspace === 'engineer'
                ? 'fa-solid fa-compass-drafting'
                : activeWorkspace === 'auditor'
                ? 'fa-solid fa-camera-retro'
                : 'fa-solid fa-building-columns'
            }></i>
            <span>
              {activeWorkspace === 'engineer'
                ? 'Municipal Engineer Portal'
                : activeWorkspace === 'auditor'
                ? 'CV Safety Auditor Portal'
                : 'State Authority Executive Portal'}
            </span>
          </div>
        )}

        {/* Supabase Authentication Status Pill */}
        {user ? (
          <div className="user-profile-pill" title={`Signed in as ${user.email}`}>
            <div className="user-avatar-circle">
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="user-text-info">
              <span className="user-display-name">{user.full_name || user.email.split('@')[0]}</span>
              <span className="user-role-badge">{user.role || 'Authority'}</span>
            </div>
            <button
              type="button"
              className="btn-signout-mini"
              onClick={onSignOut}
              title="Sign Out"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-auth-trigger"
            onClick={onOpenAuthModal}
          >
            <i className="fa-solid fa-lock"></i> Sign In / Demo Login
          </button>
        )}
      </div>
    </header>
  );
}
