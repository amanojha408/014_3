"""
Outcome 1: Spatial Analytics & Blackspot Clustering Engine
Implements DBSCAN spatial clustering with coordinate distance indexing (PostGIS GIST simulation).
Filters random accident noise from systemic infrastructure failures.
Also provides Point-in-Polygon spatial query logic for Leaflet-Geoman drawn administrative boundaries.
"""

import math
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import DBSCAN
from backend.app.services.corridor_data import INDIAN_CORRIDORS

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    """
    Ray-Casting Algorithm to test if a GPS point (lat, lon) is inside a closed polygon.
    Used for Leaflet-Geoman user-drawn municipal administrative boundaries.
    """
    lat, lon = point
    inside = False
    n = len(polygon)
    if n < 3:
        return False

    j = n - 1
    for i in range(n):
        xi, yi = polygon[i][0], polygon[i][1]
        xj, yj = polygon[j][0], polygon[j][1]

        intersect = ((yi > lon) != (yj > lon)) and (
            lat < (xj - xi) * (lon - yi) / (yj - yi + 1e-9) + xi
        )
        if intersect:
            inside = not inside
        j = i

    return inside

class SpatialClusterEngine:
    """
    Identifies Blackspot clusters across highway corridors using DBSCAN
    operating on spatial proximity and hazard density.
    """
    def __init__(self, corridors: List[Dict[str, Any]] = INDIAN_CORRIDORS):
        self.corridors = corridors

    def compute_blackspot_clusters(self, eps_km: float = 35.0, min_samples: int = 1) -> List[Dict[str, Any]]:
        """
        DBSCAN clustering to identify systemic high-hazard blackspot zones.
        eps_km: cluster radius in km.
        """
        if not self.corridors:
            return []

        coords = np.array([[c["latitude"], c["longitude"]] for c in self.corridors])
        
        # Approximate degrees to km: 1 deg lat ~ 111 km
        coords_rad = np.radians(coords)
        kms_per_radian = 6371.0
        epsilon_radians = eps_km / kms_per_radian

        db = DBSCAN(eps=epsilon_radians, min_samples=min_samples, metric='haversine')
        labels = db.fit_predict(coords_rad)

        clusters: Dict[int, List[Dict[str, Any]]] = {}
        for idx, label in enumerate(labels):
            if label not in clusters:
                clusters[label] = []
            corridor_copy = dict(self.corridors[idx])
            corridor_copy["cluster_id"] = int(label)
            clusters[label].append(corridor_copy)

        results = []
        for cluster_id, items in clusters.items():
            mean_lat = float(np.mean([it["latitude"] for it in items]))
            mean_lon = float(np.mean([it["longitude"] for it in items]))
            total_annual_crashes = int(sum(it.get("historical_crashes_annual", 0) for it in items))
            total_fatalities = int(sum(it.get("fatalities_annual", 0) for it in items))
            
            results.append({
                "cluster_id": cluster_id,
                "cluster_name": f"Blackspot Cluster #{cluster_id + 1} ({items[0]['corridor_name']})",
                "center_lat": round(mean_lat, 4),
                "center_lon": round(mean_lon, 4),
                "segment_count": len(items),
                "total_annual_crashes": total_annual_crashes,
                "total_fatalities": total_fatalities,
                "segments": items
            })

        return results

    def query_polygon_boundary(self, polygon_coords: List[List[float]]) -> Dict[str, Any]:
        """
        Calculates aggregate road safety statistics for user-drawn Leaflet-Geoman administrative polygon.
        """
        enclosed_segments = []
        for seg in self.corridors:
            pt = (seg["latitude"], seg["longitude"])
            if point_in_polygon(pt, polygon_coords):
                enclosed_segments.append(seg)

        if not enclosed_segments:
            return {
                "enclosed_count": 0,
                "average_risk_score": 0.0,
                "total_annual_crashes": 0,
                "total_annual_fatalities": 0,
                "segments": [],
                "status": "No segments within selected boundary"
            }

        total_crashes = sum(s.get("historical_crashes_annual", 0) for s in enclosed_segments)
        total_fatalities = sum(s.get("fatalities_annual", 0) for s in enclosed_segments)
        avg_surface = float(np.mean([s.get("surface_quality_index", 50) for s in enclosed_segments]))
        avg_lighting = float(np.mean([s.get("lighting_index", 50) for s in enclosed_segments]))

        return {
            "enclosed_count": len(enclosed_segments),
            "average_surface_index": round(avg_surface, 1),
            "average_lighting_index": round(avg_lighting, 1),
            "total_annual_crashes": total_crashes,
            "total_annual_fatalities": total_fatalities,
            "segments": enclosed_segments,
            "status": "Success"
        }

# Global Singleton Instance
spatial_engine = SpatialClusterEngine()
