import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Shield, ArrowRight, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthView: React.FC<{ onAuthSuccess?: () => void }> = ({ onAuthSuccess }) => {
  const { signIn, signUp, setCurrentView } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'cliente' | 'prestador'>('cliente');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        setSuccess(true);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          setCurrentView('inicio');
        }, 800);
      } else {
        if (!name.trim()) throw new Error('El nombre es obligatorio.');
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        
        await signUp(email, password, name, role, phone);
        setSuccess(true);
        setIsLogin(true);
        setError('');
        // Limpiar contraseña
        setPassword('');
        alert('¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(20, 184, 166, 0.08) 0%, transparent 60%)',
      flex: 1
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        border: '1px solid rgba(20, 184, 166, 0.2)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Cabecera */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo" style={{ margin: '0 auto 1rem auto', width: '50px', height: '50px' }}>
            <Briefcase size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'white', marginBottom: '0.5rem' }}>
            {isLogin ? '¡Bienvenido de Nuevo!' : 'Crea tu Cuenta'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {isLogin 
              ? 'Inicia sesión para chatear, agendar citas y contratar servicios locales.' 
              : 'Regístrate hoy mismo y conéctate con profesionales en Jalpan.'}
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {isLogin ? '¡Sesión Iniciada con éxito! Redirigiendo...' : '¡Registro Exitoso! Redirigiendo a Login...'}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Campo Nombre (Solo registro) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1' }}>Nombre Completo</label>
              <div className="search-input-group" style={{ margin: 0 }}>
                <User size={18} />
                <input
                  type="text"
                  placeholder="Ej. Juan Gómez Pérez"
                  className="search-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Campo Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1' }}>Correo Electrónico</label>
            <div className="search-input-group" style={{ margin: 0 }}>
              <Mail size={18} />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className="search-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo Teléfono (Solo registro) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1' }}>Teléfono (10 dígitos)</label>
              <div className="search-input-group" style={{ margin: 0 }}>
                <Phone size={18} />
                <input
                  type="tel"
                  placeholder="Ej. 4411059988"
                  className="search-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Campo Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1' }}>Contraseña</label>
            <div className="search-input-group" style={{ margin: 0 }}>
              <Lock size={18} />
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="search-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Selector de Rol (Solo registro) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1' }}>¿Cómo usarás la plataforma?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('cliente')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: role === 'cliente' ? '2px solid var(--accent-color)' : '1px solid var(--bg-dark-card-border)',
                    background: role === 'cliente' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole('prestador')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: role === 'prestador' ? '2px solid var(--primary-light)' : '1px solid var(--bg-dark-card-border)',
                    background: role === 'prestador' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Prestador
                </button>
              </div>
            </div>
          )}

          {/* Botón Enviar */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem' }}
          >
            {loading 
              ? 'Procesando...' 
              : isLogin 
                ? <>Ingresar <ArrowRight size={16} /></> 
                : <>Registrarse <Shield size={16} /></>}
          </button>
        </form>

        {/* Cambiar entre Login y Sign Up */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '1.25rem',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          {isLogin ? (
            <>
              ¿No tienes una cuenta?{' '}
              <button
                onClick={() => setIsLogin(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setIsLogin(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Inicia Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthView;
