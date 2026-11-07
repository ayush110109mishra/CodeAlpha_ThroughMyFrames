# Deployment Guide: Through My Frames 2.0

This production guide walks through deploying **Through My Frames 2.0** to cloud infrastructure:
- **Frontend**: [Vercel](https://vercel.com) (React 18 + Vite SPA)
- **Backend**: [Render](https://render.com) (Node.js + Express API)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 / Serverless Cloud)
- **Media Pipeline**: [Cloudinary](https://cloudinary.com) (Automated optimization & storage)

---

## Architecture & Correct Deployment Order

```
[ MongoDB Atlas ] <==== (MONGO_URI) ====\
                                         \
[ Cloudinary ]    <== (CLOUDINARY_*) ===== [ Render Web Service ] (Backend API)
                                                   ^
                                                   | (REST + JWT /api/*)
                                                   |
                                           [ Vercel SPA ] (Frontend React)
```

> [!IMPORTANT]
> **Follow the deployment sequence strictly**:
> 1. Set up **MongoDB Atlas** & **Cloudinary** accounts.
> 2. Deploy **Render Backend** first to obtain its live URL.
> 3. Deploy **Vercel Frontend** using the backend's live URL in `VITE_API_URL`.
> 4. Update Render's `CLIENT_URL` with your live Vercel domain and redeploy.

---

## Step 1: MongoDB Atlas Setup

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a Free Shared Cluster (`M0 Sandbox` tier).
3. **Database Access**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Create a user (e.g. `tmf_admin`) with a strong password. Grant **Read and write to any database** privileges.
4. **Network Access (CRITICAL)**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
   > *WHY: Render's free and starter tiers use dynamically rotating outbound IPs. Without `0.0.0.0/0`, database connections will fail on server spin-up.*
5. **Retrieve Connection String**:
   - In Clusters, click **Connect > Drivers**.
   - Copy the connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/through-my-frames-prod?retryWrites=true&w=majority
     ```
   - Notice the separate production database name `through-my-frames-prod` to avoid overwriting development data.

---

## Step 2: Cloudinary Media Storage Setup

1. Sign up or log into [Cloudinary](https://cloudinary.com).
2. On your Cloudinary Dashboard, copy:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)
3. Uploaded photos will automatically stream into the folder `through-my-frames` with on-the-fly `f_auto,q_auto` delivery.

---

## Step 3: Deploy Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub repository: `ayush110109mishra/CodeAlpha_ThroughMyFrames`.
4. Configure service settings:
   - **Name**: `through-my-frames-api`
   - **Region**: Closest to your users (e.g. `Singapore` or `Frankfurt`)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. **Advanced > Health Check Path**:
   - Enter: `/api/health`
6. **Environment Variables**:
   Add the following under Render's Environment tab:

   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security & hidden stack traces |
   | `PORT` | `10000` | Render defaults to port 10000 |
   | `MONGO_URI` | `mongodb+srv://...` | Connection URI from Step 1 |
   | `JWT_SECRET` | *(Generated random 32+ char key)* | Run `openssl rand -hex 32` locally to generate |
   | `JWT_EXPIRES_IN` | `7d` | Token validity |
   | `CLIENT_URL` | `http://localhost:5173` | Temporary until Vercel frontend is deployed in Step 4 |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | From Step 2 |
   | `CLOUDINARY_API_KEY` | `your_api_key` | From Step 2 |
   | `CLOUDINARY_API_SECRET` | `your_api_secret` | From Step 2 |
   | `SEED_OWNER_PASSWORD` | `SecurePassword123!` | Password for `@ayushmishra` |
   | `ALLOW_SIGNUP` | `true` | Set to `false` if public registrations should be closed |

7. Click **Create Web Service**.
8. Once deployed, note down your live Render URL (e.g., `https://through-my-frames-api.onrender.com`).
9. Verify health check by visiting:
   `https://through-my-frames-api.onrender.com/api/health`

---

## Step 4: Safely Seeding the Production Database (One-time)

To initialize default users (`@ayushmishra`, `@amanmishra`, `@priyasharma`), frames, collections, and sanctuary records in production:

1. In Render Dashboard, go to your Web Service.
2. Open the **Shell** tab (or connect via Render CLI).
3. Run the protected seed command with `--force`:
   ```bash
   node seed/seed.js --force
   ```
   > [!CAUTION]
   > The seed script will refuse to run in `NODE_ENV=production` without `--force` to guard against accidental collection wipes! Only run this once during initial deployment.

---

## Step 5: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... > Project**.
3. Import your GitHub repository `CodeAlpha_ThroughMyFrames`.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   Add the following:

   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://through-my-frames-api.onrender.com/api` | Your live Render backend URL from Step 3 |
   | `VITE_USE_MOCK` | `false` | Real API mode |

   > [!NOTE]
   > In Vite, `VITE_` variables are baked into the JavaScript bundle at build time. Whenever you change `VITE_API_URL`, trigger a fresh deployment in Vercel.

6. Click **Deploy**.
7. Vercel automatically honors `vercel.json` at root to ensure SPA route rewrites (refreshing `/explore`, `/frame/:id`, or `/moment` will not 404).
8. Once finished, note down your live Vercel URL (e.g., `https://through-my-frames.vercel.app`).

---

## Step 6: Close the Loop (CORS Origin on Render)

1. Return to your [Render Dashboard](https://dashboard.render.com).
2. Go to your backend Web Service > **Environment**.
3. Update `CLIENT_URL` to include your live Vercel domain:
   ```
   CLIENT_URL=https://through-my-frames.vercel.app,http://localhost:5173
   ```
4. Click **Save Changes**. Render will automatically redeploy the service.

---

## Step 7: Final Verification Run

Open your deployed Vercel application URL in an incognito window:
- [x] **Discovery Feed**: Explore `/explore` loads frames from MongoDB Atlas.
- [x] **Deterministic Moment**: `/moment` displays today's moment and "Another Moment" fetches a random frame.
- [x] **Authentication**: Sign in with demo credentials (`aman` / `Demo@12345`) or create a new account.
- [x] **Photo Upload**: Publish a photograph to verify Cloudinary streaming and database insertion.
- [x] **Interactions**: Like twice to verify atomic toggle; follow a creator; bookmark a frame.
- [x] **Correspondence**: Submit an inquiry on `/photographer` and verify 200 response and database storage.
- [x] **Deep Linking**: Refresh `https://your-domain.vercel.app/explore` directly to confirm `vercel.json` SPA routing works without 404 errors.
