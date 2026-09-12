import React, { useState } from 'react';
import OutcomeMap from '../components/OutcomeMap';
import CorridorOverviewCard from '../components/CorridorOverviewCard';
import WhatIfSimulator from '../components/WhatIfSimulator';
import RouteOptimizer from '../components/RouteOptimizer';

export default function FleetManagerWorkspace({ corridors, selectedCorridorId, onSelectCorridor, activeCorridor }) {
  const [routeRequest, setRouteRequest] = useState(null);
  const [routeData, setRouteData] = useState(null);

  return (
    <main className="dashboard-layout engineer-workspace">
      <OutcomeMap
        corridors={corridors}
        selectedCorridorId={selectedCorridorId}
        onSelectCorridor={onSelectCorridor}
        routeRequest={routeRequest}
        onRouteCalculated={setRouteData}
      />
      <aside className="panel panel-analytics">
        <div className="workspace-badge" style={{ marginBottom: '1rem', color: 'var(--brand-primary)', fontWeight: 'bold' }}>
          <i className="fa-solid fa-truck-fast"></i> Fleet Manager Workspace
        </div>
        <CorridorOverviewCard corridor={activeCorridor} />
        <div className="tab-content-wrapper">
          <RouteOptimizer onRouteOptimize={setRouteRequest} routeData={routeData} />
          <WhatIfSimulator segmentId={selectedCorridorId} />
        </div>
      </aside>
    </main>
  );
}
