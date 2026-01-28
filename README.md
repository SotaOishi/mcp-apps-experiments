# mcp-apps-experiments

MCP Appsを色々試すリポジトリ

## セットアップ

```bash
pnpm install
```

## 動作方法

### ビルド & サーバー起動

```bash
pnpm dev
```

Viteでフロントエンド(`mcp-app.html`)をビルドした後、MCPサーバーが `http://localhost:3001/mcp` で起動します。

### 個別実行

```bash
# フロントエンドのビルドのみ
pnpm build

# サーバー起動のみ（事前にビルドが必要）
pnpm serve
```

### その他のコマンド

```bash
pnpm lint       # Biomeによるlint
pnpm format     # Biomeによるフォーマット
pnpm check      # lint + format
pnpm typecheck  # TypeScriptの型チェック
```

## MCP Tools

- **get-avocado-company-data** - 「株式会社アボカド大好き」の5年分の業績データを返す
- **get-similar-companies** - 類似企業2社の5年分の業績データを返す
