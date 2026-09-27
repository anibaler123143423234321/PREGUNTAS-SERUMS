import React from 'react';
import { Timer, BookOpen, Layers, AlertTriangle, BarChart3, Search, Sparkles, X, ChevronRight, Award, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function NavigationBar({
  activeTab,
  onSelectTab,
  mistakesCount = 0,
  savedCount = 0,
  isMobileMenuOpen = false,
  onCloseMobileMenu = () => {},
  bankCount = 0,
  career = null,
  onOpenCareerSelector = () => {}
}) {
  const { isAuthenticated, logout } = useAuth();
  const mainTabs = [
    { id: 'ai', label: 'Generador IA', fullLabel: 'Generador IA', icon: Sparkles, count: 'PRO', isHighlight: true },
    { id: 'exam', label: 'Simulacro', fullLabel: 'Simulacro', icon: Timer, count: null },
    { id: 'tutor', label: 'Tutor', fullLabel: 'Modo Tutor / Estudio', icon: BookOpen, count: null },
    { id: 'flashcards', label: 'Flashcards', fullLabel: 'Flashcards 3D', icon: Layers, count: null },
    { id: 'mistakes', label: 'Errores', fullLabel: 'Banco de Errores', icon: AlertTriangle, count: mistakesCount, isDanger: mistakesCount > 0 },
    { id: 'analytics', label: 'Desempeño', fullLabel: 'Analytics & Desempeño', icon: BarChart3, count: null },
    { id: 'search', label: 'Buscador', fullLabel: bankCount > 0 ? `Buscador (${bankCount})` : 'Buscador', icon: Search, count: null },
    { id: 'academies', label: 'Academias', fullLabel: 'Academias', icon: Award, count: null }
  ];

  return (
    <>
      {/* Top Segmented Navigation Bar (Responsive on all screens) */}
      <nav className="main-nav-bar" id="serums-main-nav-bar">
        <div className="main-nav-inner">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={`nav-pill-btn ${isActive ? 'active' : ''} ${tab.isHighlight ? 'highlight-pill' : ''}`}
                onClick={() => {
                  onSelectTab(tab.id);
                  onCloseMobileMenu();
                }}
              >
                <Icon size={16} className="pill-icon" />
                <span className="pill-label-desktop">{tab.fullLabel}</span>
                <span className="pill-label-mobile">{tab.label}</span>
                {tab.count !== null && (
                  <span className={`pill-badge ${tab.isDanger ? 'danger' : ''}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer / Full Screen Menu Modal */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={onCloseMobileMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3>Módulos de Entrenamiento</h3>
                <p>{career ? `${career.emoji} ${career.name} • SERUMS` : 'Evaluación SERUMS'}</p>
              </div>
              <button className="drawer-close-btn" onClick={onCloseMobileMenu} aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-items-list">
              <button
                className="drawer-menu-item"
                onClick={() => {
                  onCloseMobileMenu();
                  onOpenCareerSelector();
                }}
              >
                <div className="item-icon-box">
                  <GraduationCap size={18} />
                </div>
                <div className="item-text-box">
                  <span className="item-title">Cambiar carrera</span>
                </div>
                <ChevronRight size={16} className="item-arrow" />
              </button>
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectTab(tab.id);
                      onCloseMobileMenu();
                    }}
                  >
                    <div className="item-icon-box">
                      <Icon size={18} />
                    </div>
                    <div className="item-text-box">
                      <span className="item-title">{tab.fullLabel}</span>
                    </div>
                    {tab.count !== null && (
                      <span className={`drawer-badge ${tab.isDanger ? 'danger' : ''}`}>
                        {tab.count}
                      </span>
                    )}
                    <ChevronRight size={16} className="item-arrow" />
                  </button>
                );
              })}

              {isAuthenticated && (
                <button
                  className="drawer-menu-item"
                  onClick={() => {
                    onCloseMobileMenu();
                    logout();
                  }}
                >
                  <div className="item-icon-box" style={{ color: 'var(--danger)' }}>
                    <LogOut size={18} />
                  </div>
                  <div className="item-text-box">
                    <span className="item-title" style={{ color: 'var(--danger)' }}>Cerrar sesión</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
