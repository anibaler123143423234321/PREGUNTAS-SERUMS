import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Star, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search,
  Filter,
  Sparkles, 
  BookOpen, 
  X,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { ACADEMIES_DATA, SERUMS_STRATEGY_TIPS, OFFICIAL_RESOURCES } from '../../data/academiesData';

export function AcademiesRanking() {
  const [filterType, setFilterType] = useState('all'); // 'all', 'serums', 'residentado', 'enam', 'accessible'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademyModal, setSelectedAcademyModal] = useState(null);

  const filteredAcademies = useMemo(() => {
    let list = [...ACADEMIES_DATA];

    // Filter by category
    if (filterType === 'serums') {
      list = list.filter(a => a.serumsFocus >= 9.0).sort((a, b) => b.serumsFocus - a.serumsFocus);
    } else if (filterType === 'residentado') {
      list = list.filter(a => a.residentadoFocus >= 9.0).sort((a, b) => b.residentadoFocus - a.residentadoFocus);
    } else if (filterType === 'enam') {
      list = list.filter(a => a.enamFocus >= 9.0).sort((a, b) => b.enamFocus - a.enamFocus);
    } else if (filterType === 'accessible') {
      list = list.filter(a => a.priceTier === 'Accesible' || a.priceTier === 'Medio');
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.tagline.toLowerCase().includes(term) ||
        a.highlights.some(h => h.toLowerCase().includes(term)) ||
        a.platformType.toLowerCase().includes(term)
      );
    }

    return list;
  }, [filterType, searchTerm]);

  return (
    <div className="academies-dashboard" id="academies-dashboard">
      
      {/* 1. FIGMA HERO HEADER */}
      <div className="academies-hero">
        <div className="academies-hero-tag">
          <Award size={14} />
          <span>GUÍA COMPARATIVA MÉDICA • PERÚ 2026</span>
        </div>
        <h1 className="academies-hero-title">
          Ranking de Academias de Preparación Médica
        </h1>
        <p className="academies-hero-subtitle">
          Evaluación independiente de metodologías, bancos de preguntas comentadas, plataformas digitales y costos para el <strong>Examen Nacional SERUMS (MINSA), Residentado Médico y ENAM</strong>.
        </p>

        {/* Top 4 KPI Metrics */}
        <div className="academies-kpi-grid">
          
          <div className="academies-kpi-card">
            <span className="academies-kpi-label">🏆 Top #1 Ecosistema Global</span>
            <div className="academies-kpi-val">
              <span className="academies-kpi-name" style={{ color: '#c084fc' }}>VillaMedic</span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800 }}>9.7 / 10</span>
            </div>
            <span className="academies-kpi-sub">Fenixtor • App Móvil • Villapepas</span>
          </div>

          <div className="academies-kpi-card">
            <span className="academies-kpi-label">🎯 Top SERUMS MINSA</span>
            <div className="academies-kpi-val">
              <span className="academies-kpi-name" style={{ color: '#38bdf8' }}>Dr. López & VM</span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800 }}>9.7-9.8 / 10</span>
            </div>
            <span className="academies-kpi-sub">Alta afinidad con NTS MINSA</span>
          </div>

          <div className="academies-kpi-card">
            <span className="academies-kpi-label">📖 Top Manuales Clínicos</span>
            <div className="academies-kpi-val">
              <span className="academies-kpi-name" style={{ color: '#34d399' }}>Qx Medic & AMIR</span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800 }}>9.5 / 10</span>
            </div>
            <span className="academies-kpi-sub">Esquemas visuales y síntesis</span>
          </div>

          <div className="academies-kpi-card">
            <span className="academies-kpi-label">💵 Mejor Costo / Beneficio</span>
            <div className="academies-kpi-val">
              <span className="academies-kpi-name" style={{ color: '#fbbf24' }}>Dr. López / MyC</span>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>Desde S/. 500</span>
            </div>
            <span className="academies-kpi-sub">Resolución directa de exámenes</span>
          </div>

        </div>
      </div>

      {/* 2. TOOLBAR (FILTERS & LIVE SEARCH) */}
      <div className="academies-toolbar">
        
        {/* Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.35rem' }}>
            <Filter size={13} /> Filtrar:
          </span>
          {[
            { id: 'all', label: 'Todas (8)' },
            { id: 'serums', label: '🎯 Especial SERUMS MINSA' },
            { id: 'residentado', label: '🏥 Residentado Médico' },
            { id: 'enam', label: '📋 ENAM' },
            { id: 'accessible', label: '💵 Más Accesibles' }
          ].map(f => {
            const isSelected = filterType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: '0.32rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Box */}
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 auto', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por academia, docente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.42rem 0.75rem 0.42rem 2.2rem',
              fontSize: '0.8rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

      </div>

      {/* 3. MASTER COMPARISON TABLE */}
      <div className="academies-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="master-academies-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '240px' }}>Academia & Enfoque</th>
                <th style={{ minWidth: '150px' }}>Rating & SERUMS</th>
                <th style={{ minWidth: '200px' }}>Plataforma & Material</th>
                <th style={{ minWidth: '170px' }}>Diferencial Único</th>
                <th style={{ minWidth: '130px' }}>Inversión</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcademies.map((a, idx) => {
                const rankClass = a.rank === 1 ? 'rank-1' : (a.rank === 2 ? 'rank-2' : (a.rank === 3 ? 'rank-3' : 'rank-other'));
                return (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAcademyModal(a)}
                    style={{ cursor: 'pointer' }}
                  >
                    
                    {/* Rank */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`rank-badge-pill ${rankClass}`}>
                        {a.rank}
                      </span>
                    </td>

                    {/* Name & Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: a.accentGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          flexShrink: 0
                        }}>
                          {a.logoInitials}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{a.name}</strong>
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                              {a.badge}
                            </span>
                          </div>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {a.tagline}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Rating & SERUMS Meter */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{a.rating}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 10</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SERUMS:</span>
                        <div style={{ width: '65px', height: '5px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ width: `${(a.serumsFocus / 10) * 100}%`, height: '100%', background: a.serumsFocus >= 9.5 ? '#10b981' : '#0ea5e9' }} />
                        </div>
                        <strong style={{ fontSize: '0.7rem', color: a.serumsFocus >= 9.5 ? '#10b981' : 'var(--text-secondary)' }}>
                          {a.serumsFocus}
                        </strong>
                      </div>
                    </td>

                    {/* Platform */}
                    <td>
                      <span style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {a.platformType}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {a.materials}
                      </span>
                    </td>

                    {/* Differential Highlights */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {a.highlights.slice(0, 2).map((h, hIdx) => (
                          <span key={hIdx} className="tag-highlight">
                            #{h}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Price Range */}
                    <td>
                      <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-main)' }}>{a.priceRange}</strong>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.08rem 0.4rem',
                        borderRadius: 'var(--radius-xs)',
                        marginTop: '0.15rem',
                        background: a.priceTier === 'Accesible' ? 'rgba(16, 185, 129, 0.12)' : (a.priceTier === 'Medio' ? 'rgba(14, 165, 233, 0.12)' : 'rgba(236, 72, 153, 0.12)'),
                        color: a.priceTier === 'Accesible' ? '#10b981' : (a.priceTier === 'Medio' ? '#0ea5e9' : '#ec4899'),
                        border: `1px solid ${a.priceTier === 'Accesible' ? 'rgba(16, 185, 129, 0.3)' : (a.priceTier === 'Medio' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(236, 72, 153, 0.3)')}`
                      }}>
                        {a.priceTier}
                      </span>
                    </td>

                    {/* View Button */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAcademyModal(a);
                        }}
                        className="action-btn-sm"
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.74rem',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--primary)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Ver Ficha
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DETAIL MODAL (FIGMA DRAWER / DIALOG) */}
      {selectedAcademyModal && (
        <div className="modal-backdrop" onClick={() => setSelectedAcademyModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '680px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.15rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', background: selectedAcademyModal.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '1.1rem' }}>
                  {selectedAcademyModal.logoInitials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{selectedAcademyModal.name}</h2>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                      Rank #{selectedAcademyModal.rank}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                    {selectedAcademyModal.tagline}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAcademyModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scores Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.15rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Especial SERUMS:</span>
                <strong style={{ fontSize: '1rem', color: '#10b981' }}>{selectedAcademyModal.serumsFocus} / 10</strong>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Residentado:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedAcademyModal.residentadoFocus} / 10</strong>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>ENAM:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedAcademyModal.enamFocus} / 10</strong>
              </div>
            </div>

            {/* Key Features */}
            <div style={{ marginBottom: '1.15rem' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-secondary)' }}>
                Metodología & Plataforma:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedAcademyModal.keyFeatures.map((kf, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{kf}</li>
                ))}
              </ul>
            </div>

            {/* Pros & Cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                <strong style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={14} /> Puntos Fuertes (Pros):
                </strong>
                <ul style={{ margin: 0, paddingLeft: '0.9rem', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {selectedAcademyModal.pros.map((p, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{p}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                <strong style={{ fontSize: '0.78rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                  <XCircle size={14} /> A Considerar:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '0.9rem', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {selectedAcademyModal.cons.map((c, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Rango de Precio Estimado:</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{selectedAcademyModal.priceRange}</strong>
              </div>
              <a
                href={selectedAcademyModal.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <span>Visitar Web Oficial</span>
                <ExternalLink size={14} />
              </a>
            </div>

          </div>
        </div>
      )}

      {/* 5. STRATEGY GUIDE & OFFICIAL MINSA RESOURCES */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.35rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={20} color="#f59e0b" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Estrategia de Preparación para el SERUMS 2026-II
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {SERUMS_STRATEGY_TIPS.map((tip, tIdx) => (
            <div key={tIdx} style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
                {tip.title}
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {tip.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Official Free MINSA Resources */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)' }}>
            <BookOpen size={15} color="var(--primary)" />
            <span>Recursos Oficiales y Gratuitos del MINSA para Descargar:</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
            {OFFICIAL_RESOURCES.map((res, rIdx) => (
              <a
                key={rIdx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  background: 'var(--bg-surface)',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>{res.name}</strong>
                  <ExternalLink size={13} color="var(--text-muted)" />
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                  {res.desc}
                </p>
              </a>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default AcademiesRanking;
