
import { createClient } from '@supabase/supabase-js';

const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function searchJulia() {
    console.log('--- SEARCHING JULIA IN GJDK ---');
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .ilike('nome', '%Julia Martins%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (leads && leads.length > 0) {
        console.log('Found results in GJDK:');
        leads.forEach(l => {
            console.log(`Lead: ${l.nome} | ID: ${l.id}`);
            console.log(`  - Corretor: ${l.corretor}`);
            console.log(`  - Empreendimento Name: ${l.empreendimento}`);
            console.log(`  - Empreendimento ID: ${l.empreendimento_id}`);
            console.log(`  - Origem ID: ${l.origem_id}`);
            console.log('-------------------');
        });
    } else {
        console.log('Julia Martins not found in GJDK.');
    }
}
searchJulia();
