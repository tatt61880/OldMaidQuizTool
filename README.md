# ババ抜きワードクイズ用ツール

同じ文字を 2 つずつ取り除き、残った文字を確認するツールです。

[ツールを開く](https://tatt61880.github.io/OldMaidQuizTool/)

文字列を入力すると結果が表示されます。文字の数え方は画面内の説明を参照してください。
入力内容はブラウザー内で処理されます。

## 開発

`index.html` をブラウザーで開いて動作を確認できます。ビルドは不要です。

```sh
npm ci
npm test
npm run lint
```

開発用コマンドは [package.json](package.json)、公開手順と実行環境は
[GitHub Actions の設定](.github/workflows/pages-hash.yml)を参照してください。
