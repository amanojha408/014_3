/**
 * Secret Sauce: Closed-Loop Computer Vision (CV) Verification Studio
 * Simulates edge dashcam hazard detection, concessionaire dispatch,
 * and PyTorch Siamese Neural Network baseline verification.
 */

window.RoadSafeCV = (function () {
  let activeCandidate = 'rejected'; // 'rejected' or 'verified'

  const CANDIDATE_CONFIG = {
    rejected: {
      imageId: 'rejected_cosmetic_patch.jpg',
      badgeText: 'Deficient Patch',
      badgeClass: 'badge-eval danger'
    },
    verified: {
      imageId: 'verified_resurfaced_road.jpg',
      badgeText: 'MoRTH Hot-Mix Overlay',
      badgeClass: 'badge-eval success'
    }
  };

  function initCVStudio() {
    const openBtn = document.getElementById('open-cv-studio-btn');
    const closeBtn = document.getElementById('close-cv-modal');
    const modal = document.getElementById('cv-modal');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    // Candidate switches
    const btnRejected = document.getElementById('btn-pick-rejected');
    const btnVerified = document.getElementById('btn-pick-verified');

    if (btnRejected) {
      btnRejected.addEventListener('click', () => {
        setCandidateMode('rejected');
      });
    }

    if (btnVerified) {
      btnVerified.addEventListener('click', () => {
        setCandidateMode('verified');
      });
    }

    // Run verification button
    const runBtn = document.getElementById('btn-run-siamese-eval');
    if (runBtn) {
      runBtn.addEventListener('click', runSiameseVerification);
    }
  }

  function setCandidateMode(mode) {
    activeCandidate = mode;
    const btnRejected = document.getElementById('btn-pick-rejected');
    const btnVerified = document.getElementById('btn-pick-verified');
    const candImg = document.getElementById('cv-img-candidate');
    const candBadge = document.getElementById('candidate-badge');

    if (mode === 'rejected') {
      if (btnRejected) btnRejected.classList.add('active');
      if (btnVerified) btnVerified.classList.remove('active');
    } else {
      if (btnVerified) btnVerified.classList.add('active');
      if (btnRejected) btnRejected.classList.remove('active');
    }

    const cfg = CANDIDATE_CONFIG[mode];
    if (candImg) {
      candImg.src = `/api/cv/image/${cfg.imageId}`;
    }
    if (candBadge) {
      candBadge.innerText = cfg.badgeText;
      candBadge.className = `img-badge ${cfg.badgeClass}`;
    }

    // Reset verdict panel
    resetVerdictUI();
  }

  function resetVerdictUI() {
    const badge = document.getElementById('cv-verdict-badge');
    const bar = document.getElementById('siamese-sim-bar');
    const simVal = document.getElementById('siamese-sim-val');
    const latVal = document.getElementById('cv-latency-val');
    const verdictText = document.getElementById('cv-verdict-text');

    if (badge) {
      badge.innerText = 'AUDIT PENDING';
      badge.className = 'verdict-tag pending';
    }
    if (bar) bar.style.width = '0%';
    if (simVal) simVal.innerText = '--';
    if (latVal) latVal.innerText = '-- ms';
    if (verdictText) {
      verdictText.innerText = "Click 'Run Siamese Network Verification' to execute deep feature baseline matching.";
    }
  }

  async function runSiameseVerification() {
    const runBtn = document.getElementById('btn-run-siamese-eval');
    const verdictBadge = document.getElementById('cv-verdict-badge');
    const simBar = document.getElementById('siamese-sim-bar');
    const simVal = document.getElementById('siamese-sim-val');
    const latVal = document.getElementById('cv-latency-val');
    const cosUri = document.getElementById('cv-cos-uri');
    const verdictText = document.getElementById('cv-verdict-text');

    if (runBtn) {
      runBtn.disabled = true;
      runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Running PyTorch Siamese Inference...`;
    }

    const payload = {
      ticket_id: 'TKT-2026-NH48-44',
      hazard_type: 'Severe Pothole Cluster & Edge Cracking',
      segment_id: 'NH48-SEG-01',
      baseline_image_id: 'baseline_safe_road.jpg',
      repaired_image_id: CANDIDATE_CONFIG[activeCandidate].imageId,
      contractor_id: 'CONTR-LNT-01'
    };

    try {
      const res = await fetch('/api/cv/verify-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      const isPassed = data.status === 'VERIFIED_CLOSED';
      const simPct = Math.round(data.siamese_similarity_score * 100);

      if (verdictBadge) {
        verdictBadge.innerText = isPassed ? 'REPAIR VERIFIED CLOSED' : 'REPAIR REJECTED (DEFICIENT)';
        verdictBadge.className = isPassed ? 'verdict-tag success' : 'verdict-tag danger';
      }

      if (simBar) {
        simBar.style.width = `${simPct}%`;
        simBar.className = isPassed ? 'progress-fill success' : 'progress-fill danger';
      }

      if (simVal) {
        simVal.innerText = `${data.siamese_similarity_score.toFixed(4)}`;
        simVal.className = isPassed ? 'text-success' : 'text-danger';
      }

      if (latVal) {
        latVal.innerText = `${data.latency_ms.toFixed(1)} ms`;
      }

      if (cosUri) {
        cosUri.innerText = `IBM COS: ${data.ticket_id}.json`;
      }

      if (verdictText) {
        verdictText.innerHTML = `
          <strong>Autonomous Audit Gate Verdict:</strong> ${escapeHtml(data.audit_verdict)}
          <br/><span style="font-size: 0.8rem; color: #94a3b8;">Feature Distance: ${data.siamese_feature_distance.toFixed(4)} | Threshold: &ge; ${data.threshold} | IBM Watson Model: ${data.watson_model_id}</span>
        `;
      }
    } catch (err) {
      console.error('CV verification failed:', err);
      if (verdictText) {
        verdictText.innerHTML = `<span class="text-danger">Verification failed: ${err.message}</span>`;
      }
    } finally {
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.innerHTML = `<i class="fa-solid fa-play"></i> Run Siamese Network Verification`;
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  return {
    initCVStudio,
    setCandidateMode,
    runSiameseVerification
  };
})();
