import React, { useState } from 'react';
import { signIn, signUp, setDemoProfile } from '../services/supabase';

export default function AuthPage({ onLogin }) {
  const [authMode, setAuthMode] = useState('direct'); // 'direct', 'signin', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Municipal Traffic Engineer');
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
      const targetWorkspace = user.role.toLowerCase().includes('engineer')
        ? 'engineer'
        : user.role.toLowerCase().includes('auditor')
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
        const targetWorkspace = role.toLowerCase().includes('engineer')
          ? 'engineer'
          : role.toLowerCase().includes('auditor')
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
                  <h4>Authority / Executive</h4>
                  <span className="role-sub">State Road Authority</span>
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
                  <h4>Traffic Engineer</h4>
                  <span className="role-sub">Municipal Engineer</span>
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
                  <h4>Safety Auditor</h4>
                  <span className="role-sub">Road Safety Auditor</span>
                  <span className="role-dept">Access: Closed-Loop CV Studio &amp; PyTorch Siamese Verification</span>
                </div>
                <div className="role-chevron">
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </button>
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
                <label>Authority Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Municipal Traffic Engineer">Municipal Traffic Engineer</option>
                  <option value="State Road Authority Executive">State Road Authority Executive</option>
                  <option value="Road Safety Auditor">Road Safety Auditor</option>
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
