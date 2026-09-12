import React, { useState } from 'react';
import { signIn, signUp, setDemoProfile } from '../services/supabase';

export default function AuthPage({ onLogin }) {
  const [authMode, setAuthMode] = useState('direct'); // 'direct', 'signin', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Fleet Manager');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleDirectAccess = (profileKey, targetWorkspace) => {
    const profile = setDemoProfile(profileKey);
    onLogin(profile, targetWorkspace);
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signIn(email, password);
      const user = {
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.user_metadata?.full_name || res.user.email.split('@')[0],
        role: res.user.user_metadata?.role || 'Authority',
        badge: 'Supabase Verified'
      };
      const targetWorkspace = user.role.toLowerCase().includes('fleet manager')
        ? 'engineer'
        : user.role.toLowerCase().includes('consumer')
        ? 'auditor'
        : 'authority';
      onLogin(user, targetWorkspace);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signUp(email, password, fullName, role);
      setSuccessMsg('Authority account created. Signing you in...');
      if (res.session?.user) {
        const user = {
          id: res.session.user.id,
          email: res.session.user.email,
          full_name: fullName,
          role: role,
          badge: 'Supabase Verified'
        };
        const targetWorkspace = role.toLowerCase().includes('fleet manager')
          ? 'engineer'
          : role.toLowerCase().includes('consumer')
          ? 'auditor'
          : 'authority';
        setTimeout(() => onLogin(user, targetWorkspace), 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Left Hero Panel */}
      <div className="auth-hero-column">
        <div className="hero-brand-top">
          <div className="hero-icon">
            <i className="fa-solid fa-road-barrier"></i>
          </div>
          <div>
            <h1>RoadSafe India 360</h1>
            <p>Digital Road Twin &amp; Safety Network</p>
          </div>
        </div>

        <div className="hero-center-content">
          <div className="hero-headline">
            Continuous Road Safety Intelligence for <span>Transport Authorities</span>.
          </div>
          <p className="hero-desc">
            An end-to-end decision support platform leveraging native TreeSHAP causal explainability,
            model-weight What-If counterfactual simulations, and autonomous Closed-Loop CV verification.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-num">18</span>
              <span className="stat-lbl">Fatalities / Hour</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">40%</span>
              <span className="stat-lbl">At Repeat Blackspots</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">&lt;25ms</span>
              <span className="stat-lbl">CV Verification SLA</span>
            </div>
          </div>
        </div>

        <div className="hero-footer-badges">
          <span className="hero-badge-pill">
            <i className="fa-solid fa-shield-halved"></i> MoRTH Standard
          </span>
          <span className="hero-badge-pill">
            <i className="fa-solid fa-lock"></i> Supabase Auth
          </span>
        </div>
      </div>

      {/* Right Login Column */}
      <div className="auth-form-column">
        <div className="auth-form-container">
          <div className="auth-card-title">Portal Sign In</div>
          <p className="auth-card-subtitle">
            Authenticate to access your assigned authority workspace.
          </p>

          {/* Mode Switcher */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={authMode === 'direct' ? 'active' : ''}
              onClick={() => {
                setAuthMode('direct');
                setErrorMsg('');
              }}
            >
              Role Direct Access
            </button>
            <button
              type="button"
              className={authMode === 'signin' ? 'active' : ''}
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={authMode === 'signup' ? 'active' : ''}
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
            >
              Create Account
            </button>
            <button
              type="button"
              className={authMode === 'howtouse' ? 'active' : ''}
              onClick={() => {
                setAuthMode('howtouse');
                setErrorMsg('');
              }}
            >
              How to Use
            </button>
          </div>

          {errorMsg && (
            <div className="auth-alert error">
              <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success">
              <i className="fa-solid fa-circle-check"></i> {successMsg}
            </div>
          )}

          {/* 1-Click Role Direct Access */}
          {authMode === 'direct' && (
            <div className="role-direct-grid">
              <button
                type="button"
                className="role-direct-card"
                onClick={() => handleRoleDirectAccess('morth_officer', 'authority')}
              >
                <div className="role-icon-circle authority">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div className="role-text-meta">
                  <h4>Government Official</h4>
                  <span className="role-sub">City Planner &amp; Executive</span>
                  <span className="role-dept">Access: Executive Dashboard, SHAP XAI &amp; CRIF CapEx</span>
                </div>
                <div className="role-chevron">
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>

              <button
                type="button"
                className="role-direct-card"
                onClick={() => handleRoleDirectAccess('traffic_engineer', 'engineer')}
              >
                <div className="role-icon-circle engineer">
                  <i className="fa-solid fa-compass-drafting"></i>
                </div>
                <div className="role-text-meta">
                  <h4>Fleet Manager</h4>
                  <span className="role-sub">Logistics Partner</span>
                  <span className="role-dept">Access: Ward Safety Zoning &amp; Speed Calming Simulator</span>
                </div>
                <div className="role-chevron">
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>

              <button
                type="button"
                className="role-direct-card"
                onClick={() => handleRoleDirectAccess('traffic_engineer', 'auditor')}
              >
                <div className="role-icon-circle auditor">
                  <i className="fa-solid fa-camera-retro"></i>
                </div>
                <div className="role-text-meta">
                  <h4>Consumer / Citizen</h4>
                  <span className="role-sub">Daily Commuter</span>
                  <span className="role-dept">Access: Closed-Loop CV Studio &amp; PyTorch Siamese Verification</span>
                </div>
                <div className="role-chevron">
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
            </div>
          )}

          {/* How to Use Mode */}
          {authMode === 'howtouse' && (
            <div className="how-to-use-section" style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#0f172a', marginBottom: '1.2rem', fontSize: '1.15rem', fontWeight: 'bold' }}>Understanding User Roles</h3>
              
              <div style={{ marginBottom: '1.2rem', padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #2563eb', borderRadius: '6px' }}>
                <h4 style={{ color: '#2563eb', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                  <i className="fa-solid fa-building-columns"></i> Government Official
                </h4>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                  <strong style={{ color: '#1e293b' }}>Target User:</strong> Government Officials & City Planners.<br/>
                  <strong style={{ color: '#1e293b' }}>Purpose:</strong> Provides a high-level view of the national road network. Use this role to monitor key performance indicators (KPIs) like monitored corridors, high-hazard segments, and budget allocations. It features a map to visualize risk, a SHAP explainer to understand why a segment is risky, and tools for forecasting seasonal risk and generating prescriptive safety interventions.
                </p>
              </div>

              <div style={{ marginBottom: '1.2rem', padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #10b981', borderRadius: '6px' }}>
                <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                  <i className="fa-solid fa-compass-drafting"></i> Fleet Manager
                </h4>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                  <strong style={{ color: '#1e293b' }}>Target User:</strong> Logistics Partners & Fleet Managers (e.g., Delivery Companies).<br/>
                  <strong style={{ color: '#1e293b' }}>Purpose:</strong> Focused on safe route planning. Use this role to view granular details about a specific corridor and run safe Route Optimization algorithms to direct delivery fleets away from critical hazard zones and blackspots.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #8b5cf6', borderRadius: '6px' }}>
                <h4 style={{ color: '#8b5cf6', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                  <i className="fa-solid fa-camera-retro"></i> Consumer / Citizen
                </h4>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                  <strong style={{ color: '#1e293b' }}>Target User:</strong> Daily Commuters & Citizens.<br/>
                  <strong style={{ color: '#1e293b' }}>Purpose:</strong> Responsible for validating road conditions and reporting issues via crowd-sourced dashcam footage. Use this role to access the Computer Vision (CV) Studio, where dashcam feeds automatically verify if repairs meet safety baselines using PyTorch Siamese Neural Networks.
                </p>
              </div>
            </div>
          )}

          {/* Supabase Email/Password Sign In */}
          {authMode === 'signin' && (
            <form onSubmit={handleEmailSignIn}>
              <div className="field-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="officer@morth.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-full-primary" disabled={loading}>
                {loading ? 'Authenticating via Supabase...' : 'Enter Authority Workspace'}
              </button>
            </form>
          )}

          {/* Supabase Registration */}
          {authMode === 'signup' && (
            <form onSubmit={handleEmailSignUp}>
              <div className="field-group">
                <label>Full Name &amp; Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Mahindra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@pwd.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>User Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Government Official">Government Official</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Consumer / Citizen">Consumer / Citizen</option>
                </select>
              </div>

              <button type="submit" className="btn-full-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register Authority Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
