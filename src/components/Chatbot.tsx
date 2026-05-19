import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Calendar, MapPin, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db, Profile, getDistanceKm } from '../services/db';

interface BotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  profiles?: Profile[];
  type?: 'search' | 'quote' | 'general' | 'appointment';
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { profiles, clientLocation, setActiveContact, setCurrentView, bookService } = useApp();
  const [chatMessages, setChatMessages] = useState<BotMessage[]>([
    {
      id: 'init',
      sender: 'bot',
      text: '¡Hola! Soy **Jalpi**, tu asistente inteligente para la Bolsa de Trabajo de Jalpan de Serra. 🌲✨\n\n¿En qué puedo ayudarte hoy?',
      options: [
        '🔍 Buscar Plomero',
        '⚡ Buscar Electricista',
        '🪚 Buscar Carpintero',
        '💰 Cotizar un servicio',
        '📅 ¿Cómo agendar una cita?'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Agregar mensaje del usuario
    const userMsg: BotMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInput('');

    // Procesamiento con retraso para simular "pensamiento"
    setTimeout(() => {
      processResponse(textToSend.toLowerCase());
    }, 600);
  };

  const processResponse = (rawInput: string) => {
    const text = rawInput.trim();
    let reply = '';
    let foundProfiles: Profile[] = [];
    let options: string[] = ['🔍 Buscar Plomero', '⚡ Buscar Electricista', '🪚 Buscar Carpintero', '💰 Cotizar un servicio'];
    let type: BotMessage['type'] = 'general';

    // 1. Detección de Búsqueda de Oficios
    let detectedCategory = '';
    if (text.includes('plomero') || text.includes('plomeria') || text.includes('fontanero') || text.includes('fuga')) {
      detectedCategory = 'plomería';
    } else if (text.includes('electricista') || text.includes('luz') || text.includes('enchufe') || text.includes('corto')) {
      detectedCategory = 'electricidad';
    } else if (text.includes('carpintero') || text.includes('carpinteria') || text.includes('madera') || text.includes('puerta')) {
      detectedCategory = 'carpintería';
    } else if (text.includes('cerrajero') || text.includes('cerrajeria') || text.includes('llave') || text.includes('chapa')) {
      detectedCategory = 'cerrajería';
    } else if (text.includes('jardinero') || text.includes('jardin') || text.includes('poda') || text.includes('pasto')) {
      detectedCategory = 'jardinería';
    } else if (text.includes('pintor') || text.includes('pintura') || text.includes('impermeabilizar')) {
      detectedCategory = 'pintura';
    }

    // A. Si se pide una COTIZACIÓN
    if (text.includes('cotizar') || text.includes('precio') || text.includes('costo') || text.includes('tarifa') || text.includes('cuanto cobra') || text.includes('cuanto cuesta') || text.includes('promedio')) {
      type = 'quote';
      if (detectedCategory) {
        const categoryProviders = profiles.filter(p => 
          p.categories.some(c => c.toLowerCase() === detectedCategory.toLowerCase())
        );

        if (categoryProviders.length > 0) {
          const rates = categoryProviders.map(p => p.rate);
          const min = Math.min(...rates);
          const max = Math.max(...rates);
          const avg = parseFloat((rates.reduce((sum, r) => sum + r, 0) / rates.length).toFixed(1));

          reply = `💰 **Estimado de Tarifas para ${detectedCategory.toUpperCase()}**\n\nEl precio promedio registrado en Jalpan de Serra es de **$${avg} MXN por hora**.\n- Tarifa más baja: **$${min} MXN/hr**\n- Tarifa más alta: **$${max} MXN/hr**\n\n*Nota: Estos precios son una base y pueden variar dependiendo de la complejidad del trabajo y el horario solicitado.*`;
          options = [`🔍 Ver ${detectedCategory}s`, '💰 Cotizar otro oficio', '📅 Agendar cita'];
        } else {
          reply = `Actualmente no tengo tarifas base registradas para el oficio de **${detectedCategory}** en Jalpan de Serra. ¡Pero mantente al tanto, nuevos prestadores se unen todos los días!`;
        }
      } else {
        reply = '¿De qué oficio te gustaría consultar el precio estimado? Escribe por ejemplo: *"¿Cuánto cobra un electricista?"* o *"Cotizar plomero"*.';
        options = ['💰 Cotizar Plomero', '💰 Cotizar Electricista', '💰 Cotizar Carpintero'];
      }
    }
    // B. Si se busca un profesional normal
    else if (detectedCategory) {
      type = 'search';
      foundProfiles = profiles.filter(p => 
        p.categories.some(c => c.toLowerCase() === detectedCategory.toLowerCase())
      );

      if (foundProfiles.length > 0) {
        reply = `✨ He encontrado **${foundProfiles.length}** prestador(es) de **${detectedCategory}** disponibles en Jalpan de Serra.\n\nAquí los tienes ordenados por cercanía:`;
        options = ['💰 Cotizar este oficio', '📍 Ver en el mapa general', '📅 Agendar una Cita'];
      } else {
        reply = `Lo siento, actualmente no tenemos registrados prestadores de **${detectedCategory}** en nuestro sistema. Intenta buscando otra categoría como plomero, carpintero o electricista.`;
      }
    }
    // C. Si se pregunta por Citas
    else if (text.includes('cita') || text.includes('agendar') || text.includes('contratar') || text.includes('reserva') || text.includes('programar')) {
      type = 'appointment';
      reply = '📅 **Cómo agendar una cita:**\n\n1. Ve a la pestaña **🔍 Buscar Servicios** en el menú superior.\n2. Encuentra al prestador ideal en el mapa o en la lista.\n3. Haz clic en **"Ver Perfil"** para revisar sus opiniones e introducciones.\n4. Llena el formulario **"Agendar una Cita"** en su barra lateral y haz clic en Contratar.\n\n*El prestador recibirá una notificación inmediata y te responderá en el Chat.*';
      options = ['🔍 Ir al Mapa de Jalpan', '💬 Chatear con alguien'];
    }
    // D. Saludos
    else if (text.includes('hola') || text.includes('buenos dias') || text.includes('buenas tardes')) {
      reply = '¡Hola! Qué gusto saludarte. Soy Jalpi. ¿Buscas un profesional para un trabajo en Jalpan o te gustaría cotizar algún servicio? 🏡🛠️';
    }
    // E. Agradecimientos
    else if (text.includes('gracias') || text.includes('bueno') || text.includes('ok') || text.includes('perfecto')) {
      reply = '¡Con gusto! Estoy aquí para hacer que contratar servicios locales en Jalpan sea fácil, rápido y seguro. ¿Deseas hacer algo más?';
    }
    // F. Fallback general
    else {
      reply = 'Vaya, no estoy seguro de haber entendido tu solicitud. Puedo ayudarte a:\n- Buscar plomeros, electricistas o carpinteros.\n- Calcular cotizaciones y tarifas promedio.\n- Indicarte cómo agendar citas.\n\nPrueba escribiendo algo como: *"Busco electricista"* o *"Costo de plomero"*.';
    }

    const botMsg: BotMessage = {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: reply,
      options,
      profiles: foundProfiles,
      type
    };

    setChatMessages(prev => [...prev, botMsg]);
  };

  const handleOptionClick = (option: string) => {
    // Limpiar emojis de la opción para simular escritura del usuario
    const cleanOption = option.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
    handleSend(cleanOption);
  };

  const handleProfileSelect = (p: Profile) => {
    // Abrir chat directo con ese prestador
    setActiveContact(p);
    setCurrentView('chats');
    setIsOpen(false);
  };

  // Convertir marcas markdown básicas (`**negrita**`) a HTML seguro
  const formatText = (txt: string) => {
    return txt.split('\n').map((line, idx) => {
      // Reemplazar **texto** por <strong>texto</strong>
      const processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={idx} dangerouslySetInnerHTML={{ __html: processed }} style={{ marginBottom: '0.4rem' }} />;
    });
  };

  return (
    <div className="chatbot-widget">
      {/* Botón flotante para abrir chat */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          title="Asistente Inteligente Jalpi"
          id="btn_jalpi_chatbot"
        >
          <MessageSquare size={28} color="white" />
        </button>
      )}

      {/* Ventana del Chatbot */}
      {isOpen && (
        <div className="chatbot-panel glass-card">
          {/* Cabecera del Chatbot */}
          <div className="chatbot-header">
            <div className="chatbot-title-block">
              <div className="chatbot-avatar">
                <Bot size={22} />
              </div>
              <div className="chatbot-info">
                <h4>Asistente Jalpi</h4>
                <p>Disponible ahora</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Mensajes del Chatbot */}
          <div className="chatbot-messages">
            {chatMessages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className={`chat-bubble ${m.sender}`}>
                  {formatText(m.text)}

                  {/* Mostrar perfiles si la respuesta es de búsqueda */}
                  {m.profiles && m.profiles.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {m.profiles.map(p => {
                        const dist = getDistanceKm(clientLocation.lat, clientLocation.lng, p.lat, p.lng);
                        return (
                          <div
                            key={p.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => handleProfileSelect(p)}
                            title="Haz clic para chatear con este profesional"
                          >
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{p.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#14b8a6' }}>📍 A {dist} km • ⭐ {p.rating}</div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '800' }}>
                              ${p.rate}/hr
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mostrar píldoras de opción para respuesta del bot */}
                {m.sender === 'bot' && m.options && m.options.length > 0 && (
                  <div className="chatbot-options">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        className="option-pill"
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Entrada de texto */}
          <div className="chatbot-input-panel">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Pregúntame sobre oficios o tarifas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              id="txt_chatbot_prompt"
            />
            <button
              className="chatbot-send"
              onClick={() => handleSend(input)}
              id="btn_chatbot_send"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Chatbot;
