import React from 'react';
import { Stethoscope, Moon, Sun, Printer, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { EXAM_YEARS } from '../data/categories';

export function Header({
  selectedYear,
  onSelectYear,
  theme,
  onToggleTheme,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onOpenExport
}) {
  return (
    <header className="main-header" id="serums-main-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo">
            <Stethoscope size={26} strokeWidth={2.2} />
          </div>
          <div className="brand-info">
            <h1>
              CODESOFT
              <span className="brand-badge">SERUMS 2026</span>
            </h1>
            <p className="brand-subtitle">
              Plataforma Médica de Alto Rendimiento • Examen Nacional SERUMS (MINSA)
            </p>
          </div>
        </div>

        <div className="header-controls">
          {/* Exam Process Selector */}
          <select
            id="exam-process-select"
            className="exam-selector-select"
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            title="Seleccionar proceso de examen oficial"
          >
            {EXAM_YEARS.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>

          {/* Font Size Adjusters */}
          <button
            id="btn-font-decrease"
            className="action-btn-sm"
            onClick={onDecreaseFontSize}
            title="Disminuir tamaño de letra"
          >
            <ZoomOut size={16} />
          </button>
          <button
            id="btn-font-increase"
            className="action-btn-sm"
            onClick={onIncreaseFontSize}
            title="Aumentar tamaño de letra"
          >
            <ZoomIn size={16} />
          </button>

          {/* Print / Export */}
          <button
            id="btn-open-export"
            className="action-btn-sm"
            onClick={onOpenExport}
            title="Imprimir o Exportar Examen"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo Claro' : 'Cambiar a modo Oscuro'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
