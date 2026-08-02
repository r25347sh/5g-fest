/**
 * 5G Fest - Quantum Aura Menu
 * Self-injecting innovative constellation navigation
 * Include only:
 *   <link rel="stylesheet" href="/5g-fest/menu/menu.css">
 *   <script src="/5g-fest/menu/menu.js"></script>
 */
(function () {
  "use strict";

  const MENU_ITEMS = [
    { label: "ホーム", href: "/5g-fest/", icon: "✦" },
    { label: "概要", href: "/5g-fest/#overview", icon: "◈" },
    { label: "詳細", href: "/5g-fest/#details", icon: "◇" },
    { label: "メンバー", href: "/5g-fest/pages/member.html", icon: "✧" },
    { label: "トップへ", href: "#", icon: "↑", action: "scrollTop" }
  ];

  function createStars(container, count = 60) {
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "qa-star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 3 + "s";
      star.style.width = star.style.height = (Math.random() * 2 + 1) + "px";
      container.appendChild(star);
    }
  }

  function createConstellationSVG(items) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "qa-constellation");
    svg.setAttribute("viewBox", "-300 -300 600 600");
    svg.setAttribute("aria-hidden", "true");

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "qa-line-grad");
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "100%");
    const stops = [
      { offset: "0%", color: "#ff2d95" },
      { offset: "50%", color: "#00f5ff" },
      { offset: "100%", color: "#ffd700" }
    ];
    stops.forEach(s => {
      const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop.setAttribute("offset", s.offset);
      stop.setAttribute("stop-color", s.color);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    const n = items.length;
    const radius = 210;
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 1) % n / n) * Math.PI * 2 - Math.PI / 2;
      const x1 = Math.cos(a1) * radius;
      const y1 = Math.sin(a1) * radius;
      const x2 = Math.cos(a2) * radius;
      const y2 = Math.sin(a2) * radius;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      svg.appendChild(line);

      // also connect to center
      const lineC = document.createElementNS("http://www.w3.org/2000/svg", "line");
      lineC.setAttribute("x1", "0");
      lineC.setAttribute("y1", "0");
      lineC.setAttribute("x2", x1);
      lineC.setAttribute("y2", y1);
      lineC.style.opacity = "0.4";
      svg.appendChild(lineC);
    }
    return svg;
  }

  function buildMenu() {
    // Trigger
    const trigger = document.createElement("button");
    trigger.className = "qa-menu-trigger";
    trigger.setAttribute("aria-label", "メニューを開く");
    trigger.innerHTML = `<span class="qa-orb-core">5G</span>`;

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "qa-menu-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "ナビゲーションメニュー");

    // Stars
    const stars = document.createElement("div");
    stars.className = "qa-stars";
    createStars(stars);
    overlay.appendChild(stars);

    // Portal
    const portal = document.createElement("div");
    portal.className = "qa-portal";
    portal.innerHTML = `
      <div class="qa-portal-ring"></div>
      <div class="qa-portal-core"><span>5G</span></div>
    `;
    overlay.appendChild(portal);

    // Items container
    const itemsWrap = document.createElement("div");
    itemsWrap.className = "qa-menu-items";

    const n = MENU_ITEMS.length;
    MENU_ITEMS.forEach((item, i) => {
      const angle = (i / n) * 360 - 90; // start from top
      const a = document.createElement("a");
      a.className = "qa-menu-item";
      a.href = item.href;
      a.style.setProperty("--i", i);
      a.style.setProperty("--angle", angle + "deg");
      // position with trig (CSS cos/sin supported in modern browsers)
      const rad = (angle * Math.PI) / 180;
      const radius = 210;
      a.style.left = `calc(50% + ${Math.cos(rad) * radius}px)`;
      a.style.top = `calc(50% + ${Math.sin(rad) * radius}px)`;

      a.innerHTML = `
        <span class="qa-icon">${item.icon}</span>
        <span class="qa-label">${item.label}</span>
      `;

      if (item.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          closeMenu();
        });
      } else {
        a.addEventListener("click", () => {
          // slight delay for visual feedback
          setTimeout(closeMenu, 180);
        });
      }

      itemsWrap.appendChild(a);
    });

    overlay.appendChild(itemsWrap);

    // Constellation lines
    overlay.appendChild(createConstellationSVG(MENU_ITEMS));

    // Close hint
    const hint = document.createElement("div");
    hint.className = "qa-close-hint";
    hint.textContent = "クリック / ESC で閉じる";
    overlay.appendChild(hint);

    document.body.appendChild(trigger);
    document.body.appendChild(overlay);

    // Interactions
    let isOpen = false;

    function openMenu() {
      isOpen = true;
      trigger.classList.add("active");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      trigger.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      isOpen = false;
      trigger.classList.remove("active");
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.classList.contains("qa-stars") || e.target.classList.contains("qa-portal") || e.target.closest(".qa-portal")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) closeMenu();
    });

    // Prevent scroll on overlay touchmove (mobile)
    overlay.addEventListener("touchmove", (e) => {
      if (isOpen) e.preventDefault();
    }, { passive: false });
  }

  // Auto init when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildMenu);
  } else {
    buildMenu();
  }
})();
