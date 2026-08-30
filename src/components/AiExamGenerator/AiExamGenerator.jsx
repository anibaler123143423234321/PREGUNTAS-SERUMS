import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Cpu, RefreshCw, Key, Layers, CheckCircle2, Bookmark, Zap, Lightbulb, Clock, Target, ShieldCheck, Flame, Play, Tag, Database, Cloud, Check, AlertCircle, FileText, Image, Trash2, X, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { CATEGORIES } from '../../data/categories';
import { generateSingleQuestion, generateExamBatch } from '../../services/aiService';
import { SERUMS_PEARLS_BY_CATEGORY, HIGH_YIELD_TOPIC_PILLS } from '../../data/serumsPearls';
import {
  saveAiQuestionToCloud,
  getActiveSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured
} from '../../services/supabaseClient';
import { QuestionCard } from '../ExamSimulator/QuestionCard';
import { DocsModal } from '../DocsModal/DocsModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { EcgHeartbeatLoader, NeuralAiLoader, PulseRadarLoader, CloudSyncAnimated } from '../Common/AnimatedIcons';
import { sanitizeInput } from '../../utils/securitySanitizer';

const DIFFICULTY_OPTIONS = [
  { id: 'standard', label: 'Estándar MINSA', short: 'Estándar', icon: Target },
  { id: 'high', label: 'Alta Rentabilidad', short: 'Alta Rent.', icon: Flame },
  { id: 'normative', label: 'Normativa NTS', short: 'Normas NTS', icon: ShieldCheck }
];

export function AiExamGenerator({
  onStartCustomExam,
  onSaveQuestionToBank,
  savedQuestions,
  onToggleSave,
  fontSize
}) {
  const defaultAiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_NVIDIA_API_KEY || '';
  const [apiKey, setApiKey] = useLocalStorage('serums_ai_active_api_key', defaultAiKey);

  // Auto-actualizar automáticamente a Groq LPU si la clave guardada en localStorage es la antigua o está vacía
  useEffect(() => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqKey && (!apiKey || apiKey.startsWith('nvapi-'))) {
      setApiKey(groqKey);
    }
  }, []);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const questionCardRef = useRef(null);

  // Supabase Cloud Configuration State
  const initialCreds = getActiveSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState(null);
  const [isCloudEnabled, setIsCloudEnabled] = useState(isSupabaseConfigured());
  const [cloudSyncStatus, setCloudSyncStatus] = useState(null); // 'saving' | 'saved' | 'error'

  // Persistent Single Question Mode State (conservado al cambiar de tab o recargar)
  const [singleCategory, setSingleCategory] = useLocalStorage('serums_ai_category', 'all');
  const [singleDifficulty, setSingleDifficulty] = useLocalStorage('serums_ai_difficulty', 'standard');
  const [customTopic, setCustomTopic] = useLocalStorage('serums_ai_topic', '');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [questionsHistory, setQuestionsHistory] = useLocalStorage('serums_ai_history', []);
  const [currentIndex, setCurrentIndex] = useLocalStorage('serums_ai_current_idx', 0);
  const [userAnswersMap, setUserAnswersMap] = useLocalStorage('serums_ai_user_answers', {});
  const [singleError, setSingleError] = useState('');

  // Reiniciar historial de preguntas IA
  const handleClearAiSession = () => {
    setQuestionsHistory([]);
    setCurrentIndex(0);
    setUserAnswersMap({});
  };

  // Guardar credenciales de Supabase
  const handleSaveSupabaseConfig = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setIsCloudEnabled(isSupabaseConfigured());
    setShowKeyConfig(false);
  };

  // Probar conexión con Supabase
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      await testSupabaseConnection();
      setSupabaseTestResult({ success: true, message: '¡Conexión exitosa con la tabla "preguntas_ia"!' });
      setIsCloudEnabled(true);
    } catch (err) {
      setSupabaseTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Mini-Exam State (Max 2 questions to strictly protect NVIDIA credits)
  const [isGeneratingMini, setIsGeneratingMini] = useState(false);
  const [miniExamQuestions, setMiniExamQuestions] = useState([]);

  // Dynamic Categorized Pearls for Waiting Screen
  const activePearlsList = useMemo(() => {
    return SERUMS_PEARLS_BY_CATEGORY[singleCategory] || SERUMS_PEARLS_BY_CATEGORY.all;
  }, [singleCategory]);

  // Timer & Tip Rotation for Waiting Experience (Randomized start)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    let intervalTimer = null;
    let tipTimer = null;

    if (isLoadingSingle || isGeneratingMini) {
      setElapsedSeconds(0);
      // Pick a random starting tip so it's always different
      setTipIndex(Math.floor(Math.random() * activePearlsList.length));

      intervalTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      tipTimer = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % activePearlsList.length);
      }, 3500);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalTimer) clearInterval(intervalTimer);
      if (tipTimer) clearInterval(tipTimer);
    };
  }, [isLoadingSingle, isGeneratingMini, activePearlsList]);

  // Handle single question generation (generates, saves locally and syncs to Supabase Cloud)
  const handleGenerateNextQuestion = async () => {
    setIsLoadingSingle(true);
    setSingleError('');
    setCloudSyncStatus(null);
    try {
      const q = await generateSingleQuestion({
        category: singleCategory,
        difficulty: singleDifficulty,
        topic: customTopic,
        apiKey
      });
      setQuestionsHistory((prev) => {
        const nextList = [...prev, q];
        setCurrentIndex(nextList.length - 1);
        return nextList;
      });

      // Auto-guardado en Supabase Cloud si está configurado
      if (isSupabaseConfigured()) {
        setCloudSyncStatus('saving');
        const res = await saveAiQuestionToCloud(q);
        if (res.success) {
          setCloudSyncStatus('saved');
        } else {
          setCloudSyncStatus('error');
        }
      }
    } catch (err) {
      setSingleError(err.message || 'Error al generar la pregunta con NVIDIA AI.');
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questionsHistory.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Generate the next AI question seamlessly
      handleGenerateNextQuestion();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Descargar la pregunta actual en archivo de texto .txt estructurado
  const handleDownloadTxt = (question) => {
    if (!question) return;
    const opt = question.options || {};
    const txtContent = `================================================================================
CODESOFT SERUMS 2026 — CASO CLÍNICO OFICIAL DE EXAMEN
================================================================================
ÁREA / BLOQUE TEMÁTICO : ${question.category ? question.category.toUpperCase() : 'SALUD PÚBLICA'}
ORIGEN & MOTOR         : ${question.year || 'Generado con IA (Groq LPU)'}
FECHA DE GENERACIÓN    : ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}

--------------------------------------------------------------------------------
ENUNCIADO / CASO CLÍNICO:
--------------------------------------------------------------------------------
${question.question}

--------------------------------------------------------------------------------
ALTERNATIVAS DE RESPUESTA:
--------------------------------------------------------------------------------
A) ${opt.A || ''}
B) ${opt.B || ''}
C) ${opt.C || ''}
D) ${opt.D || ''}

--------------------------------------------------------------------------------
RESPUESTA CORRECTA:
--------------------------------------------------------------------------------
CLAVE OFICIAL: [ ${question.correctAnswer} ] - ${opt[question.correctAnswer] || ''}

--------------------------------------------------------------------------------
JUSTIFICACIÓN CLÍNICA & NORMATIVA MINSA:
--------------------------------------------------------------------------------
${question.explanation || 'Sin fundamentación clínica.'}

--------------------------------------------------------------------------------
PERLA DE ALTO RENDIMIENTO SERUMS:
--------------------------------------------------------------------------------
${question.pearl || 'Sin perla disponible.'}

REFERENCIAS NORMATIVAS: ${question.references || 'Normas Técnicas de Salud MINSA'}
================================================================================
Plataforma Médica CODESOFT SERUMS 2026 • https://codesoft-serums.pe
================================================================================
`;
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pregunta_serums_${question.category || 'ia'}_${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  // Descargar captura en imagen PNG de alta resolución
  const handleDownloadPng = async () => {
    if (!questionCardRef.current) return;
    try {
      setIsExportingPng(true);
      const dataUrl = await toPng(questionCardRef.current, {
        cacheBust: true,
        backgroundColor: '#0f172a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `pregunta_serums_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar imagen PNG:', err);
      alert('No se pudo generar la imagen PNG. Intenta descargar en .txt o .json.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Limpiar / Cerrar la pregunta de la pantalla
  const handleClearQuestion = () => {
    if (window.confirm('¿Deseas limpiar y cerrar la pregunta actual de la pantalla?')) {
      setQuestionsHistory([]);
      setCurrentIndex(0);
      setUserAnswersMap({});
    }
  };

  // Handle safe Mini Reto generation (Strictly 2 questions to protect free credits)
  const handleGenerateMiniChallenge = async () => {
    setIsGeneratingMini(true);
    setSingleError('');
    try {
      const questions = await generateExamBatch({
        totalQuestions: 2,
        category: singleCategory,
        difficulty: singleDifficulty,
        topic: customTopic,
        apiKey
      });
      if (questions.length > 0) {
        setMiniExamQuestions(questions);
        if (onStartCustomExam) {
          onStartCustomExam(questions);
        }
      }
    } catch (err) {
      setSingleError(err.message || 'Error al generar el mini-reto con IA.');
    } finally {
      setIsGeneratingMini(false);
    }
  };

  return (
    <div className="ai-exam-generator-view" id="ai-exam-generator-view" style={{ maxWidth: '1360px', margin: '0 auto' }}>
      
      {/* Configuration Dropdown (Groq / Gemini / NVIDIA & Supabase Cloud) */}
      {showKeyConfig && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', animation: 'fadeIn 0.25s ease-in-out', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <Key size={17} color="var(--primary)" />
              <span>Motores de Inteligencia Artificial y Base de Datos Cloud</span>
            </h4>
            <button
              type="button"
              className="action-btn-sm"
              onClick={() => setShowDocs(true)}
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', background: 'rgba(2, 132, 199, 0.1)', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700 }}
            >
              📚 Ver Cuotas & Documentación
            </button>
          </div>

          {/* AI Engine Key */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                1. Clave de Motor de IA (Groq Cloud recomendada):
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                ⚡ Obtener clave gratis de Groq (Ultra Rápido)
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega tu clave de Groq (gsk_...), Gemini (AIzaSy...) o NVIDIA (nvapi-...)"
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.84rem' }}
            />
          </div>

          {/* Supabase Cloud Configuration */}
          <div style={{ padding: '0.9rem', background: 'rgba(2, 132, 199, 0.04)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Cloud size={15} color="var(--primary)" />
                <span>2. Base de Datos Supabase (PostgreSQL Cloud):</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>Tabla: preguntas_ia</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>Project URL:</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  style={{ width: '100%', padding: '0.45rem 0.7rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>Anon Public API Key (Token):</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  style={{ width: '100%', padding: '0.45rem 0.7rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Test result feedback */}
            {supabaseTestResult && (
              <div style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-xs)', fontSize: '0.76rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.45rem', background: supabaseTestResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: supabaseTestResult.success ? '#34d399' : 'var(--danger)', border: supabaseTestResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600 }}>
                {supabaseTestResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{supabaseTestResult.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
              <button
                type="button"
                className="action-btn-sm"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem' }}
              >
                {isTestingSupabase ? <RefreshCw size={12} className="animate-spin" /> : <Cloud size={12} />}
                <span>Probar Conexión</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setShowKeyConfig(false)} style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSaveSupabaseConfig} style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem', fontWeight: 700 }}>
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout: Sidebar on Desktop, Stacked on Mobile */}
      <div className="ai-generator-grid-layout">
        
        {/* ================= LEFT SIDEBAR (Controls & Filters) ================= */}
        <aside className="ai-left-sidebar-card">
          
          {/* Header info in Sidebar */}
          <div style={{ marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.55rem',
                  background: apiKey?.startsWith('gsk_') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                  color: apiKey?.startsWith('gsk_') ? '#10b981' : '#a78bfa',
                  border: apiKey?.startsWith('gsk_') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
              >
                <Zap size={12} className="animate-pulse" />
                <span>
                  {apiKey?.startsWith('gsk_')
                    ? 'Groq LPU (~1.5s)'
                    : apiKey?.startsWith('AIzaSy')
                    ? 'Gemini Flash'
                    : 'NVIDIA AI'}
                </span>
              </div>

              <button
                type="button"
                className="action-btn-sm"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                style={{
                  background: showKeyConfig ? 'var(--primary)' : 'var(--bg-surface)',
                  color: showKeyConfig ? '#fff' : 'var(--text-main)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Configurar claves de IA y Supabase Cloud"
              >
                <Key size={12} />
                <span>{showKeyConfig ? 'Ocultar' : '⚙️ Claves'}</span>
              </button>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: 'var(--text-main)' }}>
              Panel de Simulación IA
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: 1.35 }}>
              Calibrado con el Temario SERUMS 2027 y Normativa MINSA.
            </p>
          </div>

          {/* Step 1: Specialty Pills */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--text-main)', marginBottom: '0.45rem', fontWeight: 800 }}>
              <Layers size={14} color="var(--primary)" />
              <span>1. Área Temática:</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
              {Object.values(CATEGORIES).map((c) => {
                const isSelected = singleCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSingleCategory(c.id)}
                    disabled={isLoadingSingle || isGeneratingMini}
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 800 : 600,
                      background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(2, 132, 199, 0.35)' : 'none'
                    }}
                  >
                    {c.shortName || c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Complexity */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--text-main)', marginBottom: '0.45rem', fontWeight: 800 }}>
              <Target size={14} color="var(--primary)" />
              <span>2. Nivel de Complejidad:</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {DIFFICULTY_OPTIONS.map((d) => {
                const Icon = d.icon;
                const isSelected = singleDifficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSingleDifficulty(d.id)}
                    disabled={isLoadingSingle || isGeneratingMini}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-medium)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Custom Topic & Quick Pills */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--text-main)', fontWeight: 800 }}>
                <Tag size={14} color="var(--primary)" />
                <span>3. Tema Libre / Fijas:</span>
              </label>
              {customTopic && (
                <button
                  onClick={() => setCustomTopic('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.7rem', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                >
                  ✕ Borrar
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="ej. Dengue signos alarma, Zuspan, NTS Anemia..."
              value={customTopic}
              onChange={(e) => setCustomTopic(sanitizeInput(e.target.value, { maxLength: 80 }))}
              disabled={isLoadingSingle || isGeneratingMini}
              style={{ width: '100%', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', marginBottom: '0.45rem' }}
            />

            {/* Quick Pills */}
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {HIGH_YIELD_TOPIC_PILLS.slice(0, 6).map((p, pIdx) => {
                const isPillActive = customTopic === p.topic;
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setCustomTopic(isPillActive ? '' : sanitizeInput(p.topic, { maxLength: 80 }))}
                    disabled={isLoadingSingle || isGeneratingMini}
                    style={{
                      padding: '0.18rem 0.45rem',
                      fontSize: '0.68rem',
                      borderRadius: 'var(--radius-full)',
                      background: isPillActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: isPillActive ? 'var(--primary)' : 'var(--text-secondary)',
                      border: isPillActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontWeight: isPillActive ? 700 : 500
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons in Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              id="btn-generate-ai-single"
              className="btn-primary"
              onClick={handleGenerateNextQuestion}
              disabled={isLoadingSingle || isGeneratingMini}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem'
              }}
            >
              {isLoadingSingle ? (
                <>
                  <PulseRadarLoader size={18} color="#ffffff" />
                  <span>Redactando ({elapsedSeconds}s)...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>⚡ Generar Pregunta Inédita</span>
                </>
              )}
            </button>

            <button
              className="btn-secondary"
              onClick={handleGenerateMiniChallenge}
              disabled={isLoadingSingle || isGeneratingMini}
              style={{ width: '100%', padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              title="Genera un reto corto de 2 preguntas de simulación"
            >
              {isGeneratingMini ? (
                <>
                  <PulseRadarLoader size={16} color="var(--primary)" />
                  <span>Generando mini-reto...</span>
                </>
              ) : (
                <>
                  <Layers size={14} />
                  <span>Mini-Reto (2 Preguntas)</span>
                </>
              )}
            </button>

            {questionsHistory.length > 0 && (
              <button
                type="button"
                className="action-btn-sm"
                onClick={handleClearAiSession}
                disabled={isLoadingSingle || isGeneratingMini}
                style={{ width: '100%', background: 'transparent', borderColor: 'var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.76rem', padding: '0.4rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
              >
                <RefreshCw size={12} />
                <span>Reiniciar Sesión ({questionsHistory.length} generadas)</span>
              </button>
            )}
          </div>
        </aside>


        {/* ================= RIGHT MAIN CLINICAL AREA ================= */}
        <main className="ai-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          
          {/* Live Loading Radar / Timer Card */}
          {(isLoadingSingle || isGeneratingMini) && (
            <div style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', animation: 'fadeIn 0.3s ease-in' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.92rem' }}>
                  <Zap size={20} className="animate-pulse" />
                  <span>Groq LPU procesando caso clínico con Normativa MINSA...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', background: 'var(--bg-surface)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                  <Clock size={14} color="var(--primary)" />
                  <span>Tiempo transcurrido: {elapsedSeconds}s</span>
                </div>
              </div>

              {/* Rotating Medical Flash Tip */}
              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Lightbulb size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: '#f59e0b' }}>Perla Clave SERUMS: </strong>
                  <span>{activePearlsList[tipIndex % activePearlsList.length]}</span>
                </p>
              </div>
            </div>
          )}

          {/* Friendly Error Card with Retry Button */}
          {singleError && (
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                animation: 'fadeIn 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', maxWidth: '650px' }}>
                <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: 'var(--danger)', marginBottom: '0.2rem' }}>
                    Aviso de Conexión
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {singleError.includes('<!DOCTYPE') || singleError.includes('404') || singleError.includes('Page not found')
                      ? 'Fallo temporal de conexión con el servidor. Presiona "Reintentar Ahora" para generar con Groq LPU.'
                      : singleError}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateNextQuestion}
                style={{
                  background: 'var(--danger)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                <RefreshCw size={14} />
                <span>Reintentar Ahora</span>
              </button>
            </div>
          )}

          {/* Generated Question Display */}
          {questionsHistory.length > 0 && questionsHistory[currentIndex] ? (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              
              {/* Action Toolbar: Downloads (.txt, .png, .json), Cloud Sync & Clear Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', gap: '0.4rem', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)' }}>
                {/* Download Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="action-btn-sm"
                    onClick={() => handleDownloadTxt(questionsHistory[currentIndex])}
                    style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: 'var(--bg-surface)', borderColor: 'var(--border-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                    title="Descargar esta pregunta en archivo de texto (.txt)"
                  >
                    <FileText size={13} color="var(--primary)" />
                    <span>Descargar .txt</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn-sm"
                    onClick={handleDownloadPng}
                    disabled={isExportingPng}
                    style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: 'var(--bg-surface)', borderColor: 'var(--border-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                    title="Descargar captura en imagen PNG de alta resolución"
                  >
                    {isExportingPng ? <RefreshCw size={13} className="animate-spin" /> : <Image size={13} color="#10b981" />}
                    <span>{isExportingPng ? 'Generando...' : 'Descargar .png'}</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn-sm"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questionsHistory, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `preguntas_ia_serums_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: 'var(--bg-surface)', borderColor: 'var(--border-medium)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Descargar sesión en JSON"
                  >
                    <Download size={13} />
                    <span>Sesión .json</span>
                  </button>
                </div>

                {/* Right Status & Clear Question (X) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isCloudEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem' }}>
                      {cloudSyncStatus === 'saving' && (
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <RefreshCw size={12} className="animate-spin" /> Guardando en Supabase...
                        </span>
                      )}
                      {cloudSyncStatus === 'saved' && (
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                          <Check size={14} /> Cloud Guardado
                        </span>
                      )}
                      {cloudSyncStatus === 'error' && (
                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertCircle size={14} /> Error Cloud
                        </span>
                      )}
                    </div>
                  )}

                  {/* Botón X para Limpiar Pregunta */}
                  <button
                    type="button"
                    className="action-btn-sm"
                    onClick={handleClearQuestion}
                    style={{
                      fontSize: '0.74rem',
                      padding: '0.3rem 0.65rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontWeight: 700
                    }}
                    title="Limpiar y cerrar la pregunta actual de la pantalla"
                  >
                    <X size={14} />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              {/* Question Card Container for PNG snapshot */}
              <div ref={questionCardRef} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                <QuestionCard
                  question={questionsHistory[currentIndex]}
                  currentIndex={currentIndex}
                  totalQuestions={questionsHistory.length}
                  selectedOption={userAnswersMap[questionsHistory[currentIndex].id]}
                  onSelectOption={(letter) => {
                    setUserAnswersMap((prev) => ({
                      ...prev,
                      [questionsHistory[currentIndex].id]: letter
                    }));
                  }}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  isFlagged={false}
                  onToggleFlag={() => {}}
                  isSaved={!!savedQuestions[questionsHistory[currentIndex].id]}
                  onToggleSave={() => onToggleSave(questionsHistory[currentIndex])}
                  fontSize={fontSize}
                  showInstantFeedback={true}
                  allowInfiniteNext={true}
                  nextButtonLabel={currentIndex === questionsHistory.length - 1 ? 'Siguiente Pregunta IA ✨' : 'Siguiente'}
                  isLoadingNext={isLoadingSingle}
                />
              </div>
            </div>
          ) : (
            /* Welcome Clinical Showcase Card when no question is active */
            !isLoadingSingle && !isGeneratingMini && (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '420px'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Sparkles size={32} />
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                  Laboratorio Clínico SERUMS 2027
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '520px', lineHeight: 1.5, margin: '0 0 1.75rem 0' }}>
                  Selecciona la especialidad médica en el panel izquierdo y haz clic en <strong>"Generar Pregunta Inédita"</strong> para simular casos reales de Establecimientos I-1 a I-4.
                </p>

                {/* 3 Feature Highlights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', width: '100%', maxWidth: '720px', textAlign: 'left' }}>
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <ShieldCheck size={16} />
                      <span>Normativa NTS MINSA</span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                      Casos clínicos basados en Guías Técnicas de Anemia, Dengue, Materno-Perinatal y TBC.
                    </p>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <Zap size={16} />
                      <span>Groq LPU Instantáneo</span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                      Respuestas ultra-rápidas (~1.5s) con justificación fisiopatológica completa.
                    </p>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <Cloud size={16} />
                      <span>Sincronización Cloud</span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                      Guarda tus preguntas favoritas y respuestas erradas en tu cuenta de Supabase.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {showDocs && (
        <DocsModal
          isOpen={showDocs}
          onClose={() => setShowDocs(false)}
        />
      )}
    </div>
  );
}
