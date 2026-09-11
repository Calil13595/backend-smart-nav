import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

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

const estimateTime = (distance, mobilitySpeed = 1.0) => {
  const avgSpeed = 1.4 * mobilitySpeed;
  const timeSeconds = distance / avgSpeed;
  return Math.round(timeSeconds / 60);
};

const getCompassDirection = (lat1, lon1, lat2, lon2) => {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  
  const directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
  const index = Math.round(((bearing % 360) + 360) % 360 / 45) % 8;
  return directions[index];
};

const generateInstructions = (start, end, type) => {
  const distance = calculateDistance(start.latitude, start.longitude, end.latitude, end.longitude);
  const dir = getCompassDirection(start.latitude, start.longitude, end.latitude, end.longitude);

  const instructions = [
    {
      instruction: `Caminhe em direção ao ${dir} por ${Math.round(distance * 0.4)}m`,
      distance: Math.round(distance * 0.4),
      duration: Math.round((distance * 0.4) / (1.4 * 60)),
    },
    {
      instruction: 'Continue seguindo em frente',
      distance: Math.round(distance * 0.35),
      duration: Math.round((distance * 0.35) / (1.4 * 60)),
    },
    {
      instruction: `Você chegou ao seu destino!`,
      distance: Math.round(distance * 0.25),
      duration: Math.round((distance * 0.25) / (1.4 * 60)),
    },
  ];

  if (type === 'accessible') {
    instructions.splice(1, 0, {
      instruction: '⚠️ Use a rampa de acesso à direita (acessível para cadeira de rodas)',
      distance: 30,
      duration: 1,
    });
  }

  return instructions;
};

export const calculateRoute = async (start, end, preferences = {}) => {
  try {
    if (!start || !end) {
      throw new AppError('Coordenadas de início e fim são obrigatórias', 400);
    }

    const routeType = preferences.routeType || 'balanced';
    const wheelchairAccessible = preferences.wheelchairAccessible || false;
    const avoidStairs = preferences.avoidStairs || false;
    const mobilitySpeed = preferences.mobilitySpeed || 1.0;

    const distance = calculateDistance(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude
    );

    if (distance < 1) {
      throw new AppError('Origem e destino são muito próximos', 400);
    }

    const baseTime = estimateTime(distance, mobilitySpeed);

    const routes = [
      {
        id: `route-${Date.now()}-1`,
        name: '🚀 Rota Mais Rápida',
        distance: Math.round(distance * 0.9),
        estimatedTime: Math.round(baseTime * 0.85),
        estimatedTimeAdjusted: Math.round(baseTime * 0.85 * (1 / mobilitySpeed)),
        difficulty: 'low',
        accessibilityScore: 6,
        safetyScore: 7,
        steps: generateInstructions(start, end, 'fastest'),
        accessibility: {
          hasElevators: false,
          hasRamps: true,
          hasStairs: false,
          hasWheelchairAccess: true,
        },
      },
      {
        id: `route-${Date.now()}-2`,
        name: '🛡️ Rota Mais Segura',
        distance: Math.round(distance * 1.1),
        estimatedTime: Math.round(baseTime * 1.1),
        estimatedTimeAdjusted: Math.round(baseTime * 1.1 * (1 / mobilitySpeed)),
        difficulty: 'low',
        accessibilityScore: 8,
        safetyScore: 9,
        steps: generateInstructions(start, end, 'safest'),
        accessibility: {
          hasElevators: true,
          hasRamps: true,
          hasStairs: false,
          hasWheelchairAccess: true,
        },
      },
      {
        id: `route-${Date.now()}-3`,
        name: '♿ Rota Acessível',
        distance: Math.round(distance * 1.2),
        estimatedTime: Math.round(baseTime * 1.3),
        estimatedTimeAdjusted: Math.round(baseTime * 1.3 * (1 / mobilitySpeed)),
        difficulty: 'medium',
        accessibilityScore: 10,
        safetyScore: 8,
        steps: generateInstructions(start, end, 'accessible'),
        accessibility: {
          hasElevators: true,
          hasRamps: true,
          hasStairs: false,
          hasWheelchairAccess: true,
        },
      },
      {
        id: `route-${Date.now()}-4`,
        name: '⚖️ Rota Balanceada',
        distance: Math.round(distance),
        estimatedTime: baseTime,
        estimatedTimeAdjusted: Math.round(baseTime * (1 / mobilitySpeed)),
        difficulty: 'low',
        accessibilityScore: 7,
        safetyScore: 8,
        steps: generateInstructions(start, end, 'balanced'),
        accessibility: {
          hasElevators: false,
          hasRamps: true,
          hasStairs: false,
          hasWheelchairAccess: true,
        },
      },
    ];

    let filteredRoutes = routes;
    if (wheelchairAccessible) {
      filteredRoutes = routes.filter(r => r.accessibility.hasWheelchairAccess);
    }
    if (avoidStairs) {
      filteredRoutes = routes.filter(r => !r.accessibility.hasStairs);
    }

    if (routeType === 'fastest') {
      filteredRoutes.sort((a, b) => a.estimatedTime - b.estimatedTime);
    } else if (routeType === 'safest') {
      filteredRoutes.sort((a, b) => b.safetyScore - a.safetyScore);
    } else if (routeType === 'accessible') {
      filteredRoutes.sort((a, b) => b.accessibilityScore - a.accessibilityScore);
    }

    return {
      routes: filteredRoutes,
      startPoint: start,
      endPoint: end,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erro ao calcular rota: ${error.message}`, 500);
  }
};

export const calculateDistanceOnly = (startLat, startLng, endLat, endLng) => {
  try {
    const distance = calculateDistance(startLat, startLng, endLat, endLng);
    const time = estimateTime(distance);

    return {
      distance: {
        meters: Math.round(distance),
        kilometers: (distance / 1000).toFixed(2),
      },
      estimatedTime: {
        minutes: time,
        formatted: `${Math.floor(time / 60)}h ${time % 60}min`,
      },
      direction: getCompassDirection(startLat, startLng, endLat, endLng),
    };
  } catch (error) {
    throw new AppError(`Erro ao calcular distância: ${error.message}`, 500);
  }
};

export const estimateTimeOnly = (distance, mobilitySpeed = 1.0) => {
  try {
    const time = estimateTime(distance, mobilitySpeed);
    return {
      minutes: time,
      formatted: `${Math.floor(time / 60)}h ${time % 60}min`,
    };
  } catch (error) {
    throw new AppError(`Erro ao estimar tempo: ${error.message}`, 500);
  }
};