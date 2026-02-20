
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function setupLock() {
    console.log('--- SETTING UP DATABASE INSTANCE LOCK ---');

    console.log('Checking system_settings table...');
    const { error: alterError } = await supabase.rpc('execute_sql', {
        query: "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS db_instance_id TEXT;"
    });

    if (alterError) {
        console.log('RPC execute_sql failed (expected on some setups). Trying simple update if column exists...');
    }

    // Upsert the instance ID
    console.log('Setting instance ID to cmi_crm_prod...');
    const { error: upsertError } = await supabase
        .from('system_settings')
        .upsert({
            id: '11111111-1111-1111-1111-111111111111', // Assuming a static ID for global settings or we find the one
            db_instance_id: 'cmi_crm_prod'
        }, { onConflict: 'id' });

    if (upsertError) {
        console.error('Error upserting instance ID:', upsertError.message);
        // Let's try to just update any record
        await supabase.from('system_settings').update({ db_instance_id: 'cmi_crm_prod' }).not('id', 'is', null);
    }

    console.log('Instance ID set successfully.');
}
setupLock();
