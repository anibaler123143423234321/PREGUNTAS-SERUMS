import AI_PROMPTS from '../data/aiPrompts.json';
import { SERUMS_RANDOM_TOPIC_SEEDS, getRandomPeruLocation } from '../data/serumsPearls';

const DEFAULT_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_NVIDIA_API_KEY || '';
const NVIDIA_MODEL = 'meta/llama-3.2-11b-vision-instruct';
const GROQ_MODEL = 'openai/gpt-oss-120b'; // Ultra rápido (~2s) y máxima capacidad de razonamiento clínico
  
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

export async function generateSingleQuestion({
  category = 'all',
  difficulty = 'standard',
  topic = '',
  apiKey = DEFAULT_API_KEY
}) {
  const activeKey = (apiKey || DEFAULT_API_KEY).trim();
  if (!activeKey) {
    throw new Error('No se encontró una clave de API configurada (Groq, Gemini o NVIDIA). Por favor ingrésala en la configuración.');
  }

  const provider = detectAiProvider(activeKey);

  let promptTopic = '';
  if (topic && topic.trim()) {
    promptTopic = `específicamente sobre el tema: "${topic.trim()}"`;
  } else if (category && category !== 'all' && AI_PROMPTS.categoryTopics[category]) {
    promptTopic = `obligatoriamente sobre el bloque oficial: "${AI_PROMPTS.categoryTopics[category]}"`;
  } else {
    // Seleccionar semilla aleatoria para garantizar maxima variedad tematica entre generaciones consecutivas
    const randomSeed = SERUMS_RANDOM_TOPIC_SEEDS[Math.floor(Math.random() * SERUMS_RANDOM_TOPIC_SEEDS.length)];
    promptTopic = `centrado en una situación clínica o normativa de alto rendimiento: "${randomSeed}"`;
  }

  const randomLocation = getRandomPeruLocation();
  const locationInstruction = `Ambientada OBLIGATORIAMENTE en: ${randomLocation.eess} de la ${randomLocation.diresa}, provincia de ${randomLocation.province}, distrito de ${randomLocation.district} (${randomLocation.geo}).`;

  const difficultyDesc = AI_PROMPTS.difficultyDescriptions[difficulty] || difficulty;
  const systemPrompt = AI_PROMPTS.systemPrompt;
  const userPrompt = `Formula 1 pregunta clínica oficial de alta dificultad para el Examen Nacional SERUMS de Medicina del Perú 2026-II.
${locationInstruction}
${promptTopic}
(Nivel de complejidad: ${difficulty} - ${difficultyDesc}).
REGLA CRÍTICA: En el campo "explanation" debes incluir OBLIGATORIAMENTE la JUSTIFICACIÓN DETALLADA de la respuesta correcta Y el DESCARTE TÉCNICO DE CADA DISTRACTOR (prohibido respuestas cortas).
Genera DIRECTAMENTE el JSON completo con todas sus claves (question, options con A, B, C, D, correctAnswer, category, whyThisQuestion, explanation, pearl, references).`;

  let rawContent = '';

  if (provider === 'groq') {
    // ⚡ Proveedor Groq Cloud (Ultra Rápido ~2s)
    try {
      const response = await fetch('/api/groq/chat/completions', {
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
          temperature: 0.2,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error en Groq API (${response.status}): ${errText}`);
      }

      const data = await response.json();
      rawContent = data.choices?.[0]?.message?.content || '';
    } catch (groqErr) {
      throw new Error(`Fallo de conexión con Groq: ${groqErr.message}`);
    }
  } else if (provider === 'gemini') {
    // ⚡ Proveedor Google Gemini Flash (1.5s)
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15,
            maxOutputTokens: 800
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error en Google Gemini API (${response.status}): ${errText}`);
      }

      const data = await response.json();
      rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (geminiErr) {
      throw new Error(`Fallo de conexión con Gemini: ${geminiErr.message}`);
    }
  } else {
    // 🛡️ Proveedor NVIDIA NIM
    try {
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
          temperature: 0.15,
          max_tokens: 650
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let errorDetail = errText;
        try {
          const parsedError = JSON.parse(errText);
          errorDetail = parsedError?.error?.message || parsedError?.detail || parsedError?.message || errText;
        } catch {
          // Mantener errText
        }
        
        if (response.status === 504) {
          throw new Error('El servidor de IA tardó en responder (504 Gateway Timeout). Por favor, presiona "Generar Pregunta" nuevamente.');
        }
        
        throw new Error(`Error en API NVIDIA (${response.status}): ${errorDetail}`);
      }

      const data = await response.json();
      rawContent = data.choices?.[0]?.message?.content || '';
    } catch (nvidiaErr) {
      throw new Error(`Error de conexión con la IA (${nvidiaErr.message}). Verifica tu conexión.`);
    }
  }

  const defaultCategory = (category !== 'all' ? category : 'salud_publica');
  const parsed = parseResilientAiJson(rawContent, defaultCategory);

  const providerLabel = provider === 'groq' ? 'Groq LPU (0.8s)' : provider === 'gemini' ? 'Google Gemini' : 'NVIDIA NIM';

  return {
    id: `ai-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    year: `Generado con IA (${providerLabel})`,
    number: 1,
    question: parsed.question,
    options: parsed.options,
    correctAnswer: parsed.correctAnswer,
    category: parsed.category,
    page: 1,
    pearl: parsed.pearl,
    explanation: parsed.explanation,
    whyThisQuestion: parsed.whyThisQuestion,
    references: parsed.references
  };
}

// Generar mini reto con estricta proteccion de creditos y tasa de peticiones (maximo 2 preguntas)
export async function generateExamBatch({
  totalQuestions = 2,
  category = 'all',
  difficulty = 'standard',
  topic = '',
  apiKey = DEFAULT_API_KEY,
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
      apiKey
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
