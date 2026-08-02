/**
 * 5G Fest — Velvet Gravity Menu
 * Living invitation cards with magnetic parallax + spring physics
 * Self-injecting. Just include:
 *   <link rel="stylesheet" href="/5g-fest/menu/menu.css">
 *   <script src="/5g-fest/menu/menu.js"></script>
 */
(function () {
  "use strict";

  const ITEMS = [
    { label: "ホーム", sub: "Home", href: "/5g-fest/", icon: "✦" },
    { label: "概要", sub: "Overview", href: "/5g-fest/#overview", icon: "◈" },
    { label: "詳細", sub: "Details", href: "/5g-fest/#details", icon: "◇" },
    { label: "メンバー", sub: "Members", href: "/5g-fest/pages/member.html", icon: "✧" },
    { label: "トップへ", sub: "Top", href: "#", icon: "↑", action: "scrollTop" }
  ];

  // Card base positions (arc layout) — x,y relative to center, rotateZ, depth
  function layoutFor(count, w, h) {
    const positions = [];
    const spread = Math.min(w * 0.38, 320);
    const yBase = -20;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = (t - 0.5) * 0.9; // radians-ish curve
      const x = (t - 0.5) * spread * 2.1;
      const y = yBase + Math.sin(angle * Math.PI) * 40 + (i % 2 === 0 ? -18 : 18);
      const rot = (t - 0.5) * 14;
      const z = (0.5 - Math.abs(t - 0.5)) * 40;
      positions.push({ x, y, rot, z, lag: 0.06 + Math.abs(t - 0.5) * 0.08 });
    }
    return positions;
  }

  function build() {
    // Trigger
    const trigger = document.createElement("button");
    trigger.className = "vg-trigger";
    trigger.setAttribute("aria-label", "メニューを開く");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `<div class="vg-trigger-inner"><span>5G</span></div>`;

    // Stage
    const stage = document.createElement("div");
    stage.className = "vg-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.setAttribute("aria-label", "ナビゲーション");

    const bg = document.createElement("div");
    bg.className = "vg-stage-bg";
    stage.appendChild(bg);

    const cardsWrap = document.createElement("div");
    cardsWrap.className = "vg-cards";
    stage.appendChild(cardsWrap);

    const hint = document.createElement("div");
    hint.className = "vg-hint";
    hint.textContent = "背景クリック または ESC で閉じる";
    stage.appendChild(hint);

    // Cards
    const cards = [];
    ITEMS.forEach((item, i) => {
      const a = document.createElement("a");
      a.className = "vg-card";
      a.href = item.href;
      a.innerHTML = `
        <span class="vg-card-icon">${item.icon}</span>
        <span class="vg-card-label">${item.label}</span>
        <span class="vg-card-sub">${item.sub}</span>
      `;
      a.dataset.index = i;

      if (item.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => {
          setTimeout(close, 160);
        });
      }

      cardsWrap.appendChild(a);
      cards.push({
        el: a,
        // physics state
        x: 0, y: 0, rot: 0, z: 0,
        tx: 0, ty: 0, trot: 0, tz: 0, // targets
        vx: 0, vy: 0,
        lag: 0.08,
        scatterX: (Math.random() - 0.5) * 900,
        scatterY: (Math.random() - 0.5) * 700,
        scatterRot: (Math.random() - 0.5) * 60
      });
    });

    document.body.appendChild(trigger);
    document.body.appendChild(stage);

    // State
    let open = false;
    let raf = null;
    let mouseX = 0;
    let mouseY = 0;
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    function updateLayout() {
      centerX = window.innerWidth / 2;
      centerY = window.innerHeight / 2;
      const pos = layoutFor(cards.length, window.innerWidth, window.innerHeight);
      cards.forEach((c, i) => {
        c.tx = pos[i].x;
        c.ty = pos[i].y;
        c.trot = pos[i].rot;
        c.tz = pos[i].z;
        c.lag = pos[i].lag;
      });
    }

    function applyTransform(c, extraX = 0, extraY = 0, extraRot = 0) {
      const mx = (mouseX - centerX) * c.lag;
      const my = (mouseY - centerY) * c.lag * 0.7;
      const x = c.x + mx + extraX;
      const y = c.y + my + extraY;
      const r = c.rot + extraRot + mx * 0.02;
      const s = 1 + c.z * 0.0015;
      c.el.style.transform = `
        translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${c.z}px)
        rotateZ(${r}deg)
        scale(${s})
      `;
    }

    function tick() {
      if (!open) {
        raf = null;
        return;
      }
      cards.forEach((c) => {
        // spring toward target
        const k = 0.14;
        const d = 0.72;
        c.vx = (c.vx + (c.tx - c.x) * k) * d;
        c.vy = (c.vy + (c.ty - c.y) * k) * d;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += (c.trot - c.rot) * 0.12;
        c.z += (c.tz - c.z) * 0.1;
        applyTransform(c);
      });
      raf = requestAnimationFrame(tick);
    }

    function openMenu() {
      if (open) return;
      open = true;
      trigger.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";

      updateLayout();

      // start from scattered positions
      cards.forEach((c, i) => {
        c.x = c.scatterX;
        c.y = c.scatterY;
        c.rot = c.scatterRot;
        c.z = -80;
        c.vx = 0;
        c.vy = 0;
        c.el.style.opacity = "0";
        c.el.style.transition = "opacity 0.5s ease";
        applyTransform(c);
        // staggered fade in
        setTimeout(() => {
          c.el.style.opacity = "1";
        }, 60 + i * 70);
      });

      if (!raf) raf = requestAnimationFrame(tick);
    }

    function close() {
      if (!open) return;
      open = false;
      trigger.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      stage.classList.remove("is-open");
      document.body.style.overflow = "";

      // scatter out
      cards.forEach((c, i) => {
        c.tx = c.scatterX * 1.3;
        c.ty = c.scatterY * 1.3;
        c.trot = c.scatterRot * 1.4;
        c.tz = -120;
        c.el.style.transition = "opacity 0.4s ease";
        setTimeout(() => {
          c.el.style.opacity = "0";
        }, 40 + i * 30);
      });

      // stop loop after exit
      setTimeout(() => {
        if (!open && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }, 500);
    }

    // Events
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      open ? close() : openMenu();
    });

    stage.addEventListener("click", (e) => {
      if (e.target === stage || e.target.classList.contains("vg-stage-bg") || e.target.classList.contains("vg-cards")) {
        close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
    });

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener("resize", () => {
      if (open) updateLayout();
    }, { passive: true });

    // prevent background scroll on touch
    stage.addEventListener("touchmove", (e) => {
      if (open) e.preventDefault();
    }, { passive: false });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
