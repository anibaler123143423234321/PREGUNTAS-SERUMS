# CODESOFT SERUMS

Plataforma de preparación para la evaluación SERUMS (Perú), organizada por carrera.
Es independiente y no está afiliada al MINSA.

- **Medicina Humana:** 500 preguntas oficiales (2024-II a 2026-II). Sus claves se verificaron contra los PDF oficiales del MINSA.
- **Otras 11 carreras:** tienen generador de preguntas con IA adaptado a cada una. El banco oficial queda pendiente hasta cargar sus cuadernillos.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

`src/data/questionsData.js` es un archivo generado; no lo edites a mano. Para regenerarlo desde `base_datos_completa.json` y `2026-ii/respuestas_medicina.json`:

```bash
node scripts/buildQuestionsData.js
```

## Configuración (Netlify + Supabase)

1. **Supabase:** ejecuta `src/data/supabase_schema.sql` en el SQL Editor. Vuelve a ejecutarlo aunque ya tuvieras las tablas: cierra la escritura pública en `preguntas_ia`.
2. **Variables de entorno en Netlify:**

   | Variable | Uso |
   | --- | --- |
   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Conexión a Supabase; la seguridad la dan las políticas RLS |
   | `VITE_GROQ_API_KEY` (o `VITE_NVIDIA_API_KEY` / `VITE_GEMINI_API_KEY`) | Clave por defecto del generador IA |

3. Cada usuario también puede pegar otra clave en "⚙️ Claves"; se guarda solo en su navegador.

## Agregar exámenes oficiales de otra carrera

1. Extrae las preguntas y las claves a un JSON con el mismo formato que `2026-ii/respuestas_medicina.json`.
2. En `scripts/buildQuestionsData.js`, agrega el proceso con `career: '<id>'`, usando los ids de `src/data/careers.js`, y regenera el banco.
3. La carrera activa automáticamente el simulacro, el modo tutor, las flashcards y el buscador en cuanto tiene preguntas.
