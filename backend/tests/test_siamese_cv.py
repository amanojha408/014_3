"""
Unit tests for Closed-Loop CV Verification System ('The Secret Sauce').
Validates Siamese network cosine similarity thresholding (>= 0.88)
and rejection of deficient/cosmetic repairs.
"""

import os
import pytest
from PIL import Image
from backend.app.models.siamese_cv import siamese_cv_engine

CV_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "cv_samples"
)

def test_siamese_cv_verification_pass():
    """Verify that a genuine resurfaced repair matches baseline (similarity >= 0.88)."""
    base_img = Image.open(os.path.join(CV_DIR, "baseline_safe_road.jpg"))
    ver_img = Image.open(os.path.join(CV_DIR, "verified_resurfaced_road.jpg"))

    response = siamese_cv_engine.verify_repair(
        baseline_img=base_img,
        candidate_img=ver_img,
        ticket_id="TEST-TKT-PASS",
        hazard_type="Severe Pothole Cluster",
        segment_id="NH48-SEG-01"
    )

    assert response.status == "VERIFIED_CLOSED"
    assert response.siamese_similarity_score >= 0.88
    assert "AUDIT PASSED" in response.audit_verdict
    assert response.latency_ms < 500.0  # Sub-500ms requirement

def test_siamese_cv_verification_reject_deficient_patch():
    """Verify that a crude cosmetic patch is rejected (similarity < 0.88)."""
    base_img = Image.open(os.path.join(CV_DIR, "baseline_safe_road.jpg"))
    rej_img = Image.open(os.path.join(CV_DIR, "rejected_cosmetic_patch.jpg"))

    response = siamese_cv_engine.verify_repair(
        baseline_img=base_img,
        candidate_img=rej_img,
        ticket_id="TEST-TKT-FAIL",
        hazard_type="Severe Pothole Cluster",
        segment_id="NH48-SEG-01"
    )

    assert response.status == "REJECTED_DEFICIENT"
    assert response.siamese_similarity_score < 0.88
    assert "AUDIT REJECTED" in response.audit_verdict
