# 🤝 Client Handoff & Access Guide

This document contains the essential credentials and platform information needed to own, manage, and maintain your Event Management Website.

## 🔑 Master Access Credentials

To simplify management, all services are linked to a single Google Account. You do not need to remember separate passwords for each platform; simply use the **"Continue with Google"** option where available, or use the GitHub login which is also linked to this email.

| Service | Credential |
| :--- | :--- |
| **Google Account** | `p49989690@gmail.com` |
| **Password** | `012345678Az` |

> **⚠️ Security Note**: Please change this password immediately after you have successfully logged in and verified access to all platforms.

---

## 🌐 The Platform Ecosystem

 Your website runs on three major integrated platforms. Here is what each one does and why you need it:

### 1. GitHub (The Code Vault)
*   **What it does**: Stores the actual source code of your website. It keeps a history of every change ever made.
*   **Why you need it**: It is the "source of truth". If you hire a developer in the future, you will give them access here so they can download and edit the code.
*   **How to Access**:
    1.  Go to [github.com](https://github.com/)
    2.  Click **Sign In**
    3.  Use the credentials above or "Sign in with Google" if configured.

### 2. Vercel (The Hosting Engine)
*   **What it does**: Takes the code from GitHub and turns it into a live website viewable on the internet. It handles the "deployment" automatically.
*   **Why you need it**: This is where your website "lives". If you want to check if the site is online, see visitor analytics, or manage your domain name (e.g., `www.your-event-site.com`), you go here.
*   **How to Access**:
    1.  Go to [vercel.com](https://vercel.com/)
    2.  Click **Log In**
    3.  Select **"Continue with GitHub"** (Recommended) or use the Email.

### 3. Supabase (The Database & Backend)
*   **What it does**: Stores all the **data**. This includes your users, event details, and the feedback submissions. It also powers the login system (Authentication) for your app.
*   **Why you need it**: This is the "brain" of the operation. You can view raw data tables, manage user accounts directly, or backup your data from here.
*   **How to Access**:
    1.  Go to [supabase.com](https://supabase.com/dashboard)
    2.  Click **Sign In**
    3.  Select **"Continue with GitHub"**. (It effectively links your GitHub identity to your database access).

---

## 🔄 How They Work Together

1.  **GitHub** holds the code.
2.  When code is updated in GitHub, **Vercel** notices the change and automatically updates the live website.
3.  When a user visits the live website (on Vercel) and logs in or submits feedback, that data is saved to **Supabase**.

## 📝 Next Steps for You

1.  **Log in to Gmail** with the provided credentials to ensure you have access.
2.  **Log in to GitHub, Vercel, and Supabase** to verify you can see the project in each dashboard.
3.  **Update the Password** for the Google Account to secure your ownership.
