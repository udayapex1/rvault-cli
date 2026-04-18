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

### 6. 🔒 Using JWT for Protected Routes (Future)

Once you have the `jwtToken`, use it for any future protected endpoint:

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
