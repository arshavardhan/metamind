/**
 * line-layout-scroll-animation.js
 * 
 * Standalone Animation Controller for MindMarket Motion Study
 * Reverse-engineered from https://mindmarket.com/ and Screen Recording 2026-10-23 105109.mp4
 * 
 * Owns:
 * - Large organic green path ribbon drawing (stroke-dasharray / stroke-dashoffset interpolation)
 * - Hand-drawn doodle trace line reveals (plane-trace, soccer-trace, contour paths)
 * - Asymmetric card entrance reveals
 * - Character entrance transitions & Rive canvas lifecycle
 * - End scene cloud parallax and wave transitions
 * - prefers-reduced-motion handling and cleanup
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Rive } from '@rive-app/canvas';
import { MindMarketGreenLine } from './mindmarket-green-line.js';

if (Rive && Rive.suppressDeprecationWarnings) {
  Rive.suppressDeprecationWarnings = ["default-state-machine"];
}

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, CustomEase);

export class LineLayoutScrollAnimation {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.riveInstances = [];
    this.masterTimeline = null;
    this.scrollTriggers = [];
  }

  init() {
    this.initNavigation();
    this.initOrganicBackgroundShape();
    this.initHandDrawnDoodleLines();
    this.initStoryCards();
    this.initCharacterIllustrations();
    this.initEndSceneClouds();

    // Refresh after DOM settles
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
  }

  /* ------------------------------------------------------------------------
     1. NAVIGATION: Floating split pill navbar & mobile drawer
     ------------------------------------------------------------------------ */
  initNavigation() {
    const burgerToggle = document.getElementById('burgerToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navPill = document.querySelector('.nav-pill-main');
    const quotePill = document.querySelector('.nav-pill-quote');

    let isOpen = false;

    const toggleMenu = (open) => {
      isOpen = typeof open === 'boolean' ? open : !isOpen;
      if (isOpen) {
        mobileDrawer?.classList.add('is-active');
        mobileOverlay?.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        const lines = burgerToggle?.querySelectorAll('span');
        if (lines && lines.length >= 2) {
          lines[0].style.transform = 'translateY(3px) rotate(45deg)';
          lines[1].style.transform = 'translateY(-3px) rotate(-45deg)';
        }
      } else {
        mobileDrawer?.classList.remove('is-active');
        mobileOverlay?.classList.remove('is-active');
        document.body.style.overflow = '';
        const lines = burgerToggle?.querySelectorAll('span');
        if (lines && lines.length >= 2) {
          lines[0].style.transform = 'none';
          lines[1].style.transform = 'none';
        }
      }
    };

    burgerToggle?.addEventListener('click', () => toggleMenu());
    mobileOverlay?.addEventListener('click', () => toggleMenu(false));
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

    // Subtle header elevation on scroll
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 40;
      const bg = scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
      const shadow = scrolled ? '0 8px 30px rgba(44, 46, 42, 0.12)' : 'var(--shadow-nav)';
      if (navPill) {
        navPill.style.background = bg;
        navPill.style.boxShadow = shadow;
      }
      if (quotePill) {
        quotePill.style.background = bg;
        quotePill.style.boxShadow = shadow;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     2. LARGE ORGANIC GREEN BACKGROUND SHAPE (Scroll-Linked SVG Path Drawing)
     ------------------------------------------------------------------------ */
  initOrganicBackgroundShape() {
    this.greenLine = new MindMarketGreenLine({
      container: '#timelineContainer',
      start: 'top 73%',
      end: 'bottom bottom',
      scrub: 0.5,
    });
    this.greenLine.init();

    // Mirror masterTimeline reference for page controllers and test suites
    Object.defineProperty(this, 'masterTimeline', {
      get: () => this.greenLine.masterTimeline,
      configurable: true,
    });
  }

  /* ------------------------------------------------------------------------
     3. HAND-DRAWN DOODLE LINES: Self-drawing traces & selective motion
     ------------------------------------------------------------------------ */
  initHandDrawnDoodleLines() {
    if (this.prefersReducedMotion) return;

    // Self-drawing trace lines (plane-trace and soccer-trace)
    const traceSvgs = [
      { id: 'plane-trace-el', trigger: '#card-chaos' },
      { id: 'soccer-trace-el', trigger: '#card-network' }
    ];

    traceSvgs.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;

      const path = el.querySelector('path');
      if (path) {
        const len = path.getTotalLength() || 600;
        path.style.strokeDasharray = `${len} ${len}`;
        path.style.strokeDashoffset = `${len}`;

        const st = gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item.trigger || el,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
        this.scrollTriggers.push(st.scrollTrigger);
      }
    });

    // Decorative floating doodles (subtle organic float, NOT rapid bouncing)
    const floatingDoodles = document.querySelectorAll('.doodle-float-subtle');
    floatingDoodles.forEach(el => {
      gsap.to(el, {
        y: -12,
        rotation: 2.5,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Doodles with subtle scroll parallax
    const parallaxDoodles = document.querySelectorAll('.doodle-parallax');
    parallaxDoodles.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.1');
      const st = gsap.to(el, {
        y: () => speed * 220,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      });
      this.scrollTriggers.push(st.scrollTrigger);
    });
  }

  /* ------------------------------------------------------------------------
     4. ASYMMETRIC STORY CARDS (Clean Editorial Presentation)
     ------------------------------------------------------------------------ */
  initStoryCards() {
    const cards = document.querySelectorAll('.c-tile-animated');

    cards.forEach((card, idx) => {
      if (this.prefersReducedMotion) {
        card.style.opacity = '1';
        card.style.transform = 'none';
        return;
      }

      const st = gsap.fromTo(card,
        {
          opacity: 0,
          y: 60,
          scale: 0.97
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
      this.scrollTriggers.push(st.scrollTrigger);
    });
  }

  /* ------------------------------------------------------------------------
     5. CHARACTER ILLUSTRATIONS: Rive runtime canvases & scroll reveal
     ------------------------------------------------------------------------ */
  initCharacterIllustrations() {
    const riveConfigs = [
      { canvasId: 'rive-hero', file: '/assets/rive/hero_animation.riv' },
      { canvasId: 'rive-climber', file: '/assets/rive/climber.riv' },
      { canvasId: 'rive-shrug', file: '/assets/rive/shrug.riv' },
      { canvasId: 'rive-composer', file: '/assets/rive/composer.riv' },
      { canvasId: 'rive-trumpeter-1', file: '/assets/rive/trumpeter_1.riv' },
      { canvasId: 'rive-trumpeter-2', file: '/assets/rive/trumpeter_2.riv' },
      { canvasId: 'rive-gamer', file: '/assets/rive/gamer.riv' },
      { canvasId: 'rive-scientist', file: '/assets/rive/scientist.riv' },
      { canvasId: 'rive-soccer', file: '/assets/rive/soccer.riv' },
      { canvasId: 'rive-binoculars', file: '/assets/rive/binoculars.riv' },
      { canvasId: 'rive-unicycle', file: '/assets/rive/unicycle.riv' },
      { canvasId: 'rive-basketball', file: '/assets/rive/basketball_player.riv' },
      { canvasId: 'rive-popup-girl', file: '/assets/rive/pop_up_girl.riv' },
    ];

    riveConfigs.forEach(cfg => {
      const canvas = document.getElementById(cfg.canvasId);
      if (!canvas) return;

      try {
        const rive = new Rive({
          src: cfg.file,
          canvas: canvas,
          autoplay: true,
          onLoad: () => {
            try {
              rive.resizeDrawingSurfaceToCanvas();
            } catch (e) {
              canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
              canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
            }
          },
          onError: (err) => {
            console.warn(`Rive load warning on ${cfg.canvasId}:`, err);
          }
        });
        this.riveInstances.push(rive);
      } catch (e) {
        console.warn(`Rive error on ${cfg.canvasId}:`, e);
      }
    });

    if (!this.prefersReducedMotion) {
      // Coordinated elastic entrance reveals matching MindMarket's exact Rive component timeline
      const characterElements = document.querySelectorAll('.character-reveal');
      characterElements.forEach(el => {
        const translateX = el.getAttribute('data-reveal-translate-x') || '0%';
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });

        tl.fromTo(el,
          { scale: 0.75, y: 80, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 1.6, ease: 'elastic.out(1, 0.35)' }
        ).fromTo(el,
          { x: translateX },
          { x: '0%', duration: 1.6, ease: 'power3.inOut' },
          0
        );

        if (tl.scrollTrigger) {
          this.scrollTriggers.push(tl.scrollTrigger);
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     6. END SCENE CLOUDS & GREEN WAVE HORIZONTAL SCROLL TRANSITIONS
     ------------------------------------------------------------------------ */
  initEndSceneClouds() {
    if (this.prefersReducedMotion) return;

    const timelineEnd = document.querySelector('.c-homepage-timeline_end');
    if (!timelineEnd) return;

    // Matches MindMarket's exact cloud translation values
    const clouds = [
      { selector: '.c-homepage-timeline_end_cloud_1', start: 160, end: -160 },
      { selector: '.c-homepage-timeline_end_cloud_2', start: 240, end: -240 },
      { selector: '.c-homepage-timeline_end_cloud_3', start: 200, end: -80 },
      { selector: '.c-homepage-timeline_end_cloud_4', start: 80, end: -220 },
      { selector: '.c-homepage-timeline_end_cloud_5', start: 150, end: -150 }
    ];

    clouds.forEach(c => {
      const el = timelineEnd.querySelector(c.selector);
      if (el) {
        const st = gsap.fromTo(el,
          { x: c.start },
          {
            x: c.end,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineEnd,
              start: 'top 85%',
              end: 'bottom bottom',
              scrub: 0.8
            }
          }
        );
        this.scrollTriggers.push(st.scrollTrigger);
      }
    });
  }

  onResize() {
    this.rebuildPathTimeline?.();
    ScrollTrigger.refresh();
    this.riveInstances.forEach(r => {
      try {
        r.resizeDrawingSurfaceToCanvas();
      } catch (_) {}
    });
  }

  destroy() {
    this.greenLine?.destroy();
    this.scrollTriggers.forEach(st => st.kill());
    this.masterTimeline?.kill();
    this.riveInstances.forEach(r => r.cleanup?.());
    window.removeEventListener('resize', this.onResize);
  }
}

// Auto-initialize when imported
export const motionStudyController = new LineLayoutScrollAnimation();
if (typeof window !== 'undefined') {
  window.motionStudyController = motionStudyController;
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => motionStudyController.init());
} else {
  motionStudyController.init();
}
