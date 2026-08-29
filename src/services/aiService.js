// Service to communicate with NVIDIA NIM API for Medical AI question generation

const DEFAULT_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || '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';
const MODEL_NAME = 'meta/llama-3.2-11b-vision-instruct';

// Determine endpoint: Use Vite proxy in dev/local to bypass browser CORS
function getEndpoint() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api/nvidia/chat/completions';
  }
  return 'https://integrate.api.nvidia.com/v1/chat/completions';
}

const CATEGORY_DESCRIPTIONS = {
  salud_publica: 'Área Salud Pública (Temario 2026-II): FESP, Epidemiología, Criterios de Bradford Hill, Demografía, Historia Natural, Prevención 1°-4°, Pruebas diagnósticas (S/E/VPP/VPN), Brotes/Epidemias/Endemias, Vigilancia en Salud Pública, ASIS/Sala Situacional, Determinantes Sociales/Ambientales, Sectorización y Ficha Familiar, Residuos Sólidos, Salud Mental Comunitaria y Bioseguridad',
  gestion_aps: 'Área Gestión de Servicios de Salud (Temario 2026-II): PEI/POI, ROF/MOP, Categorización EESS (I-1 a I-4), UPSS y Cartera de Servicios, Referencia y Contrarreferencia, Gestión de Historia Clínica, Redes Integradas de Salud (RIS), Telesalud, Recursos Humanos, Control de Inventario SISMED, Seguridad del Paciente, Clima y Cultura Organizacional',
  medicina_interna: 'Área Cuidado Integral del Adulto (Temario 2026-II): Prevención y Control de TBC (NTS 221, GeneXpert, 2HREZ/4H3R3, TPT), Dengue y Arbovirosis (NTS, hidratación isotónica, contraindicación AINEs), ITS/VIH (Prevención combinada, tamizaje PRD, TARV), Diabetes, Hipertensión, Metales Pesados/Intoxicaciones agudas, IAAS y Prevención de Cáncer en el Adulto (próstata, colon, piel)',
  pediatria: 'Área Cuidado Integral del Niño y Adolescente (Temario 2026-II): NTS Anemia 2024 (3 mg/kg/d tratamiento, 2 mg/kg/d prevención), Esquema Nacional de Vacunación (BCG, Pentavalente, IPV, Rotavirus, Neumococo, SPR, Varicela, DPT, VPH), Vigilancia de ESAVI, Cadena de Frío (+2°C a +8°C), CRED, Desnutrición Infantil, IRA, EDA y Detección Temprana de Cáncer Infantil',
  gineco_obstetricia: 'Área Cuidado Integral Salud Materna (Temario 2026-II): Control Prenatal (mínimo 6, PRD VIH/Sífilis, 60mg Fe + 400ug ácido fólico), Preeclampsia Severa (Sulfato de Magnesio / Esquema Zuspan / Gluconato de calcio), Emergencias Obstétricas y Código Rojo (4T, masaje bimanual, oxitocina, ergometrina, misoprostol, ácido tranexámico), Parto Vertical, Climaterio y Tamizaje de Cáncer de Cuello Uterino (PAP/VPH) y Mama',
  cirugia_trauma: 'Área Urgencias y Manejo Inicial (Temario 2026-II): Evaluación y estabilización inicial de Urgencias y Emergencias en Primer Nivel, Abdomen Agudo, Trauma Inicial, Quemaduras, Heridas, Criterios de Referencia y Traslado Seguro',
  etica_legal: 'Área Ética, Bioética, Interculturalidad e Investigación (Temario 2026-II): Código de Ética y Deontología, Trato Digno, Consentimiento Informado, Derechos del Usuario, Diálogo e Inclusión Intercultural, Medicina Tradicional/Complementaria, Metodología de Investigación (enfoques cuali/cuanti/mixto, estudios descriptivo/analítico/experimental, procesamiento de datos, fraude científico y conflicto de intereses)'
};

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
  } else if (category && category !== 'all' && CATEGORY_DESCRIPTIONS[category]) {
    promptTopic = `obligatoriamente sobre el bloque oficial: "${CATEGORY_DESCRIPTIONS[category]}"`;
  } else {
    promptTopic = `sobre cualquiera de los 5 Bloques Oficiales del Temario SERUMS 2026-II (Salud Pública, Cuidado Integral, Ética e Interculturalidad, Investigación, Gestión de Servicios de Salud)`;
  }

  const systemPrompt = `Eres un docente médico senior evaluador del MINSA Perú y redactor oficial del Examen Nacional SERUMS 2026-II.
Tu labor es generar preguntas inéditas de alta fidelidad, con rigor clínico y 100% alineadas al TEMARIO OFICIAL DEL SERUMS 2026-II DEL MINSA (Bloques: 1. Salud Pública, 2. Cuidado Integral de Salud por Curso de Vida, 3. Ética e Interculturalidad, 4. Investigación, 5. Gestión de Servicios de Salud) y sus Normas Técnicas (NTS Anemia 2024, NTS Tuberculosis 2024-2026, NTS Dengue, Esquema Nacional de Vacunación, NTS Salud Materna, RIS y MAIS-BFC).

ESTRUCTURA DE RESPUESTA REQUERIDA (ÚNICAMENTE JSON VÁLIDO):
{
  "question": "Enunciado del caso clínico contextualizado en un establecimiento de salud del MINSA (I-1 a I-4) o pregunta técnica...",
  "options": { "A": "Opción A", "B": "Opción B", "C": "Opción C", "D": "Opción D" },
  "correctAnswer": "A",
  "category": "${category !== 'all' ? category : 'salud_publica'}",
  "pearl": "Perla de estudio de alto rendimiento citando el punto específico del Temario 2026-II y la NTS del MINSA aplicable.",
  "explanation": "Justificación clínica precisa de la respuesta correcta y motivo de descarte de los distractores."
}`;

  const userPrompt = `Genera 1 pregunta inédita alineada al Temario Oficial SERUMS 2026-II ${promptTopic} (Nivel de Dificultad: ${difficulty}).`;

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
