export function calculateScore(questions, userAnswers) {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const categoryStats = {};

  questions.forEach((q) => {
    const userAns = userAnswers[q.id];
    const cat = q.category || 'general';

    if (!categoryStats[cat]) {
      categoryStats[cat] = {
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0
      };
    }

    categoryStats[cat].total += 1;

    if (!userAns) {
      unansweredCount += 1;
      categoryStats[cat].unanswered += 1;
    } else if (userAns === q.correctAnswer) {
      correctCount += 1;
      categoryStats[cat].correct += 1;
    } else {
      incorrectCount += 1;
      categoryStats[cat].incorrect += 1;
    }
  });

  const totalQuestions = questions.length;
  // Vigesimal grade (0.00 to 20.00)
  const vigesimalGrade = totalQuestions > 0 ? (correctCount / totalQuestions) * 20 : 0;
  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const isPassed = vigesimalGrade >= 11.0;

  // Feedback level
  let feedback = {
    title: 'Resultado por Mejorar',
    badge: 'Requiere Refuerzo',
    color: '#ef4444',
    message: 'Te recomendamos repasar las áreas de mayor debilidad con el Modo Tutor y el Banco de Errores.'
  };

  if (vigesimalGrade >= 17.0) {
    feedback = {
      title: '¡Puntaje Sobresaliente!',
      badge: 'Nivel Alto Rendimiento (Top 5%)',
      color: '#10b981',
      message: '¡Excelente dominio de las normas técnicas y clínica médica! Estás en posición privilegiada para adjudicación de plaza.'
    };
  } else if (vigesimalGrade >= 14.0) {
    feedback = {
      title: '¡Buen Rendimiento!',
      badge: 'Nivel Competente (Aprobado)',
      color: '#0ea5e9',
      message: 'Tienes una base sólida. Afina los detalles en las áreas con menor porcentaje de aciertos.'
    };
  } else if (vigesimalGrade >= 11.0) {
    feedback = {
      title: 'Aprobado Básico',
      badge: 'Puntaje Aprobatorio',
      color: '#f59e0b',
      message: 'Has alcanzado la nota aprobatoria mínima, pero necesitas mayor margen de seguridad para asegurar tu plaza ideal.'
    };
  }

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    vigesimalGrade: parseFloat(vigesimalGrade.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(1)),
    isPassed,
    feedback,
    categoryStats
  };
}
