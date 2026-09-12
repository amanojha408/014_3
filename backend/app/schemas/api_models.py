"""
Pydantic API Schemas for RoadSafe India 360.
Provides strictly typed contracts for telemetry, predictions, XAI, and CV verification.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CorridorTelemetry(BaseModel):
    id: str
    corridor_name: str
    location_name: str
    chainage_km: float
    state: str
    latitude: float
    longitude: float
    traffic_density_pcu: float
    surface_quality_index: float  # 0 to 100 (higher = better surface)
    curvature_index: float        # 0 to 100 (higher = sharper curve)
    lighting_index: float         # 0 to 100 (higher = better lighting)
    signage_visibility: float     # 0 to 100 (higher = better visibility)
    monsoon_degradation: float    # 0 to 100 (higher = more rain/skid risk)
    historical_crashes_annual: int
    fatalities_annual: int
    speed_limit_kmh: int
    lanes: int
    blackspot_severity: str
    primary_hazard: str

class RiskScoreOutput(BaseModel):
    segment_id: str
    location_name: str
    raw_risk_score: float         # 0 - 100
    normalized_risk_score: float  # 0 - 100 (weighted by traffic volume)
    risk_tier: str                # Critical, High, Moderate, Low
    confidence_interval: List[float]
    true_risk_ratio: float        # True structural risk vs traffic volume artifact
    feature_contributions: Dict[str, float]

class SHAPFeatureContribution(BaseModel):
    feature_name: str
    feature_label: str
    feature_value: float
    shap_value: float             # Impact in risk score units (+/-)
    directional_impact: str       # "Increases Risk" or "Reduces Risk"
    guideline_ref: str            # MoRTH / IRC Reference

class SHAPExplanationResponse(BaseModel):
    segment_id: str
    location_name: str
    latitude: float
    longitude: float
    base_value: float
    predicted_risk_score: float
    features: List[SHAPFeatureContribution]
    executive_summary: str

class CounterfactualRequest(BaseModel):
    segment_id: str
    lighting_delta_pct: float = Field(default=0.0, description="Percentage change in lighting (+40% = 40)")
    signage_density_delta: float = Field(default=0.0, description="Signage increase (e.g. +2 units)")
    surface_quality_delta_pct: float = Field(default=0.0, description="Surface improvement (+50% = 50)")
    speed_calming_kmh: float = Field(default=0.0, description="Speed limit reduction (e.g. -15 km/h)")

class CounterfactualResponse(BaseModel):
    segment_id: str
    baseline_risk_score: float
    projected_risk_score: float
    absolute_reduction: float
    percentage_reduction: float
    impact_tier: str              # High, Critical, Moderate
    model_weight_verification: str # Proof of dynamic XGBoost traversal
    updated_shap_preview: Dict[str, float]
    estimated_capex_lakhs_inr: float
    projected_lives_saved_3yr: float

class ForecastPeriod(BaseModel):
    period: str                   # e.g. "Jul - Sep (Monsoon)", "Oct - Nov (Festivals)"
    season: str
    risk_multiplier: float
    projected_monthly_incidents: float
    critical_factor: str
    mitigation_urgency: str

class ForecasterResponse(BaseModel):
    corridor_id: str
    corridor_name: str
    historical_annual_avg: float
    projected_annual_trend: float
    seasonal_forecast: List[ForecastPeriod]
    monsoon_vulnerability_score: float
    festival_surge_risk_pct: float

class PrescriptiveIntervention(BaseModel):
    intervention_id: str
    title: str
    category: str
    morth_irc_code: str
    description: str
    estimated_capex_lakhs: float
    projected_risk_reduction_pct: float
    payback_months: float
    priority: str

class PrescriptiveResponse(BaseModel):
    segment_id: str
    location_name: str
    current_risk_score: float
    interventions: List[PrescriptiveIntervention]
    total_budget_lakhs: float
    aggregate_risk_reduction_pct: float

class ClosedLoopCVRequest(BaseModel):
    ticket_id: str
    hazard_type: str
    segment_id: str
    baseline_image_id: str
    repaired_image_id: str
    contractor_id: str

class ClosedLoopCVResponse(BaseModel):
    ticket_id: str
    segment_id: str
    hazard_type: str
    siamese_similarity_score: float  # 0.0 to 1.0
    threshold: float                 # e.g. 0.88
    status: str                      # "VERIFIED_CLOSED" or "REJECTED_DEFICIENT"
    latency_ms: float                # Sub-500ms benchmark
    siamese_feature_distance: float
    audit_verdict: str
    cos_storage_uri: str
    watson_model_id: str

class PolygonQueryRequest(BaseModel):
    polygon_coordinates: List[List[float]] # [[lat, lon], ...]
