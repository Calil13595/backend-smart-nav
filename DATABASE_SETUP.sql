-- ============================================================================
-- CAMPUS SMART NAVIGATION - Database Setup Completo
-- PostgreSQL Schema com 9 Tabelas, Índices, Triggers e RPC Functions
-- ============================================================================

-- Extensão necessária para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABELA: points_of_interest (Pontos de Interesse do Campus)
-- ============================================================================
CREATE TABLE IF NOT EXISTS points_of_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    campus TEXT DEFAULT 'Principal',
    is_accessible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poi_type ON points_of_interest(type);
CREATE INDEX IF NOT EXISTS idx_poi_accessible ON points_of_interest(is_accessible);
CREATE INDEX IF NOT EXISTS idx_poi_campus ON points_of_interest(campus);
CREATE INDEX IF NOT EXISTS idx_poi_location ON points_of_interest(latitude, longitude);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_poi_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS poi_update_timestamp ON points_of_interest;
CREATE TRIGGER poi_update_timestamp BEFORE UPDATE ON points_of_interest
FOR EACH ROW EXECUTE FUNCTION update_poi_timestamp();

-- Dados de exemplo
INSERT INTO points_of_interest (name, type, description, latitude, longitude, campus, is_accessible) VALUES
('Sala de Aula 101', 'classroom', 'Sala com acesso para cadeira de rodas', -21.1596, -47.8096, 'Principal', true),
('Biblioteca Central', 'library', 'Biblioteca com elevadores e acessibilidade completa', -21.1600, -47.8100, 'Principal', true),
('Laboratório de Informática', 'laboratory', 'Lab com computadores e mesas ajustáveis', -21.1598, -47.8098, 'Principal', true),
('Cantina', 'cafeteria', 'Cantina com balcão acessível', -21.1602, -47.8102, 'Principal', true),
('Estacionamento', 'parking', 'Estacionamento com vagas para deficientes', -21.1604, -47.8104, 'Principal', true),
('Enfermaria', 'health', 'Centro de saúde do campus', -21.1606, -47.8106, 'Principal', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. TABELA: poi_amenities (Amenidades de Acessibilidade dos POIs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS poi_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poi_id UUID NOT NULL REFERENCES points_of_interest(id) ON DELETE CASCADE,
    amenity_type TEXT NOT NULL,
    details TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amenity_poi ON poi_amenities(poi_id);
CREATE INDEX IF NOT EXISTS idx_amenity_type ON poi_amenities(amenity_type);

CREATE OR REPLACE FUNCTION update_amenity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS amenity_update_timestamp ON poi_amenities;
CREATE TRIGGER amenity_update_timestamp BEFORE UPDATE ON poi_amenities
FOR EACH ROW EXECUTE FUNCTION update_amenity_timestamp();

-- Dados de exemplo
INSERT INTO poi_amenities (poi_id, amenity_type, details, is_available) 
SELECT id, 'elevator', 'Elevador Prédio A', true FROM points_of_interest WHERE name = 'Sala de Aula 101'
UNION ALL
SELECT id, 'ramp', 'Rampa na entrada', true FROM points_of_interest WHERE name = 'Sala de Aula 101'
UNION ALL
SELECT id, 'wheelchair_access', 'Acesso total para cadeira de rodas', true FROM points_of_interest WHERE name = 'Biblioteca Central'
UNION ALL
SELECT id, 'braille_signage', 'Sinalização em braille', true FROM points_of_interest WHERE name = 'Biblioteca Central'
UNION ALL
SELECT id, 'elevator', 'Elevador na entrada', true FROM points_of_interest WHERE name = 'Biblioteca Central'
UNION ALL
SELECT id, 'accessible_bathroom', 'Banheiro adaptado', true FROM points_of_interest WHERE name = 'Cantina';

-- ============================================================================
-- 3. TABELA: users (Perfil de Usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    accessibility_profile JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_anonymous ON users(is_anonymous);

CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_update_timestamp ON users;
CREATE TRIGGER user_update_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_user_timestamp();

-- ============================================================================
-- 4. TABELA: routes (Rotas Calculadas/Pré-calculadas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    route_type TEXT NOT NULL,
    start_location JSONB NOT NULL,
    end_location JSONB NOT NULL,
    distance INTEGER,
    estimated_time INTEGER,
    difficulty TEXT,
    accessibility_score INTEGER DEFAULT 0,
    safety_score INTEGER DEFAULT 0,
    scenic_score INTEGER DEFAULT 0,
    waypoints JSONB,
    instructions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_type ON routes(route_type);
CREATE INDEX IF NOT EXISTS idx_route_difficulty ON routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_route_accessibility ON routes(accessibility_score);

CREATE OR REPLACE FUNCTION update_route_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS route_update_timestamp ON routes;
CREATE TRIGGER route_update_timestamp BEFORE UPDATE ON routes
FOR EACH ROW EXECUTE FUNCTION update_route_timestamp();

-- ============================================================================
-- 5. TABELA: route_instructions (Instruções Passo a Passo das Rotas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS route_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    distance INTEGER,
    duration INTEGER,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instruction_route ON route_instructions(route_id);

-- ============================================================================
-- 6. TABELA: saved_routes (Rotas Favoritas dos Usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_location JSONB NOT NULL,
    end_location JSONB NOT NULL,
    route_data JSONB,
    is_favorite BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_route_user ON saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_route_favorite ON saved_routes(is_favorite);

CREATE OR REPLACE FUNCTION update_saved_route_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_route_update_timestamp ON saved_routes;
CREATE TRIGGER saved_route_update_timestamp BEFORE UPDATE ON saved_routes
FOR EACH ROW EXECUTE FUNCTION update_saved_route_timestamp();

-- ============================================================================
-- 7. TABELA: navigation_history (Histórico de Navegações)
-- ============================================================================
CREATE TABLE IF NOT EXISTS navigation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_location JSONB NOT NULL,
    end_location JSONB NOT NULL,
    route_used TEXT,
    actual_time INTEGER,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON navigation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created ON navigation_history(created_at);

-- ============================================================================
-- 8. TABELA: user_stats (Estatísticas de Uso dos Usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_routes INTEGER DEFAULT 0,
    total_distance INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    average_route_time INTEGER DEFAULT 0,
    favorite_route_type TEXT,
    accessibility_profile TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stats_user ON user_stats(user_id);

-- ============================================================================
-- 9. TABELA: route_feedback (Feedback das Rotas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS route_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    actual_time INTEGER,
    issues TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_route ON route_feedback(route_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON route_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON route_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_rating_desc ON route_feedback(rating DESC);

-- ============================================================================
-- RPC FUNCTIONS (Stored Procedures)
-- ============================================================================

-- Função 1: Buscar POIs próximos e acessíveis
CREATE OR REPLACE FUNCTION nearby_accessible_pois(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_meters INTEGER DEFAULT 500,
    require_accessible BOOLEAN DEFAULT true
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    type TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_meters NUMERIC,
    is_accessible BOOLEAN,
    amenities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.type,
        p.latitude,
        p.longitude,
        (
            6371000 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(p.latitude - user_lat) / 2), 2) +
                COS(RADIANS(user_lat)) * COS(RADIANS(p.latitude)) *
                POWER(SIN(RADIANS(p.longitude - user_lng) / 2), 2)
            ))
        )::NUMERIC AS distance,
        p.is_accessible,
        array_agg(DISTINCT pa.amenity_type) FILTER (WHERE pa.amenity_type IS NOT NULL)
    FROM points_of_interest p
    LEFT JOIN poi_amenities pa ON p.id = pa.poi_id AND pa.is_available = true
    WHERE (
        6371000 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(p.latitude - user_lat) / 2), 2) +
            COS(RADIANS(user_lat)) * COS(RADIANS(p.latitude)) *
            POWER(SIN(RADIANS(p.longitude - user_lng) / 2), 2)
        ))
    ) <= radius_meters
    AND (NOT require_accessible OR p.is_accessible = true)
    GROUP BY p.id, p.name, p.type, p.latitude, p.longitude, p.is_accessible
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Função 2: Calcular rotas entre dois pontos
CREATE OR REPLACE FUNCTION calculate_routes(
    start_lat DECIMAL,
    start_lng DECIMAL,
    end_lat DECIMAL,
    end_lng DECIMAL
)
RETURNS TABLE(
    distance_meters NUMERIC,
    estimated_minutes INTEGER,
    difficulty TEXT,
    route_type TEXT
) AS $$
DECLARE
    distance NUMERIC;
    est_time INTEGER;
BEGIN
    distance := 6371000 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(end_lat - start_lat) / 2), 2) +
        COS(RADIANS(start_lat)) * COS(RADIANS(end_lat)) *
        POWER(SIN(RADIANS(end_lng - start_lng) / 2), 2)
    ));
    
    est_time := CEIL(distance / 1.4 / 60);
    
    RETURN QUERY
    SELECT 
        distance,
        est_time,
        CASE 
            WHEN distance < 250 THEN 'low'
            WHEN distance < 500 THEN 'medium'
            ELSE 'high'
        END,
        'balanced'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Função 3: Estatísticas agregadas de rotas
CREATE OR REPLACE FUNCTION get_route_stats()
RETURNS TABLE(
    total_feedbacks BIGINT,
    average_rating NUMERIC,
    average_actual_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_feedbacks,
        COALESCE(AVG(rating), 0)::NUMERIC AS average_rating,
        COALESCE(AVG(actual_time) FILTER (WHERE actual_time IS NOT NULL), 0)::NUMERIC AS average_actual_time
    FROM route_feedback;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (Úteis para Queries Comuns)
-- ============================================================================

-- View: POIs com amenidades
CREATE OR REPLACE VIEW pois_with_amenities AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.latitude,
    p.longitude,
    p.campus,
    p.is_accessible,
    json_agg(
        json_build_object(
            'amenity_type', pa.amenity_type,
            'details', pa.details,
            'is_available', pa.is_available
        )
    ) FILTER (WHERE pa.id IS NOT NULL) as amenities
FROM points_of_interest p
LEFT JOIN poi_amenities pa ON p.id = pa.poi_id
GROUP BY p.id, p.name, p.type, p.latitude, p.longitude, p.campus, p.is_accessible;

-- View: Estatísticas de uso
CREATE OR REPLACE VIEW user_usage_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT nh.id) as total_navigations,
    SUM(COALESCE(nh.actual_time, 0)) as total_minutes,
    AVG(COALESCE(nh.actual_time, 0))::INTEGER as avg_route_minutes,
    MAX(nh.created_at) as last_navigation
FROM users u
LEFT JOIN navigation_history nh ON u.id = nh.user_id
GROUP BY u.id, u.name, u.email;

-- ============================================================================
-- COMENTÁRIOS (Documentação)
-- ============================================================================

COMMENT ON TABLE points_of_interest IS 'Pontos de interesse do campus - salas, laboratórios, cantina, etc';
COMMENT ON TABLE poi_amenities IS 'Amenidades de acessibilidade disponíveis em cada POI';
COMMENT ON TABLE users IS 'Perfis de usuários do sistema';
COMMENT ON TABLE routes IS 'Rotas calculadas ou pré-calculadas entre pontos';
COMMENT ON TABLE route_instructions IS 'Instruções passo a passo para cada rota';
COMMENT ON TABLE saved_routes IS 'Rotas favoritas salvas por usuários';
COMMENT ON TABLE navigation_history IS 'Histórico de navegações dos usuários';
COMMENT ON TABLE user_stats IS 'Estatísticas agregadas de uso por usuário';
COMMENT ON TABLE route_feedback IS 'Feedback dos usuários sobre as rotas utilizadas';

-- ============================================================================
-- FIM DO SETUP
-- ============================================================================
