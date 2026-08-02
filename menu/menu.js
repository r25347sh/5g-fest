/**
 * 5G Fest — Echo Bloom (delight edition)
 * Click empty space → living radial bloom with particles & personality
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
  const TIP_DELAY = 2600;
  const TIP_DURATION = 4600;
  const PARTICLE_COUNT = 18;

  const IGNORE = new Set(["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT", "LABEL", "SUMMARY"]);

  function build() {
    const stage = document.createElement("div");
    stage.className = "eb-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.innerHTML = `
      <div class="eb-veil"></div>
      <div class="eb-shock"></div>
      <div class="eb-core"><span>5G</span></div>
      <div class="eb-hint">外側をクリック · ESC</div>
    `;

    const tip = document.createElement("div");
    tip.className = "eb-tip";
    tip.textContent = "何もないところをクリックするとメニューが開きます";

    const veil = stage.querySelector(".eb-veil");
    const core = stage.querySelector(".eb-core");
    const shock = stage.querySelector(".eb-shock");

    const items = ITEMS.map((it, i) => {
      const a = document.createElement("a");
      a.className = "eb-item";
      a.href = it.href;
      a.innerHTML = `
        <span class="eb-item-icon">${it.icon}</span>
        <span class="eb-item-label">${it.label}</span>
      `;
      if (it.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => setTimeout(close, 90));
      }
      stage.appendChild(a);
      return {
        el: a,
        angle: (i / ITEMS.length) * Math.PI * 2 - Math.PI / 2
      };
    });

    document.body.appendChild(stage);
    document.body.appendChild(tip);

    let open = false;
    let hasOpened = false;
    let floatTimers = [];

    function spawnParticles(x, y) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement("div");
        p.className = "eb-particle";
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 120;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const size = 2 + Math.random() * 4;
        const delay = Math.random() * 0.12;
        const dur = 0.5 + Math.random() * 0.45;

        p.style.cssText = `
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        `;
        stage.appendChild(p);

        requestAnimationFrame(() => {
          p.style.transition = `transform ${dur}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s,
                                 opacity ${dur * 0.8}s ease ${delay}s`;
          p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`;
          p.style.opacity = "0.9";
        });

        setTimeout(() => {
          p.style.opacity = "0";
          setTimeout(() => p.remove(), 400);
        }, (delay + dur) * 1000);
      }
    }

    function openAt(x, y) {
      if (open) return;
      open = true;
      hasOpened = true;
      tip.classList.remove("is-show");

      const pad = 135;
      x = Math.max(pad, Math.min(window.innerWidth - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - pad, y));

      stage.style.setProperty("--cx", x + "px");
      stage.style.setProperty("--cy", y + "px");
      core.style.left = x + "px";
      core.style.top = y + "px";
      shock.style.left = x + "px";
      shock.style.top = y + "px";

      // Reset shockwave
      shock.style.animation = "none";
      void shock.offsetWidth;
      shock.style.animation = "";

      spawnParticles(x, y);

      items.forEach((it, i) => {
        const tx = x + Math.cos(it.angle) * RADIUS;
        const ty = y + Math.sin(it.angle) * RADIUS;
        const rot = (Math.random() - 0.5) * 12;

        it.el.style.transition = "none";
        it.el.style.left = x + "px";
        it.el.style.top = y + "px";
        it.el.style.transform = `translate(-50%,-50%) scale(0) rotate(${rot - 18}deg)`;
        it.el.style.opacity = "0";
        it.el.style.animation = "none";

        requestAnimationFrame(() => {
          it.el.style.transition =
            `transform 0.72s cubic-bezier(0.34, 1.55, 0.64, 1) ${0.04 + i * 0.055}s,
             opacity 0.4s ease ${0.04 + i * 0.055}s`;
          it.el.style.left = tx + "px";
          it.el.style.top = ty + "px";
          it.el.style.transform = `translate(-50%,-50%) scale(1) rotate(${rot * 0.3}deg)`;
          it.el.style.opacity = "1";
        });

        // Gentle continuous float after settle
        const t = setTimeout(() => {
          if (open) {
            it.el.style.animation = `eb-float ${2.8 + i * 0.25}s ease-in-out infinite`;
            it.el.style.animationDelay = `${i * 0.1}s`;
          }
        }, 900 + i * 60);
        floatTimers.push(t);
      });

      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!open) return;
      open = false;
      floatTimers.forEach(clearTimeout);
      floatTimers = [];

      items.forEach((it, i) => {
        it.el.style.animation = "none";
        it.el.style.transition =
          `transform 0.38s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.03}s,
           opacity 0.28s ease ${i * 0.03}s`;
        it.el.style.transform = "translate(-50%,-50%) scale(0.12) rotate(14deg)";
        it.el.style.opacity = "0";
      });

      stage.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function isEmptyTarget(el) {
      if (!el) return true;
      let node = el;
      while (node && node !== document.body && node !== document.documentElement) {
        const tag = (node.tagName || "").toUpperCase();
        if (IGNORE.has(tag)) return false;
        if (node.getAttribute && node.getAttribute("role") === "button") return false;
        if (node.classList && (
          node.classList.contains("eb-item") ||
          node.classList.contains("eb-stage")
        )) return false;
        if (node.isContentEditable) return false;
        node = node.parentElement;
      }
      return true;
    }

    document.addEventListener("click", (e) => {
      if (open) return;
      if (e.button !== 0) return;
      if (!isEmptyTarget(e.target)) return;
      openAt(e.clientX, e.clientY);
    });

    veil.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) {
        close();
        return;
      }
      if ((e.key === "m" || e.key === "M") && !open && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea" && tag !== "select") {
          e.preventDefault();
          openAt(window.innerWidth / 2, window.innerHeight / 2);
        }
      }
    });

    stage.addEventListener("touchmove", (e) => {
      if (open) e.preventDefault();
    }, { passive: false });

    setTimeout(() => {
      if (!hasOpened) {
        tip.classList.add("is-show");
        setTimeout(() => tip.classList.remove("is-show"), TIP_DURATION);
      }
    }, TIP_DELAY);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
