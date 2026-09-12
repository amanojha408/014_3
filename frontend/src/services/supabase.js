/**
 * Supabase Authentication & Database Service
 * Provides client initialization, session listeners, and authentication flows.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bskempsulqvcygyickwj.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_F-Z6WLLbYfNtoc2b2BgRsw_vODdiHIT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Demo profiles for instant evaluation without email confirmation friction
export const DEMO_PROFILES = {
  morth_officer: {
    id: 'demo-morth-001',
    email: 'officer.sharma@morth.gov.in',
    full_name: 'Rajesh Sharma, IAS',
    role: 'MoRTH National Road Safety Director',
    department: 'Ministry of Road Transport & Highways',
    badge: 'Executive Authority'
  },
  traffic_engineer: {
    id: 'demo-eng-002',
    email: 'engineer.patel@pwd.gov.in',
    full_name: 'Dr. Ananya Patel, M.Tech',
    role: 'Chief Municipal Traffic Engineer',
    department: 'State PWD / NHAI Corridor Wing',
    badge: 'Field Engineer'
  }
};

/**
 * Sign In with Email and Password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

/**
 * Sign Up with Email, Password, and Metadata
 */
export async function signUp(email, password, fullName, role = 'Road Safety Auditor') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Sign Out
 */
export async function signOutUser() {
  localStorage.removeItem('roadsafe_demo_user');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Supabase signOut notice:', error.message);
  }
}

/**
 * Get current session (Supabase or Demo Profile)
 */
export async function getCurrentUserSession() {
  // Check local demo profile first
  const demoUser = localStorage.getItem('roadsafe_demo_user');
  if (demoUser) {
    try {
      return JSON.parse(demoUser);
    } catch {
      localStorage.removeItem('roadsafe_demo_user');
    }
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session) return null;

  const user = data.session.user;
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email.split('@')[0],
    role: user.user_metadata?.role || 'Transport Official',
    badge: 'Supabase Verified'
  };
}

/**
 * Set Quick Demo Profile (for rapid evaluation by judges)
 */
export function setDemoProfile(profileKey) {
  const profile = DEMO_PROFILES[profileKey] || DEMO_PROFILES.morth_officer;
  localStorage.setItem('roadsafe_demo_user', JSON.stringify(profile));
  return profile;
}
