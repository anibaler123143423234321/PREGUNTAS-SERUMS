// Base de datos exhaustiva y profesional de las mejores academias médicas del Perú
// Fuentes: Análisis curricular, plataformas virtuales, testimonios de postulantes SERUMS/ENAM/Residentado.

export const ACADEMIES_DATA = [
  {
    id: 'villamedic',
    rank: 1,
    name: 'VillaMedic Group',
    shortName: 'VillaMedic',
    badge: 'Líder Global #1',
    badgeColor: '#8b5cf6',
    tagline: 'Ecosistema de alto rendimiento, banqueo masivo y tecnología con IA.',
    rating: 9.7,
    studentsCount: '+25,000 médicos',
    logoInitials: 'VM',
    accentGradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    priceRange: 'S/. 1,200 - S/. 2,800',
    priceTier: 'Medio - Alto',
    platformType: 'App Móvil iOS/Android + Web Fenixtor/Empire',
    materials: 'Digital + Flashcards Anki + Villapepas',
    modalities: ['100% Virtual', 'App Móvil', 'Híbrido'],
    bestFor: 'SERUMS, Residentado y ENAM con repetición espaciada y simulacros nacionales.',
    serumsFocus: 9.8,
    residentadoFocus: 9.6,
    enamFocus: 9.7,
    keyFeatures: [
      'Plataformas Fenixtor y Empire con algoritmos de repetición espaciada y métricas percentilares',
      'Más de 15,000 preguntas oficiales desglosadas y comentadas en video',
      'Perlas clínicas ultra-sintetizadas ("Villapepas") y resúmenes de NTS MINSA',
      'Simulacros en vivo con ranking nacional en tiempo real'
    ],
    pros: [
      'Ecosistema tecnológico y app móvil de primer nivel',
      'Contenido específico y muy actualizado para las NTS del SERUMS MINSA',
      'Comunidad masiva con comparativa de percentiles reales'
    ],
    cons: [
      'Volumen de material muy amplio que exige alta disciplina',
      'Precio superior a academias tradicionales'
    ],
    officialUrl: 'https://villamedicgroup.com',
    highlights: ['Villapepas', 'App Móvil', 'NTS MINSA 2024-2026', 'Ranking Nacional']
  },
  {
    id: 'drlopez',
    rank: 2,
    name: 'Academia Dr. López',
    shortName: 'Dr. López',
    badge: 'Top SERUMS & ENAM',
    badgeColor: '#06b6d4',
    tagline: 'Cursos intensivos, resolución en vivo de exámenes oficiales y alta afinidad con el temario MINSA.',
    rating: 9.6,
    studentsCount: '+16,000 médicos',
    logoInitials: 'DL',
    accentGradient: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
    priceRange: 'S/. 650 - S/. 1,500',
    priceTier: 'Accesible',
    platformType: 'Aula Virtual 24/7 + Clases Zoom en Vivo + YouTube',
    materials: 'PDFs Resumen + Bancos Oficiales Comentados',
    modalities: ['Virtual en Vivo', 'Grabaciones 24/7', 'Talleres de Banqueo'],
    bestFor: 'Médicos que buscan repasos directos al grano, resolución de exámenes reales y fisiopatología clara.',
    serumsFocus: 9.7,
    residentadoFocus: 9.1,
    enamFocus: 9.5,
    keyFeatures: [
      'Docencia directa y personalizada por el Dr. Carlos López con explicaciones clínicas muy didácticas',
      'Resolución minuciosa pregunta por pregunta de todos los exámenes SERUMS y ENAM de los últimos años',
      'Énfasis profundo en Normas Técnicas MINSA, Salud Pública, Epidemiología y Gestión Sanitaria',
      'Clases dinámicas en vivo con resolución de dudas inmediatas'
    ],
    pros: [
      'Metodología sumamente clara, amena y directa sin contenido de relleno',
      'Muy fuerte en el temario específico del SERUMS MINSA y casos de primer nivel',
      'Precios sumamente accesibles y excelente reputación entre recién egresados'
    ],
    cons: [
      'Menor infraestructura tecnológica o gamificación comparado con VillaMedic',
      'Enfoque más centrado en el estilo de docencia de un instructor principal'
    ],
    officialUrl: 'https://www.academiadrlopez.com',
    highlights: ['Docencia Dr. López', 'Banqueo en Vivo', 'NTS MINSA', 'Costo-Efectivo']
  },
  {
    id: 'qxmedic',
    rank: 3,
    name: 'Grupo Qx Medic',
    shortName: 'Qx Medic',
    badge: 'Top Manuales Clínicos',
    badgeColor: '#0ea5e9',
    tagline: 'Manuales propios concisos, videoclases dinámicas y resolución rápida de casos clínicos.',
    rating: 9.5,
    studentsCount: '+18,000 médicos',
    logoInitials: 'QX',
    accentGradient: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
    priceRange: 'S/. 900 - S/. 2,200',
    priceTier: 'Medio',
    platformType: 'Campus Virtual Qx + Manuales Físicos/Digitales',
    materials: 'Manuales Qx a color + Bancos por Temas',
    modalities: ['Virtual en Vivo', 'Asincrónico', 'Manuales Físicos'],
    bestFor: 'Médicos que necesitan consolidar teoría clínica esquemática antes de banquear.',
    serumsFocus: 9.5,
    residentadoFocus: 9.5,
    enamFocus: 9.6,
    keyFeatures: [
      'Manuales Qx reconocidos por su alta capacidad de síntesis y esquemas a color',
      'Metodología con "Las Fijas" y correlación fisiopatológica inmediata',
      'Banco de preguntas clasificado por especialidad, dificultad y año',
      'Simulacros tipo examen con retroalimentación en video de cada pregunta'
    ],
    pros: [
      'Los manuales Qx son de los mejores recursos de lectura rápida del Perú',
      'Excelente balance entre teoría médica y práctica con preguntas',
      'Precios competitivos con promociones para internos y graduados'
    ],
    cons: [
      'Menor cantidad de herramientas gamificadas',
      'La app móvil está en constante desarrollo'
    ],
    officialUrl: 'https://qxmedic.com',
    highlights: ['Manuales Qx', 'Las Fijas', 'Casos Clínicos', 'Simulacros']
  },
  {
    id: 'usamedic',
    rank: 4,
    name: 'USAMEDIC',
    shortName: 'USAMEDIC',
    badge: 'Tradición Catedrática',
    badgeColor: '#f59e0b',
    tagline: 'Formación médica rigurosa con reconocidos catedráticos de San Marcos y Cayetano.',
    rating: 9.2,
    studentsCount: '+15,000 médicos',
    logoInitials: 'UM',
    accentGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    priceRange: 'S/. 1,000 - S/. 2,400',
    priceTier: 'Medio',
    platformType: 'Campus Virtual + Sede Presencial Lima',
    materials: 'Cuadernillos Impresos + Macrodiscusiones',
    modalities: ['Virtual', 'Presencial / Semipresencial'],
    bestFor: 'Médicos que aprenden con clases magistrales profundas y discusión de casos clínicos.',
    serumsFocus: 9.0,
    residentadoFocus: 9.4,
    enamFocus: 9.3,
    keyFeatures: [
      'Plana docente legendaria con jefes de servicio y catedráticos UNMSM / UPCH',
      'Macrodiscusiones de casos clínicos y bancos de preguntas históricos',
      'Desarrollo exhaustivo de ciencias básicas aplicadas a la clínica'
    ],
    pros: [
      'Explicaciones clínicas muy profundas y rigurosas',
      'Gran prestigio histórico en el Residentado Médico del Perú'
    ],
    cons: [
      'Plataforma digital tradicional comparada con ecosistemas modernos',
      'Clases de larga duración que pueden resultar densas con poco tiempo'
    ],
    officialUrl: 'https://usamedic.com.pe',
    highlights: ['Catedráticos UNMSM/UPCH', 'Macrodiscusiones', 'Ciencias Básicas']
  },
  {
    id: 'amir',
    rank: 5,
    name: 'AMIR Perú',
    badge: 'Estándar Internacional',
    badgeColor: '#ec4899',
    tagline: 'La mayor calidad gráfica editorial de Iberoamérica con tutorías personalizadas.',
    rating: 9.1,
    studentsCount: '+12,000 médicos en Perú',
    logoInitials: 'AM',
    accentGradient: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
    priceRange: 'S/. 1,500 - S/. 3,200',
    priceTier: 'Alto',
    platformType: 'Campus Virtual AMIR + App de Preguntas + Tutor',
    materials: 'Manuales AMIR Full Color Impresos',
    modalities: ['100% Virtual', 'Manuales Físicos', 'Tutor Personal'],
    bestFor: 'Estudiantes muy visuales que valoran esquemas, diagramas y seguimiento con tutor.',
    serumsFocus: 8.8,
    residentadoFocus: 9.6,
    enamFocus: 9.4,
    keyFeatures: [
      'Manuales AMIR impresos a todo color con los mejores algoritmos de diagnóstico',
      'Sistema de tutorías individuales para armar tu calendario de estudio',
      'Plataforma digital con métricas predictivas de puntaje'
    ],
    pros: [
      'Los manuales a color son insuperables en diseño visual y esquemático',
      'Acompañamiento tutorial continuo y planificación personalizada'
    ],
    cons: [
      'Menor énfasis en normas técnicas específicas y gestión local del MINSA (SERUMS)',
      'Inversión económica más alta'
    ],
    officialUrl: 'https://academiamir.com/peru',
    highlights: ['Manuales Full Color', 'Tutor Personal', 'Algoritmos Diagnósticos']
  },
  {
    id: 'cto',
    rank: 6,
    name: 'Grupo CTO Medicina Perú',
    badge: 'Rigor y Tradición',
    badgeColor: '#14b8a6',
    tagline: 'Metodología consolidada internacionalmente con generador de simulacros avanzado.',
    rating: 8.9,
    studentsCount: '+10,000 médicos en Perú',
    logoInitials: 'CT',
    accentGradient: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
    priceRange: 'S/. 1,600 - S/. 3,400',
    priceTier: 'Alto',
    platformType: 'Campus CTO + Generador de Test',
    materials: 'Manuales CTO de Referencia',
    modalities: ['Virtual Campus CTO', 'Manuales Impresos'],
    bestFor: 'Preparación a largo plazo para Residentado Médico con base científica sólida.',
    serumsFocus: 8.5,
    residentadoFocus: 9.5,
    enamFocus: 9.2,
    keyFeatures: [
      'Método CTO con décadas de experiencia en exámenes de residencia médica',
      'Generador de test y simulacros altamente personalizable por áreas y subtemas',
      'Manuales CTO de referencia bibliográfica mundial'
    ],
    pros: [
      'Profundidad y solidez conceptual en especialidades médicas y quirúrgicas mayores',
      'Campus virtual muy completo con bancos exhaustivos'
    ],
    cons: [
      'Menos adaptado a las preguntas de Salud Pública y Gestión Comunitaria del SERUMS',
      'Costo elevado'
    ],
    officialUrl: 'https://grupocto.com/peru',
    highlights: ['Método CTO', 'Generador de Test', 'Manuales de Referencia']
  },
  {
    id: 'myc',
    rank: 7,
    name: 'Estudios M y C (MyC)',
    shortName: 'Estudios MyC',
    badge: 'Costo-Efectivo',
    badgeColor: '#6366f1',
    tagline: 'Preparación estratégica y sintetizada para médicos con poco tiempo disponible.',
    rating: 8.7,
    studentsCount: '+6,000 médicos',
    logoInitials: 'MC',
    accentGradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    priceRange: 'S/. 600 - S/. 1,400',
    priceTier: 'Accesible',
    platformType: 'Aula Virtual + PDFs Directos',
    materials: 'PDFs Resumen + Bancos 10 Años',
    modalities: ['100% Virtual', 'Grabaciones 24/7'],
    bestFor: 'Médicos que trabajan o hacen guardias y necesitan repasos concisos y directos.',
    serumsFocus: 9.1,
    residentadoFocus: 8.8,
    enamFocus: 9.0,
    keyFeatures: [
      'Resúmenes dirigidos de alta rentabilidad',
      'Banqueo intensivo de preguntas oficiales de los últimos 10 años',
      'Mentoría directa y grupos de resolución de dudas en vivo'
    ],
    pros: [
      'Excelente relación costo-beneficio para recién titulados',
      'Enfoque 100% práctico sin rodeos teóricos innecesarios'
    ],
    cons: [
      'Plataforma digital más sencilla',
      'Menor cantidad de material impreso físico'
    ],
    officialUrl: 'https://estudiosmyc.com',
    highlights: ['Costo Accesible', 'Resúmenes Directos', 'Banqueo Rápido']
  },
  {
    id: 'plusmedica',
    rank: 8,
    name: 'Plus Médica / Team Médica',
    shortName: 'Plus Médica',
    badge: 'Grupos Reducidos',
    badgeColor: '#e11d48',
    tagline: 'Entrenamiento intensivo en grupos pequeños y resolución guiada de exámenes.',
    rating: 8.6,
    studentsCount: '+4,500 médicos',
    logoInitials: 'PM',
    accentGradient: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
    priceRange: 'S/. 500 - S/. 1,200',
    priceTier: 'Accesible',
    platformType: 'Clases Zoom en Vivo + Banco de Exámenes',
    materials: 'Exámenes Resueltos en Vivo',
    modalities: ['Clases en Vivo Zoom', 'Banco de Exámenes'],
    bestFor: 'Repasos de última hora y simulacros comentados pregunta por pregunta.',
    serumsFocus: 9.0,
    residentadoFocus: 8.6,
    enamFocus: 8.8,
    keyFeatures: [
      'Talleres intensivos de banqueo en vivo con participación activa',
      'Resolución minuciosa de los últimos exámenes oficiales SERUMS y ENAM',
      'Grupos de estudio personalizados con acompañamiento docente cercano'
    ],
    pros: [
      'Interacción directa con el profesor para absolver dudas al instante',
      'Cursos cortos ideales para las últimas 4 a 6 semanas antes del examen'
    ],
    cons: [
      'No cuenta con un campus tecnológico masivo',
      'Horarios en vivo fijos'
    ],
    officialUrl: 'https://plusmedica.com.pe',
    highlights: ['Banqueo en Vivo', 'Grupos Reducidos', 'Cursos de Última Hora']
  }
];

export const SERUMS_STRATEGY_TIPS = [
  {
    title: '1. Prioriza Salud Pública y Gestión Sanitaria (NTS)',
    desc: 'A diferencia del Residentado Médico (que es 80% clínica hospitalaria y cirugía), el Examen SERUMS evalúa fuertemente Atención Primaria, Categorización I-1 a I-4, RIS, Cadena de Frío, Notificación Epidemiológica y SISMED.'
  },
  {
    title: '2. Estudia las Normas Técnicas MINSA Vigentes (2024-2026)',
    desc: 'El MINSA redacta las preguntas con base en sus propias NTS. Repasa obligatoriamente: NTS Anemia 213-MINSA 2024, NTS Tuberculosis 221-MINSA 2024, NTS Dengue y Código Rojo Obstétrico (Zuspan).'
  },
  {
    title: '3. El 70% de tu tiempo debe ser Banqueo Activo',
    desc: 'No te limites a ver videoclases pasivas. El método más efectivo demostrado en el SERUMS es resolver preguntas, analizar los distractores y registrar los errores en un cuaderno de perlas clínicas.'
  },
  {
    title: '4. Combina lo mejor: Academia Local + Manuales Visuales',
    desc: 'La combinación más popular entre los mejores puntajes es: plataforma de banqueo peruano (VillaMedic o Dr. López o QxMedic) para el temario MINSA + manuales de apoyo visual (AMIR o CTO) para dudas fisiopatológicas.'
  }
];

export const OFFICIAL_RESOURCES = [
  {
    name: 'Biblioteca Virtual en Salud (BVS MINSA / INS)',
    url: 'https://bvs.minsa.gob.pe',
    desc: 'Repositorio oficial de todas las Normas Técnicas de Salud (NTS), Guías de Práctica Clínica y Documentos Técnicos vigentes.'
  },
  {
    name: 'Centro Nacional de Epidemiología (CDC Perú)',
    url: 'https://www.dge.gob.pe',
    desc: 'Boletines epidemiológicos semanales, salas situacionales de Dengue, Metaxénicas y alertas sanitarias nacionales.'
  },
  {
    name: 'Portal Oficial SERUMS - MINSA',
    url: 'https://www.gob.pe/institucion/minsa/campa%C3%B1as/5496-proceso-serums',
    desc: 'Comunicados oficiales, cronograma de postulación, oferta de plazas remuneradas/equivalentes y temarios vigentes.'
  }
];
