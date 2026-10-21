# 英文メール作成（email-tool）

日本語でざっくり書いた内容を、相手との関係（上司・取引先 / 同僚 / 友人）に合わせた自然な英文メール（件名＋本文）に書き直すWebアプリです。

- Next.js（App Router）+ TypeScript + Tailwind CSS
- AI：Anthropic API（Claude Haiku 5.5 / `claude-haiku-5-5`）

## 準備

1. Node.js をインストールしておく
2. このフォルダで依存パッケージを入れる

   ```bash
   npm install
   ```

3. `.env.example` をコピーして `.env.local` を作り、APIキーを貼る

   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
   ```

   `.env.local` は `.gitignore` に入っているので、GitHub には上がりません。

## 起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## ファイル構成

- `app/page.tsx` … 画面（入力欄・関係ボタン・結果とコピー）
- `app/api/generate/route.ts` … サーバー側でAIを呼ぶ処理（APIキーはここでだけ使う）
- `lib/relationships.ts` … 関係の選択肢
