
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function applyLock() {
    console.log('--- APPLYING DATABASE INSTANCE LOCK ---');

    // 1. Add column if it doesn't exist (using RPC or SQL-like approach if possible, but JS client can't do DDL easily)
    // Since I don't have direct SQL access through the client, I hope the user has an SQL editor or I'll try to use a dummy query to check
    // Wait, with Service Role I can try to use a trick if the DB has certain extensions, but usually I need SQL.
    // However, I can try to update a record and if it fails due to "column doesn't exist", I can't really "add" it via JS client alone 
    // UNLESS there is an RPC defined.

    console.log('Step 1: Tagging the database record...');
    const { error } = await supabase
        .from('system_settings')
        .update({ db_instance_id: 'cmi_crm_prod' })
        .eq('id', 'global');

    if (error) {
        if (error.message.includes('column "db_instance_id" of relation "system_settings" does not exist')) {
            console.error('CRITICAL: Column "db_instance_id" does not exist in system_settings table.');
            console.log('Please run this SQL in your Supabase SQL Editor:');
            console.log('ALTER TABLE system_settings ADD COLUMN db_instance_id TEXT;');
        } else {
            console.error('Error tagging DB:', error.message);
        }
    } else {
        console.log('SUCCESS: Database tagged with cmi_crm_prod');
    }
}

applyLock();
