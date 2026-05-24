import React from 'react';
import { Wrench, Shield, Zap, Hammer, Key, TreePine, Paintbrush, Star, Navigation, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';


export const LandingPage: React.FC = () => {
  const { setSearchCategory, setCurrentView, profiles } = useApp();

  const handleCategorySelect = (cat: string) => {
    setSearchCategory(cat);
    setCurrentView('mapa');
  };

  // Obtener estadísticas y perfiles reales activos
  const activeProviders = profiles.filter(p => p.role === 'prestador' && p.isActive !== false);
  const providerCount = activeProviders.length;
  const avgRate = providerCount > 0 
    ? Math.round(activeProviders.reduce((sum, p) => sum + p.rate, 0) / providerCount)
    : 125;

  return (
    <div style={{ flex: 1 }}>
      {/* Sección Hero */}
      <section className="hero-section">
        <h1 className="hero-title">Encuentra Expertos Locales en Jalpan de Serra</h1>
        <p className="hero-subtitle">
          La plataforma comunitaria de la Sierra Gorda que conecta directamente a plomeros, electricistas y carpinteros con vecinos que necesitan sus servicios. Sin comisiones ocultas y con geolocalización en tiempo real.
        </p>

        {/* Botón de Acción Directo */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => { setSearchCategory(''); setCurrentView('mapa'); }}
            style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}
            id="hero_btn_explore"
          >
            <Navigation size={20} />
            <span>Explorar el Mapa de Jalpan</span>
          </button>
        </div>
      </section>

      {/* Grid de Categorías de Oficios */}
      <section style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2rem' }}>¿Qué servicio necesitas hoy?</h2>
        
        <div className="categories-grid">
          <div className="glass-card category-card" onClick={() => handleCategorySelect('plomería')} id="cat_card_plomeria">
            <div className="category-icon">
              <Wrench size={28} />
            </div>
            <span className="category-name">Plomería</span>
          </div>

          <div className="glass-card category-card" onClick={() => handleCategorySelect('electricidad')} id="cat_card_electricidad">
            <div className="category-icon">
              <Zap size={28} />
            </div>
            <span className="category-name">Electricidad</span>
          </div>

          <div className="glass-card category-card" onClick={() => handleCategorySelect('carpintería')} id="cat_card_carpinteria">
            <div className="category-icon">
              <Hammer size={28} />
            </div>
            <span className="category-name">Carpintería</span>
          </div>

          <div className="glass-card category-card" onClick={() => handleCategorySelect('cerrajería')} id="cat_card_cerrajeria">
            <div className="category-icon">
              <Key size={28} />
            </div>
            <span className="category-name">Cerrajería</span>
          </div>

          <div className="glass-card category-card" onClick={() => handleCategorySelect('jardinería')} id="cat_card_jardineria">
            <div className="category-icon">
              <TreePine size={28} />
            </div>
            <span className="category-name">Jardinería</span>
          </div>

          <div className="glass-card category-card" onClick={() => handleCategorySelect('pintura')} id="cat_card_pintura">
            <div className="category-icon">
              <Paintbrush size={28} />
            </div>
            <span className="category-name">Pintura</span>
          </div>
        </div>
      </section>



      {/* Sección de Estadísticas Reales de Jalpan */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--bg-dark-card-border)', borderBottom: '1px solid var(--bg-dark-card-border)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--primary-light)', fontFamily: 'var(--font-heading)' }}>
              {providerCount || 0}
            </div>
            <strong style={{ fontSize: '1.1rem', display: 'block', margin: '0.25rem 0' }}>Profesionistas Activos</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Verificados con cobertura en colonias locales</span>
          </div>

          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--secondary-color)', fontFamily: 'var(--font-heading)' }}>
              ${avgRate} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/ hr</span>
            </div>
            <strong style={{ fontSize: '1.1rem', display: 'block', margin: '0.25rem 0' }}>Tarifa Base Promedio</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Calculada en base a ofertas actuales en Jalpan</span>
          </div>

          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-heading)' }}>
              100%
            </div>
            <strong style={{ fontSize: '1.1rem', display: 'block', margin: '0.25rem 0' }}>Directo y Sin Comisiones</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Trato directo entre vecino y profesional</span>
          </div>

          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--accent-color)', fontFamily: 'var(--font-heading)' }}>
              &lt; 3 km
            </div>
            <strong style={{ fontSize: '1.1rem', display: 'block', margin: '0.25rem 0' }}>Proximidad Garantizada</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Filtro de distancia interactivo desde tu barrio</span>
          </div>
        </div>
      </section>

      {/* Sección Por Qué Elegirnos */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2rem' }}>Diseñado para la Sierra Gorda</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} />
            </div>
            <h3>Contratación Segura</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Consulta las calificaciones y opiniones reales de otros vecinos de Jalpan antes de contratar a cualquier profesional. Deja tus reseñas al finalizar el trabajo.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} />
            </div>
            <h3>Sin Intermediarios</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              La plataforma no cobra ninguna comisión ni tarifa extra sobre el precio pactado. Habla, acuerda y realiza los pagos directamente de forma transparente.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--secondary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} />
            </div>
            <h3>Asistente Inteligente</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Usa a nuestro asistente virtual "Jalpi" para hacer consultas instantáneas de lenguaje natural, buscar electricistas baratos, promediar cotizaciones o coordinar agendas de forma conversacional.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
