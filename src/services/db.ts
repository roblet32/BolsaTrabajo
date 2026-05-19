import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface Profile {
  id: string;
  role: 'prestador' | 'cliente';
  name: string;
  phone: string;
  bio: string;
  categories: string[];
  rate: number;
  schedule: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
}

export interface Appointment {
  id: string;
  clienteId: string;
  clienteName: string;
  prestadorId: string;
  prestadorName: string;
  date: string;
  time: string;
  notes: string;
  status: 'pendiente' | 'aceptada' | 'completada' | 'cancelada';
}

export interface Review {
  id: string;
  clienteId: string;
  clienteName: string;
  prestadorId: string;
  score: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

// Datos semilla realistas para Jalpan de Serra, Querétaro
// Coordenadas centrales de Jalpan: 21.2185, -99.4735
const SEED_PROFILES: Profile[] = [
  {
    id: 'p1',
    role: 'prestador',
    name: 'Juan Pérez Ramos',
    phone: '4411051234',
    bio: 'Plomero certificado con más de 12 años de experiencia. Reparación de fugas, tinacos, cisternas, instalaciones de gas y grifería en general. Servicio rápido y garantizado.',
    categories: ['plomería'],
    rate: 130,
    schedule: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
    lat: 21.2198,
    lng: -99.4725, // Cerca de la Plaza Principal
    rating: 4.8,
    reviewsCount: 15
  },
  {
    id: 'p2',
    role: 'prestador',
    name: 'María Rodríguez Castillo',
    phone: '4411129876',
    bio: 'Electricista residencial e industrial. Cortocircuitos, cableado estructurado, instalación de lámparas, ventiladores y centros de carga. Emergencias las 24 horas.',
    categories: ['electricidad'],
    rate: 160,
    schedule: 'Lunes a Viernes: 9:00 AM - 7:00 PM (Sábados Emergencias)',
    lat: 21.2220,
    lng: -99.4750, // Cerca del Barrio Capulines
    rating: 4.9,
    reviewsCount: 19
  },
  {
    id: 'p3',
    role: 'prestador',
    name: 'Carlos Mendoza Solís',
    phone: '4411084422',
    bio: 'Carpintero y ebanista artesanal. Fabricación y reparación de puertas, clósets, cocinas integrales y muebles rústicos. Restauración de piezas de madera fina.',
    categories: ['carpintería'],
    rate: 150,
    schedule: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    lat: 21.2150,
    lng: -99.4710, // Barrio de la Cruz
    rating: 4.7,
    reviewsCount: 10
  },
  {
    id: 'p4',
    role: 'prestador',
    name: 'Sofía Gómez Estrada',
    phone: '4411025599',
    bio: 'Cerrajera profesional. Apertura de cerraduras de casas y autos sin dañar. Duplicado de llaves de alta seguridad, instalación de chapas inteligentes y candados.',
    categories: ['cerrajería'],
    rate: 110,
    schedule: 'Servicio 24/7 disponible para emergencias',
    lat: 21.2250,
    lng: -99.4690, // Colonia El Panteón
    rating: 4.6,
    reviewsCount: 8
  },
  {
    id: 'p5',
    role: 'prestador',
    name: 'Pedro Torres Luna',
    phone: '4411153311',
    bio: 'Especialista en jardinería, paisajismo y control de plagas. Poda estética de árboles, mantenimiento de pasto, sistemas de riego e instalación de plantas de la región.',
    categories: ['jardinería'],
    rate: 95,
    schedule: 'Lunes a Sábado: 7:00 AM - 4:00 PM',
    lat: 21.2110,
    lng: -99.4780, // Rumbo a El Embocadero
    rating: 4.5,
    reviewsCount: 12
  },
  {
    id: 'p6',
    role: 'prestador',
    name: 'Ana Lilia Martínez Ruiz',
    phone: '4411067788',
    bio: 'Pintura residencial y comercial. Acabados finos, aplicación de impermeabilizantes para techos y fachadas, rotulación básica y restauración de muros húmedos.',
    categories: ['pintura'],
    rate: 120,
    schedule: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
    lat: 21.2215,
    lng: -99.4705, // Colonia El Lindero
    rating: 4.9,
    reviewsCount: 14
  }
];

const SEED_REVIEWS: Review[] = [
  {
    id: 'r1',
    clienteId: 'c1',
    clienteName: 'Alejandro Gutiérrez',
    prestadorId: 'p1',
    score: 5,
    comment: 'Excelente servicio. Llegó muy rápido y reparó la fuga del tinaco con herramientas profesionales. Muy recomendado en Jalpan.',
    date: '2026-05-10T14:30:00Z'
  },
  {
    id: 'r2',
    clienteId: 'c2',
    clienteName: 'Diana Laura Trejo',
    prestadorId: 'p1',
    score: 4,
    comment: 'Muy atento y limpio en su trabajo. Cobró lo justo por cambiar la llave de la cocina.',
    date: '2026-05-12T10:15:00Z'
  },
  {
    id: 'r3',
    clienteId: 'c1',
    clienteName: 'Alejandro Gutiérrez',
    prestadorId: 'p2',
    score: 5,
    comment: 'Instaló el centro de carga en mi negocio de forma impecable. Súper profesional y con altos estándares de seguridad.',
    date: '2026-05-15T18:00:00Z'
  },
  {
    id: 'r4',
    clienteId: 'c3',
    clienteName: 'Roberto Cabrera',
    prestadorId: 'p3',
    score: 5,
    comment: 'Carlos restauró una mesa de comedor antigua y quedó hermosa. Verdadero trabajo artesanal.',
    date: '2026-05-08T16:45:00Z'
  }
];

const SEED_CHATS: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'c1',
    receiverId: 'p1',
    content: 'Hola Juan, buenas tardes. ¿Tiene disponibilidad para revisar una fuga de agua en el centro?',
    timestamp: '2026-05-18T16:00:00.000Z'
  },
  {
    id: 'm2',
    senderId: 'p1',
    receiverId: 'c1',
    content: 'Hola buenas tardes. Sí claro, en unos 30 minutos me desocupo y puedo ir a revisar. ¿Me podría dar su dirección exacta?',
    timestamp: '2026-05-18T16:05:00.000Z'
  },
  {
    id: 'm3',
    senderId: 'c1',
    receiverId: 'p1',
    content: 'Claro, es en Calle Independencia #14, a media cuadra de la plaza. Lo espero, gracias.',
    timestamp: '2026-05-18T16:08:00.000Z'
  }
];

// Helper para calcular distancia en línea recta entre dos coordenadas (Haversine)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(2)); // Redondear a 2 decimales
}

// Inicializar localStorage si no existe
function initLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('b_profiles')) {
    localStorage.setItem('b_profiles', JSON.stringify(SEED_PROFILES));
  }
  if (!localStorage.getItem('b_reviews')) {
    localStorage.setItem('b_reviews', JSON.stringify(SEED_REVIEWS));
  }
  if (!localStorage.getItem('b_chats')) {
    localStorage.setItem('b_chats', JSON.stringify(SEED_CHATS));
  }
  if (!localStorage.getItem('b_appointments')) {
    localStorage.setItem('b_appointments', JSON.stringify([]));
  }
}

initLocalStorage();

// Interfaz pública unificada del adaptador de base de datos
export const db = {
  // --- PERFILES Y PRESTADORES ---
  async getProfiles(category?: string): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('profiles').select('*');
        if (category) {
          query = query.contains('categories', [category.toLowerCase()]);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data as Profile[];
      } catch (err) {
        console.error('Supabase error, usando localStorage:', err);
      }
    }
    
    // Fallback Local
    const local = localStorage.getItem('b_profiles');
    const profiles: Profile[] = local ? JSON.parse(local) : SEED_PROFILES;
    if (category) {
      return profiles.filter(p => 
        p.role === 'prestador' && 
        p.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
      );
    }
    return profiles.filter(p => p.role === 'prestador');
  },

  async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_profiles');
    const profiles: Profile[] = local ? JSON.parse(local) : SEED_PROFILES;
    return profiles.find(p => p.id === id) || null;
  },

  async saveProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(profile)
          .select()
          .single();
        if (!error && data) return data as Profile;
        throw error;
      } catch (err) {
        console.error('Supabase error al guardar perfil, usando localStorage:', err);
      }
    }

    const local = localStorage.getItem('b_profiles');
    const profiles: Profile[] = local ? JSON.parse(local) : SEED_PROFILES;
    
    const index = profiles.findIndex(p => p.id === profile.id);
    let updatedProfile: Profile;
    
    if (index >= 0) {
      updatedProfile = { ...profiles[index], ...profile } as Profile;
      profiles[index] = updatedProfile;
    } else {
      updatedProfile = {
        id: profile.id,
        role: profile.role || 'cliente',
        name: profile.name || 'Usuario',
        phone: profile.phone || '',
        bio: profile.bio || '',
        categories: profile.categories || [],
        rate: profile.rate || 0,
        schedule: profile.schedule || '',
        lat: profile.lat ?? 21.2185,
        lng: profile.lng ?? -99.4735,
        rating: profile.rating || 5.0,
        reviewsCount: profile.reviewsCount || 0
      };
      profiles.push(updatedProfile);
    }
    
    localStorage.setItem('b_profiles', JSON.stringify(profiles));
    return updatedProfile;
  },

  // --- REVISIONES / RATING ---
  async getReviews(prestadorId: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('ratings')
          .select('*')
          .eq('prestadorId', prestadorId)
          .order('date', { ascending: false });
        if (!error && data) return data as Review[];
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_reviews');
    const reviews: Review[] = local ? JSON.parse(local) : SEED_REVIEWS;
    return reviews.filter(r => r.prestadorId === prestadorId);
  },

  async createReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('ratings')
          .insert(newReview)
          .select()
          .single();
        if (!error && data) {
          await this.updateProfileStats(review.prestadorId);
          return data as Review;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_reviews');
    const reviews: Review[] = local ? JSON.parse(local) : SEED_REVIEWS;
    reviews.unshift(newReview);
    localStorage.setItem('b_reviews', JSON.stringify(reviews));

    // Actualizar estadísticas de calificación en perfil local
    await this.updateProfileStats(review.prestadorId);
    
    return newReview;
  },

  async updateProfileStats(prestadorId: string) {
    const reviews = await this.getReviews(prestadorId);
    const count = reviews.length;
    const avg = count > 0 
      ? parseFloat((reviews.reduce((acc, r) => acc + r.score, 0) / count).toFixed(1))
      : 5.0;

    await this.saveProfile({
      id: prestadorId,
      rating: avg,
      reviewsCount: count
    });
  },

  // --- CITAS (APPOINTMENTS) ---
  async getAppointments(userId: string, role: 'cliente' | 'prestador'): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const field = role === 'cliente' ? 'clienteId' : 'prestadorId';
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq(field, userId)
          .order('date', { ascending: true });
        if (!error && data) return data as Appointment[];
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_appointments');
    const appointments: Appointment[] = local ? JSON.parse(local) : [];
    return appointments.filter(a => 
      role === 'cliente' ? a.clienteId === userId : a.prestadorId === userId
    );
  },

  async createAppointment(appt: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> {
    const newAppt: Appointment = {
      ...appt,
      id: 'apt_' + Math.random().toString(36).substr(2, 9),
      status: 'pendiente'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert(newAppt)
          .select()
          .single();
        if (!error && data) return data as Appointment;
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_appointments');
    const appointments: Appointment[] = local ? JSON.parse(local) : [];
    appointments.push(newAppt);
    localStorage.setItem('b_appointments', JSON.stringify(appointments));
    return newAppt;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('appointments').update({ status }).eq('id', id);
        return;
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_appointments');
    const appointments: Appointment[] = local ? JSON.parse(local) : [];
    const index = appointments.findIndex(a => a.id === id);
    if (index >= 0) {
      appointments[index].status = status;
      localStorage.setItem('b_appointments', JSON.stringify(appointments));
    }
  },

  // --- CHAT Y MENSAJERÍA ---
  async getChats(userId1: string, userId2: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .or(`and(senderId.eq.${userId1},receiverId.eq.${userId2}),and(senderId.eq.${userId2},receiverId.eq.${userId1})`)
          .order('timestamp', { ascending: true });
        if (!error && data) return data as ChatMessage[];
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_chats');
    const chats: ChatMessage[] = local ? JSON.parse(local) : SEED_CHATS;
    return chats.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async sendChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chats')
          .insert(newMsg)
          .select()
          .single();
        if (!error && data) return data as ChatMessage;
      } catch (err) {
        console.error(err);
      }
    }

    const local = localStorage.getItem('b_chats');
    const chats: ChatMessage[] = local ? JSON.parse(local) : SEED_CHATS;
    chats.push(newMsg);
    localStorage.setItem('b_chats', JSON.stringify(chats));
    return newMsg;
  },

  async getChatContacts(userId: string): Promise<Profile[]> {
    const localChats = localStorage.getItem('b_chats');
    const chats: ChatMessage[] = localChats ? JSON.parse(localChats) : SEED_CHATS;
    
    // Obtener IDs de usuarios con los que se tiene chat
    const contactIds = new Set<string>();
    chats.forEach(m => {
      if (m.senderId === userId) contactIds.add(m.receiverId);
      if (m.receiverId === userId) contactIds.add(m.senderId);
    });

    const profilesList = await Promise.all(
      Array.from(contactIds).map(id => this.getProfileById(id))
    );

    return profilesList.filter((p): p is Profile => p !== null);
  }
};
