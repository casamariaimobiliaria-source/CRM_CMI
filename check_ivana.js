
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

const IVANA_ID = '701d27ba-aa9a-4bd5-b6a0-331e21b45299';

async function checkIvana() {
    console.log(`--- CHECKING IVANA LEADS ---`);
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', IVANA_ID).single();

    if (error) {
        console.error('Error:', error.message);
        // Maybe ID changed? Let's search by name
        const { data: search } = await supabase.from('leads').select('*').ilike('nome', '%Ivana%');
        console.log('Search by name found:', search);
    } else {
        console.log('Ivana Lead found:', lead);
    }
}
checkIvana();
