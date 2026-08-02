/**
 * 5G Fest — Velvet Presence
 * No long-press. No double-tap. No classic button.
 *
 * Desktop : move mouse near bottom edge → soft light appears → click
 * Mobile  : elegant thin bottom indicator is always gently present → tap
 * Keyboard: M key
 *
 * Opera Pink #e95388
 */
(function () {
  "use strict";

  const ITEMS = [
    { label: "ホーム", en: "Home", href: "/5g-fest/" },
    { label: "概要", en: "Overview", href: "/5g-fest/#overview" },
    { label: "詳細", en: "Details", href: "/5g-fest/#details" },
    { label: "メンバー", en: "Members", href: "/5g-fest/pages/member.html" },
    { label: "トップへ", en: "Back to Top", href: "#", action: "scrollTop" }
  ];

  const NEAR_ZONE = 70; // px from bottom

  function build() {
    const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;

    // Presence zone
    const presence = document.createElement("div");
    presence.className = "vp-presence";
    if (isTouch) presence.classList.add("is-mobile", "is-active");
    presence.innerHTML = `
      <div class="vp-bar"></div>
      <div class="vp-label">MENU</div>
    `;

    // Stage
    const stage = document.createElement("div");
    stage.className = "vp-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.innerHTML = `
      <div class="vp-veil"></div>
      <div class="vp-orb vp-orb-1"></div>
      <div class="vp-orb vp-orb-2"></div>
      <button class="vp-close" aria-label="閉じる">×</button>
      <div class="vp-content">
        <div class="vp-brand">5G FEST</div>
        <h2 class="vp-title">キャバホスト</h2>
        <div class="vp-subtitle">CLASS EXHIBITION</div>
        <nav class="vp-nav"></nav>
      </div>
      <div class="vp-hint">外側をクリック · ESC</div>
    `;

    const nav = stage.querySelector(".vp-nav");
    const veil = stage.querySelector(".vp-veil");
    const closeBtn = stage.querySelector(".vp-close");

    ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.className = "vp-link";
      a.href = item.href;
      a.innerHTML = `${item.label}<span class="vp-link-en">${item.en}</span>`;

      if (item.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => setTimeout(close, 80));
      }
      nav.appendChild(a);
    });

    document.body.appendChild(presence);
    document.body.appendChild(stage);

    let open = false;

    function openMenu() {
      if (open) return;
      open = true;
      presence.classList.remove("is-near");
      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!open) return;
      open = false;
      stage.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    // Desktop: proximity to bottom
    if (!isTouch) {
      window.addEventListener("mousemove", (e) => {
        if (open) return;
        const dist = window.innerHeight - e.clientY;
        if (dist < NEAR_ZONE) {
          presence.classList.add("is-near", "is-active");
        } else {
          presence.classList.remove("is-near", "is-active");
        }
      }, { passive: true });
    }

    // Click / tap the presence zone
    presence.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu();
    });

    // Close
    closeBtn.addEventListener("click", close);
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
          openMenu();
        }
      }
    });

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
