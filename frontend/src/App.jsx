import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import GuideDrawer from './components/GuideDrawer';
import LiveTicker from './components/LiveTicker';
import AuthPage from './pages/AuthPage';
import FleetManagerWorkspace from './pages/FleetManagerWorkspace';
import GovernmentWorkspace from './pages/GovernmentWorkspace';
import ConsumerWorkspace from './pages/ConsumerWorkspace';
import { fetchCorridors } from './services/api';
import { getCurrentUserSession, signOutUser } from './services/supabase';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState('authority'); // 'authority', 'engineer', 'auditor'

  // Initialize Supabase session
  useEffect(() => {
    getCurrentUserSession().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        if (sessionUser.role) {
          const role = sessionUser.role.toLowerCase();
          if (role.includes('fleet manager')) setActiveWorkspace('engineer');
          else if (role.includes('consumer')) setActiveWorkspace('auditor');
          else setActiveWorkspace('authority');
        }
      }
    });
  }, []);

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

  const handleLogin = (newUser, targetWorkspace) => {
    setUser(newUser);
    setActiveWorkspace(targetWorkspace || 'authority');
    // Set appropriate ticker text based on login
    if (targetWorkspace === 'engineer') {
      setTickerText('[Logistics Partner] Dashboard Loaded. Connecting to CV Edge Feeds...');
    } else if (targetWorkspace === 'auditor') {
      setTickerText('[Consumer Feedback] Secret Sauce active. Siamese baseline verifications pending.');
    } else {
      setTickerText('[Government Official] Dashboard Loaded. Syncing CRIF Budgets...');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const handleFitMap = () => {
    // Reset to overview
    const btnFit = document.getElementById('btn-fit-corridors');
    if (btnFit) btnFit.click();
  };

  const activeCorridor = corridors.find((c) => c.id === selectedCorridorId);
  const corridorPrefix = selectedCorridorId ? selectedCorridorId.split('-')[0] : 'NH48';

  // Render Auth Page if no user is logged in
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Top Header with Supabase Auth & Workspaces */}
      <Header
        activeWorkspace={activeWorkspace}
        onChangeWorkspace={setActiveWorkspace}
        latency={latency}
        user={user}
        onOpenAuthModal={() => {}} // No longer needed since AuthPage handles it
        onSignOut={handleSignOut}
        onToggleGuide={() => setIsGuideVisible(true)}
      />

      {/* Live Dashcam Alert Ticker */}
      <LiveTicker
        tickerText={tickerText}
        onOpenCVStudio={() => setActiveWorkspace('auditor')}
      />

      {/* Slide-out Guide Drawer */}
      <GuideDrawer
        isOpen={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
        onSelectTab={(tabId) => {
          // Map tabs to workspaces for guide compatibility
          if (tabId === 'tab-counterfactual') setActiveWorkspace('engineer');
          if (tabId === 'tab-shap' || tabId === 'tab-prescriptive' || tabId === 'tab-forecaster') setActiveWorkspace('authority');
        }}
        onFitMap={handleFitMap}
      />

      {/* Dynamic Role-Based Workspace Routing */}
      {activeWorkspace === 'engineer' && (
        <FleetManagerWorkspace
          corridors={corridors}
          selectedCorridorId={selectedCorridorId}
          onSelectCorridor={setSelectedCorridorId}
          activeCorridor={activeCorridor}
        />
      )}

      {activeWorkspace === 'authority' && (
        <GovernmentWorkspace 
          corridors={corridors}
          selectedCorridorId={selectedCorridorId} 
          onSelectCorridor={setSelectedCorridorId}
        />
      )}

      {activeWorkspace === 'auditor' && (
        <ConsumerWorkspace />
      )}
    </div>
  );
}
