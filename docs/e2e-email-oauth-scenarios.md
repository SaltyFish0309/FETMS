# E2E Test Scenarios — Gmail OAuth 2.0 Email Configuration

Manual acceptance test scenarios for the Gmail OAuth 2.0 email configuration feature.

---

## Scenario 1: First-time Setup — Save OAuth Credentials

**Precondition:** No EmailConfig document exists in MongoDB. User is at `/settings`.

**Steps:**
1. Navigate to `/settings` → click "Email Configuration" card
2. Verify page shows credential form (Client ID + Client Secret fields)
3. Enter `test-client-id` in Client ID field
4. Enter `test-client-secret` in Client Secret field
5. Click "Save Credentials"

**Expected:** Success toast appears, page transitions to "OAuth credentials saved" view with "Connect Gmail Account →" button visible.

---

## Scenario 2: Connect Gmail Account (OAuth Flow)

**Precondition:** Credentials are saved (Scenario 1 complete). Google Cloud Console credentials are real.

**Steps:**
1. At `/settings/email-config`, click "Connect Gmail Account →"
2. Browser redirects to Google OAuth consent screen
3. Sign in with Gmail account, click "Allow"
4. Browser is redirected back to `/settings?email=connected`

**Expected:** Success toast "Gmail connected successfully", page now shows connected state with Gmail address displayed and "Disconnect" button.

---

## Scenario 3: Send Email After OAuth Connection

**Precondition:** Gmail is connected.

**Steps:**
1. Navigate to Email page
2. Compose a test email to a known address
3. Send

**Expected:** Email is delivered from the connected Gmail address. EmailLog in DB records `totalSent: 1`.

---

## Scenario 4: Disconnect Gmail

**Precondition:** Gmail is connected.

**Steps:**
1. Navigate to `/settings/email-config`
2. Click "Disconnect"

**Expected:** Success toast, page returns to "Connect Gmail Account" view (configured but not connected). MongoDB `EmailConfig` document has `refreshToken` field removed.

---

## Scenario 5: OAuth Error Handling

**Precondition:** Valid credentials saved, but OAuth code exchange fails (e.g., expired code).

**Steps:**
1. Manually navigate to `/api/email-config/callback?code=invalid`
2. Browser is redirected to frontend

**Expected:** Redirect to `/settings?email=error`, error toast displayed on the settings page.
