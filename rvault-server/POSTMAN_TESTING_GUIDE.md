# 📬 Rvault Server — Postman Testing Guide

## Setup

### Base URL
```
http://localhost:3000
```

### Postman Environment Variables

Create a new Postman Environment called **rvault-local** with these variables:

| Variable     | Initial Value                 | Description               |
|--------------|-------------------------------|---------------------------|
| `baseUrl`    | `http://localhost:3000`       | Server base URL           |
| `userId`     | *(leave empty)*               | Set after registration    |
| `jwtToken`   | *(leave empty)*               | Set after login           |

### Start the Server
```bash
cd rvault-server
npm start
```
Confirm you see:
```
MongoDB connected successfully
Server is running on port 3000
```

---

## Endpoints

### 1. 🏠 Root — Health Check

**`GET {{baseUrl}}/`**

No headers or body required.

**Expected Response** `200 OK`:
```
Hello World!
```

---

**`GET {{baseUrl}}/health`**

**Expected Response** `200 OK`:
```json
{
  "success": true,
  "message": "Server is healthy 🚀",
  "uptime": 12.345,
  "timestamp": "2026-04-18T15:45:00.000Z"
}
```

---

### 2. 📝 Register

**`POST {{baseUrl}}/api/auth/register`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type | application/json |

**Body (raw JSON):**
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "username": "testuser",
  "password": "SecureP@ss123"
}
```

**✅ Success Response** `201 Created`:
```json
{
  "message": "OTP sent to your email",
  "userId": "663f1a2b3c4d5e6f7a8b9c0d"
}
```

> 💡 **Postman Tip:** Add this to the **Tests** tab to auto-save `userId`:
> ```javascript
> if (pm.response.code === 201) {
>     var data = pm.response.json();
>     pm.environment.set("userId", data.userId);
> }
> ```

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `400`  | `{ "message": "Email already registered" }` |
| `400`  | `{ "message": "Username already taken" }` |
| `500`  | `{ "message": "Server error" }` |

---

### 3. 🔄 Resend OTP

**`POST {{baseUrl}}/api/auth/resend-otp`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type | application/json |

**Body (raw JSON):**
```json
{
  "userId": "{{userId}}"
}
```

**✅ Success Response** `200 OK`:
```json
{
  "message": "OTP resent!"
}
```

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `404`  | `{ "message": "User not found" }` |
| `400`  | `{ "message": "Already verified" }` |

---

### 4. ✅ Verify OTP & Setup TOTP

**`POST {{baseUrl}}/api/auth/verify-otp`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type | application/json |

**Body (raw JSON):**
```json
{
  "userId": "{{userId}}",
  "otp": "123456"
}
```

> ⚠️ Replace `"123456"` with the actual OTP received via email.

**✅ Success Response** `200 OK`:
```json
{
  "message": "Email verified! Scan QR in Google Authenticator",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "manualKey": "JBSWY3DPEHPK3PXP"
}
```

> 💡 **Postman Tip:** To view the QR code, add this to the **Visualize** tab:
> ```html
> <img src="{{qrCode}}" />
> ```
> Or copy `manualKey` and add it manually to Google Authenticator.

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `404`  | `{ "message": "User not found" }` |
| `400`  | `{ "message": "User already verified" }` |
| `400`  | `{ "message": "OTP expired" }` |
| `400`  | `{ "message": "Invalid OTP" }` |

---

### 5. 🔐 Login

**`POST {{baseUrl}}/api/auth/login`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type | application/json |

**Body (raw JSON):**
```json
{
  "email": "testuser@example.com",
  "password": "SecureP@ss123",
  "totpToken": "123456"
}
```

> ⚠️ Replace `"123456"` with the current 6-digit code from Google Authenticator.

**✅ Success Response** `200 OK`:
```json
{
  "message": "Logged in successfully!",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "name": "Test User",
    "email": "testuser@example.com",
    "username": "testuser",
    "storageUsed": 0,
    "storageLimit": 5368709120
  }
}
```

> 💡 **Postman Tip:** Add this to the **Tests** tab to auto-save the JWT:
> ```javascript
> if (pm.response.code === 200) {
>     var data = pm.response.json();
>     pm.environment.set("jwtToken", data.token);
> }
> ```

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `404`  | `{ "message": "User not found" }` |
| `400`  | `{ "message": "Email not verified" }` |
| `400`  | `{ "message": "Invalid credentials" }` |
| `400`  | `{ "message": "Invalid authenticator code" }` |

---

### 6. 🔒 Protected Routes

Once you have the `jwtToken`, use it for any protected endpoint:

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

The auth middleware will:
- Validate the token
- Attach `req.user` with the full user object (excluding `password`, `otp`, `totpSecret`)
- Return `401` if token is missing/invalid/expired
- Return `403` if email is not verified

---

### 7. 📤 Upload File

**`POST {{baseUrl}}/api/files/upload`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**Body:** Select `form-data` in Postman
| Key    | Type | Value              |
|--------|------|--------------------|
| `file` | File | *(select a file)*  |

> ⚠️ Max file size: **50MB**

**✅ Success Response** `201 Created`:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "name": "resume.pdf",
    "size": 204800,
    "mimeType": "application/pdf",
    "uploadedAt": "2026-04-18T17:00:00.000Z"
  }
}
```

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `400`  | `{ "message": "No file provided" }` |
| `400`  | `{ "message": "Storage limit exceeded" }` |
| `401`  | `{ "message": "Unauthorized. No token provided." }` |

---

### 8. 📁 List Files

**`GET {{baseUrl}}/api/files`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Files fetched",
  "count": 2,
  "files": [
    {
      "_id": "664a1b2c3d4e5f6a7b8c9d0e",
      "originalName": "resume.pdf",
      "mimeType": "application/pdf",
      "size": 204800,
      "createdAt": "2026-04-18T17:00:00.000Z"
    }
  ]
}
```

---

### 9. 📥 Download File

**`GET {{baseUrl}}/api/files/download/:fileId`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

Replace `:fileId` with the actual file ID from the upload/list response.

**✅ Success Response** `200 OK`:
```json
{
  "message": "Download link generated",
  "fileName": "resume.pdf",
  "downloadUrl": "https://s3.us-east-005.backblazeb2.com/rvaultstorage2110/uploads/...?X-Amz-Signature=...",
  "expiresIn": "1 hour"
}
```

---

### 10. 🗑️ Delete File

**`DELETE {{baseUrl}}/api/files/:fileId`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "File deleted",
  "fileId": "664a1b2c3d4e5f6a7b8c9d0e"
}
```

---

### 11. 💾 Storage Info

**`GET {{baseUrl}}/api/files/storage`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "storageUsed": 204800,
  "storageLimit": 5368709120,
  "storageUsedMB": "0.20",
  "storageLimitGB": "5.00",
  "percentUsed": "0.00"
}
```

---

## 👤 User Profile & Account

### 12. 👤 Get Profile

**`GET {{baseUrl}}/api/user/profile`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Profile fetched",
  "user": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "name": "Test User",
    "email": "testuser@example.com",
    "username": "testuser",
    "isVerified": true,
    "storageUsed": 204800,
    "storageLimit": 5368709120,
    "storageUsedMB": "0.20",
    "storageLimitGB": "5.00",
    "joinedAt": "2026-04-18T16:00:00.000Z"
  }
}
```

---

### 13. 📦 My Uploads (Paginated)

**`GET {{baseUrl}}/api/user/uploads?page=1&limit=20`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Uploads fetched",
  "page": 1,
  "totalPages": 1,
  "totalFiles": 2,
  "files": [
    {
      "_id": "664a1b2c3d4e5f6a7b8c9d0e",
      "originalName": "resume.pdf",
      "mimeType": "application/pdf",
      "size": 204800,
      "createdAt": "2026-04-18T17:00:00.000Z"
    }
  ]
}
```

---

### 14. ✏️ Update Profile

**`PUT {{baseUrl}}/api/user/profile`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type  | application/json |
| Authorization | Bearer `{{jwtToken}}` |

**Body (raw JSON):**
```json
{
  "name": "New Name",
  "username": "newusername"
}
```

**✅ Success Response** `200 OK`:
```json
{
  "message": "Profile updated",
  "user": {
    "name": "New Name",
    "email": "testuser@example.com",
    "username": "newusername"
  }
}
```

---

### 15. 🔑 Change Password

**`PUT {{baseUrl}}/api/user/change-password`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type  | application/json |
| Authorization | Bearer `{{jwtToken}}` |

**Body (raw JSON):**
```json
{
  "currentPassword": "SecureP@ss123",
  "newPassword": "NewSecureP@ss456"
}
```

**✅ Success Response** `200 OK`:
```json
{
  "message": "Password changed successfully"
}
```

---

### 16. 🧹 Delete Account

**`DELETE {{baseUrl}}/api/user/account`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type  | application/json |
| Authorization | Bearer `{{jwtToken}}` |

**Body (raw JSON):**
```json
{
  "password": "NewSecureP@ss456"
}
```

**✅ Success Response** `200 OK`:
```json
{
  "message": "Account deleted successfully"
}
```

---

## 📋 Clipboard (Clip) Routes

### 17. 📎 Save Clip

**`POST {{baseUrl}}/api/clip/copy`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type  | application/json |
| Authorization | Bearer `{{jwtToken}}` |

**Body (raw JSON):**
```json
{
  "content": "secret text or code snippet",
  "label": "My API key",
  "type": "text"
}
```

**✅ Success Response** `201 Created`:
```json
{
  "message": "Clip saved!",
  "clip": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "content": "secret text or code snippet",
    "label": "My API key",
    "type": "text",
    "expiresAt": "2026-04-19T17:00:00.000Z"
  }
}
```

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `400`  | `{ "message": "Content is required." }` |
| `400`  | `{ "message": "Invalid type. Use: text, code, url, secret" }` |

---

### 18. 📋 Paste Latest Clip

**`GET {{baseUrl}}/api/clip/paste`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Pasted!",
  "clip": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "content": "secret text or code snippet",
    "label": "My API key",
    "type": "text",
    "pasteCount": 1
  }
}
```

---

### 19. 📚 List Clips

**`GET {{baseUrl}}/api/clip`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "count": 1,
  "clips": [
    {
      "id": "664a1b2c3d4e5f6a7b8c9d0e",
      "content": "secret text or code snippet",
      "label": "My API key",
      "type": "text",
      "isPinned": false,
      "pasteCount": 1,
      "expiresAt": "2026-04-19T17:00:00.000Z",
      "createdAt": "2026-04-18T17:05:00.000Z"
    }
  ]
}
```

---

### 20. 📌 Pin / Unpin Clip

**`PATCH {{baseUrl}}/api/clip/:id/pin`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Clip pinned 📌",
  "isPinned": true
}
```

---

### 21. 🧼 Clear All Clips

**`DELETE {{baseUrl}}/api/clip/clear`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Clipboard cleared!",
  "deletedCount": 3
}
```

---

### 22. ❌ Delete Clip

**`DELETE {{baseUrl}}/api/clip/:id`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Clip deleted!",
  "clipId": "664a1b2c3d4e5f6a7b8c9d0e"
}
```

---

## ✉️ Inbox / Send File

### 23. 📤 Send File to Another User

**`POST {{baseUrl}}/api/inbox/send`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type  | application/json |
| Authorization | Bearer `{{jwtToken}}` |

**Body (raw JSON):**
```json
{
  "toUsername": "friend123",
  "fileId": "664a1b2c3d4e5f6a7b8c9d0e",
  "message": "Please review this file"
}
```

**✅ Success Response** `201 Created`:
```json
{
  "message": "File sent to @friend123 successfully!",
  "inbox": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "to": "friend123",
    "file": "resume.pdf",
    "message": "Please review this file",
    "expiresAt": "2026-04-19T17:05:00.000Z"
  }
}
```

**❌ Error Responses:**

| Status | Body |
|--------|------|
| `400`  | `{ "message": "You can't send a file to yourself." }` |
| `404`  | `{ "message": "User @friend123 not found on rvault." }` |
| `404`  | `{ "message": "File not found or access denied." }` |
| `400`  | `{ "message": "File already sent to @friend123." }` |

---

### 24. 📥 View Inbox

**`GET {{baseUrl}}/api/inbox`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "count": 1,
  "inbox": [
    {
      "id": "664a1b2c3d4e5f6a7b8c9d0e",
      "from": "@friend123",
      "fileName": "resume.pdf",
      "fileSize": "200.0 KB",
      "message": "Please review this file",
      "status": "pending",
      "receivedAt": "2026-04-18T17:10:00.000Z",
      "expiresAt": "2026-04-19T17:10:00.000Z"
    }
  ]
}
```

---

### 25. 📤 View Sent Files

**`GET {{baseUrl}}/api/inbox/sent`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "count": 1,
  "sent": [
    {
      "id": "664a1b2c3d4e5f6a7b8c9d0e",
      "to": "@friend123",
      "fileName": "resume.pdf",
      "fileSize": "200.0 KB",
      "message": "Please review this file",
      "status": "pending",
      "sentAt": "2026-04-18T17:10:00.000Z",
      "expiresAt": "2026-04-19T17:10:00.000Z"
    }
  ]
}
```

---

### 26. ⬇️ Download from Inbox

**`GET {{baseUrl}}/api/inbox/:inboxId/download`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Download ready!",
  "fileName": "resume.pdf",
  "downloadUrl": "https://s3.us-east-005.backblazeb2.com/rvaultstorage2110/uploads/...?X-Amz-Signature=..."
}
```

---

### 27. 🗑️ Reject Inbox Item

**`DELETE {{baseUrl}}/api/inbox/:inboxId`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "File removed from inbox."
}
```

---

## 🔗 Shared Links

### 28. 🌐 Create Shared Link

**`POST {{baseUrl}}/api/share`**

**Headers:**
| Key          | Value            |
|--------------|------------------|
| Content-Type  | application/json |
| Authorization | Bearer `{{jwtToken}}` |

**Body (raw JSON):**
```json
{
  "fileId": "664a1b2c3d4e5f6a7b8c9d0e",
  "expiry": "24h",
  "maxDownloads": 5
}
```

**✅ Success Response** `201 Created`:
```json
{
  "message": "Shared link created",
  "link": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "token": "abc123def456...",
    "url": "https://rvault.dev/s/abc123def456...",
    "expiresAt": "2026-04-19T17:15:00.000Z",
    "maxDownloads": 5
  }
}
```

---

### 29. 🔓 Access Shared Link (Public)

**`GET {{baseUrl}}/api/share/access/:token`**

No authentication required.

**✅ Success Response** `200 OK` (API request):
```json
{
  "message": "Download link generated",
  "file": {
    "name": "resume.pdf",
    "mimeType": "application/pdf",
    "size": 204800
  },
  "downloadUrl": "https://s3.us-east-005.backblazeb2.com/rvaultstorage2110/uploads/...?X-Amz-Signature=...",
  "expiresIn": "1 hour",
  "downloadsUsed": 1,
  "downloadsRemaining": 4
}
```

> 💡 For browser access, this endpoint can render a shared download page.

---

### 30. ⬇️ Download via Shared Token

**`GET {{baseUrl}}/api/share/download/:token`**

No authentication required.

**Behavior:**
- Redirects to a presigned B2 download URL
- Increments the shared link download count
- Marks the link expired once max downloads are reached

**✅ Expected Result:** Browser redirects to the file download URL.

---

### 31. 📜 List Shared Links

**`GET {{baseUrl}}/api/share`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Shared links fetched",
  "links": [ /* shared link objects */ ]
}
```

---

### 32. 🛑 Revoke Shared Link

**`DELETE {{baseUrl}}/api/share/:linkId`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Shared link deleted"
}
```

---

### 33. 📊 Shared Link Stats

**`GET {{baseUrl}}/api/share/stats/:linkId`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Shared link stats",
  "stats": {
    "downloads": 3,
    "expiresAt": "2026-04-19T17:15:00.000Z",
    "maxDownloads": 5
  }
}
```

---

## 🛡️ Admin Routes

> These routes require both a valid JWT and the authenticated user to have admin access.

### 34. 📈 Admin Dashboard Stats

**`GET {{baseUrl}}/api/admin/stats`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "Admin dashboard stats",
  "stats": {
    "totalUsers": 12,
    "totalFiles": 150,
    "totalStorageUsed": 123456789,
    "totalStorageUsedMB": "117.74",
    "totalStorageUsedGB": "0.11",
    "totalStorageLimit": 64424509440,
    "totalStorageLimitGB": "60.00"
  }
}
```

---

### 35. 👥 List All Users

**`GET {{baseUrl}}/api/admin/users?page=1&limit=20`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "All users",
  "page": 1,
  "totalPages": 1,
  "totalUsers": 12,
  "users": [ /* user summaries */ ]
}
```

---

### 36. 📂 List All Files

**`GET {{baseUrl}}/api/admin/files?page=1&limit=20`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "All files",
  "page": 1,
  "totalPages": 1,
  "totalFiles": 150,
  "files": [ /* file records with user info */ ]
}
```

---

### 37. 🧾 Get User Details

**`GET {{baseUrl}}/api/admin/users/:userId`**

**Headers:**
| Key           | Value                  |
|---------------|------------------------|
| Authorization | Bearer `{{jwtToken}}`  |

**✅ Success Response** `200 OK`:
```json
{
  "message": "User details",
  "user": { /* user profile */ },
  "files": [ /* user file list */ ],
  "fileCount": 5
}
```

---

## 🧪 Step-by-Step Testing Workflow

Follow this exact order to test the full auth flow:

```
┌──────────────────────────────────────────────────┐
│ 1. GET  /health              → Confirm server up │
│                                                  │
│ 2. POST /api/auth/register   → Get userId        │
│       ↓                                          │
│ 3. Check email for OTP                           │
│       ↓  (didn't get it?)                        │
│ 3b. POST /api/auth/resend-otp                    │
│       ↓                                          │
│ 4. POST /api/auth/verify-otp → Get QR code       │
│       ↓                                          │
│ 5. Scan QR in Google Authenticator               │
│       ↓                                          │
│ 6. POST /api/auth/login      → Get JWT token     │
│       ↓                                          │
│ 7. Use token in Authorization header for         │
│    all future protected requests                 │
└──────────────────────────────────────────────────┘
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot POST /api/auth/register` (404) | Routes not mounted — ensure `server.js` has `app.use("/api/auth", authRoutes)` |
| `ECONNREFUSED` | Server not running — run `npm start` |
| `MongoServerError` | Check `MONGODB_URI` in `.env` or network connectivity |
| OTP never arrives | Check `RESEND_API_KEY` in `.env` and verify sender domain |
| TOTP always invalid | Ensure device clock is synced (TOTP is time-based) |
| `Token expired` | JWT expires after 30 days — re-login |
