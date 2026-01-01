# Test Data Cleanup Script

Quickly delete all data for a test user.

## Usage

```bash
npm run cleanup-user mohdzikri809@gmail.com
```

## What It Does

The script will delete:
- ✅ All events created by the user
- ✅ All feedback for those events
- ✅ User's own feedback submissions
- ✅ User profile
- ✅ Auth account

## Requirements

Add `SUPABASE_SERVICE_KEY` to your `.env.local`:

```env
SUPABASE_SERVICE_KEY=your-service-key-here
```

**Security**: Never commit the service key to Git!

## Example Output

```
🧹 Cleaning up data for: mohdzikri809@gmail.com

✓ Found user ID: abc-123-def

Deleting data:
  - 5 events
  ✓ Deleted feedback for user events
  ✓ Deleted user feedback submissions
  ✓ Deleted events
  ✓ Deleted profile
  ✓ Deleted auth user

✅ Successfully cleaned up all data for mohdzikri809@gmail.com
```
