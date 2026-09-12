-- ==============================================================================
-- RoadSafe India 360 - Supabase PostgreSQL Schema & Seed Script
-- Project URL: https://bskempsulqvcygyickwj.supabase.co
-- Run this in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Enable PostGIS Extension (Optional for advanced geospatial queries)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table 1: Transport Authority User Profiles
-- Automatically synchronized with auth.users on signup
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'Municipal Traffic Engineer',
    department TEXT DEFAULT 'Ministry of Road Transport & Highways',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Trigger: Automatically insert profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, department)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'Municipal Traffic Engineer'),
        COALESCE(new.raw_user_meta_data->>'department', 'MoRTH / State PWD')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Table 2: Indian Highway Corridors & Blackspot Ground Truth
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.corridor_blackspots (
    id TEXT PRIMARY KEY,
    corridor_name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    chainage_km NUMERIC NOT NULL,
    state TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    traffic_density_pcu NUMERIC NOT NULL,
    surface_quality_index NUMERIC NOT NULL,
    curvature_index NUMERIC NOT NULL,
    lighting_index NUMERIC NOT NULL,
    signage_visibility NUMERIC NOT NULL,
    monsoon_degradation NUMERIC NOT NULL,
    historical_crashes_annual INT NOT NULL,
    fatalities_annual INT NOT NULL,
    speed_limit_kmh INT NOT NULL,
    lanes INT NOT NULL,
    blackspot_severity TEXT NOT NULL,
    primary_hazard TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.corridor_blackspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of corridor blackspots" 
ON public.corridor_blackspots FOR SELECT 
USING (true);

-- Seed Corridor Ground Truth Data
INSERT INTO public.corridor_blackspots (
    id, corridor_name, location_name, chainage_km, state, latitude, longitude,
    traffic_density_pcu, surface_quality_index, curvature_index, lighting_index,
    signage_visibility, monsoon_degradation, historical_crashes_annual, fatalities_annual,
    speed_limit_kmh, lanes, blackspot_severity, primary_hazard
) VALUES
('NH48-SEG-01', 'NH-48 (Delhi-Jaipur)', 'Bilaspur Chowk Junction', 44.5, 'Haryana', 28.3242, 76.9012, 78000, 42.0, 38.0, 22.0, 45.0, 72.0, 48, 21, 80, 6, 'Critical', 'Severe Potholes & Inadequate Junction Lighting'),
('NH48-SEG-02', 'NH-48 (Delhi-Jaipur)', 'Panchgaon Chowk Exit', 52.8, 'Haryana', 28.3015, 76.8624, 71000, 55.0, 45.0, 30.0, 52.0, 65.0, 36, 14, 80, 6, 'High', 'Faded Edge Delineation & High Night Speed Variance'),
('NH48-SEG-03', 'NH-48 (Delhi-Jaipur)', 'Dharuhera Flyover Approach', 68.2, 'Haryana', 28.2141, 76.7938, 65000, 38.0, 58.0, 18.0, 35.0, 80.0, 54, 26, 70, 6, 'Critical', 'Missing Crash Barrier & Water Pooling'),
('NH48-SEG-04', 'NH-48 (Delhi-Jaipur)', 'Bawal Industrial Bypass', 88.6, 'Haryana', 28.0812, 76.6124, 59000, 60.0, 32.0, 40.0, 62.0, 55.0, 28, 10, 80, 6, 'Moderate', 'Shoulder Encroachment & Heavy Freight Merging'),
('MPEW-SEG-01', 'Mumbai-Pune Expressway', 'Bhor Ghat S-Curves (Amrutanjan Point)', 48.2, 'Maharashtra', 18.7615, 73.3768, 52000, 48.0, 88.0, 35.0, 50.0, 92.0, 72, 34, 50, 6, 'Critical', 'Steep Downhill Gradient & High Hydroplaning Friction Drop'),
('MPEW-SEG-02', 'Mumbai-Pune Expressway', 'Madap Tunnel Approach', 34.1, 'Maharashtra', 18.8251, 73.2842, 54000, 65.0, 70.0, 45.0, 58.0, 85.0, 41, 18, 60, 6, 'High', 'Abrupt Lighting Transition & Blind Entry Curvature'),
('BLR-ORR-01', 'Bengaluru Outer Ring Road', 'Central Silk Board Junction', 18.5, 'Karnataka', 12.9174, 77.6231, 94000, 35.0, 25.0, 28.0, 30.0, 78.0, 62, 19, 50, 8, 'Critical', 'Severe Rutting, Unregulated Weaving & Waterlogging'),
('DME-SEG-01', 'Delhi-Meerut Expressway', 'Dasna Interchange Flyover', 27.4, 'Uttar Pradesh', 28.6812, 77.5142, 82000, 78.0, 40.0, 65.0, 75.0, 45.0, 22, 7, 100, 14, 'Moderate', 'High Speed Variance at High-Speed Toll Exit')
ON CONFLICT (id) DO UPDATE SET
    traffic_density_pcu = EXCLUDED.traffic_density_pcu,
    surface_quality_index = EXCLUDED.surface_quality_index,
    historical_crashes_annual = EXCLUDED.historical_crashes_annual,
    fatalities_annual = EXCLUDED.fatalities_annual;

-- ==============================================================================
-- Table 3: Closed-Loop CV Repair Audit Trail ("The Secret Sauce")
-- Logs PyTorch Siamese verification results against IBM COS & Watson ML
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cv_repair_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT NOT NULL,
    segment_id TEXT REFERENCES public.corridor_blackspots(id),
    contractor_id TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    siamese_similarity_score NUMERIC(6, 4) NOT NULL,
    threshold NUMERIC(4, 2) DEFAULT 0.88,
    status TEXT NOT NULL, -- 'VERIFIED_CLOSED' or 'REJECTED_DEFICIENT'
    latency_ms NUMERIC(6, 2) NOT NULL,
    siamese_feature_distance NUMERIC(6, 4),
    audit_verdict TEXT NOT NULL,
    cos_storage_uri TEXT,
    watson_model_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cv_repair_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on cv_repair_audits" 
ON public.cv_repair_audits FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on cv_repair_audits" 
ON public.cv_repair_audits FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Seed initial verification evidence
INSERT INTO public.cv_repair_audits (
    ticket_id, segment_id, contractor_id, hazard_type, 
    siamese_similarity_score, threshold, status, latency_ms,
    siamese_feature_distance, audit_verdict, cos_storage_uri, watson_model_id
) VALUES 
(
    'TKT-2026-NH48-44', 'NH48-SEG-01', 'CONTR-LNT-01', 'Severe Pothole Cluster & Edge Cracking',
    0.9421, 0.88, 'VERIFIED_CLOSED', 24.8, 0.0579,
    'Surface texture and bitumen uniformity match certified Safe Baseline within 5.79% margin. Resurfacing approved.',
    'cos://roadsafe-india-telemetry-bucket/verifications/TKT-2026-NH48-44/evidence_verified.json',
    'xgboost-road-risk-v3.2'
),
(
    'TKT-2026-MPEW-48', 'MPEW-SEG-01', 'CONTR-MH-PWD', 'Loose Aggregate & Edge Ravelling',
    0.6214, 0.88, 'REJECTED_DEFICIENT', 19.3, 0.3786,
    'Significant visual disparity (37.86% distance). Pothole depression remains visible under oblique lighting. Contractor must re-apply hot mix.',
    'cos://roadsafe-india-telemetry-bucket/verifications/TKT-2026-MPEW-48/evidence_rejected.json',
    'xgboost-road-risk-v3.2'
);

-- ==============================================================================
-- Table 4: Municipal Administrative Safety Zones (Leaflet-Geoman Polygons)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.municipal_safety_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL,
    engineer_id UUID REFERENCES auth.users(id),
    polygon_geojson JSONB NOT NULL,
    enclosed_segments_count INT DEFAULT 0,
    total_annual_crashes INT DEFAULT 0,
    total_annual_fatalities INT DEFAULT 0,
    average_surface_index NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.municipal_safety_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on municipal_safety_zones" 
ON public.municipal_safety_zones FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on municipal_safety_zones" 
ON public.municipal_safety_zones FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Success verification message
SELECT 'RoadSafe India 360 database schema and seed data successfully initialized!' AS status;
