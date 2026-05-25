import { Wrench, Shield, Zap, Hammer, Key, TreePine, Paintbrush, Star, Navigation, CheckCircle, MessageSquare, Briefcase } from 'lucide-react';
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
    <div style={{ flex: 1, overflowX: 'hidden', position: 'relative' }}>
      
      {/* Halos y luces de fondo ambientales para diseño de alta gama */}
      <div className="ambient-halo-1"></div>
      <div className="ambient-halo-2"></div>

      {/* 1. Sección Hero de Entrada - Rediseño Simétrico Premium */}
      <section style={{
        maxWidth: '1000px',
        margin: '3.5rem auto 4rem auto',
        padding: '0 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        
        {/* Badge de Bienvenida - Centrado */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(20, 184, 166, 0.08)',
          border: '1px solid rgba(20, 184, 166, 0.25)',
          padding: '0.5rem 1.25rem',
          borderRadius: '9999px',
          color: 'var(--primary-light)',
          fontSize: '0.88rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(20, 184, 166, 0.05)'
        }}>
          <span>👋 Bienvenidos a tu Bolsa de Trabajo Local</span>
        </div>

        {/* Título Principal - Centrado y Súper Nítido */}
        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: '850',
          lineHeight: '1.15',
          letterSpacing: '-0.02em',
          color: 'var(--text-dark-primary)',
          marginBottom: '1.5rem',
          background: 'var(--text-hero-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          maxWidth: '850px'
        }} className="hero-title-responsive">
          Encuentra Expertos de Confianza en tu Colonia
        </h1>

        {/* Subtítulo Descriptivo - Centrado */}
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.15rem',
          lineHeight: '1.7',
          marginBottom: '2.5rem',
          maxWidth: '750px'
        }}>
          La plataforma comunitaria de la Sierra Gorda que conecta directamente a plomeros, electricistas, carpinteros y más con vecinos del pueblo. ¡Trato local, directo y sin pagar comisiones!
        </p>

        {/* Botones de Acción - Distribución Simétrica */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '560px',
          marginBottom: '4rem'
        }}>
          <button 
            className="btn-primary" 
            onClick={() => { setSearchCategory(''); setCurrentView('mapa'); }}
            style={{ 
              fontSize: '1.05rem', 
              padding: '1rem 2rem',
              boxShadow: '0 6px 20px rgba(20, 184, 166, 0.3)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '14px',
              justifyContent: 'center',
              flex: '1',
              minWidth: '240px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            id="hero_btn_explore"
          >
            <Navigation size={18} />
            <span>Ver Mapa de Profesionales</span>
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={() => { setCurrentView('proveedor'); }}
            style={{ 
              fontSize: '1.05rem', 
              padding: '1rem 2rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '14px',
              justifyContent: 'center',
              flex: '1',
              minWidth: '240px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            id="hero_btn_join_as_provider"
          >
            <Briefcase size={18} />
            <span>Ofrecer mis Servicios</span>
          </button>
        </div>

        {/* Foto Symmetrical de Jalpan de Serra - Banner Cinematic de Alta Definición */}
        <div style={{
          position: 'relative',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--bg-dark-card-border)',
          height: '460px',
          width: '100%',
          maxWidth: '1000px',
          transition: 'all 0.4s ease'
        }} className="hero-banner-card">
          <img 
            src="/jalpan_landscape.png" 
            alt="Misión Franciscana de Jalpan de Serra Querétaro" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Overlay Degradado Premium para la Imagen */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.1) 60%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '2.5rem 2rem',
            textAlign: 'center'
          }}>
            <span style={{ 
              color: '#ffffff', 
              fontWeight: '800', 
              fontSize: '1.75rem', 
              fontFamily: 'var(--font-heading)', 
              textShadow: '0 2px 10px rgba(0,0,0,0.85)',
              letterSpacing: '-0.01em'
            }}>
              Misión de Santiago de Jalpan
            </span>
            <span style={{ 
              color: 'var(--primary-light)', 
              fontSize: '0.95rem', 
              fontWeight: '700', 
              marginTop: '0.5rem', 
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Patrimonio de la Humanidad • Sierra Gorda Querétaro
            </span>
          </div>
        </div>

      </section>

      {/* 2. Grid de Categorías de Oficios - Con Brillo de Color y Muy Amigable */}
      <section style={{ padding: '2rem 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark-primary)' }}>
          ¿Qué servicio necesitas hoy en casa?
        </h2>
        
        <div className="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Plomería */}
          <div 
            className="glass-card category-card" 
            onClick={() => handleCategorySelect('plomería')} 
            id="cat_card_plomeria"
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(56, 189, 248, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.1)' }}>
              <Wrench size={26} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-dark-primary)', display: 'block' }}>Plomería</span>
          </div>

          {/* Electricidad */}
          <div 
            className="glass-card category-card" 
            onClick={() => handleCategorySelect('electricidad')} 
            id="cat_card_electricidad"
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(251, 191, 36, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.1)' }}>
              <Zap size={26} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-dark-primary)', display: 'block' }}>Electricidad</span>
          </div>

          {/* Carpintería */}
          <div 
            className="glass-card category-card" 
            onClick={() => handleCategorySelect('carpintería')} 
            id="cat_card_carpinteria"
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(249, 115, 22, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.1)' }}>
              <Hammer size={26} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-dark-primary)', display: 'block' }}>Carpintería</span>
          </div>

          {/* Cerrajería */}
          <div 
            className="glass-card category-card" 
            onClick={() => handleCategorySelect('cerrajería')} 
            id="cat_card_cerrajeria"
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(168, 85, 247, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.1)' }}>
              <Key size={26} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-dark-primary)', display: 'block' }}>Cerrajería</span>
          </div>

          {/* Jardinería */}
          <div 
            className="glass-card category-card" 
            onClick={() => handleCategorySelect('jardinería')} 
            id="cat_card_jardineria"
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(16, 185, 129, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>
              <TreePine size={26} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-dark-primary)', display: 'block' }}>Jardinería</span>
          </div>

          {/* Pintura */}
          <div 
            className="glass-card category-card" 
            onClick={() => handleCategorySelect('pintura')} 
            id="cat_card_pintura"
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(236, 72, 153, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.1)' }}>
              <Paintbrush size={26} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-dark-primary)', display: 'block' }}>Pintura</span>
          </div>
        </div>
      </section>

      {/* 2.5 Sección de Propósito y Motivo - Informativo y Comunitario */}
      <section style={{
        padding: '2rem 2rem 4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div className="glass-card" style={{
          padding: '2.5rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.02) 0%, rgba(79, 70, 229, 0.02) 100%)',
          border: '1px solid var(--bg-dark-card-border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark-primary)', marginBottom: '0.5rem' }}>
              El Corazón del Proyecto: Propósito y Motivo
            </h2>
            <p style={{ color: 'var(--primary-light)', fontWeight: 'bold', fontSize: '0.95rem' }}>
              Uniendo a Jalpan de Serra bajo un trato justo, directo y solidario.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }} className="d-flex-column-mobile">
            {/* Propósito */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                🎯 Nuestro Propósito
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', textAlign: 'justify' }}>
                <strong>JalpanTrabajo</strong> nació como una iniciativa tecnológica y social diseñada para empoderar a los trabajadores locales, técnicos y prestadores de oficios de Jalpan de Serra y Querétaro. Nuestro propósito es proveer una vitrina digital moderna y completamente gratuita, donde los profesionales de la Sierra Gorda puedan geolocalizarse, exhibir fotos reales de sus trabajos y conectar al instante con vecinos que requieren de su experiencia para solucionar problemas del hogar.
              </p>
            </div>

            {/* Motivo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                🤝 El Motivo Comunitario
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', textAlign: 'justify' }}>
                Creemos firmemente en una economía local fuerte y solidaria. El motivo fundamental que nos impulsa es <strong>eliminar las comisiones y los intermediarios abusivos</strong> que reducen los ingresos de nuestras familias. Al facilitar un canal de comunicación directo y transparente a través del chat integrado y llamadas directas, garantizamos que el <strong>100% de los ingresos acordados</strong> se quede de forma íntegra en manos de los prestadores locales.
              </p>
            </div>
          </div>

          {/* Pilares Informativos */}
          <div style={{ 
            borderTop: '1px solid var(--bg-dark-card-border)', 
            paddingTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', color: '#10b981' }}>🌿</span>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-dark-primary)', marginBottom: '0.2rem' }}>100% Libre y Gratuito</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Sin costos de registro, cuotas mensuales ni comisiones sobre los trabajos pactados.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', color: '#fbbf24' }}>📍</span>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-dark-primary)', marginBottom: '0.2rem' }}>Fomento del Comercio Local</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Contrata directamente a profesionales que viven en tu propia comunidad o colonia.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem', color: '#f43f5e' }}>🔒</span>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-dark-primary)', marginBottom: '0.2rem' }}>Seguridad y Confianza</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>Perfiles moderados por administradores y validados con calificaciones de vecinos reales.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. ¿Cómo funciona? - Sección Increíblemente Amigable y Clara */}
      <section style={{ 
        padding: '5rem 2rem', 
        background: 'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.02) 50%, transparent 100%)',
        borderTop: '1px solid var(--bg-dark-card-border)',
        borderBottom: '1px solid var(--bg-dark-card-border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark-primary)' }}>
            ¿Cómo funciona JalpanTrabajo?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '3.5rem' }}>
            Tres sencillos pasos para solucionar cualquier desperfecto en tu hogar de forma rápida.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Paso 1 */}
            <div className="glass-card" style={{ padding: '2.25rem', textAlign: 'center', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--primary-light)', 
                color: 'var(--bg-dark-container)', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)'
              }}>
                1
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 1.25rem auto', color: 'var(--primary-light)' }}>
                <Navigation size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>1. Busca en tu Zona</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                Filtra por plomeros, electricistas o pintores y utiliza el mapa interactivo para ver qué prestadores se encuentran más cerca de tu casa.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="glass-card" style={{ padding: '2.25rem', textAlign: 'center', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--primary-light)', 
                color: 'var(--bg-dark-container)', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)'
              }}>
                2
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 1.25rem auto', color: 'var(--secondary-color)' }}>
                <MessageSquare size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>2. Conecta Directamente</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                Escríbeles gratis mediante nuestro chat integrado o llámalos directamente a su celular para cotizar sin intermediarios.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="glass-card" style={{ padding: '2.25rem', textAlign: 'center', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--primary-light)', 
                color: 'var(--bg-dark-container)', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)'
              }}>
                3
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem auto 1.25rem auto', color: '#10b981' }}>
                <CheckCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>3. Agenda y Califica</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                Programa una cita directamente en la plataforma, recibe la visita técnica y deja una reseña con calificación para ayudar al resto de la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección de Estadísticas de la Sierra */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: 'var(--primary-light)', fontFamily: 'var(--font-heading)' }}>
              {providerCount || 2}
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Profesionales Activos</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Verificados con cobertura local en Jalpan</span>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: 'var(--secondary-color)', fontFamily: 'var(--font-heading)' }}>
              ${avgRate} <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>/ hr</span>
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Tarifa Promedio</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Precios competitivos del mercado serrano</span>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: '#10b981', fontFamily: 'var(--font-heading)' }}>
              100%
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Sin Comisiones</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Todo el beneficio es íntegro para el trabajador</span>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: 'var(--accent-color)', fontFamily: 'var(--font-heading)' }}>
              &lt; 5 km
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Máxima Proximidad</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Filtro de distancia dinámico e inteligente</span>
          </div>
        </div>
      </section>

      {/* 5. Sección Por Qué Elegirnos - Diseñado para Jalpan */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3.5rem', fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark-primary)' }}>
          ¿Por qué elegir JalpanTrabajo?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Tarjeta 1 */}
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>Opiniones Reales de Vecinos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Revisa el historial de calificaciones y los comentarios de otras personas del pueblo que ya han contratado sus servicios. ¡Confianza 100% comunitaria!
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>Trato Directo y Transparente</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Ponte en contacto sin intermediarios ni cargos extra. Acuerda tarifas, horarios y métodos de pago de forma directa por chat o WhatsApp de manera segura.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--secondary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>Asistente "Jalpi" Inteligente</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Conversa con nuestro asistente inteligente "Jalpi" para buscar al profesional ideal, estimar cotizaciones de reparaciones o coordinar tu agenda con un mensaje.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
