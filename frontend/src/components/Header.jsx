import React from 'react';

export default function Header({
  persona,
  onPersonaChange,
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
        <div className="pill pill-ibm" id="watson-pill">
          <i className="fa-solid fa-microchip"></i> Watson ML: Deployed
        </div>
        <div className="pill pill-cloud" id="cos-pill">
          <i className="fa-solid fa-database"></i> IBM COS: Connected
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

        {/* User Persona Archetype Switcher */}
        <div className="persona-selector-container">
          <label htmlFor="persona-select">
            <i className="fa-solid fa-user-gear"></i> Persona:
          </label>
          <select
            id="persona-select"
            className="persona-dropdown"
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value)}
          >
            <option value="engineer">Municipal Traffic Engineer</option>
            <option value="authority">State Road Authority</option>
            <option value="fleet">Fleet Driver / Auditor</option>
          </select>
        </div>

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
