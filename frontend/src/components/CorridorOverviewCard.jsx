import React from 'react';

export default function CorridorOverviewCard({ corridor }) {
  if (!corridor) return null;

  const score = corridor.risk_score || corridor.raw_risk_score || 50;

  let tierColor = '#10b981';
  let tierText = 'Low Risk Corridor';
  if (score >= 70) {
    tierColor = '#ef4444';
    tierText = 'Critical Blackspot';
  } else if (score >= 50) {
    tierColor = '#f59e0b';
    tierText = 'High Hazard Zone';
  } else if (score >= 30) {
    tierColor = '#38bdf8';
    tierText = 'Moderate Risk';
  }

  const pcu = corridor.traffic_density_pcu || 5000;
  const trueRatio = (score / (pcu / 4000)).toFixed(2);

  return (
    <div className="corridor-header-card">
      <div className="corridor-meta">
        <span className="badge-corridor" id="active-corridor-badge">
          {corridor.corridor_name}
        </span>
        <h2 id="active-location-title">{corridor.location_name}</h2>
        <p id="active-corridor-desc">
          Chainage KM {corridor.chainage_km} | State: {corridor.state} | {corridor.lanes}-Lane Highway
        </p>
      </div>

      <div className="risk-meter-container">
        <div
          className="risk-circle"
          id="risk-gauge-circle"
          style={{
            borderColor: tierColor,
            boxShadow: `0 0 20px ${tierColor}33`
          }}
        >
          <span className="risk-score-value" id="active-risk-score">
            {score.toFixed(1)}
          </span>
          <span className="risk-score-unit">/100</span>
        </div>
        <div
          className="risk-tier-tag"
          id="active-risk-tier"
          style={{
            background: `${tierColor}20`,
            color: tierColor,
            borderColor: `${tierColor}60`
          }}
        >
          {tierText}
        </div>
        <div className="true-risk-note" id="true-risk-note">
          True Risk Ratio: {trueRatio}x (Traffic Normalized)
        </div>
      </div>
    </div>
  );
}
