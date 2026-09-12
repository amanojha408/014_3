import React from 'react';

export default function OutcomeTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'tab-shap', label: 'Outcome 3: SHAP XAI', icon: 'fa-chart-column' },
    { id: 'tab-counterfactual', label: 'Outcome 6: What-If Simulator', icon: 'fa-sliders' },
    { id: 'tab-forecaster', label: 'Outcome 4: Season Forecaster', icon: 'fa-chart-line' },
    { id: 'tab-prescriptive', label: 'Outcome 5: MoRTH Interventions', icon: 'fa-shield-halved' }
  ];

  return (
    <nav className="outcome-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          data-tab={tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
        </button>
      ))}
    </nav>
  );
}
