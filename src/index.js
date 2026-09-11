import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

import poiRoutes from './routes/poi.routes.js';
import routeRoutes from './routes/route.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// CORS - Configuração segura para produção
// ============================================================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile, curl, etc.)
    if (!origin) return callback(null, true);

    // Em desenvolvimento, permitir qualquer origem
    if (NODE_ENV === 'development') return callback(null, true);

    // Em produção, validar contra lista permitida
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não permitida por CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ============================================================================
// Body parsers
// ============================================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================================
// Health check
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Campus Smart Navigation API',
    version: '1.0.0',
    environment: NODE_ENV,
  });
});

// ============================================================================
// Rotas da API
// ============================================================================
app.use('/api/poi', poiRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/users', userRoutes);

// ============================================================================
// 404 handler
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================================
// Error handler (deve ser o último middleware)
// ============================================================================
app.use(errorHandler);

// ============================================================================
// Start server (apenas em ambiente não-serverless)
// ============================================================================
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Ambiente: ${NODE_ENV}`);
  });
}

export default app;
