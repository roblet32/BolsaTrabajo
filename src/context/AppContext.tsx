import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Profile, Appointment, ChatMessage } from '../services/db';

interface AppContextType {
  user: Profile | null;
  role: 'cliente' | 'prestador';
  profiles: Profile[];
  appointments: Appointment[];
  activeContact: Profile | null;
  messages: ChatMessage[];
  currentView: 'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats';
  searchCategory: string;
  searchDistance: number;
  clientLocation: { lat: number; lng: number };
  setUserRole: (role: 'cliente' | 'prestador') => void;
  loginAs: (profileId: string) => Promise<void>;
  updateUserProfile: (updated: Partial<Profile>) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  setActiveContact: (profile: Profile | null) => void;
  sendChat: (content: string) => Promise<void>;
  setCurrentView: (view: 'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats') => void;
  setSearchCategory: (cat: string) => void;
  setSearchDistance: (dist: number) => void;
  setClientLocation: (loc: { lat: number; lng: number }) => void;
  bookService: (prestadorId: string, prestadorName: string, date: string, time: string, notes: string) => Promise<Appointment>;
  submitReview: (prestadorId: string, score: number, comment: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Cliente de prueba inicial
const DEFAULT_CLIENT: Profile = {
  id: 'c1',
  role: 'cliente',
  name: 'Alejandro Gutiérrez',
  phone: '4411234567',
  bio: 'Cliente activo de Jalpan de Serra. Interesado en servicios de carpintería y fontanería.',
  categories: [],
  rate: 0,
  schedule: '',
  lat: 21.2185, // Plaza Principal
  lng: -99.4735,
  rating: 5,
  reviewsCount: 0
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<'cliente' | 'prestador'>('cliente');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeContact, setActiveContact] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentView, setCurrentView] = useState<'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats'>('inicio');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchDistance, setSearchDistance] = useState<number>(5); // 5km de radio por defecto
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number }>({
    lat: 21.2185, // Plaza Principal de Jalpan
    lng: -99.4735
  });

  // Cargar perfil por defecto y perfiles de proveedores
  useEffect(() => {
    const initApp = async () => {
      // Intentar cargar usuario guardado o establecer el por defecto
      const savedUser = localStorage.getItem('b_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as Profile;
        setUser(parsed);
        setRole(parsed.role);
        if (parsed.role === 'cliente') {
          setClientLocation({ lat: parsed.lat, lng: parsed.lng });
        }
      } else {
        localStorage.setItem('b_current_user', JSON.stringify(DEFAULT_CLIENT));
        setUser(DEFAULT_CLIENT);
        setRole('cliente');
        setClientLocation({ lat: DEFAULT_CLIENT.lat, lng: DEFAULT_CLIENT.lng });
      }
      
      await refreshProfiles();
    };
    initApp();
  }, []);

  // Cargar citas y mensajes si cambian el usuario o el contacto activo
  useEffect(() => {
    if (user) {
      refreshAppointments();
    }
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (user && activeContact) {
        const chatMsgs = await db.getChats(user.id, activeContact.id);
        setMessages(chatMsgs);
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [user, activeContact]);

  const refreshProfiles = async () => {
    const p = await db.getProfiles();
    setProfiles(p);
  };

  const refreshAppointments = async () => {
    if (user) {
      const appts = await db.getAppointments(user.id, user.role);
      setAppointments(appts);
    }
  };

  // Alternar el rol activamente (para pruebas ágiles)
  const setUserRole = async (newRole: 'cliente' | 'prestador') => {
    if (!user) return;
    
    // Si cambia a prestador, iniciamos sesión como el Plomero Juan Pérez ('p1') para demostración rápida,
    // o creamos un perfil de prestador si el usuario actual ya existe.
    if (newRole === 'prestador') {
      const prestadorDemo = await db.getProfileById('p1');
      if (prestadorDemo) {
        setUser(prestadorDemo);
        setRole('prestador');
        localStorage.setItem('b_current_user', JSON.stringify(prestadorDemo));
      }
    } else {
      // Volver a Alejandro Gutiérrez
      let clienteDemo = await db.getProfileById('c1');
      if (!clienteDemo) {
        clienteDemo = DEFAULT_CLIENT;
      }
      setUser(clienteDemo);
      setRole('cliente');
      setClientLocation({ lat: clienteDemo.lat, lng: clienteDemo.lng });
      localStorage.setItem('b_current_user', JSON.stringify(clienteDemo));
    }
    setActiveContact(null);
    setCurrentView('inicio');
  };

  // Iniciar sesión como un usuario específico de la base de datos
  const loginAs = async (profileId: string) => {
    const profile = await db.getProfileById(profileId);
    if (profile) {
      setUser(profile);
      setRole(profile.role);
      if (profile.role === 'cliente') {
        setClientLocation({ lat: profile.lat, lng: profile.lng });
      }
      localStorage.setItem('b_current_user', JSON.stringify(profile));
      setActiveContact(null);
      setCurrentView('inicio');
    }
  };

  // Guardar cambios en el perfil del usuario actual
  const updateUserProfile = async (updated: Partial<Profile>) => {
    if (!user) return;
    const newProfile = await db.saveProfile({ ...user, ...updated } as Profile);
    setUser(newProfile);
    localStorage.setItem('b_current_user', JSON.stringify(newProfile));
    await refreshProfiles();
  };

  // Enviar mensaje de chat
  const sendChat = async (content: string) => {
    if (!user || !activeContact || !content.trim()) return;
    const newMsg = await db.sendChatMessage({
      senderId: user.id,
      receiverId: activeContact.id,
      content
    });
    setMessages(prev => [...prev, newMsg]);
    
    // Actualizar también la lista de contactos en segundo plano
    refreshProfiles();
  };

  // Agendar un servicio
  const bookService = async (
    prestadorId: string,
    prestadorName: string,
    date: string,
    time: string,
    notes: string
  ): Promise<Appointment> => {
    if (!user) throw new Error('Usuario no logueado');
    const newAppt = await db.createAppointment({
      clienteId: user.id,
      clienteName: user.name,
      prestadorId,
      prestadorName,
      date,
      time,
      notes
    });
    await refreshAppointments();
    return newAppt;
  };

  // Enviar calificación
  const submitReview = async (prestadorId: string, score: number, comment: string) => {
    if (!user) return;
    await db.createReview({
      clienteId: user.id,
      clienteName: user.name,
      prestadorId,
      score,
      comment
    });
    await refreshProfiles();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        profiles,
        appointments,
        activeContact,
        messages,
        currentView,
        searchCategory,
        searchDistance,
        clientLocation,
        setUserRole,
        loginAs,
        updateUserProfile,
        refreshProfiles,
        refreshAppointments,
        setActiveContact,
        sendChat,
        setCurrentView,
        setSearchCategory,
        setSearchDistance,
        setClientLocation,
        bookService,
        submitReview
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
