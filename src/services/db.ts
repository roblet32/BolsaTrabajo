import { supabase, isSupabaseConfigured, withTimeout } from './supabaseClient';

export interface Profile {
  id: string;
  role: 'prestador' | 'cliente' | 'admin';
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
  isActive?: boolean;
  email?: string;
  workPhotos?: string[];
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

// Datos semilla vacíos para producción (100% datos reales registrados)
const SEED_PROFILES: Profile[] = [];
const SEED_REVIEWS: Review[] = [];
const SEED_CHATS: ChatMessage[] = [];

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

// Mapeadores para traducir entre el modelo de TypeScript (camelCase) y la Base de Datos (snake_case)
function mapProfileFromDb(data: any): Profile {
  return {
    id: data.id,
    role: data.role,
    name: data.name,
    phone: data.phone || '',
    bio: data.bio || '',
    categories: data.categories || [],
    rate: Number(data.rate || 0),
    schedule: data.schedule || '',
    lat: Number(data.lat ?? 21.2185),
    lng: Number(data.lng ?? -99.4735),
    rating: Number(data.rating ?? 5.0),
    reviewsCount: Number(data.reviews_count ?? 0),
    isActive: data.is_active ?? true,
    email: data.email || '',
    workPhotos: data.work_photos || []
  };
}

function mapProfileToDb(profile: Partial<Profile>): any {
  const data: any = { ...profile };
  if ('reviewsCount' in data) {
    data.reviews_count = data.reviewsCount;
    delete data.reviewsCount;
  }
  if ('isActive' in data) {
    data.is_active = data.isActive;
    delete data.isActive;
  }
  if ('workPhotos' in data) {
    data.work_photos = data.workPhotos;
    delete data.workPhotos;
  }
  return data;
}

function mapAppointmentFromDb(data: any): Appointment {
  return {
    id: data.id,
    clienteId: data.cliente_id,
    clienteName: data.cliente_name,
    prestadorId: data.prestador_id,
    prestadorName: data.prestador_name,
    date: data.date,
    time: data.time,
    notes: data.notes || '',
    status: data.status
  };
}

function mapAppointmentToDb(appt: Partial<Appointment>): any {
  const data: any = { ...appt };
  if ('clienteId' in data) {
    data.cliente_id = data.clienteId;
    delete data.clienteId;
  }
  if ('clienteName' in data) {
    data.cliente_name = data.clienteName;
    delete data.clienteName;
  }
  if ('prestadorId' in data) {
    data.prestador_id = data.prestadorId;
    delete data.prestadorId;
  }
  if ('prestadorName' in data) {
    data.prestador_name = data.prestadorName;
    delete data.prestadorName;
  }
  return data;
}

function mapReviewFromDb(data: any): Review {
  return {
    id: data.id,
    clienteId: data.cliente_id,
    clienteName: data.cliente_name,
    prestadorId: data.prestador_id,
    score: data.score,
    comment: data.comment,
    date: data.date
  };
}

function mapReviewToDb(review: Partial<Review>): any {
  const data: any = { ...review };
  if ('clienteId' in data) {
    data.cliente_id = data.clienteId;
    delete data.clienteId;
  }
  if ('clienteName' in data) {
    data.cliente_name = data.clienteName;
    delete data.clienteName;
  }
  if ('prestadorId' in data) {
    data.prestador_id = data.prestadorId;
    delete data.prestadorId;
  }
  return data;
}

function mapChatMessageFromDb(data: any): ChatMessage {
  return {
    id: data.id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    content: data.content,
    timestamp: data.timestamp
  };
}

function mapChatMessageToDb(msg: Partial<ChatMessage>): any {
  const data: any = { ...msg };
  if ('senderId' in data) {
    data.sender_id = data.senderId;
    delete data.senderId;
  }
  if ('receiverId' in data) {
    data.receiver_id = data.receiverId;
    delete data.receiverId;
  }
  return data;
}

// Interfaz pública unificada del adaptador de base de datos
export const db = {
  // --- PERFILES Y PRESTADORES ---
  async getProfiles(category?: string): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('profiles').select('*').eq('is_active', true);
        if (category) {
          query = query.contains('categories', [category.toLowerCase()]);
        }
        const { data, error } = await withTimeout(query, 2500);
        if (error) throw error;
        return (data as any[]).map(mapProfileFromDb);
      } catch (err) {
        console.error('Supabase error, usando localStorage:', err);
      }
    }
    
    // Fallback Local
    const local = localStorage.getItem('b_profiles');
    const profiles: Profile[] = local ? JSON.parse(local) : SEED_PROFILES;
    const activeProfiles = profiles.filter(p => p.isActive !== false);
    if (category) {
      return activeProfiles.filter(p => 
        p.role === 'prestador' && 
        p.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
      );
    }
    return activeProfiles.filter(p => p.role === 'prestador');
  },

  async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('profiles').select('*').eq('id', id).single(), 2500);
        if (!error && data) return mapProfileFromDb(data);
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
        const { data, error } = await withTimeout(supabase
          .from('profiles')
          .upsert(mapProfileToDb(profile))
          .select()
          .single(), 2500);
        if (!error && data) return mapProfileFromDb(data);
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
        reviewsCount: profile.reviewsCount || 0,
        workPhotos: profile.workPhotos || []
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
        const { data, error } = await withTimeout(supabase
          .from('ratings')
          .select('*')
          .eq('prestador_id', prestadorId)
          .order('date', { ascending: false }), 2500);
        if (!error && data) return (data as any[]).map(mapReviewFromDb);
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
        const { data, error } = await withTimeout(supabase
          .from('ratings')
          .insert(mapReviewToDb(newReview))
          .select()
          .single(), 2500);
        if (!error && data) {
          await this.updateProfileStats(review.prestadorId);
          return mapReviewFromDb(data);
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
        const field = role === 'cliente' ? 'cliente_id' : 'prestador_id';
        const { data, error } = await withTimeout(supabase
          .from('appointments')
          .select('*')
          .eq(field, userId)
          .order('date', { ascending: true }), 2500);
        if (!error && data) return (data as any[]).map(mapAppointmentFromDb);
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
        const { data, error } = await withTimeout(supabase
          .from('appointments')
          .insert(mapAppointmentToDb(newAppt))
          .select()
          .single(), 2500);
        if (!error && data) return mapAppointmentFromDb(data);
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
        await withTimeout(supabase.from('appointments').update({ status }).eq('id', id), 2500);
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
        const { data, error } = await withTimeout(supabase
          .from('chats')
          .select('*')
          .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
          .order('timestamp', { ascending: true }), 2500);
        if (!error && data) return (data as any[]).map(mapChatMessageFromDb);
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
        const { data, error } = await withTimeout(supabase
          .from('chats')
          .insert(mapChatMessageToDb(newMsg))
          .select()
          .single(), 2500);
        if (!error && data) return mapChatMessageFromDb(data);
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
  },

  // --- MÉTODOS DE SUPER ADMIN (MODERACIÓN Y CONTROL GLOBAL) ---
  async adminGetAllProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('profiles').select('*').order('name', { ascending: true }), 2500);
        if (error) throw error;
        return (data as any[]).map(mapProfileFromDb);
      } catch (err) {
        console.error('Supabase adminGetAllProfiles error:', err);
      }
    }
    
    const local = localStorage.getItem('b_profiles');
    return local ? JSON.parse(local) : SEED_PROFILES;
  },

  async adminGetAllReviews(): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('ratings').select('*').order('date', { ascending: false }), 2500);
        if (error) throw error;
        return (data as any[]).map(mapReviewFromDb);
      } catch (err) {
        console.error('Supabase adminGetAllReviews error:', err);
      }
    }
    
    const local = localStorage.getItem('b_reviews');
    return local ? JSON.parse(local) : SEED_REVIEWS;
  },

  async adminGetAllAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('appointments').select('*').order('date', { ascending: false }), 2500);
        if (error) throw error;
        return (data as any[]).map(mapAppointmentFromDb);
      } catch (err) {
        console.error('Supabase adminGetAllAppointments error:', err);
      }
    }
    
    const local = localStorage.getItem('b_appointments');
    return local ? JSON.parse(local) : [];
  },

  async adminDeleteProfile(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        // En Supabase real, al borrar el perfil en la tabla profiles de forma directa o desde auth,
        // depende de si está en cascade. Si borramos en public.profiles, se borrará gracias a cascade.
        const { error } = await withTimeout(supabase.from('profiles').delete().eq('id', id), 2500);
        if (error) throw error;
        return;
      } catch (err) {
        console.error('Supabase adminDeleteProfile error:', err);
      }
    }

    const local = localStorage.getItem('b_profiles');
    if (local) {
      const profiles: Profile[] = JSON.parse(local);
      const filtered = profiles.filter(p => p.id !== id);
      localStorage.setItem('b_profiles', JSON.stringify(filtered));
    }
  },

  async adminToggleProfileActive(id: string, active: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await withTimeout(supabase.from('profiles').update({ is_active: active }).eq('id', id), 2500);
        if (error) throw error;
        return;
      } catch (err) {
        console.error('Supabase adminToggleProfileActive error:', err);
      }
    }

    const local = localStorage.getItem('b_profiles');
    if (local) {
      const profiles: Profile[] = JSON.parse(local);
      const index = profiles.findIndex(p => p.id === id);
      if (index >= 0) {
        profiles[index].isActive = active;
        localStorage.setItem('b_profiles', JSON.stringify(profiles));
      }
    }
  },

  async adminDeleteReview(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Buscar primero de qué prestador es la reseña para actualizar estadísticas
        const { data: reviewData } = await withTimeout(supabase.from('ratings').select('prestador_id').eq('id', id).single(), 2500);
        const { error } = await withTimeout(supabase.from('ratings').delete().eq('id', id), 2500);
        if (error) throw error;

        if (reviewData?.prestador_id) {
          await this.updateProfileStats(reviewData.prestador_id);
        }
        return;
      } catch (err) {
        console.error('Supabase adminDeleteReview error:', err);
      }
    }

    const local = localStorage.getItem('b_reviews');
    if (local) {
      const reviews: Review[] = JSON.parse(local);
      const review = reviews.find(r => r.id === id);
      const filtered = reviews.filter(r => r.id !== id);
      localStorage.setItem('b_reviews', JSON.stringify(filtered));

      if (review) {
        await this.updateProfileStats(review.prestadorId);
      }
    }
  },

  async adminDeleteAppointment(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await withTimeout(supabase.from('appointments').delete().eq('id', id), 2500);
        if (error) throw error;
        return;
      } catch (err) {
        console.error('Supabase adminDeleteAppointment error:', err);
      }
    }

    const local = localStorage.getItem('b_appointments');
    if (local) {
      const appointments: Appointment[] = JSON.parse(local);
      const filtered = appointments.filter(a => a.id !== id);
      localStorage.setItem('b_appointments', JSON.stringify(filtered));
    }
  }
};
