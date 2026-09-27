import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawDataPath = path.resolve(__dirname, '../base_datos_completa.json');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

// Coincidencia por palabra completa para evitar falsos positivos
// (ej. 'sis' dentro de "tuberculosis" o 'ris' dentro de "crisis").
// Un término que termina en '*' se trata como raíz: coincide con cualquier terminación.
const WORD_CHARS = 'a-z0-9áéíóúüñ';
const termRegexCache = new Map();
function hasTerm(text, term) {
  if (!termRegexCache.has(term)) {
    const isStem = term.endsWith('*');
    const body = (isStem ? term.slice(0, -1) : term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tail = isStem ? '' : `(?![${WORD_CHARS}])`;
    termRegexCache.set(term, new RegExp(`(?<![${WORD_CHARS}])${body}${tail}`, 'i'));
  }
  return termRegexCache.get(term).test(text);
}
const hasAny = (text, terms) => terms.some((t) => hasTerm(text, t));

// Cada categoría suma puntos por término encontrado (enunciado x2, alternativas x1).
// Gana la de mayor puntaje; en empate, la que aparece primero en esta lista.
const CATEGORY_RULES = [
  ['gineco_obstetricia', [
    'gestante*', 'embaraz*', 'parto*', 'obstétric*', 'preeclampsia', 'eclampsia', 'puerper*',
    'anticoncep*', 'planificación familiar', 'sangrado vaginal', 'oxitocina', 'uterin*', 'legrado',
    'feto', 'fetal', 'placenta*', 'amniótic*', 'episiotomía', 'cérvix', 'vaginosis', 'prenatal',
    'semanas de gestación', 'primigesta', 'multípara', 'gestación', 'aborto', 'menstrua*', 'mamas'
  ]],
  ['pediatria', [
    'niño*', 'niña*', 'lactante*', 'neonat*', 'recién nacido*', 'pediátric*', 'cred',
    'desnutrición', 'lactancia', 'peso al nacer', 'hierro en gotas', 'aiepi', 'talla para la edad',
    'peso para la edad', 'fontanela', 'polio', 'escolar*', 'adolescen*', 'infantil', 'meses de edad',
    'crecimiento y desarrollo', 'eda', 'ira', 'neumonía', 'sarampión', 'varicela', 'spr'
  ]],
  ['cirugia_trauma', [
    'apendicitis', 'colecistitis', 'abdomen agudo', 'herida*', 'sutura*', 'quemadura*',
    'fractura*', 'trauma*', 'shock', 'hemotórax', 'neumotórax', 'peritonitis',
    'obstrucción intestinal', 'quirúrgic*', 'vólvulo', 'atls', 'drenaje', 'triaje', 'mordedura*',
    'emergencia*', 'urgencia*', 'accidente*', 'intoxicación', 'envenenamiento', 'ofídic*', 'rabia'
  ]],
  ['etica_legal', [
    'ética', 'bioética', 'deontológ*', 'consentimiento informado', 'secreto profesional',
    'derechos del paciente', 'autonomía', 'beneficencia', 'no maleficencia', 'justicia', 'comunicativa',
    'asertiv*', 'intercultural*', 'medicina tradicional', 'plantas medicinales', 'quechua', 'nativ*',
    'investigación', 'muestreo', 'muestra', 'cohorte*', 'ensayo clínico', 'plagio', 'fraude científico',
    'autoría', 'cuestionario', 'hipótesis', 'variable*', 'validez', 'confiabilidad', 'sesgo*',
    'diseño de estudio', 'estudio descriptivo', 'estudio analítico', 'código de ética', 'colegio médico'
  ]],
  ['gestion_aps', [
    'sismed', 'categorización', 'i-1', 'i-2', 'i-3', 'i-4', 'redes integradas', 'ris', 'mais',
    'historia clínica', 'epicrisis', 'farmacia', 'almacén', 'sis', 'seguro integral', 'plan de salud',
    'calidad', 'auditoría', 'indicador de estructura', 'petitorio nacional', 'presupuesto*',
    'plan operativo', 'unidad ejecutora', 'contrarreferencia', 'cartera de servicios', 'gestión',
    'proveedor*', 'abastecimiento', 'acreditación', 'upss', 'productos farmacéuticos',
    'dispositivos médicos', 'adjudicat*', 'licitación', 'infraestructura', 'planos', 'ambiente*',
    'recursos humanos', 'foda', 'planificación', 'organización', 'modelo de cuidado integral',
    'seguridad del paciente', 'evento adverso', 'establecimiento de salud'
  ]],
  ['salud_publica', [
    'epidemiológ*', 'brote*', 'vigilancia', 'notificación', 'notificar', 'incidencia', 'prevalencia',
    'asis', 'letalidad', 'sensibilidad', 'especificidad', 'salud pública', 'determinantes',
    'tasa*', 'indicador*', 'comunidad', 'comunitari*', 'vectorial', 'vector', 'promoción de la salud',
    'programa articulado nutricional', 'prevención primaria', 'prevención secundaria',
    'prevención terciaria', 'endemia', 'endémic*', 'epidemia', 'pandemia', 'residuos', 'bioseguridad',
    'demográf*', 'esperanza de vida', 'sectoriz*', 'promotor*', 'agentes comunitarios', 'juntos', 'midis',
    'desastre*', 'búsqueda activa', 'tamizaje', 'cerco', 'bloqueo', 'caso índice', 'casos',
    'inmunizaci*', 'vacunación', 'cadena de frío', 'fesp', 'transición'
  ]],
  ['medicina_interna', [
    'diabetes', 'hipertensión', 'dislipidemia', 'obesidad', 'malaria', 'vih', 'sida', 'its', 'sífilis',
    'hepatitis', 'ictericia', 'tuberculosis', 'tbc', 'dengue', 'leptospirosis', 'bartonelosis',
    'fiebre', 'tos', 'depresión', 'ansiedad', 'salud mental', 'suicid*', 'alcohol*', 'adulto mayor',
    'paciente', 'varón', 'tratamiento', 'diagnóstico', 'dosis', 'mg'
  ]]
];

// Clasificador temático por puntaje de palabras clave.
function classifyQuestion(qText, options) {
  const stem = qText.toLowerCase();
  const opts = Object.values(options).join(' ').toLowerCase();
  let best = 'medicina_interna';
  let bestScore = 0;
  for (const [category, terms] of CATEGORY_RULES) {
    let score = 0;
    for (const term of terms) {
      if (hasTerm(stem, term)) score += 2;
      else if (hasTerm(opts, term)) score += 1;
    }
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return best;
}

// Perlas temáticas: solo se asignan cuando la pregunta trata realmente ese tema.
// Si ninguna aplica, la pregunta queda sin perla (mejor vacía que equivocada).
const PEARL_RULES = [
  [(t) => hasAny(t, ['incidente*', 'prevalente*']),
    'En epidemiología clínica, un "caso incidente" corresponde a un caso NUEVO diagnosticado en un periodo específico, mientras que "caso prevalente" engloba casos antiguos + nuevos existentes.'],
  [(t) => hasAny(t, ['asertiv*', 'saber escuchar']),
    'En la relación médico-paciente y ética clínica, la base de la comunicación asertiva y empatía es la capacidad activa de "saber escuchar".'],
  [(t) => hasTerm(t, 'sismed') || (hasTerm(t, 'vencid*') && hasTerm(t, 'almacén')),
    'Según la directiva de SISMED / DIGEMID, los medicamentos y dispositivos dados de baja o vencidos deben permanecer en custodia en el Almacén Central hasta su destrucción oficial.'],
  [(t) => hasAny(t, ['perímetro abdominal']) && hasTerm(t, 'adolescen*'),
    'En adolescentes, el percentil ≥75 y <90 de perímetro abdominal para la edad y sexo indica riesgo cardiovascular/metabólico alto, mientras que ≥90 indica riesgo muy alto.'],
  [(t) => hasAny(t, ['anemia', 'hierro']) && hasAny(t, ['niño*', 'niña*', 'lactante*', 'hierro en gotas']) && !hasTerm(t, 'gestante*'),
    'NTS Anemia MINSA: En niños con diagnóstico de anemia la dosis terapéutica de hierro elemental es de 3 mg/kg/día por 6 meses. La dosis preventiva es de 2 mg/kg/día.'],
  [(t) => hasTerm(t, 'dengue'),
    'NTS Dengue MINSA: El pilar terapéutico es la hidratación isotónica precoz (ClNa 0.9%). Están absolutamente contraindicados los AINEs y la vía intramuscular por riesgo de sangrado.'],
  [(t) => hasAny(t, ['tuberculosis', 'sintomático respiratorio', 'tbc']),
    'NTS Tuberculosis: Sintomático respiratorio es todo paciente con tos y expectoración ≥15 días. El esquema sensible incluye 2HREZ (fase diaria) + 4H3R3 (fase trisemanal).'],
  [(t) => hasAny(t, ['preeclampsia', 'eclampsia', 'sulfato de magnesio']),
    'El fármaco de elección para la prevención y control de convulsiones en preeclampsia con criterios de severidad y eclampsia es el Sulfato de Magnesio (esquema de Zuspan). Antídoto: Gluconato de Calcio al 10%.']
];

function generateExplanation(qText, options, answer) {
  const correctText = options[answer] || '';
  const text = qText.toLowerCase();
  const rule = PEARL_RULES.find(([matches]) => matches(text));
  return {
    summary: `La respuesta correcta es la opción ${answer}: "${correctText}".`,
    pearl: rule ? rule[1] : ''
  };
}

// Build unique questions list
const processedQuestions = [];
let idCounter = 1;

// 0. Process 2026-II
const path2026ii = path.resolve(__dirname, '../2026-ii/respuestas_medicina.json');
if (fs.existsSync(path2026ii)) {
  const data2026ii = JSON.parse(fs.readFileSync(path2026ii, 'utf8'));
  data2026ii.forEach((q, idx) => {
    const category = classifyQuestion(q.question, q.options);
    const exp = generateExplanation(q.question, q.options, q.correct_answer || 'A');
    processedQuestions.push({
      id: `2026-II-M-${idx + 1}`,
      uid: idCounter++,
      year: '2026-II',
      career: 'medicina',
      examType: 'Oficial MINSA 2026-II',
      number: idx + 1,
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correct_answer || 'A',
      category: category,
      page: q.page || Math.ceil((idx + 1) / 10),
      explanation: exp.summary,
      pearl: exp.pearl
    });
  });
}

// 1. Process 2026-I
if (rawData['2026-I'] && rawData['2026-I']['Medicina']) {
  rawData['2026-I']['Medicina'].forEach((q, idx) => {
    const category = classifyQuestion(q.question, q.options);
    const exp = generateExplanation(q.question, q.options, q.correct_answer);
    processedQuestions.push({
      id: `2026-I-M-${idx + 1}`,
      uid: idCounter++,
      year: '2026-I',
      career: 'medicina',
      examType: 'Oficial MINSA 2026-I',
      number: idx + 1,
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correct_answer,
      category: category,
      page: q.page || Math.ceil((idx + 1) / 10),
      explanation: exp.summary,
      pearl: exp.pearl
    });
  });
}

// 2. Process 2025-II
if (rawData['2025-II'] && rawData['2025-II']['Medicina I']) {
  rawData['2025-II']['Medicina I'].forEach((q, idx) => {
    const category = classifyQuestion(q.question, q.options);
    const exp = generateExplanation(q.question, q.options, q.correct_answer);
    processedQuestions.push({
      id: `2025-II-M-${idx + 1}`,
      uid: idCounter++,
      year: '2025-II',
      career: 'medicina',
      examType: 'Oficial MINSA 2025-II',
      number: idx + 1,
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correct_answer,
      category: category,
      page: q.page || Math.ceil((idx + 1) / 10),
      explanation: exp.summary,
      pearl: exp.pearl
    });
  });
}

// 3. Process 2025-I (Medicina Tipo A)
if (rawData['2025-I'] && rawData['2025-I']['Medicina Tipo A']) {
  rawData['2025-I']['Medicina Tipo A'].forEach((q, idx) => {
    const category = classifyQuestion(q.question, q.options);
    const exp = generateExplanation(q.question, q.options, q.correct_answer);
    processedQuestions.push({
      id: `2025-I-MA-${idx + 1}`,
      uid: idCounter++,
      year: '2025-I',
      career: 'medicina',
      examType: 'Oficial MINSA 2025-I (Tipo A)',
      number: idx + 1,
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correct_answer,
      category: category,
      page: q.page || Math.ceil((idx + 1) / 10),
      explanation: exp.summary,
      pearl: exp.pearl
    });
  });
}

// 4. Process 2024-II (Medicina I)
if (rawData['2024-II'] && rawData['2024-II']['Medicina I']) {
  rawData['2024-II']['Medicina I'].forEach((q, idx) => {
    const category = classifyQuestion(q.question, q.options);
    const exp = generateExplanation(q.question, q.options, q.correct_answer);
    processedQuestions.push({
      id: `2024-II-MI-${idx + 1}`,
      uid: idCounter++,
      year: '2024-II',
      career: 'medicina',
      examType: 'Oficial MINSA 2024-II (Tipo I)',
      number: idx + 1,
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correct_answer,
      category: category,
      page: q.page || Math.ceil((idx + 1) / 10),
      explanation: exp.summary,
      pearl: exp.pearl
    });
  });
}

console.log(`Successfully parsed ${processedQuestions.length} unique official questions.`);

// Category counts
const catCounts = {};
processedQuestions.forEach(q => {
  catCounts[q.category] = (catCounts[q.category] || 0) + 1;
});
console.log('Distribution by category:', catCounts);

// Generate ES module file
const fileContent = `// ARCHIVO GENERADO por scripts/buildQuestionsData.js — no editar a mano.
// Banco de ${processedQuestions.length} preguntas oficiales SERUMS (Medicina Humana, MINSA)
// Procesos: 2026-II, 2026-I, 2025-II, 2025-I, 2024-II

export const QUESTIONS_DATA = ${JSON.stringify(processedQuestions, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../src/data/questionsData.js');
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log(`Saved enriched questions data to ${outputPath}`);
