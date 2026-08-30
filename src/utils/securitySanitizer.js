/**
 * Utility de Seguridad Integral y Sanitización
 * Protección contra Inyección SQL, XSS, Command Injection y ataques CQRS
 */

// Patrones peligrosos de inyección SQL y comandos maliciosos
const SQL_INJECTION_PATTERNS = [
  /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/g,
  /('|\b)(OR|AND)\b.+?=.+?/gi,
  /(\bUNION\b.+?\bSELECT\b)/gi
];

// Patrones de script y XSS
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /onclick\s*=/gi,
  /<iframe/gi
];

/**
 * Sanitiza cualquier texto ingresado por el usuario en formularios o búsquedas
 * @param {string} input - Cadena de texto a limpiar
 * @param {Object} options - Opciones de sanitización
 * @returns {string} - Cadena de texto segura y libre de inyecciones
 */
export function sanitizeInput(input, options = {}) {
  if (typeof input !== 'string') {
    return typeof input === 'number' ? String(input) : '';
  }

  let cleaned = input.trim();

  // Eliminar etiquetas HTML peligrosas
  cleaned = cleaned.replace(/<[^>]*>?/gm, '');

  // Si no se permite SQL, neutralizar secuencias de escape y comentarios SQL
  if (!options.allowSql) {
    SQL_INJECTION_PATTERNS.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, '');
    });
  }

  // Eliminar vectores XSS
  XSS_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Limitar longitud máxima si se especifica
  if (options.maxLength && cleaned.length > options.maxLength) {
    cleaned = cleaned.substring(0, options.maxLength);
  }

  return cleaned;
}

/**
 * Sanitiza términos de búsqueda médica (permite tildes, números, guiones, puntos y espacios)
 * @param {string} query
 * @returns {string}
 */
export function sanitizeMedicalSearch(query) {
  if (typeof query !== 'string') return '';
  // Permitir letras del español (con tildes y eñes), números y puntuación médica básica
  const sanitized = query
    .replace(/[<>'"`;{}()[\]\\]/g, '')
    .trim()
    .slice(0, 120);
  return sanitized;
}

/**
 * Valida un formato de correo electrónico
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida que una URL de Supabase sea legítima y segura (HTTPS)
 * @param {string} url
 * @returns {boolean}
 */
export function isValidSupabaseUrl(url) {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && (parsed.hostname.endsWith('.supabase.co') || parsed.hostname === 'localhost');
  } catch {
    return false;
  }
}
