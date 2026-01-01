# Developer Notes & Agent Disclaimer

**READ THIS BEFORE MAKING CHANGES TO THE FEEDBACK SYSTEM**

## 1. Feedback Table RLS (Row Level Security)
- **Status**: **DISABLED**
- **Reason**: The feedback submission form is a **public-facing feature**. Users (including unauthenticated guests) must be able to insert rows into the `public.feedback` table.
- **Constraint**: Enabling RLS will break public submissions unless complex policies for "anon" users are correctly configured. Currently, it is intentionally disabled to ensure reliability.
- **Do NOT**: Do not blindly re-enable RLS on `feedback` without verifying public submission flows.

## 2. Public Feedback Authentication
- **File**: `src/actions/feedback.actions.ts` -> `submitFeedbackBatch`
- **Logic**: The system **MUST** allow submissions where `user` is null (guest) AND `is_anonymous` is false.
- **Why**: A user might want to provide their name ("John Doe") but not be logged into the system.
- **Critical**: Do **NOT** add a strict check like `if (!user && !is_anonymous) throw Error`. This was a bug that prevented guests from submitting non-anonymous feedback.

## 3. Feedback Data Structure
- **Batching**: The frontend submits an array of items (Content, Venue, etc.).
- **Rating Inheritance**: The UI allows only a **single Overall Rating**. This rating is applied to *all* feedback entries in the batch (e.g., if Overall is 5, the "Venue" comment is also saved with a rating of 5). This is to satisfy the non-null database constraint on `rating`.

## 4. Mobile Sidebar
- **Layout**: The sidebar uses `z-50` and `h-[100dvh]` to handle mobile browser address bars.
- **Footer**: The logout button area has explicit bottom margin/padding to prevent it from being hidden behind mobile system navigation bars.

## 5. Event Visibility (RLS & Status)
- **Public Access**: Public feedback links (e.g., `/event-feedback/[id]`) **ONLY** work for events with status `published` or `completed`.
- **Draft/Cancelled**: Events with status `draft` or `cancelled` are hidden from public views by RLS. Attempting to access them as an unauthenticated user will result in a 404/Empty state.
- **Policy**: The RLS policy on `public.events` is named `"Anyone can view published events"` and explicitly checks `status IN ('published', 'completed')`.


## 6. Feedback Display UI
- **Requirement**: The `FeedbackList` component **MUST** group individual feedback rows into single "Submission Cards".
- **Logic**: Prefer using `submission_id` as the grouping key (added via migration), or fallback to composite key.
- **Why**: The database stores 1 row per category. Displaying them as separate cards clutters the UI.

## 7. Dashboard Metrics
- **Total Feedback**: Must display the count of **unique submissions**, not total rows.
- **Implementation**: Uses `get_unique_feedback_count` RPC function which counts distinct `submission_id`.
