/**
 * Outcome 1: Interactive Geospatial Risk Map & Geoman Integration
 * Manages Leaflet map, corridor polylines, blackspot markers, DBSCAN clusters,
 * and Leaflet-Geoman administrative boundary drawing.
 */

window.RoadSafeMap = (function () {
  let map = null;
  let markersLayer = null;
  let corridorsLayer = null;
  let clustersLayer = null;
  let activePolygonLayer = null;

  function initMap() {
    // Center initially on Central/North India highway network
    map = L.map('risk-map', {
      center: [23.5937, 78.9629],
      zoom: 5,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High performance dark tile layer (CartoDB Dark Matter with authenticated API key)
    const CARTO_API_KEY = 'cb1_3i9m_1_1864956ea990f7a63a0ee363';
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; MoRTH India',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    corridorsLayer = L.layerGroup().addTo(map);
    clustersLayer = L.layerGroup().addTo(map);

    // Initialize Leaflet-Geoman drawing tools for Municipal Traffic Engineers
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

    // Listen to polygon creation
    map.on('pm:create', function (e) {
      if (e.shape === 'Polygon' || e.shape === 'Rectangle') {
        if (activePolygonLayer) {
          map.removeLayer(activePolygonLayer);
        }
        activePolygonLayer = e.layer;
        handlePolygonDrawn(e.layer);
      }
    });

    // Listen to removal
    map.on('pm:remove', function () {
      const boundaryCard = document.getElementById('boundary-results');
      if (boundaryCard) boundaryCard.classList.add('hidden');
    });

    // Setup map control buttons
    const btnFit = document.getElementById('btn-fit-corridors');
    if (btnFit) {
      btnFit.addEventListener('click', fitAllCorridors);
    }

    const btnClusters = document.getElementById('btn-toggle-clusters');
    if (btnClusters) {
      btnClusters.addEventListener('click', toggleClusters);
    }

    const btnCloseBoundary = document.getElementById('close-boundary-card');
    if (btnCloseBoundary) {
      btnCloseBoundary.addEventListener('click', () => {
        document.getElementById('boundary-results').classList.add('hidden');
      });
    }
  }

  function renderCorridors(corridors) {
    markersLayer.clearLayers();
    corridorsLayer.clearLayers();

    corridors.forEach((seg) => {
      // Color code based on normalized risk score
      const score = seg.risk_score || 50;
      let markerColor = '#10b981';
      let tierClass = 'low';

      if (score >= 70) {
        markerColor = '#ef4444';
        tierClass = 'critical';
      } else if (score >= 50) {
        markerColor = '#f59e0b';
        tierClass = 'high';
      } else if (score >= 30) {
        markerColor = '#38bdf8';
        tierClass = 'moderate';
      }

      // Custom animated blackspot icon
      const customIcon = L.divIcon({
        className: 'blackspot-marker-container',
        html: `
          <div class="blackspot-marker">
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
          <button onclick="window.RoadSafeApp.selectCorridor('${seg.id}')" style="margin-top: 8px; width: 100%; background: #2563eb; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.72rem; cursor: pointer; font-weight: 600;">
            Inspect Segment Telemetry
          </button>
        </div>
      `);

      marker.on('click', () => {
        window.RoadSafeApp.selectCorridor(seg.id);
      });

      markersLayer.addLayer(marker);
    });
  }

  function fitAllCorridors() {
    const corridors = window.RoadSafeApp.getAllCorridors();
    if (!corridors || corridors.length === 0) return;

    const bounds = L.latLngBounds(corridors.map((c) => [c.latitude, c.longitude]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  let clustersVisible = false;
  async function toggleClusters() {
    clustersVisible = !clustersVisible;
    const btn = document.getElementById('btn-toggle-clusters');

    if (!clustersVisible) {
      clustersLayer.clearLayers();
      if (btn) btn.classList.remove('active');
      return;
    }

    if (btn) btn.classList.add('active');
    try {
      const res = await fetch('/api/spatial/clusters');
      const clusters = await res.json();
      clustersLayer.clearLayers();

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

        clustersLayer.addLayer(circle);
      });
    } catch (e) {
      console.error('Failed to load spatial clusters:', e);
    }
  }

  async function handlePolygonDrawn(layer) {
    const latLngs = layer.getLatLngs()[0];
    const coords = latLngs.map((pt) => [pt.lat, pt.lng]);

    try {
      const response = await fetch('/api/spatial/polygon-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polygon_coordinates: coords })
      });

      const data = await response.json();
      displayBoundaryResults(data);
    } catch (e) {
      console.error('Error querying polygon boundary:', e);
    }
  }

  function displayBoundaryResults(data) {
    const card = document.getElementById('boundary-results');
    if (!card) return;

    document.getElementById('b-count').innerText = data.enclosed_count;
    document.getElementById('b-crashes').innerText = data.total_annual_crashes;
    document.getElementById('b-fatalities').innerText = data.total_annual_fatalities;
    document.getElementById('b-surface').innerText = data.enclosed_count > 0 ? `${data.average_surface_index}/100` : '--';

    card.classList.remove('hidden');
  }

  function panToSegment(lat, lon) {
    if (map) {
      map.setView([lat, lon], 12, { animate: true });
    }
  }

  return {
    initMap,
    renderCorridors,
    fitAllCorridors,
    panToSegment
  };
})();
