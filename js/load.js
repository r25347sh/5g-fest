/**
 * js/load.js
 * 5G Fest 共通ローダー（限定公開 + CSS / JS 順序保証・重複防止）
 * 参考: reitansai/js/load.js
 */
(function () {
  "use strict";

  const base = "/5g-fest";
  const cacheBuster = "v=" + Date.now();

  function alreadyHas(selector) {
    return !!document.querySelector(selector);
  }

  function injectCss(href) {
    const bare = href.split("?")[0];
    if (alreadyHas('link[href*="' + bare + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function injectScript(src, onload) {
    const bare = src.split("?")[0];
    if (alreadyHas('script[src*="' + bare + '"]')) {
      if (onload) onload();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = onload || null;
    script.onerror = function () {
      console.error("❌ load failed:", src);
      if (onload) onload();
    };
    document.head.appendChild(script);
  }

  // 限定公開ゲートを最優先
  injectCss(base + "/pr.css?" + cacheBuster);

  // 共通 CSS
  const commonCss = [
    base + "/css/style.css",
    base + "/menu/menu.css"
  ];
  commonCss.forEach(function (p) {
    injectCss(p + "?" + cacheBuster);
  });

  // ページ固有 CSS
  const path = window.location.pathname;
  let pageCss = "";

  if (path.includes("member")) {
    pageCss = base + "/css/member.css";
  }
  // 将来ページが増えたらここに追加

  if (pageCss) injectCss(pageCss + "?" + cacheBuster);

  // JS は順序厳守（pr → script → menu）
  // Supabase SDK は pr.js 内で動的ロード
  const jsQueue = [
    base + "/pr.js",
    base + "/js/script.js",
    base + "/menu/menu.js"
  ];

  function loadNext(i) {
    if (i >= jsQueue.length) {
      console.log(
        "%c✨ 5G Fest システムロード完了: " + path,
        "color:#ff2d95;font-weight:bold;"
      );
      return;
    }
    injectScript(jsQueue[i] + "?" + cacheBuster, function () {
      loadNext(i + 1);
    });
  }

  loadNext(0);
})();
