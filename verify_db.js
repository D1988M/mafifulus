
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: './backend/.env' });
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('[Test] Attempting connection to:', process.env.DATABASE_URL.split('@')[1] || 'URL Hidden'); // Log host for sanity
        await prisma.$connect();
        console.log('[Test] SUCCESS: Connected to Supabase!');
        const count = await prisma.user.count();
        console.log(`[Test] User count: ${count}`);
        await prisma.$disconnect();
        process.exit(0);
    } catch (e) {
        console.error('[Test] FAILED:', e.message);
        process.exit(1);
    }
}

main();
