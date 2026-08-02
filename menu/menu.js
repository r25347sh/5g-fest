/**
 * 5G Fest — Invisible Stage
 * No menu button. Ever.
 *
 * How to open:
 *   - Press "M" key
 *   - Long-press anywhere (desktop & mobile)
 *   - Double-tap (mobile)
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

  const LONGPRESS_MS = 450;
  const TIP_DELAY = 2400;
  const TIP_DURATION = 5000;

  function build() {
    const stage = document.createElement("div");
    stage.className = "iv-stage";
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.setAttribute("aria-label", "ナビゲーション");

    stage.innerHTML = `
      <div class="iv-veil"></div>
      <button class="iv-close" aria-label="閉じる">×</button>
      <div class="iv-content">
        <div class="iv-brand">5G FEST</div>
        <h2 class="iv-title">キャバホスト</h2>
        <nav class="iv-nav"></nav>
      </div>
      <div class="iv-hint">外側をクリック または ESC</div>
    `;

    const tip = document.createElement("div");
    tip.className = "iv-tip";
    tip.textContent = "M キー または 長押しでメニューを開けます";

    const nav = stage.querySelector(".iv-nav");
    const veil = stage.querySelector(".iv-veil");
    const closeBtn = stage.querySelector(".iv-close");

    ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.className = "iv-link";
      a.href = item.href;
      a.innerHTML = `${item.label}<span class="iv-link-en">${item.en}</span>`;

      if (item.action === "scrollTop") {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          close();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        a.addEventListener("click", () => setTimeout(close, 90));
      }
      nav.appendChild(a);
    });

    document.body.appendChild(stage);
    document.body.appendChild(tip);

    let open = false;
    let hasOpened = false;
    let longPressTimer = null;
    let lastTap = 0;

    function openMenu() {
      if (open) return;
      open = true;
      hasOpened = true;
      tip.classList.remove("is-show");
      stage.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!open) return;
      open = false;
      stage.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    // Close controls
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

    // Long-press (desktop + mobile)
    function startLongPress() {
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        openMenu();
      }, LONGPRESS_MS);
    }

    function cancelLongPress() {
      clearTimeout(longPressTimer);
    }

    // Desktop mouse long-press
    let mouseDown = false;
    window.addEventListener("mousedown", (e) => {
      if (open || e.button !== 0) return;
      mouseDown = true;
      startLongPress();
    });
    window.addEventListener("mouseup", () => {
      mouseDown = false;
      cancelLongPress();
    });
    window.addEventListener("mousemove", () => {
      if (mouseDown) cancelLongPress();
    });

    // Touch: long-press + double-tap
    window.addEventListener("touchstart", (e) => {
      if (open) return;

      // double-tap
      const now = Date.now();
      if (now - lastTap < 300) {
        cancelLongPress();
        openMenu();
        lastTap = 0;
        return;
      }
      lastTap = now;

      startLongPress();
    }, { passive: true });

    window.addEventListener("touchmove", cancelLongPress, { passive: true });
    window.addEventListener("touchend", cancelLongPress, { passive: true });

    // Prevent scroll when open
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
