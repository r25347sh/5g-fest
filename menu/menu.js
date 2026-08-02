/**
 * 5G Fest — Aura Bloom Menu
 * Cursor-centered living bloom. No fixed button. No edge dependence.
 * Desktop: pause cursor or click the aura / press M
 * Mobile : long-press anywhere
 * Opera Pink #e95388
 */
(function () {
  "use strict";

  const ITEMS = [
    { label: "ホーム", href: "/5g-fest/", icon: "✦" },
    { label: "概要", href: "/5g-fest/#overview", icon: "◈" },
    { label: "詳細", href: "/5g-fest/#details", icon: "◇" },
    { label: "メンバー", href: "/5g-fest/pages/member.html", icon: "✧" },
    { label: "トップへ", href: "#", icon: "↑", action: "scrollTop" }
  ];

  const PAUSE_MS = 700;       // how long to pause before aura becomes "ready"
  const RADIUS = 150;         // bloom radius
  const MOBILE_LONGPRESS = 480;

  function build() {
    const aura = document.createElement("div");
    aura.className = "ab-aura";
    document.body.appendChild(aura);

    const stage = document.createElement("div");
    stage.className = "ab-stage";
    stage.innerHTML = `
      <div class="ab-veil"></div>
      <div class="ab-core"><span>5G</span></div>
      <div class="ab-hint">外側をタップ / ESC で閉じる</div>
    `;
    document.body.appendChild(stage);

    const veil = stage.querySelector(".ab-veil");
    const core = stage.querySelector(".ab-core");

    const items = [];
    ITEMS.forEach((it, i) => {
      const a = document.createElement("a");
      a.className = "ab-item";
      a.href = it.href;
      a.innerHTML = `
        <span class="ab-item-icon">${it.icon}</span>
        <span class="ab-item-label">${it.label}</span>
      `;
      if (it.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => setTimeout(close, 140));
      }
      stage.appendChild(a);
      items.push({ el: a, angle: (i / ITEMS.length) * Math.PI * 2 - Math.PI / 2 });
    });

    let open = false;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let ax = mx, ay = my;           // aura smoothed position
    let pauseTimer = null;
    let isReady = false;
    let raf = null;
    let longPressTimer = null;

    // Smooth aura follow
    function tickAura() {
      ax += (mx - ax) * 0.18;
      ay += (my - ay) * 0.18;
      aura.style.left = ax + "px";
      aura.style.top = ay + "px";
      raf = requestAnimationFrame(tickAura);
    }
    raf = requestAnimationFrame(tickAura);

    function showAura() {
      aura.classList.add("is-visible");
      aura.classList.remove("is-hidden");
    }

    function hideAura() {
      aura.classList.remove("is-visible", "is-ready");
      isReady = false;
    }

    function setReady(v) {
      isReady = v;
      aura.classList.toggle("is-ready", v);
    }

    function resetPause() {
      clearTimeout(pauseTimer);
      setReady(false);
      if (!open) {
        pauseTimer = setTimeout(() => setReady(true), PAUSE_MS);
      }
    }

    // Desktop mouse
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!open) {
        showAura();
        resetPause();
      }
    }, { passive: true });

    // Click aura when ready
    aura.style.pointerEvents = "auto";
    aura.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!open && isReady) openAt(ax, ay);
    });

    function openAt(x, y) {
      if (open) return;
      open = true;
      hideAura();
      clearTimeout(pauseTimer);

      // keep bloom inside safe area
      const pad = 130;
      x = Math.max(pad, Math.min(window.innerWidth - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - pad, y));

      stage.style.setProperty("--bx", x + "px");
      stage.style.setProperty("--by", y + "px");
      core.style.left = x + "px";
      core.style.top = y + "px";

      items.forEach((it, i) => {
        const r = RADIUS;
        const tx = x + Math.cos(it.angle) * r;
        const ty = y + Math.sin(it.angle) * r;
        it.el.style.left = x + "px";
        it.el.style.top = y + "px";
        it.el.style.transition = "none";
        it.el.style.transform = "translate(-50%, -50%) scale(0)";
        it.el.style.opacity = "0";

        requestAnimationFrame(() => {
          it.el.style.transition = `transform 0.65s cubic-bezier(0.34, 1.45, 0.64, 1) ${i * 0.05}s,
                                    opacity 0.4s ease ${i * 0.05}s`;
          it.el.style.left = tx + "px";
          it.el.style.top = ty + "px";
          it.el.style.transform = "translate(-50%, -50%) scale(1)";
          it.el.style.opacity = "1";
        });
      });

      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!open) return;
      open = false;

      items.forEach((it, i) => {
        it.el.style.transition = `transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.03}s,
                                  opacity 0.3s ease ${i * 0.03}s`;
        it.el.style.transform = "translate(-50%, -50%) scale(0)";
        it.el.style.opacity = "0";
      });

      stage.classList.remove("is-open");
      document.body.style.overflow = "";

      setTimeout(() => {
        if (!open) showAura();
      }, 350);
    }

    // Veil click closes
    veil.addEventListener("click", close);

    // ESC + M
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
      if ((e.key === "m" || e.key === "M") && !open && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          openAt(window.innerWidth / 2, window.innerHeight / 2);
        }
      }
    });

    // Mobile long-press
    let touchX = 0, touchY = 0;
    window.addEventListener("touchstart", (e) => {
      if (open) return;
      const t = e.touches[0];
      touchX = t.clientX;
      touchY = t.clientY;
      mx = touchX;
      my = touchY;
      showAura();
      longPressTimer = setTimeout(() => {
        openAt(touchX, touchY);
      }, MOBILE_LONGPRESS);
    }, { passive: true });

    window.addEventListener("touchmove", () => {
      clearTimeout(longPressTimer);
    }, { passive: true });

    window.addEventListener("touchend", () => {
      clearTimeout(longPressTimer);
    }, { passive: true });

    // Prevent scroll while open
    stage.addEventListener("touchmove", (e) => {
      if (open) e.preventDefault();
    }, { passive: false });

    // Initial subtle appearance after load
    setTimeout(() => {
      if (!open) {
        mx = window.innerWidth - 80;
        my = window.innerHeight - 80;
        showAura();
      }
    }, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
