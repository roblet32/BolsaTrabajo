import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Profile, Appointment, ChatMessage } from '../services/db';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AppContextType {
  user: Profile | null;
  role: 'cliente' | 'prestador';
  profiles: Profile[];
  appointments: Appointment[];
  activeContact: Profile | null;
  messages: ChatMessage[];
  currentView: 'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats' | 'auth';
  searchCategory: string;
  searchDistance: number;
  clientLocation: { lat: number; lng: number };
  isAuthLoading: boolean;
  setUserRole: (role: 'cliente' | 'prestador') => void;
  loginAs: (profileId: string) => Promise<void>;
  updateUserProfile: (updated: Partial<Profile>) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  setActiveContact: (profile: Profile | null) => void;
  sendChat: (content: string) => Promise<void>;
  setCurrentView: (view: 'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats' | 'auth') => void;
  setSearchCategory: (cat: string) => void;
  setSearchDistance: (dist: number) => void;
  setClientLocation: (loc: { lat: number; lng: number }) => void;
  bookService: (prestadorId: string, prestadorName: string, date: string, time: string, notes: string) => Promise<Appointment>;
  submitReview: (prestadorId: string, score: number, comment: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'cliente' | 'prestador', phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [currentView, setCurrentView] = useState<'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats' | 'auth'>('inicio');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchDistance, setSearchDistance] = useState<number>(5); // 5km de radio por defecto
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number }>({
    lat: 21.2185, // Plaza Principal de Jalpan
    lng: -99.4735
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Escuchar la autenticación de Supabase (o inicializar localStorage local)
  useEffect(() => {
    const initApp = async () => {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback local
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
        setIsAuthLoading(false);
        await refreshProfiles();
        return;
      }

      // Si Supabase está configurado, escuchar cambios de autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setIsAuthLoading(true);
        if (session?.user) {
          // Buscar el perfil correspondiente al ID del usuario autenticado
          let profile = await db.getProfileById(session.user.id);
          
          // Si es un usuario nuevo, el trigger de la base de datos puede tardar milisegundos en crear el perfil.
          if (!profile) {
            await new Promise(r => setTimeout(r, 1200)); // Esperar un poco
            profile = await db.getProfileById(session.user.id);
          }

          if (profile) {
            setUser(profile);
            setRole(profile.role);
            localStorage.setItem('b_current_user', JSON.stringify(profile));
          } else {
            // Fallback si por alguna razón el perfil no se creó a tiempo
            const metadata = session.user.user_metadata;
            const tempProfile = await db.saveProfile({
              id: session.user.id,
              name: metadata.name || 'Nuevo Usuario',
              role: metadata.role || 'cliente',
              phone: metadata.phone || '',
              bio: 'Hola, acabo de unirme a la Bolsa de Trabajo de Jalpan.',
              categories: [],
              rate: 0,
              schedule: 'Lunes a Viernes',
              lat: 21.2185,
              lng: -99.4735,
              rating: 5,
              reviewsCount: 0
            });
            setUser(tempProfile);
            setRole(tempProfile.role);
            localStorage.setItem('b_current_user', JSON.stringify(tempProfile));
          }
        } else {
          setUser(null);
          // Rol cliente por defecto para invitados
          setRole('cliente');
          localStorage.removeItem('b_current_user');
        }
        setIsAuthLoading(false);
      });

      await refreshProfiles();

      return () => {
        subscription.unsubscribe();
      };
    };

    initApp();
  }, []);

  // Cargar citas si cambia el usuario
  useEffect(() => {
    if (user) {
      refreshAppointments();
    }
  }, [user]);

  // Cargar mensajes si cambia el usuario o el contacto activo
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
    if (isSupabaseConfigured && supabase) {
      // En modo Supabase real, el rol está guardado en el perfil. 
      // Le permitimos cambiar el rol actualizando su registro en Supabase.
      if (user) {
        await updateUserProfile({ role: newRole });
      }
      return;
    }

    // Modo local / demostración
    if (!user) return;
    if (newRole === 'prestador') {
      const prestadorDemo = await db.getProfileById('p1');
      if (prestadorDemo) {
        setUser(prestadorDemo);
        setRole('prestador');
        localStorage.setItem('b_current_user', JSON.stringify(prestadorDemo));
      }
    } else {
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

  // Iniciar sesión como un usuario específico de la base de datos (Demo)
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

  // REGISTRO REAL (Supabase Auth)
  const signUp = async (email: string, password: string, name: string, role: 'cliente' | 'prestador', phone: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Simular registro en LocalStorage
      const mockId = 'mock_u_' + Math.random().toString(36).substr(2, 9);
      const newMockProfile = await db.saveProfile({
        id: mockId,
        name,
        role,
        phone,
        bio: 'Hola, acabo de unirme a la Bolsa de Trabajo de Jalpan (Modo Demo).',
        categories: [],
        rate: 0,
        schedule: 'Lunes a Viernes',
        lat: 21.2185,
        lng: -99.4735,
        rating: 5,
        reviewsCount: 0
      });
      setUser(newMockProfile);
      setRole(role);
      localStorage.setItem('b_current_user', JSON.stringify(newMockProfile));
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone
        }
      }
    });

    if (error) throw error;
  };

  // INICIO DE SESIÓN REAL (Supabase Auth)
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Simular login en LocalStorage buscando por email/nombre
      const nameFromEmail = email.split('@')[0];
      const profilesList = await db.getProfiles();
      const found = profilesList.find(p => p.name.toLowerCase().includes(nameFromEmail.toLowerCase()));
      if (found) {
        setUser(found);
        setRole(found.role);
        localStorage.setItem('b_current_user', JSON.stringify(found));
      } else {
        setUser(DEFAULT_CLIENT);
        setRole('cliente');
        localStorage.setItem('b_current_user', JSON.stringify(DEFAULT_CLIENT));
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  // CERRAR SESIÓN REAL (Supabase Auth)
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error(error);
    } else {
      setUser(null);
      localStorage.removeItem('b_current_user');
    }
    setCurrentView('inicio');
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
        isAuthLoading,
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
        submitReview,
        signUp,
        signIn,
        signOut
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
