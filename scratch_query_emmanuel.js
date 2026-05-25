import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function run() {
  const joseMvaId = 'c1510fe2-2b7e-498d-a360-a283a1deaff9';
  console.log('Consultando JoseMva en Supabase...');
  const { data: joseMva, error: err1 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', joseMvaId);
    
  console.log('Resultado de JoseMva en base de datos:', joseMva, err1);

  console.log('Consultando todos los perfiles...');
  const { data: allProfiles, error: err2 } = await supabase
    .from('profiles')
    .select('id, name, role, is_active');
    
  console.log('Todos los perfiles en la base de datos:', allProfiles, err2);
}

run();
