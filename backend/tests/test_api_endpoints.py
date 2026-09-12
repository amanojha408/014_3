"""
Integration tests for RoadSafe India 360 FastAPI REST endpoints.
Validates all 6 functional outcomes, static frontend mounts, and CV endpoints.
"""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["watson_ml"] == "CONNECTED"

def test_list_corridors():
    res = client.get("/api/corridors")
    assert res.status_code == 200
    corridors = res.json()
    assert len(corridors) >= 6
    for c in corridors:
        assert "risk_score" in c
        assert 0.0 <= c["risk_score"] <= 100.0

def test_get_single_corridor():
    res = client.get("/api/corridors/NH48-SEG-01")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "NH48-SEG-01"
    assert "confidence_interval" in data

def test_risk_evaluate_custom():
    payload = {
        "id": "CUSTOM-01",
        "corridor_name": "Custom Test Highway",
        "location_name": "Test Junction",
        "chainage_km": 10.0,
        "state": "Delhi",
        "latitude": 28.5,
        "longitude": 77.2,
        "traffic_density_pcu": 7500.0,
        "surface_quality_index": 35.0,
        "curvature_index": 70.0,
        "lighting_index": 20.0,
        "signage_visibility": 40.0,
        "monsoon_degradation": 65.0,
        "historical_crashes_annual": 42,
        "fatalities_annual": 12,
        "speed_limit_kmh": 80,
        "lanes": 4,
        "blackspot_severity": "Critical",
        "primary_hazard": "Curvature & Poor Illumination"
    }
    res = client.post("/api/risk/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 0 <= data["normalized_risk_score"] <= 100

def test_shap_explanation_endpoint():
    res = client.get("/api/shap/NH48-SEG-01")
    assert res.status_code == 200
    data = res.json()
    assert data["segment_id"] == "NH48-SEG-01"
    assert len(data["features"]) > 0
    assert "base_value" in data
    assert "executive_summary" in data

def test_counterfactual_simulation_endpoint():
    payload = {
        "segment_id": "NH48-SEG-01",
        "lighting_delta_pct": 40.0,
        "surface_quality_delta_pct": 50.0,
        "signage_density_delta": 2.0,
        "speed_calming_kmh": 15.0
    }
    res = client.post("/api/counterfactual/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["projected_risk_score"] < data["baseline_risk_score"]
    assert data["percentage_reduction"] > 0
    assert data["projected_lives_saved_3yr"] > 0

def test_forecaster_endpoint():
    res = client.get("/api/forecaster/NH48")
    assert res.status_code == 200
    data = res.json()
    assert len(data["seasonal_forecast"]) == 4
    assert data["monsoon_vulnerability_score"] > 0

def test_prescriptive_endpoint():
    res = client.get("/api/prescriptive/NH48-SEG-01")
    assert res.status_code == 200
    data = res.json()
    assert len(data["interventions"]) >= 2
    assert data["total_budget_lakhs"] > 0

def test_spatial_clusters_endpoint():
    res = client.get("/api/spatial/clusters")
    assert res.status_code == 200
    clusters = res.json()
    assert len(clusters) >= 2

def test_polygon_query_endpoint():
    coords = [
        [28.0, 76.5],
        [28.8, 76.5],
        [28.8, 77.5],
        [28.0, 77.5],
        [28.0, 76.5]
    ]
    res = client.post("/api/spatial/polygon-query", json={"polygon_coordinates": coords})
    assert res.status_code == 200
    data = res.json()
    assert "enclosed_count" in data

def test_cv_sample_pairs_and_image():
    pairs_res = client.get("/api/cv/sample-pairs")
    assert pairs_res.status_code == 200
    img_res = client.get("/api/cv/image/baseline_safe_road.jpg")
    assert img_res.status_code == 200
    assert img_res.headers["content-type"] == "image/jpeg"

def test_cv_verify_repair_endpoint():
    payload = {
        "ticket_id": "TEST-TKT-01",
        "hazard_type": "Pothole Cluster",
        "segment_id": "NH48-SEG-01",
        "baseline_image_id": "baseline_safe_road.jpg",
        "repaired_image_id": "verified_resurfaced_road.jpg",
        "contractor_id": "CONTR-TEST"
    }
    res = client.post("/api/cv/verify-repair", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "VERIFIED_CLOSED"
    assert data["siamese_similarity_score"] >= 0.88

def test_ibm_status_endpoint():
    res = client.get("/api/ibm/status")
    assert res.status_code == 200
    data = res.json()
    assert "watson_ml" in data
    assert "cloud_object_storage" in data

def test_serve_index_html():
    res = client.get("/")
    assert res.status_code == 200
    assert "RoadSafe India 360" in res.text
