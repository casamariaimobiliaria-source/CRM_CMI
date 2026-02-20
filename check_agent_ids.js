
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeals() {
    console.log('--- CHECKING DEALS AND SALES ---');
    const { data: deals } = await supabase.from('deals').select('agent_id');
    const { data: sales } = await supabase.from('sales').select('agent_id');

    const ids = new Set();
    deals?.forEach(d => { if (d.agent_id) ids.add(d.agent_id); });
    sales?.forEach(s => { if (s.agent_id) ids.add(s.agent_id); });

    console.log('Unique Agent IDs found:', Array.from(ids));
}
checkDeals();
