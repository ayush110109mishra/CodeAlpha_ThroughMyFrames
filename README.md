# Through My Frames 2.0

> **"Photos. Places. Thoughts."**
> A quiet, curious, aesthetic art-journal, social photography platform, and 3D web experience where people explore moments, reflections, and geography.

[![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Full%20Stack%20Internship-orange.svg)](https://codealpha.tech)
[![Task 2](https://img.shields.io/badge/Task%202-Social%20Media%20Platform-blue.svg)]()
[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://reactjs.org/)
[![Node Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary%20CDN-3448C5.svg)](https://cloudinary.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Live Deployments & Previews

- **Live Web App**: [https://through-my-frames.vercel.app](https://through-my-frames.vercel.app) *(Update with your production URL)*
- **API Health Check**: [https://through-my-frames-api.onrender.com/api/health](https://through-my-frames-api.onrender.com/api/health)

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│                    [ SCREENSHOT PLACEHOLDER ]                          │
│        Hero Section: 3D Floating Frames & Warm Editorial Aesthetic     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Project Overview

**Through My Frames 2.0** was built for **CodeAlpha Full Stack Web Development Internship (Task 2: Social Media Platform)** by **Ayush Mishra**. 

Unlike conventional fast-paced, high-engagement social media feeds, *Through My Frames* is engineered around the concept of **slow social connection**:
- Editorial typography (Fraunces serif, Inter, Caveat handwritten script).
- A warm earthy palette (`#C2693E` Terracotta, `#FAF7F2` Warm Parchment, `#2C2825` Soft Charcoal).
- Contemplative interactions: atomic likes, bookmark saves, long-form reflections, and 500-character thoughts.
- Zero algorithmic engagement traps—chronological curation and serendipitous discovery.

---

## System Architecture

```
                          ┌───────────────────────────┐
                          │   Client: React 18 SPA    │
                          │   (Vite, Tailwind, R3F)   │
                          └─────────────┬─────────────┘
                                        │
                         HTTP REST + Bearer JWT Token
                         Axios Client with 4s Spin-Up Timer
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │    Express.js REST API    │
                          │    (Render Web Service)   │
                          ├───────────────────────────┤
                          │ • Helmet CSP & Trust Proxy│
                          │ • Tiered Rate Limiters    │
                          │ • Fail-Fast Env Validator │
                          │ • JWT Middleware Auth     │
                          │ • Multer Memory Buffer    │
                          └──────┬─────────────┬──────┘
                                 │             │
                Mongoose ODM     │             │ Direct Stream
                                 ▼             ▼
                     ┌───────────────┐   ┌────────────────┐
                     │ MongoDB Atlas │   │ Cloudinary CDN │
                     │  Production   │   │ Auto WebP/AVIF │
                     └───────────────┘   └────────────────┘
```

---

## Core Features

### 1. Dynamic 3D Gallery & Fallback
- Interactive Three.js / React Three Fiber scene with camera rig, depth fog, and scroll push parallax.
- Graceful 2D animated fallback for mobile screens, low-power devices, or users with `prefers-reduced-motion`.

### 2. Authentication & Permission Control
- Strict cryptographic password hashing with `bcryptjs` (cost factor 10).
- Stateless JSON Web Tokens (JWT) transmitted via `Authorization: Bearer <token>` headers.
- Uniform timing-safe login failure messages to prevent user enumeration.
- Strict input validation rejecting non-string inputs (NoSQL injection defense).
- Hardened privilege model preventing users from elevating their role or altering authors.

### 3. Living Thoughts Journal
- "Write a Thought" studio with live 500-character counter.
- Background aesthetic selector (Terracotta Dawn, Warm Parchment, Dusty Sand, Olive Mist, Night Whisper).
- Owner deletion with confirmation dialog.

### 4. Curated Collections
- Logged-in users can curate albums with titles, descriptions, and custom covers.
- **Add to Collection Menu**: Interactive checklist on any frame detail page to toggle frames into albums.
- Owner deletion for collection albums.

### 5. Moment of the Day
- `GET /api/moment/today`: Generates a deterministic integer hash from the UTC date (`YYYY-MM-DD`), delivering the exact same contemplation to all visitors worldwide for 24 hours.
- "Another Moment" serendipity button utilizing `/api/frames/random`.

### 6. Discovery & Cartography
- **Explore Wall**: Keyword search, mood chips, category filters, and "Following" chronological feed.
- **Load More Pagination**: Paginated batches with seamless state accumulation.
- **Wander**: Interactive illustrated map with coordinate pins mapping visual journeys across India.

### 7. Media Ingestion Pipeline
- Drag-and-drop client uploaddropzone.
- Multer in-memory buffer streaming straight to Cloudinary (zero local disk pollution).
- Automated client transformation helper applying `f_auto,q_auto,w_<width>,c_limit`.

### 8. Photographer Sanctuary & Inquiries
- Artist statement, philosophy pillars, field timeline, and equipment gear list.
- Correspondence contact form validated, rate-limited, and stored in MongoDB.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Warm Editorial System
- **State & Server Cache**: TanStack Query (React Query) v5
- **3D WebGL**: Three.js + React Three Fiber (`@react-three/fiber`) + Drei
- **Motion & Smooth Scroll**: Framer Motion + GSAP ScrollTrigger + Lenis
- **Forms & Validation**: React Hook Form + Zod
- **SEO & Head**: `react-helmet-async`
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (>= 18.0.0) + Express.js (ES Modules)
- **Database**: MongoDB Atlas via Mongoose 8
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Security & Hardening**: Helmet (CSP for Cloudinary), CORS, `express-rate-limit`, `compression`, trust proxy
- **Media Ingestion**: Multer + Cloudinary SDK

---

## Folder Structure

```
through-my-frames2.o/
├── public/                     # Static assets, robots.txt, sitemap.xml
├── server/                     # Express.js REST API Backend
│   ├── config/                 # Database, Cloudinary, and Env validator
│   ├── controllers/            # Route business logic & ownership guards
│   ├── middleware/             # Auth, error handling, rate limiters, validate
│   ├── models/                 # Mongoose schemas (User, Frame, Like, Follow, etc.)
│   ├── routes/                 # REST API endpoints
│   ├── seed/                   # Database seed script (with --force prod guard)
│   ├── utils/                  # API responses, JWT signing, secret masking
│   ├── .env.example            # Backend environment template
│   ├── package.json            # Backend dependencies & engine declarations
│   └── server.js               # Express server entry point
├── src/                        # React Frontend
│   ├── components/
│   │   ├── auth/               # ProtectedRoute & Auth Guards
│   │   ├── cards/              # FrameCard, ThoughtCard, CollectionCard, TripCard
│   │   ├── collections/        # CreateCollectionModal, AddToCollectionModal
│   │   ├── frames/             # EditFrameModal
│   │   ├── layout/             # Navbar, Footer, Layout, Toast
│   │   ├── profile/            # EditProfileModal
│   │   ├── seo/                # MetaSEO (Open Graph & Twitter Cards)
│   │   ├── three/              # HeroCanvas, GalleryCanvas, FallbackHero
│   │   └── ui/                 # Button, MoodChip, FilterBar, Lightbox, etc.
│   ├── context/                # AuthContext (token storage & auth:expired)
│   ├── data/                   # Initial fixtures and fallback mock data
│   ├── hooks/                  # Custom hooks (useMediaQuery, useReducedMotion)
│   ├── lib/                    # Cloudinary optimization helper & constants
│   ├── pages/                  # Route views (Landing, Explore, Detail, etc.)
│   ├── services/               # Axios API abstraction services
│   ├── App.jsx                 # Route splitting, ErrorBoundary, Suspense
│   └── main.jsx                # React DOM entry point
├── .env.example                # Frontend environment template
├── DEPLOYMENT.md               # Production deployment runbook
├── vercel.json                 # Vercel SPA rewrite configuration
├── package.json                # Frontend dependencies & scripts
└── README.md                   # Project documentation
```

---

## REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status, MongoDB connectivity & uptime |
| `POST` | `/api/auth/signup` | Public (Rate-limited) | Create new user account |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Login & obtain Bearer JWT |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `GET` | `/api/frames` | Public | List frames (filters: `mood`, `category`, `search`, `feed=following`, `page`, `limit`) |
| `GET` | `/api/frames/:id` | Public | Fetch single frame with reflections & personalization |
| `GET` | `/api/frames/random` | Public | Retrieve a random frame |
| `POST` | `/api/frames` | Private | Create a new photograph frame |
| `PUT` | `/api/frames/:id` | Private (Owner) | Update frame details (`moment`, `mood`, `location`, `category`) |
| `DELETE`| `/api/frames/:id` | Private (Owner) | Delete frame and cascade associated likes/comments/saves |
| `POST` | `/api/frames/:id/like`| Private | Atomic like/unlike toggle |
| `POST` | `/api/frames/:id/save`| Private | Atomic save/unsave bookmark toggle |
| `POST` | `/api/frames/:id/comments` | Private | Add reflection comment to frame |
| `DELETE`| `/api/comments/:id` | Private (Author/Host)| Delete reflection (403 for unauthorized users) |
| `GET` | `/api/moment/today` | Public | Deterministic Moment of the Day (seeded by calendar date) |
| `GET` | `/api/thoughts` | Public | List reflective thoughts |
| `POST` | `/api/thoughts` | Private | Publish 500-char thought with custom background |
| `DELETE`| `/api/thoughts/:id` | Private (Owner) | Delete thought |
| `GET` | `/api/collections` | Public | List collections (optional `?author=...`) |
| `POST` | `/api/collections` | Private | Create curated album with cover |
| `POST` | `/api/collections/:id/frames` | Private (Owner) | Toggle frame in/out of album |
| `DELETE`| `/api/collections/:id` | Private (Owner) | Delete collection album |
| `GET` | `/api/users/:username` | Public | Get profile, statistics, and public feed |
| `POST` | `/api/users/:username/follow` | Private | Toggle follow/unfollow (self-follow blocked) |
| `GET` | `/api/users/me/saved` | Private | Retrieve user's private bookmarked frames |
| `POST` | `/api/upload/image` | Private (Rate-limited) | Multipart 5MB image upload to Cloudinary |
| `POST` | `/api/photographer/contact` | Public (Rate-limited) | Submit letter/inquiry to photographer |

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

### Backend (server/.env)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173,http://localhost:4173
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/through-my-frames?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SEED_OWNER_PASSWORD=Ayush@ThroughMyFrames2026
```

---

## Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ayush110109mishra/CodeAlpha_ThroughMyFrames.git
cd CodeAlpha_ThroughMyFrames

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Files
- Copy `.env.example` to `.env` in the root folder.
- Copy `server/.env.example` to `server/.env`. Fill in your MongoDB Atlas and Cloudinary credentials.

### 3. Seed the Database
```bash
cd server
npm run seed
cd ..
```

### 4. Run Development Servers
In two separate terminal windows:

```bash
# Terminal 1: Backend API (port 5000)
cd server
npm run dev

# Terminal 2: React Frontend (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo Accounts

All accounts below are initialized during `npm run seed`:

| Username | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| `ayushmishra` | `ayush@throughmyframes.com` | Defined via `SEED_OWNER_PASSWORD` | Admin / Creator |
| `amanmishra` | `aman@example.com` | `Demo@12345` | Explorer / User |
| `priyasharma`| `priya@example.com` | `Demo@12345` | Photographer / User |
| `mirapatel` | `mira@example.com` | `Demo@12345` | Writer / User |

---

## Security & Hardening Highlights

1. **Defense-in-Depth Secret Masking**: Database passwords are automatically scrubbed (`*****`) from terminal logs at startup.
2. **Fail-Fast Boot Validator**: The API checks configuration on startup and refuses to launch if secrets are omitted or lack entropy in production.
3. **Compound Unique Indexing**: Database-level unique indexes on `Like`, `Save`, and `Follow` models make race conditions and duplicate entries mathematically impossible.
4. **Ownership Verification**: Resource modification endpoints verify author identity via verified JWT tokens before updating or deleting data.
5. **Cold-Boot Resilience**: Detects Render free-tier sleep cycles (>4s) and surfaces a polite status notice rather than hanging.
6. **NoSQL Injection Defenses**: Type-checks ensure authentication inputs are primitive strings, neutralizing operator injection attacks.

---

## Future Roadmap

- [ ] Webhooks for live comment notifications.
- [ ] EXIF extraction for automatic camera aperture, shutter speed, and focal length detection.
- [ ] Offline Progressive Web App (PWA) service worker caching.
- [ ] Multi-image photo essays and carousels.

---

## Author & Acknowledgements

- **Developer**: **Ayush Mishra**
- **Internship**: **CodeAlpha Full Stack Web Development Internship (Task 2)**
- **GitHub**: [@ayush110109mishra](https://github.com/ayush110109mishra)
- **Living Journal**: Through My Frames 2.0

*Crafted with reverence for quiet light, fleeting moments, and slow software.*
