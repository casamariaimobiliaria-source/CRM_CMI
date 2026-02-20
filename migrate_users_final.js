
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const TARGET_URL = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const TARGET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const targetSupabase = createClient(TARGET_URL, TARGET_KEY);

const TARGET_ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16'; // Casa Maria Imóveis

async function migrate() {
    console.log('--- MIGRATING USERS TO KDHQ (CMI) ---');

    const exportData = JSON.parse(fs.readFileSync('GJDK_EXPORT.json', 'utf8'));

    for (const authUser of exportData.auth) {
        const email = authUser.email;
        const profile = exportData.profiles.find(p => p.email === email || p.id === authUser.id);

        console.log(`Processing: ${email} (${profile?.name || 'Unknown'})`);

        // 1. Check if user already exists in target kdhq
        const { data: existingUsers } = await targetSupabase.from('users').select('id').eq('email', email);

        let targetUserId;

        if (existingUsers && existingUsers.length > 0) {
            console.log(`- User ${email} already exists in target DB. Skipping Auth creation.`);
            targetUserId = existingUsers[0].id;
        } else {
            // 2. Create in Auth (Admin API)
            const { data: newAuth, error: authError } = await targetSupabase.auth.admin.createUser({
                email: email,
                email_confirm: true,
                user_metadata: authUser.user_metadata || {},
                password: 'InitialPassword123!'
            });

            if (authError) {
                console.error(`- Auth Error for ${email}:`, authError.message);
                const { data: listAll } = await targetSupabase.auth.admin.listUsers();
                const found = listAll.users.find(u => u.email === email);
                if (found) targetUserId = found.id;
            } else {
                console.log(`- Created Auth user: ${newAuth.user.id}`);
                targetUserId = newAuth.user.id;
            }
        }

        if (targetUserId) {
            // 3. Sync Public Profile
            const { error: profileError } = await targetSupabase.from('users').upsert({
                id: targetUserId,
                email: email,
                name: profile?.name || authUser.user_metadata?.name || 'User',
                role: profile?.role || 'member',
                organization_id: TARGET_ORG_ID,
                phone: profile?.phone || authUser.user_metadata?.phone || null
            });

            if (profileError) console.error(`- Profile Error for ${email}:`, profileError.message);
            else console.log(`- Synced Profile for ${email}`);

            // 4. Upsert Org Membership
            await targetSupabase.from('organization_members').upsert({
                organization_id: TARGET_ORG_ID,
                user_id: targetUserId,
                role: (profile?.role === 'admin' || profile?.role === 'owner') ? profile.role : 'member'
            });
            console.log(`- Assigned to Org ${TARGET_ORG_ID}`);
        }
        console.log('---');
    }

    console.log('Migration complete.');
}

migrate();
