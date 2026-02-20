
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgents() {
    console.log('--- AGENTS TABLE ---');
    const { data: agents, error } = await supabase.from('agents').select('*');
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    console.log(`Agents found: ${agents.length}`);
    agents.forEach(a => {
        console.log(` - ${a.name || a.nome} | Org: ${a.organization_id}`);
    });
}
checkAgents();
