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
    <div style={{ flex: 1, overflowX: 'hidden' }}>
      
      {/* 1. Sección Hero - Cálida y Super Amigable */}
      <section style={{
        position: 'relative',
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at top, rgba(20, 184, 166, 0.08) 0%, transparent 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Badge de Bienvenida */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(20, 184, 166, 0.08)',
          border: '1px solid rgba(20, 184, 166, 0.25)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          color: 'var(--primary-light)',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(20, 184, 166, 0.05)'
        }}>
          <span>👋 Bienvenidos a la Bolsa de Trabajo de Jalpan de Serra</span>
        </div>

        {/* Título Principal */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '850',
          lineHeight: '1.15',
          letterSpacing: '-0.02em',
          color: 'var(--text-dark-primary)',
          maxWidth: '850px',
          margin: '0 auto 1.25rem auto',
          background: 'linear-gradient(135deg, #ffffff 40%, #a5f3fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }} className="hero-title">
          Encuentra Expertos de Confianza en tu Colonia
        </h1>

        {/* Subtítulo */}
        <p style={{
          color: '#94a3b8',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '750px',
          margin: '0 auto 2.5rem auto'
        }}>
          La plataforma comunitaria de la Sierra Gorda que conecta directamente a plomeros, electricistas, carpinteros y más con vecinos del pueblo. ¡Trato local, directo y sin pagar comisiones!
        </p>

        {/* Botón de Acción Principal */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => { setSearchCategory(''); setCurrentView('mapa'); }}
            style={{ 
              fontSize: '1.05rem', 
              padding: '0.85rem 2.25rem',
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
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
              padding: '0.85rem 2.25rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            id="hero_btn_join_as_provider"
          >
            <Briefcase size={18} />
            <span>Ofrecer mis Servicios</span>
          </button>
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
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '3.5rem' }}>
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
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
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
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
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
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
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
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Verificados con cobertura local en Jalpan</span>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: 'var(--secondary-color)', fontFamily: 'var(--font-heading)' }}>
              ${avgRate} <span style={{ fontSize: '1.3rem', color: '#94a3b8' }}>/ hr</span>
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Tarifa Promedio</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Precios competitivos del mercado serrano</span>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: '#10b981', fontFamily: 'var(--font-heading)' }}>
              100%
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Sin Comisiones</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Todo el beneficio es íntegro para el trabajador</span>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: 'var(--accent-color)', fontFamily: 'var(--font-heading)' }}>
              &lt; 5 km
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', margin: '0.35rem 0', color: 'var(--text-dark-primary)' }}>Máxima Proximidad</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Filtro de distancia dinámico e inteligente</span>
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
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Revisa el historial de calificaciones y los comentarios de otras personas del pueblo que ya han contratado sus servicios. ¡Confianza 100% comunitaria!
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>Trato Directo y Transparente</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Ponte en contacto sin intermediarios ni cargos extra. Acuerda tarifas, horarios y métodos de pago de forma directa por chat o WhatsApp de manera segura.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--secondary-color)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>Asistente "Jalpi" Inteligente</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Conversa con nuestro asistente inteligente "Jalpi" para buscar al profesional ideal, estimar cotizaciones de reparaciones o coordinar tu agenda con un mensaje.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
