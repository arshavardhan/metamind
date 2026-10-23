/**
 * mindmarket-green-line.js
 * 
 * Standalone Reusable Module for the MindMarket Green Scroll Line Animation.
 * Extracted and reverse-engineered from https://mindmarket.com/
 * 
 * Dependencies:
 *   - gsap (>= 3.12.0)
 *   - gsap/ScrollTrigger
 *   - gsap/DrawSVGPlugin
 *   - gsap/CustomEase
 * 
 * Usage:
 *   import { MindMarketGreenLine } from './mindmarket-green-line.js';
 *   const greenLine = new MindMarketGreenLine({
 *     container: '#myTimelineContainer',
 *     scrub: 0.5,
 *   });
 *   greenLine.init();
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, CustomEase);

export class MindMarketGreenLine {
  /**
   * @param {Object} options
   * @param {string|HTMLElement} options.container - Selector or DOM node for the timeline wrapper
   * @param {number} [options.scrub=0.5] - ScrollTrigger scrub smoothness
   * @param {string} [options.start='top 73%'] - ScrollTrigger start position
   * @param {string} [options.end='bottom bottom'] - ScrollTrigger end position
   */
  constructor(options = {}) {
    this.container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : (options.container || document.getElementById('timelineContainer'));

    this.scrub = options.scrub ?? 0.5;
    this.start = options.start ?? 'top 73%';
    this.end = options.end ?? 'bottom bottom';

    this.prefersReducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

    this.masterTimeline = null;
    this.scrollTrigger = null;
    this.customEase = null;
    this._onResize = this.onResize.bind(this);
  }

  /**
   * Generates the authentic SVG markup for both Desktop and Mobile.
   * Call this if you want the component to inject the SVGs dynamically.
   */
  static getSVGTemplate() {
    return `
      <div class="c-homepage-timeline_path">
        <!-- Desktop Path Ribbon -->
        <svg id="desktop-svg" class="timeline-svg-desktop" viewBox="0 0 1944.2 6151.5" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="path-gradient" x1="1020.4" x2="1550.5" y1="2766.3" y2="3624.5" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1 0 0 -1 -242 5807.4)">
              <stop offset="0" stop-color="#8ED462" />
              <stop offset="0.3" stop-color="#378e43" />
              <stop offset="0.7" stop-color="#439745" />
              <stop offset="1" stop-color="#8ED462" />
            </linearGradient>
          </defs>
          <path id="main-path" d="M1085 250c-868 126.5-961 907-29.5 1453S1397 3353 733 3318s-606-718-53.6-808" fill="none" stroke="#8ED462" stroke-linecap="round" stroke-width="500" />
          <path id="shadow-path" d="M1055.5 1703C1987 2249 1397 3353 733 3318" fill="none" stroke="url(#path-gradient)" stroke-linecap="round" stroke-linejoin="round" stroke-width="500" opacity="0" />
          <path id="secondary-path" d="M679.3 2510c552.3-90 1689.3 743.4 475.6 1689-985 767.5-234 1313-234 1702.5" fill="none" stroke="#8ED462" stroke-linecap="round" stroke-width="500" />
        </svg>

        <!-- Mobile Path Ribbon -->
        <svg id="mobile-svg" class="timeline-svg-mobile" viewBox="0 0 847.9 4471" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="mobile-shadow-gradient" gradientUnits="userSpaceOnUse" x1="208.1258" y1="2481.6191" x2="627.7878" y2="2783.1492" gradientTransform="matrix(1 0 0 -1 0 4470.0039)">
              <stop offset="0" stop-color="#8ED462" />
              <stop offset="0.3317" stop-color="#368D32" />
              <stop offset="0.7356" stop-color="#439739" />
              <stop offset="1" stop-color="#8ED462" />
            </linearGradient>
          </defs>
          <path id="mobile-main-path" d="M508,131.1c-474,11.9-357.9,671.3-49,1079.1,308.8,407.8,263,1206.2-79.6,1206.2s-335.9-596.5-5.8-603.4" fill="none" stroke="#8ED462" stroke-linecap="round" stroke-width="250" />
          <path id="mobile-shadow-path" d="M459,1210.2c308.8,407.8,265.5,1206.2-81.5,1206.2" fill="none" stroke="url(#mobile-shadow-gradient)" stroke-linecap="round" stroke-linejoin="round" stroke-width="250" opacity="0" />
          <path id="mobile-overlap-end" d="M373.6,1813c1.9,0,3.9-0.1,5.8-0.1c335.8,0,514.9,555.2,112.5,1261.5c-326.6,573.2-77.6,980.7-77.6,1271.6" fill="none" stroke="#8ED462" stroke-linecap="round" stroke-width="250" />
        </svg>
      </div>
    `;
  }

  init() {
    if (!this.container) {
      console.warn('MindMarketGreenLine: container element not found.');
      return;
    }

    // MindMarket custom bezier easing curve for natural physical acceleration
    this.customEase = CustomEase.create('mmTimelineEase', 'M0,0 C0.952,0.017 0.744,0.69 1,1 ');

    this.build();
    window.addEventListener('resize', this._onResize, { passive: true });
  }

  build() {
    this.destroy();

    const mainPath = this.container.querySelector('#main-path');
    const secondaryPath = this.container.querySelector('#secondary-path');
    const shadowPath = this.container.querySelector('#shadow-path');

    const mobileMainPath = this.container.querySelector('#mobile-main-path');
    const mobileOverlapEnd = this.container.querySelector('#mobile-overlap-end');
    const mobileShadowPath = this.container.querySelector('#mobile-shadow-path');

    if (this.prefersReducedMotion) {
      [mainPath, secondaryPath, shadowPath, mobileMainPath, mobileOverlapEnd, mobileShadowPath].forEach(p => {
        if (p) gsap.set(p, { drawSVG: '100%', opacity: 1 });
      });
      return;
    }

    const isMobile = window.innerWidth < 768;

    if (!isMobile && mainPath && secondaryPath) {
      this.masterTimeline = gsap.timeline({ paused: true });

      // Step 1: mainPath draws from initial 5% crest down to meeting point (679.4, 2510)
      this.masterTimeline.fromTo(mainPath,
        { drawSVG: '5%' },
        { drawSVG: '100%', ease: this.customEase, duration: 0.9 }
      );

      // Step 2: secondaryPath starts seamlessly from the exact same meeting point (679.3, 2510)
      // Chained with NO position parameter to eliminate all gaps and timing breaks
      this.masterTimeline.fromTo(secondaryPath,
        { drawSVG: '0%' },
        { drawSVG: '100%', ease: 'none', duration: 1.0 }
      );

      // Step 3: Ribbon crossover loop drop-shadow overlay fades in at crossover (t = 0.95)
      if (shadowPath) {
        this.masterTimeline.fromTo(shadowPath,
          { opacity: 0 },
          { opacity: 1, ease: 'none', duration: 0.15 },
          0.95
        );
      }

    } else if (isMobile && mobileMainPath) {
      this.masterTimeline = gsap.timeline({ paused: true });

      // Mobile Step 1: Main path
      this.masterTimeline.fromTo(mobileMainPath,
        { drawSVG: '0.1%' },
        { drawSVG: '100%', duration: 1.0, ease: 'power1.in' }
      );

      // Mobile Step 2: Overlap continuation path
      if (mobileOverlapEnd) {
        this.masterTimeline.fromTo(mobileOverlapEnd,
          { drawSVG: '0%' },
          { drawSVG: '100%', ease: 'none', duration: 1.0 }
        );
      }

      // Mobile Step 3: Loop crossover shadow
      if (mobileShadowPath) {
        this.masterTimeline.fromTo(mobileShadowPath,
          { opacity: 0 },
          { opacity: 1, ease: 'none', duration: 0.15 },
          1.05
        );
      }
    }

    // Tie timeline progression synchronously to page scroll
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.container,
      start: this.start,
      end: this.end,
      scrub: this.scrub,
      onUpdate: (self) => {
        this.masterTimeline?.progress(self.progress);
      }
    });
  }

  onResize() {
    this.build();
    ScrollTrigger.refresh();
  }

  destroy() {
    this.scrollTrigger?.kill();
    this.scrollTrigger = null;
    this.masterTimeline?.kill();
    this.masterTimeline = null;
  }
}
