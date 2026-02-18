
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    // Pegar o organization_id de um lead existente para testar
    const { data: leads } = await supabase.from('leads').select('organization_id').limit(1);
    const orgId = leads?.[0]?.organization_id;
    console.log('Testing with Org ID:', orgId);

    if (!orgId) {
        console.log('No organization_id found in leads.');
        return;
    }

    const { data: enterprises, error: entError } = await supabase
        .from('enterprises')
        .select('id, name')
        .eq('organization_id', orgId);

    console.log('Enterprises count:', enterprises?.length || 0);
    console.log('Enterprises (first 2):', enterprises?.slice(0, 2));
    if (entError) console.error('Ent Error:', entError);

    const { data: sources, error: srcError } = await supabase
        .from('lead_sources')
        .select('id, name')
        .eq('organization_id', orgId);

    console.log('Sources count:', sources?.length || 0);
    console.log('Sources (first 2):', sources?.slice(0, 2));
    if (srcError) console.error('Src Error:', srcError);
}

debug();
