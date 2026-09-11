import { Router } from 'express';
import * as poiService from '../services/poi.service.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/search', asyncHandler(async (req, res) => {
  const { query, type, campus, accessible, latitude, longitude, radius } = req.query;

  const filters = {
    query,
    type,
    campus,
    accessible: accessible === 'true',
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    radius: radius ? parseFloat(radius) : 500,
  };

  const data = await poiService.searchPOIs(filters);

  res.json({
    success: true,
    count: data.length,
    data,
  });
}));

router.get('/types', asyncHandler(async (req, res) => {
  const data = await poiService.getPOITypes();

  res.json({
    success: true,
    data,
  });
}));

router.get('/nearby/:latitude/:longitude', asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.params;
  const { radius } = req.query;

  const data = await poiService.getPOIsNearby(
    parseFloat(latitude),
    parseFloat(longitude),
    radius ? parseFloat(radius) : 500
  );

  res.json({
    success: true,
    count: data.length,
    data,
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await poiService.getPOIById(id);

  res.json({
    success: true,
    data,
  });
}));

export default router;