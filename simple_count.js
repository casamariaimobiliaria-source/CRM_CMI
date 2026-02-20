
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://kdhqzubnffuqblvhhypz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A');
async function check() {
    const orgId = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';
    const { count: leads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);
    const { count: members } = await supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', orgId);
    console.log('COUNT_LEADS:' + leads);
    console.log('COUNT_MEMBERS:' + members);
}
check();
