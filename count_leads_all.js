
import { createClient } from '@supabase/supabase-js';

const projects = [
    { name: 'kdhq...', url: 'https://kdhqzubnffuqblvhhypz.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A' },
    { name: 'gjdk...', url: 'https://gjdkbbiehsyyfpsgnadm.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwMDc2MiwiZXhwIjoyMDg0NzYwNzYyfQ.4Xv-_X-G-G-X_G_X_G_X_G_X_G_X_G_X_G_X_G_X_G' } // Need a service key for gjdk as well to be sure
];

// Note: The gjdk key above is a placeholder based on the ref. I need the real one if it exists.
// Let's try to find if there is another key for gjdk.
// I'll check debug_supabase.js again for the key it used.
