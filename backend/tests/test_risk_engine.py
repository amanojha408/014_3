"""
Unit tests for Outcome 2: Normalized Accident Risk Score Engine.
Validates metric bounds, feature extraction, and volume normalization.
"""

import pytest
from backend.app.models.risk_engine import risk_engine
from backend.app.services.corridor_data import INDIAN_CORRIDORS

def test_risk_score_bounds():
    """Verify that all corridors produce scores strictly in [0, 100]."""
    for corridor in INDIAN_CORRIDORS:
        result = risk_engine.predict_risk(corridor)
        assert 0.0 <= result.raw_risk_score <= 100.0
        assert 0.0 <= result.normalized_risk_score <= 100.0
        assert result.risk_tier in ["Critical", "High", "Moderate", "Low"]
        assert len(result.confidence_interval) == 2
        assert result.confidence_interval[0] <= result.confidence_interval[1]

def test_volume_normalization_true_risk():
    """
    Volume Normalization Test:
    A high-volume road with good surface & lighting should NOT be marked as higher risk
    than a lethal unlit sharp bend with moderate volume.
    """
    safe_high_volume = {
        "traffic_density_pcu": 110000,
        "surface_quality_index": 92.0,
        "curvature_index": 15.0,
        "lighting_index": 85.0,
        "signage_visibility": 90.0,
        "monsoon_degradation": 20.0,
        "speed_limit_kmh": 60,
        "lanes": 6
    }

    hazardous_moderate_volume = {
        "traffic_density_pcu": 35000,
        "surface_quality_index": 30.0,
        "curvature_index": 85.0,
        "lighting_index": 12.0,
        "signage_visibility": 30.0,
        "monsoon_degradation": 85.0,
        "speed_limit_kmh": 90,
        "lanes": 4
    }

    eval_safe = risk_engine.predict_risk(safe_high_volume)
    eval_hazard = risk_engine.predict_risk(hazardous_moderate_volume)

    assert eval_hazard.normalized_risk_score > eval_safe.normalized_risk_score
    assert eval_hazard.risk_tier in ["Critical", "High"]
