import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno desde el archivo .env
const envContent = fs.readFileSync('.env', 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Credenciales de Supabase no encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const emmanuelId = '6eabdb0f-9d2e-4e30-90c8-fc0efb860f21';
  console.log(`Iniciando actualización para Emmanuel (ID: ${emmanuelId}) en Supabase...`);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'cliente' })
    .eq('id', emmanuelId)
    .select();

  if (error) {
    console.error('Error al actualizar el perfil en la base de datos:', error);
    process.exit(1);
  }

  console.log('¡Éxito! El rol ha sido cambiado de "admin" a "cliente" correctamente en Supabase:', data);
}

run();
