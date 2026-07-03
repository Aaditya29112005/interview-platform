'use client';

import { useEffect } from 'react';

/**
 * Bootstraps GSAP + ScrollTrigger animations for the InterviewOS landing page.
 * Must be called inside a Client Component after mount.
 */
export function useGSAPAnimations() {
  useEffect(() => {
    // Dynamic import keeps GSAP out of the SSR bundle
    (async () => {
      const gsapModule = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { TextPlugin } = await import('gsap/TextPlugin');
      const gsap = gsapModule.gsap;

      gsap.registerPlugin(ScrollTrigger, TextPlugin);

      // ── 1. Fade-up reveal for every [data-gsap="fade-up"] ──────────────
      ScrollTrigger.batch('[data-gsap="fade-up"]', {
        start: 'top 88%',
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 48, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.out',
            }
          );
        },
        once: true,
      });

      // ── 2. Fade-left for [data-gsap="fade-left"] ───────────────────────
      ScrollTrigger.batch('[data-gsap="fade-left"]', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { x: -60, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' }
          );
        },
        once: true,
      });

      // ── 3. Fade-right for [data-gsap="fade-right"] ────────────────────
      ScrollTrigger.batch('[data-gsap="fade-right"]', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { x: 60, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' }
          );
        },
        once: true,
      });

      // ── 4. Scale-in for feature cards [data-gsap="scale-in"] ──────────
      ScrollTrigger.batch('[data-gsap="scale-in"]', {
        start: 'top 90%',
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { scale: 0.88, opacity: 0, y: 24 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'back.out(1.4)',
            }
          );
        },
        once: true,
      });

      // ── 5. Stat counters [data-gsap-count] ────────────────────────────
      document.querySelectorAll<HTMLElement>('[data-gsap-count]').forEach((el) => {
        const target = parseFloat(el.dataset.gsapCount || '0');
        const isInt = Number.isInteger(target);
        const prefix = el.dataset.gsapPrefix || '';
        const suffix = el.dataset.gsapSuffix || '';
        const obj = { val: 0 };

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent =
                  prefix +
                  (isInt
                    ? Math.round(obj.val).toLocaleString()
                    : obj.val.toFixed(1)) +
                  suffix;
              },
            });
          },
        });
      });

      // ── 6. Horizontal marquee speed-boost on scroll ───────────────────
      const marqueeEl = document.querySelector<HTMLElement>('.gsap-marquee-inner');
      if (marqueeEl) {
        let speed = 1;
        ScrollTrigger.create({
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const v = self.getVelocity();
            speed = gsap.utils.clamp(0.5, 3, 1 + Math.abs(v) / 2000);
            gsap.to(marqueeEl, {
              timeScale: speed,
              duration: 0.5,
              overwrite: true,
            });
          },
        });
      }

      // ── 7. Section heading clip reveal [data-gsap="clip-reveal"] ─────
      document.querySelectorAll<HTMLElement>('[data-gsap="clip-reveal"]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              once: true,
            },
          }
        );
      });

      // ── 8. Pinned hero parallax on background blobs ───────────────────
      const heroBlobs = document.querySelectorAll<HTMLElement>('[data-gsap-parallax]');
      heroBlobs.forEach((el) => {
        const depth = parseFloat(el.dataset.gsapParallax || '0.3');
        gsap.to(el, {
          y: () => window.innerHeight * depth,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // ── 9. Pricing card reveal stagger ───────────────────────────────
      const pricingCards = document.querySelectorAll('[data-gsap="pricing-card"]');
      if (pricingCards.length) {
        gsap.fromTo(
          pricingCards,
          { y: 60, opacity: 0, rotateX: 8 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: pricingCards[0],
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // ── 10. FAQ accordion line draw ──────────────────────────────────
      const faqItems = document.querySelectorAll('[data-gsap="faq-item"]');
      gsap.fromTo(
        faqItems,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: faqItems[0] || 'body',
            start: 'top 85%',
            once: true,
          },
        }
      );

      // ── 11. Tactile Magnetic Buttons ─────────────────────────────────
      const magneticEls = document.querySelectorAll<HTMLElement>('.btn-magnetic');
      const onMouseMoveMagnetic = (e: MouseEvent) => {
        magneticEls.forEach((el) => {
          const bound = el.getBoundingClientRect();
          const elX = bound.left + bound.width / 2;
          const elY = bound.top + bound.height / 2;
          const distX = e.clientX - elX;
          const distY = e.clientY - elY;
          const dist = Math.hypot(distX, distY);
          
          if (dist < 75) {
            // Pull closer to cursor
            gsap.to(el, {
              x: distX * 0.35,
              y: distY * 0.35,
              rotateX: -distY * 0.1,
              rotateY: distX * 0.1,
              duration: 0.3,
              ease: 'power2.out',
            });
          } else {
            // Reset to original place
            gsap.to(el, {
              x: 0,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              duration: 0.4,
              ease: 'elastic.out(1.2, 0.4)',
            });
          }
        });
      };
      window.addEventListener('mousemove', onMouseMoveMagnetic);

      // ── 12. Text Scramble / Decoder Reveal ───────────────────────────
      const scrambleEls = document.querySelectorAll<HTMLElement>('[data-gsap="scramble"]');
      scrambleEls.forEach((el) => {
        const originalText = el.innerText || '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*';
        
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            let iterations = 0;
            const interval = setInterval(() => {
              el.innerText = originalText
                .split('')
                .map((char, index) => {
                  if (char === ' ' || char === '\n') return char;
                  if (index < iterations) return originalText[index];
                  return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
              
              if (iterations >= originalText.length) {
                clearInterval(interval);
                el.innerText = originalText; // Ensure exact text matches
              }
              iterations += 1 / 2;
            }, 25);
          }
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        window.removeEventListener('mousemove', onMouseMoveMagnetic);
      };
    })();
  }, []);
}
