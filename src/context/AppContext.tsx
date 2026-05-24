import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Profile, Appointment, ChatMessage } from '../services/db';
import { supabase, isSupabaseConfigured, withTimeout, supabaseUrl, supabaseAnonKey } from '../services/supabaseClient';
import { isEmailConfigured, sendEmailBackground } from '../services/email';

interface AppContextType {
  user: Profile | null;
  role: 'cliente' | 'prestador' | 'admin';
  profiles: Profile[];
  appointments: Appointment[];
  activeContact: Profile | null;
  messages: ChatMessage[];
  currentView: 'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats' | 'auth' | 'admin' | 'proveedor';
  searchCategory: string;
  searchDistance: number;
  clientLocation: { lat: number; lng: number };
  isAuthLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setUserRole: (role: 'cliente' | 'prestador' | 'admin') => void;
  loginAs: (profileId: string) => Promise<void>;
  updateUserProfile: (updated: Partial<Profile>) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  setActiveContact: (profile: Profile | null) => void;
  sendChat: (content: string) => Promise<void>;
  setCurrentView: (view: 'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats' | 'auth' | 'admin' | 'proveedor') => void;
  setSearchCategory: (cat: string) => void;
  setSearchDistance: (dist: number) => void;
  setClientLocation: (loc: { lat: number; lng: number }) => void;
  bookService: (prestadorId: string, prestadorName: string, date: string, time: string, notes: string) => Promise<Appointment>;
  submitReview: (prestadorId: string, score: number, comment: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'cliente' | 'prestador' | 'admin', phone: string) => Promise<void>;
  signUpAdmin: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Métodos de Administración
  deleteProfile: (id: string) => Promise<void>;
  toggleProfileActive: (id: string, active: boolean) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  adminNotification: { show: boolean, to: string, subject: string, body: string, userName: string } | null;
  setAdminNotification: (notif: { show: boolean, to: string, subject: string, body: string, userName: string } | null) => void;
  chatEmailNotification: { show: boolean, to: string, recipientName: string, senderName: string, subject: string, body: string, content: string } | null;
  setChatEmailNotification: (notif: { show: boolean, to: string, recipientName: string, senderName: string, subject: string, body: string, content: string } | null) => void;
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
  reviewsCount: 0,
  isActive: true
};

// Administrador de prueba inicial
const DEFAULT_ADMIN: Profile = {
  id: 'a1',
  role: 'admin',
  name: 'Super Administrador Jalpan',
  phone: '4411000000',
  bio: 'Administrador central de la Bolsa de Trabajo Jalpan. Encargado de la supervisión de perfiles, reseñas y citas.',
  categories: [],
  rate: 0,
  schedule: '24/7',
  lat: 21.2185,
  lng: -99.4735,
  rating: 5,
  reviewsCount: 0,
  isActive: true
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<'cliente' | 'prestador' | 'admin'>('cliente');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeContact, setActiveContact] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentView, setCurrentView] = useState<'inicio' | 'mapa' | 'perfil' | 'citas' | 'chats' | 'auth' | 'admin' | 'proveedor'>('inicio');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchDistance, setSearchDistance] = useState<number>(5); // 5km de radio por defecto
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number }>({
    lat: 21.2185, // Plaza Principal de Jalpan
    lng: -99.4735
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [adminNotification, setAdminNotification] = useState<{ show: boolean, to: string, subject: string, body: string, userName: string } | null>(null);
  const [chatEmailNotification, setChatEmailNotification] = useState<{ show: boolean, to: string, recipientName: string, senderName: string, subject: string, body: string, content: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('b_theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  // Sincronizar clase CSS del tema con el body
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const body = document.body;
      if (theme === 'light') {
        body.classList.add('theme-light');
      } else {
        body.classList.remove('theme-light');
      }
      localStorage.setItem('b_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  async function refreshProfiles() {
    const isCurrentUserAdmin = (user && user.role === 'admin') || 
                               localStorage.getItem('b_is_super_admin') === 'true' ||
                               (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('b_current_user') || 'null')?.role === 'admin');
    const p = isCurrentUserAdmin
      ? await db.adminGetAllProfiles() 
      : await db.getProfiles();
    setProfiles(p);
  }

  async function refreshAppointments() {
    if (user) {
      if (user.role === 'admin') {
        const appts = await db.adminGetAllAppointments();
        setAppointments(appts);
      } else {
        const appts = await db.getAppointments(user.id, user.role);
        setAppointments(appts);
      }
    }
  }

  // Escuchar la autenticación de Supabase (o inicializar localStorage local)
  useEffect(() => {
    const initApp = async () => {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback local
        const savedUser = localStorage.getItem('b_current_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser) as Profile;
          if (parsed.email?.toLowerCase() === 'josemanuelvillaguillon@gmail.com' || parsed.role === 'admin' || parsed.id === 'a1' || parsed.id === 'admin_jose') {
            parsed.role = 'admin';
            localStorage.setItem('b_is_super_admin', 'true');
          }
          setUser(parsed);
          setRole(parsed.role);
          if (parsed.role === 'cliente') {
            setClientLocation({ lat: parsed.lat, lng: parsed.lng });
          }
        } else {
          // Por defecto en producción iniciamos sin sesión (Invitado)
          setUser(null);
          setRole('cliente');
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
            if (session.user.email?.toLowerCase() === 'josemanuelvillaguillon@gmail.com') {
              profile.role = 'admin';
              localStorage.setItem('b_is_super_admin', 'true');
            }
            setUser(profile);
            setRole(profile.role);
            localStorage.setItem('b_current_user', JSON.stringify(profile));
          } else {
            // Fallback si por alguna razón el perfil no se creó a tiempo
            const metadata = session.user.user_metadata;
            const forcedRole = session.user.email?.toLowerCase() === 'josemanuelvillaguillon@gmail.com' ? 'admin' : (metadata.role || 'cliente');
            if (forcedRole === 'admin') {
              localStorage.setItem('b_is_super_admin', 'true');
            }
            const isSuperAdmin = session.user.email?.toLowerCase() === 'josemanuelvillaguillon@gmail.com';
            const tempProfile = await db.saveProfile({
              id: session.user.id,
              name: metadata.name || 'Nuevo Usuario',
              role: forcedRole,
              phone: metadata.phone || '',
              bio: 'Hola, acabo de unirme a la Bolsa de Trabajo de Jalpan.',
              categories: [],
              rate: 0,
              schedule: 'Lunes a Viernes',
              lat: 21.2185,
              lng: -99.4735,
              rating: 5,
              reviewsCount: 0,
              isActive: isSuperAdmin ? true : (forcedRole === 'cliente' ? true : false),
              email: session.user.email || ''
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar citas y perfiles si cambia el usuario
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user) {
      refreshAppointments();
      refreshProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  // Alternar el rol activamente (para pruebas ágiles)
  const setUserRole = async (newRole: 'cliente' | 'prestador' | 'admin') => {
    if (isSupabaseConfigured && supabase) {
      // En modo Supabase real, el rol está guardado en el perfil. 
      // Le permitimos cambiar el rol actualizando su registro en Supabase.
      if (user) {
        await updateUserProfile({ role: newRole });
      }
      return;
    }

    // Modo local / demostración
    if (newRole === 'prestador') {
      const prestadorDemo = await db.getProfileById('p1');
      if (prestadorDemo) {
        setUser(prestadorDemo);
        setRole('prestador');
        localStorage.setItem('b_current_user', JSON.stringify(prestadorDemo));
      }
      setCurrentView('inicio');
    } else if (newRole === 'admin') {
      setUser(DEFAULT_ADMIN);
      setRole('admin');
      localStorage.setItem('b_current_user', JSON.stringify(DEFAULT_ADMIN));
      localStorage.setItem('b_is_super_admin', 'true');
      setCurrentView('admin');
    } else {
      let clienteDemo = await db.getProfileById('c1');
      if (!clienteDemo) {
        clienteDemo = DEFAULT_CLIENT;
      }
      setUser(clienteDemo);
      setRole('cliente');
      setClientLocation({ lat: clienteDemo.lat, lng: clienteDemo.lng });
      localStorage.setItem('b_current_user', JSON.stringify(clienteDemo));
      setCurrentView('inicio');
    }
    setActiveContact(null);
    await refreshProfiles();
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
      await refreshProfiles();
    }
  };

  // Guardar cambios en el perfil del usuario actual
  const updateUserProfile = async (updated: Partial<Profile>) => {
    if (!user) return;
    const newProfile = await db.saveProfile({ ...user, ...updated } as Profile);
    setUser(newProfile);
    if (updated.role) {
      setRole(updated.role);
    }
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

    // Configurar y disparar notificación de correo
    const emailTo = activeContact.email || `${activeContact.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const subject = `Nuevo mensaje de ${user.name} en JalpanTrabajo`;
    const body = `Hola ${activeContact.name},\n\nHas recibido un nuevo mensaje de ${user.name} en la plataforma Bolsa de Trabajo Jalpan de Serra:\n\n"${content}"\n\nPara responder a este mensaje, por favor inicia sesión en la plataforma:\nhttps://bolsa-de-trabajo-jalpan.web.app\n\nAtentamente,\nEl Equipo de JalpanTrabajo`;

    // Intentar envío automático en segundo plano con EmailJS
    if (isEmailConfigured()) {
      const sent = await sendEmailBackground({
        toEmail: emailTo,
        toName: activeContact.name,
        subject,
        body
      });
      if (sent) {
        console.log(`Mensaje de chat notificado por correo en segundo plano a ${activeContact.name}`);
        return;
      }
    }

    setChatEmailNotification({
      show: true,
      to: emailTo,
      recipientName: activeContact.name,
      senderName: user.name,
      subject,
      body,
      content
    });
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
  const signUp = async (email: string, password: string, name: string, chosenRole: 'cliente' | 'prestador' | 'admin', phone: string) => {
    let role = chosenRole;
    // Evitar que usuarios externos se registren como admin
    if (role === 'admin' && email.toLowerCase() !== 'josemanuelvillaguillon@gmail.com') {
      role = 'cliente';
    }

    if (!isSupabaseConfigured || !supabase) {
      // Simular registro en LocalStorage
      const mockId = 'mock_u_' + Math.random().toString(36).substr(2, 9);
      const isSuperAdmin = email.toLowerCase() === 'josemanuelvillaguillon@gmail.com';
      const newMockProfile = await db.saveProfile({
        id: mockId,
        name,
        role: isSuperAdmin ? 'admin' : role,
        phone,
        bio: isSuperAdmin ? 'Administrador principal de la Bolsa de Trabajo Jalpan.' : 'Hola, acabo de unirme a la Bolsa de Trabajo de Jalpan.',
        categories: [],
        rate: 0,
        schedule: 'Lunes a Viernes',
        lat: 21.2185,
        lng: -99.4735,
        rating: 5,
        reviewsCount: 0,
        isActive: isSuperAdmin ? true : (role === 'cliente' ? true : false),
        email: email
      });
      setUser(newMockProfile);
      setRole(isSuperAdmin ? 'admin' : role);
      localStorage.setItem('b_current_user', JSON.stringify(newMockProfile));
      return;
    }

    try {
      const { error } = await withTimeout(supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            phone
          }
        }
      }), 2500);
      if (error) throw error;
    } catch (err) {
      console.error('Error al registrarse en Supabase:', err);
      // Resiliencia: si es un error de red/fetch, timeout o rate limit de correos, registrar localmente
      const errorObj = err as { message?: string; name?: string };
      if (
        errorObj?.message?.includes('fetch') || 
        errorObj?.message?.includes('Network') || 
        errorObj?.message?.includes('Timeout') || 
        errorObj?.message?.includes('timeout') || 
        errorObj?.message?.includes('rate limit') || 
        errorObj?.message?.includes('limit exceeded') || 
        errorObj?.name === 'TypeError'
      ) {
        console.warn('Fallo de red, timeout o rate limit en Supabase. Creando cuenta local resiliente...');
        const mockId = 'mock_u_' + Math.random().toString(36).substr(2, 9);
        const isSuperAdmin = email.toLowerCase() === 'josemanuelvillaguillon@gmail.com';
        const newMockProfile = await db.saveProfile({
          id: mockId,
          name,
          role: isSuperAdmin ? 'admin' : role,
          phone,
          bio: isSuperAdmin ? 'Administrador principal (Red offline).' : 'Hola, acabo de unirme a la Bolsa de Trabajo de Jalpan (Red offline).',
          categories: [],
          rate: 0,
          schedule: 'Lunes a Viernes',
          lat: 21.2185,
          lng: -99.4735,
          rating: 5,
          reviewsCount: 0,
          isActive: isSuperAdmin ? true : (role === 'cliente' ? true : false),
          email: email
        });
        setUser(newMockProfile);
        setRole(isSuperAdmin ? 'admin' : role);
        localStorage.setItem('b_current_user', JSON.stringify(newMockProfile));
        return;
      }
      throw err;
    }
  };

  // REGISTRO DE ADMINISTRADOR (Session-free)
  const signUpAdmin = async (email: string, password: string, name: string, phone: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Simular en LocalStorage
      const mockId = 'mock_admin_' + Math.random().toString(36).substr(2, 9);
      await db.saveProfile({
        id: mockId,
        name,
        role: 'admin',
        phone,
        bio: 'Administrador registrado (Modo Demo).',
        categories: [],
        rate: 0,
        schedule: '24/7',
        lat: 21.2185,
        lng: -99.4735,
        rating: 5,
        reviewsCount: 0,
        isActive: true,
        email: email
      });
      await refreshProfiles();
      return;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
      });
      
      const { error } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'admin',
            phone
          }
        }
      });
      if (error) throw error;
      
      await refreshProfiles();
    } catch (err) {
      console.error('Error al registrarse en Supabase:', err);
      // Resiliencia: si es un error de red/fetch, timeout o rate limit de correos, registrar localmente
      const errorObj = err as { message?: string; name?: string };
      if (
        errorObj?.message?.includes('fetch') || 
        errorObj?.message?.includes('Network') || 
        errorObj?.message?.includes('Timeout') || 
        errorObj?.message?.includes('timeout') || 
        errorObj?.message?.includes('rate limit') || 
        errorObj?.message?.includes('limit exceeded') || 
        errorObj?.name === 'TypeError'
      ) {
        // Fallback local
        const mockId = 'mock_admin_' + Math.random().toString(36).substr(2, 9);
        await db.saveProfile({
          id: mockId,
          name,
          role: 'admin',
          phone,
          bio: 'Administrador registrado (Red offline).',
          categories: [],
          rate: 0,
          schedule: '24/7',
          lat: 21.2185,
          lng: -99.4735,
          rating: 5,
          reviewsCount: 0,
          isActive: true,
          email: email
        });
        await refreshProfiles();
        return;
      }
      throw err;
    }
  };

  // INICIO DE SESIÓN REAL (Supabase Auth)
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Simular login en LocalStorage buscando por email/nombre
      if (email.toLowerCase() === 'josemanuelvillaguillon@gmail.com') {
        const adminProfile: Profile = {
          ...DEFAULT_ADMIN,
          id: 'admin_jose',
          name: 'José Manuel Villa (Admin)',
          bio: 'Administrador central de la Bolsa de Trabajo Jalpan.'
        };
        adminProfile.email = 'josemanuelvillaguillon@gmail.com';
        setUser(adminProfile);
        setRole('admin');
        localStorage.setItem('b_current_user', JSON.stringify(adminProfile));
        localStorage.setItem('b_is_super_admin', 'true');
        setCurrentView('admin');
        return;
      }

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

    try {
      const { error } = await withTimeout(supabase.auth.signInWithPassword({
        email,
        password
      }), 2500);
      if (error) throw error;
    } catch (err) {
      console.error('Error al iniciar sesión en Supabase:', err);
      // Resiliencia: si es un error de red/fetch o timeout, iniciar sesión localmente
      const errorObj = err as { message?: string; name?: string };
      if (
        errorObj?.message?.includes('fetch') || 
        errorObj?.message?.includes('Network') || 
        errorObj?.message?.includes('Timeout') || 
        errorObj?.message?.includes('timeout') || 
        errorObj?.name === 'TypeError'
      ) {
        console.warn('Fallo de red o timeout en Supabase. Iniciando sesión de forma local...');
        if (email.toLowerCase() === 'josemanuelvillaguillon@gmail.com') {
          const adminProfile: Profile = {
            ...DEFAULT_ADMIN,
            id: 'admin_jose',
            name: 'José Manuel Villa (Admin)',
            bio: 'Administrador central de la Bolsa de Trabajo Jalpan.'
          };
          adminProfile.email = 'josemanuelvillaguillon@gmail.com';
          setUser(adminProfile);
          setRole('admin');
          localStorage.setItem('b_current_user', JSON.stringify(adminProfile));
          localStorage.setItem('b_is_super_admin', 'true');
          setCurrentView('admin');
          return;
        }

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
      throw err;
    }
  };

  // CERRAR SESIÓN REAL (Supabase Auth)
  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await withTimeout(supabase.auth.signOut(), 2500);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error al cerrar sesión en Supabase:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('b_current_user');
      localStorage.removeItem('b_is_super_admin');
      setCurrentView('inicio');
    }
  };

  // Métodos de Administración
  const deleteProfile = async (id: string) => {
    await db.adminDeleteProfile(id);
    await refreshProfiles();
  };

  const toggleProfileActive = async (id: string, active: boolean) => {
    await db.adminToggleProfileActive(id, active);
    await refreshProfiles();
    
    // Si el administrador activa la cuenta, intentar enviar correo
    if (active) {
      const p = await db.getProfileById(id);
      if (p && p.email) {
        const subject = '¡Tu perfil ha sido Autorizado y Aprobado! - Bolsa de Trabajo Jalpan';
        const body = `Estimado/a ${p.name},\n\nNos complace informarte que el administrador ha revisado y autorizado tu cuenta en la Bolsa de Trabajo de Jalpan de Serra.\n\nTu perfil ahora es oficial, público y completamente visible en los mapas interactivos y búsquedas para todos los vecinos de la Sierra Gorda.\n\n¡Mucho éxito en tus contrataciones y servicios!\n\nAtentamente,\nEl Administrador Central\nBolsa de Trabajo Jalpan de Serra`;

        // Intentar envío automático en segundo plano
        if (isEmailConfigured()) {
          const sent = await sendEmailBackground({
            toEmail: p.email,
            toName: p.name,
            subject,
            body
          });
          if (sent) {
            alert(`¡Cuenta activa! Se ha enviado un correo automático de notificación a ${p.name} (${p.email}).`);
            return;
          }
        }

        // Si no está configurado EmailJS o falla, mostrar el simulador modal / mailto fallback
        setAdminNotification({
          show: true,
          to: p.email,
          userName: p.name,
          subject,
          body
        });
      }
    }
  };

  const deleteReview = async (id: string) => {
    await db.adminDeleteReview(id);
    await refreshProfiles();
  };

  const deleteAppointment = async (id: string) => {
    await db.adminDeleteAppointment(id);
    await refreshAppointments();
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
        theme,
        toggleTheme,
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
        signUpAdmin,
        signIn,
        signOut,
        deleteProfile,
        toggleProfileActive,
        deleteReview,
        deleteAppointment,
        adminNotification,
        setAdminNotification,
        chatEmailNotification,
        setChatEmailNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
