# MetaMind — MindMarket Reverse Engineering & Motion Study

> High-fidelity, 1:1 reverse engineering of the visual layout, background motion, hand-drawn doodle traces, and scroll-linked transitions from [MindMarket](https://mindmarket.com/).

---

## 🌟 Overview & Key Highlights

This standalone front-end study reproduces the exact interactive mechanics and editorial design of MindMarket, powered by **Vite**, **GSAP (ScrollTrigger, DrawSVGPlugin, CustomEase)**, and **@rive-app/canvas**.

* **Continuous Oversized Green Path Ribbon:**  
  Engineered via desktop SVG (`viewBox 0 0 1944.2 6151.5`, `stroke-width: 500`) and mobile SVG (`viewBox 0 0 847.9 4471`), sequentially chained with zero gaps, custom Bézier easing (`M0,0 C0.952,0.017 0.744,0.69 1,1`), and dynamic crossover drop-shadow fading at `t = 0.95`.
* **Selective Hand-Drawn Doodle Motion:**  
  - Dynamic self-drawing contour traces (`plane-trace.svg`, `soccer-trace.svg`) triggered upon scene entry.
  - Floating ambient vector illustrations (music notes, paper sheets, gamepad wire) with organic subtle floating physics (`yoyo: true`, `sine.inOut`).
  - Scroll-linked parallax specks.
* **Native Rive Vector Character Runtime:**  
  13 runtime `.riv` vector animation assets running on HTML5 canvases, dynamically sized via `resizeDrawingSurfaceToCanvas()` and triggered with MindMarket's authentic elastic overshoot entrance (`elastic.out(1, 0.35)`).
* **Split Floating Pill Navigation:**  
  Left floating pill contains the MindMarket logo, dropdown links, and green circular hamburger button (with morphing cross animation). Right floating pill contains the standalone *"Get a quote"* button with circular blue avatar face icon.
* **Asymmetric Story Cards:**  
  Editorial typography (`clamp` font sizes, dark charcoal `#2C2E2A` on `#F5F1E4`), authentic colored action buttons with internal circular white chevron badges (`>`), and zero artificial badges.
* **Floral Scalloped Transition & Deluxe Callout:**  
  Green scalloped hedge populated with colorful flowers (daisy, tulip, blossom, sunflower) where unicycle, binoculars, and basketball characters ride/walk above 5 horizontally drifting cloud layers, blending seamlessly into the solid green callout section (*"Ready when you are!"*).
* **Reusable Green Line Component:**  
  Includes [`mindmarket-green-line.js`](./mindmarket-green-line.js) and [`mindmarket-green-line.css`](./mindmarket-green-line.css) for zero-bloat integration into any other project or framework.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build
```bash
npm run build
```
Generates optimized static output inside `dist/`.

---

## 📦 Project Structure

```
metamind/
├── public/
│   └── assets/
│       ├── logos/       # Partner brand logos & imagery
│       ├── rive/        # 13 authentic .riv vector animations
│       └── timeline/    # 34 timeline SVGs (clouds, traces, shapes)
├── index.html           # Semantic page layout with SVGs & canvases
├── main.js              # Application entry point
├── line-layout-scroll-animation.js # Complete page animation controller
├── mindmarket-green-line.js        # Reusable standalone Green Line module
├── mindmarket-green-line.css       # Reusable standalone Green Line styles
├── style.css            # MindMarket theme tokens, clamp typography & layout
├── package.json         # Scripts and dependencies
└── README.md
```

---

## 🧩 Reusable Green Line Component

To use the corrected green scrolling ribbon in another project:

### 1. Import JavaScript & Styles
```javascript
import { MindMarketGreenLine } from './mindmarket-green-line.js';
import './mindmarket-green-line.css';

const greenLine = new MindMarketGreenLine({
  container: '#myTimelineContainer', // Target wrapper selector
  start: 'top 73%',                  // Synchronizes start with hero crest
  end: 'bottom bottom',              // Completes at container boundary
  scrub: 0.5                         // Smooth scroll scrubbing
});

greenLine.init();
```

### 2. Include Required SVG Structure
You can insert the markup manually or call the helper:
```javascript
document.querySelector('#myTimelineContainer').innerHTML = MindMarketGreenLine.getSVGTemplate();
```

---

## ♿ Accessibility

* **`prefers-reduced-motion` Support:** Automatically detected. When reduced motion is requested, all SVG ribbons, cards, and character illustrations render immediately in their complete state without scroll-linked motion or continuous oscillations.

---

## 📄 License

MIT
