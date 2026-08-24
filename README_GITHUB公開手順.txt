横持便管理 完全版 公開手順

【重要】
この完全版はビルド不要です。GitHubには、中の4ファイルをそのままアップロードします。
フォルダー構成や隠しフォルダーはありません。

1. 既存GitHubリポジトリ「横持」の Code 画面を開く
2. 「ファイルを追加」→「ファイルをアップロード」
3. このフォルダー内の次の4ファイルをドラッグする
   index.html
   main.js
   style.css
   firestore.rules
4. 同名ファイルの置換を確認し、「Commit changes」を押す
5. GitHubの「設定」→左側の「ページ」
6. Build and deployment の Source で「Deploy from a branch」を選択
7. Branch は「main」または画面上の既定ブランチ、Folder は「/(root)」を選択して保存
8. 数分後、同じ「ページ」画面に公開URLが表示される

【Firestoreルール設定】
GitHub公開とは別にFirebase側で1回だけ設定します。
1. Firebase Consoleで yokomochi プロジェクトを開く
2. Firestore Database →「ルール」タブ
3. firestore.rules の全文を貼り付ける
4. 「公開」を押す

【PDF出力】
1. Web画面で対象週を表示
2. 「PDF出力」を押す
3. 印刷画面で「PDFに保存」
4. 用紙A3、横向き、背景のグラフィックONを推奨

【セキュリティ】
認証なしの仕様です。URLを知っている人は閲覧・登録・変更・削除できます。
公開URLを不特定多数へ掲載しないでください。
