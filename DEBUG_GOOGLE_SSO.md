# Debug Google SSO Internal Server Error

## Changes Made

Added comprehensive logging to track down the Internal Server Error:

### Files Updated
1. `src/handler/google_auth.rs` - Added logging at each step
2. `src/manager/biz/google_auth.rs` - Added detailed error logging

### Logging Added

**Handler Level:**
- Request received
- Email verification check
- JWT generation
- Success/failure messages

**Service Level:**
- Token exchange with Google
- User info fetch from Google
- Database operations (find/create user)
- Avatar updates

## How to Debug

### 1. Rebuild and Run Backend
```bash
cd philand
cargo build
cargo run
```

### 2. Watch the Logs
The backend will now output detailed logs showing:
- ✅ "Google auth request received"
- ✅ "Exchanging Google auth code for token"
- ✅ "Redirect URI: ..."
- ✅ "Successfully exchanged code for Google token"
- ✅ "Fetching user info from Google"
- ✅ "Successfully fetched user info for: email@example.com"
- ✅ "Finding or creating user for email: ..."
- ✅ "Generating JWT token for user: ..."
- ✅ "Google auth successful for user: ..."

### 3. Try Google Login Again
1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Complete the OAuth flow
4. Watch the backend terminal for logs

### 4. Common Errors to Look For

#### Error: "Google token exchange failed with status 400"
**Possible causes:**
- Invalid authorization code (code already used or expired)
- Redirect URI mismatch
- Invalid client credentials

**Check logs for:**
```
Google token exchange failed with status 400: {
  "error": "invalid_grant",
  "error_description": "Bad Request"
}
```

**Solution:**
- Verify `GOOGLE_REDIRECT_URI` in `.env` matches Google Console
- Ensure code is fresh (not reused)

#### Error: "Google user info request failed with status 401"
**Possible causes:**
- Invalid access token
- Token expired

**Check logs for:**
```
Google user info request failed with status 401: ...
```

#### Error: "Database error checking for existing user"
**Possible causes:**
- Database connection issue
- Table doesn't exist
- Column mismatch

**Check logs for:**
```
Database error checking for existing user: ...
```

**Solution:**
- Verify database connection
- Check users table schema

#### Error: "Failed to create new user"
**Possible causes:**
- Missing required columns
- Constraint violation
- Invalid data types

**Check logs for:**
```
Failed to create new user: ...
```

### 5. Test with curl (Optional)

If you want to test the backend directly, you need a valid Google authorization code:

```bash
# This won't work directly because you need a real code from Google OAuth flow
curl -X POST http://localhost:8080/auth/google \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_ACTUAL_GOOGLE_CODE"}'
```

## Expected Log Flow (Success)

```
[INFO] Google auth request received
[INFO] Exchanging Google auth code for token
[DEBUG] Redirect URI: http://localhost:3000/auth/google/callback
[INFO] Successfully exchanged code for Google token
[INFO] Fetching user info from Google
[INFO] Successfully fetched user info for: user@gmail.com
[INFO] Finding or creating user for email: user@gmail.com
[INFO] Creating new user for email: user@gmail.com
[INFO] Successfully created user: uuid-here
[INFO] Generating JWT token for user: uuid-here
[INFO] Google auth successful for user: user@gmail.com
```

## Expected Log Flow (Existing User)

```
[INFO] Google auth request received
[INFO] Exchanging Google auth code for token
[DEBUG] Redirect URI: http://localhost:3000/auth/google/callback
[INFO] Successfully exchanged code for Google token
[INFO] Fetching user info from Google
[INFO] Successfully fetched user info for: user@gmail.com
[INFO] Finding or creating user for email: user@gmail.com
[INFO] Found existing user: uuid-here
[INFO] Generating JWT token for user: uuid-here
[INFO] Google auth successful for user: user@gmail.com
```

## Next Steps

1. **Run the backend** with `cargo run`
2. **Try Google login** again
3. **Copy the error logs** from the terminal
4. **Share the logs** so we can identify the exact issue

The logs will tell us exactly where the error is happening:
- Token exchange with Google?
- Fetching user info?
- Database operation?
- JWT generation?
