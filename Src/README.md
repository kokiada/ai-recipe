# のこりものナビ (Nokorimono Navi)

> 冷蔵庫の残り物から3秒で献立決定！  
> 余った食材を無駄なく活用する残り物活用アプリ

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-cyan)
![Claude API](https://img.shields.io/badge/Claude-3.5%20Sonnet-purple)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green)

## ✨ 特徴

### 🤖 マルチAI献立生成
- **Claude 3.5 Sonnet** & **OpenAI GPT-4o** の選択可能な2つのAI
- 冷蔵庫の残り物を**最大限活用**した現実的なレシピ提案
- 家族構成・アレルギー情報・予算を考慮した買い足し提案
- 調理時間・カロリー・難易度付きの詳細情報

### 🥬 スマート冷蔵庫管理
- 30種類の基本食材を簡単管理
- ワンタップで在庫の有無を切り替え
- 数量・単位の詳細管理
- 食材の追加・編集・削除機能

### ⚙️ カスタマイズ設定
- 大人・子供の人数設定
- 主要アレルギー対応（卵、乳製品、小麦、そば、えび・かに）
- AIプロバイダー選択（Claude / OpenAI）
- テーマカラー・背景色のカスタマイズ
- 設定情報をAI献立生成に反映

### 🍳 クックパッド連携
- 料理詳細画面から**クックパッド**に直接リンク
- 料理名での自動検索で豊富なレシピにアクセス
- 新しいタブで開くためアプリから離れない

### 📱 モバイルファースト設計
- 大きなタップ可能ボタン（44px+）
- 忙しい主婦のための直感的UI
- 1画面最大3機能の分かりやすい設計

## 🚀 クイックスタート

### 前提条件
- Node.js 18.0以降
- npm または yarn
- Anthropic API キー（Claude 3.5 Sonnet用）
- OpenAI API キー（GPT-4o用）※オプション

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/ai-recipe.git
cd ai-recipe/Src

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.localにANTHROPIC_API_KEYを設定
```

### 環境変数設定

`.env.local`ファイルを作成し、以下を設定：

```env
# 必須：Claude API（デフォルトAI）
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# オプション：OpenAI API（選択可能）
OPENAI_API_KEY=your_openai_api_key_here
```

> **注意**: 最低でもClaude APIキーは必須です。OpenAIを使用しない場合は設定不要です。

### 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000`でアプリにアクセスできます。

## 📋 使い方

### 1. 冷蔵庫の設定
1. 「🥬 冷蔵庫を見る」をタップ
2. 利用可能な食材をタップして有効化
3. 必要に応じて数量・単位を編集
4. 新しい食材を「+ 追加」で登録

### 2. 詳細設定
1. 「⚙️ 設定」をタップ
2. 大人・子供の人数を選択
3. アレルギー情報をチェック
4. AIプロバイダーを選択（Claude / OpenAI）
5. テーマカラー・背景色をカスタマイズ
6. 「保存」で設定を確定

### 3. AI献立生成
1. ホーム画面で品数・予算・コメントを入力
2. 「✨ AI献立生成」をタップ
3. 残り物から最適な献立を自動提案
4. 料理をタップして**クックパッド**でレシピ確認
5. 気に入らない場合は「AI献立を再生成」

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.2.4** - React フレームワーク（App Router使用）
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS v4** - ユーティリティファーストCSS
- **shadcn/ui** - アクセシブルなUIコンポーネント

### AI・API
- **Anthropic Claude 3.5 Sonnet** - 高精度日本語理解の献立生成AI
- **OpenAI GPT-4o** - バランス重視の献立生成AI
- **@anthropic-ai/sdk** - Claude API クライアント
- **openai** - OpenAI API クライアント

### アイコン・フォント
- **Lucide React** - アイコンライブラリ
- **Geist Sans/Mono** - モダンフォント

## 📂 プロジェクト構造

```
Src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── generate-menu/ # AI献立生成エンドポイント
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # UIコンポーネント
│   └── ui/               # shadcn/ui コンポーネント
├── lib/                  # ユーティリティ・ライブラリ
│   ├── claude.ts         # Claude API統合
│   └── utils.ts          # 共通ユーティリティ
├── .env.local            # 環境変数（要設定）
├── package.json          # 依存関係・スクリプト
└── tsconfig.json         # TypeScript設定
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# ESLintチェック
npm run lint
```

## 🎯 ロードマップ

### v1.1（次回リリース）
- [x] ~~クックパッド連携~~ ✅
- [x] ~~マルチAI対応（Claude + OpenAI）~~ ✅
- [x] ~~テーマカスタマイズ~~ ✅
- [ ] PWA対応（オフライン機能）
- [ ] 献立履歴・お気に入り機能

### v1.2（将来の機能）
- [ ] 季節・天気による献立提案
- [ ] 栄養価詳細表示・管理
- [ ] レシピのメモ・評価機能
- [ ] SNSシェア機能
- [ ] 多言語対応（英語・中国語）

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [Anthropic](https://www.anthropic.com/) - Claude 3.5 Sonnet API
- [OpenAI](https://openai.com/) - GPT-4o API
- [クックパッド](https://cookpad.com/) - レシピ検索連携
- [Vercel](https://vercel.com/) - Next.js フレームワーク
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント
- [Lucide](https://lucide.dev/) - アイコンライブラリ

---

**のこりものナビ** - 冷蔵庫の残り物を美味しい献立に変える魔法のアプリ！ 🥬✨🍽️
