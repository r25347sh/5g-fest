/**
 * 5G Fest — Aura Bloom (evolved)
 * Cursor-centered living bloom with high polish
 * Desktop : move → aura follows → click anytime (or pause to charge)
 * Mobile  : long-press / double-tap
 * Backup  : M key
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

  const RADIUS = 158;
  const PAUSE_MS = 550;
  const LONGPRESS_MS = 420;
  const TIP_DELAY = 2200;
  const TIP_DURATION = 4200;

  function build() {
    /* ---- DOM ---- */
    const aura = document.createElement("div");
    aura.className = "ab-aura";
    aura.setAttribute("aria-label", "メニューを開く");
    document.body.appendChild(aura);

    const stage = document.createElement("div");
    stage.className = "ab-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.innerHTML = `
      <div class="ab-veil"></div>
      <div class="ab-core"><span>5G</span></div>
      <div class="ab-hint">外側をクリック / ESC で閉じる</div>
    `;
    document.body.appendChild(stage);

    const tip = document.createElement("div");
    tip.className = "ab-tip";
    tip.textContent = "カーソルを止めて光るオーラをクリック · または M キー";
    document.body.appendChild(tip);

    const veil = stage.querySelector(".ab-veil");
    const core = stage.querySelector(".ab-core");

    const items = ITEMS.map((it, i) => {
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
        a.addEventListener("click", () => setTimeout(close, 120));
      }
      stage.appendChild(a);
      return {
        el: a,
        angle: (i / ITEMS.length) * Math.PI * 2 - Math.PI / 2
      };
    });

    /* ---- State ---- */
    let open = false;
    let mx = window.innerWidth * 0.5;
    let my = window.innerHeight * 0.5;
    let ax = mx, ay = my;
    let pauseTimer = null;
    let isReady = false;
    let hasInteracted = false;
    let longPressTimer = null;
    let lastTap = 0;

    /* ---- Aura follow (rAF) ---- */
    function loop() {
      ax += (mx - ax) * 0.2;
      ay += (my - ay) * 0.2;
      aura.style.left = ax + "px";
      aura.style.top  = ay + "px";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function showAura() {
      aura.classList.add("is-visible");
    }

    function setReady(v) {
      isReady = v;
      aura.classList.toggle("is-ready", v);
    }

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
      if (open) return;
      showAura();
      clearTimeout(pauseTimer);
      setReady(false);
      pauseTimer = setTimeout(() => setReady(true), PAUSE_MS);
    }

    window.addEventListener("mousemove", onMove, { passive: true });

    /* ---- Open / Close ---- */
    function openAt(x, y) {
      if (open) return;
      open = true;
      hasInteracted = true;
      tip.classList.remove("is-show");
      clearTimeout(pauseTimer);
      setReady(false);
      aura.classList.remove("is-visible");

      const pad = 140;
      x = Math.max(pad, Math.min(window.innerWidth  - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - pad, y));

      stage.style.setProperty("--bx", x + "px");
      stage.style.setProperty("--by", y + "px");
      core.style.left = x + "px";
      core.style.top  = y + "px";

      items.forEach((it, i) => {
        const tx = x + Math.cos(it.angle) * RADIUS;
        const ty = y + Math.sin(it.angle) * RADIUS;

        it.el.style.transition = "none";
        it.el.style.left = x + "px";
        it.el.style.top  = y + "px";
        it.el.style.transform = "translate(-50%,-50%) scale(0) rotate(-18deg)";
        it.el.style.opacity = "0";

        requestAnimationFrame(() => {
          it.el.style.transition =
            `transform 0.7s cubic-bezier(0.34, 1.5, 0.64, 1) ${0.04 + i * 0.055}s,
             opacity 0.4s ease ${0.04 + i * 0.055}s`;
          it.el.style.left = tx + "px";
          it.el.style.top  = ty + "px";
          it.el.style.transform = "translate(-50%,-50%) scale(1) rotate(0deg)";
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
        it.el.style.transition =
          `transform 0.38s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.025}s,
           opacity 0.28s ease ${i * 0.025}s`;
        it.el.style.transform = "translate(-50%,-50%) scale(0.2) rotate(12deg)";
        it.el.style.opacity = "0";
      });

      stage.classList.remove("is-open");
      document.body.style.overflow = "";

      setTimeout(() => {
        if (!open) showAura();
      }, 320);
    }

    /* ---- Triggers ---- */
    // Click aura (works even before "ready")
    aura.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!open) openAt(ax, ay);
    });

    // Veil
    veil.addEventListener("click", close);

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
      if ((e.key === "m" || e.key === "M") && !open && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          openAt(window.innerWidth / 2, window.innerHeight / 2);
        }
      }
    });

    // Mobile: long-press + double-tap
    window.addEventListener("touchstart", (e) => {
      if (open) return;
      const t = e.touches[0];
      mx = t.clientX;
      my = t.clientY;
      showAura();

      // double-tap
      const now = Date.now();
      if (now - lastTap < 320) {
        clearTimeout(longPressTimer);
        openAt(t.clientX, t.clientY);
        lastTap = 0;
        return;
      }
      lastTap = now;

      longPressTimer = setTimeout(() => {
        openAt(t.clientX, t.clientY);
      }, LONGPRESS_MS);
    }, { passive: true });

    window.addEventListener("touchmove", () => clearTimeout(longPressTimer), { passive: true });
    window.addEventListener("touchend",   () => clearTimeout(longPressTimer), { passive: true });

    stage.addEventListener("touchmove", (e) => {
      if (open) e.preventDefault();
    }, { passive: false });

    /* ---- First-visit tip ---- */
    setTimeout(() => {
      if (!hasInteracted && !open) {
        tip.classList.add("is-show");
        setTimeout(() => tip.classList.remove("is-show"), TIP_DURATION);
      }
    }, TIP_DELAY);

    // gentle initial aura position
    setTimeout(() => {
      if (!open && !hasInteracted) {
        mx = window.innerWidth - 90;
        my = window.innerHeight - 90;
        showAura();
      }
    }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
