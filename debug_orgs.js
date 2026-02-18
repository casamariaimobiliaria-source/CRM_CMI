
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- ORGANIZATIONS ---');
    const { data: orgs } = await supabase.from('organizations').select('*');
    console.log(orgs);

    console.log('--- ENTERPRISES (NO FILTER) ---');
    const { data: ents } = await supabase.from('enterprises').select('id, name, organization_id').limit(5);
    console.log(ents);

    console.log('--- LEAD SOURCES (NO FILTER) ---');
    const { data: srcs } = await supabase.from('lead_sources').select('id, name, organization_id').limit(5);
    console.log(srcs);
}

debug();
