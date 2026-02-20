
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function checkJuliaKDHQ() {
    console.log('--- CHECKING JULIA IN KDHQ ---');
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .ilike('nome', '%Julia Martins%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (leads && leads.length > 0) {
        console.log('Found in KDHQ:');
        leads.forEach(l => {
            console.log(JSON.stringify(l, null, 2));
        });
    } else {
        console.log('Julia Martins not found in KDHQ.');
    }
}
checkJuliaKDHQ();
