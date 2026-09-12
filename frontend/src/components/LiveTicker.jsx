import React from 'react';

export default function LiveTicker({ tickerText, onOpenCVStudio }) {
  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <i className="fa-solid fa-triangle-exclamation"></i> LIVE TELEMETRY
      </div>
      <div className="ticker-text" id="ticker-content">
        {tickerText}
      </div>
      <div className="ticker-actions">
        <button className="btn-sm btn-ghost" id="open-cv-studio-btn" onClick={onOpenCVStudio}>
          <i className="fa-solid fa-camera-retro"></i> Open CV Audit Studio
        </button>
      </div>
    </div>
  );
}
