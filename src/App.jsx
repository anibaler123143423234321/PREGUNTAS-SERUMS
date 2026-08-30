import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { ExamSimulator } from './components/ExamSimulator/ExamSimulator';
import { TutorMode } from './components/TutorMode/TutorMode';
import { Flashcards } from './components/Flashcards/Flashcards';
import { MistakeBank } from './components/MistakeBank/MistakeBank';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { QuestionFinder } from './components/QuestionFinder/QuestionFinder';
import { ExportModal } from './components/ExportModal/ExportModal';
import { DocsModal } from './components/DocsModal/DocsModal';
import { AiExamGenerator } from './components/AiExamGenerator/AiExamGenerator';
import { AcademiesRanking } from './components/AcademiesRanking/AcademiesRanking';
import { QUESTIONS_DATA } from './data/questionsData';
import { useLocalStorage } from './hooks/useLocalStorage';

export function App() {
  // Tema y Accesibilidad
  const [theme, setTheme] = useLocalStorage('serums_theme', 'dark');
  const [fontSize, setFontSize] = useLocalStorage('serums_font_size', 1.05);

  // Navegacion y Seleccion de Modulos
  const [activeTab, setActiveTab] = useState('ai');
  const [selectedYear, setSelectedYear] = useState('2026-II');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [customAiExam, setCustomAiExam] = useState(null);

  // Datos Persistentes del Medico
  const [savedQuestions, setSavedQuestions] = useLocalStorage('serums_saved_q', {});
  const [mistakes, setMistakes] = useLocalStorage('serums_mistakes', []);
  const [examHistory, setExamHistory] = useLocalStorage('serums_history', []);

  // Sincronizar atributo data-theme en el elemento raiz HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleIncreaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 0.08, 1.4));
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 0.08, 0.85));
  };

  // Alternar guardado de pregunta destacada
  const handleToggleSave = (question) => {
    setSavedQuestions((prev) => {
      const next = { ...prev };
      if (next[question.id]) {
        delete next[question.id];
      } else {
        next[question.id] = question;
      }
      return next;
    });
  };

  // Record Mistakes from exam completion
  const handleRecordMistakes = (failedQuestions) => {
    setMistakes((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const newItems = failedQuestions.filter((q) => !existingIds.has(q.id));
      return [...prev, ...newItems];
    });
  };

  const handleRemoveMistake = (qId) => {
    setMistakes((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleClearMistakes = () => {
    setMistakes([]);
  };

  const handleSaveExamHistory = (record) => {
    setExamHistory((prev) => [...prev, record]);
  };

  const handleStartCustomExam = (generatedQuestions) => {
    setCustomAiExam(generatedQuestions);
    setActiveTab('exam');
  };

  // Filter questions for the selected exam process
  const activeQuestions = useMemo(() => {
    if (customAiExam && customAiExam.length > 0) {
      return customAiExam;
    }
    if (selectedYear === 'all') return QUESTIONS_DATA;
    return QUESTIONS_DATA.filter((q) => q.year === selectedYear);
  }, [selectedYear, customAiExam]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Header
        selectedYear={customAiExam ? 'ai' : selectedYear}
        onSelectYear={(yr) => {
          setCustomAiExam(null);
          setSelectedYear(yr);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenExport={() => setShowExportModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <NavigationBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'exam') setCustomAiExam(null);
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        mistakesCount={mistakes.length}
        savedCount={Object.keys(savedQuestions).length}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="content-wrapper">
        {activeTab === 'exam' && (
          <ExamSimulator
            key={customAiExam ? 'custom-ai-exam' : selectedYear}
            questions={activeQuestions}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            onRecordMistakes={handleRecordMistakes}
            onSaveExamHistory={handleSaveExamHistory}
            fontSize={fontSize}
            onSwitchToTutor={() => setActiveTab('tutor')}
          />
        )}

        {activeTab === 'tutor' && (
          <TutorMode
            allQuestions={activeQuestions}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'ai' && (
          <AiExamGenerator
            onStartCustomExam={handleStartCustomExam}
            onSaveQuestionToBank={handleToggleSave}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'flashcards' && (
          <Flashcards questions={activeQuestions} />
        )}

        {activeTab === 'mistakes' && (
          <MistakeBank
            mistakes={mistakes}
            onClearMistakes={handleClearMistakes}
            onRemoveMistake={handleRemoveMistake}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            examHistory={examHistory}
            mistakesCount={mistakes.length}
            savedCount={Object.keys(savedQuestions).length}
          />
        )}

        {activeTab === 'search' && (
          <QuestionFinder
            allQuestions={QUESTIONS_DATA}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'academies' && (
          <AcademiesRanking />
        )}
      </div>

      {showExportModal && (
        <ExportModal
          allQuestions={QUESTIONS_DATA}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showDocsModal && (
        <DocsModal
          isOpen={showDocsModal}
          onClose={() => setShowDocsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
