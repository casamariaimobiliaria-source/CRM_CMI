
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function verifyFinal() {
    console.log('--- FINAL REPAIR VERIFICATION ---');

    const leadsToTest = ['Julia Martins - SDR', 'Evandro Ribeiro -SDR', 'Walkiria Bianca - SDR'];

    for (const name of leadsToTest) {
        const { data, error } = await supabase
            .from('leads')
            .select('nome, corretor, empreendimento_id, origem_id')
            .ilike('nome', `%${name}%`);

        if (data && data.length > 0) {
            console.log(`Lead: ${data[0].nome}`);
            console.log(`  - Corretor: ${data[0].corretor}`);
            console.log(`  - Empreendimento ID: ${data[0].empreendimento_id}`);
            console.log(`  - Origem ID: ${data[0].origem_id}`);
        } else {
            console.log(`Lead ${name} NOT found.`);
        }
        console.log('-------------------');
    }
}
verifyFinal();
