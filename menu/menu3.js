/**
 * 5G Fest — Edge Whisper Menu
 * No floating button. Approach the right edge to discover.
 * Opera Pink #e95388
 *
 * Include only:
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

  const NEAR = 90;   // px from right edge to start showing glow
  const HOT  = 36;   // px to make it "hot"

  function build() {
    // Edge sensor (almost invisible)
    const edge = document.createElement("div");
    edge.className = "ew-edge";
    edge.setAttribute("aria-label", "メニューを開く（右端）");
    edge.innerHTML = `
      <div class="ew-edge-glow"></div>
      <div class="ew-edge-label">MENU</div>
    `;

    // Stage
    const stage = document.createElement("div");
    stage.className = "ew-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.setAttribute("aria-label", "ナビゲーションメニュー");

    const veil = document.createElement("div");
    veil.className = "ew-veil";
    stage.appendChild(veil);

    const panel = document.createElement("div");
    panel.className = "ew-panel";

    panel.innerHTML = `
      <div class="ew-panel-header">
        <span>5G FEST</span>
        <h2>キャバホスト</h2>
      </div>
      <nav class="ew-nav"></nav>
      <div class="ew-close-hint">外側をクリック または ESC</div>
    `;

    const nav = panel.querySelector(".ew-nav");
    ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.className = "ew-link";
      a.href = item.href;
      a.innerHTML = `
        <span class="ew-link-icon">${item.icon}</span>
        <span class="ew-link-label">${item.label}</span>
        <span class="ew-link-sub">${item.sub}</span>
      `;

      if (item.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => setTimeout(close, 120));
      }
      nav.appendChild(a);
    });

    stage.appendChild(panel);
    document.body.appendChild(edge);
    document.body.appendChild(stage);

    let open = false;

    function openMenu() {
      if (open) return;
      open = true;
      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";
      edge.classList.remove("is-near", "is-hot");
    }

    function close() {
      if (!open) return;
      open = false;
      stage.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    // Proximity detection
    function onMove(e) {
      if (open) return;
      const dist = window.innerWidth - e.clientX;
      if (dist < HOT) {
        edge.classList.add("is-near", "is-hot");
      } else if (dist < NEAR) {
        edge.classList.add("is-near");
        edge.classList.remove("is-hot");
      } else {
        edge.classList.remove("is-near", "is-hot");
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });

    // Click edge to open
    edge.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu();
    });

    // Click veil to close
    veil.addEventListener("click", close);

    // ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
      // Optional: M key also opens
      if ((e.key === "m" || e.key === "M") && !open && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") openMenu();
      }
    });

    // Touch / swipe from right (simple)
    let touchStartX = null;
    window.addEventListener("touchstart", (e) => {
      if (e.touches[0].clientX > window.innerWidth - 40) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const endX = e.changedTouches[0].clientX;
      if (touchStartX - endX > 50) openMenu(); // swipe left from edge
      touchStartX = null;
    }, { passive: true });

    // Prevent scroll when open
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
