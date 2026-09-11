import { Router } from 'express';
import * as userService from '../services/user.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// ============================================================================
// POST /api/users - Criar usuário
// ============================================================================
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userData = req.body;
    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user,
    });
  })
);

// ============================================================================
// GET /api/users/:userId - Obter perfil
// ============================================================================
router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.getUserProfile(userId);

    res.json({
      success: true,
      data: user,
    });
  })
);

// ============================================================================
// PUT /api/users/:userId/preferences - Atualizar preferências
// ============================================================================
router.put(
  '/:userId/preferences',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const preferences = req.body;

    const user = await userService.updateUserPreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Preferências atualizadas com sucesso',
      data: user,
    });
  })
);

// ============================================================================
// PUT /api/users/:userId/accessibility - Atualizar acessibilidade
// ============================================================================
router.put(
  '/:userId/accessibility',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const profile = req.body;

    const user = await userService.updateAccessibilityProfile(userId, profile);

    res.json({
      success: true,
      message: 'Perfil de acessibilidade atualizado com sucesso',
      data: user,
    });
  })
);

// ============================================================================
// POST /api/users/:userId/favorites - Salvar rota favorita
// ============================================================================
router.post(
  '/:userId/favorites',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const routeData = req.body;

    const favorite = await userService.saveFavoriteRoute(userId, routeData);

    res.status(201).json({
      success: true,
      message: 'Rota favorita salva com sucesso',
      data: favorite,
    });
  })
);

// ============================================================================
// GET /api/users/:userId/favorites - Listar favoritas
// ============================================================================
router.get(
  '/:userId/favorites',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const favorites = await userService.getFavoriteRoutes(userId);

    res.json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  })
);

// ============================================================================
// POST /api/users/:userId/navigation-log - Registrar navegação
// ============================================================================
router.post(
  '/:userId/navigation-log',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const navigationData = req.body;

    const log = await userService.logNavigation(userId, navigationData);

    res.status(201).json({
      success: true,
      message: 'Navegação registrada com sucesso',
      data: log,
    });
  })
);

// ============================================================================
// POST /api/users/:userId/active - Atualizar último acesso
// ============================================================================
router.post(
  '/:userId/active',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.updateLastActive(userId);

    res.json({
      success: true,
      message: 'Último acesso atualizado',
      data: user,
    });
  })
);

// ============================================================================
// GET /api/users/:userId/stats - Estatísticas
// ============================================================================
router.get(
  '/:userId/stats',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const stats = await userService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  })
);

export default router;
