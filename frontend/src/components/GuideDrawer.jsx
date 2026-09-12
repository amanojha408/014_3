import React from 'react';

export default function GuideDrawer({ isOpen, onClose, onSelectTab, onFitMap }) {
  const steps = [
    {
      num: '1',
      title: 'Explore Map & Draw Safety Zones',
      tag: 'Outcome 1: Leaflet-Geoman',
      desc: 'Click on blackspot markers to inspect road telemetry, or click the polygon icon on the top-left of the map to draw custom municipal boundaries and query aggregate annual crashes.',
      icon: 'fa-map-location-dot',
      actionText: 'Fit Corridors',
      actionIcon: 'fa-expand',
      onAction: onFitMap
    },
    {
      num: '2',
      title: 'Analyze Root Causes with TreeSHAP',
      tag: 'Outcome 3: Explainable AI',
      desc: 'Inspect exact coordinate-level TreeSHAP feature attributions. Identify whether road surface roughness, sharp curvature, or poor illumination drives the danger score.',
      icon: 'fa-brain',
      actionText: 'Inspect SHAP',
      actionIcon: 'fa-chart-column',
      onAction: () => onSelectTab('tab-shap')
    },
    {
      num: '3',
      title: 'Simulate What-If Interventions',
      tag: 'Outcome 6: Dynamic XGBoost',
      desc: 'Adjust the 4 engineering sliders (LED Lighting, SMA Resurfacing, Signage, Speed Calming). Watch live tree traversal calculate projected risk reductions and 3-year lives saved.',
      icon: 'fa-sliders',
      actionText: 'Test Simulator',
      actionIcon: 'fa-wand-magic-sparkles',
      onAction: () => onSelectTab('tab-counterfactual')
    },
    {
      num: '4',
      title: 'Anticipate Seasonal Surges',
      tag: 'Outcome 4: Time-Series',
      desc: 'Track seasonal trajectories (Monsoon friction loss, Diwali travel peaks, Northern fog). Check MoRTH mitigation directives for proactive preventative action.',
      icon: 'fa-chart-line',
      actionText: 'Check Forecast',
      actionIcon: 'fa-calendar-days',
      onAction: () => onSelectTab('tab-forecaster')
    },
    {
      num: '5',
      title: 'Access MoRTH & IRC Guidelines',
      tag: 'Outcome 5: Prescriptive Codes',
      desc: 'Get automated engineering specifications mapped directly to IRC:67-2022, IRC:35, and MoRTH Section 800 with estimated CapEx in ₹ Lakhs and payback timelines.',
      icon: 'fa-shield-halved',
      actionText: 'View Standards',
      actionIcon: 'fa-file-signature',
      onAction: () => onSelectTab('tab-prescriptive')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="guide-drawer-overlay" onClick={onClose}>
      <div className="guide-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="guide-drawer-header">
          <div className="guide-title-flex">
            <div className="guide-icon-pulse">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div className="guide-main-title">
                How to Use RoadSafe India 360
              </div>
              <div className="guide-sub-title">
                Complete decision-support lifecycle
              </div>
            </div>
          </div>
          <button className="guide-drawer-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="guide-drawer-body">
          <div className="steps-cards-grid drawer-grid">
            {steps.map((s) => (
              <div key={s.num} className="step-guide-card">
                <div className="step-card-top">
                  <div className="step-number-circle">{s.num}</div>
                  <span className="step-tag">{s.tag}</span>
                </div>

                <div className="step-card-title">
                  <i className={`fa-solid ${s.icon}`}></i> {s.title}
                </div>

                <p className="step-card-desc">{s.desc}</p>

                <button
                  type="button"
                  className="step-action-btn"
                  onClick={() => {
                    s.onAction();
                    onClose();
                  }}
                >
                  <i className={`fa-solid ${s.actionIcon}`}></i> {s.actionText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
