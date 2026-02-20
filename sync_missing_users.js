
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

const CORRECT_ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16'; // Casa Maria Imóveis

const USERS_TO_SYNC = [
    {
        id: 'c17bd0f1-d8e8-4973-b4aa-b17b1e9e9ca7',
        name: 'Nicholas',
        email: 'mssalgado1418@gmail.com',
        role: 'member'
    },
    {
        id: '2eed73ae-41ea-48a4-8953-d5136c0664d4',
        name: 'SDR Yasmin',
        email: 'yasminfonteles19@gmail.com',
        role: 'member'
    },
    {
        id: '07fd0307-4c29-4c70-a61b-0ebfdc9a1ca1',
        name: 'Orivaldo Garcia',
        email: 'ori@gmail.com.br',
        role: 'member'
    }
];

async function syncUsers() {
    console.log('--- STARTING SYNC OF MISSING USERS ---');

    for (const user of USERS_TO_SYNC) {
        console.log(`Processing ${user.name} (${user.email})...`);

        // 1. Upsert into users table
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization_id: CORRECT_ORG_ID
            });

        if (userError) {
            console.error(`Error upserting user ${user.name}:`, userError.message);
        } else {
            console.log(`User ${user.name} upserted to users table.`);
        }

        // 2. Insert into organization_members table
        const { error: memberError } = await supabase
            .from('organization_members')
            .upsert({
                organization_id: CORRECT_ORG_ID,
                user_id: user.id,
                role: user.role
            }, { onConflict: 'organization_id,user_id' });

        if (memberError) {
            console.error(`Error adding ${user.name} to org members:`, memberError.message);
        } else {
            console.log(`User ${user.name} added to organization_members.`);
        }
    }

    console.log('--- SYNC COMPLETED ---');
}

syncUsers();
