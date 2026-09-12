/**
 * RoadSafe India 360 - Frontend API Client
 * Centralized service layer for all FastAPI REST endpoints.
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCorridors() {
  const res = await fetch(`${API_BASE}/corridors`);
  if (!res.ok) throw new Error(`Failed to fetch corridors: ${res.statusText}`);
  return res.json();
}

export async function fetchCorridorById(segmentId) {
  const res = await fetch(`${API_BASE}/corridors/${segmentId}`);
  if (!res.ok) throw new Error(`Failed to fetch corridor ${segmentId}: ${res.statusText}`);
  return res.json();
}

export async function fetchShapExplanation(segmentId) {
  const res = await fetch(`${API_BASE}/shap/${segmentId}`);
  if (!res.ok) throw new Error(`Failed to fetch SHAP explanation: ${res.statusText}`);
  return res.json();
}

export async function simulateCounterfactual(payload) {
  const res = await fetch(`${API_BASE}/counterfactual/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Counterfactual simulation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchForecast(corridorId) {
  const res = await fetch(`${API_BASE}/forecaster/${corridorId}`);
  if (!res.ok) throw new Error(`Failed to fetch forecaster data: ${res.statusText}`);
  return res.json();
}

export async function fetchPrescriptive(segmentId) {
  const res = await fetch(`${API_BASE}/prescriptive/${segmentId}`);
  if (!res.ok) throw new Error(`Failed to fetch prescriptive interventions: ${res.statusText}`);
  return res.json();
}

export async function fetchSpatialClusters() {
  const res = await fetch(`${API_BASE}/spatial/clusters`);
  if (!res.ok) throw new Error(`Failed to fetch spatial clusters: ${res.statusText}`);
  return res.json();
}

export async function queryBoundaryPolygon(coordinates) {
  const res = await fetch(`${API_BASE}/spatial/polygon-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon_coordinates: coordinates })
  });
  if (!res.ok) throw new Error(`Boundary polygon query failed: ${res.statusText}`);
  return res.json();
}

export async function verifyRepairCV(payload) {
  const res = await fetch(`${API_BASE}/cv/verify-repair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Closed-Loop CV verification failed: ${res.statusText}`);
  return res.json();
}

export async function fetchIBMStatus() {
  const res = await fetch(`${API_BASE}/ibm/status`);
  if (!res.ok) throw new Error(`Failed to fetch IBM telemetry: ${res.statusText}`);
  return res.json();
}
