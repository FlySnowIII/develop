# Adobe XD Plugin  

Adobe XD Plugin by myself

## Project List

1. cd3f4c1f:
Export Artboard for Responsive/複数サイズ同時出力/多尺寸图片输出 (2018-11-11)  

## Projcet 1 [cd3f4c1f]: Export Artboard for Responsive

You can use this plugin to export all Artboards for mulite size.

(英語苦手)

説明：すべてのアートボードを複数サイズに一気で出力することができます。

技術的な難しいと思った部分：

やっはり同期・非同期操作のところですね。

async/awaitをよ〜やく分かったところに、まだForEachのときに失敗しました。

結局二日間使ってしまいました。。。まぁ、Adobe XD Pluginの開発がはじてですから仕方ないです。

```JavaScript
await Promise.all(some_array.map(async yournamed_object =>{}
```

大事な事：Array処理の場合、forEachでもなく、for inでもない、上記の書き方でやってください。上記のやり方でやると、プログラムの同期実行が保障できます。

そして、Adobe XD Plugin開発時に使った機能:

```JavaScript
// jQueryファイルをインポートし、jQuery機能をもたらす
const $ = require("./jquery");

// Adobe XD Plugのメイン関数
//    第一パラメタは選択コントロール(ユーザーが何かを選択されたとき)
//    第二パラメタはドキュメントルート(すべての要素をコントロールできる)
async function exportRendition(selection, adobeXDdocumentRoot){...}

// ドキュメントのすべてのArtboardをForする
adobeXDdocumentRoot.children.forEach(node => {...});

// 既存のArtboardからコーピーする
selection.items = node;
commands.duplicate();
let tempClone = selection.items[0];

// Artboardをリサイズする
tempClone.resize(300, 400);

// Adobe XDの表示言語を表示する
console.log("XD locale:", application.appLanguage);

// フォルダ選択ダイアログを表示する
const folder = await fs.getFolder();

// フォルダーを新規作成する、もし存在したらそもまま獲得する
var tempFolder = await folder.createFolder("new_folder_name")
    .catch(async error => {
        console.log("error:", error);
        // 2.If the folder has created,get it
        return await folder.getEntry("new_folder_name")
            .catch(error2 => {
                console.log("error2:", error2);
            })
            .then(gfolder => {
                return gfolder;
            })
    })
    .then(tfolder => {
        return tfolder;
    });
```

一番メインのはファイル出力の所ですが、あまりややこしすぎて、下記のドキュメントをリンクします。

[Document: application](https://adobexdplatform.com/plugin-docs/reference/application.html?h=createrenditions)  

とりあえず以上です、なんかありましたら連絡してください。