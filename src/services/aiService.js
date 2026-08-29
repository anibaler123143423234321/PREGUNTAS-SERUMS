import AI_PROMPTS from '../data/aiPrompts.json';

const DEFAULT_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || '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';
const MODEL_NAME = 'meta/llama-3.2-11b-vision-instruct';

// Determine endpoint: Use Vite proxy in dev/local to bypass browser CORS
function getEndpoint() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api/nvidia/chat/completions';
  }
  return 'https://integrate.api.nvidia.com/v1/chat/completions';
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
  const userPrompt = `Genera 1 pregunta inédita alineada al Temario Oficial SERUMS 2026-II ${promptTopic} (Nivel de Dificultad: ${difficulty} - ${difficultyDesc}).`;

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
        temperature: 0.25,
        max_tokens: 480
      })
    });
  } catch (netErr) {
    // If proxy failed, retry direct endpoint
    if (getEndpoint() !== 'https://integrate.api.nvidia.com/v1/chat/completions') {
      response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
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
          temperature: 0.3,
          max_tokens: 650
        })
      });
    } else {
      throw new Error(`Error de red al conectar con NVIDIA AI: ${netErr.message}`);
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error en API NVIDIA (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // Clean JSON
  let cleanJson = rawContent.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleanJson);
    return {
      id: `ai-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      year: 'Generado con IA (NVIDIA)',
      number: 1,
      question: parsed.question,
      options: parsed.options,
      correctAnswer: parsed.correctAnswer || 'A',
      category: parsed.category || (category !== 'all' ? category : 'salud_publica'),
      page: 1,
      pearl: parsed.pearl || 'Perla de estudio generada por IA especializada en SERUMS MINSA.',
      explanation: parsed.explanation || `Respuesta correcta: ${parsed.correctAnswer}`
    };
  } catch (e) {
    console.error('JSON Parse Error on AI output:', cleanJson);
    throw new Error('La IA no devolvió un formato JSON válido. Inténtalo de nuevo.');
  }
}

// Generate multiple questions in parallel batches
export async function generateExamBatch({
  totalQuestions = 10,
  category = 'all',
  difficulty = 'standard',
  topic = '',
  apiKey = DEFAULT_API_KEY,
  onProgress
}) {
  const generatedQuestions = [];
  const concurrency = 2; // parallel workers

  const categoriesPool = [
    'salud_publica',
    'gestion_aps',
    'medicina_interna',
    'pediatria',
    'gineco_obstetricia',
    'cirugia_trauma',
    'etica_legal'
  ];

  for (let i = 0; i < totalQuestions; i += concurrency) {
    const batchSize = Math.min(concurrency, totalQuestions - i);
    const batchPromises = Array.from({ length: batchSize }, async (_, idx) => {
      const qNum = i + idx + 1;
      const targetCategory = category !== 'all' ? category : categoriesPool[(i + idx) % categoriesPool.length];
      
      try {
        const q = await generateSingleQuestion({
          category: targetCategory,
          difficulty,
          topic,
          apiKey
        });
        q.number = qNum;
        q.id = `ai-exam-${Date.now()}-${qNum}`;
        return q;
      } catch (err) {
        console.warn(`Error generating question ${qNum}, retrying...`, err);
        const qRetry = await generateSingleQuestion({
          category: targetCategory,
          difficulty,
          topic,
          apiKey
        });
        qRetry.number = qNum;
        qRetry.id = `ai-exam-${Date.now()}-${qNum}`;
        return qRetry;
      }
    });

    const results = await Promise.all(batchPromises);
    results.forEach((q) => {
      if (q) generatedQuestions.push(q);
    });

    if (onProgress) {
      onProgress(generatedQuestions.length, totalQuestions);
    }
  }

  return generatedQuestions;
}
