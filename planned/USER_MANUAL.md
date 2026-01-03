# Event Management & Feedback System - User Manual

## Welcome!
This manual will guide you through installing, setting up, and using the Event Management & Feedback System. This application allows you to create events, share them with your audience, and collect detailed feedback.

---

## 🏗️ Part 1: Installation & Setup
*(This part is usually done once by your technical team or yourself if you are setting it up).*

### Prerequisites
Before you start, ensure you have the following installed on your computer:
1.  **Node.js**: Download and install from [nodejs.org](https://nodejs.org/). (Version 20 or higher recommended).
2.  **Generic Text Editor**: Notepad, TextEdit, or [VS Code](https://code.visualstudio.com/) (Recommended).

### Step 1: Download the Application
1.  Download the project source code (zip file) and extract it to a folder on your computer (e.g., `Documents/EventSystem`).
2.  Open that folder.

### Step 2: Database Setup (Supabase)
This application uses **Supabase** to store data.
1.  Go to [Supabase.com](https://supabase.com/) and Sign Up.
2.  Click **"New Project"**.
3.  Give it a Name (e.g., "My Event Manager") and a Password. Choose a region near you.
4.  Wait for the database to set up.
5.  Once ready, look for **"Project Settings"** (Cog icon) > **"API"**.
6.  Keep this page open. You will need:
    *   **Project URL**
    *   **anon public** Key

### Step 3: Configure the Application
1.  In your project folder, look for a file named `.env.example`.
2.  Copy this file and rename the copy to `.env.local`.
3.  Open `.env.local` with your text editor.
4.  Fill in the details from your Supabase API page:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
5.  Save the file.

### Step 4: Create Tables
1.  In Supabase, find the **SQL Editor** (icon looking like specific code `>_` or `SQL` on the left sidebar).
2.  Click **"New Query"**.
3.  Open the file `database_schema.sql` (included in this project folder) with your text editor.
4.  Copy ONLY the text inside `database_schema.sql`.
5.  Paste it into the Supabase SQL Editor.
6.  Click **"Run"**. This will create the necessary tables for the app to work.

### Step 5: Install & Run
1.  Open a Terminal or Command Prompt.
2.  Navigate to your project folder:
    ```bash
    cd path/to/folder
    ```
    *(Tip: You can type `cd ` (with space) and drag the folder into the terminal window).*
3.  Install dependencies (only need to do this once):
    ```bash
    npm install
    ```
4.  Start the application:
    ```bash
    npm run dev
    ```
5.  Open your browser and visit: `http://localhost:3000`.

---

## 🚀 Part 2: Using the Application

### 1. Account Creation
*   On the Welcome screen, click **"Sign up"**.
*   Enter your Email and Password.
*   **Sign In** with your new credentials.

### 2. The Dashboard
Once logged in, you will see the Dashboard. This is your command center.
*   **Total Events**: Number of events you have created.
*   **Total Feedback**: Total number of feedback submissions received across all events.
*   **Upcoming Events**: A list of events scheduled for the future.
*   **Recent Feedback**: The latest feedback comments from your audience.

### 3. Managing Events

#### 🆕 Creating an Event
1.  Click **"Events"** in the sidebar.
2.  Click the **"Create Event"** button.
3.  Fill in the details:
    *   **Title**: E.g., "Annual Gala".
    *   **Status**:
        *   `Draft`: Only visible to you. (Start with this).
        *   `Published`: Visible to the public. **Required for feedback collection**.
        *   `Completed`: Event has finished.
        *   `Cancelled`: Event is off.
    *   **Date & Location**: When and where.
4.  Click **"Create Event"**.

#### 📢 Sharing the Feedback Link
**Important**: Users can only submit feedback if your event status is **Published** or **Completed**.
1.  Go to the **Events** list.
2.  Find your event card.
3.  Click the **"Copy Link"** button (or open the event details and find the Share button).
4.  Paste this link in emails, QR codes, or chat groups for your attendees.
    *   Link format: `.../event-feedback/[event-id]`

#### ✏️ Editing an Event
1.  Click on an event to view its details.
2.  Click **"Edit"** to change details (e.g., fix a typo or change status from Draft to Published).

### 4. Viewing Feedback
*   **Individual Event**: Go to an Event's detail page to see a summary of its feedback.
*   **All Feedback**: Click **"Feedback"** in the sidebar to see a master list of all feedback received.
*   **Analytics**: The system automatically calculates Average Ratings and Sentiment (Positive/Negative) based on the comments.

### 5. Customization
*   **Dark Mode**: Click the Sun/Moon icon in the top right corner to switch user interface themes.

---

## ❓ Troubleshooting

### "Page Not Found" when opening a Feedback Link
*   **Cause**: The event is likely in `Draft` or `Cancelled` status.
*   **Fix**: Edit the event and change the status to **Published**.

### Login Issues
*   Ensure you verified your email if required.
*   Check your internet connection.

### "Redirecting to localhost" not working?
*   If you are running this on a real website (not localhost), ensure the configuration settings (Environment Variables) are updated by your tech support team.

---


