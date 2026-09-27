// Carreras profesionales que realizan el SERUMS (Ley N° 23330 y su reglamento).
// El banco oficial de cada carrera son las preguntas de src/data/questionsData.js con ese `career`.
// role / focus / topics: contexto que recibe el generador IA para esa carrera.

export const CAREERS = {
  medicina: {
    id: 'medicina',
    name: 'Medicina Humana',
    shortName: 'Medicina',
    emoji: '🩺',
    title: 'Médico(a) Cirujano(a)',
    role: 'médico(a) cirujano(a)',
    focus: 'casos clínicos del primer nivel de atención, salud pública, gestión de servicios, ética e investigación',
    topics: []
  },
  enfermeria: {
    id: 'enfermeria',
    name: 'Enfermería',
    shortName: 'Enfermería',
    emoji: '💉',
    title: 'Lic. en Enfermería',
    role: 'licenciado(a) en enfermería',
    focus: 'inmunizaciones y cadena de frío, control de crecimiento y desarrollo (CRED), tamizaje de anemia, tratamiento supervisado de tuberculosis, cuidado integral por curso de vida, bioseguridad y proceso de atención de enfermería',
    topics: [
      { label: 'Vacunación', topic: 'Esquema nacional de vacunación y ESAVI' },
      { label: 'Cadena de frío', topic: 'Cadena de frío y manejo de vacunas' },
      { label: 'CRED', topic: 'Control de crecimiento y desarrollo del niño (CRED)' },
      { label: 'Anemia', topic: 'Tamizaje de anemia y suplementación con hierro' },
      { label: 'TB (DOT)', topic: 'Administración de tratamiento directamente observado de tuberculosis' },
      { label: 'Bioseguridad', topic: 'Bioseguridad y manejo de residuos en el establecimiento de salud' }
    ]
  },
  obstetricia: {
    id: 'obstetricia',
    name: 'Obstetricia',
    shortName: 'Obstetricia',
    emoji: '🤰',
    title: 'Obstetra',
    role: 'obstetra',
    focus: 'atención prenatal reenfocada, parto vertical con adecuación intercultural, emergencias obstétricas (claves roja, azul y amarilla), planificación familiar, tamizaje de VIH y sífilis, psicoprofilaxis obstétrica y salud sexual y reproductiva del adolescente',
    topics: [
      { label: 'Control prenatal', topic: 'Atención prenatal reenfocada' },
      { label: 'Clave roja', topic: 'Hemorragia posparto y clave roja' },
      { label: 'Preeclampsia', topic: 'Trastornos hipertensivos del embarazo y clave azul' },
      { label: 'Planificación familiar', topic: 'Métodos de planificación familiar' },
      { label: 'Parto vertical', topic: 'Parto vertical con adecuación intercultural' },
      { label: 'VIH / sífilis', topic: 'Tamizaje de VIH y sífilis en la gestante' }
    ]
  },
  odontologia: {
    id: 'odontologia',
    name: 'Odontología',
    shortName: 'Odontología',
    emoji: '🦷',
    title: 'Cirujano(a) Dentista',
    role: 'cirujano(a) dentista',
    focus: 'salud bucal por curso de vida, prevención con flúor y sellantes, caries de infancia temprana, periodoncia básica, urgencias odontológicas, salud bucal de la gestante y bioseguridad en odontología',
    topics: [
      { label: 'Flúor', topic: 'Aplicación de barniz de flúor en niños' },
      { label: 'Sellantes', topic: 'Sellantes de fosas y fisuras' },
      { label: 'Caries temprana', topic: 'Caries de infancia temprana' },
      { label: 'Gestante', topic: 'Atención odontológica de la gestante' },
      { label: 'Urgencias', topic: 'Urgencias odontológicas en el primer nivel' },
      { label: 'Bioseguridad', topic: 'Bioseguridad y esterilización en odontología' }
    ]
  },
  farmacia: {
    id: 'farmacia',
    name: 'Farmacia y Bioquímica',
    shortName: 'Farmacia',
    emoji: '💊',
    title: 'Químico(a) Farmacéutico(a)',
    role: 'químico(a) farmacéutico(a)',
    focus: 'SISMED, buenas prácticas de almacenamiento y dispensación, farmacovigilancia, uso racional de medicamentos, Petitorio Nacional Único de Medicamentos Esenciales y control de estupefacientes y psicotrópicos',
    topics: [
      { label: 'Dispensación', topic: 'Buenas prácticas de dispensación' },
      { label: 'Almacenamiento', topic: 'Buenas prácticas de almacenamiento' },
      { label: 'Farmacovigilancia', topic: 'Farmacovigilancia y reacciones adversas' },
      { label: 'SISMED', topic: 'Sistema Integrado de Suministro de Medicamentos (SISMED)' },
      { label: 'PNUME', topic: 'Petitorio Nacional Único de Medicamentos Esenciales' },
      { label: 'Psicotrópicos', topic: 'Control de estupefacientes y psicotrópicos' }
    ]
  },
  nutricion: {
    id: 'nutricion',
    name: 'Nutrición',
    shortName: 'Nutrición',
    emoji: '🥗',
    title: 'Nutricionista',
    role: 'nutricionista',
    focus: 'evaluación antropométrica, anemia y suplementación, desnutrición crónica infantil, alimentación complementaria, nutrición de la gestante, consejería nutricional y enfermedades crónicas no transmisibles',
    topics: [
      { label: 'Anemia', topic: 'Prevención y tratamiento de anemia' },
      { label: 'Alimentación complementaria', topic: 'Alimentación complementaria del lactante' },
      { label: 'Desnutrición', topic: 'Desnutrición crónica infantil' },
      { label: 'Antropometría', topic: 'Evaluación antropométrica por curso de vida' },
      { label: 'Gestante', topic: 'Nutrición y ganancia de peso en la gestante' },
      { label: 'Consejería', topic: 'Consejería nutricional' }
    ]
  },
  psicologia: {
    id: 'psicologia',
    name: 'Psicología',
    shortName: 'Psicología',
    emoji: '🧠',
    title: 'Psicólogo(a)',
    role: 'psicólogo(a)',
    focus: 'salud mental comunitaria, tamizaje de violencia, depresión y consumo de alcohol, intervención en crisis, primeros auxilios psicológicos y prevención del suicidio',
    topics: [
      { label: 'Violencia', topic: 'Tamizaje y atención de violencia familiar' },
      { label: 'Depresión', topic: 'Tamizaje de depresión en el primer nivel' },
      { label: 'Crisis', topic: 'Intervención en crisis y primeros auxilios psicológicos' },
      { label: 'Alcohol', topic: 'Consumo problemático de alcohol' },
      { label: 'Suicidio', topic: 'Prevención de la conducta suicida' },
      { label: 'Salud mental comunitaria', topic: 'Modelo de salud mental comunitaria' }
    ]
  },
  biologia: {
    id: 'biologia',
    name: 'Biología',
    shortName: 'Biología',
    emoji: '🔬',
    title: 'Biólogo(a)',
    role: 'biólogo(a)',
    focus: 'laboratorio de salud pública, diagnóstico de malaria por gota gruesa, baciloscopía de tuberculosis, vigilancia entomológica de Aedes aegypti, zoonosis, calidad del agua y bioseguridad de laboratorio',
    topics: [
      { label: 'Gota gruesa', topic: 'Diagnóstico de malaria por gota gruesa' },
      { label: 'Baciloscopía', topic: 'Baciloscopía de esputo para tuberculosis' },
      { label: 'Índice aédico', topic: 'Vigilancia entomológica de Aedes aegypti' },
      { label: 'Bioseguridad', topic: 'Bioseguridad en el laboratorio' },
      { label: 'Agua', topic: 'Control de calidad del agua para consumo humano' },
      { label: 'Zoonosis', topic: 'Diagnóstico de laboratorio de zoonosis' }
    ]
  },
  tecnologia_medica: {
    id: 'tecnologia_medica',
    name: 'Tecnología Médica',
    shortName: 'Tec. Médica',
    emoji: '🧪',
    title: 'Tecnólogo(a) Médico(a)',
    role: 'tecnólogo(a) médico(a)',
    focus: 'laboratorio clínico, terapia física y rehabilitación, radiología y protección radiológica, rehabilitación basada en la comunidad, bioseguridad y control de calidad',
    topics: [
      { label: 'Laboratorio', topic: 'Procedimientos de laboratorio clínico en el primer nivel' },
      { label: 'Rehabilitación', topic: 'Rehabilitación basada en la comunidad' },
      { label: 'Terapia física', topic: 'Terapia física en el primer nivel de atención' },
      { label: 'Radiología', topic: 'Protección radiológica' },
      { label: 'Bioseguridad', topic: 'Bioseguridad y manejo de muestras' },
      { label: 'Calidad', topic: 'Control de calidad en el laboratorio' }
    ]
  },
  trabajo_social: {
    id: 'trabajo_social',
    name: 'Trabajo Social',
    shortName: 'Trabajo Social',
    emoji: '🤝',
    title: 'Trabajador(a) Social',
    role: 'trabajador(a) social',
    focus: 'evaluación socioeconómica, aseguramiento en salud (SIS), violencia familiar, redes de apoyo social, participación comunitaria y determinantes sociales de la salud',
    topics: [
      { label: 'Evaluación socioeconómica', topic: 'Evaluación socioeconómica del paciente' },
      { label: 'SIS', topic: 'Aseguramiento universal y afiliación al SIS' },
      { label: 'Violencia', topic: 'Abordaje social de la violencia familiar' },
      { label: 'Redes de apoyo', topic: 'Redes de apoyo social y comunitario' },
      { label: 'Participación', topic: 'Participación comunitaria en salud' },
      { label: 'Determinantes', topic: 'Determinantes sociales de la salud' }
    ]
  },
  medicina_veterinaria: {
    id: 'medicina_veterinaria',
    name: 'Medicina Veterinaria',
    shortName: 'Veterinaria',
    emoji: '🐾',
    title: 'Médico(a) Veterinario(a)',
    role: 'médico(a) veterinario(a)',
    focus: 'zoonosis (rabia, leptospirosis, brucelosis, hidatidosis, peste), vacunación antirrábica canina, inocuidad de alimentos y vigilancia epidemiológica de zoonosis',
    topics: [
      { label: 'Rabia', topic: 'Vigilancia y control de la rabia' },
      { label: 'Vacunación canina', topic: 'Vacunación antirrábica canina' },
      { label: 'Leptospirosis', topic: 'Leptospirosis' },
      { label: 'Hidatidosis', topic: 'Equinococosis quística (hidatidosis)' },
      { label: 'Inocuidad', topic: 'Inocuidad de alimentos' },
      { label: 'Peste', topic: 'Vigilancia de la peste' }
    ]
  },
  ingenieria_sanitaria: {
    id: 'ingenieria_sanitaria',
    name: 'Ingeniería Sanitaria',
    shortName: 'Ing. Sanitaria',
    emoji: '🚰',
    title: 'Ingeniero(a) Sanitario(a)',
    role: 'ingeniero(a) sanitario(a)',
    focus: 'calidad del agua para consumo humano, saneamiento básico, residuos sólidos de establecimientos de salud, control vectorial y salud ambiental',
    topics: [
      { label: 'Cloro residual', topic: 'Vigilancia de cloro residual en agua de consumo' },
      { label: 'Saneamiento', topic: 'Saneamiento básico rural' },
      { label: 'Residuos', topic: 'Residuos sólidos de establecimientos de salud' },
      { label: 'Control vectorial', topic: 'Control vectorial' },
      { label: 'Salud ambiental', topic: 'Vigilancia de la salud ambiental' },
      { label: 'Emergencias', topic: 'Agua y saneamiento en emergencias y desastres' }
    ]
  }
};

export const CAREER_LIST = Object.values(CAREERS);

export function getCareer(careerId) {
  return CAREERS[careerId] || null;
}
