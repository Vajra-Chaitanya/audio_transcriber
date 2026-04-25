/**
 * Reset admin script — wipes all existing admin accounts and creates
 * a fresh one via Better Auth's own API so the password is hashed
 * correctly using the current BETTER_AUTH_SECRET.
 *
 * Run: npx tsx reset-admin.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { auth } from './src/lib/auth';

const prisma = new PrismaClient();

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123!';

async function reset() {
  console.log(`Deleting all existing users with email: ${EMAIL}`);
  await prisma.user.deleteMany({ where: { email: EMAIL } });

  console.log('Creating fresh admin via Better Auth...');
  const result = await auth.api.signUpEmail({
    body: { email: EMAIL, password: PASSWORD, name: 'Admin' },
  });

  if (result.error) {
    console.error('Error creating admin:', result.error);
    process.exit(1);
  }

  console.log('\n✅ Admin account created successfully!');
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log('\nYou can now log in at http://localhost:3000');
}

reset()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
