import React from 'react';

export default function Header({ persona, onPersonaChange, latency }) {
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

      {/* User Persona Archetype Switcher */}
      <div className="persona-selector-container">
        <label htmlFor="persona-select">
          <i className="fa-solid fa-user-shield"></i> Persona:
        </label>
        <select
          id="persona-select"
          className="persona-dropdown"
          value={persona}
          onChange={(e) => onPersonaChange(e.target.value)}
        >
          <option value="engineer">Municipal Traffic Engineer (Geoman &amp; Boundaries)</option>
          <option value="authority">State Road Authority (SHAP &amp; Budget Justification)</option>
          <option value="fleet">Fleet Driver (Passive CV &amp; Edge Alerts)</option>
        </select>
      </div>
    </header>
  );
}
