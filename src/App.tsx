import React, { useState, useEffect } from 'react';
import { useApp, AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ServiceMap from './components/ServiceMap';
import ProfileDetail from './components/ProfileDetail';
import ProviderDashboard from './components/ProviderDashboard';
import AppointmentList from './components/AppointmentList';
import ChatPanel from './components/ChatPanel';
import Chatbot from './components/Chatbot';
import AuthView from './components/AuthView';
import { Search, MapPin, Star, Phone, MessageSquare, Shield, HelpCircle } from 'lucide-react';
import { Profile, getDistanceKm } from './services/db';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    role,
    profiles,
    searchCategory,
    setSearchCategory,
    searchDistance,
    setSearchDistance,
    clientLocation
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<Profile | null>(null);

  // Limpiar el perfil seleccionado al cambiar de pestaña o de rol
  useEffect(() => {
    setSelectedDetailProfile(null);
  }, [currentView, role]);

  // Filtrar prestadores según categoría, texto y distancia del cliente
  const filteredProfiles = profiles.filter((p) => {
    if (p.role !== 'prestador') return false;

    // Filtro por Categoría
    if (searchCategory && !p.categories.some((cat) => cat.toLowerCase() === searchCategory.toLowerCase())) {
      return false;
    }

    // Filtro por Texto (Nombre o Biografía o Categoría)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchCat = p.categories.some(cat => cat.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchCat) return false;
    }

    // Filtro por Geolocalización y Distancia Máxima
    const distance = getDistanceKm(
      clientLocation.lat,
      clientLocation.lng,
      p.lat,
      p.lng
    );
    if (distance > searchDistance) {
      return false;
    }

    return true;
  });

  // Renderizar la vista principal según el estado
  const renderView = () => {
    switch (currentView) {
      case 'inicio':
        return <LandingPage />;
      
      case 'mapa':
        if (role === 'prestador') {
          return <ProviderDashboard />;
        }
        
        // Vista de Cliente
        if (selectedDetailProfile) {
          return (
            <ProfileDetail
              profile={selectedDetailProfile}
              onBack={() => setSelectedDetailProfile(null)}
            />
          );
        }

        return (
          <div className="dashboard-layout" style={{ flex: 1 }}>
            {/* Mapa Izquierdo */}
            <ServiceMap
              filteredProfiles={filteredProfiles}
              onSelectProfile={setSelectedDetailProfile}
            />

            {/* Listado y Filtros Derechos */}
            <div className="providers-panel">
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Filtros de Búsqueda</h3>
                
                {/* Búsqueda por Texto */}
                <div className="search-input-group" style={{ margin: 0 }}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre u oficio..."
                    className="search-field"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="search_text_input"
                  />
                </div>

                {/* Filtro por Especialidad y Distancia */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <select
                    className="filter-select"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    id="select_category_filter"
                  >
                    <option value="">Todos los oficios</option>
                    <option value="plomería">Plomería</option>
                    <option value="electricidad">Electricidad</option>
                    <option value="carpintería">Carpintería</option>
                    <option value="cerrajería">Cerrajería</option>
                    <option value="jardinería">Jardinería</option>
                    <option value="pintura">Pintura</option>
                  </select>

                  <select
                    className="filter-select"
                    value={searchDistance}
                    onChange={(e) => setSearchDistance(Number(e.target.value))}
                    id="select_distance_filter"
                  >
                    <option value="1">A menos de 1 km</option>
                    <option value="2">A menos de 2 km</option>
                    <option value="5">A menos de 5 km</option>
                    <option value="10">A menos de 10 km</option>
                    <option value="20">A menos de 20 km</option>
                  </select>
                </div>
              </div>

              {/* Encabezado del Listado */}
              <div className="panel-header" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Encontrados: <strong>{filteredProfiles.length}</strong> profesional(es)
                </span>
              </div>

              {/* Listado de Tarjetas */}
              {filteredProfiles.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  <HelpCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                  <h4>No se encontraron prestadores</h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Intenta ampliando el radio de búsqueda o cambiando los filtros.</p>
                </div>
              ) : (
                filteredProfiles.map((p) => {
                  const dist = getDistanceKm(clientLocation.lat, clientLocation.lng, p.lat, p.lng);
                  return (
                    <div key={p.id} className="glass-card provider-card">
                      <div className="provider-card-header">
                        <div className="provider-info-block">
                          <h3>{p.name}</h3>
                          <div className="provider-badge-list">
                            {p.categories.map((cat) => (
                              <span key={cat} className="badge badge-primary">
                                {cat}
                              </span>
                            ))}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <div className="rating-stars">
                              <Star size={14} fill="currentColor" />
                              <strong style={{ fontSize: '0.85rem' }}>{p.rating}</strong>
                              <span>({p.reviewsCount})</span>
                            </div>
                            
                            <div className="provider-distance">
                              <MapPin size={12} />
                              <span>A {dist} km</span>
                            </div>
                          </div>
                        </div>

                        <div className="provider-rate">
                          ${p.rate}<span>/hr</span>
                        </div>
                      </div>

                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.bio}
                      </p>

                      <div className="provider-card-footer">
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                          onClick={() => setSelectedDetailProfile(p)}
                          id={`btn_view_profile_${p.id}`}
                        >
                          Ver Perfil Completo
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      
      case 'citas':
        return <AppointmentList />;

      case 'chats':
        return <ChatPanel />;

      case 'auth':
        return <AuthView />;

      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="app-container">
      {/* Header / Barra de Navegación */}
      <Navbar />

      {/* Cuerpo Principal */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </main>

      {/* Asistente Chatbot Flotante */}
      <Chatbot />

      {/* Pie de Página */}
      <footer className="app-footer">
        <p>© 2026 Bolsa de Trabajo Jalpan • Creado con orgullo en Jalpan de Serra, Qro. • Trato Local, Directo y Seguro</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export default App;
