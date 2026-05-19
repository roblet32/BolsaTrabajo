import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Phone, Clock, DollarSign, Calendar, MessageSquare, Plus, PenTool } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, Profile, Review } from '../services/db';

interface ProfileDetailProps {
  profile: Profile;
  onBack: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, onBack }) => {
  const { user, bookService, submitReview, setActiveContact, setCurrentView } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Estado para agendar cita
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [apptSuccess, setApptSuccess] = useState(false);

  // Estado para calificar
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      const revs = await db.getReviews(profile.id);
      setReviews(revs);
    };
    loadReviews();
  }, [profile.id, reviewSuccess]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    try {
      await bookService(profile.id, profile.name, date, time, notes);
      setApptSuccess(true);
      setDate('');
      setTime('');
      setNotes('');
      setTimeout(() => setApptSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await submitReview(profile.id, score, comment);
    setReviewSuccess(true);
    setComment('');
    setScore(5);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleChat = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setActiveContact(profile);
    setCurrentView('chats');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} />
        <span>Volver a la búsqueda</span>
      </button>

      <div className="profile-detail-container">
        {/* Columna Izquierda: Perfil y Cita */}
        <div className="profile-sidebar">
          <div className="glass-card profile-card-center">
            <div className="avatar-large">
              {profile.name.charAt(0)}
            </div>
            
            <h2 style={{ marginTop: '1rem' }}>{profile.name}</h2>
            
            <div className="rating-stars" style={{ justifyContent: 'center' }}>
              <Star size={16} fill="currentColor" />
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{profile.rating}</span>
              <span>({profile.reviewsCount} opiniones)</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {profile.categories.map((cat) => (
                <span key={cat} className="badge badge-primary">
                  {cat}
                </span>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--bg-dark-card-border)', paddingTop: '1.25rem', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={18} style={{ color: 'var(--secondary-color)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tarifa Base</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--secondary-color)' }}>${profile.rate} MXN / hr</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--primary-light)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Horario</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{profile.schedule}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={18} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Teléfono</div>
                  <a href={`tel:${profile.phone}`} style={{ fontSize: '0.85rem', color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                    {profile.phone}
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={handleChat}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
              id="btn_chat_detail"
            >
              <MessageSquare size={18} />
              <span>Chatear ahora</span>
            </button>
          </div>

          {/* Formulario de Cita o Promoción de Auth */}
          {!user ? (
            <div className="glass-card" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Calendar size={32} style={{ margin: '0 auto', color: 'var(--primary-light)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'white' }}>¿Quieres agendar una cita?</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Inicia sesión para contratar servicios de plomería, electricidad o carpintería de forma directa y 100% segura.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.65rem' }} 
                onClick={() => setCurrentView('auth')}
                id="btn_auth_promo_book"
              >
                Iniciar Sesión
              </button>
            </div>
          ) : (
            user.id !== profile.id && user.role === 'cliente' && (
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} style={{ color: 'var(--primary-light)' }} />
                  Agendar una Cita
                </h3>

                {apptSuccess ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}>
                    🎉 **¡Cita Solicitada con Éxito!** El profesional ha sido notificado y la podrás ver en tu pestaña de Citas. Te responderá por el chat.
                  </div>
                ) : (
                  <form onSubmit={handleBook} className="appointment-form">
                    <div className="form-group">
                      <label>Fecha del Servicio</label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        id="input_appt_date"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hora Tentativa</label>
                      <input
                        type="time"
                        required
                        className="form-control"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        id="input_appt_time"
                      />
                    </div>

                    <div className="form-group">
                      <label>Descripción del Trabajo</label>
                      <textarea
                        rows={3}
                        placeholder="Ej. Reparar gotera en baño, cotizar cortocircuito en cocina..."
                        className="form-control"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        id="input_appt_notes"
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} id="btn_submit_appt">
                      Confirmar Contratación
                    </button>
                  </form>
                )}
              </div>
            )
          )}
        </div>

        {/* Columna Derecha: Bio y Calificaciones */}
        <div className="profile-main-content">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              Sobre el Profesional
            </h3>
            <p style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', color: 'var(--text-dark-secondary)' }}>
              {profile.bio}
            </p>
          </div>

          {/* Calificaciones y Reseñas */}
          <div className="reviews-section">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--bg-dark-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Calificaciones de Clientes ({reviews.length})
              </h3>

              {/* Formulario de Nueva Calificación */}
              {user && user.id !== profile.id && user.role === 'cliente' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-dark-card-border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} style={{ color: 'var(--secondary-color)' }} />
                    Calificar Servicio Recibido
                  </h4>

                  {reviewSuccess ? (
                    <div style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ✓ ¡Gracias por tu reseña! Ha sido publicada inmediatamente.
                    </div>
                  ) : (
                    <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Calificación:</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setScore(star)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Star
                                size={26}
                                fill={star <= score ? 'var(--secondary-color)' : 'none'}
                                stroke="var(--secondary-color)"
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <textarea
                          rows={2}
                          required
                          placeholder="Cuéntanos tu experiencia con este profesional..."
                          className="form-control"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          id="input_review_comment"
                        />
                      </div>

                      <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} id="btn_submit_review">
                        Publicar Reseña
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Lista de Reseñas */}
              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-dark-secondary)', textAlign: 'center', padding: '2rem' }}>
                    Este profesional aún no tiene reseñas escritas. ¡Sé el primero en calificarlo!
                  </p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="review-item">
                      <div className="review-header">
                        <div>
                          <strong style={{ color: 'white' }}>{r.clienteName}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                            {new Date(r.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= r.score ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-dark-secondary)', fontSize: '0.9rem' }}>
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
