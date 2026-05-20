import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Briefcase, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, Profile } from '../services/db';

export const ChatPanel: React.FC = () => {
  const { user, activeContact, setActiveContact, messages, sendChat } = useApp();
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar contactos con chat activo
  useEffect(() => {
    const loadContacts = async () => {
      if (user) {
        const chats = await db.getChatContacts(user.id);
        setContacts(chats);

        // Si no hay contacto activo pero hay chats, seleccionar el primero por defecto
        if (!activeContact && chats.length > 0) {
          setActiveContact(chats[0]);
        }
      }
    };
    loadContacts();
  }, [user, messages]);

  // Scroll al final
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeContact) return;

    await sendChat(input);
    setInput('');
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 120px)', padding: '1rem' }}>
      <div className="glass-card chat-layout" style={{ height: '100%', overflow: 'hidden', padding: 0 }}>
        {/* Panel Izquierdo: Lista de Contactos */}
        <div style={{ borderRight: '1px solid var(--bg-dark-card-border)', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-role-switcher, rgba(9,13,22,0.3))' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--bg-dark-card-border)' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} style={{ color: 'var(--primary-light)' }} />
              Conversaciones
            </h3>
          </div>

          <div className="contacts-list" style={{ flex: 1, padding: '1rem' }}>
            {contacts.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '2rem 1rem' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 0.5rem auto' }} />
                No tienes chats activos. Inicia uno desde el perfil de un proveedor.
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`contact-item glass-card ${activeContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => setActiveContact(contact)}
                  style={{ borderRadius: '10px', marginBottom: '0.5rem' }}
                >
                  <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                    {contact.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-dark-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contact.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#14b8a6', textTransform: 'capitalize' }}>
                      {contact.role === 'prestador' ? contact.categories.join(', ') : 'Cliente'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel Derecho: Sala de Chat Activa */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-chat-messages, #090d16)' }}>
          {activeContact ? (
            <>
              {/* Cabecera del Chatbox */}
              <div className="chat-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>
                    {activeContact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-dark-primary)' }}>{activeContact.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                      En línea
                    </span>
                  </div>
                </div>

                {activeContact.role === 'prestador' && (
                  <div style={{ color: 'var(--secondary-color)', fontWeight: '800', fontSize: '1.1rem' }}>
                    ${activeContact.rate}<span>/hr</span>
                  </div>
                )}
              </div>

              {/* Contenedor de Mensajes */}
              <div className="chat-box-messages">
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem', gap: '0.5rem' }}>
                    <MessageSquare size={36} />
                    <span>Di hola para iniciar la conversación</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`chat-bubble ${isMe ? 'user' : 'bot'}`}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          background: isMe ? 'var(--primary-color)' : 'var(--bg-chat-bubble-bot, rgba(255,255,255,0.06))',
                          borderBottomRightRadius: isMe ? '4px' : '16px',
                          borderBottomLeftRadius: isMe ? '16px' : '4px',
                          boxShadow: isMe ? '0 4px 10px rgba(15,118,110,0.3)' : 'none'
                        }}
                      >
                        <div>{m.content}</div>
                        <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '0.25rem', color: isMe ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                          {formatTime(m.timestamp)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Entrada de Chat */}
              <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--bg-dark-card-border)', display: 'flex', gap: '0.75rem', background: 'var(--bg-dark, #090d16)' }}>
                <input
                  type="text"
                  className="chatbot-input"
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  id="txt_chat_input"
                />
                <button type="submit" className="chatbot-send" id="btn_chat_send">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '1rem' }}>
              <MessageSquare size={48} />
              <h3>Selecciona un chat</h3>
              <p style={{ fontSize: '0.85rem' }}>Elige una conversación de la izquierda para comenzar a enviar mensajes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatPanel;
