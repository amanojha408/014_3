import React from 'react';
import ShapPanel from '../components/ShapPanel';
import SeasonForecaster from '../components/SeasonForecaster';
import PrescriptiveInterventions from '../components/PrescriptiveInterventions';

export default function AuthorityWorkspace({ selectedCorridorId }) {
  const corridorPrefix = selectedCorridorId ? selectedCorridorId.split('-')[0] : 'NH48';

  return (
    <main className="authority-workspace">
      <div className="workspace-header-bar">
        <div className="authority-title-row">
          <h2>
            <i className="fa-solid fa-building-columns"></i>
            State Road Authority Executive Dashboard
          </h2>
        </div>
        <div className="executive-kpis">
          <div className="kpi-card">
            <div className="kpi-value">1,240 km</div>
            <div className="kpi-label">National Corridors Monitored</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value text-danger">18</div>
            <div className="kpi-label">High-Hazard Segments</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value text-success">412</div>
            <div className="kpi-label">3-Yr Projected Lives Saved</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value text-primary">₹850L</div>
            <div className="kpi-label">Allocated CRIF Budget</div>
          </div>
        </div>
      </div>

      <div className="authority-grid">
        <div className="authority-col-left">
          <ShapPanel segmentId={selectedCorridorId} />
        </div>
        <div className="authority-col-right">
          <PrescriptiveInterventions segmentId={selectedCorridorId} />
          <SeasonForecaster corridorId={corridorPrefix} />
        </div>
      </div>
    </main>
  );
}
