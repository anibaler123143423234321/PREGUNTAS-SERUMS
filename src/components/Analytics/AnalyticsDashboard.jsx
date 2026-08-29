import React from 'react';
import { BarChart3, Award, TrendingUp, Clock, CheckCircle2, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export function AnalyticsDashboard({
  examHistory = [],
  mistakesCount = 0,
  savedCount = 0
}) {
  const totalExams = examHistory.length;
  const avgScore = totalExams > 0
    ? (examHistory.reduce((acc, curr) => acc + curr.score, 0) / totalExams).toFixed(2)
    : '0.00';
  const maxScore = totalExams > 0
    ? Math.max(...examHistory.map((e) => e.score)).toFixed(2)
    : '0.00';
  const latestExam = totalExams > 0 ? examHistory[examHistory.length - 1] : null;

  return (
    <div className="analytics-view" id="analytics-view">
      {/* Top Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'left', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="stat-box-lbl">Simulacros Completados</span>
            <Award size={22} color="var(--primary)" />
          </div>
          <div className="stat-box-val" style={{ color: 'var(--primary)', fontSize: '2.2rem' }}>
            {totalExams}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historial registrado</span>
        </div>

        <div className="stat-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'left', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="stat-box-lbl">Nota Promedio (0-20)</span>
            <TrendingUp size={22} color="var(--success)" />
          </div>
          <div className="stat-box-val" style={{ color: 'var(--success)', fontSize: '2.2rem' }}>
            {avgScore}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escala vigesimal</span>
        </div>

        <div className="stat-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'left', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="stat-box-lbl">Mejor Calificación</span>
            <Sparkles size={22} color="#f59e0b" />
          </div>
          <div className="stat-box-val" style={{ color: '#f59e0b', fontSize: '2.2rem' }}>
            {maxScore}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Puntaje pico</span>
        </div>

        <div className="stat-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', textAlign: 'left', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="stat-box-lbl">Preguntas en Observación</span>
            <AlertCircle size={22} color="var(--danger)" />
          </div>
          <div className="stat-box-val" style={{ color: 'var(--danger)', fontSize: '2.2rem' }}>
            {mistakesCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Banco de errores activo</span>
        </div>
      </div>

      {/* Recommendation Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} />
          Estrategia Recomendada para el Examen SERUMS
        </h3>
        <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          El examen SERUMS del MINSA concentra más del <strong>50% del puntaje</strong> en <em>Salud Pública, Gestión en APS (MAIS/RIS/SISMED)</em> y <em>Normas Técnicas de Salud (Anemia 2024, Dengue, TBC, Materno)</em>. Realiza simulacros completos semanales con límite de tiempo de 2 horas para entrenar velocidad y gestión del estrés.
        </p>
      </div>

      {/* Exam History Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="var(--primary)" />
          Historial de Simulacros Realizados
        </h3>

        {examHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            Aún no has completado ningún simulacro oficial. ¡Inicia uno en la pestaña de Simulacro Oficial!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>#</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Fecha</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Aciertos</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Porcentaje</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Nota (0-20)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tiempo</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {examHistory.map((item, idx) => {
                  const isPass = item.score >= 11;
                  const dateStr = new Date(item.date).toLocaleString('es-PE', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  });
                  const mins = Math.floor(item.timeSpentSeconds / 60);
                  const secs = item.timeSpentSeconds % 60;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{dateStr}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{item.correctCount} / {item.totalQuestions}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{item.percentage}%</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: isPass ? 'var(--success)' : 'var(--danger)' }}>
                        {item.score.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {mins}m {secs}s
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isPass ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: isPass ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          {isPass ? 'Aprobado' : 'Desaprobado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
