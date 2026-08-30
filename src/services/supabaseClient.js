import { createClient } from '@supabase/supabase-js';

// Claves obtenidas exclusivamente desde variables de entorno seguras (.env / Netlify) o localStorage del usuario
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Obtener credenciales activas (desde localStorage o variables de entorno)
export function getActiveSupabaseCredentials() {
  const localUrl = localStorage.getItem('serums_supabase_url') || '';
  const localKey = localStorage.getItem('serums_supabase_anon_key') || '';

  const url = (localUrl || ENV_SUPABASE_URL).trim();
  const anonKey = (localKey || ENV_SUPABASE_ANON_KEY).trim();

  return { url, anonKey };
}

// Guardar credenciales personalizadas en localStorage
export function saveSupabaseCredentials(url, anonKey) {
  if (url) localStorage.setItem('serums_supabase_url', url.trim());
  else localStorage.removeItem('serums_supabase_url');

  if (anonKey) localStorage.setItem('serums_supabase_anon_key', anonKey.trim());
  else localStorage.removeItem('serums_supabase_anon_key');
}

// Crear cliente de Supabase dinámicamente
let cachedClient = null;
let cachedCredentials = '';

export function getSupabaseClient() {
  const { url, anonKey } = getActiveSupabaseCredentials();
  if (!url || !anonKey) return null;

  const currentCredsKey = `${url}:${anonKey}`;
  if (cachedClient && cachedCredentials === currentCredsKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    cachedCredentials = currentCredsKey;
    return cachedClient;
  } catch (error) {
    console.error('Error al inicializar cliente Supabase:', error);
    return null;
  }
}

// Verificar si Supabase está configurado
export function isSupabaseConfigured() {
  const { url, anonKey } = getActiveSupabaseCredentials();
  return Boolean(url && anonKey);
}

// Probar conexión con la base de datos
export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('No se han configurado la URL y el Token (Anon Key) de Supabase.');
  }

  const { data, error } = await client.from('preguntas_ia').select('id').limit(1);
  if (error) {
    throw new Error(`Error en Supabase: ${error.message} (Verifica que la tabla "preguntas_ia" exista)`);
  }

  return { success: true, count: data?.length || 0 };
}

// Guardar una pregunta generada por la IA en la nube (tabla preguntas_ia)
export async function saveAiQuestionToCloud(question) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, reason: 'not_configured' };
  }

  const optionsObj = question.options || {};

  const payload = {
    id: question.id,
    question: question.question,
    option_a: optionsObj.A || '',
    option_b: optionsObj.B || '',
    option_c: optionsObj.C || '',
    option_d: optionsObj.D || '',
    correct_answer: question.correctAnswer,
    category: question.category || 'salud_publica',
    difficulty: question.difficulty || 'standard',
    year: question.year || 'Generado con IA (NVIDIA)',
    why_this_question: question.whyThisQuestion || '',
    explanation: question.explanation || '',
    pearl: question.pearl || '',
    references: question.references || '',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await client
      .from('preguntas_ia')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('No se pudo guardar en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.warn('Error al enviar pregunta a Supabase:', err.message);
    return { success: false, error: err.message };
  }
}

// Obtener preguntas guardadas en la nube
export async function fetchCloudAiQuestions({ category = 'all', limit = 50, offset = 0 } = {}) {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    let query = client
      .from('preguntas_ia')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error al consultar preguntas de Supabase:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      question: row.question,
      options: {
        A: row.option_a || 'Opción A',
        B: row.option_b || 'Opción B',
        C: row.option_c || 'Opción C',
        D: row.option_d || 'Opción D'
      },
      correctAnswer: row.correct_answer,
      category: row.category,
      difficulty: row.difficulty || 'standard',
      year: row.year || 'Generado con IA',
      whyThisQuestion: row.why_this_question,
      explanation: row.explanation,
      pearl: row.pearl,
      references: row.references,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.error('Fallo al obtener preguntas de Supabase:', err);
    return [];
  }
}
