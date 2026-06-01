import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;

/**
 * Vertical-scroll "melt" transition engine.
 *
 * Structure expected in the DOM:
 *   [data-story-root]
 *     .fixed-stage
 *       [data-img="wi"]  — Wisconsin (starts visible)
 *       [data-img="no"]  — Norway mountains
 *       [data-img="os"]  — Oslo skyline
 *     .story-panel[data-panel="wi"]
 *     .story-panel[data-panel="no"]
 *     .story-panel[data-panel="os"]
 *
 * User scrolls DOWN normally; the fixed background images
 * cross-fade ("melt") as each panel enters the viewport.
 */
export const initMonolithScroll = (): void => {
  if (initialized || typeof window === 'undefined') return;

  const root = document.querySelector<HTMLElement>('[data-story-root]');
  if (!root) return;

  const images = {
    wi: root.querySelector<HTMLElement>('[data-img="wi"]'),
    no: root.querySelector<HTMLElement>('[data-img="no"]'),
    os: root.querySelector<HTMLElement>('[data-img="os"]'),
  };

  if (!images.wi || !images.no || !images.os) return;

  initialized = true;
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    // Show all layers at partial opacity so content is visible
    images.wi.style.opacity = '1';
    return;
  }

  // Build a GSAP timeline pinned to the story container.
  // Scrolling down cross-fades the fixed background images.
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'monolith-story',
      trigger: root,
      start: 'top top',
      end: '+=300%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        root.style.setProperty('--story-progress', self.progress.toFixed(4));
      },
    },
  });

  // Wisconsin → Norway mountains (melt transition)
  tl.to(images.wi, { opacity: 0, scale: 1.1, duration: 1 })
    .fromTo(images.no, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 }, '<')
    // Norway mountains → Oslo skyline (melt transition)
    .to(images.no, { opacity: 0, scale: 1.1, duration: 1 }, '+=0.5')
    .fromTo(images.os, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 }, '<');
};
