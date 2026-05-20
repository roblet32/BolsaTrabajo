import React, { useEffect } from 'react';
import { Calendar, Clock, FileText, Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, Appointment } from '../services/db';

export const AppointmentList: React.FC = () => {
  const { appointments, role, user, refreshAppointments, setActiveContact, setCurrentView } = useApp();

  useEffect(() => {
    refreshAppointments();
  }, [user, role]);

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await db.updateAppointmentStatus(id, status);
    await refreshAppointments();
  };

  const handleOpenChat = async (otherUserId: string) => {
    const contact = await db.getProfileById(otherUserId);
    if (contact) {
      setActiveContact(contact);
      setCurrentView('chats');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div className="panel-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>Gestión de Citas</h2>
          <p style={{ color: '#94a3b8' }}>
            {role === 'cliente' 
              ? 'Realiza el seguimiento de tus solicitudes y servicios contratados.' 
              : 'Administra tus solicitudes de trabajo entrantes de clientes locales.'}
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-dark-secondary)' }} />
          <h3>No tienes citas agendadas</h3>
          <p style={{ color: '#94a3b8', maxWidth: '400px' }}>
            {role === 'cliente' 
              ? 'Explora el mapa de Jalpan de Serra para encontrar y agendar servicios de plomería, carpintería o electricidad hoy.'
              : 'Tus solicitudes de clientes aparecerán aquí una vez que agenden tu servicio desde tu perfil público.'}
          </p>
          {role === 'cliente' && (
            <button className="btn-primary" onClick={() => setCurrentView('mapa')} style={{ marginTop: '1rem' }}>
              Buscar Profesionales
            </button>
          )}
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appt) => {
            const isClient = role === 'cliente';
            const nameToDisplay = isClient ? appt.prestadorName : appt.clienteName;
            const otherPartyId = isClient ? appt.prestadorId : appt.clienteId;

            return (
              <div key={appt.id} className="glass-card appt-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`appt-status ${appt.status}`}>
                    {appt.status}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    ID: {appt.id}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>
                  {nameToDisplay}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 'bold', marginTop: '-0.25rem' }}>
                  {isClient ? 'Proveedor de Servicio' : 'Cliente Solicitante'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--bg-dark-card-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dark-secondary)' }}>
                    <Calendar size={16} />
                    <span>{new Date(appt.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dark-secondary)' }}>
                    <Clock size={16} />
                    <span>{appt.time} hrs</span>
                  </div>

                  {appt.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dark-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                      <FileText size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{appt.notes}</span>
                    </div>
                  )}
                </div>

                {/* Acciones de la Cita */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--bg-dark-card-border)', paddingTop: '1rem' }}>
                  
                  {/* Chat Directo */}
                  <button 
                    onClick={() => handleOpenChat(otherPartyId)}
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                    title="Chatear con el contacto"
                  >
                    <MessageSquare size={16} />
                    <span>Chat</span>
                  </button>

                  {/* Acciones del Prestador */}
                  {!isClient && appt.status === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appt.id, 'aceptada')}
                        className="btn-primary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: '#0891b2' }}
                      >
                        <Check size={16} />
                        <span>Aceptar</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appt.id, 'cancelada')}
                        className="btn-secondary"
                        style={{ flex: 0.5, padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}

                  {!isClient && appt.status === 'aceptada' && (
                    <button
                      onClick={() => handleStatusUpdate(appt.id, 'completada')}
                      className="btn-primary"
                      style={{ flex: 2, padding: '0.5rem', fontSize: '0.85rem', background: 'var(--success)' }}
                    >
                      <Check size={16} />
                      <span>Marcar Completada</span>
                    </button>
                  )}

                  {/* Acciones del Cliente (Cancelar Cita) */}
                  {isClient && (appt.status === 'pendiente' || appt.status === 'aceptada') && (
                    <button
                      onClick={() => handleStatusUpdate(appt.id, 'cancelada')}
                      className="btn-secondary"
                      style={{ flex: 1.5, padding: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                    >
                      <X size={16} />
                      <span>Cancelar Cita</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AppointmentList;
