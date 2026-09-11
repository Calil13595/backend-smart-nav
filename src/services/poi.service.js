import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

// ============================================================================
// Fórmula de Haversine
// ============================================================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ============================================================================
// Mapa de tipos de POI (centralizado)
// ============================================================================
const POI_TYPE_MAP = {
  classroom: { id: 'classroom', label: 'Salas de Aula', icon: 'door' },
  laboratory: { id: 'laboratory', label: 'Laboratórios', icon: 'beaker' },
  library: { id: 'library', label: 'Bibliotecas', icon: 'book' },
  cafeteria: { id: 'cafeteria', label: 'Cantinas', icon: 'utensils' },
  auditorium: { id: 'auditorium', label: 'Auditórios', icon: 'users' },
  restroom: { id: 'restroom', label: 'Banheiros', icon: 'toilet' },
  elevator: { id: 'elevator', label: 'Elevadores', icon: 'arrow-up' },
  parking: { id: 'parking', label: 'Estacionamento', icon: 'car' },
  health: { id: 'health', label: 'Saúde', icon: 'heart' },
};

// ============================================================================
// Buscar POIs com filtros
// ============================================================================
export const searchPOIs = async (filters = {}) => {
  try {
    let query = supabase.from('points_of_interest').select('*');

    if (filters.query) {
      // Escapar aspas simples para evitar problemas no filtro
      const safeQuery = String(filters.query).replace(/[%_,()]/g, '');
      query = query.or(
        `name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,type.ilike.%${safeQuery}%`
      );
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.campus) {
      query = query.eq('campus', filters.campus);
    }

    if (filters.accessible === true) {
      query = query.eq('is_accessible', true);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;

    const pois = data || [];

    // Filtro por proximidade (feito no servidor após query)
    if (
      filters.latitude !== undefined &&
      filters.longitude !== undefined &&
      !isNaN(filters.latitude) &&
      !isNaN(filters.longitude)
    ) {
      const radius = filters.radius || 500;
      return pois
        .map((poi) => ({
          ...poi,
          distance_meters: Math.round(
            calculateDistance(
              filters.latitude,
              filters.longitude,
              poi.latitude,
              poi.longitude
            )
          ),
        }))
        .filter((poi) => poi.distance_meters <= radius)
        .sort((a, b) => a.distance_meters - b.distance_meters);
    }

    return pois;
  } catch (error) {
    throw new AppError(`Erro ao buscar POIs: ${error.message}`, 500);
  }
};

// ============================================================================
// Buscar POI por ID (com amenities)
// ============================================================================
export const getPOIById = async (id) => {
  try {
    const { data: poi, error } = await supabase
      .from('points_of_interest')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!poi) throw new AppError('POI não encontrado', 404);

    // Buscar amenities do POI
    const { data: amenities, error: amenityError } = await supabase
      .from('poi_amenities')
      .select('amenity_type, details, is_available')
      .eq('poi_id', id);

    if (amenityError) {
      // Não falha a requisição se não conseguir buscar amenities
      console.error('Erro ao buscar amenities:', amenityError.message);
    }

    return {
      ...poi,
      amenities: amenities || [],
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erro ao buscar POI: ${error.message}`, 500);
  }
};

// ============================================================================
// Listar tipos de POI (derivado dos POIs existentes + fallback)
// ============================================================================
export const getPOITypes = async () => {
  try {
    // Buscar todos os POIs e derivar tipos únicos no servidor
    const { data, error } = await supabase
      .from('points_of_interest')
      .select('type');

    if (error) throw error;

    const uniqueTypes = [...new Set((data || []).map((item) => item.type))];

    // Se não houver POIs, retorna o mapa completo como fallback
    if (uniqueTypes.length === 0) {
      return Object.values(POI_TYPE_MAP);
    }

    return uniqueTypes.map(
      (type) =>
        POI_TYPE_MAP[type] || { id: type, label: type, icon: 'map-pin' }
    );
  } catch (error) {
    throw new AppError(`Erro ao buscar tipos: ${error.message}`, 500);
  }
};

// ============================================================================
// POIs próximos de uma coordenada
// ============================================================================
export const getPOIsNearby = async (latitude, longitude, radius = 500) => {
  try {
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new AppError('Latitude e longitude inválidas', 400);
    }

    const { data, error } = await supabase
      .from('points_of_interest')
      .select('*');

    if (error) throw error;

    const nearby = (data || [])
      .map((poi) => ({
        ...poi,
        distance_meters: Math.round(
          calculateDistance(latitude, longitude, poi.latitude, poi.longitude)
        ),
      }))
      .filter((poi) => poi.distance_meters <= radius)
      .sort((a, b) => a.distance_meters - b.distance_meters);

    return nearby;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erro ao buscar POIs próximos: ${error.message}`, 500);
  }
};

// ============================================================================
// Buscar amenities de um POI
// ============================================================================
export const getPOIAmenities = async (poiId) => {
  try {
    const { data, error } = await supabase
      .from('poi_amenities')
      .select('*')
      .eq('poi_id', poiId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new AppError(`Erro ao buscar amenities: ${error.message}`, 500);
  }
};
