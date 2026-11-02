# Through My Frames 2.0 (Phase 1)
> *Photos. Places. Thoughts.*  
> A quiet, curious, aesthetic art-journal meets an immersive 3D gallery.

---

## 🌟 Vision & Overview
**Through My Frames 2.0** is NOT just another photo gallery. It is a living journal and community space where viewers explore photos, places, moments, and thoughts in a calm, warm, cinematic atmosphere.

Built with **React 18 + Vite**, **Three.js / React Three Fiber / Drei**, **Tailwind CSS**, **GSAP + ScrollTrigger**, **Lenis (smooth scroll)**, **Framer Motion**, and **react-hook-form + Zod**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```
through-my-frames2.o/
├── public/
│   └── images/              <-- Place your high-res photos here
├── src/
│   ├── components/
│   │   ├── cards/           <-- FrameCard, ThoughtCard, TripCard, CollectionCard
│   │   ├── layout/          <-- Navbar, Footer, PageTransition, Layout shell
│   │   ├── three/           <-- HeroCanvas, GalleryCanvas, FloatingFrame, CurvedGallery, Fallbacks
│   │   └── ui/              <-- Button, MoodChip, Lightbox, CustomCursor, LoaderScreen, Toast, FilterBar
│   ├── data/                <-- Mock data (frames, thoughts, trips, collections, users, photographer)
│   ├── services/            <-- frameService, thoughtService, tripService, collectionService, userService
│   ├── hooks/               <-- useTheme, useLenis, useMediaQuery, useReducedMotion
│   ├── lib/                 <-- utils, constants
│   ├── styles/              <-- globals.css (color tokens, film grain, Lenis styles)
│   ├── pages/               <-- All route pages (Landing, Explore, FrameDetail, Wander, Thoughts, etc.)
│   ├── App.jsx              <-- React Router configuration
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 📷 How to Add Your Own Photos & Edit Mock Data

### 1. Adding Your Photos
1. Copy your `.jpg` or `.png` photographs into `public/images/`.
   * e.g., `public/images/taj-mahal.jpg`, `public/images/vrindavan.jpg`, `public/images/moon.jpg`, `public/images/sunset.jpg`, `public/images/honey.jpg`, etc.
2. The app is already pre-configured to look in `/images/[filename].jpg`. If a file is not yet placed, it automatically falls back gracefully.

### 2. Editing Frames & Content
* **Frames**: Open `src/data/frames.js` to modify captions, camera EXIF settings (body, lens, aperture, shutter speed, ISO), locations, and moods.
* **Thoughts**: Open `src/data/thoughts.js` to add short writings, reflections, and quotes.
* **Journeys & Trips**: Open `src/data/trips.js` to edit travel narratives, dates, and interactive map coordinates.
* **Collections**: Open `src/data/collections.js` to curate albums.
* **The Photographer (Ayush Mishra)**: Open `src/data/photographer.js` to update the artist statement, gear list, vertical journey milestones, and contact info.

### 3. Switching to a Real Backend API Later
All frontend pages and components fetch data exclusively via the asynchronous service layer in `src/services/` (`frameService.js`, `thoughtService.js`, `tripService.js`, etc.). When ready to connect a real backend (e.g. Node/Express, Supabase, or Firebase), simply replace the mock storage methods inside `src/services/` with your real API `fetch()` / `axios` endpoints without modifying any UI components.

---

## ✅ Phase 1 Deliverables Checklist

- [x] **Design System & Aesthetics**:
  - [x] Light mode (`#FAF7F2` bg, `#C2693E` terracotta accent, `#E7E1D7` lines)
  - [x] Dark mode (`#0F0E0D` bg, `#E08A5B` terracotta accent, `#2A2724` lines)
  - [x] LocalStorage persisted dark/light toggle
  - [x] Google Fonts: Fraunces & Playfair Display (headings), Inter (body), Caveat (handwritten captions)
  - [x] 8px grid, 14px card radius, 999px pill radius
  - [x] 3-4% Film grain texture overlay
  - [x] Visible focus rings & WCAG AA contrast
- [x] **3D Features (React Three Fiber + Drei)**:
  - [x] **Landing Hero**: 3D floating photo frames with depth fog, soft lighting, mouse parallax, and GSAP ScrollTrigger camera push-through
  - [x] **Explore 3D Gallery**: Interactive curved carousel wall with drag, scroll, frame inspection, and 3D / Masonry Grid toggle
  - [x] **Performance & Fallbacks**: DPR capped at 1.5, lazy rendering, and graceful 2D collage fallback for mobile, low-power devices, and `prefers-reduced-motion`
- [x] **Pages & Routes**:
  - [x] `/` — Landing page with 3D hero, featured frames, moment of the day teaser, travel teaser, thoughts teaser, collections stack teaser, photographer teaser
  - [x] `/explore` — Discovery with 3D/Grid toggle, mood filters, category filters, search input, and "Surprise me" randomizer
  - [x] `/frame/:id` — Frame detail with high-res Lightbox (Esc/Arrows), handwritten moment caption, mood, location, camera EXIF, like/save UI, comment box, and related frames
  - [x] `/wander` — Travel journeys with styled illustrated SVG map with interactive pins, cards per trip, and field diary notes
  - [x] `/thoughts` — Masonry layout of aesthetic text cards on soft gradients, mood filter, and "Write a thought" modal
  - [x] `/moment` — Full-screen Moment of the Day with smooth transition and "Another moment" serendipity randomizer
  - [x] `/collections` & `/collections/:id` — Curated albums with physical stacked cover hover effect and album view
  - [x] `/u/:username` — Profile with cover, avatar, bio, stats, tabs (Frames, Thoughts, Collections, Saved), and Follow button
  - [x] `/upload` — Create Frame / Thought with drag-and-drop photo, 280-char counter, mood chips, category, location, and live interactive preview
  - [x] `/login` & `/signup` — Elegant split-screen forms with Zod validation
  - [x] `/photographer` — Dedicated, intimate photographer sanctuary for Ayush Mishra with portrait, philosophy pillars, vertical timeline, gear list, and contact form
  - [x] `*` — Atmospheric 404 page
- [x] **Micro-interactions & Polish**:
  - [x] Lenis smooth scrolling
  - [x] Desktop custom cursor that morphs into "View" over photographs
  - [x] Camera shutter iris loader animation on first visit (under 2 seconds)
  - [x] Framer Motion page transitions and like button pops
  - [x] Toast notification system
  - [x] Modular service-oriented architecture

