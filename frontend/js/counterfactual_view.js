/**
 * Outcome 6: Counterfactual What-If Simulator
 * Evaluates hypothetical safety upgrades using exact XGBoost tree traversal.
 * Zero hardcoded reductions: real model weights dictate the outcome.
 */

window.RoadSafeCounterfactual = (function () {
  let activeSegmentId = 'NH48-SEG-01';
  let debounceTimeout = null;

  function initCounterfactual() {
    // Setup slider listeners
    setupSlider('slider-lighting', 'val-lighting', (v) => `+${v}%`);
    setupSlider('slider-surface', 'val-surface', (v) => `+${v}%`);
    setupSlider('slider-signage', 'val-signage', (v) => `+${v} Units`);
    setupSlider('slider-speed', 'val-speed', (v) => `-${v} km/h`);
  }

  function setupSlider(sliderId, labelId, formatFn) {
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    if (!slider || !label) return;

    slider.addEventListener('input', () => {
      label.innerText = formatFn(slider.value);
      triggerSimulationDebounced();
    });
  }

  function setSegment(segmentId) {
    activeSegmentId = segmentId;
    triggerSimulation();
  }

  function triggerSimulationDebounced() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      triggerSimulation();
    }, 150);
  }

  async function triggerSimulation() {
    const lightingVal = parseFloat(document.getElementById('slider-lighting')?.value || 0);
    const surfaceVal = parseFloat(document.getElementById('slider-surface')?.value || 0);
    const signageVal = parseFloat(document.getElementById('slider-signage')?.value || 0);
    const speedVal = parseFloat(document.getElementById('slider-speed')?.value || 0);

    const payload = {
      segment_id: activeSegmentId,
      lighting_delta_pct: lightingVal,
      surface_quality_delta_pct: surfaceVal,
      signage_density_delta: signageVal,
      speed_calming_kmh: speedVal
    };

    try {
      const res = await fetch('/api/counterfactual/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      updateUI(data);
    } catch (err) {
      console.error('Counterfactual simulation error:', err);
    }
  }

  function updateUI(data) {
    const baseScoreElem = document.getElementById('sim-base-score');
    const projScoreElem = document.getElementById('sim-proj-score');
    const redPctElem = document.getElementById('sim-reduction-pct');
    const impactTierElem = document.getElementById('sim-impact-tier');
    const capexElem = document.getElementById('sim-capex');
    const livesElem = document.getElementById('sim-lives');
    const proofElem = document.getElementById('sim-verification-proof');

    if (baseScoreElem) baseScoreElem.innerText = data.baseline_risk_score.toFixed(1);
    if (projScoreElem) {
      projScoreElem.innerText = data.projected_risk_score.toFixed(1);
      if (data.projected_risk_score < data.baseline_risk_score) {
        projScoreElem.className = 'score-num text-success';
      } else {
        projScoreElem.className = 'score-num text-warning';
      }
    }

    if (redPctElem) {
      const sign = data.percentage_reduction >= 0 ? '-' : '+';
      redPctElem.innerText = `${sign}${Math.abs(data.percentage_reduction).toFixed(1)}%`;
      redPctElem.className = data.percentage_reduction > 0 ? 'delta-badge success' : 'delta-badge';
    }

    if (impactTierElem) {
      impactTierElem.innerText = `${data.impact_tier} Impact`;
    }

    if (capexElem) {
      capexElem.innerText = `₹ ${data.estimated_capex_lakhs_inr.toFixed(1)} Lakhs`;
    }

    if (livesElem) {
      livesElem.innerText = `${Math.round(data.projected_lives_saved_3yr)} Lives`;
    }

    if (proofElem) {
      proofElem.innerText = data.model_weight_verification;
    }
  }

  return {
    initCounterfactual,
    setSegment,
    triggerSimulation
  };
})();
