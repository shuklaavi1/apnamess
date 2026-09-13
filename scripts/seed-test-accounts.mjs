import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local file if available
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim();
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  { name: 'Avi', email: 'avi@apnamess.in', password: 'avi1234', role: 'admin' },
  { name: 'Sanjeev', email: 'sanjeev@apnamess.in', password: 'sanjeev1234', role: 'member' },
  { name: 'Tapas', email: 'tapas@apnamess.in', password: 'tapas1234', role: 'member' },
  { name: 'Om', email: 'om@apnamess.in', password: 'om1234', role: 'member' },
  { name: 'Rahul', email: 'rahul@apnamess.in', password: 'rahul1234', role: 'member' },
  { name: 'Abhay', email: 'abhay@apnamess.in', password: 'abhay1234', role: 'member' },
  { name: 'Manish', email: 'manish@apnamess.in', password: 'manish1234', role: 'member' },
  { name: 'Shahzada', email: 'shahzada@apnamess.in', password: 'shahzada1234', role: 'member' },
];

async function seedTestAccounts() {
  console.log('Starting idempotent test accounts seeding for ApnaMess...');

  // 1. Ensure default Mess Group exists
  let messGroupId = null;
  const { data: existingGroups } = await supabaseAdmin.from('mess_groups').select('id').limit(1);
  if (existingGroups && existingGroups.length > 0) {
    messGroupId = existingGroups[0].id;
  } else {
    const { data: newGroup, error: groupErr } = await supabaseAdmin
      .from('mess_groups')
      .insert([
        {
          name: 'ApnaMess',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          default_monthly_contribution: 3000,
          low_balance_threshold: 1000,
        },
      ])
      .select('id')
      .single();

    if (groupErr) {
      console.error('Error creating default mess group:', groupErr.message);
    } else {
      messGroupId = newGroup.id;
    }
  }

  // 2. Ensure current accounting month exists
  if (messGroupId) {
    const { data: existingMonths } = await supabaseAdmin
      .from('months')
      .select('id')
      .eq('mess_id', messGroupId)
      .eq('year', 2026)
      .eq('month_number', 9);

    if (!existingMonths || existingMonths.length === 0) {
      await supabaseAdmin.from('months').insert([
        {
          mess_id: messGroupId,
          year: 2026,
          month_number: 9,
          name: 'September',
          expected_contribution: 3000,
          opening_balance: 0,
          status: 'open',
        },
      ]);
    }
  }

  // 3. List existing auth users to prevent duplicates
  const { data: existingUsersData } = await supabaseAdmin.auth.admin.listUsers();
  const existingUsers = existingUsersData?.users || [];

  for (const userDef of TEST_USERS) {
    let authUser = existingUsers.find((u) => u.email?.toLowerCase() === userDef.email.toLowerCase());

    if (!authUser) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: userDef.email,
        password: userDef.password,
        email_confirm: true,
        user_metadata: {
          full_name: userDef.name,
        },
      });

      if (createErr) {
        console.warn(`Could not create user ${userDef.email}:`, createErr.message);
        continue;
      }
      authUser = created.user;
      console.log(`Created Auth account for ${userDef.name} (${userDef.email})`);
    } else {
      console.log(`Auth account already exists for ${userDef.name} (${userDef.email})`);
    }

    if (authUser && messGroupId) {
      // Upsert profile
      await supabaseAdmin.from('profiles').upsert([
        {
          id: authUser.id,
          full_name: userDef.name,
        },
      ]);

      // Check mess_member entry
      const { data: memberEntries } = await supabaseAdmin
        .from('mess_members')
        .select('id')
        .eq('mess_id', messGroupId)
        .eq('user_id', authUser.id);

      if (!memberEntries || memberEntries.length === 0) {
        await supabaseAdmin.from('mess_members').insert([
          {
            mess_id: messGroupId,
            user_id: authUser.id,
            display_name: userDef.name,
            role: userDef.role,
            monthly_contribution: 3000,
            is_active: true,
          },
        ]);
        console.log(`Linked ${userDef.name} to mess_members in ApnaMess`);
      }
    }
  }

  console.log('Test accounts seeding completed successfully!');
}

seedTestAccounts().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
