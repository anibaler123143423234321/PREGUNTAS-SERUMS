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

ALTER TABLE public.preguntas_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura publica de preguntas" ON public.preguntas_ia FOR SELECT USING (true);
CREATE POLICY "Permitir insercion con clave anon" ON public.preguntas_ia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion con clave anon" ON public.preguntas_ia FOR UPDATE USING (true);


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
CREATE POLICY "Los usuarios solo leen sus propias respuestas" ON public.user_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios solo insertan sus propias respuestas" ON public.user_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
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
CREATE POLICY "Los usuarios solo leen sus propios fallos" ON public.user_mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios solo insertan sus propios fallos" ON public.user_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
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
CREATE POLICY "Los usuarios solo leen sus preguntas guardadas" ON public.user_saved_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios solo insertan sus preguntas guardadas" ON public.user_saved_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
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
CREATE POLICY "Los usuarios solo leen su propio historial" ON public.user_exam_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios solo insertan en su propio historial" ON public.user_exam_history FOR INSERT WITH CHECK (auth.uid() = user_id);


-- --------------------------------------------------------------------------
-- 6. USUARIO ADMINISTRADOR MAESTRO (ACCESO DIRECTO SIN GOOGLE)
-- Correo: admin@codesoft.pe  |  Contraseña: AdminSerums2027!
-- --------------------------------------------------------------------------
-- Habilitar extensión pgcrypto para cifrado seguro de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insertar usuario administrador con correo confirmado (si no existe ya)
DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@codesoft.pe') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_admin_id,
            'authenticated',
            'authenticated',
            'admin@codesoft.pe',
            crypt('AdminSerums2027!', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"],"role":"admin"}',
            '{"full_name":"Dr. Administrador CODESOFT","role":"admin"}',
            NOW(),
            NOW(),
            '',
            ''
        );

        -- Insertar identidad requerida por Supabase GoTrue
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            new_admin_id,
            new_admin_id,
            json_build_object('sub', new_admin_id::text, 'email', 'admin@codesoft.pe'),
            'email',
            new_admin_id::text,
            NOW(),
            NOW(),
            NOW()
        );
    END IF;
END $$;

