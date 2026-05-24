import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Star, MapPin, Briefcase, Plus, Trash2, Image, Sparkles, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationPicker } from './LocationPicker';

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

  // Agregar una foto a la galería
  const handleAddPhoto = (url: string) => {
    if (!url.trim()) return;
    if (workPhotos.includes(url)) {
      setNewPhotoUrl('');
      return; // Evitar duplicados
    }
    const updatedPhotos = [...workPhotos, url];
    setWorkPhotos(updatedPhotos);
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
        isActive: false // Requiere nueva autorización del administrador
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

                {/* Input de URL Personalizada */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="url"
                    placeholder="Pega la URL de una foto de tu trabajo (ej. de internet o redes)..."
                    className="form-control"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    id="upgrade_photo_url_input"
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                    onClick={() => handleAddPhoto(newPhotoUrl)}
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>

                {/* Grid de Fotos de Trabajos */}
                {workPhotos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                    {workPhotos.map((photo, index) => (
                      <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '100px', border: '1px solid var(--bg-dark-card-border)' }}>
                        <img src={photo} alt={`Trabajo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                            background: 'rgba(239, 68, 68, 0.85)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Encabezado */}
      <div className="panel-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', color: 'var(--text-dark-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={26} style={{ color: 'var(--primary-light)' }} />
            Mi Panel de Proveedor
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Administra tu perfil público, tarifa por hora, horario de atención, ubicación y galería de fotos de tus trabajos finalizados.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }} className="d-flex-column-mobile">
        
        {/* Columna Izquierda: Formularios */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Información General */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} style={{ color: 'var(--primary-light)' }} />
              Información de Contacto
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

          {/* Especializaciones y Tarifas */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} style={{ color: 'var(--secondary-color)' }} />
              Servicios y Tarifas
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Tarifa Base ($ MXN / Hora)</label>
                <div style={{ position: 'relative' }}>
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
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem' }}>Categorías de Oficio</label>
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
              <label>Descripción / Experiencia Laboral</label>
              <textarea
                rows={4}
                required
                placeholder="Escribe una breve introducción sobre tu experiencia laboral, especialidades, herramientas y garantías..."
                className="form-control"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                id="provider_bio"
              />
            </div>
          </div>

          {/* Galería de Fotos del Proveedor */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={20} style={{ color: 'var(--primary-light)' }} />
              Fotos de tus Trabajos y Proyectos
            </h3>
            
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Muestra imágenes reales de tus trabajos anteriores para dar mayor confianza a tus clientes. Puedes subir tus propias fotos o agregar imágenes demostrativas con los presets de abajo.
            </p>

            {/* Presets Rápidos */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                ⚡ Agregar presets de prueba rápida en 1 clic:
              </span>
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

            {/* Input URL Manual */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="url"
                placeholder="Pega la URL de una foto de tus trabajos terminados..."
                className="form-control"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                id="provider_photo_url_input"
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                onClick={() => handleAddPhoto(newPhotoUrl)}
              >
                <Plus size={16} />
                Agregar Foto
              </button>
            </div>

            {/* Visualización Grid con Hover y Borrado */}
            {workPhotos.length === 0 ? (
              <div style={{ border: '2px dashed var(--bg-dark-card-border)', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <Image size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                <span style={{ fontSize: '0.85rem' }}>Aún no has agregado fotos de tus trabajos. ¡Usa los presets de arriba para empezar!</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {workPhotos.map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '110px',
                      border: '1px solid var(--bg-dark-card-border)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    className="work-photo-item-container"
                  >
                    <img
                      src={photo}
                      alt={`Trabajo ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      className="work-photo-img"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.95)',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        zIndex: 5
                      }}
                      title="Eliminar esta foto"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Geolocalización (Maps) */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} style={{ color: '#ef4444' }} />
              Ubicación Geográfica en Jalpan
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div>
                <strong>Latitud:</strong> {lat.toFixed(6)}
              </div>
              <div>
                <strong>Longitud:</strong> {lng.toFixed(6)}
              </div>
            </div>

            <LocationPicker
              initialLat={lat}
              initialLng={lng}
              onLocationChange={handleLocationUpdate}
            />
          </div>

          {/* Botón de Guardado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 'bold' }} id="btn_save_provider_profile">
              Guardar Cambios de Perfil
            </button>

            {saveSuccess && (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 'bold' }}>
                <CheckCircle size={18} />
                ¡Cambios Guardados Exitosamente!
              </span>
            )}
          </div>
        </form>

        {/* Columna Derecha: Estadísticas y Guía */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card Resumen de Perfil */}
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-role-switcher, rgba(255, 255, 255, 0.05))', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-light)', border: '1px solid var(--bg-dark-card-border)' }}>
              {name.charAt(0) || 'P'}
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark-primary)' }}>{name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'capitalize', marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
              {selectedCategories.length > 0 ? (
                selectedCategories.map((c) => (
                  <span key={c} className="badge badge-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                    {c}
                  </span>
                ))
              ) : (
                <span style={{ color: '#ef4444' }}>Sin categorías asignadas</span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--bg-dark-card-border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                  <Star size={18} fill="currentColor" />
                  <strong style={{ fontSize: '1.25rem' }}>{user.rating || 5.0}</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Calificación</span>
              </div>

              <div>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-dark-primary)', display: 'block' }}>{user.reviewsCount || 0}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Opiniones</span>
              </div>
            </div>
          </div>

          {/* Tips e Instrucciones */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-dark-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={16} style={{ color: 'var(--primary-light)' }} />
              ¿Cómo optimizar tu perfil?
            </h4>
            <ul style={{ color: '#94a3b8', fontSize: '0.85rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.5' }}>
              <li>Mantén tu <strong>número telefónico</strong> activo para recibir llamadas y cotizaciones directas de WhatsApp.</li>
              <li>Ajusta tu <strong>tarifa base por hora</strong> de acuerdo al mercado para recibir más solicitudes.</li>
              <li>Describe detalladamente tus <strong>herramientas, servicios y garantías</strong> en la biografía.</li>
              <li>Arrastra el marcador en el mapa para situar tu punto con precisión.</li>
              <li>Sube fotos reales de tus trabajos para destacar frente a otros competidores.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProviderDashboard;
