# Railway Environment Variables Setup

## Step-by-Step Instructions

### 1. Login to Railway Dashboard
- Go to: https://railway.app/dashboard
- Select your project
- You should see your deployment

### 2. Navigate to Variables Section
- Click on your **Web Service** (the one with your backend code)
- In the left sidebar, click **"Variables"**

### 3. Add Environment Variables

You need to add **3 variables**. Click "Add Variable" for each one:

#### Variable 1: NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- Click "Add"

#### Variable 2: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Generate a strong random string. Choose ONE of these options:

**Option A: Online Generator** (Easy)
1. Go to: https://generate-random.org/
2. Set "Type" to "Random String"
3. Set "Length" to 32
4. Click "Generate"
5. Copy the result
6. Paste it as the value

**Option B: Command Line** (If you have Node.js)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C: Manual** (Simple but less secure)
Use something like: `my-super-secret-key-xyz-2024-abc123def456`

Then add it:
- **Key**: `JWT_SECRET`
- **Value**: (paste your generated string here)
- Click "Add"

#### Variable 3: PORT
- **Key**: `PORT`
- **Value**: `3000`
- Click "Add"

### 4. Verify Variables Are Set
You should see a table with 3 rows:
```
NODE_ENV    | production
JWT_SECRET  | (your-generated-string)
PORT        | 3000
```

### 5. Redeploy
- Go to **"Deployments"** tab
- Click the **"Redeploy"** button on your latest deployment
- Railway will restart with new environment variables

### 6. Check Deployment Status
- Wait for status to change to "✓ Success"
- You can now use the public URL

---

## Important Security Notes

⚠️ **DO NOT:**
- Share your JWT_SECRET publicly
- Use the same JWT_SECRET as other projects
- Use simple/guessable strings

✅ **DO:**
- Keep JWT_SECRET strong (32+ characters)
- Use different secrets for dev, staging, production
- Never commit .env file to GitHub (already in .gitignore)

---

## What These Variables Do

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | Tells Node.js to optimize for production |
| `JWT_SECRET` | Secret key for signing/verifying authentication tokens |
| `PORT` | Port the server listens on (Railway sets this automatically) |

## Testing After Setup

1. Get your public URL from Railway:
   - Go to **Deployments** → Latest Deployment
   - Under "Networking", copy your URL
   - It looks like: `https://your-project-abc123.railway.app`

2. Test the API is working:
   - Open in browser: `https://your-project-abc123.railway.app/api/health`
   - Should show: `{"status":"ok"}`

3. Update Flutter app:
   - In `lib/services/api_service.dart` line 7:
   ```dart
   static const String baseUrl = 'https://your-project-abc123.railway.app/api';
   ```

4. Run Flutter app:
   ```bash
   flutter pub get
   flutter run
   ```

---

## Troubleshooting

**Variables not showing?**
- Click "Raw Editor" instead if visual editor has issues
- Paste: `NODE_ENV=production\nJWT_SECRET=your-secret\nPORT=3000`

**Deployment failed after adding variables?**
- Check the Logs tab for error messages
- Common issue: JWT_SECRET with special characters needs to be quoted

**Can't connect from Flutter?**
- Verify URL matches exactly (including https://)
- Check Railway logs for connection errors
- Make sure variables were saved (refresh page)

