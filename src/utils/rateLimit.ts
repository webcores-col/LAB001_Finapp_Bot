/**
 * Rate Limiter con ventana de tiempo deslizante
 *
 * Mejoras sobre el sistema anterior:
 * - Límite por ventana de tiempo (no permanente)
 * - Limpieza automática de entradas expiradas
 * - Previene fugas de memoria
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60_000; // 1 minuto
const CLEANUP_INTERVAL_MS = 300_000; // 5 minutos

/**
 * Verifica si una clave está dentro del límite de rate
 *
 * @param key - Identificador único (ej: "telegram:123456" o "whatsapp:+1234567890")
 * @param limit - Número máximo de requests permitidos en la ventana
 * @returns true si está permitido, false si excedió el límite
 */
export const rateLimit = (key: string, limit = 10): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Si no existe o la ventana expiró, crear nueva ventana
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    return true;
  }

  // Si llegó al límite, rechazar
  if (entry.count >= limit) {
    return false;
  }

  // Incrementar contador
  entry.count++;
  return true;
};

/**
 * Limpia entradas expiradas del store para liberar memoria
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[RateLimit] Cleaned ${cleaned} expired entries`);
  }
};

/**
 * Obtiene estadísticas del rate limiter (para debugging/monitoreo)
 */
export const getRateLimitStats = () => {
  return {
    totalKeys: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetsIn: Math.max(0, entry.resetAt - Date.now())
    }))
  };
};

/**
 * Resetea el contador para una clave específica (útil para testing)
 */
export const resetRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

/**
 * Resetea todos los contadores (útil para testing)
 */
export const resetAllRateLimits = (): void => {
  rateLimitStore.clear();
};

// Ejecutar limpieza periódica cada 5 minutos
setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);

console.log('[RateLimit] Initialized with window:', WINDOW_MS, 'ms');
