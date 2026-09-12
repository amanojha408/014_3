"""
Unit tests for Outcome 3: SHAP Explainable AI (XAI) Panel.
Validates exact TreeSHAP local feature attribution and additive property.
"""

import pytest
from backend.app.models.shap_explainer import shap_explainer
from backend.app.services.corridor_data import INDIAN_CORRIDORS

def test_shap_local_attribution_additive_property():
    """
    Test additive efficiency:
    sum(SHAP values) + base_value must equal predicted_risk_score within numerical tolerance.
    """
    sample = INDIAN_CORRIDORS[0]
    explanation = shap_explainer.explain_coordinate(sample)

    assert explanation.segment_id == sample["id"]
    assert len(explanation.features) == 8

    shap_sum = sum(f.shap_value for f in explanation.features)
    reconstructed_score = explanation.base_value + shap_sum

    # TreeSHAP mathematical property guarantees additive efficiency
    assert abs(reconstructed_score - explanation.predicted_risk_score) < 1.0

def test_guideline_mapping_coverage():
    """Ensure every feature attribution links to an official MoRTH or IRC standard."""
    sample = INDIAN_CORRIDORS[1]
    explanation = shap_explainer.explain_coordinate(sample)
    for feat in explanation.features:
        assert feat.guideline_ref != ""
        assert any(prefix in feat.guideline_ref for prefix in ["IRC", "MoRTH", "IS"])
