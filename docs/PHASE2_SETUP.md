# Phase 2 Setup Guide - OneUI to Connect Them All

Welcome to Phase 2! This guide will walk you through setting up the new features including Microsoft Teams, Outlook, and AI-powered capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Microsoft Azure Setup (Teams & Outlook)](#microsoft-azure-setup)
3. [Claude AI Setup](#claude-ai-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing Your Setup](#testing-your-setup)
6. [Troubleshooting](#troubleshooting)
7. [Feature Overview](#feature-overview)

---

## Prerequisites

Before starting Phase 2 setup, ensure you have completed Phase 1:

- ✅ Node.js installed (v18 or higher)
- ✅ Repository cloned and dependencies installed (`npm install`)
- ✅ HTTPS certificates generated (`npm run setup-https`)
- ✅ Slack integration working (optional but recommended)

**New Requirements for Phase 2:**
- Microsoft Azure account (free tier works)
- Claude AI API key (for AI features)
- Microsoft 365 account (for Teams/Outlook testing)

---

## Microsoft Azure Setup

### Step 1: Create Azure App Registration

1. Navigate to [Azure Portal](https://portal.azure.com/)
2. Go to **Azure Active Directory** → **App registrations**
3. Click **New registration**

   **Fill in:**
   - **Name:** `OneUI` (or your preferred name)
   - **Supported account types:**
     - Select: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI:**
     - Type: `Web`
     - URI: `https://localhost:3000/api/auth/microsoft/callback`

4. Click **Register**
5. **Save the Application (client) ID** - you'll need this for your `.env` file

### Step 2: Configure API Permissions

Microsoft Graph permissions are needed for accessing Teams and Outlook data.

1. In your app registration, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**

#### Required Permissions:

**For Microsoft Teams:**
```
✓ User.Read
✓ Chat.Read
✓ Chat.ReadWrite
✓ ChannelMessage.Read.All
✓ Team.ReadBasic.All
✓ Channel.ReadBasic.All
```

**For Outlook/Email:**
```
✓ User.Read
✓ Mail.Read
✓ Mail.ReadWrite
✓ Mail.Send
✓ MailboxSettings.Read
```

3. Click **Add permissions**
4. (Optional) Click **Grant admin consent for [Your Organization]**
   - This step is optional for personal accounts
   - Recommended for organizational accounts

### Step 3: Generate Client Secret

1. Go to **Certificates & secrets**
2. Under **Client secrets**, click **New client secret**
3. Add description: `OneUI Development`
4. Choose expiration: **6 months** (or preferred duration)
5. Click **Add**
6. **⚠️ IMPORTANT:** Copy the secret **Value** immediately!
   - This value is shown only once
   - You cannot retrieve it later
   - You'll need this for your `.env` file

### Step 4: Configure Redirect URIs (Verify)

1. Go to **Authentication** in your app registration
2. Under **Platform configurations** → **Web**, verify:
   - Redirect URI: `https://localhost:3000/api/auth/microsoft/callback`
3. Under **Implicit grant and hybrid flows**:
   - Leave all checkboxes unchecked (we use authorization code flow)
4. Click **Save** if you made changes

---

## Claude AI Setup

### Step 1: Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Name it: `OneUI Development`
6. Copy the API key (starts with `sk-ant-api03-...`)

### Step 2: Understand API Usage

- **Free Tier:** Claude API requires a paid account
- **Pricing:** Pay-as-you-go based on tokens used
- **Alternative:** AI features are optional - you can use Teams/Outlook/Slack without AI

---

## Environment Configuration

### Complete .env File

Create or update your `.env` file in the project root:

```env
# ======================
# Slack Configuration
# ======================
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_REDIRECT_URI=https://localhost:3000/api/auth/slack/callback

# ======================
# Microsoft Configuration
# ======================
# These credentials work for BOTH Teams and Outlook
MICROSOFT_CLIENT_ID=your_azure_application_id
MICROSOFT_CLIENT_SECRET=your_azure_client_secret
MICROSOFT_REDIRECT_URI=https://localhost:3000/api/auth/microsoft/callback

# ======================
# Claude API (Optional)
# ======================
# Only needed for AI-powered features
CLAUDE_API_KEY=sk-ant-api03-your-api-key-here

# ======================
# Application Settings
# ======================
NEXT_PUBLIC_APP_URL=https://localhost:3000
SESSION_SECRET=your_random_session_secret_here

# ======================
# Database (Future Use)
# ======================
DATABASE_URL=postgresql://user:password@localhost:5432/oneui
```

### Generate Session Secret

```bash
# Generate a secure random session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Testing Your Setup

### 1. Start the Application

```bash
npm run dev
```

The app should start on `https://localhost:3000`

### 2. Test Slack (Phase 1 - Optional)

1. Go to dashboard
2. Click **Slack** button
3. Authorize the app
4. Verify channels appear

### 3. Test Microsoft Teams

1. Go to dashboard
2. Click **Teams** button
3. Log in with your Microsoft account
4. Accept permission requests
5. Verify Teams channels appear in sidebar
6. Click a channel to view messages

### 4. Test Outlook

1. Go to dashboard
2. Click **Outlook** button
3. Log in with your Microsoft account
4. Accept permission requests
5. Verify email folders appear (Inbox, Sent Items, etc.)
6. Click a folder to view emails

### 5. Test AI Features

1. Select any channel/folder with messages
2. Click the **AI Summary** button (✨ icon)
3. Wait for AI to generate summary
4. Summary appears in popup dialog

### 6. Test Unified Features

**Search:**
- Type in the search bar at the top
- Results filter in real-time across all platforms

**Platform Filter:**
- Use dropdown to filter by: All Platforms, Slack, Teams, or Outlook
- View only messages from selected platform

**Sorting:**
- Toggle between "Newest First" and "Oldest First"
- Messages re-sort automatically

---

## Troubleshooting

### Microsoft OAuth Issues

**Problem:** "Invalid redirect URI"
```
Solution:
1. Check Azure redirect URI is EXACTLY: https://localhost:3000/api/auth/microsoft/callback
2. Verify .env has: MICROSOFT_REDIRECT_URI=https://localhost:3000/api/auth/microsoft/callback
3. Restart dev server after .env changes
```

**Problem:** "Insufficient permissions"
```
Solution:
1. Go to Azure portal → API permissions
2. Verify all required permissions are added
3. Click "Grant admin consent"
4. Clear cookies and try again
```

**Problem:** "Token expired" or "Invalid token"
```
Solution:
1. Tokens expire after 1 hour by default
2. Click disconnect and reconnect the platform
3. Future: Implement automatic token refresh (Phase 3)
```

### Teams Specific Issues

**Problem:** "No teams found"
```
Solution:
1. Ensure you're a member of at least one Team
2. Check Microsoft Graph permissions include Team.ReadBasic.All
3. Re-grant permissions in Azure portal
```

**Problem:** "Channel messages not loading"
```
Solution:
1. Verify ChannelMessage.Read.All permission is granted
2. Check if channel is archived (archived channels are filtered out)
3. Ensure you have access to the specific channel
```

### Outlook Specific Issues

**Problem:** "No folders found"
```
Solution:
1. Verify Mail.Read permission is granted
2. Check if you're using a valid Microsoft email account
3. Some account types may have restricted access
```

### AI Features Issues

**Problem:** "AI features not configured"
```
Solution:
1. Verify CLAUDE_API_KEY is set in .env
2. Check API key is valid (starts with sk-ant-api03-)
3. Ensure API key has remaining credits
4. Restart dev server after adding key
```

**Problem:** "Summary generation failed"
```
Solution:
1. Check Claude API key is valid
2. Verify you have API credits
3. Check console for detailed error messages
4. Try with fewer messages (AI has token limits)
```

### General Issues

**Problem:** "Cannot connect to localhost:3000"
```
Solution:
1. Verify HTTPS certificates: npm run setup-https
2. Accept certificate in browser (click "Advanced" → "Proceed")
3. Check server is running: npm run dev
```

**Problem:** "Module not found" errors
```
Solution:
1. Delete node_modules and package-lock.json
2. Run: npm install
3. Restart dev server
```

---

## Feature Overview

### What's New in Phase 2

#### 🔗 Multi-Platform Integration
- **Teams Integration:** Access team channels, read messages, view members
- **Outlook Integration:** Browse email folders, read emails, see attachments
- **Unified View:** All platforms in one sidebar

#### 🎨 Unified Messaging Interface
- **Consistent Format:** All messages displayed the same way
- **Platform Badges:** Visual indicators showing message source
- **Real-time Search:** Find messages across all platforms instantly
- **Smart Filtering:** Filter by platform, author, or channel

#### 🧠 AI-Powered Features
- **Message Summarization:** Get concise summaries of long threads
- **Context Analysis:** Understand sentiment and priority
- **Smart Suggestions:** AI-powered response recommendations (API only)
- **Topic Grouping:** Automatically group related messages (API only)

#### ⚡ Performance Improvements
- **Efficient Loading:** Messages load on-demand
- **Caching:** Tokens cached for faster subsequent loads
- **Optimized Rendering:** Virtual scrolling for large message lists

### API Endpoints (for Developers)

```
Authentication:
- GET  /api/auth/slack
- GET  /api/auth/slack/callback
- GET  /api/auth/microsoft?platform=teams|outlook
- GET  /api/auth/microsoft/callback

Status Checks:
- GET  /api/slack/status
- GET  /api/teams/status
- GET  /api/outlook/status

Data Retrieval:
- GET  /api/slack/channels
- GET  /api/slack/messages?channelId=xxx&limit=50
- GET  /api/teams/channels
- GET  /api/teams/messages?channelId=xxx&limit=50
- GET  /api/outlook/channels
- GET  /api/outlook/messages?channelId=xxx&limit=50

AI Features:
- POST /api/ai/summarize (body: { messages: Message[] })
```

---

## Next Steps

**Phase 3 Preview (Coming Soon):**
- 🎨 Custom themes and personalization
- 🔔 Real-time notifications
- 📊 Analytics and insights
- 🔄 Automatic token refresh
- 💬 Send messages (currently read-only)

**Get Started:**
1. Complete the setup steps above
2. Connect your platforms
3. Explore the unified interface
4. Try the AI features
5. Provide feedback!

---

## Support

**Issues or Questions?**
- GitHub Issues: [Create an issue](https://github.com/Xiliath/OneUIToConnectThemAll/issues)
- Documentation: Check README.md for general info
- Code Review: See implementation details in source code

**Contributing:**
- Follow the existing code style
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

---

**Happy connecting! 🚀**

*Built with ❤️ using Next.js, Microsoft Graph API, Slack API, and Claude AI*
