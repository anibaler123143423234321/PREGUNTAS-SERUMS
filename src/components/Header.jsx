import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, Moon, Sun, Printer, Menu, X, ChevronDown, Check, BookOpen } from 'lucide-react';
import { EXAM_YEARS } from '../data/categories';
import { AuthButton } from './Auth/AuthButton';

export function Header({
  selectedYear,
  onSelectYear,
  theme,
  onToggleTheme,
  onOpenExport,
  onOpenDocs,
  isDocsActive = false,
  onOpenAuthModal,
  isMobileMenuOpen,
  onToggleMobileMenu
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar menu desplegable al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYearObj = EXAM_YEARS.find((y) => y.id === selectedYear) || EXAM_YEARS[1] || EXAM_YEARS[0];

  return (
    <header className="main-header" id="serums-main-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            <Stethoscope size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-name">CODESOFT</span>
              <span className="brand-badge">SERUMS 2027</span>
            </div>
            <p className="brand-subtitle">
              Plataforma Médica • Examen Nacional SERUMS (MINSA)
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          {/* Custom Exam Process Dropdown */}
          <div className="custom-dropdown-container" ref={dropdownRef}>
            <button
              id="custom-exam-select-trigger"
              className={`custom-dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              title="Seleccionar proceso oficial"
            >
              <span className="selected-process-text">
                {selectedYear === 'ai' ? 'Examen IA Personalizado' : currentYearObj.short || currentYearObj.name}
              </span>
              <ChevronDown size={15} className={`dropdown-chevron ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="custom-dropdown-menu" role="listbox">
                <div className="dropdown-menu-header">
                  <span>PROCESO OFICIAL SERUMS</span>
                </div>
                <div className="dropdown-options-list">
                  {EXAM_YEARS.map((y) => {
                    const isSelected = selectedYear === y.id;
                    return (
                      <button
                        key={y.id}
                        className={`dropdown-option-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          onSelectYear(y.id);
                          setIsDropdownOpen(false);
                        }}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="option-info">
                          <span className="option-name">{y.name}</span>
                          <span className="option-count">
                            {y.id === 'all' ? '500 preguntas' : '100 preguntas'}
                          </span>
                        </div>
                        {isSelected && <Check size={16} className="option-check-icon" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Utilities */}
          <div className="desktop-controls-group">
            <AuthButton onOpenAuthModal={onOpenAuthModal} />

            <button
              id="btn-open-docs"
              className="icon-circle-btn"
              onClick={onOpenDocs}
              title={isDocsActive ? "Cerrar Documentación y volver al módulo" : "Centro de Documentación Técnica & Guías"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                width: 'auto',
                padding: '0 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: isDocsActive ? 'var(--primary)' : 'var(--bg-surface)',
                color: isDocsActive ? '#fff' : 'var(--text-main)',
                border: isDocsActive ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                transition: 'all 0.2s ease'
              }}
            >
              <BookOpen size={15} color={isDocsActive ? '#fff' : 'var(--primary)'} />
              <span className="hide-on-mobile">{isDocsActive ? 'Cerrar Doc' : 'Doc'}</span>
            </button>

            <button
              id="btn-open-export"
              className="icon-circle-btn"
              onClick={onOpenExport}
              title="Imprimir / Exportar Examen"
            >
              <Printer size={16} />
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="btn-theme-toggle"
            className="theme-toggle-circle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo Claro' : 'Cambiar a modo Oscuro'}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={17} className="sun-icon" /> : <Moon size={17} className="moon-icon" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="btn-mobile-menu"
            className="mobile-menu-btn"
            onClick={onToggleMobileMenu}
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
