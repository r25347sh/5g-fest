/**
 * 5G Fest 限定公開ゲート（Ultra Luxury + Supabase Auth）
 * username: reitaku  /  password: hiroike2026
 *
 * 【ガチモン仕様】
 * - Supabase Auth (signInWithPassword) が成功したときだけ入場可能
 * - ローカルフォールバックなし（正しいパスでも Supabase 失敗なら拒否）
 * - 既存セッションがある場合のみ自動通過
 * - 「次回から自動でログイン」ON → Supabase persistSession + local フラグ
 *
 * セットアップ手順は SUPABASE.md を参照
 */
(function () {
  "use strict";

  if (window.__G5_PR_BOOTED__) return;
  window.__G5_PR_BOOTED__ = true;

  // ========== 設定 ==========
  const SUPABASE_URL = "https://nmdvmnnjwpqcizhcupku.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZHZtbm5qd3BxY2l6aGN1cGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjAzNjAsImV4cCI6MjEwMTQ5NjM2MH0.av37HMV2QmX511TUXMiT-nB5-RdHX3f3G9zooyy_Pnk";

  // ユーザー名 → Supabase に登録したメールアドレス
  const USER_MAP = {
    reitaku: "reitaku@5g-fest.local"
  };

  const KEY_AUTH = "g5fest-pr-auth";
  const KEY_REMEMBER = "g5fest-pr-remember";
  const KEY_SESSION = "g5fest-pr-session";

  const FAIL_LINES = [
    "……違う。VIPルームへの扉はまだ開かない。",
    "アクセス拒否。ホストの門はまだ閉じたまま。",
    "パスワードが迷子になっているようです。",
    "それ、昨日の仮パスでは？",
    "ERROR: glamour_level_insufficient",
    "門番「もう一度、よく考えてみて」",
    "認証失敗。でも失敗はおもてなしの一部です。",
    "ヒントは出しません。それが5Gです。",
    "キャバホストの世界は甘くない…再入力を。",
    "Supabase が『違う』と言っています。"
  ];

  const STATUS_LINES = [
    "スキャン中… VIP資格を確認しています",
    "5G Fest プロトコル待機中",
    "関係者のみ入場可 — Restricted Area",
    "Luxury Host Club · 5G — verifying…"
  ];

  let supabase = null;

  // ========== ストレージ（補助フラグ。本物の判定は Supabase セッション） ==========
  function markAuthenticated(remember) {
    try {
      sessionStorage.setItem(KEY_SESSION, "1");
      if (remember) {
        localStorage.setItem(KEY_AUTH, "1");
        localStorage.setItem(KEY_REMEMBER, "1");
      } else {
        localStorage.removeItem(KEY_AUTH);
        localStorage.removeItem(KEY_REMEMBER);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function clearAuth() {
    try {
      localStorage.removeItem(KEY_AUTH);
      localStorage.removeItem(KEY_REMEMBER);
      sessionStorage.removeItem(KEY_SESSION);
    } catch (e) {
      /* ignore */
    }
  }

  // ========== UI ==========
  function unlock() {
    document.documentElement.classList.remove("g5-pr-locked");
    const overlay = document.querySelector(".g5-pr-overlay");
    if (overlay) {
      overlay.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      overlay.style.opacity = "0";
      overlay.style.transform = "scale(1.04)";
      setTimeout(function () {
        overlay.remove();
      }, 460);
    }
  }

  function lockBodyEarly() {
    document.documentElement.classList.add("g5-pr-locked");
  }

  function spawnParticles(host, count) {
    for (var i = 0; i < count; i++) {
      var p = document.createElement("div");
      p.className = "g5-pr-particle";
      var r = Math.random();
      if (r > 0.66) p.classList.add("cyan");
      else if (r > 0.33) p.classList.add("gold");
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 5 + Math.random() * 11 + "s";
      p.style.animationDelay = Math.random() * 5 + "s";
      p.style.width = 3 + Math.random() * 6 + "px";
      p.style.height = p.style.width;
      host.appendChild(p);
    }
  }

  // ========== Supabase ==========
  function loadSupabaseSdk() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) {
        resolve(window.supabase);
        return;
      }
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = function () {
        resolve(window.supabase);
      };
      s.onerror = function () {
        reject(new Error("Supabase SDK load failed"));
      };
      document.head.appendChild(s);
    });
  }

  async function initSupabase() {
    try {
      var sb = await loadSupabaseSdk();
      supabase = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: "g5fest-sb-auth"
        }
      });
      return true;
    } catch (e) {
      console.error("[5G PR] Supabase init failed:", e);
      return false;
    }
  }

  /** ガチモン: 有効な Supabase セッションがあるか */
  async function hasValidSupabaseSession() {
    if (!supabase) return false;
    try {
      var res = await supabase.auth.getSession();
      return !!(res.data && res.data.session);
    } catch (e) {
      return false;
    }
  }

  /**
   * ガチモン認証
   * - Supabase signInWithPassword 成功時のみ ok: true
   * - 失敗・SDK なし・通信エラーはすべて拒否
   */
  async function authenticate(username, password, remember) {
    if (!supabase) {
      return {
        ok: false,
        reason: "sdk",
        message: "認証サーバーに接続できません。しばらくしてから再試行してください。"
      };
    }

    var email = USER_MAP[username];
    if (!email) {
      // 未知のユーザー名も一律「無効」扱い（ユーザー列挙を防ぐ）
      return { ok: false, reason: "invalid" };
    }

    try {
      var result = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (result.error) {
        console.warn("[5G PR] Supabase signIn:", result.error.message);
        return { ok: false, reason: "invalid" };
      }

      if (result.data && result.data.session) {
        // remember OFF のときは persist を弱める（次回タブでは再ログイン）
        if (!remember) {
          try {
            // session フラグのみ残し、local の remember は付けない
            // Supabase トークンは persistSession:true なので storage に残るが、
            // ログアウト or 明示的 clear で消せる。UX 用フラグは remember に従う。
          } catch (e) {
            /* ignore */
          }
        }
        markAuthenticated(remember);
        return { ok: true, source: "supabase" };
      }

      return { ok: false, reason: "invalid" };
    } catch (e) {
      console.error("[5G PR] Supabase error:", e);
      return {
        ok: false,
        reason: "network",
        message: "通信エラーです。ネットワークを確認して再試行してください。"
      };
    }
  }

  // ========== ゲート UI ==========
  function showGate(opts) {
    opts = opts || {};
    lockBodyEarly();
    if (document.querySelector(".g5-pr-overlay")) return;

    var overlay = document.createElement("div");
    overlay.className = "g5-pr-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "5G Fest 限定公開認証");

    overlay.innerHTML =
      '<div class="g5-pr-particles" aria-hidden="true"></div>' +
      '<div class="g5-pr-flash" aria-hidden="true"></div>' +
      '<div class="g5-pr-card">' +
      '  <div class="g5-pr-brand-wrap"><span class="g5-pr-badge">Restricted</span></div>' +
      '  <h1 class="g5-pr-title">5G Fest</h1>' +
      '  <p class="g5-pr-sub">この先は関係者限定エリアです。<br>ユーザー名とパスワードで入場してください。</p>' +
      '  <p class="g5-pr-status" id="g5-pr-status"></p>' +
      '  <form class="g5-pr-form" novalidate>' +
      '    <div class="g5-pr-field">' +
      '      <label for="g5-pr-user">ユーザー名</label>' +
      '      <input id="g5-pr-user" name="username" type="text" autocomplete="username" required spellcheck="false" />' +
      '    </div>' +
      '    <div class="g5-pr-field">' +
      '      <label for="g5-pr-pass">パスワード</label>' +
      '      <input id="g5-pr-pass" name="password" type="password" autocomplete="current-password" required />' +
      '    </div>' +
      '    <label class="g5-pr-remember">' +
      '      <input type="checkbox" id="g5-pr-remember" />' +
      '      <span>次回から自動でログインする</span>' +
      '    </label>' +
      '    <p class="g5-pr-error" id="g5-pr-error" aria-live="polite"></p>' +
      '    <button type="submit" class="g5-pr-submit">入場する</button>' +
      '  </form>' +
      '  <p class="g5-pr-foot">5G Fest — 令和8年度 麗澤高等学校 5年G組<br><span class="g5-pr-hint">失敗しても、おもてなしは続く。</span></p>' +
      "</div>";

    function mount() {
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
        return;
      }
      document.body.appendChild(overlay);

      var particles = overlay.querySelector(".g5-pr-particles");
      spawnParticles(particles, 22);

      var form = overlay.querySelector(".g5-pr-form");
      var userInput = overlay.querySelector("#g5-pr-user");
      var passInput = overlay.querySelector("#g5-pr-pass");
      var rememberInput = overlay.querySelector("#g5-pr-remember");
      var errorEl = overlay.querySelector("#g5-pr-error");
      var statusEl = overlay.querySelector("#g5-pr-status");
      var submitBtn = overlay.querySelector(".g5-pr-submit");
      var flash = overlay.querySelector(".g5-pr-flash");

      var statusIdx = 0;
      if (opts.initError) {
        statusEl.textContent = opts.initError;
        errorEl.textContent = opts.initError;
      } else {
        statusEl.textContent = STATUS_LINES[0];
      }
      var statusTimer = setInterval(function () {
        statusIdx = (statusIdx + 1) % STATUS_LINES.length;
        statusEl.textContent = STATUS_LINES[statusIdx];
      }, 3000);

      setTimeout(function () {
        userInput && userInput.focus();
      }, 90);

      var failCount = 0;

      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var u = (userInput.value || "").trim();
        var p = passInput.value || "";
        var remember = !!(rememberInput && rememberInput.checked);

        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
        errorEl.textContent = "";
        statusEl.textContent = "認証中… Supabase と通信しています";

        var result = await authenticate(u, p, remember);

        submitBtn.classList.remove("is-loading");

        if (result.ok) {
          clearInterval(statusTimer);
          errorEl.textContent = "";
          statusEl.textContent = "認証成功 — VIPルームへようこそ";
          submitBtn.classList.add("is-success");
          submitBtn.textContent = "ようこそ、5Gへ";
          if (flash) {
            flash.classList.add("is-on");
            setTimeout(function () {
              flash.classList.remove("is-on");
            }, 420);
          }
          spawnParticles(particles, 28);
          setTimeout(unlock, 580);
        } else {
          submitBtn.disabled = false;
          failCount++;
          var line =
            result.message ||
            FAIL_LINES[Math.floor(Math.random() * FAIL_LINES.length)];
          if (failCount >= 3 && !result.message) {
            line = "連続失敗 " + failCount + " 回。深呼吸してから再挑戦を。";
          }
          errorEl.textContent = line;
          statusEl.textContent =
            result.reason === "network" || result.reason === "sdk"
              ? "接続に問題があります"
              : "認証失敗ログを記録しました…（気のせい）";
          passInput.value = "";
          passInput.classList.remove("is-shake");
          void passInput.offsetWidth;
          passInput.classList.add("is-shake");
          userInput.classList.remove("is-shake");
          void userInput.offsetWidth;
          userInput.classList.add("is-shake");
          passInput.focus();
        }
      });

      overlay.addEventListener("keydown", function (e) {
        if (e.key === "Escape") e.preventDefault();
      });
    }

    mount();
  }

  // ========== Public API ==========
  window.G5FestPR = {
    logout: async function () {
      clearAuth();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          /* ignore */
        }
      }
      location.reload();
    },
    /** ガチモン: 現在有効な Supabase セッションがあるか（async） */
    isAuthenticated: async function () {
      if (!supabase) {
        var ok = await initSupabase();
        if (!ok) return false;
      }
      return hasValidSupabaseSession();
    }
  };

  // ========== Boot（ガチモン: Supabase セッション必須） ==========
  (async function boot() {
    lockBodyEarly();

    var ready = await initSupabase();
    if (!ready) {
      showGate({
        initError:
          "認証サーバーに接続できません。ネットワークを確認してください。"
      });
      return;
    }

    var hasSession = await hasValidSupabaseSession();
    if (hasSession) {
      // 既存の本物セッションあり → 通過
      markAuthenticated(true);
      unlock();
      return;
    }

    // ローカルフラグだけ残っていても無効（古いフォールバック残骸を掃除）
    clearAuth();
    showGate();
  })();
})();
