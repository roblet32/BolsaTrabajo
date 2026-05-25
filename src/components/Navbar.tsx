import { Briefcase, Map, Calendar, MessageSquare, Home, LogIn, LogOut, Sun, Moon, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, role, setUserRole, user, signOut, theme, toggleTheme } = useApp();

  return (
    <header className="app-header">
      <div className="brand" onClick={() => setCurrentView('inicio')} id="logo_brand_nav">
        <div className="brand-logo">
          <Briefcase size={22} />
        </div>
        <span className="brand-name">Trabajalpan</span>
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

        {/* Buscar Servicios (Siempre visible) */}
        <button
          className={`nav-item ${currentView === 'mapa' ? 'active' : ''}`}
          onClick={() => setCurrentView('mapa')}
          id="nav_btn_mapa"
        >
          <Map size={18} />
          <span>Buscar Servicios</span>
        </button>

        {/* Mi Panel de Proveedor (Visible para prestadores o administradores) */}
        {role !== 'cliente' && (
          <button
            className={`nav-item ${currentView === 'proveedor' ? 'active' : ''}`}
            onClick={() => setCurrentView('proveedor')}
            id="nav_btn_proveedor"
          >
            <Briefcase size={18} />
            <span>Mi Panel de Proveedor</span>
          </button>
        )}

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

        {/* Pestaña de Administración visible si el usuario es Admin real */}
        {user && (
          user.role === 'admin' ||
          user.email?.toLowerCase() === 'josemanuelvillaguillon@gmail.com' ||
          localStorage.getItem('b_is_super_admin') === 'true'
        ) && (
            <button
              className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
              id="nav_btn_admin"
            >
              <Shield size={18} />
              <span>Administración</span>
            </button>
          )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

        {/* Botón de Alternancia de Tema (Modo Claro/Modo Noche) */}
        <button
          onClick={toggleTheme}
          className="btn-theme-toggle"
          title={theme === 'light' ? 'Cambiar a Modo Noche' : 'Cambiar a Modo Claro'}
          id="nav_btn_theme_toggle"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--bg-dark-card-border)',
            color: 'var(--text-dark-primary)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            outline: 'none',
            padding: 0
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Indicador de Usuario Activo en pantalla grande */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }} className="d-none d-md-block">
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {role === 'admin' ? 'Administrador' : role === 'prestador' ? 'Proveedor' : 'Cliente'}
              </div>
            </div>

            {/* Switcher de Roles (Solo visible en desarrollo local o para el superadministrador en producción) */}
            {user && (
              (!isSupabaseConfigured) ||
              (user.email?.toLowerCase() === 'josemanuelvillaguillon@gmail.com')
            ) && (
                <div className="role-switcher-container">
                  <button
                    className={`role-btn ${role === 'cliente' ? 'active-client' : ''}`}
                    onClick={() => setUserRole('cliente')}
                    title="Cambiar a vista de Cliente"
                    id="role_switch_cliente"
                  >
                    Cliente
                  </button>
                  <button
                    className={`role-btn ${role === 'prestador' ? 'active-provider' : ''}`}
                    onClick={() => setUserRole('prestador')}
                    title="Cambiar a vista de Proveedor"
                    id="role_switch_prestador"
                  >
                    Proveedor
                  </button>
                  <button
                    className={`role-btn ${role === 'admin' ? 'active-admin' : ''}`}
                    onClick={() => setUserRole('admin')}
                    title="Cambiar a vista de Administrador"
                    id="role_switch_admin"
                  >
                    Admin
                  </button>
                </div>
              )}

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
