import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { fetchSpatialClusters, queryBoundaryPolygon, fetchCustomAccidents } from '../services/api';

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_3i9m_1_1864956ea990f7a63a0ee363';

export default function OutcomeMap({ corridors, selectedCorridorId, onSelectCorridor }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const clustersLayerRef = useRef(null);
  const accidentsLayerRef = useRef(null);
  const activePolygonRef = useRef(null);

  const [clustersActive, setClustersActive] = useState(false);
  const [accidentsActive, setAccidentsActive] = useState(true);
  const [customAccidents, setCustomAccidents] = useState([]);
  const [boundaryData, setBoundaryData] = useState(null);

  // Initialize Map with Crisp Light CartoDB Voyager Basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.5937, 78.9629],
      zoom: 5,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High performance LIGHT CartoDB Voyager basemap with verified API key
    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    clustersLayerRef.current = L.layerGroup().addTo(map);
    accidentsLayerRef.current = L.layerGroup().addTo(map);

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

    // Fetch custom accident dataset
    fetchCustomAccidents()
      .then((data) => {
        if (data?.accidents) {
          setCustomAccidents(data.accidents);
        }
      })
      .catch((err) => {
        console.warn('Could not load custom accidents dataset:', err);
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Corridor Blackspot Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !corridors || corridors.length === 0) return;

    markersLayerRef.current.clearLayers();

    corridors.forEach((seg) => {
      const score = seg.risk_score || 50;
      let markerColor = '#059669';

      if (score >= 70) {
        markerColor = '#dc2626';
      } else if (score >= 50) {
        markerColor = '#d97706';
      } else if (score >= 30) {
        markerColor = '#0284c7';
      }

      const isSelected = seg.id === selectedCorridorId;

      const customIcon = L.divIcon({
        className: 'blackspot-marker-container',
        html: `
          <div class="blackspot-marker ${isSelected ? 'selected' : ''}">
            <div class="blackspot-ring" style="border-color: ${markerColor}"></div>
            <div class="blackspot-pulse" style="background-color: ${markerColor}; border: 2px solid #ffffff;">
              ${Math.round(score)}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([seg.latitude, seg.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; min-width: 220px; color: #0f172a; padding: 2px;">
          <div style="font-size: 0.72rem; font-weight: 700; color: #2563eb; text-transform: uppercase;">
            ${seg.corridor_name}
          </div>
          <strong style="font-size: 0.95rem; color: #0f172a; display: block; margin-top: 2px;">
            ${seg.location_name}
          </strong>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 6px 0;"/>
          <div style="font-size: 0.78rem; line-height: 1.45; color: #475569;">
            Normalized Risk Score: <strong style="color: ${markerColor}; font-size: 0.85rem;">${score.toFixed(1)}/100</strong><br/>
            Annual Crashes: <strong style="color: #0f172a;">${seg.historical_crashes_annual}</strong> | Fatalities: <strong style="color: #dc2626;">${seg.fatalities_annual}</strong><br/>
            Primary Road Hazard: <em style="color: #0f172a;">${seg.primary_hazard}</em>
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectCorridor(seg.id);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [corridors, selectedCorridorId]);

  // Render Custom Accident Dataset Markers
  useEffect(() => {
    if (!mapRef.current || !accidentsLayerRef.current) return;

    accidentsLayerRef.current.clearLayers();

    if (!accidentsActive || customAccidents.length === 0) return;

    customAccidents.forEach((acc) => {
      const isFatal = acc.accident_severity.toLowerCase().includes('fatal');
      const isGrievous = acc.accident_severity.toLowerCase().includes('grievous');
      const pinColor = isFatal ? '#dc2626' : isGrievous ? '#d97706' : '#2563eb';

      const accidentIcon = L.divIcon({
        className: 'accident-marker-wrap',
        html: `
          <div style="width: 22px; height: 22px; border-radius: 50%; background: ${pinColor}; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px;">
            <i class="fa-solid fa-car-burst"></i>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const accMarker = L.marker([acc.latitude, acc.longitude], { icon: accidentIcon });

      accMarker.bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; min-width: 220px; color: #0f172a; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.68rem; font-weight: 800; color: ${pinColor}; background: ${pinColor}18; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${acc.accident_severity}
            </span>
            <span style="font-size: 0.7rem; color: #64748b; font-family: monospace;">${acc.id}</span>
          </div>
          <strong style="font-size: 0.92rem; color: #0f172a; display: block; margin: 4px 0 2px 0;">
            ${acc.location_name}
          </strong>
          <div style="font-size: 0.72rem; color: #64748b;">
            Corridor: <strong>${acc.corridor}</strong> | Date: ${acc.date} (${acc.time})
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 6px 0;"/>
          <div style="font-size: 0.76rem; line-height: 1.45; color: #334155;">
            Collision Type: <strong>${acc.collision_type}</strong><br/>
            Fatalities: <strong style="color: #dc2626;">${acc.fatalities}</strong> | Grievous Injuries: <strong style="color: #d97706;">${acc.grievous_injuries}</strong><br/>
            Weather: ${acc.weather} | Vehicles: ${acc.vehicles_involved}<br/>
            Probable Cause: <em style="color: #0f172a;">${acc.cause}</em>
          </div>
        </div>
      `);

      accidentsLayerRef.current.addLayer(accMarker);
    });
  }, [customAccidents, accidentsActive]);

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
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.12,
          radius: 25000
        });

        circle.bindTooltip(`
          <div style="font-family: 'Outfit', sans-serif;">
            <strong>${cl.cluster_name}</strong><br/>
            Corridors: ${cl.segment_count} | Annual Crashes: ${cl.total_annual_crashes}
          </div>
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
          <i className="fa-solid fa-map-location-dot"></i>
          National Road Network Geospatial Twin
        </div>
        <div className="map-controls">
          <button
            className="btn-tool"
            id="btn-fit-corridors"
            onClick={fitAllCorridors}
            title="Fit map to all registered Indian National Corridors"
          >
            <i className="fa-solid fa-expand"></i> Overview
          </button>

          <button
            className={`btn-tool ${accidentsActive ? 'active' : ''}`}
            id="btn-toggle-accidents"
            onClick={() => setAccidentsActive(!accidentsActive)}
            title="Toggle user custom / live accident dataset markers"
          >
            <i className="fa-solid fa-car-burst"></i>
            Accidents ({customAccidents.length})
          </button>

          <button
            className={`btn-tool ${clustersActive ? 'active' : ''}`}
            id="btn-toggle-clusters"
            onClick={toggleClusters}
            title="DBSCAN high-density incident clustering"
          >
            <i className="fa-solid fa-circle-nodes"></i> Blackspot Clusters
          </button>

          <div className="geoman-hint">
            <i className="fa-solid fa-draw-polygon"></i> <span>Draw polygon for ward query</span>
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
