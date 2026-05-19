import React from 'react';
import { Briefcase, Map, Calendar, MessageSquare, Home, LogIn, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, role, setUserRole, user, signOut } = useApp();

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

        {/* Citas y Mensajes solo accesibles si está logueado en modo real */}
        <button
          className={`nav-item ${currentView === 'citas' ? 'active' : ''}`}
          onClick={() => {
            if (!user && isSupabaseConfigured) {
              setCurrentView('auth');
            } else {
              setCurrentView('citas');
            }
          }}
          id="nav_btn_citas"
        >
          <Calendar size={18} />
          <span>Citas</span>
        </button>

        <button
          className={`nav-item ${currentView === 'chats' ? 'active' : ''}`}
          onClick={() => {
            if (!user && isSupabaseConfigured) {
              setCurrentView('auth');
            } else {
              setCurrentView('chats');
            }
          }}
          id="nav_btn_chats"
        >
          <MessageSquare size={18} />
          <span>Mensajes</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Indicador de Usuario Activo en pantalla grande */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: 'none' }} className="d-md-block">
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {user.role === 'prestador' ? 'Prestador' : 'Cliente'}
              </div>
            </div>

            {/* Switcher de Roles (para pruebas rápidas en local o cambiar tu perfil de prestador/cliente) */}
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

            {/* Botón Salir */}
            <button
              className="btn-secondary"
              onClick={signOut}
              title="Cerrar Sesión"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              id="nav_btn_logout"
            >
              <LogOut size={16} />
              <span className="d-none d-md-inline">Salir</span>
            </button>
          </div>
        ) : (
          /* Botón Ingresar para Invitados */
          <button
            className="btn-primary"
            onClick={() => setCurrentView('auth')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            id="nav_btn_login"
          >
            <LogIn size={16} />
            <span>Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
