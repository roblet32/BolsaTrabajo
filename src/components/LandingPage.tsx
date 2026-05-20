import React from 'react';
import { Wrench, Shield, Zap, Hammer, Key, TreePine, Paintbrush, Star, Navigation, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Configuración de iconos personalizados de color
const plumberIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const electricianIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const carpenterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultProviderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const getProviderIcon = (categories: string[]) => {
  if (categories.includes('plomería')) return plumberIcon;
  if (categories.includes('electricidad')) return electricianIcon;
  if (categories.includes('carpintería')) return carpenterIcon;
  return defaultProviderIcon;
};

export const LandingPage: React.FC = () => {
  const { setSearchCategory, setCurrentView, profiles, user, setActiveContact, theme } = useApp();

  const handleCategorySelect = (cat: string) => {
    setSearchCategory(cat);
    setCurrentView('mapa');
  };

  const handleQuickChat = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setActiveContact(p);
    setCurrentView('chats');
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

      {/* Mapa de Proveedores Activos */}
      <section style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Explora el Directorio en Tiempo Real</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', fontSize: '0.95rem' }}>
          Encuentra a los proveedores autorizados más cercanos a ti en Jalpan de Serra. ¡Trato directo, confiable y 100% real sin intermediarios!
        </p>

        <div className="glass-card" style={{ padding: '1rem', height: '480px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }} id="landing_map_container">
          <MapContainer
            center={[21.2185, -99.4735]}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '16px' }}
          >
            {(() => {
              const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
              if (mapboxToken) {
                const styleId = theme === 'light' ? 'light-v11' : 'dark-v11';
                return (
                  <TileLayer
                    attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                    url={`https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
                  />
                );
              } else {
                const cartoStyle = theme === 'light' ? 'voyager' : 'dark_all';
                return (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={`https://{s}.basemaps.cartocdn.com/rastertiles/${cartoStyle}/{z}/{x}/{y}{r}.png`}
                  />
                );
              }
            })()}

            {activeProviders.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={getProviderIcon(p.categories)}
              >
                <Popup>
                  <div style={{ minWidth: '180px', color: 'var(--text-dark-primary)', padding: '0.2rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>
                      {p.name}
                    </h4>
                    <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#14b8a6', fontWeight: '700', marginBottom: '0.25rem' }}>
                      {p.categories.join(', ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0', fontSize: '0.8rem' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {p.rating}</span>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>${p.rate}/hr</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      📍 Jalpan de Serra
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSearchCategory(p.categories[0] || '');
                          setCurrentView('mapa');
                        }}
                        style={{
                          flex: 1,
                          background: '#0f766e',
                          border: 'none',
                          color: 'white',
                          padding: '0.35rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Ver en Buscador
                      </button>
                      <button
                        onClick={(e) => handleQuickChat(p, e)}
                        style={{
                          flex: 1,
                          background: '#4f46e5',
                          border: 'none',
                          color: 'white',
                          padding: '0.35rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Chatear
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
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
