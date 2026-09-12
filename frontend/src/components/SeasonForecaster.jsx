import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fetchForecast } from '../services/api';

export default function SeasonForecaster({ corridorId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!corridorId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchForecast(corridorId)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [corridorId]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.seasonal_forecast.map((p) => p.period);
    const incidentData = data.seasonal_forecast.map((p) => p.projected_monthly_incidents);
    const multiplierData = data.seasonal_forecast.map((p) => p.risk_multiplier);

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
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

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  const getDirectiveText = (season) => {
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
  };

  return (
    <div className="tab-pane active" id="tab-forecaster">
      <div className="tab-header-flex">
        <div>
          <h3>
            <i className="fa-solid fa-calendar-days"></i> Time-Series Crash Risk Forecaster
          </h3>
          <p className="tab-subtitle">
            Monsoon friction degradation, festival congestion, and fog risk modeling.
          </p>
        </div>
        <div className="vuln-pill">
          <span>Monsoon Vulnerability:</span>
          <strong
            className={
              data && data.monsoon_vulnerability_score >= 70
                ? 'text-critical'
                : 'text-warning'
            }
            id="fc-monsoon-vuln"
          >
            {data ? `${data.monsoon_vulnerability_score.toFixed(1)}/100` : 'Calculating...'}
          </strong>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i> Projecting seasonal accident trajectories...
        </div>
      )}

      {error && (
        <div className="error-state">
          <i className="fa-solid fa-triangle-exclamation"></i> Error loading forecast: {error}
        </div>
      )}

      {/* Chart Container */}
      <div className="chart-container" style={{ position: 'relative', height: '240px' }}>
        <canvas ref={canvasRef} id="forecaster-chart"></canvas>
      </div>

      {/* Seasonal Critical Factors Table */}
      {data && (
        <div className="seasonal-table-wrap">
          <table className="seasonal-table">
            <thead>
              <tr>
                <th>Season Window</th>
                <th>Risk Multiplier</th>
                <th>Monthly Crashes</th>
                <th>MoRTH Mitigation Directive</th>
              </tr>
            </thead>
            <tbody id="forecast-tbody">
              {data.seasonal_forecast.map((p, i) => {
                const multColor =
                  p.risk_multiplier >= 1.3
                    ? 'text-critical'
                    : p.risk_multiplier >= 1.1
                    ? 'text-warning'
                    : 'text-success';

                return (
                  <tr key={i}>
                    <td>
                      <div className="season-name">
                        <strong>{p.period}</strong>
                      </div>
                      <div className="season-sub text-muted">{p.critical_factor}</div>
                    </td>
                    <td>
                      <span className={`multiplier-badge ${multColor}`}>
                        {p.risk_multiplier.toFixed(2)}x
                      </span>
                    </td>
                    <td>
                      <strong className="incident-num">
                        {p.projected_monthly_incidents.toFixed(1)}
                      </strong>
                      <span className="text-muted">/mo</span>
                    </td>
                    <td>
                      <div className="directive-box">
                        <span className={`urgency-tag ${p.mitigation_urgency.toLowerCase()}`}>
                          {p.mitigation_urgency}
                        </span>
                        <span className="directive-text">{getDirectiveText(p.season)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
