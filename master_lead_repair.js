
import { createClient } from '@supabase/supabase-js';

// KDHQ (Target - CMI)
const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

// GJDK (Source - Older DB)
const gjdkUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const gjdkKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const gjdk = createClient(gjdkUrl, gjdkKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16'; // Casa Maria Imóveis

async function repairLeads() {
    console.log('--- STARTING MASTER LEAD REPAIR ---');

    // 1. Fetch Reference Data from KDHQ (to map names to IDs)
    console.log('Fetching reference data from KDHQ...');
    const { data: kEnts } = await kdhq.from('empreendimentos').select('id, nome').eq('organization_id', TARGET_ORG);
    const { data: kSources } = await kdhq.from('origens_lead').select('id, nome').eq('organization_id', TARGET_ORG);

    const kEntMap = new Map((kEnts || []).map(e => [e.nome.trim().toLowerCase(), e.id]));
    const kSrcMap = new Map((kSources || []).map(s => [s.nome.trim().toLowerCase(), s.id]));

    console.log(`Maps ready: ${kEntMap.size} enterprises, ${kSrcMap.size} sources.`);

    // 2. Fetch all leads from GJDK
    console.log('Fetching leads from GJDK...');
    const { data: gLeads, error: gError } = await gjdk.from('leads').select('*');
    if (gError) {
        console.error('Error fetching GJDK leads:', gError.message);
        return;
    }
    console.log(`Found ${gLeads.length} leads in GJDK.`);

    // 3. Fetch all enterprises and sources from GJDK (to get names for the IDs in gLeads)
    const { data: gEnts } = await gjdk.from('enterprises').select('id, name');
    const { data: gSources } = await gjdk.from('lead_sources').select('id, name');

    const gEntNameMap = new Map((gEnts || []).map(e => [e.id, e.name]));
    const gSrcNameMap = new Map((gSources || []).map(s => [s.id, s.name]));

    // 4. Fetch all leads from KDHQ (for our org)
    console.log('Fetching leads from KDHQ...');
    const { data: kLeads, error: kError } = await kdhq.from('leads').select('*').eq('organization_id', TARGET_ORG);
    if (kError) {
        console.error('Error fetching KDHQ leads:', kError.message);
        return;
    }
    console.log(`Found ${kLeads.length} leads in KDHQ for target org.`);

    let updatedCount = 0;

    // 5. Correlate and Repair
    for (const kLead of kLeads) {
        if (!kLead.telefone) continue;

        // Find match in GJDK by phone (clean phone numbers if needed, but let's try direct first)
        const match = gLeads.find(gl => gl.phone === kLead.telefone);

        if (match) {
            const updates = {};

            // Repair Broker (corretor)
            if (match.corretor && (!kLead.corretor || kLead.corretor === 'Não Informado')) {
                updates.corretor = match.corretor;
            }

            // Repair Enterprise
            const gEntName = gEntNameMap.get(match.enterprise_id);
            if (gEntName) {
                const targetEntId = kEntMap.get(gEntName.trim().toLowerCase());
                if (targetEntId && !kLead.empreendimento_id) {
                    updates.empreendimento_id = targetEntId;
                }
            }

            // Repair Source
            const gSrcName = gSrcNameMap.get(match.source_id);
            if (gSrcName) {
                const targetSrcId = kSrcMap.get(gSrcName.trim().toLowerCase());
                const isDefault = kLead.origem_id === '8b4f9716-e977-420a-94fb-42b0a506600a';
                if (targetSrcId && (!kLead.origem_id || isDefault)) {
                    // Only update if the new source is NOT 'Não Informada' or if the current one is null
                    if (gSrcName.trim().toLowerCase() !== 'não informada') {
                        updates.origem_id = targetSrcId;
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                console.log(`Repairing lead: ${kLead.nome} | Fields: ${Object.keys(updates).join(', ')}`);
                const { error: patchError } = await kdhq.from('leads').update(updates).eq('id', kLead.id);
                if (patchError) {
                    console.error(`- Error patching ${kLead.nome}:`, patchError.message);
                } else {
                    updatedCount++;
                }
            }
        }
    }

    console.log('--- REPAIR COMPLETE ---');
    console.log(`Total leads processed: ${kLeads.length}`);
    console.log(`Total leads repaired: ${updatedCount}`);
}

repairLeads();
