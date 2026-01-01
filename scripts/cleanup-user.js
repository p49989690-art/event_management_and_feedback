#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * Deletes all data for a specified user email
 * 
 * Usage:
 *   npm run cleanup-user mohdzikri809@gmail.com
 *   node scripts/cleanup-user.js mohdzikri809@gmail.com
 */

import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];

if (!email) {
    console.error('❌ Error: Email address is required');
    console.log('Usage: npm run cleanup-user <email>');
    console.log('Example: npm run cleanup-user mohdzikri809@gmail.com');
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function cleanupUserData(email) {
    console.log(`\n🧹 Cleaning up data for: ${email}\n`);

    try {
        // Get user ID from email
        const { data: users, error: userError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email);

        if (userError) {
            console.error('❌ Error fetching user:', userError.message);
            process.exit(1);
        }

        if (!users || users.length === 0) {
            console.log('ℹ️  No user found with that email address');
            process.exit(0);
        }

        const userId = users[0].id;
        console.log(`✓ Found user ID: ${userId}`);

        // Get user's events for reference
        const { data: userEvents } = await supabase
            .from('events')
            .select('id, title')
            .eq('created_by', userId);

        const eventIds = userEvents?.map(e => e.id) || [];

        console.log(`\nDeleting data:`);
        console.log(`  - ${userEvents?.length || 0} events`);

        // Delete feedback for user's events
        if (eventIds.length > 0) {
            const { error: feedbackError } = await supabase
                .from('feedback')
                .delete()
                .in('event_id', eventIds);

            if (feedbackError) {
                console.error('❌ Error deleting event feedback:', feedbackError.message);
            } else {
                console.log('  ✓ Deleted feedback for user events');
            }
        }

        // Delete user's own feedback submissions
        const { error: ownFeedbackError } = await supabase
            .from('feedback')
            .delete()
            .eq('user_id', userId);

        if (ownFeedbackError) {
            console.error('❌ Error deleting user feedback:', ownFeedbackError.message);
        } else {
            console.log('  ✓ Deleted user feedback submissions');
        }

        // Delete events
        const { error: eventsError } = await supabase
            .from('events')
            .delete()
            .eq('created_by', userId);

        if (eventsError) {
            console.error('❌ Error deleting events:', eventsError.message);
        } else {
            console.log('  ✓ Deleted events');
        }

        // Delete profile
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('❌ Error deleting profile:', profileError.message);
        } else {
            console.log('  ✓ Deleted profile');
        }

        // Delete auth user (requires admin privileges)
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('❌ Error deleting auth user:', authError.message);
        } else {
            console.log('  ✓ Deleted auth user');
        }

        console.log(`\n✅ Successfully cleaned up all data for ${email}\n`);

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

cleanupUserData(email);
