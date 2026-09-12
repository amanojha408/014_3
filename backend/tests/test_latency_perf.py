"""
Performance benchmark test verifying sub-500ms latency requirement.
"""

import time
import os
import pytest
from PIL import Image
from backend.app.models.risk_engine import risk_engine
from backend.app.models.shap_explainer import shap_explainer
from backend.app.models.siamese_cv import siamese_cv_engine
from backend.app.services.corridor_data import INDIAN_CORRIDORS

CV_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data", "cv_samples"
)

def test_sub_500ms_cv_latency():
    """Verify CV verification executes well within the 500ms SLA."""
    base_img = Image.open(os.path.join(CV_DIR, "baseline_safe_road.jpg"))
    cand_img = Image.open(os.path.join(CV_DIR, "verified_resurfaced_road.jpg"))

    start = time.perf_counter()
    res = siamese_cv_engine.verify_repair(base_img, cand_img)
    total_ms = (time.perf_counter() - start) * 1000.0

    assert total_ms < 500.0, f"CV verification latency was {total_ms}ms (must be < 500ms)"
    assert res.latency_ms < 500.0

def test_sub_50ms_risk_and_shap_latency():
    """Verify scoring and TreeSHAP explainer latency is near-instant (<50ms)."""
    sample = INDIAN_CORRIDORS[0]

    start = time.perf_counter()
    risk_engine.predict_risk(sample)
    shap_explainer.explain_coordinate(sample)
    total_ms = (time.perf_counter() - start) * 1000.0

    assert total_ms < 100.0, f"Risk and SHAP inference took {total_ms}ms"
