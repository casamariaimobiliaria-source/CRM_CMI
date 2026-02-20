
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16'; // Casa Maria Imóveis
const SOURCE_ORG_ID = '60246bae-58d7-4294-987d-184600b7342e'; // Imobiliária Principal

async function restore() {
    console.log(`Starting restoration in project kdhq... targetting org ${TARGET_ORG_ID}`);

    // 1. Move Leads
    const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .update({ organization_id: TARGET_ORG_ID })
        .eq('organization_id', SOURCE_ORG_ID);

    if (leadError) {
        console.error('Error moving leads:', leadError);
    } else {
        console.log('Successfully moved leads from source org to target org.');
    }

    // 2. Re-verify leads that might have null organization_id (if any)
    const { data: nullLeads, error: nullError } = await supabase
        .from('leads')
        .update({ organization_id: TARGET_ORG_ID })
        .is('organization_id', null);

    if (!nullError) console.log('Fixed leads with null organization_id.');

    // 3. Ensure users are in target org members (just in case they were removed or moved)
    const userEmails = [
        'casamariaimobiliaria@gmail.com',
        'nubiatelesimoveis@gmail.com',
        'mssalgado1418@gmail.com',
        'yasminfonteles19@gmail.com',
        'ori@gmail.com.br'
    ];

    console.log('Reconciling users...');
    for (const email of userEmails) {
        // Find user by email
        const { data: userData } = await supabase.from('users').select('id, name, role').eq('email', email).single();
        if (userData) {
            console.log(`Processing user: ${userData.name} (${email})`);

            // Update user's organization_id in public.users
            await supabase.from('users').update({ organization_id: TARGET_ORG_ID }).eq('id', userData.id);

            // Upsert into organization_members
            await supabase.from('organization_members').upsert({
                organization_id: TARGET_ORG_ID,
                user_id: userData.id,
                role: userData.role === 'admin' || userData.role === 'owner' ? 'admin' : 'member'
            }, { onConflict: 'organization_id,user_id' });
        }
    }

    console.log('Restoration complete.');
}

restore();
