/**
 * Outcome 3: SHAP Explainable AI (XAI) Panel
 * Fetches and displays coordinate-specific local feature importance
 * calculated via exact XGBoost TreeSHAP (pred_contribs=True).
 */

window.RoadSafeSHAP = (function () {
  async function loadSHAP(segmentId) {
    const listContainer = document.getElementById('shap-feature-list');
    const baseValElem = document.getElementById('shap-base-val');
    const summaryElem = document.getElementById('shap-summary-text');

    if (!listContainer) return;

    listContainer.innerHTML = `
      <div class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i> Computing exact TreeSHAP marginal contributions...
      </div>
    `;

    try {
      const res = await fetch(`/api/shap/${segmentId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (baseValElem) {
        baseValElem.innerText = data.base_value.toFixed(1);
      }

      if (summaryElem) {
        summaryElem.innerHTML = data.executive_summary;
      }

      renderFeatures(data.features, listContainer);
    } catch (err) {
      console.error('Failed to load SHAP analysis:', err);
      listContainer.innerHTML = `
        <div class="error-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          Failed to fetch TreeSHAP attribution: ${err.message}
        </div>
      `;
    }
  }

  function renderFeatures(features, container) {
    container.innerHTML = '';

    // Find maximum absolute SHAP value to scale progress bars
    const maxAbs = Math.max(...features.map(f => Math.abs(f.shap_value)), 1.0);

    features.forEach(f => {
      const isRiskIncreasing = f.shap_value >= 0;
      const pct = Math.min((Math.abs(f.shap_value) / maxAbs) * 100, 100);
      const sign = isRiskIncreasing ? '+' : '';
      const colorClass = isRiskIncreasing ? 'danger' : 'success';
      const badgeIcon = isRiskIncreasing ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

      const item = document.createElement('div');
      item.className = `shap-feature-item ${colorClass}`;
      item.innerHTML = `
        <div class="feature-info">
          <div class="feature-name-row">
            <span class="feature-title">${escapeHtml(f.feature_label)}</span>
            <span class="feature-ref-badge" title="Official Indian Road Standard">${escapeHtml(f.guideline_ref)}</span>
          </div>
          <div class="feature-meta">
            <span>Observed Value: <strong>${f.feature_value.toFixed(1)}</strong></span>
            <span class="impact-tag ${colorClass}">
              <i class="fa-solid ${badgeIcon}"></i> ${f.directional_impact}
            </span>
          </div>
        </div>
        <div class="feature-bar-col">
          <div class="shap-bar-track">
            <div class="shap-bar-fill ${colorClass}" style="width: ${pct}%"></div>
          </div>
          <span class="shap-score-val ${colorClass}">${sign}${f.shap_value.toFixed(2)} pts</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  return {
    loadSHAP
  };
})();
