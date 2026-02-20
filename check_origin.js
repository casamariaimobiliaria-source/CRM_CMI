
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

const ORIGEM_ID = '8b4f9716-e977-420a-94fb-42b0a506600a';

async function checkOrigin() {
    console.log(`--- CHECKING ORIGIN ${ORIGEM_ID} ---`);
    const { data: origin, error } = await supabase.from('origens_lead').select('*').eq('id', ORIGEM_ID).single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Origin Details:', origin);
}
checkOrigin();
