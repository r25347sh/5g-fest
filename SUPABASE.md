# 5G Fest × Supabase セットアップ完全ガイド

このドキュメントは、**リポジトリ側のコードは完成済み**の状態で、
あなた（管理者）が **Supabase ダッシュボードでやるべき作業だけ** を
細かく・詳細にまとめたものです。

コードは既に以下を前提に動くように書かれています。

- プロジェクト URL: `https://nmdvmnnjwpqcizhcupku.supabase.co`
- Project ID: `nmdvmnnjwpqcizhcupku`
- anon (公開) キー: コード内 `pr.js` に埋め込み済み
- 認証ユーザー名（画面上）: `reitaku`
- 認証パスワード: `hiroike2026`
- 内部で使うメールアドレス: `reitaku@5g-fest.local`（ユーザーには見せない）

---

## 目次

1. [全体の仕組み](#1-全体の仕組み)
2. [あなたがやるべき作業（最短チェックリスト）](#2-あなたがやるべき作業最短チェックリスト)
3. [Auth ユーザー作成（メール不要に見せる方法）](#3-auth-ユーザー作成メール不要に見せる方法)
4. [Auth 設定の推奨変更](#4-auth-設定の推奨変更)
5. [コード側の適用箇所と動作](#5-コード側の適用箇所と動作)
6. [キーの使い分けとセキュリティ](#6-キーの使い分けとセキュリティ)
7. [動作確認手順](#7-動作確認手順)
8. [トラブルシューティング](#8-トラブルシューティング)
9. [ログアウト方法](#9-ログアウト方法)
10. [将来の拡張メモ](#10-将来の拡張メモ)

---

## 1. 全体の仕組み

```
ブラウザ
  └─ load.js
       ├─ pr.css（ゲート見た目）
       ├─ style.css / menu.css / ページCSS
       ├─ pr.js  ← ここが認証の心臓部
       │    ├─ Supabase JS SDK を CDN からロード
       │    ├─ createClient(URL, anon key)
       │    ├─ 既にセッションがあればスキップ
       │    ├─ なければ超絶おしゃれなログイン画面を表示
       │    └─ 入力された username/password を
       │         ・画面上は「reitaku / hiroike2026」
       │         ・内部では email = reitaku@5g-fest.local に変換して
       │           supabase.auth.signInWithPassword() を呼ぶ
       ├─ script.js
       └─ menu.js
```

- **メールアドレスをユーザーに入力させない** ため、
  画面には「ユーザー名」「パスワード」だけを出し、
  コード内部で `reitaku` → `reitaku@5g-fest.local` にマッピングしています。
- Supabase 側でユーザーがまだ存在しなくても、
  正しい `reitaku` / `hiroike2026` なら **ローカルフォールバックで入場可能** です
  （開発中・未設定時の安全策）。
- 本番で本格運用するなら、下の手順で Auth ユーザーを1人作ってください。

---

## 2. あなたがやるべき作業（最短チェックリスト）

| # | 作業 | 必須度 | 場所 |
|---|------|--------|------|
| 1 | Supabase ダッシュボードにログイン | 必須 | https://supabase.com/dashboard |
| 2 | プロジェクト `nmdvmnnjwpqcizhcupku` を開く | 必須 | 左サイドバー |
| 3 | Authentication → Users でユーザーを1人作成 | **必須** | 下記詳細 |
| 4 | Authentication → Providers → Email を有効確認 | 推奨 | 下記詳細 |
| 5 | 「Confirm email」を OFF にする | **強く推奨** | 下記詳細 |
| 6 | サイトを開いて `reitaku` / `hiroike2026` でログイン確認 | 必須 | デプロイ先 |

これだけやれば「あとはコードが全部やる」状態になります。

---

## 3. Auth ユーザー作成（メール不要に見せる方法）

### 手順

1. 左メニュー **Authentication** → **Users**
2. 右上 **Add user** → **Create new user**
3. 以下を入力:

| 項目 | 値 |
|------|-----|
| Email | `reitaku@5g-fest.local` |
| Password | `hiroike2026` |
| Auto Confirm User | **ON**（チェックを入れる） |

4. **Create user** をクリック

### なぜ `.local` メールなのか？

- 本物のメールアドレスは不要
- ユーザー画面には「ユーザー名: reitaku」だけを見せたい
- Supabase Auth は内部的に email + password を要求するため、
  ダミーの `reitaku@5g-fest.local` を使う
- `.local` は実在しないドメインなので誤送信リスクもほぼゼロ

### 注意

- パスワードは画面上のものと **完全一致** させてください（`hiroike2026`）
- Auto Confirm を ON にしないと、メール確認待ちでログインできません

---

## 4. Auth 設定の推奨変更

### 4-1. Email プロバイダ

1. **Authentication** → **Providers** → **Email**
2. **Enable Email provider** が ON になっていることを確認
3. **Confirm email** を **OFF** にする  
   （ダミーメールなので確認メールは届かない → OFF 必須）

### 4-2. （任意）Site URL / Redirect URLs

今回の実装はリダイレクトを使わないクライアントサイド認証のため、
必須ではありませんが、将来のため:

- **Authentication** → **URL Configuration**
- Site URL: デプロイ先のオリジン（例: `https://あなたのドメイン`）
- Redirect URLs: 同じオリジンを追加

### 4-3. 使わないもの

- Magic Link / OTP / Social Login → 今回は不要
- service_role キー → **絶対にフロントエンドに置かない**（既に置いていません）

---

## 5. コード側の適用箇所と動作

### ファイル一覧と役割

| ファイル | 役割 |
|----------|------|
| `js/load.js` | CSS/JS を正しい順序で注入。`pr.css` → 共通CSS → ページCSS → `pr.js` → `script.js` → `menu.js` |
| `pr.css` | 限定公開ゲートの超絶おしゃれスタイル（Opera Pink × Cyan × Gold） |
| `pr.js` | Supabase クライアント初期化・セッション確認・ログイン UI・認証ロジック |
| `index.html` / `pages/member.html` | `<script src="/5g-fest/js/load.js">` のみ。個別の CSS/JS リンクは削除済み |
| `SUPABASE.md` | 本ファイル |

### pr.js 内の主要定数（変更したい場合）

```js
const SUPABASE_URL = "https://nmdvmnnjwpqcizhcupku.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...（anonキー）";

const USER_MAP = {
  reitaku: "reitaku@5g-fest.local"
};
const EXPECTED_USER = "reitaku";
const EXPECTED_PASS = "hiroike2026";
```

### 認証フロー（詳細）

1. ページ読み込み
2. `load.js` が `pr.js` を最初にロード
3. `pr.js` が:
   - ローカルフラグ（sessionStorage / localStorage）を確認
   - あれば即ゲート解除
   - なければ Supabase SDK を CDN から取得 → `createClient`
   - `supabase.auth.getSession()` で既存セッションを確認
   - あれば解除、なければゲート UI を表示
4. ユーザーが `reitaku` / `hiroike2026` を入力
5. `authenticate()`:
   - まずハードコード一致チェック（UX 用）
   - 一致したら `signInWithPassword({ email: "reitaku@5g-fest.local", password })`
   - 成功 → セッション保存 + ゲート解除
   - Supabase 側でユーザー未作成などでエラー → **ローカルフォールバックで入場**
6. 「次回から自動でログイン」にチェックがある場合:
   - `localStorage` にフラグを保存
   - Supabase の `persistSession: true` でトークンも永続化

---

## 6. キーの使い分けとセキュリティ

| キー | 値の場所 | 用途 | 公開してよいか |
|------|----------|------|----------------|
| **anon** | `pr.js` に埋め込み済み | クライアントからの Auth / 将来の DB 読み取り | **公開してOK**（RLS で守る前提） |
| **service_role** | このリポジトリには **入れていない** | サーバーサイドの管理者操作 | **絶対に公開禁止** |
| Publishable Key / Secret Key | 今回の実装では未使用 | 新しいキー形式用 | 必要に応じて |

### 注意

- `service_role` キーをフロントに置くと、誰でも全データにアクセスできる危険がある
- 現在の実装は **anon キーのみ** を使っているので安全
- 将来テーブルを作る場合は、必ず **Row Level Security (RLS)** を有効にすること

---

## 7. 動作確認手順

1. サイトを開く（未ログイン状態）
2. 暗い背景にピンク×シアンのパーティクルが浮くゲートが表示されること
3. わざと間違ったパスワードを入れて、エラーメッセージとシェイク演出が出ること
4. `reitaku` / `hiroike2026` を入力して「入場する」
5. 「ようこそ、5Gへ」と出てゲートがフェードアウトすること
6. ページ内容が表示されること
7. 「次回から自動でログイン」にチェックを入れて再ログイン → リロードしてもゲートが出ないこと
8. ブラウザのコンソールで `G5FestPR.logout()` を実行 → ログアウトしてゲートが再表示されること

---

## 8. トラブルシューティング

| 症状 | 原因候補 | 対処 |
|------|----------|------|
| ゲートが出ない | 既にログイン済み / load.js 未読込 | `G5FestPR.logout()` または localStorage クリア |
| 正しいパスでも「違う」と出る | 入力ミス（全角・スペース） | 半角で再入力 |
| Supabase エラーがコンソールに出るが入れる | ユーザー未作成 → フォールバック動作 | セクション3でユーザー作成 |
| ログイン後すぐまたゲートが出る | localStorage が無効 / プライベートモード | 「次回から自動」OFF で sessionStorage のみ使う |
| SDK 読み込み失敗 | ネットワーク / CDN ブロック | コンソールのエラーを確認。フォールバックで入場は可能 |
| CORS エラー | カスタムドメイン未許可 | Supabase の Auth URL Configuration を確認 |

---

## 9. ログアウト方法

コンソールで:

```js
G5FestPR.logout()
```

または開発者ツールで:

- Application → Local Storage / Session Storage から
  `g5fest-pr-*` と `g5fest-sb-auth` を削除してリロード

---

## 10. 将来の拡張メモ

- 複数ユーザーを増やしたい場合:
  - Supabase でユーザーを追加
  - `pr.js` の `USER_MAP` に `username: "email@..."` を追加
- パスワード変更:
  - Supabase ダッシュボードでユーザーのパスワードを更新
  - `pr.js` の `EXPECTED_PASS` も合わせて変更
- データベースを使う場合:
  - テーブル作成後、必ず RLS を有効化
  - 認証済みユーザーのみ SELECT 可能なポリシーを書く
- service_role が必要な処理:
  - Edge Functions や自前サーバーで実行し、フロントには絶対に渡さない

---

## 付録: 現在コードに入っているキー情報（参照用）

```
URL:          https://nmdvmnnjwpqcizhcupku.supabase.co
Project ID:   nmdvmnnjwpqcizhcupku
anon:         eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZHZtbm5qd3BxY2l6aGN1cGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjAzNjAsImV4cCI6MjEwMTQ5NjM2MH0.av37HMV2QmX511TUXMiT-nB5-RdHX3f3G9zooyy_Pnk
```

service_role および Secret Key は **このリポジトリには含めていません**。
必要になったらサーバーサイドでのみ使用してください。

---

以上で、**コード側は完成・あなたがやるのは上記の Auth ユーザー作成と Confirm email OFF だけ** です。
