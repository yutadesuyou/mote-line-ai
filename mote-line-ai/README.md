# モテLINE返信AI - デプロイ手順

## 必要なもの（全部無料で始められる）
- GitHubアカウント
- Vercelアカウント（GitHub連携）
- Anthropic APIキー（https://console.anthropic.com）

---

## ステップ1: APIキーを取得する

1. https://console.anthropic.com にアクセス
2. 「API Keys」→「Create Key」
3. キーをコピーしておく（sk-ant-xxx...）

---

## ステップ2: GitHubにアップロード

1. https://github.com → 「New repository」
2. リポジトリ名: `mote-line-ai`（なんでもOK）
3. このフォルダの中身を全部アップロード
   - 「uploading an existing file」をクリック
   - フォルダごとドラッグ&ドロップ

---

## ステップ3: Vercelにデプロイ

1. https://vercel.com → 「Add New Project」
2. GitHubのリポジトリを選択
3. 「Environment Variables」に以下を追加:
   ```
   ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxx（さっきコピーしたやつ）
   ```
4. 「Deploy」ボタンを押す → 2分で公開完了

---

## ステップ4: Stripe課金を設定する（デプロイ後）

1. https://stripe.com でアカウント作成
2. 「Payment Links」→「Create payment link」
3. 商品: 「モテLINE返信AI プレミアム」¥1,480/月（サブスクリプション）
4. 作成されたURLを `components/PaywallModal.js` の以下の部分に貼る:
   ```js
   window.open('https://buy.stripe.com/YOUR_PAYMENT_LINK', '_blank')
   ```
5. Vercelに再デプロイ（GitHubにプッシュするだけ）

---

## ステップ5: Google AdSense申請（デプロイ後1〜2週間）

1. https://adsense.google.com でアカウント作成
2. サイトURL（Vercelで発行されたURL）を登録
3. 審査通過後、`pages/_document.js` のコメントアウトを外す:
   ```js
   // この行のコメントを外す↓
   <script async src="https://pagead2.googlesyndication.com/...?client=ca-pub-XXXX" />
   ```
4. `.env.local` に追加:
   ```
   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   ```

---

## 収益の流れ

```
ユーザーが1日3回以内に使う
  → 広告表示 → AdSense収益（クリック単価10〜50円）

4回目以降に使おうとする
  → 課金ウォール表示 → Stripe決済 → 月1,480円のサブスク収益
```

---

## ローカルで動かす場合

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数を設定
cp .env.local.example .env.local
# .env.localにAPIキーを貼り付ける

# 3. 起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```
