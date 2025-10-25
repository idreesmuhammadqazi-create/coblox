# 🚀 Deploy BlockVerse - Super Easy Guide

**Your Minecraft clone is now optimized for easy deployment!**

## ✨ What Changed (You'll Love This)

| Before | After |
|--------|-------|
| 662MB world files | **296KB** (99.96% smaller!) |
| MongoDB Atlas setup required | **SQLite** (auto-created, zero config) |
| 8-10 deployment steps | **2-3 steps** |
| Limited platform support | **Works everywhere** |

---

## 🎯 Quick Deploy Options

### Option 1: Docker (Recommended - Works Anywhere!)

**Prerequisites:** Docker installed

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/coblox.git
cd coblox

# 2. Set JWT secret (or it uses default)
export JWT_SECRET=$(openssl rand -hex 32)

# 3. Deploy!
docker-compose up -d
```

**That's it!** Visit http://localhost:3000

---

### Option 2: Railway (One-Click Deploy)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/coblox)

**Steps:**
1. Click the button above
2. Set `JWT_SECRET` environment variable
3. Deploy!

**Done!** Railway gives you a URL automatically.

---

### Option 3: Render (Free Tier)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Steps:**
1. Click button above
2. Connect your GitHub repo
3. Render auto-detects settings from `render.yaml`
4. Add `JWT_SECRET` in environment variables
5. Deploy!

**Note:** Render now requires credit card verification (but stays free).

---

### Option 4: Glitch (No Credit Card!)

1. Go to https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Paste your repo URL
4. Edit `.env` file:
   ```
   JWT_SECRET=your_random_secret_here
   PORT=3000
   NODE_ENV=production
   ```
5. Done! Auto-deploys.

**URL:** `https://your-project.glitch.me`

---

### Option 5: Replit (Also No Credit Card!)

1. Go to https://replit.com
2. Click "Create Repl" → "Import from GitHub"
3. Paste your repo URL
4. Add secrets (🔒 icon):
   - `JWT_SECRET`: Generate random string
5. Click "Run"

**URL:** Provided by Replit

---

## 🔑 Environment Variables

### Required:
- **`JWT_SECRET`**: Random string for authentication
  - Generate: `openssl rand -hex 32`
  - Or use: https://generate-secret.vercel.app/64

### Optional:
- `PORT`: Server port (default: 3000)
- `VITE_APP_TITLE`: Your game title (default: "BlockVerse")
- `DB_PATH`: Database location (default: data/blockverse.db)

**That's it!** No MongoDB needed anymore! 🎉

---

## 📦 What You Get

After deploying:
- ✅ User registration & login
- ✅ Character creation with avatar customization
- ✅ **Procedurally generated infinite worlds** 🌍
- ✅ Real-time multiplayer with Socket.io
- ✅ Friends system
- ✅ Notifications
- ✅ SQLite database (auto-created)
- ✅ HTTPS enabled (on most platforms)

---

## 🌍 About World Generation

**New!** Worlds are now **procedurally generated**:
- 🎲 Each world has a unique seed
- 🗺️ Infinite terrain generation
- 🌲 Trees, hills, mountains, water
- 💾 Zero storage needed
- ⚡ Generates on-demand

No more 662MB downloads!

---

## 🐛 Troubleshooting

### Build Fails
- **Error:** `Cannot find module 'better-sqlite3'`
- **Fix:** Run `npm install better-sqlite3 --build-from-source`

### Database Issues
- **Error:** `SQLITE_CANTOPEN`
- **Fix:** Ensure `data/` directory exists and is writable
- **Docker:** Already handled with volume mount

### Port Already in Use
- **Error:** `EADDRINUSE`
- **Fix:** Change `PORT` environment variable to another port (e.g., 3001)

### Cold Starts (Free Tiers)
- **Glitch:** Sleeps after 5 min → Use UptimeRobot.com
- **Replit:** Sleeps after 1 hour → Use UptimeRobot.com
- **Render:** Sleeps after 15 min → Upgrade or use UptimeRobot.com

---

## 📊 Platform Comparison

| Platform | Credit Card? | Free Forever? | Setup Time | Cold Starts |
|----------|-------------|---------------|------------|-------------|
| **Docker (Local)** | ❌ No | ✅ Yes | 2 min | Never |
| **Glitch** | ❌ No | ✅ Yes | 3 min | 5 min |
| **Replit** | ❌ No | ✅ Yes | 5 min | 1 hour |
| **Railway** | ⚠️ Trial | ❌ $5/mo after | 2 min | Never |
| **Render** | ⚠️ Required | ✅ Yes | 10 min | 15 min |
| **Fly.io** | ⚠️ Required | ⚠️ Credits | 5 min | Never |

---

## 🔧 Development

### Local Development:
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Location:
- Development: `data/blockverse.db`
- Docker: Mounted to `./data` (persists across restarts)
- Cloud: Platform-specific persistent storage

---

## 📚 More Info

- **Full deployment guides:** See `DEPLOYMENT-ALTERNATIVES.md`
- **Refactoring details:** See `REFACTORING-STATUS.md`
- **Setup guide:** See `SETUP.md`

---

## 🎉 That's It!

Your BlockVerse clone is now **deployment-ready**:
- 99.96% smaller
- No external database needed
- Works on free platforms
- Infinite procedural worlds

**Deploy and enjoy!** 🎮

---

**Need help?** Check the troubleshooting section above or open an issue on GitHub.
