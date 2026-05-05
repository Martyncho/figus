# Session Recovery Testing Guide

## What Was Implemented

### Session Recovery System - Production Grade
The app now has professional session persistence across page refreshes with zero data loss.

**Key Components:**
1. **Backend Verify Endpoint** (`POST /api/auth/verify`)
   - Validates JWT token from Authorization header
   - Returns complete user data on success
   - Returns 401 if token is invalid/expired

2. **Frontend Auth Service Methods**
   - `verifyToken(token?)` - Validates token and retrieves user data
   - `recoverSession()` - Runs on app mount, checks localStorage for token, validates with server
   - Enhanced to use the new verify endpoint

3. **React App Session Recovery**
   - useEffect hook runs on app mount
   - Shows "Verificando sesión..." loading screen with animated sticker
   - Automatically restores user session if token is valid
   - Falls back to login screen only if token is invalid/expired

4. **localStorage Token Storage**
   - Tokens persisted in localStorage after successful login
   - Automatically cleared only on logout or when invalid

### Code Files Modified

1. **frontend-web/src/services/auth.ts**
   - Added `verifyToken()` method that calls /api/auth/verify endpoint
   - Added `recoverSession()` method that checks localStorage and validates token
   - Enhanced `logout()` to clear all app state

2. **frontend-web/src/App.tsx**
   - Added session recovery useEffect on app mount
   - Shows loading screen while verifying session
   - Automatically logs in user if token is valid
   - Added detailed console.log debugging statements

3. **backend/src/controllers/authController.ts**
   - Enhanced `verifyToken()` controller to return full user data
   - Queries database for complete user profile on token verification

4. **frontend-web/src/index.css**
   - Added pulse animation for loading screen

## How to Test

### Test 1: Basic Session Persistence (Desktop/Browser)

1. Open app in browser: http://localhost:5173
2. Login with: 
   - Email: test2@test.com
   - Password: password123
3. See dashboard with sticker collection
4. **CRITICAL TEST:** Press F5 or manually refresh the page
   - Expected: See "Verificando sesión..." loading screen briefly
   - Then dashboard should load (NO login screen)
   - Your sticker collection should still be there

### Test 2: Logout Security

1. Login (as in Test 1)
2. Add a few stickers to your collection
3. Click "Salir" (logout button)
4. Verify you're back at login screen
5. Login with DIFFERENT email (if available) or same email
6. Previous user's collection should NOT be visible
7. You should have a fresh empty collection

### Test 3: Mobile Testing (Android Device)

1. Open app on Android at: http://192.168.0.21:5173
2. Login with same credentials
3. Add some stickers
4. Press phone's back button or rotate device
5. Press home button and reopen the browser
6. **CRITICAL:** Return to the app URL
   - Expected: Dashboard loads directly (NO login screen)
   - Your collection still intact
7. Try again after several minutes - should still be logged in (token valid for 7 days)

### Test 4: Token Expiration (Advanced)

After 7 days, tokens expire automatically:
- App will attempt to recover session
- If token is expired (7 days old), verify endpoint returns 401
- User automatically sent to login screen
- This is the expected behavior

## Debugging Information

If session recovery doesn't work, check browser console (F12) for messages:

- `[recoverUserSession] Starting session recovery...` - Session recovery beginning
- `[recoverSession] Token from localStorage: EXISTS` - Token found
- `[recoverSession] Calling verifyToken...` - Verifying with server
- `[recoverSession] verifyToken returned: testuser` - Successful verification
- `[recoverSession] Session recovered successfully for user: testuser` - All good

If you see errors like "Session recovery failed", check:
1. Backend API is running: `docker-compose ps`
2. /api/auth/verify endpoint responds: Test in Postman or curl
3. Token is valid (not expired, not corrupted)

## Deployment Checklist

Before testing on the actual device:

- [ ] All code changes saved and committed
- [ ] Containers rebuilt with latest code
- [ ] API service restarted
- [ ] Frontend service restarted
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] localhost:5173 loads fresh (no old cached version)

## Expected Behavior Timeline

1. **Page loads** → App checks localStorage for token
2. **0-1 second** → Shows loading screen if token exists
3. **Loading screen shows** → Verifying token with /api/auth/verify
4. **1-2 seconds** → Either:
   - Dashboard loads (token valid)
   - OR login screen (token invalid/missing)

## Files to Reference

- Session recovery guide: SESSION_RECOVERY_GUIDE.md
- Auth service: frontend-web/src/services/auth.ts
- App component: frontend-web/src/App.tsx
- Backend verify endpoint: backend/src/controllers/authController.ts

## Important Notes

- Session persistence is transparent to the user
- No additional login required after page refresh IF token is valid
- Token lasts 7 days (configured in backend)
- After logout, fresh start is required
- Works across all browsers and devices on same network

