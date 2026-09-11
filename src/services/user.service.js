import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Criar usuário (anônimo ou registrado)
// ============================================================================
export const createUser = async (userData = {}) => {
  try {
    const userId = userData.id || uuidv4();

    const newUser = {
      id: userId,
      email: userData.email || null,
      name: userData.name || `Usuário ${userId.slice(0, 8)}`,
      is_anonymous: userData.is_anonymous !== false,
      preferences: {
        routeType: 'balanced',
        wheelchairAccessible: false,
        avoidStairs: false,
        requireElevator: false,
        mobilitySpeed: 1.0,
        language: 'pt-BR',
        theme: 'light',
      },
      accessibility_profile: {
        mobilityLimitation: false,
        visualImpairment: false,
        hearingImpairment: false,
        cognitiveDisability: false,
        custom_needs: null,
      },
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;

    // Criar registro inicial em user_stats
    await supabase.from('user_stats').insert([
      {
        user_id: userId,
        total_routes: 0,
        total_distance: 0,
        total_time: 0,
        average_route_time: 0,
        last_updated: new Date().toISOString(),
      },
    ]);

    return data;
  } catch (error) {
    throw new AppError(`Erro ao criar usuário: ${error.message}`, 500);
  }
};

// ============================================================================
// Obter perfil do usuário
// ============================================================================
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new AppError('Usuário não encontrado', 404);

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erro ao buscar perfil: ${error.message}`, 500);
  }
};

// ============================================================================
// Atualizar preferências do usuário
// ============================================================================
export const updateUserPreferences = async (userId, preferences) => {
  try {
    if (!preferences || typeof preferences !== 'object') {
      throw new AppError('Preferências inválidas', 400);
    }

    // Buscar preferências atuais para mesclar
    const { data: current, error: fetchError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!current) throw new AppError('Usuário não encontrado', 404);

    const mergedPreferences = {
      ...(current.preferences || {}),
      ...preferences,
    };

    const { data, error } = await supabase
      .from('users')
      .update({ preferences: mergedPreferences })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Erro ao atualizar preferências: ${error.message}`,
      500
    );
  }
};

// ============================================================================
// Atualizar perfil de acessibilidade
// ============================================================================
export const updateAccessibilityProfile = async (userId, profile) => {
  try {
    if (!profile || typeof profile !== 'object') {
      throw new AppError('Perfil de acessibilidade inválido', 400);
    }

    const { data: current, error: fetchError } = await supabase
      .from('users')
      .select('accessibility_profile')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!current) throw new AppError('Usuário não encontrado', 404);

    const mergedProfile = {
      ...(current.accessibility_profile || {}),
      ...profile,
    };

    const { data, error } = await supabase
      .from('users')
      .update({ accessibility_profile: mergedProfile })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Erro ao atualizar perfil de acessibilidade: ${error.message}`,
      500
    );
  }
};

// ============================================================================
// Salvar rota favorita
// ============================================================================
export const saveFavoriteRoute = async (userId, routeData) => {
  try {
    // Validar que usuário existe
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!userExists) throw new AppError('Usuário não encontrado', 404);

    const favorite = {
      user_id: userId,
      name: routeData.name || 'Rota Favorita',
      start_location: routeData.start_location || null,
      end_location: routeData.end_location || null,
      route_data: routeData.route_data || null,
      is_favorite: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('saved_routes')
      .insert([favorite])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Erro ao salvar rota favorita: ${error.message}`,
      500
    );
  }
};

// ============================================================================
// Listar rotas favoritas
// ============================================================================
export const getFavoriteRoutes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_routes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new AppError(
      `Erro ao buscar rotas favoritas: ${error.message}`,
      500
    );
  }
};

// ============================================================================
// Registrar navegação (e atualizar user_stats)
// ============================================================================
export const logNavigation = async (userId, navigationData) => {
  try {
    const log = {
      user_id: userId,
      start_location: navigationData.start_location,
      end_location: navigationData.end_location,
      route_used: navigationData.route_used || null,
      actual_time: navigationData.actual_time || null,
      feedback: navigationData.feedback || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('navigation_history')
      .insert([log])
      .select()
      .single();

    if (error) throw error;

    // Atualizar estatísticas do usuário
    await updateUserStats(userId, navigationData.actual_time);

    return data;
  } catch (error) {
    throw new AppError(`Erro ao registrar navegação: ${error.message}`, 500);
  }
};

// ============================================================================
// Atualizar estatísticas do usuário (user_stats)
// ============================================================================
const updateUserStats = async (userId, actualTime) => {
  try {
    // Buscar stats atuais
    const { data: current, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!current) {
      // Criar registro se não existir
      await supabase.from('user_stats').insert([
        {
          user_id: userId,
          total_routes: 1,
          total_distance: 0,
          total_time: actualTime || 0,
          average_route_time: actualTime || 0,
          last_updated: new Date().toISOString(),
        },
      ]);
      return;
    }

    const newTotal = (current.total_routes || 0) + 1;
    const newTotalTime = (current.total_time || 0) + (actualTime || 0);
    const newAvg = newTotal > 0 ? Math.round(newTotalTime / newTotal) : 0;

    await supabase
      .from('user_stats')
      .update({
        total_routes: newTotal,
        total_time: newTotalTime,
        average_route_time: newAvg,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    // Não falha a navegação se não conseguir atualizar stats
    console.error('Erro ao atualizar stats do usuário:', error.message);
  }
};

// ============================================================================
// Atualizar último acesso
// ============================================================================
export const updateLastActive = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new AppError(
      `Erro ao atualizar último acesso: ${error.message}`,
      500
    );
  }
};

// ============================================================================
// Obter estatísticas do usuário (usando user_stats)
// ============================================================================
export const getUserStats = async (userId) => {
  try {
    // Buscar stats agregadas
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (statsError) throw statsError;

    // Buscar total de favoritos
    const { count: favoritesCount, error: favError } = await supabase
      .from('saved_routes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_favorite', true);

    if (favError) throw favError;

    if (!stats) {
      return {
        totalNavigations: 0,
        totalDistance: 0,
        totalTime: 0,
        averageTime: 0,
        totalFavorites: favoritesCount || 0,
      };
    }

    return {
      totalNavigations: stats.total_routes || 0,
      totalDistance: stats.total_distance || 0,
      totalTime: stats.total_time || 0,
      averageTime: stats.average_route_time || 0,
      totalFavorites: favoritesCount || 0,
      lastUpdated: stats.last_updated,
    };
  } catch (error) {
    throw new AppError(
      `Erro ao buscar estatísticas: ${error.message}`,
      500
    );
  }
};
