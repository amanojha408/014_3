/**
 * Outcome 5: Prescriptive Safety Interventions Engine View
 * Presents automated decision support mapped directly to MoRTH Specifications & IRC Codes.
 * Provides CapEx estimates in INR (₹ Lakhs), projected risk reduction %, and payback period.
 */

window.RoadSafePrescriptive = (function () {
  async function loadPrescriptive(segmentId) {
    const budgetElem = document.getElementById('presc-total-budget');
    const container = document.getElementById('interventions-container');

    if (budgetElem) budgetElem.innerText = 'Calculating...';
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <i class="fa-solid fa-spinner fa-spin"></i> Mapping MoRTH Section 800 & IRC safety codes...
        </div>
      `;
    }

    try {
      const res = await fetch(`/api/prescriptive/${segmentId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (budgetElem) {
        budgetElem.innerText = `₹ ${data.total_budget_lakhs.toFixed(1)} Lakhs`;
      }

      renderInterventions(data.interventions, container, data.aggregate_risk_reduction_pct);
    } catch (err) {
      console.error('Prescriptive engine error:', err);
      if (container) {
        container.innerHTML = `
          <div class="error-state">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Error loading interventions: ${err.message}
          </div>
        `;
      }
    }
  }

  function renderInterventions(interventions, container, aggReduction) {
    if (!container) return;
    container.innerHTML = '';

    if (!interventions || interventions.length === 0) {
      container.innerHTML = `<div class="empty-state">No urgent structural interventions required for this corridor segment.</div>`;
      return;
    }

    // Top Summary Banner
    const banner = document.createElement('div');
    banner.className = 'prescriptive-summary-banner';
    banner.innerHTML = `
      <div class="banner-stat">
        <span class="lbl">Recommended Interventions</span>
        <strong class="val">${interventions.length} Projects</strong>
      </div>
      <div class="banner-stat">
        <span class="lbl">Projected Aggregate Risk Reduction</span>
        <strong class="val text-success">-${aggReduction.toFixed(1)}%</strong>
      </div>
      <div class="banner-stat">
        <span class="lbl">Funding Channel</span>
        <strong class="val text-info">MoRTH Central Road & Infrastructure Fund (CRIF)</strong>
      </div>
    `;
    container.appendChild(banner);

    // List of intervention cards
    interventions.forEach(item => {
      const card = document.createElement('div');
      card.className = `intervention-card priority-${item.priority.toLowerCase()}`;

      const priorityClass = item.priority.toLowerCase() === 'critical' ? 'badge-danger' : 'badge-warning';

      card.innerHTML = `
        <div class="int-header">
          <div class="int-title-group">
            <span class="int-code-tag">${escapeHtml(item.morth_irc_code)}</span>
            <h4 class="int-title">${escapeHtml(item.title)}</h4>
          </div>
          <span class="badge ${priorityClass}">${item.priority} Priority</span>
        </div>

        <p class="int-desc">${escapeHtml(item.description)}</p>

        <div class="int-metrics-grid">
          <div class="int-metric">
            <span class="m-lbl"><i class="fa-solid fa-indian-rupee-sign"></i> Estimated CapEx</span>
            <strong class="m-val">₹ ${item.estimated_capex_lakhs.toFixed(1)} Lakhs</strong>
          </div>
          <div class="int-metric">
            <span class="m-lbl"><i class="fa-solid fa-arrow-trend-down"></i> Risk Reduction</span>
            <strong class="m-val text-success">-${item.projected_risk_reduction_pct.toFixed(1)}%</strong>
          </div>
          <div class="int-metric">
            <span class="m-lbl"><i class="fa-solid fa-clock-rotate-left"></i> Estimated Payback</span>
            <strong class="m-val">${item.payback_months.toFixed(0)} Months</strong>
          </div>
          <div class="int-metric">
            <span class="m-lbl"><i class="fa-solid fa-tag"></i> Domain</span>
            <strong class="m-val text-muted">${escapeHtml(item.category)}</strong>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  return {
    loadPrescriptive
  };
})();
