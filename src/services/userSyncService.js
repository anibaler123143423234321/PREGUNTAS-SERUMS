import { getSupabaseClient } from './supabaseClient';

/**
 * Cargar todo el historial y datos del médico autenticado desde Supabase
 */
export async function loadUserDataFromCloud(userId) {
  const client = getSupabaseClient();
  if (!client || !userId) {
    return { savedQuestions: {}, mistakes: [], examHistory: [], responses: {} };
  }

  try {
    const [savedRes, mistakesRes, historyRes, responsesRes] = await Promise.all([
      client.from('user_saved_questions').select('*').eq('user_id', userId),
      client.from('user_mistakes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      client.from('user_exam_history').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
      client.from('user_responses').select('*').eq('user_id', userId)
    ]);

    // Mapear preguntas guardadas
    const savedQuestions = {};
    (savedRes.data || []).forEach(row => {
      if (row.question_data) {
        savedQuestions[row.question_id] = row.question_data;
      }
    });

    // Mapear banco de fallos
    const mistakes = (mistakesRes.data || []).map(row => ({
      id: row.question_id,
      question: row.question_data?.question || '',
      options: row.question_data?.options || {},
      correctAnswer: row.correct_answer || row.question_data?.correctAnswer,
      category: row.category,
      userAnswer: row.user_answer,
      notes: row.notes || '',
      date: row.created_at
    }));

    // Mapear historial de exámenes
    const examHistory = (historyRes.data || []).map(row => ({
      id: row.id,
      examYear: row.exam_year,
      score: Number(row.score),
      correctCount: row.correct_count,
      totalQuestions: row.total_questions,
      timeSpentSeconds: row.time_spent_seconds,
      date: row.completed_at
    }));

    // Mapear respuestas previas
    const responses = {};
    (responsesRes.data || []).forEach(row => {
      responses[row.question_id] = {
        selectedOption: row.selected_option,
        isCorrect: row.is_correct,
        category: row.category,
        examYear: row.exam_year
      };
    });

    return { savedQuestions, mistakes, examHistory, responses };
  } catch (err) {
    console.warn('Error al cargar datos del usuario desde Supabase:', err);
    return { savedQuestions: {}, mistakes: [], examHistory: [], responses: {} };
  }
}

/**
 * Guardar una respuesta emitida por el usuario en Supabase
 */
export async function syncUserResponseToCloud(userId, { questionId, selectedOption, isCorrect, category = 'salud_publica', examYear = '2026-II' }) {
  const client = getSupabaseClient();
  if (!client || !userId || !questionId) return;

  try {
    await client.from('user_responses').upsert({
      user_id: userId,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      category,
      exam_year: examYear,
      answered_at: new Date().toISOString()
    }, { onConflict: 'user_id, question_id' });
  } catch (err) {
    console.warn('Error al sincronizar respuesta a Supabase:', err.message);
  }
}

/**
 * Guardar o eliminar una pregunta marcada como favorita
 */
export async function syncSavedQuestionToCloud(userId, question, isSaved) {
  const client = getSupabaseClient();
  if (!client || !userId || !question?.id) return;

  try {
    if (isSaved) {
      await client.from('user_saved_questions').upsert({
        user_id: userId,
        question_id: question.id,
        question_data: question,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id, question_id' });
    } else {
      await client.from('user_saved_questions')
        .delete()
        .eq('user_id', userId)
        .eq('question_id', question.id);
    }
  } catch (err) {
    console.warn('Error al sincronizar pregunta guardada:', err.message);
  }
}

/**
 * Guardar o eliminar un fallo del banco de errores
 */
export async function syncMistakeToCloud(userId, mistakeData, isAdding = true) {
  const client = getSupabaseClient();
  if (!client || !userId || !mistakeData?.id) return;

  try {
    if (isAdding) {
      await client.from('user_mistakes').upsert({
        user_id: userId,
        question_id: mistakeData.id,
        question_data: mistakeData,
        user_answer: mistakeData.userAnswer || '',
        correct_answer: mistakeData.correctAnswer || '',
        category: mistakeData.category || 'salud_publica',
        notes: mistakeData.notes || '',
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id, question_id' });
    } else {
      await client.from('user_mistakes')
        .delete()
        .eq('user_id', userId)
        .eq('question_id', mistakeData.id);
    }
  } catch (err) {
    console.warn('Error al sincronizar fallo:', err.message);
  }
}

/**
 * Guardar resultado de examen / simulacro en Supabase
 */
export async function syncExamHistoryToCloud(userId, examResult) {
  const client = getSupabaseClient();
  if (!client || !userId) return;

  try {
    await client.from('user_exam_history').insert({
      user_id: userId,
      exam_year: examResult.examYear || '2026-II',
      score: examResult.score,
      correct_count: examResult.correctCount,
      total_questions: examResult.totalQuestions,
      time_spent_seconds: examResult.timeSpentSeconds || 0,
      completed_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error al sincronizar examen a Supabase:', err.message);
  }
}
