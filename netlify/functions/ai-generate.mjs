// Función de servidor (Netlify) para generar preguntas con la clave de Groq del sitio
// SIN exponerla en el navegador. Solo atiende a usuarios con sesión válida en Supabase.
//
// Variables de entorno en Netlify (Site configuration > Environment variables):
//   GROQ_API_KEY       -> clave privada de Groq (NO usar prefijo VITE_)
//   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (o SUPABASE_URL / SUPABASE_ANON_KEY)

const GROQ_MODEL = 'openai/gpt-oss-120b';
const MAX_SYSTEM_CHARS = 8000;
const MAX_USER_CHARS = 4000;
const MAX_TOKENS = 2500;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function isValidSupabaseSession(accessToken) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey || !accessToken) return false;

  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` }
  });
  return res.ok;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido.' }, 405);
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return jsonResponse({ error: 'La IA del servidor no está configurada. Ingresa tu propia clave de Groq en "⚙️ Claves".' }, 503);
  }

  const accessToken = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!(await isValidSupabaseSession(accessToken))) {
    return jsonResponse({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Solicitud inválida.' }, 400);
  }

  const system = String(body.system || '').slice(0, MAX_SYSTEM_CHARS);
  const user = String(body.user || '').slice(0, MAX_USER_CHARS);
  if (!system || !user) {
    return jsonResponse({ error: 'Solicitud incompleta.' }, 400);
  }
  const maxTokens = Math.min(Math.max(Number(body.maxTokens) || 2000, 200), MAX_TOKENS);
  const temperature = Math.min(Math.max(Number(body.temperature) || 0.2, 0), 1);

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature,
      max_tokens: maxTokens,
      ...(body.json === false ? {} : { response_format: { type: 'json_object' } })
    })
  });

  if (!groqRes.ok) {
    const status = groqRes.status === 429 ? 429 : 502;
    const message = groqRes.status === 429
      ? 'Se alcanzó el límite de uso de la IA del servidor. Intenta en unos minutos o usa tu propia clave de Groq.'
      : `La IA del servidor respondió con error (${groqRes.status}).`;
    return jsonResponse({ error: message }, status);
  }

  const data = await groqRes.json();
  return jsonResponse({ content: data.choices?.[0]?.message?.content || '' });
};
