import React, { useEffect, useState } from 'react';
import { fetchPrescriptive } from '../services/api';

export default function PrescriptiveInterventions({ segmentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!segmentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPrescriptive(segmentId)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [segmentId]);

  return (
    <div className="tab-pane active" id="tab-prescriptive">
      <div className="tab-header-flex">
        <div>
          <h3>
            <i className="fa-solid fa-file-signature"></i> Prescriptive Safety Interventions
          </h3>
          <p className="tab-subtitle">
            Automated decision-support mapped to official MoRTH Specifications &amp; IRC Codes.
          </p>
        </div>
        <div className="budget-box">
          <span>Total Intervention Package:</span>
          <strong className="text-info" id="presc-total-budget">
            ₹ {data ? data.total_budget_lakhs.toFixed(1) : '95.2'} Lakhs
          </strong>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i> Mapping MoRTH Section 800 &amp; IRC safety codes...
        </div>
      )}

      {error && (
        <div className="error-state">
          <i className="fa-solid fa-triangle-exclamation"></i> Error loading interventions: {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="interventions-list" id="interventions-container">
          {/* Top Summary Banner */}
          <div className="prescriptive-summary-banner">
            <div className="banner-stat">
              <span className="lbl">Recommended Interventions</span>
              <strong className="val">{data.interventions.length} Projects</strong>
            </div>
            <div className="banner-stat">
              <span className="lbl">Projected Aggregate Risk Reduction</span>
              <strong className="val text-success">
                -{data.aggregate_risk_reduction_pct.toFixed(1)}%
              </strong>
            </div>
            <div className="banner-stat">
              <span className="lbl">Funding Channel</span>
              <strong className="val text-info">
                MoRTH Central Road &amp; Infrastructure Fund (CRIF)
              </strong>
            </div>
          </div>

          {data.interventions.map((item) => {
            const priorityClass =
              item.priority.toLowerCase() === 'critical' ? 'badge-danger' : 'badge-warning';

            return (
              <div
                key={item.intervention_id}
                className={`intervention-card priority-${item.priority.toLowerCase()}`}
              >
                <div className="int-header">
                  <div className="int-title-group">
                    <span className="int-code-tag">{item.morth_irc_code}</span>
                    <h4 className="int-title">{item.title}</h4>
                  </div>
                  <span className={`badge ${priorityClass}`}>{item.priority} Priority</span>
                </div>

                <p className="int-desc">{item.description}</p>

                <div className="int-metrics-grid">
                  <div className="int-metric">
                    <span className="m-lbl">
                      <i className="fa-solid fa-indian-rupee-sign"></i> Estimated CapEx
                    </span>
                    <strong className="m-val">₹ {item.estimated_capex_lakhs.toFixed(1)} Lakhs</strong>
                  </div>
                  <div className="int-metric">
                    <span className="m-lbl">
                      <i className="fa-solid fa-arrow-trend-down"></i> Risk Reduction
                    </span>
                    <strong className="m-val text-success">
                      -{item.projected_risk_reduction_pct.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="int-metric">
                    <span className="m-lbl">
                      <i className="fa-solid fa-clock-rotate-left"></i> Estimated Payback
                    </span>
                    <strong className="m-val">{item.payback_months.toFixed(0)} Months</strong>
                  </div>
                  <div className="int-metric">
                    <span className="m-lbl">
                      <i className="fa-solid fa-tag"></i> Domain
                    </span>
                    <strong className="m-val text-muted">{item.category}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
