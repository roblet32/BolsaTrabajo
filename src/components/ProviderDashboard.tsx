import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Star, MapPin, Briefcase, Plus, Trash2, Image, Sparkles, Globe, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationPicker } from './LocationPicker';
import { isSupabaseConfigured } from '../services/supabaseClient';

const PHOTO_PRESETS = [
  { label: '🔧 Plomería', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60' },
  { label: '⚡ Electricidad', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=60' },
  { label: '🪚 Carpintería', url: 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?w=600&auto=format&fit=crop&q=60' },
  { label: '🎨 Pintura', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=60' },
  { label: '🌿 Jardinería', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=60' },
  { label: '🔑 Cerrajería', url: 'https://images.unsplash.com/photo-1618579895757-6e9e0000e3f0?w=600&auto=format&fit=crop&q=60' }
];

export const ProviderDashboard: React.FC = () => {
  const { user, role, updateUserProfile, setCurrentView } = useApp();

  // Estados locales para el formulario de edición de perfil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [rate, setRate] = useState(0);
  const [schedule, setSchedule] = useState('');
  const [lat, setLat] = useState(21.2185);
  const [lng, setLng] = useState(-99.4735);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);
  
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Control de Pestañas Activas en Edición para mayor profesionalismo
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'location'>('info');

  // Cargar datos actuales del usuario al iniciar o cambiar
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setRate(user.rate || 0);
      setSchedule(user.schedule || '');
      setLat(user.lat || 21.2185);
      setLng(user.lng || -99.4735);
      setSelectedCategories(user.categories || []);
      setWorkPhotos(user.workPhotos || []);
    }
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleLocationUpdate = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  // Agregar una foto a la galería de trabajos
  const handleAddPhoto = (url: string) => {
    if (!url.trim()) return;
    const cleanUrl = url.trim();
    if (!workPhotos.includes(cleanUrl)) {
      setWorkPhotos(prev => [...prev, cleanUrl]);
    }
    setNewPhotoUrl('');
  };

  // Eliminar una foto de la galería
  const handleRemovePhoto = (indexToRemove: number) => {
    const updatedPhotos = workPhotos.filter((_, idx) => idx !== indexToRemove);
    setWorkPhotos(updatedPhotos);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await updateUserProfile({
      name,
      phone,
      bio,
      rate: Number(rate),
      schedule,
      lat,
      lng,
      categories: selectedCategories,
      workPhotos: workPhotos
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Flujo para convertir un Cliente en Proveedor
  const handleUpgradeToProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpgrading(true);
    
    try {
      await updateUserProfile({
        name,
        phone,
        bio: bio || 'Hola, soy un proveedor de servicios en Jalpan de Serra. ¡Contáctame para cotizar!',
        rate: Number(rate) || 100,
        schedule: schedule || 'Lunes a Sábado: 8:00 AM - 6:00 PM',
        lat,
        lng,
        categories: selectedCategories.length > 0 ? selectedCategories : ['plomería'],
        workPhotos: workPhotos,
        role: 'prestador', // Cambiar de cliente a proveedor
        isActive: isSupabaseConfigured ? false : true // En Supabase requiere aprobación del admin, en local/demo se activa automáticamente para facilitar pruebas
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error al subir de rango a proveedor:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const availableCategories = ['plomería', 'electricidad', 'carpintería', 'cerrajería', 'jardinería', 'pintura'];

  // 1. Vista para Invitados (No Autenticados)
  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }} className="glass-card">
        <div style={{ background: 'rgba(20, 184, 166, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Briefcase size={40} style={{ color: 'var(--primary-light)' }} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-dark-primary)' }}>Mi Panel de Proveedor</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0', lineHeight: '1.6' }}>
          ¿Ofreces algún servicio técnico u oficio en Jalpan de Serra? Inicia sesión o crea una cuenta para configurar tu perfil público, mostrar fotos de tus trabajos, definir tu tarifa por hora y geolocalizarte en el mapa.
        </p>
        <button
          className="btn-primary"
          style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 'bold' }}
          onClick={() => setCurrentView('auth')}
          id="provider_guest_login_btn"
        >
          Iniciar Sesión / Crear Cuenta
        </button>
      </div>
    );
  }

  // 2. Vista de Conversión para Clientes (Upgrade to Provider)
  if (role === 'cliente') {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* Banner de Invitación */}
        <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--primary-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)' }}>
            <Sparkles size={24} />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>¡Oportunidad de Trabajo Local!</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-dark-primary)' }}>¿Ofreces servicios en Jalpan de Serra?</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', maxWidth: '800px', margin: '0.25rem 0 0.5rem 0' }}>
            Transforma tu cuenta en un <strong>Perfil de Proveedor</strong> de manera instantánea. Podrás publicar tu oficio, tus tarifas y mostrar fotos de tus mejores trabajos a miles de personas del pueblo que buscan profesionales calificados diariamente.
          </p>
        </div>

        <form onSubmit={handleUpgradeToProvider} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }} className="d-flex-column-mobile">
            
            {/* Formulario Principal de Registro */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Información Personal */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} style={{ color: 'var(--primary-light)' }} />
                  Información Básica
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label>Nombre Profesional</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="upgrade_name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="upgrade_phone"
                    />
                  </div>
                </div>
              </div>

              {/* Categorías y Tarifas */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={20} style={{ color: 'var(--secondary-color)' }} />
                  Servicios, Tarifas y Categorías
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label>Tarifa Base ($ MXN / Hora)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="form-control"
                      value={rate || ''}
                      onChange={(e) => setRate(Number(e.target.value))}
                      placeholder="Ej. 120"
                      id="upgrade_rate"
                    />
                  </div>

                  <div className="form-group">
                    <label>Horarios de Trabajo</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="Ej. Lunes a Sábado: 8:00 AM - 6:00 PM"
                      id="upgrade_schedule"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem' }}>Categorías de tu Oficio (Selecciona al menos uno)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {availableCategories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: isChecked ? 'rgba(20, 184, 166, 0.15)' : 'var(--bg-input, rgba(255, 255, 255, 0.02))',
                            border: `1px solid ${isChecked ? 'var(--primary-light)' : 'var(--bg-dark-card-border)'}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'var(--transition-fast)'
                          }}
                          id={`upgrade_label_cat_${cat}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(cat)}
                            style={{ display: 'none' }}
                            id={`upgrade_check_cat_${cat}`}
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Cuéntale a tus clientes quién eres (Biografía o Experiencia)</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe los servicios que realizas, tus años de experiencia, herramientas que utilizas o alguna garantía de tu trabajo..."
                    className="form-control"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    id="upgrade_bio"
                  />
                </div>
              </div>

              {/* Ubicación Exacta */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} style={{ color: '#ef4444' }} />
                  Tu Ubicación de Cobertura en Jalpan
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Usa el mapa interactivo para marcar el vecindario o zona donde ofreces tus servicios. Los clientes te buscarán en base a tu cercanía.
                </p>
                <LocationPicker
                  initialLat={lat}
                  initialLng={lng}
                  onLocationChange={handleLocationUpdate}
                />
              </div>

              {/* Galería Inicial de Fotos */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Image size={20} style={{ color: 'var(--primary-light)' }} />
                  Fotos de tus Trabajos (Opcional)
                </h3>
                
                {/* Presets de muestra rápida */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    💡 Haz clic en los presets de abajo para cargar fotos de muestra al instante y probar el sistema:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => handleAddPhoto(preset.url)}
                      >
                        <Plus size={12} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {workPhotos.map((photo, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '90px', border: '1px solid var(--bg-dark-card-border)' }}>
                      <img src={photo} alt="Trabajo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Columna Derecha con Recomendaciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-dark-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={18} style={{ color: 'var(--primary-light)' }} />
                  ¿Por qué registrarte?
                </h4>
                <ul style={{ color: '#94a3b8', fontSize: '0.85rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.5' }}>
                  <li><strong>Conexión Directa:</strong> Los clientes de Jalpan te llamarán directamente por teléfono o te escribirán por el chat.</li>
                  <li><strong>Sin Comisiones:</strong> El trato es 100% libre de intermediarios, todo lo que cobres es íntegro para ti.</li>
                  <li><strong>Geolocalización:</strong> Al marcar tu ubicación en el mapa de Jalpan, aparecerás cerca de los vecinos de tu colonia o comunidad.</li>
                  <li><strong>Galería Visual:</strong> Los perfiles con fotos reales de trabajos anteriores reciben hasta 3 veces más llamadas.</li>
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <Sparkles size={32} style={{ color: 'var(--secondary-color)' }} />
                <div>
                  <h4 style={{ color: 'var(--text-dark-primary)' }}>¡Listo para comenzar!</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>Al hacer clic abajo, tu cuenta se habilitará como proveedor en la plataforma.</p>
                </div>
                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 'bold' }}
                  id="upgrade_submit_btn"
                >
                  {isUpgrading ? 'Procesando...' : '¡Activar mi Perfil de Proveedor!'}
                </button>

                {saveSuccess && (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <CheckCircle size={16} />
                    ¡Bienvenido Proveedor!
                  </span>
                )}
              </div>
            </div>

          </div>
        </form>

      </div>
    );
  }

  // 3. Vista de Panel para Proveedores Activos (y Administradores para pruebas)
  // Rediseñada de forma extremadamente profesional con Pestañas y Vista Previa en Vivo interactiva
  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Encabezado Principal */}
      <div className="panel-header" style={{ marginBottom: '2.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.95rem', color: 'var(--text-dark-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Briefcase size={28} style={{ color: 'var(--primary-light)' }} />
            Panel de Control de Proveedor
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Gestiona la información comercial de tu negocio local, define tus tarifas, agrega fotos reales y mantén tu ubicación de cobertura siempre al día.
          </p>
        </div>
      </div>

      {/* Banner de Advertencia si está pendiente de aprobación en producción */}
      {user.isActive === false && (
        <div className="glass-card" style={{
          background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)',
          borderLeft: '4px solid #f59e0b',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⏳</span>
          <div>
            <h4 style={{ color: '#fbbf24', fontSize: '0.95rem', fontWeight: 'bold' }}>Perfil Pendiente de Aprobación por la Administración</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.15rem' }}>
              Puedes editar y perfeccionar tu perfil normalmente en este panel. Tus cambios se guardarán, pero tu perfil no se mostrará públicamente en el buscador ni en el mapa hasta que el administrador verifique tus datos.
            </p>
          </div>
        </div>
      )}

      {/* Grid del Dashboard: Formulario a la Izquierda, Vista Previa en Vivo a la Derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2.25rem' }} className="d-flex-column-mobile">
        
        {/* Columna Izquierda: Formulario Organizado por Pestañas */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Selector de Pestañas Premium */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--bg-dark-card-border)',
            borderRadius: '12px',
            padding: '0.4rem',
            gap: '0.25rem' 
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              style={{
                flex: 1,
                background: activeTab === 'info' ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                border: 'none',
                color: activeTab === 'info' ? 'var(--text-dark-primary)' : '#64748b',
                padding: '0.75rem 1rem',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-fast)'
              }}
            >
              <User size={16} style={{ color: activeTab === 'info' ? 'var(--primary-light)' : 'inherit' }} />
              <span>1. Información</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              style={{
                flex: 1,
                background: activeTab === 'photos' ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                border: 'none',
                color: activeTab === 'photos' ? 'var(--text-dark-primary)' : '#64748b',
                padding: '0.75rem 1rem',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-fast)'
              }}
            >
              <Image size={16} style={{ color: activeTab === 'photos' ? 'var(--primary-light)' : 'inherit' }} />
              <span>2. Galería ({workPhotos.length})</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab('location')}
              style={{
                flex: 1,
                background: activeTab === 'location' ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                border: 'none',
                color: activeTab === 'location' ? 'var(--text-dark-primary)' : '#64748b',
                padding: '0.75rem 1rem',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-fast)'
              }}
            >
              <MapPin size={16} style={{ color: activeTab === 'location' ? 'var(--primary-light)' : 'inherit' }} />
              <span>3. Cobertura</span>
            </button>
          </div>

          {/* Renderizado de la Pestaña 1: Información Profesional */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Información General */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} style={{ color: 'var(--primary-light)' }} />
                  Información Básica de Contacto
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="d-flex-column-mobile">
                  <div className="form-group">
                    <label>Nombre Profesional</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="provider_name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="provider_phone"
                    />
                  </div>
                </div>
              </div>

              {/* Oficio y Tarifas */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={20} style={{ color: 'var(--secondary-color)' }} />
                  Detalles del Servicio Comercial
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem' }} className="d-flex-column-mobile">
                  <div className="form-group">
                    <label>Tarifa Base ($ MXN / Hora)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="form-control"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      id="provider_rate"
                    />
                  </div>

                  <div className="form-group">
                    <label>Horarios de Disponibilidad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Lunes a Sábado: 8:00 AM - 6:00 PM"
                      className="form-control"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      id="provider_schedule"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-dark-primary)' }}>
                    Categorías de Oficio (Selecciona todas las que apliquen)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {availableCategories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label
                          key={cat}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: isChecked ? 'rgba(20, 184, 166, 0.12)' : 'var(--bg-input, rgba(255, 255, 255, 0.02))',
                            border: `1px solid ${isChecked ? 'var(--primary-light)' : 'var(--bg-dark-card-border)'}`,
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontSize: '0.85rem',
                            fontWeight: isChecked ? '600' : 'normal',
                            transition: 'var(--transition-fast)'
                          }}
                          id={`label_cat_${cat}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(cat)}
                            style={{ display: 'none' }}
                            id={`check_cat_${cat}`}
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label>Biografía / Presentación al Cliente</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe una presentación atractiva. Cuenta tus años de experiencia, especialidades, herramientas, garantías y la calidad de tu trabajo..."
                    className="form-control"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    id="provider_bio"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Renderizado de la Pestaña 2: Galería de Proyectos */}
          {activeTab === 'photos' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Image size={20} style={{ color: 'var(--primary-light)' }} />
                Galería de Trabajos Realizados
              </h3>
              
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Las fotos reales incrementan la confianza de los clientes. Puedes añadir imágenes demostrativas con los presets de abajo o pegar enlaces de tus propios trabajos.
              </p>

              {/* Presets Rápidos */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  ⚡ Carga rápida en 1 clic de presets profesionales:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      onClick={() => handleAddPhoto(preset.url)}
                    >
                      <Plus size={10} />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input URL Manual */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="url"
                  placeholder="Pega la URL de una foto (ej: https://enlace-imagen.jpg)..."
                  className="form-control"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  id="provider_photo_url_input"
                  style={{ fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
                  onClick={() => handleAddPhoto(newPhotoUrl)}
                >
                  <Plus size={14} />
                  Añadir Foto
                </button>
              </div>

              {/* Grid de Fotos Agregadas */}
              {workPhotos.length === 0 ? (
                <div style={{ border: '2px dashed var(--bg-dark-card-border)', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Image size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                  <span style={{ fontSize: '0.85rem', display: 'block' }}>¡Tu galería de trabajos está vacía!</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75, display: 'block', marginTop: '0.25rem' }}>Usa los presets rápidos de arriba para comenzar a probarla al instante.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {workPhotos.map((photo, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '95px',
                        border: '1px solid var(--bg-dark-card-border)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)'
                      }}
                      className="work-photo-item-container"
                    >
                      <img
                        src={photo}
                        alt={`Trabajo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.95)',
                          color: 'white',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          zIndex: 5
                        }}
                        title="Eliminar esta foto"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Renderizado de la Pestaña 3: Área de Cobertura */}
          {activeTab === 'location' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: '#ef4444' }} />
                Cobertura y Geolocalización en Jalpan
              </h3>

              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Los clientes de Jalpan te buscarán en base a tu cercanía. Pega un enlace de Google Maps del pueblo o arrastra el marcador verde para posicionarte en tu colonia o comunidad.
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--bg-dark-card-border)' }}>
                <div>
                  <strong>Latitud:</strong> <span style={{ color: 'var(--text-dark-primary)' }}>{lat.toFixed(6)}</span>
                </div>
                <div>
                  <strong>Longitud:</strong> <span style={{ color: 'var(--text-dark-primary)' }}>{lng.toFixed(6)}</span>
                </div>
              </div>

              <LocationPicker
                initialLat={lat}
                initialLng={lng}
                onLocationChange={handleLocationUpdate}
              />
            </div>
          )}

          {/* Botón de Guardado Unificado (Visible bajo los formularios en cualquier pestaña) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            marginTop: '1rem', 
            borderTop: '1px solid var(--bg-dark-card-border)', 
            paddingTop: '1.5rem' 
          }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                padding: '0.85rem 2.5rem', 
                fontSize: '1.02rem', 
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)'
              }} 
              id="btn_save_provider_profile"
            >
              Guardar Cambios de Perfil
            </button>

            {saveSuccess && (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <CheckCircle size={18} />
                ¡Perfil Actualizado con Éxito!
              </span>
            )}
          </div>

        </form>

        {/* Columna Derecha: Tarjeta Interactiva de VISTA PREVIA EN VIVO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Indicador de Vista Previa */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: '#14b8a6', 
            background: 'rgba(20, 184, 166, 0.05)', 
            padding: '0.75rem 1rem', 
            borderRadius: '12px', 
            border: '1px dashed rgba(20, 184, 166, 0.25)' 
          }}>
            <Sparkles size={16} className="pulse-icon" />
            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vista Previa en Vivo del Perfil
            </span>
          </div>

          {/* Tarjeta de Proveedor: Copia fiel de cómo se ve en el buscador principal */}
          <div className="glass-card provider-card" style={{ 
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.45)', 
            border: '1px solid rgba(20, 184, 166, 0.2)',
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease'
          }}>
            
            <div className="provider-card-header">
              <div className="provider-info-block" style={{ width: '100%' }}>
                
                {/* Nombre */}
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: 'var(--text-dark-primary)', 
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {name.trim() || 'Tu Nombre Profesional'}
                </h3>
                
                {/* Categorías */}
                <div className="provider-badge-list" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {selectedCategories.length > 0 ? (
                    selectedCategories.map((cat) => (
                      <span key={cat} className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.68rem' }}>
                      Sin especialidad
                    </span>
                  )}
                </div>
                
                {/* Calificación y Distancia Simulada */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                  <div className="rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={13} fill="currentColor" style={{ color: '#fbbf24' }} />
                    <strong style={{ fontSize: '0.82rem', color: '#fbbf24' }}>{user.rating || 5.0}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({user.reviewsCount || 0})</span>
                  </div>
                  
                  <div className="provider-distance" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <MapPin size={12} />
                    <span>A 1.25 km</span>
                  </div>
                </div>

              </div>

              {/* Tarifa Base */}
              <div className="provider-rate" style={{ fontSize: '1.25rem', minWidth: '85px', textAlign: 'right' }}>
                ${rate || 0}<span style={{ fontSize: '0.75rem' }}>/hr</span>
              </div>
            </div>

            {/* Presentación / Biografía */}
            <p style={{ 
              color: '#94a3b8', 
              fontSize: '0.83rem', 
              lineHeight: '1.5', 
              margin: '0.75rem 0', 
              minHeight: '45px', 
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {bio.trim() || 'Escribe una presentación atractiva en la pestaña 1 para que los clientes del pueblo te conozcan de inmediato...'}
            </p>

            {/* Footer de la tarjeta */}
            <div className="provider-card-footer" style={{ 
              borderTop: '1px solid var(--bg-dark-card-border)', 
              paddingTop: '0.75rem', 
              marginTop: '0.75rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                <Clock size={12} />
                <span>{schedule.trim() || 'Horario por definir'}</span>
              </div>
              
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', pointerEvents: 'none' }}
              >
                Ver Perfil
              </button>
            </div>
            
          </div>

          {/* Carrusel de Fotos de la Vista Previa */}
          {workPhotos.length > 0 && (
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', display: 'block' }}>
                🖼️ Fotos de tus Trabajos en tu Perfil ({workPhotos.length})
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {workPhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Proyecto ${index + 1}`}
                    style={{ 
                      width: '75px', 
                      height: '55px', 
                      borderRadius: '4px', 
                      objectFit: 'cover',
                      border: '1px solid var(--bg-dark-card-border)' 
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tips Adicionales de Éxito */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
              Consejos de Éxito Local
            </h4>
            <ul style={{ color: '#94a3b8', fontSize: '0.78rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: '1.4' }}>
              <li><strong>Tarifa competitiva:</strong> Configura una tarifa justa de acuerdo al servicio.</li>
              <li><strong>Número de WhatsApp:</strong> Asegúrate de que el número sea correcto para recibir cotizaciones instantáneas.</li>
              <li><strong>Fotos de calidad:</strong> Sube fotos de alta definición para destacar entre los demás prestadores.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProviderDashboard;
