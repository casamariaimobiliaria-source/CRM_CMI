
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function deepRLSCheck() {
    console.log('--- DEEP RLS AUDIT ---');

    // We can try to use a raw query if we have an RPC that allows it, or check table settings via standard queries
    // Usually, we can't do raw SQL via JS client. 
    // But we can check if a selection with a FAKE user ID works or fails.

    console.log('Testing access with Service Role...');
    const { data: eK } = await supabase.from('empreendimentos').select('count');
    console.log('Service Role Access: OK, Count:', eK);

    // Let's check table info if we can
    const { data: info, error: infoErr } = await supabase.rpc('get_table_info', { tname: 'empreendimentos' });
    if (infoErr) {
        console.log('No get_table_info RPC. Trying to infer RLS by checking policies via common names...');
        // I'll try to use a script that uses the "anon" key to see if it returns anything.
    } else {
        console.log('Table Info:', info);
    }
}
deepRLSCheck();
