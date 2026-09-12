import React, { useState } from 'react';
import { signIn, signUp, setDemoProfile } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, onUserChange }) {
  const [tab, setTab] = useState('demo'); // 'demo', 'signin', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Municipal Traffic Engineer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = (profileKey) => {
    const user = setDemoProfile(profileKey);
    onUserChange(user);
    onClose();
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await signIn(email, password);
      const user = {
        id: res.user.id,
        email: res.user.email,
        full_name: res.user.user_metadata?.full_name || res.user.email,
        role: res.user.user_metadata?.role || 'Transport Authority',
        badge: 'Supabase Verified'
      };
      onUserChange(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await signUp(email, password, fullName, role);
      setSuccessMsg('Account created successfully! You can now sign in or check your confirmation email.');
      if (res.session?.user) {
        const user = {
          id: res.session.user.id,
          email: res.session.user.email,
          full_name: fullName,
          role: role,
          badge: 'Supabase Verified'
        };
        onUserChange(user);
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="auth-modal">
      <div className="modal-dialog auth-dialog">
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa-solid fa-user-shield"></i> Transport Authority Authentication
          </div>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Subtitle & Info */}
          <div className="auth-intro-box">
            <span className="badge-flag">🇮🇳</span>
            <div>
              <strong>National Road Safety Portal Security Gate</strong>
              <p>Protected by Supabase Auth with Row-Level Security (RLS) and Audit Trails.</p>
            </div>
          </div>

          {/* Auth Mode Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'demo' ? 'active' : ''}`}
              onClick={() => {
                setTab('demo');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <i className="fa-solid fa-bolt"></i> 1-Click Demo Login
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setTab('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setTab('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <i className="fa-solid fa-user-plus"></i> Create Account
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

          {/* Tab 1: 1-Click Demo Access */}
          {tab === 'demo' && (
            <div className="demo-login-pane">
              <p className="demo-login-instruction">
                Select an official role below for instant, frictionless evaluation access:
              </p>

              <div className="demo-cards-grid">
                <button
                  type="button"
                  className="demo-profile-card"
                  onClick={() => handleDemoLogin('morth_officer')}
                >
                  <div className="demo-avatar officer">
                    <i className="fa-solid fa-building-columns"></i>
                  </div>
                  <div className="demo-info">
                    <h4>Rajesh Sharma, IAS</h4>
                    <span className="demo-role">MoRTH National Safety Director</span>
                    <span className="demo-dept">Ministry of Road Transport &amp; Highways</span>
                  </div>
                  <div className="demo-arrow">
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-profile-card"
                  onClick={() => handleDemoLogin('traffic_engineer')}
                >
                  <div className="demo-avatar engineer">
                    <i className="fa-solid fa-helmet-safety"></i>
                  </div>
                  <div className="demo-info">
                    <h4>Dr. Ananya Patel, M.Tech</h4>
                    <span className="demo-role">Chief Municipal Traffic Engineer</span>
                    <span className="demo-dept">State PWD / NHAI Corridor Wing</span>
                  </div>
                  <div className="demo-arrow">
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </button>
              </div>

              <div className="demo-note">
                <i className="fa-solid fa-circle-info"></i> Instant evaluator session with full privileges to draw Geoman boundaries, run What-If simulations, and audit CV repairs.
              </div>
            </div>
          )}

          {/* Tab 2: Standard Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="auth-form">
              <div className="form-group">
                <label>
                  <i className="fa-solid fa-envelope"></i> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@morth.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fa-solid fa-lock"></i> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Authenticating via Supabase...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 3: Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="auth-form">
              <div className="form-group">
                <label>
                  <i className="fa-solid fa-user"></i> Full Name &amp; Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rao"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fa-solid fa-envelope"></i> Official Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="v.rao@transport.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fa-solid fa-lock"></i> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fa-solid fa-id-badge"></i> Authority Role
                </label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Municipal Traffic Engineer">Municipal Traffic Engineer</option>
                  <option value="State Road Authority Executive">State Road Authority Executive</option>
                  <option value="MoRTH Safety Auditor">MoRTH Safety Auditor</option>
                  <option value="Highway Concessionaire Lead">Highway Concessionaire Lead</option>
                </select>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Registering via Supabase...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus"></i> Create Authority Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
