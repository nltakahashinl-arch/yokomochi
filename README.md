# 横持便 週間予定表 本番実装

添付Excelの「山陽自動車運送往復便 予定表」をベースにした共有Webアプリです。過去Excelの取り込みは行わず、公開後に登録した予定を週単位で管理します。

## 実装内容

- 月曜日から土曜日までの週間帳票
- 通常4便と増便4枠、合計8枠
- 予定の登録、編集、削除
- 行き先・ルート、担当者、PL数・枚数、備考
- 予約不可枠の赤表示
- Firestoreリアルタイム共有
- 「PDF出力」ボタンからA3横、Excel帳票風レイアウトで今週分をPDF保存
- GitHub Pages自動デプロイ
- Firebase Hostingにも対応

## 1. Firebaseを準備

1. Firebase Consoleでプロジェクトを作成します。
2. Webアプリを追加し、表示された `firebaseConfig` を控えます。
3. Firestore Databaseを作成します。
4. `src/firebase-config.example.js` を参考に `src/firebase-config.js` を書き換えます。
5. Firebase ConsoleのFirestore Rulesに `firestore.rules` の内容を反映します。

この実装は認証なしのため、URLを知る人は閲覧と編集ができます。インターネット全体に公開する場合、第三者による書き換えリスクがあります。

## 2. ローカル確認

```bash
npm install
npm run dev
```

## 3. GitHub Pagesへ公開

1. GitHubで新しいリポジトリを作ります。
2. このフォルダーの中身をリポジトリへ配置し、`main` ブランチへpushします。
3. GitHubのリポジトリで Settings > Pages > Source を `GitHub Actions` にします。
4. `.github/workflows/deploy-pages.yml` がビルドと公開を行います。

## 4. PDF保存

画面で対象週を表示して「PDF出力」を押します。ブラウザの印刷画面で次を選択します。

- 送信先: PDFに保存
- 用紙: A3
- 向き: 横
- 余白: 既定または最小
- 背景のグラフィック: オン推奨

## Firebase Hostingを使う場合

Firebase CLIが使える環境では、`.firebaserc.example` を `.firebaserc` にコピーしてProject IDを設定後、次を実行します。

```bash
npm install
npm run build
firebase deploy --only hosting,firestore:rules
```

## 注意

- `firebaseConfig` はWebアプリの接続設定です。アクセス制御はFirestore Rulesで行います。
- 現在の `firestore.rules` はユーザー要件に合わせて認証なしで全操作を許可しています。
- GitHubを公開リポジトリにする場合でも、管理用の秘密鍵やサービスアカウントJSONは置かないでください。
