/**
 * 5G Fest — Silent Stage Menu
 * High-end typography focused · effortless · beautiful
 * Opera Pink #e95388
 *
 * Trigger: elegant bottom center pill
 * Open   : full-screen elegant stage with large type
 * Close  : X button / outside / ESC
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

  function build() {
    // Trigger
    const trigger = document.createElement("button");
    trigger.className = "ss-trigger";
    trigger.setAttribute("aria-label", "メニューを開く");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `
      <span class="ss-trigger-dot"></span>
      <span>MENU</span>
    `;

    // Stage
    const stage = document.createElement("div");
    stage.className = "ss-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.setAttribute("aria-label", "ナビゲーション");

    stage.innerHTML = `
      <div class="ss-veil"></div>
      <button class="ss-close" aria-label="閉じる">×</button>
      <div class="ss-content">
        <div class="ss-brand">5G FEST</div>
        <h2 class="ss-title">キャバホスト</h2>
        <nav class="ss-nav"></nav>
      </div>
      <div class="ss-hint">外側をクリック または ESC</div>
    `;

    const nav = stage.querySelector(".ss-nav");
    const veil = stage.querySelector(".ss-veil");
    const closeBtn = stage.querySelector(".ss-close");

    ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.className = "ss-link";
      a.href = item.href;
      a.innerHTML = `
        ${item.label}
        <span class="ss-link-en">${item.en}</span>
      `;

      if (item.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => setTimeout(close, 100));
      }
      nav.appendChild(a);
    });

    document.body.appendChild(trigger);
    document.body.appendChild(stage);

    let open = false;

    function openMenu() {
      if (open) return;
      open = true;
      trigger.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!open) return;
      open = false;
      trigger.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      stage.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu();
    });

    closeBtn.addEventListener("click", close);
    veil.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) close();
      if ((e.key === "m" || e.key === "M") && !open && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") openMenu();
      }
    });

    // Prevent background scroll on touch when open
    stage.addEventListener("touchmove", (e) => {
      if (open && e.target === veil) e.preventDefault();
    }, { passive: false });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
