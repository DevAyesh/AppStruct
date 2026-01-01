# Deployment Guide - Free Tier (Vercel + Render + MongoDB Atlas)

This guide will help you deploy your AppStruct application using 100% free services.

## 📋 Prerequisites

- GitHub account with your code pushed
- MongoDB Atlas account (free tier)
- Render.com account (sign up with GitHub)
- Vercel account (sign up with GitHub)

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a free M0 cluster
3. Setup database user with username and password
4. Whitelist IP: 0.0.0.0/0 (allow all)
5. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/appstruct?retryWrites=true&w=majority`

**Note**: Your current connection string is in `server/.env` - you can use that or create a new one.

---

## 🔧 Step 2: Deploy Backend to Render.com

### 2.1 Create Web Service
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select this repository

### 2.2 Configure Service
- **Name**: `appstruct-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `server` ← **IMPORTANT!**
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Instance Type**: **Free**

### 2.3 Add Environment Variables
Click "Advanced" and add these variables:

```
MONGODB_URI=mongodb+srv://app_struct:123@cluster0.5zyt8fr.mongodb.net/appstruct?retryWrites=true&w=majority&appName=Cluster0

PORT=5000

JWT_SECRET=REPLACE_WITH_RANDOM_STRING_AT_LEAST_32_CHARACTERS

DEEPSEEK_API_KEY=your_deepseek_api_key_here

NODE_ENV=production

FRONTEND_URL=https://your-app-name.vercel.app
```

**Generate JWT_SECRET**: Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. **COPY YOUR BACKEND URL**: `https://appstruct-backend.onrender.com`

---

## 🌐 Step 3: Update Configuration with Backend URL

### 3.1 Update `.env.production` file
Replace the content with your actual Render URL:

```
REACT_APP_API_URL=https://appstruct-backend.onrender.com
```
(Use YOUR actual URL from Step 2.4)

### 3.2 Commit and Push
```bash
git add .
git commit -m "Update backend URL for production"
git push
```

---

## 🚀 Step 4: Deploy Frontend to Vercel

### 4.1 Create New Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import this repository

### 4.2 Configure Project
- **Framework Preset**: Create React App (auto-detected)
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 4.3 Add Environment Variable
Click **"Environment Variables"** and add:

```
Name: REACT_APP_API_URL
Value: https://appstruct-backend.onrender.com
```
(Use YOUR actual Render URL from Step 2.4)

Check all three: Production, Preview, Development

### 4.4 Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. **COPY YOUR FRONTEND URL**: `https://appstruct-abc123.vercel.app`

---

## 🔄 Step 5: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Go to your `appstruct-backend` service
3. Click **"Environment"** in left sidebar
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://appstruct-abc123.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy (2-3 minutes)

---

## ✅ Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Sign up for a new account
3. Generate a blueprint
4. Check saved blueprints

### ⚠️ First Load Note
The backend on Render free tier **sleeps after 15 minutes** of inactivity. 
The first request after sleep takes **30-60 seconds** to wake up. This is normal!

---

## 📊 Summary

**Total Cost: $0/month** 

- ✅ Frontend: Vercel (Free forever, always fast)
- ✅ Backend: Render (Free, sleeps after 15 min)
- ✅ Database: MongoDB Atlas (Free, 512MB)

---

## 🔄 Future Updates

Both Vercel and Render are connected to your GitHub repository:
- Push to GitHub → Both services auto-deploy
- Check deployment logs on each dashboard

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is set in Vercel
- Check browser console for CORS errors
- Ensure `FRONTEND_URL` is set correctly on Render

### "Cold Start" is too slow
- This is expected on free tier
- Consider upgrading to Render paid tier ($7/month) for always-on

---

## 📝 Next Steps

1. Change MongoDB password from `123` to something more secure
2. Add custom domain on Vercel (free)
3. Setup monitoring with Render's built-in logs
4. Consider upgrading if you need always-on backend

---

Need help? Check:
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com

