/**
 * 5G Fest - Main Script
 * Smooth interactions, reveal animations, performance focused
 */
(function () {
  "use strict";

  // Intersection Observer for reveal animations
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  // Add reveal class styles dynamically (keeps CSS clean)
  const style = document.createElement("style");
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
  `;
  document.head.appendChild(style);

  function initReveals() {
    document.querySelectorAll(".card, .schedule-item, .feature-row, .section-header").forEach((el, i) => {
      el.classList.add("reveal");
      if (i % 4 === 1) el.classList.add("reveal-delay-1");
      if (i % 4 === 2) el.classList.add("reveal-delay-2");
      if (i % 4 === 3) el.classList.add("reveal-delay-3");
      revealObserver.observe(el);
    });
  }

  // Smooth parallax-ish for hero glow (lightweight)
  function initHeroParallax() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            hero.style.setProperty("--parallax", (y * 0.25) + "px");
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Card tilt effect (subtle, performance friendly)
  function initCardTilt() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -4;
        const rotateY = ((x - cx) / cx) * 4;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Active section highlight (for future hash nav)
  function initHashScroll() {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }

  // Init
  function init() {
    initReveals();
    initHeroParallax();
    initCardTilt();
    initHashScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
