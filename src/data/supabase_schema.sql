-- ==========================================================================
-- CODESOFT SERUMS 2026 — TABLA OFICIAL EN SUPABASE: preguntas_ia
-- Ejecuta este script en el "SQL Editor" de tu proyecto de Supabase
-- ==========================================================================

-- 1. Crear tabla de preguntas generadas por IA
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
    year TEXT DEFAULT 'Generado con IA (NVIDIA)',
    why_this_question TEXT,
    explanation TEXT,
    pearl TEXT,
    "references" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si ya creaste la tabla antes, ejecuta estos 2 comandos para actualizar la estructura:
-- 1. Agregar las nuevas columnas individuales:
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_a TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_b TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_c TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_d TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'standard';

-- 2. Eliminar las columnas JSON innecesarias:
ALTER TABLE public.preguntas_ia DROP COLUMN IF EXISTS options;
ALTER TABLE public.preguntas_ia DROP COLUMN IF EXISTS full_json;

-- 2. Crear índices para búsqueda rápida por categoría y fecha
CREATE INDEX IF NOT EXISTS idx_preguntas_ia_category ON public.preguntas_ia(category);
CREATE INDEX IF NOT EXISTS idx_preguntas_ia_created_at ON public.preguntas_ia(created_at DESC);

-- 3. Habilitar Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.preguntas_ia ENABLE ROW LEVEL SECURITY;

-- 4. Permitir lectura pública (Cualquier usuario puede ver las preguntas)
CREATE POLICY "Permitir lectura publica de preguntas"
ON public.preguntas_ia
FOR SELECT
USING (true);

-- 5. Permitir insercion publica con la clave Anon Key
CREATE POLICY "Permitir insercion con clave anon"
ON public.preguntas_ia
FOR INSERT
WITH CHECK (true);

-- 6. Permitir actualizacion con clave Anon Key
CREATE POLICY "Permitir actualizacion con clave anon"
ON public.preguntas_ia
FOR UPDATE
USING (true);
