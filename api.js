// ============================================================================
// API Client - Campus Smart Navigation
// ============================================================================
// Em Vite: use import.meta.env.VITE_API_URL
// Em Create React App: use process.env.REACT_APP_API_URL
// Fallback para localhost em desenvolvimento
// ============================================================================

const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return 'http://localhost:3000/api';
};

const API_URL = getBaseUrl();

// ============================================================================
// Helper genérico para requisições
// ============================================================================
const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data.message);
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error(`Erro em ${endpoint}:`, error.message);
    throw error;
  }
};

// ============================================================================
// PONTOS DE INTERESSE (POI)
// ============================================================================

export const searchPOIs = async (query, type = null) => {
  try {
    let url = `/poi/search?query=${encodeURIComponent(query)}`;
    if (type) url += `&type=${type}`;

    const data = await request(url);
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar POIs:', error);
    return [];
  }
};

export const getPOITypes = async () => {
  try {
    const data = await request('/poi/types');
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar tipos de POI:', error);
    return [];
  }
};

export const getPOIById = async (id) => {
  try {
    const data = await request(`/poi/${id}`);
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar POI:', error);
    return null;
  }
};

export const getNearbyPOIs = async (latitude, longitude, radius = 500) => {
  try {
    const data = await request(
      `/poi/nearby/${latitude}/${longitude}?radius=${radius}`
    );
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar POIs próximos:', error);
    return [];
  }
};

// ============================================================================
// ROTAS
// ============================================================================

export const calculateRoute = async (start, end, preferences = {}) => {
  try {
    const data = await request('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify({
        start,
        end,
        preferences: {
          routeType: 'balanced',
          wheelchairAccessible: false,
          avoidStairs: false,
          requireElevator: false,
          mobilitySpeed: 1.0,
          language: 'pt-BR',
          ...preferences,
        },
      }),
    });
    return data.data?.routes || [];
  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    return [];
  }
};

export const compareRoutes = async (start, end) => {
  try {
    const data = await request('/routes/compare', {
      method: 'POST',
      body: JSON.stringify({ start, end }),
    });
    return data.data?.routes || [];
  } catch (error) {
    console.error('Erro ao comparar rotas:', error);
    return [];
  }
};

export const calculateDistance = async (start, end) => {
  try {
    const data = await request(
      `/routes/distance?startLat=${start.latitude}&startLng=${start.longitude}&endLat=${end.latitude}&endLng=${end.longitude}`
    );
    return data.data;
  } catch (error) {
    console.error('Erro ao calcular distância:', error);
    return null;
  }
};

export const sendRouteFeedback = async (
  routeId,
  userId,
  rating,
  feedback,
  actualTime = null,
  issues = null
) => {
  try {
    const data = await request('/routes/feedback', {
      method: 'POST',
      body: JSON.stringify({
        routeId,
        userId,
        rating,
        feedback,
        actualTime,
        issues,
      }),
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao enviar feedback:', error);
    return false;
  }
};

export const getRouteStats = async () => {
  try {
    const data = await request('/routes/stats');
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de rotas:', error);
    return null;
  }
};

// ============================================================================
// USUÁRIOS
// ============================================================================

export const createUser = async (email, name) => {
  try {
    const data = await request('/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name,
        is_anonymous: false,
      }),
    });
    return data.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
};

export const createAnonymousUser = async () => {
  try {
    const data = await request('/users', {
      method: 'POST',
      body: JSON.stringify({ is_anonymous: true }),
    });
    return data.data;
  } catch (error) {
    console.error('Erro ao criar usuário anônimo:', error);
    return null;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const data = await request(`/users/${userId}`);
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const data = await request(`/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return false;
  }
};

export const updateAccessibilityProfile = async (userId, profile) => {
  try {
    const data = await request(`/users/${userId}/accessibility`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao atualizar perfil de acessibilidade:', error);
    return false;
  }
};

export const saveFavoriteRoute = async (
  userId,
  name,
  startLocation,
  endLocation,
  routeData
) => {
  try {
    const data = await request(`/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        start_location: startLocation,
        end_location: endLocation,
        route_data: routeData,
      }),
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao salvar rota favorita:', error);
    return false;
  }
};

export const getFavoriteRoutes = async (userId) => {
  try {
    const data = await request(`/users/${userId}/favorites`);
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar rotas favoritas:', error);
    return [];
  }
};

export const logNavigation = async (
  userId,
  startLocation,
  endLocation,
  routeUsed,
  actualTime
) => {
  try {
    const data = await request(`/users/${userId}/navigation-log`, {
      method: 'POST',
      body: JSON.stringify({
        start_location: startLocation,
        end_location: endLocation,
        route_used: routeUsed,
        actual_time: actualTime,
      }),
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao registrar navegação:', error);
    return false;
  }
};

export const updateUserActive = async (userId) => {
  try {
    const data = await request(`/users/${userId}/active`, {
      method: 'POST',
    });
    return data.success;
  } catch (error) {
    console.error('Erro ao atualizar último acesso:', error);
    return false;
  }
};

export const getUserStats = async (userId) => {
  try {
    const data = await request(`/users/${userId}/stats`);
    return data.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return null;
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async () => {
  try {
    const data = await request('/health');
    return data;
  } catch (error) {
    console.error('Erro no health check:', error);
    return null;
  }
};

// ============================================================================
// Export default
// ============================================================================
export default {
  // POI
  searchPOIs,
  getPOITypes,
  getPOIById,
  getNearbyPOIs,
  // Rotas
  calculateRoute,
  compareRoutes,
  calculateDistance,
  sendRouteFeedback,
  getRouteStats,
  // Usuários
  createUser,
  createAnonymousUser,
  getUserProfile,
  updateUserPreferences,
  updateAccessibilityProfile,
  saveFavoriteRoute,
  getFavoriteRoutes,
  logNavigation,
  updateUserActive,
  getUserStats,
  // Health
  healthCheck,
};
