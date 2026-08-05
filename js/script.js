/**
 * 5G Fest - Main Script
 * Light interactions — fewer particles, GPU-friendly transforms only
 */
(function () {
  "use strict";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Ambient particles（少数） ----------
  function spawnAmbientParticles() {
    if (prefersReduced) return;
    if (document.querySelector(".g5-ambient")) return;

    const host = document.createElement("div");
    host.className = "g5-ambient";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);

    const COUNT = 8;
    const types = ["pink", "cyan", "gold"];

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("div");
      p.className = "g5-ambient-particle " + types[i % types.length];
      const size = 3 + Math.random() * 3;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 10 + Math.random() * 10 + "s";
      p.style.animationDelay = Math.random() * 8 + "s";
      host.appendChild(p);
    }
  }

  // ---------- Reveal ----------
  function initReveals() {
    const els = document.querySelectorAll(
      ".card, .schedule-item, .feature-row, .section-header, .member"
    );
    if (!els.length) return;

    if (prefersReduced) {
      els.forEach(function (el) {
        el.classList.add("revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el, i) {
      el.classList.add("reveal");
      var d = i % 4;
      if (d > 0) el.classList.add("reveal-delay-" + d);
      observer.observe(el);
    });
  }

  // ---------- Hero parallax（軽量） ----------
  function initHeroParallax() {
    var hero = document.querySelector(".hero");
    if (!hero || prefersReduced) return;

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < window.innerHeight) {
            hero.style.setProperty("--parallax", y * 0.18 + "px");
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // ---------- Card spotlight（tiltは控えめ） ----------
  function initCardInteractions() {
    var cards = document.querySelectorAll(".card, .member");
    if (!cards.length || prefersReduced) return;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var mx = ((e.clientX - rect.left) / rect.width) * 100;
        var my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", mx + "%");
        card.style.setProperty("--my", my + "%");
      });
    });
  }

  // ---------- Magnetic buttons（弱い） ----------
  function initMagneticButtons() {
    var buttons = document.querySelectorAll(".btn");
    if (!buttons.length || prefersReduced) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.12 + "px, " + y * 0.12 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  function initHashScroll() {
    if (!location.hash) return;
    var target = document.querySelector(location.hash);
    if (!target) return;
    setTimeout(function () {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function init() {
    spawnAmbientParticles();
    initReveals();
    initHeroParallax();
    initCardInteractions();
    initMagneticButtons();
    initHashScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
