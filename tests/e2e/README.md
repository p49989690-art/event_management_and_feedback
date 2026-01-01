# E2E Testing Guide

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Test Credentials
Create a `.env.test` file in the project root:
```bash
cp .env.test.example .env.test
```

Edit `.env.test` and add your credentials:
```env
E2E_EMAIL=mohdzikri809@gmail.com
E2E_PASSWORD=your_actual_password_here
E2E_BASE_URL=https://event-management-and-feedback.vercel.app
```

**Important**: `.env.test` is gitignored for security. Never commit credentials!

### 3. Install Playwright Browsers (if not already done)
```bash
npx playwright install
```

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run with UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Run in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/authenticated-flow.spec.ts
```

### View Test Report
```bash
npm run test:e2e:report
```

## Test Suites

### 1. **Authenticated Flow** (`authenticated-flow.spec.ts`)
Tests the complete authenticated user journey:
- ✅ Login with credentials
- ✅ Navigate to Dashboard
- ✅ Create a new event
- ✅ Verify event creation
- ✅ Navigate between tabs (Dashboard, Events, Feedback)
- ✅ Logout

**Duration**: ~30 seconds

### 2. **Public Feedback** (`public-feedback.spec.ts`)
Tests unauthenticated public feedback submission:
- ✅ Submit feedback as guest with name
- ✅ Submit anonymous feedback
- ✅ Verify draft events are not accessible publicly

**Prerequisites**: Requires `E2E_TEST_EVENT_ID` environment variable for an existing published event.

**Duration**: ~20 seconds per test

### 3. **Dashboard Metrics** (`dashboard-metrics.spec.ts`)
Verifies the unique submission counting logic:
- ✅ Dashboard shows unique submission count (not total rows)
- ✅ Feedback list groups submissions correctly
- ✅ Multiple categories from same submission are grouped

**Duration**: ~15 seconds

## Important Notes

### Data Persistence
- ⚠️ **These tests run against production** and create real data
- Events created during tests will persist unless manually deleted
- Feedback submissions will be stored in the database

### Test Data Cleanup
To clean up test data:
1. Login to the production site
2. Navigate to Events page
3. Delete events with titles starting with "E2E Test Event"
4. Or use the data cleanup script (if available)

### Test Event ID
For public feedback tests to work, you need a published event:

**Option 1**: Run authenticated flow first
```bash
# This creates a published event
npx playwright test tests/e2e/authenticated-flow.spec.ts
```
Then copy the event ID from the URL and add to `.env.test`:
```env
E2E_TEST_EVENT_ID=your-event-id-here
```

**Option 2**: Use an existing published event ID from production

### Troubleshooting

#### Tests Failing with "Element not found"
- The UI might have changed. Update selectors in test files
- Try running in headed mode to see what's happening: `npm run test:e2e:headed`

#### Login Fails
- Verify credentials in `.env.test` are correct
- Check if the account exists and is verified
- Ensure production site is accessible

#### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify production site is responding

## Best Practices

1. **Run tests sequentially**: The config is set to `workers: 1` to avoid race conditions
2. **Check test reports**: After failures, review HTML report with screenshots
3. **Update selectors**: When UI changes, update test selectors accordingly
4. **Use data-testid**: For reliable selectors, add `data-testid` attributes to UI components

## CI/CD Integration

To run these tests in CI:
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  env:
    E2E_EMAIL: ${{ secrets.E2E_EMAIL }}
    E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
  run: npm run test:e2e
```

Store credentials as GitHub repository secrets.
