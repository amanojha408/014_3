/**
 * Outcome 4: Time-Series Crash Risk Forecaster View
 * Renders seasonal crash projections (Monsoon friction drop, Diwali festival surges, Winter fog)
 * using Chart.js and detailed MoRTH mitigation directives.
 */

window.RoadSafeForecaster = (function () {
  let chartInstance = null;

  async function loadForecast(corridorId) {
    const vulnElem = document.getElementById('fc-monsoon-vuln');
    const tbody = document.getElementById('forecast-tbody');

    if (vulnElem) vulnElem.innerText = 'Calculating...';
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Projecting seasonal accident trajectories...</td></tr>`;
    }

    try {
      const res = await fetch(`/api/forecaster/${corridorId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (vulnElem) {
        vulnElem.innerText = `${data.monsoon_vulnerability_score.toFixed(1)}/100`;
        vulnElem.className = data.monsoon_vulnerability_score >= 70 ? 'text-critical' : 'text-warning';
      }

      renderChart(data.seasonal_forecast);
      renderTable(data.seasonal_forecast, tbody);
    } catch (err) {
      console.error('Forecaster error:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger py-4"><i class="fa-solid fa-triangle-exclamation"></i> Error loading forecast: ${err.message}</td></tr>`;
      }
    }
  }

  function renderChart(forecastPeriods) {
    const canvas = document.getElementById('forecaster-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = forecastPeriods.map(p => p.period);
    const incidentData = forecastPeriods.map(p => p.projected_monthly_incidents);
    const multiplierData = forecastPeriods.map(p => p.risk_multiplier);

    if (chartInstance) {
      chartInstance.destroy();
    }

    // Chart.js gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Projected Monthly Crashes',
            data: incidentData,
            borderColor: '#ef4444',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y'
          },
          {
            label: 'Risk Multiplier (vs Base)',
            data: multiplierData,
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: "'Outfit', sans-serif", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleFont: { family: "'Outfit', sans-serif", size: 13, weight: 'bold' },
            bodyFont: { family: "'Outfit', sans-serif", size: 12 },
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: "'Outfit', sans-serif" } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: "'Outfit', sans-serif" } },
            title: { display: true, text: 'Monthly Incidents', color: '#94a3b8' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#f59e0b', font: { family: "'Outfit', sans-serif" } },
            title: { display: true, text: 'Risk Multiplier', color: '#f59e0b' }
          }
        }
      }
    });
  }

  function renderTable(forecastPeriods, tbody) {
    if (!tbody) return;
    tbody.innerHTML = '';

    forecastPeriods.forEach(p => {
      const tr = document.createElement('tr');
      const multColor = p.risk_multiplier >= 1.3 ? 'text-critical' : p.risk_multiplier >= 1.1 ? 'text-warning' : 'text-success';

      tr.innerHTML = `
        <td>
          <div class="season-name"><strong>${escapeHtml(p.period)}</strong></div>
          <div class="season-sub text-muted">${escapeHtml(p.critical_factor)}</div>
        </td>
        <td>
          <span class="multiplier-badge ${multColor}">
            ${p.risk_multiplier.toFixed(2)}x
          </span>
        </td>
        <td>
          <strong class="incident-num">${p.projected_monthly_incidents.toFixed(1)}</strong>
          <span class="text-muted">/mo</span>
        </td>
        <td>
          <div class="directive-box">
            <span class="urgency-tag ${p.mitigation_urgency.toLowerCase()}">${p.mitigation_urgency}</span>
            <span class="directive-text">${getDirectiveText(p.season)}</span>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function getDirectiveText(season) {
    switch (season.toLowerCase()) {
      case 'monsoon':
        return 'Apply IRC:35 high-friction thermoplastic surfacing; audit drainage cross-falls to curb hydroplaning.';
      case 'festivals':
        return 'Deploy ITS variable message signs (VMS); enforce speed calming at bottleneck toll plazas.';
      case 'winter':
        return 'Install solar-powered LED road studs (IRC:SP:88) and high-intensity anti-fog yellow retroreflectors.';
      default:
        return 'Conduct regular IRC:67 signage visibility audits and shoulder maintenance.';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  return {
    loadForecast
  };
})();
