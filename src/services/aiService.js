import AI_PROMPTS from '../data/aiPrompts.json';

const DEFAULT_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || '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';
const MODEL_NAME = 'meta/llama-3.2-11b-vision-instruct';

// Determine endpoint: Use reverse proxy (/api/nvidia) in both dev (Vite) and production (Netlify) to prevent CORS errors
function getEndpoint() {
  return '/api/nvidia/chat/completions';
}

/**
 * Resilient JSON parser that automatically repairs common LLM structural glitches:
 * 1. Missing closing braces in inner objects (e.g., options: { A: '..', correctAnswer: '..')
 * 2. Unescaped quotes or trailing commas
 * 3. Fallback regex extraction if standard parsing fails
 */
function parseResilientAiJson(rawContent, defaultCategory = 'salud_publica') {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('La IA devolvió una respuesta vacía.');
  }

  let text = rawContent.trim();

  // Strip markdown code fences if present
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    text = text.split('```')[1].split('```')[0].trim();
  }

  // Find first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 1. Direct JSON parse attempt
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.question && parsed.options) {
      return sanitizeParsedObject(parsed, defaultCategory);
    }
  } catch (e1) {
    // Continue to auto-repair
  }

  // 2. Automated syntax repairs
  let repaired = text;

  // Fix unclosed "options" object: e.g. "options": { "A": "...", "D": "...", "correctAnswer": "C"
  repaired = repaired.replace(/"options"\s*:\s*\{([^}]+?)(,\s*"correctAnswer")/g, '"options": {$1}$2');

  // Fix missing closing brace at the end
  if (!repaired.endsWith('}')) {
    repaired = repaired + '}';
  }

  // Fix trailing commas
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  try {
    const parsed = JSON.parse(repaired);
    if (parsed && parsed.question) {
      return sanitizeParsedObject(parsed, defaultCategory);
    }
  } catch (e2) {
    // Continue to regex extraction
  }

  // 3. Robust Regex Fallback Extraction
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
  const exp = extractField(/"explanation"\s*:\s*"([^"]+)"/);
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
      explanation: exp || 'Fundamento basado en la Norma Técnica de Salud aplicable para el primer nivel de atención.',
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
  
  // Fisher-Yates shuffle
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
  
  // Shuffle options to ensure uniform distribution across A, B, C, D
  const { options: shuffledOptions, correctAnswer: shuffledAnswer } = shuffleOptionsAndAnswer(baseOptions, baseCorrectAnswer);

  return {
    question: parsed.question,
    options: shuffledOptions,
    correctAnswer: shuffledAnswer,
    category: parsed.category || defaultCategory,
    whyThisQuestion: parsed.whyThisQuestion || 'Evalúa el razonamiento clínico y la aplicación de la Norma Técnica en el primer nivel de atención.',
    explanation: parsed.explanation || `Respuesta correcta: Opción ${shuffledAnswer}`,
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
  const activeKey = apiKey || DEFAULT_API_KEY;
  if (!activeKey) {
    throw new Error('No se encontró la clave de API de NVIDIA. Por favor ingrésala en la configuración.');
  }

  let promptTopic = '';
  if (topic && topic.trim()) {
    promptTopic = `específicamente sobre el tema: "${topic.trim()}"`;
  } else if (category && category !== 'all' && AI_PROMPTS.categoryTopics[category]) {
    promptTopic = `obligatoriamente sobre el bloque oficial: "${AI_PROMPTS.categoryTopics[category]}"`;
  } else {
    promptTopic = `sobre cualquiera de los 5 Bloques Oficiales del Temario SERUMS 2026-II (Salud Pública, Cuidado Integral, Ética e Interculturalidad, Investigación, Gestión de Servicios de Salud)`;
  }

  const difficultyDesc = AI_PROMPTS.difficultyDescriptions[difficulty] || difficulty;
  const systemPrompt = AI_PROMPTS.systemPrompt;
  const userPrompt = `Formula 1 pregunta clínica oficial de alta dificultad para el Examen Nacional SERUMS de Medicina del Perú 2026-II, contextualizada en el primer nivel de atención del MINSA (EESS I-1 a I-4 de DIRESA/GERESA en el Perú) ${promptTopic} (Nivel: ${difficulty} - ${difficultyDesc}).`;

  let response;
  try {
    response = await fetch(getEndpoint(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.15,
        max_tokens: 700
      })
    });
  } catch (netErr) {
    throw new Error(`Error de conexión con la IA (${netErr.message}). Verifica tu conexión.`);
  }

  if (!response.ok) {
    const errText = await response.text();
    let errorDetail = errText;
    try {
      const parsedError = JSON.parse(errText);
      errorDetail = parsedError?.error?.message || parsedError?.message || errText;
    } catch {
      // Keep errText
    }
    
    if (response.status === 504) {
      throw new Error('El servidor de IA tardó en responder (504 Gateway Timeout). Por favor, presiona "Generar Pregunta" nuevamente.');
    }
    
    throw new Error(`Error en API NVIDIA (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  const defaultCategory = (category !== 'all' ? category : 'salud_publica');
  const parsed = parseResilientAiJson(rawContent, defaultCategory);

  return {
    id: `ai-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    year: 'Generado con IA (NVIDIA)',
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

// Generate mini exam with strict credit and rate-limit protection (max 2 questions)
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

    // Subtle pause to avoid NVIDIA burst rate-limiting
    if (i < clampedTotal - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  return questions;
}
