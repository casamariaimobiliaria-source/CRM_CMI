
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

const CORRECT_ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16'; // Casa Maria Imóveis
const USERS_TO_FIX = [
    '56d73b1e-2345-4344-a6f1-4a870a7592d5', // Admin
    '9a59b320-d07f-446f-927b-225d604debfb'  // Nubia
];

async function runFix() {
    console.log('--- STARTING DATABASE FIX ---');

    for (const userId of USERS_TO_FIX) {
        console.log(`Updating organization_id for user ${userId} to ${CORRECT_ORG_ID}...`);
        const { error } = await supabase
            .from('users')
            .update({ organization_id: CORRECT_ORG_ID })
            .eq('id', userId);

        if (error) {
            console.error(`Error updating user ${userId}:`, error);
        } else {
            console.log(`User ${userId} updated successfully.`);
        }
    }

    console.log('--- DATABASE FIX COMPLETED ---');
}

runFix();
