# Reglas Maestras del Proyecto CODESOFT SERUMS 2026

## 1. Calibración Médica y Normativa MINSA
- Toda pregunta clínica generada debe apegarse estrictamente a la realidad peruana y las Normas Técnicas de Salud (NTS) vigentes (Anemia NTS 213-2024, TB NTS 221-2024, Dengue NTS 211, Código Rojo 4T, Zuspan, Esquema de Vacunación 196, Categorización NTS 021, RIS DL 1497).
- Las explicaciones deben contener **siempre** la justificación de la clave correcta y el descarte técnico y detallado de cada uno de los 3 distractores.

## 2. Diversidad Geográfica
- Prohibido repetir sistemáticamente una sola región (ej. Loreto/Nauta).
- Rota siempre entre las 47 ubicaciones de la matriz en las 25 regiones del Perú (Puno, Cusco, Piura, Ayacucho, San Martín, Huánuco, Cajamarca, Huancavelica, etc.).

## 3. Motores de IA y Cuotas
- **Groq LPU (`openai/gpt-oss-120b`)**: Motor ultra-rápido prioritario (~2.5s). Límite de 1,000 req/día y 30 RPM en Free Tier. Usar `max_tokens: 2000` para evitar truncamiento de tokens de razonamiento.
- **NVIDIA NIM (`meta/llama-3.2-11b-vision-instruct`)**: Motor de respaldo. (Nota: los modelos 3.1-8b y 3.3-70b fueron dados de baja con código 410).
- **Google Gemini (`gemini-3.8-flash`)**: Motor alternativo (`gemini-1.5-flash` fue retirado).
- **Claves**: prohibido leer claves de IA desde variables `VITE_*` (quedan públicas en el bundle). Sin clave del usuario se usa `netlify/functions/ai-generate.mjs` con `GROQ_API_KEY` del servidor.

## 4. Base de Datos Supabase Cloud
- Esquema relacional estricto con columnas independientes (`option_a`, `option_b`, `option_c`, `option_d`, `why_this_question`, `explanation`, `pearl`, `"references"`).
- Prohibido reinsertar columnas JSON obsoletas (`options`, `full_json`).

## 5. UI y Exportación
- Mantener siempre disponibles las funciones de exportación: `Descargar .txt`, `Descargar .png` (HD), `Descargar .json`, `✕ Limpiar Pregunta` y el `Centro de Documentación (DocsModal)`.

## 6. Carreras y Seguridad
- La app es multi-carrera (`src/data/careers.js`). Las preguntas oficiales llevan `career`; hoy solo Medicina Humana tiene banco oficial.
- `src/data/questionsData.js` se genera con `node scripts/buildQuestionsData.js`; no editarlo a mano.
- Nunca incluir usuarios o contraseñas fijas en el código ni en el SQL. El rol admin va en `app_metadata`, no en `user_metadata`.
