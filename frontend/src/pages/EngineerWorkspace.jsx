import React from 'react';
import OutcomeMap from '../components/OutcomeMap';
import CorridorOverviewCard from '../components/CorridorOverviewCard';
import WhatIfSimulator from '../components/WhatIfSimulator';

export default function EngineerWorkspace({ corridors, selectedCorridorId, onSelectCorridor, activeCorridor }) {
  return (
    <main className="dashboard-layout engineer-workspace">
      <OutcomeMap
        corridors={corridors}
        selectedCorridorId={selectedCorridorId}
        onSelectCorridor={onSelectCorridor}
      />
      <aside className="panel panel-analytics">
        <div className="workspace-badge" style={{ marginBottom: '1rem', color: 'var(--brand-primary)', fontWeight: 'bold' }}>
          <i className="fa-solid fa-compass-drafting"></i> Municipal Engineer Workspace
        </div>
        <CorridorOverviewCard corridor={activeCorridor} />
        <div className="tab-content-wrapper">
          <WhatIfSimulator segmentId={selectedCorridorId} />
        </div>
      </aside>
    </main>
  );
}
