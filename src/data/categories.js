export const CATEGORIES = {
  all: {
    id: 'all',
    name: 'Todas las Áreas del Temario',
    shortName: 'Todas',
    icon: 'Layers',
    color: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.12)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
    description: 'Banco completo de preguntas oficiales SERUMS Medicina MINSA'
  },
  salud_publica: {
    id: 'salud_publica',
    name: 'Área 1: Salud Pública',
    shortName: 'Salud Pública',
    icon: 'Activity',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    description: 'FESP, epidemiología, brotes, vigilancia, determinantes, residuos sólidos y bioseguridad'
  },
  gestion_aps: {
    id: 'gestion_aps',
    name: 'Área 5: Gestión de Servicios de Salud y APS',
    shortName: 'Gestión y APS',
    icon: 'Building2',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    description: 'Categorización I-1 a I-4, RIS, PEI/POI (Unidad Ejecutora), SISMED, cartera de servicios y calidad'
  },
  medicina_interna: {
    id: 'medicina_interna',
    name: 'Área 2: Cuidado Integral - Medicina del Adulto',
    shortName: 'Medicina Interna',
    icon: 'Stethoscope',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    description: 'TBC (NTS 221), Dengue (NTS MINSA), VIH/PrEP, diabetes, hipertensión e intoxicaciones'
  },
  pediatria: {
    id: 'pediatria',
    name: 'Área 2: Cuidado Integral - Niño y Adolescente',
    shortName: 'Pediatría',
    icon: 'Baby',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    description: 'NTS Anemia 2024, esquema nacional de vacunación, ESAVI, cadena de frío y CRED'
  },
  gineco_obstetricia: {
    id: 'gineco_obstetricia',
    name: 'Área 2: Cuidado Integral - Salud Materna',
    shortName: 'Gineco-Obstetricia',
    icon: 'HeartPulse',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    description: 'Control prenatal, emergencias obstétricas, preeclampsia (Zuspan), Código Rojo y parto vertical'
  },
  cirugia_trauma: {
    id: 'cirugia_trauma',
    name: 'Área 2: Cuidado Integral - Urgencias y Cirugía',
    shortName: 'Cirugía y Trauma',
    icon: 'Scissors',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    description: 'Manejo inicial de urgencias, abdomen agudo, shock trauma inicial, quemaduras y triaje'
  },
  etica_legal: {
    id: 'etica_legal',
    name: 'Áreas 3 y 4: Ética, Interculturalidad e Investigación',
    shortName: 'Ética y Ley',
    icon: 'Scale',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.12)',
    borderColor: 'rgba(20, 184, 166, 0.3)',
    description: 'Deontología médica, función pública, medicina tradicional, consentimiento informado y metodología'
  }
};

export const EXAM_YEARS = [
  { id: '2026-II', name: 'SERUMS 2026-II (100 preguntas)', short: '2026-II' },
  { id: '2026-I', name: 'SERUMS 2026-I (100 preguntas)', short: '2026-I' },
  { id: '2025-II', name: 'SERUMS 2025-II (100 preguntas)', short: '2025-II' },
  { id: '2025-I', name: 'SERUMS 2025-I (100 preguntas)', short: '2025-I' },
  { id: '2024-II', name: 'SERUMS 2024-II (100 preguntas)', short: '2024-II' },
  { id: 'cloud_ia', name: '☁️ Banco IA en la Nube (Supabase)', short: '☁️ Banco IA Cloud' },
  { id: 'all', name: 'Todos los Procesos (500 preguntas)', short: 'Todos' }
];
