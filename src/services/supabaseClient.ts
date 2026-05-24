import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno de Vite
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validar que existan las credenciales. Si no existen, exportar null.
// El adaptador de base de datos manejará el fallback a LocalStorage automáticamente.
export const isSupabaseConfigured = 
  supabaseUrl.length > 0 && 
  supabaseAnonKey.length > 0 && 
  (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Envuelve una promesa en un límite de tiempo para evitar bloqueos infinitos
 * si las credenciales son incorrectas o la red está colgada.
 */
export const withTimeout = <T>(promise: Promise<T> | PromiseLike<T> | T, timeoutMs: number = 2500): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TypeError('Timeout de conexión con Supabase'));
    }, timeoutMs);
    
    Promise.resolve(promise)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

