import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { fetchSpatialClusters, queryBoundaryPolygon } from '../services/api';

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_3i9m_1_1864956ea990f7a63a0ee363';

export default function OutcomeMap({ corridors, selectedCorridorId, onSelectCorridor }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const clustersLayerRef = useRef(null);
  const activePolygonRef = useRef(null);

  const [clustersActive, setClustersActive] = useState(false);
  const [boundaryData, setBoundaryData] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.5937, 78.9629],
      zoom: 5,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High performance dark tile layer (CartoDB Dark Matter with authenticated API key)
    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    clustersLayerRef.current = L.layerGroup().addTo(map);

    // Geoman controls
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawCircleMarker: false,
      drawMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true
    });

    map.on('pm:create', async (e) => {
      if (e.shape === 'Polygon' || e.shape === 'Rectangle') {
        if (activePolygonRef.current) {
          map.removeLayer(activePolygonRef.current);
        }
        activePolygonRef.current = e.layer;
        const latLngs = e.layer.getLatLngs()[0];
        const coords = latLngs.map((pt) => [pt.lat, pt.lng]);
        try {
          const res = await queryBoundaryPolygon(coords);
          setBoundaryData(res);
        } catch (err) {
          console.error('Failed to query boundary polygon:', err);
        }
      }
    });

    map.on('pm:remove', () => {
      setBoundaryData(null);
      activePolygonRef.current = null;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Corridor Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !corridors || corridors.length === 0) return;

    markersLayerRef.current.clearLayers();

    corridors.forEach((seg) => {
      const score = seg.risk_score || 50;
      let markerColor = '#10b981';

      if (score >= 70) {
        markerColor = '#ef4444';
      } else if (score >= 50) {
        markerColor = '#f59e0b';
      } else if (score >= 30) {
        markerColor = '#38bdf8';
      }

      const isSelected = seg.id === selectedCorridorId;

      const customIcon = L.divIcon({
        className: 'blackspot-marker-container',
        html: `
          <div class="blackspot-marker ${isSelected ? 'selected' : ''}">
            <div class="blackspot-ring" style="border-color: ${markerColor}"></div>
            <div class="blackspot-pulse" style="background-color: ${markerColor}">
              ${Math.round(score)}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([seg.latitude, seg.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; min-width: 200px;">
          <strong style="color: #38bdf8; font-size: 0.9rem;">${seg.corridor_name}</strong><br/>
          <span style="font-size: 0.82rem; font-weight: 600; color: #fff;">${seg.location_name}</span>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 6px 0;"/>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            Normalized Risk: <strong style="color: ${markerColor};">${score.toFixed(1)}/100</strong><br/>
            Annual Crashes: <strong style="color: #fff;">${seg.historical_crashes_annual}</strong> | Fatalities: <strong style="color: #ef4444;">${seg.fatalities_annual}</strong><br/>
            Primary Hazard: <em style="color: #cbd5e1;">${seg.primary_hazard}</em>
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectCorridor(seg.id);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [corridors, selectedCorridorId]);

  // Center on selected corridor
  useEffect(() => {
    if (!mapRef.current || !selectedCorridorId || !corridors) return;
    const target = corridors.find((c) => c.id === selectedCorridorId);
    if (target) {
      mapRef.current.setView([target.latitude, target.longitude], 12, { animate: true });
    }
  }, [selectedCorridorId]);

  const fitAllCorridors = () => {
    if (!mapRef.current || !corridors || corridors.length === 0) return;
    const bounds = L.latLngBounds(corridors.map((c) => [c.latitude, c.longitude]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const toggleClusters = async () => {
    if (!clustersLayerRef.current) return;

    if (clustersActive) {
      clustersLayerRef.current.clearLayers();
      setClustersActive(false);
      return;
    }

    try {
      const clusters = await fetchSpatialClusters();
      clustersLayerRef.current.clearLayers();

      clusters.forEach((cl) => {
        const circle = L.circle([cl.center_lat, cl.center_lon], {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.15,
          radius: 25000 // 25km radius
        });

        circle.bindTooltip(`
          <strong>${cl.cluster_name}</strong><br/>
          Segments: ${cl.segment_count} | Total Crashes: ${cl.total_annual_crashes}
        `);

        clustersLayerRef.current.addLayer(circle);
      });

      setClustersActive(true);
    } catch (err) {
      console.error('Failed to load spatial clusters:', err);
    }
  };

  return (
    <section className="panel panel-map">
      <div className="panel-header">
        <div className="panel-title">
          <i className="fa-solid fa-map-location-dot"></i> Outcome 1: Interactive Geospatial Risk Map &amp; Geoman
        </div>
        <div className="map-controls">
          <button className="btn-tool" id="btn-fit-corridors" onClick={fitAllCorridors} title="Fit all Indian corridors">
            <i className="fa-solid fa-expand"></i> All Corridors
          </button>
          <button
            className={`btn-tool ${clustersActive ? 'active' : ''}`}
            id="btn-toggle-clusters"
            onClick={toggleClusters}
            title="Filter DBSCAN Blackspots"
          >
            <i className="fa-solid fa-circle-nodes"></i> DBSCAN Clusters
          </button>
          <div className="geoman-hint">
            <i className="fa-solid fa-draw-polygon"></i> <span>Draw polygon to query ward boundary</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div id="risk-map" className="map-container" ref={mapContainerRef}></div>

      {/* Spatial Boundary Query Result Card */}
      {boundaryData && (
        <div id="boundary-results" className="boundary-card">
          <div className="boundary-header">
            <span>
              <i className="fa-solid fa-vector-square"></i> Administrative Safety Boundary Query
            </span>
            <button className="btn-close-sm" id="close-boundary-card" onClick={() => setBoundaryData(null)}>
              &times;
            </button>
          </div>
          <div className="boundary-grid">
            <div className="b-stat">
              <span className="lbl">Enclosed Segments</span>
              <span className="val" id="b-count">{boundaryData.enclosed_count}</span>
            </div>
            <div className="b-stat">
              <span className="lbl">Annual Crashes</span>
              <span className="val text-danger" id="b-crashes">{boundaryData.total_annual_crashes}</span>
            </div>
            <div className="b-stat">
              <span className="lbl">Annual Fatalities</span>
              <span className="val text-critical" id="b-fatalities">{boundaryData.total_annual_fatalities}</span>
            </div>
            <div className="b-stat">
              <span className="lbl">Avg Surface Index</span>
              <span className="val" id="b-surface">
                {boundaryData.enclosed_count > 0 ? `${boundaryData.average_surface_index}/100` : '--'}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
