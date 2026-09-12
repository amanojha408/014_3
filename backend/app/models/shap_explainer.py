"""
Outcome 3: SHAP Explainable AI (XAI) Panel
Calculates coordinate-specific Local Feature Importance via XGBoost TreeSHAP (pred_contribs=True).
Provides mathematically verifiable causal evidence for infrastructure interventions.
"""

import numpy as np
import xgboost as xgb
from typing import Dict, Any, List
from backend.app.schemas.api_models import SHAPExplanationResponse, SHAPFeatureContribution
from backend.app.models.risk_engine import risk_engine, FEATURE_NAMES, FEATURE_LABELS

GUIDELINE_MAPPINGS = {
    "traffic_density_pcu": "IRC:SP:84 - Manual of Specifications and Standards for Four-laning of Highways",
    "surface_quality_index": "MoRTH Section 500 - Pavement Maintenance & Bituminous Resurfacing Standards",
    "curvature_index": "IRC:73 - Geometric Design Standards for Rural Highways (Superelevation & Transition Curves)",
    "lighting_index": "MoRTH Section 800 (Cl 808) & IS:1944 - Road Lighting Specification for Highways and Flyovers",
    "signage_visibility": "IRC:67-2022 (Code of Practice for Road Signs) & IRC:35-2015 (Road Markings)",
    "monsoon_degradation": "IRC:SP:42 - Guidelines on Road Drainage & Antiskid Friction Surfacing",
    "speed_limit_kmh": "IRC:SP:88-2019 - Road Safety Audit Manual & Speed Management / Calming Standards",
    "lanes": "IRC:SP:84/87 - Highway Capacity and Carriageway Width Specifications"
}

class SHAPLocalExplainer:
    """
    Computes Local SHAP feature importance for any given road corridor coordinate.
    Uses exact TreeSHAP implementation inside the trained XGBoost booster.
    """
    def __init__(self, engine=risk_engine):
        self.engine = engine

    def explain_coordinate(self, corridor_data: Dict[str, Any]) -> SHAPExplanationResponse:
        """
        Compute exact local feature attribution via TreeSHAP.
        """
        X = self.engine.extract_feature_vector(corridor_data)
        dmatrix = xgb.DMatrix(X, feature_names=FEATURE_NAMES)
        
        # pred_contribs=True returns [phi_1, phi_2, ..., phi_k, base_value]
        booster = self.engine.model.get_booster()
        contribs = booster.predict(dmatrix, pred_contribs=True)[0]
        
        feature_shap = contribs[:-1]
        base_value = round(float(contribs[-1]), 1)
        predicted_score = round(float(np.sum(contribs)), 1)
        predicted_score = float(np.clip(predicted_score, 0.0, 100.0))

        features_list: List[SHAPFeatureContribution] = []
        for i, name in enumerate(FEATURE_NAMES):
            val = float(X[0][i])
            shap_val = round(float(feature_shap[i]), 1)
            directional = "Increases Risk" if shap_val > 0 else "Reduces Risk"
            
            features_list.append(SHAPFeatureContribution(
                feature_name=name,
                feature_label=FEATURE_LABELS[name],
                feature_value=val,
                shap_value=shap_val,
                directional_impact=directional,
                guideline_ref=GUIDELINE_MAPPINGS.get(name, "MoRTH Safety Guidelines")
            ))

        # Sort descending by absolute SHAP impact (highest risk driver first)
        features_list.sort(key=lambda x: abs(x.shap_value), reverse=True)

        # Generate human-readable executive justification for State Road Authority
        top_risk_drivers = [f"{f.feature_label} (+{f.shap_value:.1f} pts)" for f in features_list if f.shap_value > 0][:3]
        drivers_str = ", ".join(top_risk_drivers) if top_risk_drivers else "Balanced corridor parameters"
        
        summary = (
            f"Risk analysis for {corridor_data.get('location_name', 'Corridor')}: "
            f"The predicted risk score of {predicted_score:.1f}/100 is predominantly driven by {drivers_str}. "
            f"Immediate MoRTH infrastructure intervention is recommended to mitigate structural hazard."
        )

        return SHAPExplanationResponse(
            segment_id=corridor_data.get("id", "LOC-01"),
            location_name=corridor_data.get("location_name", "Corridor"),
            latitude=corridor_data.get("latitude", 28.3242),
            longitude=corridor_data.get("longitude", 76.9012),
            base_value=base_value,
            predicted_risk_score=predicted_score,
            features=features_list,
            executive_summary=summary
        )

# Global Singleton Instance
shap_explainer = SHAPLocalExplainer()
