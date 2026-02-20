
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function checkPolicies() {
    console.log('--- CHECKING RLS POLICIES ---');
    // We can use rpc if available, or try to query pg_policies using service_role
    // Note: service_role might not have permissions to pg_catalog depending on Supabase settings.
    // But we can try.
    const { data, error } = await supabase.rpc('get_policies'); // If such function exists

    if (error) {
        console.log('RPC get_policies failed, trying raw query via pg_policies...');
        // Supabase doesn't allow raw SQL via client. 
        // I'll try to just check if RLS is enabled using a dummy select.
        const { data: testData, error: testError } = await supabase.from('empreendimentos').select('count', { count: 'exact', head: true });
        console.log('Count from Empreendimentos (Service Role):', testData, testError);
    } else {
        console.log('Policies:', data);
    }
}
checkPolicies();
