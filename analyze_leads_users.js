
import fs from 'fs';
const dump = JSON.parse(fs.readFileSync('DUMP_ALL.json', 'utf8'));
const leads = dump.leads || [];

const userIds = new Set();
const corretores = new Set();

leads.forEach(l => {
    if (l.user_id) userIds.add(l.user_id);
    if (l.corretor) corretores.add(l.corretor);
});

console.log('--- LEAD DATA ANALYSIS ---');
console.log('Unique User IDs in leads:', Array.from(userIds));
console.log('Unique Corretor names in leads:', Array.from(corretores));

const users = dump.users || [];
const knownUserIds = users.map(u => u.id);

const missingUserIds = Array.from(userIds).filter(id => !knownUserIds.includes(id));
console.log('User IDs in leads MISSING from users table:', missingUserIds);
