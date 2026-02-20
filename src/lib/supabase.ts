import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdhqzubnffuqblvhhypz.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Instance Lock Protection
export const EXPECTED_INSTANCE_ID = import.meta.env.VITE_DB_INSTANCE_ID || 'cmi_crm_prod';

export async function validateDatabaseInstance() {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('db_instance_id')
            .limit(1)
            .maybeSingle();

        if (error) {
            console.warn('Instance Check Warning:', error.message);
            return true; // Don't block if table doesn't have the column yet
        }

        if (!data || !data.db_instance_id) {
            console.warn('Instance ID not found in database settings.');
            return true;
        }

        if (data.db_instance_id !== EXPECTED_INSTANCE_ID) {
            console.error(`DATABASE MISMATCH! APP: ${EXPECTED_INSTANCE_ID} | DB: ${data.db_instance_id}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Failed to verify instance:', err);
        return true;
    }
}
