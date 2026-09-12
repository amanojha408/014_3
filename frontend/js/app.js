/**
 * Main Application Orchestrator for RoadSafe India 360
 * Integrates all 6 functional outcomes, persona switching, and telemetry streams.
 */

window.RoadSafeApp = (function () {
  let allCorridors = [];
  let currentSegmentId = null;

  async function init() {
    console.log('Initializing RoadSafe India 360...');

    // Initialize sub-modules
    RoadSafeMap.initMap();
    RoadSafeCV.initCVStudio();
    RoadSafeCounterfactual.initCounterfactual();

    setupTabNavigation();
    setupPersonaSelector();
    setupLiveTelemetrySimulation();

    // Fetch corridor network
    try {
      const res = await fetch('/api/corridors');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      allCorridors = await res.json();

      RoadSafeMap.renderCorridors(allCorridors);

      // Select default high-risk corridor (Bilaspur Chowk or highest risk)
      const defaultCorridor = allCorridors.find(c => c.id === 'NH48-SEG-01') || allCorridors[0];
      if (defaultCorridor) {
        selectCorridor(defaultCorridor.id);
      }
    } catch (err) {
      console.error('Failed to initialize corridor data:', err);
    }
  }

  function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.outcome-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-content-wrapper .tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');

        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetTabId);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  function setupPersonaSelector() {
    const selector = document.getElementById('persona-select');
    if (!selector) return;

    selector.addEventListener('change', (e) => {
      const persona = e.target.value;
      handlePersonaChange(persona);
    });
  }

  function handlePersonaChange(persona) {
    console.log(`Switched user persona to: ${persona}`);
    const tabButtons = document.querySelectorAll('.outcome-tabs .tab-btn');

    if (persona === 'engineer') {
      // Focus on Outcome 1 (Map) and Outcome 6 (Simulator)
      activateTab('tab-counterfactual');
      showNotification('Persona Active: Municipal Traffic Engineer', 'Prioritizing Geoman zoning & What-If engineering interventions.');
    } else if (persona === 'authority') {
      // Focus on Outcome 3 (SHAP) and Outcome 5 (MoRTH CapEx)
      activateTab('tab-shap');
      showNotification('Persona Active: State Road Authority', 'Emphasizing causal TreeSHAP justifications & CRIF budget allocations.');
    } else if (persona === 'fleet') {
      // Focus on CV hazard alerting
      showNotification('Persona Active: Fleet Driver / Road Safety Auditor', 'Dashcam telemetry passive inference active.');
      const cvModal = document.getElementById('cv-modal');
      if (cvModal) cvModal.classList.remove('hidden');
    }
  }

  function activateTab(tabId) {
    const tabButtons = document.querySelectorAll('.outcome-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-content-wrapper .tab-pane');

    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }

  function selectCorridor(segmentId) {
    currentSegmentId = segmentId;
    const corridor = allCorridors.find(c => c.id === segmentId);
    if (!corridor) return;

    // Update Header Card
    const badge = document.getElementById('active-corridor-badge');
    const title = document.getElementById('active-location-title');
    const desc = document.getElementById('active-corridor-desc');
    const scoreVal = document.getElementById('active-risk-score');
    const tierTag = document.getElementById('active-risk-tier');
    const trueRiskNote = document.getElementById('true-risk-note');
    const gaugeCircle = document.getElementById('risk-gauge-circle');

    if (badge) badge.innerText = corridor.corridor_name;
    if (title) title.innerText = corridor.location_name;
    if (desc) desc.innerText = `Chainage KM ${corridor.chainage_km} | State: ${corridor.state} | ${corridor.lanes}-Lane Highway`;

    const score = corridor.risk_score || corridor.raw_risk_score || 50;
    if (scoreVal) scoreVal.innerText = score.toFixed(1);

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

    if (tierTag) {
      tierTag.innerText = tierText;
      tierTag.style.background = `${tierColor}20`;
      tierTag.style.color = tierColor;
      tierTag.style.borderColor = `${tierColor}60`;
    }

    if (gaugeCircle) {
      gaugeCircle.style.borderColor = tierColor;
      gaugeCircle.style.boxShadow = `0 0 20px ${tierColor}33`;
    }

    if (trueRiskNote) {
      const pcu = corridor.traffic_density_pcu || 5000;
      const trueRatio = (score / (pcu / 4000)).toFixed(2);
      trueRiskNote.innerText = `True Risk Ratio: ${trueRatio}x (Traffic Normalized)`;
    }

    // Load tabs content
    RoadSafeSHAP.loadSHAP(segmentId);
    RoadSafeCounterfactual.setSegment(segmentId);
    
    // Forecaster uses corridor grouping prefix (e.g. NH48)
    const corridorId = segmentId.split('-')[0];
    RoadSafeForecaster.loadForecast(corridorId);

    RoadSafePrescriptive.loadPrescriptive(segmentId);

    // Pan map to location
    RoadSafeMap.panToSegment(corridor.latitude, corridor.longitude);
  }

  function setupLiveTelemetrySimulation() {
    const latencyElem = document.getElementById('telemetry-latency');
    const tickerElem = document.getElementById('ticker-content');

    const tickerItems = [
      "NH-48 KM 44.5 (Bilaspur Chowk): Severe pothole cluster detected by dashcam CV | Concessionaire dispatched <500ms",
      "Mumbai-Pune Expressway (Bhor Ghat): Wet weather friction degradation active | Advisory 50 km/h displayed on VMS",
      "Bengaluru Outer Ring Road (Silk Board): Traffic surge 14,200 PCU/hr | Adaptive signal timing actuated",
      "Delhi-Meerut Expressway (KM 18): High-intensity LED road studs audited under IRC:SP:88-2019",
      "Closed-Loop CV Auto-Verifier: Siamese baseline verification active on 14 highway maintenance tickets"
    ];

    let tickerIdx = 0;
    setInterval(() => {
      // Simulate slight realistic latency jitter (21ms - 36ms)
      if (latencyElem) {
        const jitter = Math.floor(Math.random() * 16) + 21;
        latencyElem.innerText = `${jitter}ms`;
      }

      // Cycle ticker
      if (tickerElem) {
        tickerIdx = (tickerIdx + 1) % tickerItems.length;
        tickerElem.innerText = tickerItems[tickerIdx];
      }
    }, 5000);
  }

  function showNotification(title, message) {
    const ticker = document.getElementById('ticker-content');
    if (ticker) {
      ticker.innerHTML = `<strong style="color: #38bdf8;">[${title}]</strong> ${message}`;
    }
  }

  function getAllCorridors() {
    return allCorridors;
  }

  // Bootstrapping when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    selectCorridor,
    getAllCorridors
  };
})();
