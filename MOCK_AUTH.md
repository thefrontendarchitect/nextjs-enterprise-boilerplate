# Mock Authentication Guide

## Overview
The application includes a mock authentication system for development purposes, allowing you to access protected routes without a real backend API.

## How to Use

### 1. Enable Mock API
The mock API is already enabled in `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_API=true
```

### 2. Login
1. Navigate to http://localhost:3000/login
2. Enter **any** email address (e.g., `test@example.com`)
3. Enter **any** password (e.g., `password123`)
4. Click "Sign In"

You will be redirected to the dashboard at `/dashboard`.

### 3. Features Available with Mock Auth
- ✅ Login with any credentials
- ✅ Access protected routes (dashboard, settings, etc.)
- ✅ Logout functionality
- ✅ Token refresh simulation
- ✅ User profile mock data

### 4. Mock Data
The mock system provides:
- **Access Token**: `mock-jwt-token-[random]`
- **Refresh Token**: `mock-refresh-token-[random]`
- **User Data**:
  - ID: `user-123`
  - Name: `Test User`
  - Email: The email you entered during login
  - Avatar: `/avatar.jpg`

### 5. Disable Mock API
To use a real API, set in `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://your-real-api.com
```

## Technical Details

### Files Modified
- `src/modules/auth/api/auth.api.ts` - Mock login, logout, and refresh endpoints
- `src/modules/user/api/user.api.ts` - Mock user profile endpoint
- `src/config/env.ts` - Added `NEXT_PUBLIC_USE_MOCK_API` environment variable
- `.env.local` - Configuration file

### How It Works
1. When `NEXT_PUBLIC_USE_MOCK_API=true`, API calls return mock data instead of making real HTTP requests
2. Mock tokens are stored in localStorage just like real tokens
3. The auth service works normally, unaware it's using mock data
4. Network delays are simulated (300-500ms) for realistic UX

## Troubleshooting

### Login Not Working?
1. Check that the dev server is running: `npm run dev`
2. Verify `.env.local` has `NEXT_PUBLIC_USE_MOCK_API=true`
3. Try refreshing the page (Cmd+R or Ctrl+R)
4. Clear browser localStorage and try again

### Can't Access Dashboard?
1. Make sure you're logged in first
2. Check browser console for any errors
3. Verify tokens are stored in localStorage (open DevTools → Application → Local Storage)

## Notes
- This is for **development only** - never use in production
- All mock responses simulate success - no error cases
- Passwords are not validated - any password works
- Sessions persist until you logout or clear localStorage