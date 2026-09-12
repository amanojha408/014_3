import React, { useState } from 'react';
import { verifyRepairCV } from '../services/api';

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

export default function ConsumerWorkspace() {
  const [candidateMode, setCandidateMode] = useState('rejected');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunVerification = async () => {
    setEvaluating(true);
    const payload = {
      ticket_id: 'TKT-2026-NH48-44',
      hazard_type: 'Severe Pothole Cluster & Edge Cracking',
      segment_id: 'NH48-SEG-01',
      baseline_image_id: 'baseline_safe_road.jpg',
      repaired_image_id: CANDIDATE_CONFIG[candidateMode].imageId,
      contractor_id: 'CONTR-LNT-01'
    };

    try {
      const res = await verifyRepairCV(payload);
      setResult(res);
    } catch (err) {
      console.error('CV verification error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const isPassed = result?.status === 'VERIFIED_CLOSED';
  const simPct = result ? Math.round(result.siamese_similarity_score * 100) : 0;

  return (
    <main className="auditor-workspace">
      <div className="cv-studio-card">
        <div className="cv-intro-banner">
          <i className="fa-solid fa-camera-retro"></i>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Consumer & Citizen Feedback Studio</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              <strong>Citizen-Sourced Infrastructure Repair Verification</strong>:
              Edge dashcam feeds detect hazards. Once contractors report repairs, our PyTorch Siamese Neural Network compares the post-repair state against the certified Safe Baseline image. Cosmetic/fraudulent patches are rejected.
            </div>
          </div>
        </div>

        <div className="cv-studio-body" style={{ padding: '1.5rem' }}>
          {/* Workflow Step Tracker */}
          <div className="workflow-steps">
            <div className="step-card completed">
              <span className="step-num">1</span>
              <div className="step-lbl">Hazard Detected</div>
              <div className="step-sub">Pothole Crater Cluster</div>
            </div>
            <div className="step-line active"></div>
            <div className="step-card completed">
              <span className="step-num">2</span>
              <div className="step-lbl">Concessionaire Alert</div>
              <div className="step-sub">Latency: 28.4ms (&lt;500ms)</div>
            </div>
            <div className="step-line active"></div>
            <div className="step-card active">
              <span className="step-num">3</span>
              <div className="step-lbl">Siamese Verification</div>
              <div className="step-sub">Autonomous Audit Gate</div>
            </div>
          </div>

          {/* Image Comparison Workspace */}
          <div className="cv-workspace-grid">
            {/* Baseline Safe Road */}
            <div className="cv-card">
              <div className="cv-card-lbl">1. Certified Safe Baseline</div>
              <div className="img-wrapper">
                <img
                  id="cv-img-baseline"
                  src="/api/cv/image/baseline_safe_road.jpg"
                  alt="Certified Baseline Road"
                />
                <span className="img-badge badge-safe">Reference Ground Truth</span>
              </div>
              <div className="cv-caption">MoRTH Standard Bituminous Surface</div>
            </div>

            {/* Detected Hazard State */}
            <div className="cv-card">
              <div className="cv-card-lbl">2. Detected Edge Hazard</div>
              <div className="img-wrapper">
                <img
                  id="cv-img-hazard"
                  src="/api/cv/image/hazard_severe_potholes.jpg"
                  alt="Hazard Crater"
                />
                <span className="img-badge badge-danger">Hazard Dispatched</span>
              </div>
              <div className="cv-caption">Ticket #TKT-2026-NH48-44 | Size: 1.8m</div>
            </div>

            {/* Candidate Post-Repair State */}
            <div className="cv-card">
              <div className="cv-card-lbl">3. Contractor Post-Repair Submission</div>
              <div className="img-wrapper">
                <img
                  id="cv-img-candidate"
                  src={`/api/cv/image/${CANDIDATE_CONFIG[candidateMode].imageId}`}
                  alt="Candidate Repair"
                />
                <span className={`img-badge ${CANDIDATE_CONFIG[candidateMode].badgeClass}`} id="candidate-badge">
                  {CANDIDATE_CONFIG[candidateMode].badgeText}
                </span>
              </div>
              <div className="candidate-toggle-bar">
                <button
                  className={`btn-toggle ${candidateMode === 'rejected' ? 'active' : ''}`}
                  id="btn-pick-rejected"
                  onClick={() => {
                    setCandidateMode('rejected');
                    setResult(null);
                  }}
                >
                  Simulate Deficient Patch
                </button>
                <button
                  className={`btn-toggle ${candidateMode === 'verified' ? 'active' : ''}`}
                  id="btn-pick-verified"
                  onClick={() => {
                    setCandidateMode('verified');
                    setResult(null);
                  }}
                >
                  Simulate Hot-Mix Resurfacing
                </button>
              </div>
            </div>
          </div>

          {/* Siamese Network Audit Evaluation Result */}
          <div className="cv-audit-result-panel" id="cv-audit-panel">
            <div className="cv-verdict-header">
              <div
                className={`verdict-tag ${
                  result
                    ? isPassed
                      ? 'success'
                      : 'danger'
                    : 'pending'
                }`}
                id="cv-verdict-badge"
              >
                {result
                  ? isPassed
                    ? 'REPAIR VERIFIED CLOSED'
                    : 'REPAIR REJECTED (DEFICIENT)'
                  : 'AUDIT PENDING'}
              </div>
              <button
                className="btn-primary"
                id="btn-run-siamese-eval"
                onClick={handleRunVerification}
                disabled={evaluating}
              >
                {evaluating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Running PyTorch Siamese Inference...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play"></i> Run Siamese Network Verification
                  </>
                )}
              </button>
            </div>

            <div className="cv-metrics-row">
              <div className="metric-cell">
                <span className="lbl">Siamese Cosine Similarity</span>
                <div className="progress-bar-wrap">
                  <div
                    className={`progress-fill ${
                      result ? (isPassed ? 'success' : 'danger') : ''
                    }`}
                    id="siamese-sim-bar"
                    style={{ width: `${simPct}%` }}
                  ></div>
                </div>
                <strong
                  id="siamese-sim-val"
                  className={result ? (isPassed ? 'text-success' : 'text-danger') : ''}
                >
                  {result ? result.siamese_similarity_score.toFixed(4) : '--'}
                </strong>
                <span className="threshold-note">Pass Threshold: &ge; 0.880</span>
              </div>
              <div className="metric-cell">
                <span className="lbl">Processing Latency</span>
                <strong className="text-success" id="cv-latency-val">
                  {result ? `${result.latency_ms.toFixed(1)} ms` : '-- ms'}
                </strong>
                <span className="threshold-note">Benchmark SLA: &lt; 500ms</span>
              </div>
              <div className="metric-cell">
                <span className="lbl">Cloud Audit Trail</span>
                <strong id="cv-cos-uri">
                  {result ? `Cloud Storage: ${result.ticket_id}.json` : 'Cloud Object Storage Vault'}
                </strong>
                <span className="threshold-note">Immutable Hash Registered</span>
              </div>
            </div>

            <div className="audit-verdict-text" id="cv-verdict-text">
              {result ? (
                <>
                  <strong>Autonomous Audit Gate Verdict:</strong> {result.audit_verdict}
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Feature Distance: {result.siamese_feature_distance.toFixed(4)} | Threshold: &ge;{' '}
                    {result.threshold} | Siamese Model: {result.watson_model_id}
                  </span>
                </>
              ) : (
                "Click 'Run Siamese Network Verification' to execute deep feature baseline matching."
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
