import React, { useState, useEffect } from 'react';
import { User, Phone, DollarSign, Clock, FileText, CheckCircle, Star, MapPin, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationPicker } from './LocationPicker';
import { Profile } from '../services/db';

export const ProviderDashboard: React.FC = () => {
  const { user, updateUserProfile } = useApp();

  // Estados locales para el formulario de edición de perfil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [rate, setRate] = useState(0);
  const [schedule, setSchedule] = useState('');
  const [lat, setLat] = useState(21.2185);
  const [lng, setLng] = useState(-99.4735);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cargar datos actuales del usuario al iniciar o cambiar
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
    }
  }, [user]);

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
      categories: selectedCategories
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const availableCategories = ['plomería', 'electricidad', 'carpintería', 'cerrajería', 'jardinería', 'pintura'];

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div className="panel-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>Panel del Prestador</h2>
          <p style={{ color: '#94a3b8' }}>Administra tu perfil público, tarifa por hora, horario de atención y ubicación geográfica en Jalpan.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }} className="d-flex-column-mobile">
        
        {/* Columna Izquierda: Formulario e Información del Mapa */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Información General */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} style={{ color: 'var(--primary-light)' }} />
              Información de Contacto
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Nombre Completo</label>
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
                <label>Teléfono de Contacto</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
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
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {availableCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: isChecked ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.02)',
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
              <label>Descripción / Biografía Profesional</label>
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
            <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }} id="btn_save_provider_profile">
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

        {/* Columna Derecha: Estadísticas y Resumen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
              {user.name.charAt(0)}
            </div>
            
            <h3>{user.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'capitalize', marginTop: '0.25rem' }}>
              {user.categories.length > 0 ? user.categories.join(' • ') : 'Sin categorías'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--bg-dark-card-border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                  <Star size={18} fill="currentColor" />
                  <strong style={{ fontSize: '1.25rem' }}>{user.rating}</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Calificación</span>
              </div>

              <div>
                <strong style={{ fontSize: '1.25rem', color: 'white', display: 'block' }}>{user.reviewsCount}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Opiniones</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
            <h4>¿Cómo configurar tu perfil?</h4>
            <ul style={{ color: '#94a3b8', fontSize: '0.85rem', paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Mantén tu <strong>número telefónico</strong> actualizado para que los clientes te llamen en 1 clic.</li>
              <li>Establece una <strong>tarifa base por hora</strong> competitiva para atraer más cotizaciones.</li>
              <li>Describe detalladamente tu <strong>experiencia laboral</strong> en el campo de descripción.</li>
              <li>Arrastra el marcador rojo en el mapa para posicionarte con precisión en el barrio o colonia donde laboras en Jalpan.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ProviderDashboard;
