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
import AdminDashboard from './components/AdminDashboard';
import { Search, MapPin, Star, HelpCircle } from 'lucide-react';
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
    clientLocation,
    user,
    adminNotification,
    setAdminNotification,
    chatEmailNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<Profile | null>(null);

  // Estados responsivos y de notificación premium
  const [searchViewMode, setSearchViewMode] = useState<'list' | 'map'>('list');
  const [showMailSimulator, setShowMailSimulator] = useState(false);
  const [showChatToast, setShowChatToast] = useState(false);

  // Autodescartar Toast de Correo después de 8 segundos
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (chatEmailNotification && chatEmailNotification.show) {
      setShowChatToast(true);
      const timer = setTimeout(() => {
        setShowChatToast(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [chatEmailNotification]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Limpiar el perfil seleccionado al cambiar de pestaña o de rol
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSelectedDetailProfile(null);
  }, [currentView, role]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Filtrar prestadores según categoría, texto y distancia del cliente
  const filteredProfiles = profiles.filter((p) => {
    if (p.role !== 'prestador') return false;
    if (p.isActive === false) return false; // Ocultar prestadores suspendidos o inactivos

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

    // Filtro por Geolocalización y Distancia Máxima con validaciones robustas
    const cLat = typeof clientLocation?.lat === 'number' && !isNaN(clientLocation.lat) ? clientLocation.lat : 21.2185;
    const cLng = typeof clientLocation?.lng === 'number' && !isNaN(clientLocation.lng) ? clientLocation.lng : -99.4735;
    const pLat = typeof p.lat === 'number' && !isNaN(p.lat) ? p.lat : null;
    const pLng = typeof p.lng === 'number' && !isNaN(p.lng) ? p.lng : null;

    if (pLat === null || pLng === null) return false;

    const distance = getDistanceKm(
      cLat,
      cLng,
      pLat,
      pLng
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
        // Vista de Cliente o buscador general
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
            <div className="map-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ServiceMap
                filteredProfiles={filteredProfiles}
                onSelectProfile={setSelectedDetailProfile}
              />
            </div>

            {/* Listado y Filtros Derechos */}
            <div className="providers-panel">
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark-primary)' }}>Filtros de Búsqueda</h3>
                
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

      case 'proveedor':
        return <ProviderDashboard />;

      case 'chats':
        return <ChatPanel />;

      case 'auth':
        return <AuthView />;

      case 'admin':
        if (!user || (
          user.role !== 'admin' && 
          user.email?.toLowerCase() !== 'josemanuelvillaguillon@gmail.com' &&
          localStorage.getItem('b_is_super_admin') !== 'true'
        )) {
          return <LandingPage />;
        }
        return <AdminDashboard />;

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
        {user && user.isActive === false && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#fbbf24',
            padding: '1rem 1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 90
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>
              <strong>Cuenta Pendiente de Autorización:</strong> Tu cuenta (perfil de {user.role === 'prestador' ? 'Proveedor' : 'Cliente'}) está siendo revisada por el Administrador. Tu perfil no será público ni visible en mapas o búsquedas hasta que sea autorizado.
            </span>
          </div>
        )}
        {renderView()}
      </main>

      {/* Modal de Simulación de Envío de Correo */}
      {adminNotification && adminNotification.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '550px',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header del Correo */}
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              padding: '1.25rem 1.5rem',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📧 Notificación de Correo Enviada</span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                Bolsa de Trabajo Jalpan • Sistema de Autorizaciones
              </p>
            </div>

            {/* Campos del Correo */}
            <div style={{
              padding: '1.5rem',
              background: 'var(--bg-dark-card, #111827)',
              color: 'var(--text-dark-primary, #f3f4f6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-dark-secondary, #9ca3af)' }}>Para:</strong>
                <span style={{ color: 'var(--primary-light, #2dd4bf)', fontWeight: 'bold' }}>{adminNotification.to}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-dark-secondary, #9ca3af)' }}>Asunto:</strong>
                <span style={{ fontWeight: '600' }}>{adminNotification.subject}</span>
              </div>
              
              {/* Cuerpo del Correo */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1.25rem',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto',
                color: '#e5e7eb',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {adminNotification.body}
              </div>
            </div>

            {/* Footer / Acciones */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'left',
                lineHeight: '1.4',
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                borderLeft: '3px solid #0d9488'
              }}>
                💡 <strong>Desarrollo:</strong> El botón <em>"Enviar por Correo Real"</em> intenta abrir la app de correo de tu PC (mailto:). Para enviar estos correos <strong>100% automático en segundo plano</strong> (sin ventanas emergentes), puedes configurar EmailJS en tu archivo <code>.env</code>.
              </div>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'end'
              }}>
              {/* Botón Mailto Real */}
              <a
                href={`mailto:${adminNotification.to}?subject=${encodeURIComponent(adminNotification.subject)}&body=${encodeURIComponent(adminNotification.body)}`}
                style={{
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'var(--transition-fast)'
                }}
                onClick={() => setAdminNotification(null)}
              >
                <span>Enviar por Correo Real</span>
              </a>

              {/* Botón Entendido */}
              <button
                className="btn-secondary"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px'
                }}
                onClick={() => setAdminNotification(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Toast de Notificación de Correo (Mensajes de Chat) */}
      {chatEmailNotification && chatEmailNotification.show && showChatToast && (
        <div className="chat-email-toast">
          <div className="chat-email-toast-header">
            <div className="chat-email-toast-title">
              <span className="email-ping-icon">📧</span>
              <span>Notificación de correo enviada</span>
            </div>
            <button
              className="chat-email-toast-close"
              onClick={() => setShowChatToast(false)}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="chat-email-toast-body">
            Se ha notificado a <strong>{chatEmailNotification.recipientName}</strong> ({chatEmailNotification.to}) sobre tu mensaje en el chat.
          </div>
          <div className="chat-email-toast-actions">
            <button
              className="chat-email-toast-btn-sim"
              onClick={() => {
                setShowChatToast(false);
                setShowMailSimulator(true);
              }}
            >
              Ver Simulación
            </button>
            <a
              className="chat-email-toast-btn-real"
              href={`mailto:${chatEmailNotification.to}?subject=${encodeURIComponent(chatEmailNotification.subject)}&body=${encodeURIComponent(chatEmailNotification.body)}`}
              onClick={() => setShowChatToast(false)}
            >
              Enviar Correo Real
            </a>
          </div>
        </div>
      )}

      {/* Visor de Correo Simulado */}
      {chatEmailNotification && chatEmailNotification.show && showMailSimulator && (
        <div className="mail-simulator-backdrop">
          <div className="mail-simulator-container">
            {/* Barra superior estilo MacOS */}
            <div className="mail-simulator-header-bar">
              <div className="mail-simulator-dots">
                <span className="mail-simulator-dot red" onClick={() => setShowMailSimulator(false)} style={{ cursor: 'pointer' }}></span>
                <span className="mail-simulator-dot yellow" onClick={() => setShowMailSimulator(false)} style={{ cursor: 'pointer' }}></span>
                <span className="mail-simulator-dot green" onClick={() => setShowMailSimulator(false)} style={{ cursor: 'pointer' }}></span>
              </div>
              <div className="mail-simulator-header-title">Bandeja de Entrada Simulada</div>
            </div>

            {/* Meta información */}
            <div className="mail-simulator-client-meta">
              <div className="mail-simulator-meta-row">
                <span className="mail-simulator-meta-label">De:</span>
                <span className="mail-simulator-meta-val">JalpanTrabajo Notificaciones &lt;no-reply@jalpantrabajo.com&gt;</span>
              </div>
              <div className="mail-simulator-meta-row">
                <span className="mail-simulator-meta-label">Para:</span>
                <span className="mail-simulator-meta-val email-highlight">{chatEmailNotification.recipientName} &lt;{chatEmailNotification.to}&gt;</span>
              </div>
              <div className="mail-simulator-meta-row">
                <span className="mail-simulator-meta-label">Asunto:</span>
                <span className="mail-simulator-meta-val subject-highlight">{chatEmailNotification.subject}</span>
              </div>
            </div>

            {/* Cuerpo del Mensaje */}
            <div className="mail-simulator-body">
              {chatEmailNotification.body}
            </div>

            {/* Acciones */}
            <div className="mail-simulator-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowMailSimulator(false)}
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', borderRadius: '6px' }}
              >
                Cerrar Simulación
              </button>
              <a
                className="chat-email-toast-btn-real"
                href={`mailto:${chatEmailNotification.to}?subject=${encodeURIComponent(chatEmailNotification.subject)}&body=${encodeURIComponent(chatEmailNotification.body)}`}
                onClick={() => setShowMailSimulator(false)}
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex' }}
              >
                Enviar Correo Real
              </a>
            </div>
          </div>
        </div>
      )}

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
