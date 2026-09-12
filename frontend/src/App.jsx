import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import LiveTicker from './components/LiveTicker';
import OutcomeMap from './components/OutcomeMap';
import CorridorOverviewCard from './components/CorridorOverviewCard';
import OutcomeTabs from './components/OutcomeTabs';
import ShapPanel from './components/ShapPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import SeasonForecaster from './components/SeasonForecaster';
import PrescriptiveInterventions from './components/PrescriptiveInterventions';
import ClosedLoopCVModal from './components/ClosedLoopCVModal';
import { fetchCorridors } from './services/api';

const TICKER_MESSAGES = [
  "NH-48 KM 44.5 (Bilaspur Chowk): Severe pothole cluster detected by dashcam CV | Concessionaire dispatched <500ms",
  "Mumbai-Pune Expressway (Bhor Ghat): Wet weather friction degradation active | Advisory 50 km/h displayed on VMS",
  "Bengaluru Outer Ring Road (Silk Board): Traffic surge 14,200 PCU/hr | Adaptive signal timing actuated",
  "Delhi-Meerut Expressway (KM 18): High-intensity LED road studs audited under IRC:SP:88-2019",
  "Closed-Loop CV Auto-Verifier: Siamese baseline verification active on 14 highway maintenance tickets"
];

export default function App() {
  const [corridors, setCorridors] = useState([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState('NH48-SEG-01');
  const [activeTab, setActiveTab] = useState('tab-shap');
  const [persona, setPersona] = useState('engineer');
  const [latency, setLatency] = useState(28);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerText, setTickerText] = useState(TICKER_MESSAGES[0]);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  // Fetch initial corridors
  useEffect(() => {
    fetchCorridors()
      .then((data) => {
        setCorridors(data);
        if (data.length > 0) {
          const defaultCorr = data.find((c) => c.id === 'NH48-SEG-01') || data[0];
          setSelectedCorridorId(defaultCorr.id);
        }
      })
      .catch((err) => {
        console.error('Failed to load corridors:', err);
      });
  }, []);

  // Telemetry jitter & ticker rotation
  useEffect(() => {
    const timer = setInterval(() => {
      const jitter = Math.floor(Math.random() * 16) + 21;
      setLatency(jitter);

      setTickerIndex((prev) => {
        const next = (prev + 1) % TICKER_MESSAGES.length;
        setTickerText(TICKER_MESSAGES[next]);
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona);
    if (newPersona === 'engineer') {
      setActiveTab('tab-counterfactual');
      setTickerText('[Persona Active: Municipal Traffic Engineer] Prioritizing Geoman zoning & What-If engineering interventions.');
    } else if (newPersona === 'authority') {
      setActiveTab('tab-shap');
      setTickerText('[Persona Active: State Road Authority] Emphasizing causal TreeSHAP justifications & CRIF budget allocations.');
    } else if (newPersona === 'fleet') {
      setTickerText('[Persona Active: Fleet Driver / Auditor] Dashcam telemetry passive inference active.');
      setIsCVModalOpen(true);
    }
  };

  const activeCorridor = corridors.find((c) => c.id === selectedCorridorId);
  const corridorPrefix = selectedCorridorId ? selectedCorridorId.split('-')[0] : 'NH48';

  return (
    <div className="dark-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        persona={persona}
        onPersonaChange={handlePersonaChange}
        latency={latency}
      />

      <LiveTicker
        tickerText={tickerText}
        onOpenCVStudio={() => setIsCVModalOpen(true)}
      />

      <main className="dashboard-layout">
        {/* Outcome 1: Map Panel */}
        <OutcomeMap
          corridors={corridors}
          selectedCorridorId={selectedCorridorId}
          onSelectCorridor={setSelectedCorridorId}
        />

        {/* Analytics & Deep Dive Panel */}
        <aside className="panel panel-analytics">
          <CorridorOverviewCard corridor={activeCorridor} />

          <OutcomeTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="tab-content-wrapper">
            {activeTab === 'tab-shap' && (
              <ShapPanel segmentId={selectedCorridorId} />
            )}
            {activeTab === 'tab-counterfactual' && (
              <WhatIfSimulator segmentId={selectedCorridorId} />
            )}
            {activeTab === 'tab-forecaster' && (
              <SeasonForecaster corridorId={corridorPrefix} />
            )}
            {activeTab === 'tab-prescriptive' && (
              <PrescriptiveInterventions segmentId={selectedCorridorId} />
            )}
          </div>
        </aside>
      </main>

      {/* Secret Sauce Modal */}
      <ClosedLoopCVModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
      />
    </div>
  );
}
