-- ==========================================================================
-- CODESOFT SERUMS 2026 — ESQUEMA COMPLETO Y OFICIAL EN SUPABASE
-- Ejecuta este script en el "SQL Editor" de tu proyecto de Supabase
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. TABLA DE PREGUNTAS GENERADAS POR IA: preguntas_ia
-- --------------------------------------------------------------------------
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

-- Actualizar columnas si ya existía la tabla previamente:
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_a TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_b TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_c TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_d TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'standard';
ALTER TABLE public.preguntas_ia DROP COLUMN IF EXISTS options;
ALTER TABLE public.preguntas_ia DROP COLUMN IF EXISTS full_json;

CREATE INDEX IF NOT EXISTS idx_preguntas_ia_category ON public.preguntas_ia(category);
CREATE INDEX IF NOT EXISTS idx_preguntas_ia_created_at ON public.preguntas_ia(created_at DESC);

-- Autor de cada pregunta (se completa solo con el usuario que la inserta)
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS career VARCHAR(50) DEFAULT 'medicina';

ALTER TABLE public.preguntas_ia ENABLE ROW LEVEL SECURITY;
-- Políticas antiguas: permitían que CUALQUIERA (sin iniciar sesión) insertara o sobrescribiera preguntas
DROP POLICY IF EXISTS "Permitir insercion con clave anon" ON public.preguntas_ia;
DROP POLICY IF EXISTS "Permitir actualizacion con clave anon" ON public.preguntas_ia;
DROP POLICY IF EXISTS "Permitir lectura publica de preguntas" ON public.preguntas_ia;
DROP POLICY IF EXISTS "Usuarios autenticados leen preguntas" ON public.preguntas_ia;
DROP POLICY IF EXISTS "Usuarios autenticados insertan sus preguntas" ON public.preguntas_ia;
DROP POLICY IF EXISTS "Usuarios actualizan solo sus preguntas" ON public.preguntas_ia;

CREATE POLICY "Usuarios autenticados leen preguntas" ON public.preguntas_ia
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados insertan sus preguntas" ON public.preguntas_ia
    FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Usuarios actualizan solo sus preguntas" ON public.preguntas_ia
    FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());


-- --------------------------------------------------------------------------
-- 2. TABLA DE RESPUESTAS EMITIDAS POR EL MÉDICO (VINCULADO A auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    selected_option VARCHAR(5) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    category VARCHAR(50) DEFAULT 'salud_publica',
    exam_year VARCHAR(50) DEFAULT '2026-II',
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Los usuarios solo leen sus propias respuestas" ON public.user_responses;
CREATE POLICY "Los usuarios solo leen sus propias respuestas" ON public.user_responses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo insertan sus propias respuestas" ON public.user_responses;
CREATE POLICY "Los usuarios solo insertan sus propias respuestas" ON public.user_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo actualizan sus propias respuestas" ON public.user_responses;
CREATE POLICY "Los usuarios solo actualizan sus propias respuestas" ON public.user_responses FOR UPDATE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- 3. BANCO DE FALLOS DEL MÉDICO (VINCULADO A auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_mistakes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_data JSONB,
    user_answer VARCHAR(5),
    correct_answer VARCHAR(5),
    category VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Los usuarios solo leen sus propios fallos" ON public.user_mistakes;
CREATE POLICY "Los usuarios solo leen sus propios fallos" ON public.user_mistakes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo insertan sus propios fallos" ON public.user_mistakes;
CREATE POLICY "Los usuarios solo insertan sus propios fallos" ON public.user_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo eliminan sus propios fallos" ON public.user_mistakes;
CREATE POLICY "Los usuarios solo eliminan sus propios fallos" ON public.user_mistakes FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- 4. PREGUNTAS GUARDADAS / FAVORITAS (VINCULADO A auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_saved_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_saved_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Los usuarios solo leen sus preguntas guardadas" ON public.user_saved_questions;
CREATE POLICY "Los usuarios solo leen sus preguntas guardadas" ON public.user_saved_questions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo insertan sus preguntas guardadas" ON public.user_saved_questions;
CREATE POLICY "Los usuarios solo insertan sus preguntas guardadas" ON public.user_saved_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo eliminan sus preguntas guardadas" ON public.user_saved_questions;
CREATE POLICY "Los usuarios solo eliminan sus preguntas guardadas" ON public.user_saved_questions FOR DELETE USING (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- 5. HISTORIAL DE SIMULACROS Y PUNTAJE VIGESIMAL (VINCULADO A auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_exam_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_year VARCHAR(50) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    correct_count INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent_seconds INT DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_exam_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Los usuarios solo leen su propio historial" ON public.user_exam_history;
CREATE POLICY "Los usuarios solo leen su propio historial" ON public.user_exam_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Los usuarios solo insertan en su propio historial" ON public.user_exam_history;
CREATE POLICY "Los usuarios solo insertan en su propio historial" ON public.user_exam_history FOR INSERT WITH CHECK (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- 6. ADMINISTRADORES
-- No se crea ningún usuario con contraseña fija en este script (la versión anterior
-- dejaba admin@codesoft.pe / contraseña pública en el repositorio).
-- Si ejecutaste esa versión, borra ese usuario en Authentication > Users.
--
-- Para dar rol de administrador a una cuenta ya registrada:
--   UPDATE auth.users
--      SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--    WHERE email = 'tu-correo@ejemplo.com';
-- --------------------------------------------------------------------------
