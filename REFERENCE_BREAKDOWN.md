# MindMarket Website Reverse-Engineering & Motion Study
## Reference Breakdown & Implementation Plan

### 1. Visual Hierarchy & Design System Breakdown
Based on frame-by-frame analysis of `Screen Recording 2026-10-23 105109.mp4` and direct inspection of `https://mindmarket.com/`:

#### A. Color Palette & Typography
- **Background Cream/Beige**: `#F5F1E4` (`--color-beige-400`), `--color-beige-500: #e0dbce`
- **Brand Green (Primary Ribbon & Accent)**: `#8ED462` (`--color-green-500`)
- **Deep Text Charcoal**: `#2C2E2A` (`--color-charcoal`)
- **Accent Palette**:
  - Yellow: `#F5E211` / `#F9D314`
  - Red/Coral: `#FF705D` / `#FF5C46`
  - Blue: `#2BA0FF` / `#2093FF`
  - Lavender/Pink: `#EBC1FF` / `#F4ACFF`
- **Typography**: Inter (Weights: 400, 500, 700), expressive display titles with tight tracking and fluid sizing (`clamp(...)`), generous line heights for body copy.

#### B. Floating Pill Navigation
- Floating top-center pill container (`bg-white/95 backdrop-blur`, rounded full pill, subtle border `rgba(44,46,42,0.08)`, soft shadow).
- Left: MindMarket logo with signature green organic icon + logotype.
- Center: Clean menu items (`Services`, `Methodology ˅`, `Sectors ˅`, `Strategy ˅`, `Pricing`).
- Right:
  - Green circular hamburger toggle button.
  - "Get a quote" pill CTA with interactive hover arrow effect.

---

### 2. Motion System Architecture

#### A. The Continuous Organic Background Ribbon (Scroll-Driven)
- **Geometry**: An oversized continuous SVG canvas (`viewBox="0 0 1944.2 6151.5"`) spanning the entire timeline height.
- **Stroke Width**: `500px` with `stroke-linecap="round"`.
- **Paths**:
  - `#main-path`: Primary green ribbon looping from top to bottom (`stroke: #8ED462`).
  - `#shadow-path`: Underlying depth/shadow segment (`stroke: url(#path-gradient)` transitioning `#8ED462` -> `#378e43` -> `#439745` -> `#8ED462`).
  - `#secondary-path`: Tertiary continuation path.
- **Scroll Sync**:
  - Driven by GSAP timeline tied to scroll progress (`pathProgress` / ScrollTrigger).
  - Uses `drawSVG` / `stroke-dasharray` & `stroke-dashoffset` interpolation so the green path physically draws and wraps through the page as the user scrolls.

#### B. Fine Hand-Drawn Doodle Lines (Separate Visual Layer)
- Doodle lines (`plane-trace.svg`, `soccer-trace.svg`, `clock-shape.svg`, `folder-shape.svg`, sparkles, squiggles).
- **Key distinction**: They do **NOT** move at the same speed as the green path ribbon.
- Hand-drawn doodle paths have independent parallax speeds (`data-scroll-speed="0.1"`, `0.2`, `-0.15`), individual dashoffset self-drawing on viewport entrance, and subtle continuous floating/wobble micro-movements.
- Layered behind foreground characters and cards with `pointer-events: none`.

#### C. Character Animations & Interactive Illustrated Scenes
- 13 custom Rive runtime animations (`.riv`) loaded on `<canvas>` elements (e.g. `hero_animation.riv`, `gamer.riv`, `soccer.riv`, `binoculars.riv`, `shrug.riv`, `composer.riv`, `pop_up_girl.riv`).
- Continuous organic micro-animations (blinking, waving, arm movement, breathing) running independently of scroll.
- Coordinated entrance transforms (translate-y, opacity, scale) triggered as each section enters view.

#### D. Content Cards & Visual Rhythm
- 4 primary asymmetric story cards:
  1. **"No more chaos."** (Red button / Services)
  2. **"One brief. One team."** (Yellow button / Methodology)
  3. **"Speak their language."** (Blue button / Industry Sectors)
  4. **"Global, for real."** (Pink button / Our Network)
- Cards float alongside and over the green ribbon, creating dynamic overlapping depth.
- Smooth transition into the full-width green scalloped section **"Ready when you are!"** using stacked cloud SVGs (`timeline_end_cloud_1..5.svg`) and curved boundary layers (`timeline-end-green-back.svg`, `middle.svg`, `front.svg`).

---

### 3. Implementation Plan

1. **Project Setup**:
   - Modern Vite + Vanilla JavaScript architecture inside `c:/Users/dumpa/python/mindmarket/mindmarket-motion-study/`.
   - GSAP + ScrollTrigger for butter-smooth scroll-linked path drawing and parallax coordination.
   - `@rive-app/canvas` for genuine character animations.
   - Clean modular CSS with MindMarket design tokens and responsive breakpoints.

2. **Core Components**:
   - `Navbar`: Sticky/floating pill header with dropdown triggers and mobile drawer.
   - `Hero`: Display typography, subtitle, primary CTA, and hero animated canvas.
   - `TimelineContainer`: Oversized desktop and mobile SVG path ribbons.
   - `DoodleLayer`: Hand-drawn SVG doodle lines with separate parallax and self-draw triggers.
   - `SceneCards`: The 4 asymmetric editorial cards with interactive buttons and illustration anchors.
   - `TimelineEnd`: Multi-layered scalloped clouds and green curve leading into "Ready when you are!".
   - `Footer`: Clean editorial footer with navigation grid and credits.

3. **Accessibility & Performance**:
   - `prefers-reduced-motion` media query to disable heavy continuous transforms while preserving clean layout.
   - `pointer-events: none` on all background and doodle SVG layers.
   - Mobile-optimized path (`mobile-svg` with `stroke-width: 250px`).

4. **Verification**:
   - Run local dev server.
   - Verify scroll-driven ribbon drawing against the screen recording.
   - Verify independent speed of doodle lines.
   - Check responsive layouts across desktop, tablet, and mobile.
