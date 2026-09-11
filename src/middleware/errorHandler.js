// ============================================================================
// Classe customizada para erros operacionais
// ============================================================================
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// Middleware global de tratamento de erros
// ============================================================================
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  // Log do erro
  console.error(
    `[ERROR] ${new Date().toISOString()} | ${statusCode} | ${req.method} ${req.originalUrl}`
  );
  console.error(`       → ${message}`);

  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Resposta ao cliente
  const response = {
    error: true,
    message: message,
    timestamp: new Date().toISOString(),
  };

  // Incluir stack apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// ============================================================================
// Wrapper para funções assíncronas (captura rejeições de Promise)
// ============================================================================
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
