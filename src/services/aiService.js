import AI_PROMPTS from '../data/aiPrompts.json';
import { SERUMS_RANDOM_TOPIC_SEEDS, getRandomPeruLocation } from '../data/serumsPearls';
import { CAREERS } from '../data/careers';
import { getSupabaseClient } from './supabaseClient';
import { sanitizeInput } from '../utils/securitySanitizer';

// Clave por defecto desde variables de entorno (.env / Netlify). El usuario puede pegar otra en "⚙️ Claves".
// Si no hay ninguna, se usa la función de servidor /.netlify/functions/ai-generate.
const DEFAULT_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_NVIDIA_API_KEY || '';
const AI_KEY_STORAGE = 'serums_ai_active_api_key';
const SERVER_AI_ENDPOINT = '/.netlify/functions/ai-generate';
const NVIDIA_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const GROQ_MODEL = 'openai/gpt-oss-120b'; // Ultra rápido (~2s) y máxima capacidad de razonamiento clínico
const GEMINI_MODEL = 'gemini-3.8-flash'; // gemini-1.5-flash fue retirado por Google

export function getStoredAiKey() {
  try {
    const raw = localStorage.getItem(AI_KEY_STORAGE);
    return (raw ? String(JSON.parse(raw) || '').trim() : '') || DEFAULT_API_KEY;
  } catch {
    return DEFAULT_API_KEY;
  }
}

// Determinar proveedor de IA segun el formato de la clave
export function detectAiProvider(apiKey = '') {
  const key = apiKey.trim();
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('AIzaSy')) return 'gemini';
  if (key.startsWith('nvapi-')) return 'nvidia';
  return 'nvidia'; // Por defecto
}

/**
 * Parser JSON resiliente que repara automaticamente anomalias de sintaxis comunes de LLM:
 * 1. Llaves sin cerrar en objetos internos (ej. options: { A: '...', correctAnswer: '...')
 * 2. Comillas no escapadas o comas sobrantes al final
 * 3. Extractor regex de emergencia si falla el parseo estandar
 */
function parseResilientAiJson(rawContent, defaultCategory = 'salud_publica') {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('La IA devolvió una respuesta vacía.');
  }

  let text = rawContent.trim();

  // Limpiar bloques de codigo markdown si estan presentes
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    text = text.split('```')[1].split('```')[0].trim();
  }

  // Encontrar la primera { y la ultima }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 1. Intento directo con JSON.parse
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.question && parsed.options) {
      return sanitizeParsedObject(parsed, defaultCategory);
    }
  } catch (e1) {
    // Continuar a auto-reparacion
  }

  // 2. Auto-reparaciones sintacticas
  let repaired = text;

  // Reparar objeto "options" sin cerrar
  repaired = repaired.replace(/"options"\s*:\s*\{([^}]+?)(,\s*"correctAnswer")/g, '"options": {$1}$2');

  // Reparar llave de cierre faltante al final
  if (!repaired.endsWith('}')) {
    repaired = repaired + '}';
  }

  // Reparar comas sobrantes
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  try {
    const parsed = JSON.parse(repaired);
    if (parsed && parsed.question) {
      return sanitizeParsedObject(parsed, defaultCategory);
    }
  } catch (e2) {
    // Continuar a extraccion por expresiones regulares
  }

  // 3. Extraccion de emergencia con Regex multilínea
  const extractField = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].replace(/\\"/g, '"').trim() : '';
  };

  const question = extractField(/"question"\s*:\s*"([^"]+)"/) || extractField(/"question"\s*:\s*`([^`]+)`/);
  const optA = extractField(/"A"\s*:\s*"([^"]+)"/);
  const optB = extractField(/"B"\s*:\s*"([^"]+)"/);
  const optC = extractField(/"C"\s*:\s*"([^"]+)"/);
  const optD = extractField(/"D"\s*:\s*"([^"]+)"/);
  const ans = extractField(/"correctAnswer"\s*:\s*"([A-D])"/);
  const why = extractField(/"whyThisQuestion"\s*:\s*"([^"]+)"/);
  const exp = extractField(/"explanation"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"(?:pearl|references)")/) || extractField(/"explanation"\s*:\s*"([^"]+)"/);
  const pearl = extractField(/"pearl"\s*:\s*"([^"]+)"/);
  const ref = extractField(/"references"\s*:\s*"([^"]+)"/);

  if (question && optA && optB) {
    return {
      question,
      options: {
        A: optA,
        B: optB,
        C: optC || 'Conducta alternativa no recomendada',
        D: optD || 'Manejo en EESS de mayor complejidad'
      },
      correctAnswer: ans || 'A',
      category: defaultCategory,
      whyThisQuestion: why || 'Evalúa la capacidad de toma de decisiones clínicas y aplicación de la norma MINSA en el primer nivel.',
      explanation: exp || 'Justificación clínica y fundamentación basada en la Norma Técnica de Salud aplicable para el primer nivel de atención del MINSA.',
      pearl: pearl || 'Prioriza siempre la aplicación rigurosa de las Normas Técnicas MINSA vigentes.',
      references: ref || 'Norma Técnica de Salud MINSA'
    };
  }

  throw new Error('La IA generó una respuesta incompleta. Por favor, intenta generar nuevamente.');
}

function shuffleOptionsAndAnswer(options, correctAnswer) {
  const letters = ['A', 'B', 'C', 'D'];
  const correctText = options[correctAnswer] || options['A'];
  
  const entries = letters.map(l => ({ letter: l, text: options[l] || `Opción ${l}` }));
  
  // Algoritmo de barajado Fisher-Yates
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[j], entries[i]] = [entries[i], entries[j]];
  }

  const newOptions = {};
  let newCorrectAnswer = 'A';
  letters.forEach((l, idx) => {
    newOptions[l] = entries[idx].text;
    if (entries[idx].text === correctText) {
      newCorrectAnswer = l;
    }
  });

  return { options: newOptions, correctAnswer: newCorrectAnswer };
}

function sanitizeParsedObject(parsed, defaultCategory) {
  const baseOptions = parsed.options || {
    A: 'Opción A',
    B: 'Opción B',
    C: 'Opción C',
    D: 'Opción D'
  };
  const baseCorrectAnswer = parsed.correctAnswer || 'A';
  
  // Barajar opciones para asegurar distribucion uniforme y equilibrada de claves A, B, C y D
  const { options: shuffledOptions, correctAnswer: shuffledAnswer } = shuffleOptionsAndAnswer(baseOptions, baseCorrectAnswer);

  return {
    question: parsed.question,
    options: shuffledOptions,
    correctAnswer: shuffledAnswer,
    category: parsed.category || defaultCategory,
    whyThisQuestion: parsed.whyThisQuestion || 'Evalúa el razonamiento clínico y la aplicación de la Norma Técnica en el primer nivel de atención.',
    explanation: parsed.explanation || 'Justificación clínica basada en las Normas Técnicas de Salud y guías de práctica clínica del MINSA.',
    pearl: parsed.pearl || 'Perla de estudio de alto rendimiento calibrada para el Examen SERUMS.',
    references: parsed.references || 'Norma Técnica de Salud MINSA'
  };
}

export function getAiProviderLabel(apiKey = '') {
  if (!apiKey.trim()) return 'IA del servidor';
  const provider = detectAiProvider(apiKey);
  return provider === 'groq' ? 'Groq LPU' : provider === 'gemini' ? 'Google Gemini' : 'NVIDIA NIM';
}

async function readErrorDetail(response) {
  const errText = await response.text();
  try {
    const parsed = JSON.parse(errText);
    return parsed?.error?.message || parsed?.error || parsed?.detail || parsed?.message || errText;
  } catch {
    return errText;
  }
}

// Envía un prompt al proveedor que corresponda y devuelve el texto de la respuesta.
async function requestCompletion({ systemPrompt, userPrompt, apiKey, maxTokens = 2000, json = true, temperature = 0.2 }) {
  const activeKey = (apiKey || DEFAULT_API_KEY).trim();

  if (!activeKey) {
    // Sin clave propia: función de servidor (requiere sesión iniciada en Supabase)
    const client = getSupabaseClient();
    const { data } = client ? await client.auth.getSession() : { data: null };
    const accessToken = data?.session?.access_token;
    if (!accessToken) {
      throw new Error('Inicia sesión o ingresa tu propia clave de IA en "⚙️ Claves" para generar preguntas.');
    }

    let response;
    try {
      response = await fetch(SERVER_AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ system: systemPrompt, user: userPrompt, maxTokens, json, temperature })
      });
    } catch (netErr) {
      throw new Error(`No se pudo conectar con la IA del servidor (${netErr.message}).`);
    }

    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    if (!isJson) {
      throw new Error('La IA del servidor no está disponible en este entorno. Ingresa tu propia clave gratuita de Groq en "⚙️ Claves".');
    }
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || `Error de la IA del servidor (${response.status}).`);
    }
    return payload?.content || '';
  }

  const provider = detectAiProvider(activeKey);

  if (provider === 'groq') {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {})
      })
    }).catch((err) => {
      throw new Error(`Fallo de conexión con Groq: ${err.message}`);
    });

    if (!response.ok) {
      throw new Error(`Error en Groq API (${response.status}): ${await readErrorDetail(response)}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'gemini') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': activeKey
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          ...(json ? { responseMimeType: 'application/json' } : {}),
          temperature,
          // Los modelos Gemini 3 "piensan" antes de responder y consumen tokens de salida
          maxOutputTokens: Math.max(maxTokens, 4096)
        }
      })
    }).catch((err) => {
      throw new Error(`Fallo de conexión con Gemini: ${err.message}`);
    });

    if (!response.ok) {
      throw new Error(`Error en Google Gemini API (${response.status}): ${await readErrorDetail(response)}`);
    }
    const data = await response.json();
    return (data.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('');
  }

  // NVIDIA NIM (vía proxy /api/nvidia de Vite/Netlify por CORS)
  const response = await fetch('/api/nvidia/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${activeKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: Math.min(maxTokens, 1500)
    })
  }).catch((err) => {
    throw new Error(`Error de conexión con la IA (${err.message}). Verifica tu conexión.`);
  });

  if (!response.ok) {
    if (response.status === 504) {
      throw new Error('El servidor de IA tardó en responder (504 Gateway Timeout). Por favor, presiona "Generar Pregunta" nuevamente.');
    }
    throw new Error(`Error en API NVIDIA (${response.status}): ${await readErrorDetail(response)}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function fillCareer(template, career) {
  return template
    .replaceAll('{{CAREER}}', career.name)
    .replaceAll('{{ROLE}}', career.role)
    .replaceAll('{{FOCUS}}', career.focus);
}

export async function generateSingleQuestion({
  category = 'all',
  difficulty = 'standard',
  topic = '',
  apiKey = getStoredAiKey(),
  careerId = 'medicina'
}) {
  const career = CAREERS[careerId] || CAREERS.medicina;
  const isMedicine = career.id === 'medicina';
  const cleanTopic = sanitizeInput(topic || '', { maxLength: 120 });

  let promptTopic = '';
  if (cleanTopic) {
    promptTopic = `específicamente sobre el tema: "${cleanTopic}"`;
  } else if (category && category !== 'all' && AI_PROMPTS.categoryTopics[category]) {
    promptTopic = `obligatoriamente sobre el bloque oficial: "${AI_PROMPTS.categoryTopics[category]}"`;
    if (!isMedicine) {
      promptTopic += `, desde el rol y las competencias de un(a) ${career.role}`;
    }
  } else if (!isMedicine && career.topics.length > 0) {
    const randomTopic = career.topics[Math.floor(Math.random() * career.topics.length)];
    promptTopic = `centrado en un tema de alto rendimiento para ${career.name}: "${randomTopic.topic}"`;
  } else {
    // Seleccionar semilla aleatoria para garantizar maxima variedad tematica entre generaciones consecutivas
    const randomSeed = SERUMS_RANDOM_TOPIC_SEEDS[Math.floor(Math.random() * SERUMS_RANDOM_TOPIC_SEEDS.length)];
    promptTopic = `centrado en una situación clínica o normativa de alto rendimiento: "${randomSeed}"`;
  }

  const randomLocation = getRandomPeruLocation();
  const locationInstruction = `Ambientada OBLIGATORIAMENTE en: ${randomLocation.eess} de la ${randomLocation.diresa}, provincia de ${randomLocation.province}, distrito de ${randomLocation.district} (${randomLocation.geo}).`;

  const difficultyDesc = AI_PROMPTS.difficultyDescriptions[difficulty] || difficulty;
  const systemPrompt = isMedicine ? AI_PROMPTS.systemPrompt : fillCareer(AI_PROMPTS.careerSystemPrompt, career);
  const examName = isMedicine
    ? 'pregunta clínica oficial de alta dificultad para el Examen Nacional SERUMS de Medicina del Perú 2026-II'
    : `pregunta de alta dificultad para la Evaluación SERUMS de ${career.name} del Perú, dirigida a un(a) ${career.role}`;
  const userPrompt = `Formula 1 ${examName}.
${locationInstruction}
${promptTopic}
(Nivel de complejidad: ${difficulty} - ${difficultyDesc}).
REGLA CRÍTICA: En el campo "explanation" debes incluir OBLIGATORIAMENTE la JUSTIFICACIÓN DETALLADA de la respuesta correcta Y el DESCARTE TÉCNICO DE CADA DISTRACTOR (prohibido respuestas cortas).
Genera DIRECTAMENTE el JSON completo con todas sus claves (question, options con A, B, C, D, correctAnswer, category, whyThisQuestion, explanation, pearl, references).`;

  const rawContent = await requestCompletion({ systemPrompt, userPrompt, apiKey, maxTokens: 2000, json: true });

  const defaultCategory = (category !== 'all' ? category : 'salud_publica');
  const parsed = parseResilientAiJson(rawContent, defaultCategory);

  return {
    id: `ai-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    year: `Generado con IA (${getAiProviderLabel(apiKey || DEFAULT_API_KEY)})`,
    career: career.id,
    number: 1,
    question: parsed.question,
    options: parsed.options,
    correctAnswer: parsed.correctAnswer,
    category: parsed.category,
    difficulty,
    page: 1,
    pearl: parsed.pearl,
    explanation: parsed.explanation,
    whyThisQuestion: parsed.whyThisQuestion,
    references: parsed.references
  };
}

// Explica una pregunta oficial (cuya clave ya se conoce) con IA.
export async function explainOfficialQuestion({ question, careerId = 'medicina', apiKey = getStoredAiKey() }) {
  const career = CAREERS[careerId] || CAREERS.medicina;
  const options = question.options || {};
  const userPrompt = `Pregunta del examen oficial SERUMS ${question.year || ''}:
${question.question}

A) ${options.A || ''}
B) ${options.B || ''}
C) ${options.C || ''}
D) ${options.D || ''}

Clave oficial del MINSA: ${question.correctAnswer}) ${options[question.correctAnswer] || ''}
Explica la respuesta siguiendo exactamente el formato indicado.`;

  const text = await requestCompletion({
    systemPrompt: fillCareer(AI_PROMPTS.explainSystemPrompt, career),
    userPrompt,
    apiKey,
    maxTokens: 1500,
    json: false,
    temperature: 0.1
  });

  const clean = text.replace(/\*\*/g, '').trim();
  if (!clean) throw new Error('La IA devolvió una respuesta vacía. Intenta nuevamente.');
  return clean;
}

// Generar mini reto con estricta proteccion de creditos y tasa de peticiones (maximo 2 preguntas)
export async function generateExamBatch({
  totalQuestions = 2,
  category = 'all',
  difficulty = 'standard',
  topic = '',
  apiKey = getStoredAiKey(),
  careerId = 'medicina',
  onProgress
}) {
  const clampedTotal = Math.min(Math.max(1, totalQuestions), 2);
  const questions = [];

  for (let i = 0; i < clampedTotal; i++) {
    if (onProgress) {
      onProgress(i + 1, clampedTotal);
    }
    
    const question = await generateSingleQuestion({
      category,
      difficulty,
      topic,
      apiKey,
      careerId
    });

    question.number = i + 1;
    questions.push(question);

    // Pausa breve para evitar limite de peticiones de la API
    if (i < clampedTotal - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  return questions;
}
