---
name: serums-medicina-examen
description: >-
  Guía maestra, marco normativo, matriz de competencias, normas técnicas (NTS 2024-2026), arquitectura técnica de IA (Groq, Gemini, NVIDIA, Supabase) y banco de preguntas y perlas verificadas para la preparación y resolución experta del Examen Nacional SERUMS de Medicina del Ministerio de Salud del Perú (MINSA).
---

# Examen Nacional SERUMS Medicina 2026 — Guía Integral, Normas Técnicas, Arquitectura de IA y Solucionario Experto

Este skill proporciona el marco teórico, clínico, epidemiológico, normativo y la **arquitectura técnica completa del sistema CODESOFT SERUMS 2026** para la generación, resolución y evaluación experta del **Examen Nacional SERUMS de Medicina del Ministerio de Salud (MINSA)** del Perú (Ley N° 23330 y Temario Oficial 2026-II).

---

## 1. Parámetros Oficiales del Examen SERUMS 2026

- **Normativa Base**: Ley N° 23330 (Ley del SERUMS), DS N° 007-2008-SA, DL N° 1497 (Redes Integradas de Salud).
- **Estructura**: 100 preguntas de opción múltiple con 4 alternativas (A, B, C, D) y única respuesta correcta.
- **Tiempo Oficial**: 120 minutos (2 horas continuas).
- **Sistema de Calificación**: Escala vigesimal (0.00 a 20.00). Cada acierto = **0.20 puntos**.
- **Nota Aprobatoria Referencial**: **11.00** (55 aciertos mínimos requeridos).
- **Enfoque Evaluativo**: Casos clínicos contextualizados en el Primer Nivel de Atención (I-1, I-2, I-3, I-4), salud pública comunitaria, programas presupuestales por resultados (PpR) y normatividad sanitaria vigente al 2026.

---

## 2. Temario Oficial SERUMS 2026-II (MINSA) — 5 Bloques Temáticos

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    BLOQUES TEMÁTICOS OFICIALES MINSA 2026                  │
├────────────────────────────────────────────────────────────────────────────┤
│ BLOQUE 1: SALUD PÚBLICA (FESP, Epidemiología, ASIS, Comunitaria, Bio)      │
│ BLOQUE 2: CUIDADO INTEGRAL DE SALUD POR CURSO DE VIDA (Niño/Gestante/Adulto)│
│ BLOQUE 3: ÉTICA E INTERCULTURALIDAD (Deontología, Parto Vertical, Enfoque) │
│ BLOQUE 4: INVESTIGACIÓN EN SALUD (Metodología, Bioestadística, Publicación)│
│ BLOQUE 5: GESTIÓN DE SERVICIOS DE SALUD (PEI/POI, ROF, Categorización, RIS)│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Puntos Clave de Alta Frecuencia Evaluados en el SERUMS 2026-II

### 3.1. Inmunizaciones y ESAVI (NTS N° 196-MINSA / Actualizaciones 2026):
1. **Virus Respiratorio Sincitial (VRS)**: Vacunación en gestantes a partir de las **32 semanas** de gestación para conferir inmunidad pasiva al recién nacido y prevenir bronquiolitis grave.
2. **Sarampión**:
   - Bloqueo vacunal en un radio de **25 manzanas** alrededor del caso índice sospechoso.
   - Tratamiento complementario con **Vitamina A (Retinol)** en niños diagnosticados para reducir complicaciones graves y ceguera.
3. **Intervalo entre vacunas atenuadas**: Intervalo mínimo de **1 mes (30 días)** entre SPR (12 meses) y Varicela si no se administran el mismo día.
4. **Kit de Emergencia ESAVI**: Dosis de **Adrenalina 0.01 mg/kg** vía subcutánea o intramuscular para anafilaxia posvacunal.
5. **Virus del Papiloma Humano (VPH)**: **Dosis única** en escolares y adolescentes de 9 a 18 años.
6. **Cadena de Frío**: Rango térmico estricto de **+2°C a +8°C** con calibración continua de Data Loggers y termómetros.

### 3.2. Dengue y Arbovirosis (NTS N° 211-MINSA / GPC Dengue):
1. **Estratificación Entomológica**:
   - **Escenario I**: Sin vector *Aedes aegypti*, sin casos.
   - **Escenario II**: Con presencia del vector y casos importados (sin casos autóctonos).
   - **Escenario III**: Con vector y transmisión autóctona activa.
2. **Control Larvario Químico**: Aplicación de **Pyriproxyfen al 100% de las viviendas** del sector afectado.
3. **Clasificación Clínica**:
   - **Grupo A**: Dengue sin signos de alarma (tolerancia oral, manejo ambulatorio con ClNa al 0.9% oral y paracetamol).
   - **Grupo B1/B2**: Dengue con signos de alarma (dolor abdominal intenso y continuo, vómitos persistentes, derrame seroso, sangrado de mucosas, letargia/irritabilidad, hepatomegalia >2 cm, aumento progresivo del hematocrito). Hidratación isotónica IV precoz con ClNa 0.9%.
   - **Grupo C**: Dengue grave (choque por fuga plasmática, sangrado severo, falla orgánica de SNC/hígado/corazón).
4. **Contraindicaciones Absolutas en Dengue**: Prohibido el uso de **AINEs** (metamizol, ibuprofeno, diclofenaco, ketorolaco, aspirina) y de la **vía intramuscular (IM)** por riesgo de coagulopatía y hemorragia letal.

### 3.3. Anemia y Nutrición Infantil (NTS N° 213-MINSA-2024):
1. **Suplementación Preventiva**:
   - Prematuros / Bajo peso (<2500g): **2 mg/kg/día** desde los 30 días de vida hasta los 6 meses.
   - Nacidos a término con peso adecuado: **2 mg/kg/día** desde los **4 meses** hasta los 6 meses.
2. **Tratamiento Terapéutico de Anemia**: **3 mg/kg/día** de hierro elemental durante **6 meses continuos**. Controles de Hb al 1°, 3° y 6° mes.
3. **Suplementación en Adolescentes y Mujeres en Edad Fértil (MEF)**: **60 mg de hierro elemental + 400 ug de ácido fólico** (2 veces por semana x 3 meses al año o preventivo continuo).
4. **Factor de Ajuste de Hemoglobina**: Corrección por altitud según fórmula de **Peña-Dallman**.

### 3.4. Tuberculosis (NTS N° 221-MINSA/DGIESP-2024-2026):
1. **Sintomático Respiratorio**: Toda persona con tos y expectoración durante **≥ 15 días**.
2. **Diagnóstico Rápido**: Prueba molecular **GeneXpert MTB/RIF** para detección simultánea del complejo *M. tuberculosis* y mutaciones de resistencia a Rifampicina en <2 horas.
3. **Esquema Sensible**: **2HREZ** (50 dosis diarias de Isoniazida, Rifampicina, Etambutol, Pirazinamida) + **4H3R3** (54 dosis interdiarias de Isoniazida + Rifampicina).
4. **Terapia Preventiva de TB (TPT)**: Esquema **3HP** (Isoniazida + Rifapentina en dosis semanal x 12 semanas) como régimen de primera línea.
5. **Legislación en Salud Ocupacional**: El personal de salud diagnosticado con TB tiene derecho a descanso médico con **goce de remuneraciones** durante el periodo de tratamiento.

### 3.5. Salud Materna, Obstetricia y Código Rojo (NTS N° 105-MINSA / NTS N° 030-MINSA):
1. **Control Prenatal Reenfocado**: Mínimo **6 controles**; tamizaje dual rápido (PRD) de VIH y Sífilis en 1er y 3er trimestre; suplementación con **60 mg Fe + 400 ug ácido fólico** desde la semana 14.
2. **Consejería en Lactancia Materna**: Se inicia formalmente durante el control prenatal a partir de las **32 semanas** de gestación.
3. **Preeclampsia Severa / Eclampsia**:
   - Tratamiento de elección para profilaxis y control de convulsiones: **Sulfato de Magnesio** (**Esquema Zuspan**: bolo de 4 g IV en 20 min + infusión continua de 1 a 2 g/hora).
   - Parámetros de monitoreo de toxicidad: Reflejo rotuliano presente, FR ≥16 resp/min, diuresis horaria ≥30 ml/h.
   - Antídoto específico: **Gluconato de Calcio al 10%** (1 ampolla de 1 g IV en bolo lento).
4. **Hemorragia Posparto (Código Rojo)**:
   - Regla de las **4T**: **Tono (70%)**, **Trauma (20%)**, **Tejido (10%)**, **Trombina (1%)**.
   - Fármacos de primera línea: **Oxitocina** (20-40 UI en infusión), **Ergometrina** (0.2 mg IM, *contraindicada en preeclampsia e HTA*), **Misoprostol** (800 ug vía rectal/sublingual) y **Ácido Tranexámico** (1 g IV lento dentro de las primeras 3 horas del parto).
5. **Enfoque Intercultural**: **Parto Vertical (NTS N° 030-MINSA)** con acompañante de elección, ingesta de líquidos tibios y respeto a las costumbres de la gestante.

### 3.6. Gestión, Categorización y Redes Integradas de Salud (RIS):
1. **Categorización de Establecimientos de Salud (NTS N° 021-MINSA)**:
   - **I-1**: Puesto de salud sin médico permanente (Enfermera, Obstetra, Técnico).
   - **I-2**: Puesto de salud con Médico general permanente.
   - **I-3**: Centro de salud con Médico general, **Odontología y Laboratorio de análisis clínicos** (atención 12 horas).
   - **I-4**: Centro de salud con **Camas de internamiento de corta estancia**, Sala de Partos y atención continua de **24 horas**.
2. **Redes Integradas de Salud (RIS - DL 1497)**: Cuatro dimensiones: **Gobernanza**, **Prestación** (el primer nivel como puerta de entrada obligatoria), **Gestión** y **Financiamiento**.
3. **Planificación**: La programación del **Plan Operativo Institucional (POI)** corresponde a la **Unidad Ejecutora**.
4. **Tiempos de Triaje en Emergencias**:
   - **Prioridad I** (Emergencia con riesgo vital inminente): Atención inmediata (**0 minutos**).
   - **Prioridad II** (Urgencia mayor con potencial riesgo): Tiempo no mayor a **10 minutos**.
   - **Prioridad III** (Urgencia menor): Tiempo no mayor a **30 minutos**.
   - **Prioridad IV** (Patología no urgente): Hasta 60 minutos o derivación a consulta ambulatoria.

---

## 4. Arquitectura de Motores de IA & Límites de Cuota

| Motor / Proveedor | Modelo | Límite por Minuto (RPM) | Límite Diario (RPD) | Tokens / Minuto | Latencia Promedio |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Groq Cloud (LPU)** | `openai/gpt-oss-120b` | **30 RPM** | **1,000 RPD** | 8,000 TPM | **~2.5s** |
| **Groq Cloud (LPU)** | `qwen/qwen3.8-27b` | **30 RPM** | **1,000 RPD** | 8,000 TPM | **~1.8s** |
| **Google Gemini** | `gemini-1.5-flash` | **15 RPM** | **1,500 RPD** | 1,000,000 TPM | **~3.2s** |
| **NVIDIA NIM** | `meta/llama-3.2-11b-vision-instruct` | **10 RPM** | **1,000 créditos** | Variable | **~24s** |

### Reglas Técnicas de Inferencia en Groq:
1. **Auto-Detección por Prefijo**:
   - `gsk_...` ➔ Groq Cloud API (`/api/groq/chat/completions`).
   - `AIzaSy...` ➔ Google Gemini API (`/api/gemini/...`).
   - `nvapi-...` ➔ NVIDIA NIM API (`/api/nvidia/chat/completions`).
2. **`max_tokens: 2000`**: Los modelos de razonamiento (como `gpt-oss-120b`) consumen tokens de pensamiento interno (~500 tokens). Con `max_tokens: 2000`, el JSON clínico nunca se trunca.
3. **Reinicio de Cuota**: A las **00:00 UTC (7:00 PM hora peruana)** diariamente.

---

## 5. Matriz de Diversidad Geográfica Nacional (47 Ubicaciones en 25 Regiones)

Para evitar la repetición y garantizar que el postulante entrene en todas las realidades sanitarias del Perú:
- **Puno (Altitud Extrema)**: Macusani (4,315 msnm), Asillo, Cojata.
- **Cusco**: Espinar (3,928 msnm), Quillabamba (La Convención), Paucartambo.
- **Ayacucho & VRAEM**: Llochegua, Chuschi, Puquio.
- **Junín & Selva Central**: San Martín de Pangoa, Pichanaqui, Tarma.
- **Amazonas (Comunidades Nativas)**: Santa María de Nieva (Awajún), Imaza, Lamud.
- **San Martín**: Juanjuí, Jepelacio, San Pablo.
- **Piura (Costa y Frontera)**: Canchaque, Paimas, Lancones.
- **Cajamarca**: San Ignacio, Chota, Jaén.
- **Huancavelica**: Pampas Tayacaja (3,276 msnm), Lircay.
- **Ancash (Callejón de Huaylas)**: Chavín de Huántar, Marcará.
- **Arequipa**: Chivay (3,635 msnm - Cañón del Colca).
- **Ica / Costa Sur**: Paracas, Pisco, Palpa, Nazca.

---

## 6. Esquema de Base de Datos Cloud (Supabase PostgreSQL)

Tabla pura y relacional (sin columnas JSON `options` ni `full_json`):
```sql
CREATE TABLE IF NOT EXISTS public.preguntas_ia (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer VARCHAR(5) NOT NULL,
    category VARCHAR(50) DEFAULT 'salud_publica',
    difficulty VARCHAR(50) DEFAULT 'standard',
    year TEXT DEFAULT 'Generado con IA (Groq LPU)',
    why_this_question TEXT,
    explanation TEXT,
    pearl TEXT,
    "references" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Herramientas de Exportación y Limpieza en la Interfaz

1. **`📄 Descargar .txt`**: Descarga en texto plano estructurado con enunciado, alternativas A-D, clave oficial, justificación clínica MINSA y perla SERUMS.
2. **`🖼️ Descargar .png`**: Captura HD de la tarjeta médica generada mediante `html-to-image` para compartir en WhatsApp/Telegram.
3. **`📥 Sesión .json`**: Respaldo completo de la sesión de preguntas en formato JSON estándar.
4. **`✕ Limpiar`**: Botón de reset que borra y cierra la pregunta actual para dejar la pantalla despejada.
5. **`📖 Centro de Documentación (DocsModal)`**: Modal interactivo accesible desde el Header y desde la configuración con todas las guías, tablas de cuota y SQL.
