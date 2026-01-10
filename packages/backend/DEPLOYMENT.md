# Cloud Deployment Guide for Pager Backend

## 🚀 Deploy to Railway (Recommended)

Railway is the easiest way to deploy your NestJS backend with PostgreSQL and Redis.

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository

### Step 1: Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account and select the pager-system repository

### Step 2: Configure Database Services
Railway will automatically detect your `railway.json` and set up services. You need to add:

1. **PostgreSQL Database**:
   - Railway auto-creates this
   - Copy the connection details from Railway dashboard

2. **Redis Database**:
   - Add Redis service from Railway dashboard
   - Copy Redis URL and password

### Step 3: Set Environment Variables
In Railway dashboard, go to your project settings and add these environment variables:

```
# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-here-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here-minimum-32-chars

# Supabase (if using Supabase for auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Push Notifications (optional)
FCM_SERVER_KEY=your-fcm-server-key
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-team-id
APNS_PRIVATE_KEY=your-apns-private-key

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-api-key
```

### Step 4: Deploy
Railway will automatically deploy when you push to main branch. Or you can manually trigger deployment.

### Step 5: Get Your API URL
After deployment, Railway will provide a URL like: `https://pager-backend-production.up.railway.app`

## 🔄 Alternative: Deploy to Vercel

If you prefer Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

## 🗄️ Database Migrations

After deployment, run migrations:
```bash
# For Railway, use the railway CLI or connect via psql
railway run npm run migration:run
```

## 🌐 Custom Domain (Optional)

To use a custom domain:
1. Go to Railway project settings
2. Add custom domain
3. Configure DNS records as instructed

## 📊 Monitoring

Your app includes health checks at `/api/health`. Railway will monitor this automatically.

## 🔒 Security Notes

- Never commit secrets to version control
- Use Railway's environment variables for all sensitive data
- Enable Railway's security features (HTTPS, etc.)
- Regularly rotate JWT secrets

## 🚀 Your API will be available at:
`https://your-railway-project.up.railway.app`

Update your mobile app's `constants.dart` with this URL!