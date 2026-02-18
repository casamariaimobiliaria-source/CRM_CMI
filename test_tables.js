
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const { data, error } = await supabase.from('leads').select('*').limit(0);
    console.log('Test lead query:', data, error);

    // Infelizmente o supabase-js não tem um método direto para listar tabelas via cliente JS facilmente sem RPC ou OpenAPI.
    // Mas podemos tentar inferir pelo erro de uma tabela que não existe.
    const { error: err1 } = await supabase.from('empreendimentos').select('*').limit(1);
    console.log('empreendimentos error:', err1?.message);

    const { error: err2 } = await supabase.from('enterprises').select('*').limit(1);
    console.log('enterprises error:', err2?.message);
}

listTables();
