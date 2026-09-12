"""
Unit tests for Outcome 5: Prescriptive Safety Interventions Engine.
Validates mapping to MoRTH Section 800 and IRC:67 / IRC:35 / IRC:SP:88 codes.
"""

import pytest
from backend.app.models.prescriptive import prescriptive_engine
from backend.app.services.corridor_data import INDIAN_CORRIDORS

def test_prescriptive_recommendations():
    """Verify that prescriptive engine generates interventions with MoRTH/IRC codes."""
    for corridor in INDIAN_CORRIDORS[:4]:
        res = prescriptive_engine.generate_recommendations(corridor["id"])
        assert res.segment_id == corridor["id"]
        assert len(res.interventions) > 0
        assert res.total_budget_lakhs > 0
        assert 0.0 <= res.aggregate_risk_reduction_pct <= 100.0

        for intv in res.interventions:
            assert intv.intervention_id.startswith("INT-")
            assert any(code in intv.morth_irc_code for code in ["MoRTH", "IRC", "IS"])
            assert intv.estimated_capex_lakhs > 0
            assert intv.projected_risk_reduction_pct > 0
