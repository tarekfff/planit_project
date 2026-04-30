const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('establishments').select('working_hours').eq('id', 'cfdc7eae-207c-4d79-8305-f28dec0775d2').single();
  console.log(JSON.stringify(data, null, 2));
}
run();
