/**
 * 5G Fest — Echo Bloom
 * Click (or tap) empty space → radial menu blooms from that point.
 * No button. No edge bar. No long-press. No double-tap.
 *
 * Also: M key
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

  const RADIUS = 150;
  const TIP_DELAY = 2800;
  const TIP_DURATION = 4800;

  // Elements that should NOT trigger the menu
  const IGNORE = new Set(["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT", "LABEL", "SUMMARY"]);

  function build() {
    const stage = document.createElement("div");
    stage.className = "eb-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.innerHTML = `
      <div class="eb-veil"></div>
      <div class="eb-core"><span>5G</span></div>
      <div class="eb-hint">外側をクリック · ESC</div>
    `;

    const tip = document.createElement("div");
    tip.className = "eb-tip";
    tip.textContent = "何もないところをクリックするとメニューが開きます";

    const veil = stage.querySelector(".eb-veil");
    const core = stage.querySelector(".eb-core");

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

    function openAt(x, y) {
      if (open) return;
      open = true;
      hasOpened = true;
      tip.classList.remove("is-show");

      // Keep bloom inside safe area
      const pad = 130;
      x = Math.max(pad, Math.min(window.innerWidth - pad, x));
      y = Math.max(pad, Math.min(window.innerHeight - pad, y));

      stage.style.setProperty("--cx", x + "px");
      stage.style.setProperty("--cy", y + "px");
      core.style.left = x + "px";
      core.style.top = y + "px";

      items.forEach((it, i) => {
        const tx = x + Math.cos(it.angle) * RADIUS;
        const ty = y + Math.sin(it.angle) * RADIUS;

        it.el.style.transition = "none";
        it.el.style.left = x + "px";
        it.el.style.top = y + "px";
        it.el.style.transform = "translate(-50%,-50%) scale(0) rotate(-16deg)";
        it.el.style.opacity = "0";

        requestAnimationFrame(() => {
          it.el.style.transition =
            `transform 0.68s cubic-bezier(0.34, 1.5, 0.64, 1) ${0.03 + i * 0.05}s,
             opacity 0.4s ease ${0.03 + i * 0.05}s`;
          it.el.style.left = tx + "px";
          it.el.style.top = ty + "px";
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
          `transform 0.36s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.025}s,
           opacity 0.28s ease ${i * 0.025}s`;
        it.el.style.transform = "translate(-50%,-50%) scale(0.15) rotate(10deg)";
        it.el.style.opacity = "0";
      });

      stage.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    // Core interaction: click/tap on empty space
    function isEmptyTarget(el) {
      if (!el) return true;
      let node = el;
      while (node && node !== document.body && node !== document.documentElement) {
        const tag = (node.tagName || "").toUpperCase();
        if (IGNORE.has(tag)) return false;
        if (node.getAttribute && node.getAttribute("role") === "button") return false;
        if (node.classList && (
          node.classList.contains("eb-item") ||
          node.classList.contains("eb-close") ||
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

    // Close
    veil.addEventListener("click", close);

    // Keyboard
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

    // Prevent background scroll when open
    stage.addEventListener("touchmove", (e) => {
      if (open) e.preventDefault();
    }, { passive: false });

    // First-visit tip
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
