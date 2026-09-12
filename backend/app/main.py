"""
RoadSafe India 360 - Main FastAPI Application
Connects all 6 functional outcomes, Closed-Loop CV verification, and IBM Cloud services.
Mounts interactive frontend dashboard.
"""

import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image

from backend.app.schemas.api_models import (
    RiskScoreOutput,
    SHAPExplanationResponse,
    CounterfactualRequest,
    CounterfactualResponse,
    ForecasterResponse,
    PrescriptiveResponse,
    ClosedLoopCVRequest,
    ClosedLoopCVResponse,
    PolygonQueryRequest
)
from backend.app.services.corridor_data import get_all_corridors, get_corridor_by_id, INDIAN_CORRIDORS
from backend.app.models.risk_engine import risk_engine
from backend.app.models.shap_explainer import shap_explainer
from backend.app.models.counterfactual import counterfactual_simulator
from backend.app.models.forecaster import risk_forecaster
from backend.app.models.prescriptive import prescriptive_engine
from backend.app.models.spatial_cluster import spatial_engine
from backend.app.models.siamese_cv import siamese_cv_engine
from backend.app.services.watson_ml import watson_connector
from backend.app.services.cloud_storage import cloud_storage

app = FastAPI(
    title="RoadSafe India 360 API",
    description="Continuous Road Safety Intelligence Network & Digital Road Twin with Closed-Loop CV Verification",
    version="1.0.0"
)

# Enable CORS for cross-origin frontend support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
CV_DIR = os.path.join(BASE_DIR, "data", "cv_samples")

# ----------------- REST API Endpoints -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "system": "RoadSafe India 360",
        "version": "1.0.0",
        "watson_ml": "CONNECTED",
        "ibm_cos": "CONNECTED"
    }

@app.get("/api/corridors")
def list_corridors():
    """List all registered Indian highway corridors with calculated real-time risk scores."""
    results = []
    for c in get_all_corridors():
        score_eval = risk_engine.predict_risk(c)
        item = dict(c)
        item["risk_score"] = score_eval.normalized_risk_score
        item["raw_risk_score"] = score_eval.raw_risk_score
        item["risk_tier"] = score_eval.risk_tier
        results.append(item)
    return results

@app.get("/api/corridors/{segment_id}")
def get_corridor(segment_id: str):
    """Fetch details and current telemetry for a specific segment."""
    c = get_corridor_by_id(segment_id)
    score_eval = risk_engine.predict_risk(c)
    item = dict(c)
    item["risk_score"] = score_eval.normalized_risk_score
    item["raw_risk_score"] = score_eval.raw_risk_score
    item["risk_tier"] = score_eval.risk_tier
    item["confidence_interval"] = score_eval.confidence_interval
    return item

@app.post("/api/risk/evaluate", response_model=RiskScoreOutput)
def evaluate_custom_risk(payload: Dict[str, Any] = Body(...)):
    """Outcome 2: Calculate normalized accident risk score on telemetry inputs."""
    return risk_engine.predict_risk(payload)

@app.get("/api/shap/{segment_id}", response_model=SHAPExplanationResponse)
def get_shap_explanation(segment_id: str):
    """Outcome 3: Local Feature Importance calculation via exact XGBoost TreeSHAP."""
    corridor = get_corridor_by_id(segment_id)
    return shap_explainer.explain_coordinate(corridor)

@app.post("/api/counterfactual/simulate", response_model=CounterfactualResponse)
def simulate_counterfactual(req: CounterfactualRequest):
    """Outcome 6: Dynamic model-weight driven What-If analysis."""
    return counterfactual_simulator.simulate_intervention(req)

@app.get("/api/forecaster/{corridor_id}", response_model=ForecasterResponse)
def get_risk_forecast(corridor_id: str):
    """Outcome 4: Time-Series Crash Risk Forecaster with Monsoon/Festival seasonality."""
    return risk_forecaster.forecast_corridor(corridor_id)

@app.get("/api/prescriptive/{segment_id}", response_model=PrescriptiveResponse)
def get_prescriptive_interventions(segment_id: str):
    """Outcome 5: Prescriptive safety decision support mapped to MoRTH & IRC standards."""
    return prescriptive_engine.generate_recommendations(segment_id)

@app.get("/api/spatial/clusters")
def get_spatial_clusters():
    """Outcome 1: DBSCAN-indexed blackspot clusters filtering noise from systemic failures."""
    return spatial_engine.compute_blackspot_clusters()

@app.post("/api/spatial/polygon-query")
def query_polygon(req: PolygonQueryRequest):
    """Outcome 1: Calculate aggregate road risk for Leaflet-Geoman drawn administrative zone."""
    return spatial_engine.query_polygon_boundary(req.polygon_coordinates)

@app.get("/api/cv/sample-pairs")
def get_cv_sample_pairs():
    """Return available benchmark CV verification cases for interactive audit demo."""
    return {
        "cases": [
            {
                "case_id": "CASE-POTHOLE-01",
                "hazard_type": "Severe Pothole Cluster & Edge Cracking",
                "segment_id": "NH48-SEG-01",
                "location": "Bilaspur Chowk Junction (NH-48)",
                "contractor": "L&T Highway Infrastructure Concessionaire",
                "baseline_image": "/api/cv/image/baseline_safe_road.jpg",
                "hazard_image": "/api/cv/image/hazard_severe_potholes.jpg",
                "rejected_repair_image": "/api/cv/image/rejected_cosmetic_patch.jpg",
                "verified_repair_image": "/api/cv/image/verified_resurfaced_road.jpg"
            }
        ]
    }

@app.get("/api/cv/image/{image_name}")
def get_cv_image(image_name: str):
    """Serve CV sample images."""
    file_path = os.path.join(CV_DIR, image_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path, media_type="image/jpeg")

@app.post("/api/cv/verify-repair", response_model=ClosedLoopCVResponse)
def verify_repair_cv(req: ClosedLoopCVRequest):
    """
    Secret Sauce: Autonomous Closed-Loop CV Verification.
    Runs candidate repair against Safe Baseline via PyTorch Siamese Network.
    """
    base_path = os.path.join(CV_DIR, req.baseline_image_id)
    cand_path = os.path.join(CV_DIR, req.repaired_image_id)

    if not os.path.exists(base_path) or not os.path.exists(cand_path):
        raise HTTPException(status_code=404, detail="Requested CV image fixtures not found")

    base_img = Image.open(base_path)
    cand_img = Image.open(cand_path)

    result = siamese_cv_engine.verify_repair(
        baseline_img=base_img,
        candidate_img=cand_img,
        ticket_id=req.ticket_id,
        hazard_type=req.hazard_type,
        segment_id=req.segment_id
    )

    # Log evidence to IBM Cloud Object Storage and route to Watson ML
    cloud_storage.store_verification_evidence(req.ticket_id, result.model_dump())
    watson_connector.score_payload(result.model_dump())

    return result

@app.get("/api/ibm/status")
def get_ibm_status():
    """Return IBM Watson ML and Cloud Object Storage integration telemetry."""
    return {
        "watson_ml": watson_connector.get_deployment_metadata(),
        "cloud_object_storage": cloud_storage.get_bucket_telemetry_summary()
    }

# ----------------- Mount Static Frontend (React & Dist) -----------------
FRONTEND_DIST = os.path.join(FRONTEND_DIR, "dist")
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def serve_index():
    if os.path.exists(FRONTEND_DIST):
        dist_index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(dist_index):
            return FileResponse(dist_index)
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "RoadSafe India 360 API running. Visit /docs for Swagger UI."}

