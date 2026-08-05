/**
 * 5G Fest - Main Script
 * Ultra interactions matching PR gate + Echo Bloom quality
 * Ambient particles · Magnetic CTAs · Refined reveals · Card glow
 */
(function () {
  "use strict";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Ambient particles (PRゲート同期) ----------
  function spawnAmbientParticles() {
    if (prefersReduced) return;
    if (document.querySelector(".g5-ambient")) return;

    const host = document.createElement("div");
    host.className = "g5-ambient";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);

    const COUNT = 16;
    const types = ["pink", "cyan", "gold"];

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("div");
      const type = types[Math.floor(Math.random() * types.length)];
      p.className = "g5-ambient-particle " + type;
      const size = 3 + Math.random() * 5;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 7 + Math.random() * 12 + "s";
      p.style.animationDelay = Math.random() * 8 + "s";
      host.appendChild(p);
    }
  }

  // ---------- Reveal animations ----------
  function initReveals() {
    const els = document.querySelectorAll(
      ".card, .schedule-item, .feature-row, .section-header, .member"
    );
    if (!els.length) return;

    if (prefersReduced) {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    els.forEach((el, i) => {
      el.classList.add("reveal");
      const delay = i % 4;
      if (delay > 0) el.classList.add("reveal-delay-" + delay);
      observer.observe(el);
    });
  }

  // ---------- Hero parallax (lightweight) ----------
  function initHeroParallax() {
    const hero = document.querySelector(".hero");
    if (!hero || prefersReduced) return;

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.1) {
            hero.style.setProperty("--parallax", y * 0.22 + "px");
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // ---------- Card tilt + pointer glow ----------
  function initCardInteractions() {
    const cards = document.querySelectorAll(".card, .member");
    if (!cards.length || prefersReduced) return;

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -5;
        const rotateY = ((x - cx) / cx) * 5;

        card.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;

        // Spotlight
        const mx = (x / rect.width) * 100;
        const my = (y / rect.height) * 100;
        card.style.setProperty("--mx", mx + "%");
        card.style.setProperty("--my", my + "%");
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // ---------- Magnetic buttons ----------
  function initMagneticButtons() {
    const buttons = document.querySelectorAll(".btn");
    if (!buttons.length || prefersReduced) return;

    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // ---------- Hash smooth scroll ----------
  function initHashScroll() {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (!target) return;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  // ---------- Soft cursor glow on hero (optional polish) ----------
  function initHeroCursorGlow() {
    const hero = document.querySelector(".hero");
    if (!hero || prefersReduced) return;

    let glow = hero.querySelector(".hero-cursor-glow");
    if (!glow) {
      glow = document.createElement("div");
      glow.className = "hero-cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      glow.style.cssText = `
        position: absolute;
        width: 280px;
        height: 280px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,45,149,0.16), transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 0;
      `;
      hero.appendChild(glow);
    }

    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      glow.style.left = e.clientX - rect.left + "px";
      glow.style.top = e.clientY - rect.top + "px";
      glow.style.opacity = "1";
    });

    hero.addEventListener("mouseleave", () => {
      glow.style.opacity = "0";
    });
  }

  // ---------- Init ----------
  function init() {
    spawnAmbientParticles();
    initReveals();
    initHeroParallax();
    initCardInteractions();
    initMagneticButtons();
    initHashScroll();
    initHeroCursorGlow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
