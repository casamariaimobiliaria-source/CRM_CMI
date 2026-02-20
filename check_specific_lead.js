
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

const LEAD_ID = '15afa496-6b97-4055-b0f6-c3f860240e85';

async function checkLead() {
    console.log(`--- CHECKING LEAD ${LEAD_ID} ---`);
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', LEAD_ID).single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Lead Details:', lead);
    console.log('Organization ID:', lead.organization_id);
    console.log('Empreendimento ID:', lead.empreendimento_id);
    console.log('Origem ID:', lead.origem_id);
}
checkLead();
