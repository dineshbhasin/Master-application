/**
 * Seed script — creates the demo user for internal showcases.
 *
 * Run:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-demo.ts
 *
 * Requires MONGODB_URI set via environment or in .env.local at the project root.
 */

import fs from 'fs';
import path from 'path';

// Manually load .env.local before importing anything that needs process.env
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@ulip.gov.in',
  password: 'Demo@1234',
  phone: '+91 98765 00000',
  organization: 'ULIP Showcase',
  role: 'sme' as const,
  isVerified: true,
  twoFactorEnabled: false,
};

const UserSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:           { type: String, required: true, select: false },
    phone:              { type: String, trim: true },
    organization:       { type: String, trim: true },
    role:               { type: String, enum: ['citizen', 'sme', 'enterprise', 'official'], default: 'citizen' },
    twoFactorEnabled:   { type: Boolean, default: false },
    twoFactorSecret:    { type: String, select: false },
    isVerified:         { type: Boolean, default: false },
    lastLogin:          { type: Date },
  },
  { timestamps: true }
);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not set. Add it to .env.local and retry.');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri, { bufferCommands: false });
  console.log('✅  Connected.');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const existing = await (User as mongoose.Model<mongoose.Document>).findOne({ email: DEMO_USER.email });
  if (existing) {
    console.log(`ℹ️   Demo user already exists (${DEMO_USER.email}). Skipping creation.`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(DEMO_USER.password, 12);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (User as any).create({
    name:             DEMO_USER.name,
    email:            DEMO_USER.email,
    password:         hashed,
    phone:            DEMO_USER.phone,
    organization:     DEMO_USER.organization,
    role:             DEMO_USER.role,
    isVerified:       DEMO_USER.isVerified,
    twoFactorEnabled: DEMO_USER.twoFactorEnabled,
  });

  console.log('');
  console.log('🎉  Demo user created successfully!');
  console.log('');
  console.log('   Email    :', DEMO_USER.email);
  console.log('   Password :', DEMO_USER.password);
  console.log('   Role     :', DEMO_USER.role);
  console.log('');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
