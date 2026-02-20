
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function listOrigins() {
    console.log('--- LISTING ORIGINS IN KDHQ ---');
    const { data: origins, error } = await supabase
        .from('origens_lead')
        .select('*')
        .eq('organization_id', TARGET_ORG);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${origins.length} origins:`);
    origins.forEach(o => {
        console.log(`- ${o.nome} | ID: ${o.id}`);
    });
}
listOrigins();
