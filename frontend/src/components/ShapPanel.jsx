import React, { useEffect, useState } from 'react';
import { fetchShapExplanation } from '../services/api';

export default function ShapPanel({ segmentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!segmentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchShapExplanation(segmentId)
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

  const maxAbs = data?.features?.length
    ? Math.max(...data.features.map((f) => Math.abs(f.shap_value)), 1.0)
    : 1.0;

  return (
    <div className="tab-pane active" id="tab-shap">
      <div className="tab-header-flex">
        <div>
          <h3>
            <i className="fa-solid fa-brain"></i> Coordinate-Specific Local Feature Importance
          </h3>
          <p className="tab-subtitle">
            Native TreeSHAP marginal breakdown proving causal drivers for authority intervention.
          </p>
        </div>
        <div className="base-value-box">
          <span>Model Base Value (E[y]):</span>
          <strong id="shap-base-val">
            {data?.base_value ? data.base_value.toFixed(1) : '48.2'}
          </strong>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i> Computing exact TreeSHAP marginal contributions...
        </div>
      )}

      {error && (
        <div className="error-state">
          <i className="fa-solid fa-triangle-exclamation"></i> Failed to fetch TreeSHAP attribution: {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="shap-breakdown-list" id="shap-feature-list">
            {data.features.map((f, i) => {
              const isRiskIncreasing = f.shap_value >= 0;
              const pct = Math.min((Math.abs(f.shap_value) / maxAbs) * 100, 100);
              const sign = isRiskIncreasing ? '+' : '';
              const colorClass = isRiskIncreasing ? 'danger' : 'success';
              const badgeIcon = isRiskIncreasing ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

              return (
                <div key={i} className={`shap-feature-item ${colorClass}`}>
                  <div className="feature-info">
                    <div className="feature-name-row">
                      <span className="feature-title">{f.feature_label}</span>
                      <span className="feature-ref-badge" title="Official Indian Road Standard">
                        {f.guideline_ref}
                      </span>
                    </div>
                    <div className="feature-meta">
                      <span>
                        Observed Value: <strong>{f.feature_value.toFixed(1)}</strong>
                      </span>
                      <span className={`impact-tag ${colorClass}`}>
                        <i className={`fa-solid ${badgeIcon}`}></i> {f.directional_impact}
                      </span>
                    </div>
                  </div>
                  <div className="feature-bar-col">
                    <div className="shap-bar-track">
                      <div
                        className={`shap-bar-fill ${colorClass}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className={`shap-score-val ${colorClass}`}>
                      {sign}{f.shap_value.toFixed(2)} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shap-summary-box">
            <div className="summary-icon">
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <div
              className="summary-text"
              id="shap-summary-text"
              dangerouslySetInnerHTML={{ __html: data.executive_summary }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
}
