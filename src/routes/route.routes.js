import { Router } from 'express';
import * as routeService from '../services/route.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// ============================================================================
// POST /api/routes/calculate - Calcular rota
// ============================================================================
router.post(
  '/calculate',
  asyncHandler(async (req, res) => {
    const { start, end, preferences, userId } = req.body;

    const result = await routeService.calculateRoute(start, end, preferences);

    res.json({
      success: true,
      data: {
        ...result,
        userId: userId || null,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

// ============================================================================
// GET /api/routes/distance - Calcular distância
// ============================================================================
router.get(
  '/distance',
  asyncHandler(async (req, res) => {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      throw new AppError(
        'startLat, startLng, endLat e endLng são obrigatórios',
        400
      );
    }

    const result = routeService.calculateDistanceOnly(
      startLat,
      startLng,
      endLat,
      endLng
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

// ============================================================================
// GET /api/routes/time - Estimar tempo
// ============================================================================
router.get(
  '/time',
  asyncHandler(async (req, res) => {
    const { distance, mobilitySpeed } = req.query;

    if (!distance) {
      throw new AppError('distance é obrigatório', 400);
    }

    const result = routeService.estimateTimeOnly(
      distance,
      mobilitySpeed ? parseFloat(mobilitySpeed) : 1.0
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

// ============================================================================
// POST /api/routes/feedback - Registrar feedback (persistido)
// ============================================================================
router.post(
  '/feedback',
  asyncHandler(async (req, res) => {
    const { routeId, userId, rating, feedback, actualTime, issues } = req.body;

    const data = await routeService.submitRouteFeedback({
      routeId,
      userId,
      rating,
      feedback,
      actualTime,
      issues,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback registrado com sucesso',
      data,
    });
  })
);

// ============================================================================
// POST /api/routes/compare - Comparar rotas
// ============================================================================
router.post(
  '/compare',
  asyncHandler(async (req, res) => {
    const { start, end, preferences } = req.body;

    const result = await routeService.compareRoutes(start, end, preferences);

    res.json({
      success: true,
      data: result,
    });
  })
);

// ============================================================================
// GET /api/routes/stats - Estatísticas de rotas
// ============================================================================
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await routeService.getRouteStats();

    res.json({
      success: true,
      data: stats,
    });
  })
);

// Import necessário para AppError
import { AppError } from '../middleware/errorHandler.js';

export default router;
