# Deployment Guide

## Deploy to Railway (Recommended)

Railway is free and easy to use for small projects.

### Step 1: Push to GitHub
```bash
cd ..
git add .
git commit -m "Add backend with authentication"
git push origin main
```

### Step 2: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Authorize Railway to access your repositories

### Step 3: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select the `/backend` directory as the root

### Step 4: Configure Environment Variables
1. In Railway dashboard, go to your project
2. Click "Variables"
3. Add these variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a strong random string, e.g., using: https://generate-random.org/)
   - `PORT` = (Railway will set this automatically, but you can leave empty)

### Step 5: Get Your Server URL
1. Go to "Deployments" 
2. Click on the successful deployment
3. Under "Networking", copy your public URL
4. It will look like: `https://your-app-abc123.railway.app`

### Step 6: Update Flutter App
In `lib/services/api_service.dart`, change:
```dart
static const String baseUrl = 'https://your-app-abc123.railway.app/api';
```

## Alternative: Render.com

If Railway has issues:

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your GitHub repo
5. Select `/backend` as root directory
6. Environment: Node
7. Build command: `npm install`
8. Start command: `npm start`
9. Add environment variables (same as Railway)
10. Deploy!

## Alternative: Fly.io

1. Install Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Run: `flyctl auth login`
3. In backend folder: `flyctl launch`
4. Answer prompts
5. Run: `flyctl deploy`

## Important Security Notes

⚠️ **BEFORE DEPLOYING TO PRODUCTION:**

1. **Change JWT_SECRET**
   - Generate a strong random string
   - Never use the default value
   - Use: https://generate-random.org/ or similar

2. **Update CORS**
   - Edit `server.js` line with `cors()` to:
   ```javascript
   app.use(cors({
     origin: ['https://yourappurl.com', 'http://localhost:3000'],
     credentials: true
   }));
   ```

3. **Enable HTTPS**
   - Railway and Render provide free HTTPS
   - Always use `https://` in production

4. **Database Backups**
   - Railway automatically backs up your database
   - Configure backups in Railway dashboard

## Testing After Deployment

1. Update Flutter app baseUrl
2. Run: `flutter pub get`
3. Hot reload or restart app
4. Try registering a new account
5. Check if data syncs properly

## Troubleshooting

If deployment fails:
- Check logs in Railway/Render dashboard
- Verify `package.json` exists
- Ensure `npm install` works locally
- Check Node version (should be 16+ for bcrypt)

If API calls fail from Flutter:
- Check baseUrl matches deployed URL exactly
- Check CORS settings
- Look at Network tab in browser dev tools
- Check server logs in deployment dashboard
