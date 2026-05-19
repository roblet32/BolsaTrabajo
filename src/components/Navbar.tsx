import React from 'react';
import { Briefcase, Map, Calendar, MessageSquare, Home, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, role, setUserRole, user } = useApp();

  return (
    <header className="app-header">
      <div className="brand" onClick={() => setCurrentView('inicio')} id="logo_brand_nav">
        <div className="brand-logo">
          <Briefcase size={22} />
        </div>
        <span className="brand-name">JalpanTrabajo</span>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${currentView === 'inicio' ? 'active' : ''}`}
          onClick={() => setCurrentView('inicio')}
          id="nav_btn_inicio"
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>
        
        <button
          className={`nav-item ${currentView === 'mapa' ? 'active' : ''}`}
          onClick={() => setCurrentView('mapa')}
          id="nav_btn_mapa"
        >
          <Map size={18} />
          <span>{role === 'cliente' ? 'Buscar Servicios' : 'Mi Ubicación'}</span>
        </button>

        <button
          className={`nav-item ${currentView === 'citas' ? 'active' : ''}`}
          onClick={() => setCurrentView('citas')}
          id="nav_btn_citas"
        >
          <Calendar size={18} />
          <span>Citas</span>
        </button>

        <button
          className={`nav-item ${currentView === 'chats' ? 'active' : ''}`}
          onClick={() => setCurrentView('chats')}
          id="nav_btn_chats"
        >
          <MessageSquare size={18} />
          <span>Mensajes</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Indicador de Usuario Activo */}
        {user && (
          <div style={{ textAlign: 'right', display: 'none' }} className="d-md-block">
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {user.role === 'prestador' ? 'Prestador' : 'Cliente'}
            </div>
          </div>
        )}

        {/* Switcher de Roles para Demostración */}
        <div className="role-switcher-container">
          <button
            className={`role-btn ${role === 'cliente' ? 'active-client' : ''}`}
            onClick={() => setUserRole('cliente')}
            title="Cambiar a rol de Cliente"
            id="role_switch_cliente"
          >
            Cliente
          </button>
          <button
            className={`role-btn ${role === 'prestador' ? 'active-provider' : ''}`}
            onClick={() => setUserRole('prestador')}
            title="Cambiar a rol de Prestador"
            id="role_switch_prestador"
          >
            Prestador
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
