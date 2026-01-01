import { test as teardown } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.E2E_BASE_URL?.replace('https://', '').replace('http://', '') || 'event-management-and-feedback.vercel.app';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

teardown('cleanup test data', async () => {
  if (!supabaseKey) {
    console.log('⚠️  No SUPABASE_SERVICE_KEY found, skipping cleanup');
    return;
  }

  const supabase = createClient(
    `https://${process.env.NEXT_PUBLIC_SUPABASE_URL || 'xcllkyoarbsyjlulmeoq.supabase.co'}`,
    supabaseKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const testEmail = process.env.E2E_EMAIL;
  
  if (!testEmail) {
    console.log('⚠️  No E2E_EMAIL found, skipping cleanup');
    return;
  }

  console.log(`🧹 Cleaning up test data for ${testEmail}...`);

  try {
    // Get user ID
    const { data: users } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', testEmail);

    if (!users || users.length === 0) {
      console.log('ℹ️  No user found, nothing to clean');
      return;
    }

    const userId = users[0].id;

    // Delete in order (due to foreign key constraints)
    // 1. Delete feedback for user's events
    const { data: userEvents } = await supabase
      .from('events')
      .select('id')
      .eq('created_by', userId);

    const eventIds = userEvents?.map(e => e.id) || [];

    if (eventIds.length > 0) {
      await supabase.from('feedback').delete().in('event_id', eventIds);
    }

    // 2. Delete user's own feedback
    await supabase.from('feedback').delete().eq('user_id', userId);

    // 3. Delete events
    await supabase.from('events').delete().eq('created_by', userId);

    // 4. Delete profile
    await supabase.from('profiles').delete().eq('id', userId);

    // 5. Delete auth user (requires service key with proper permissions)
    await supabase.auth.admin.deleteUser(userId);

    console.log('✅ Test data cleaned successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    // Don't fail the test run if cleanup fails
  }
});
