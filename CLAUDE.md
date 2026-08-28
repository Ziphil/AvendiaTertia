# CLAUDE.md


## このリポジトリについて
ホームページ群 (<http://ziphil.com>) の**静的サイトジェネレータと原稿ファイル**。
独自のマークアップ言語 ZenML で書かれた原稿を HTML に変換し、FTP でサーバーにアップロードする。

サイトは 3 つのセクション (scheme) に分かれている。

| scheme | ディレクトリ | 内容 |
| --- | --- | --- |
| `shaleian` | `document/*/shaleian` | 人工言語「シャレイア語」公式サイト (Avendia) |
| `fennese` | `document/*/fennese` | 人工言語「フェンナ語」公式サイト (Лофжучло) |
| `other` | `document/*/other` | 自然言語・数理科学の学習ノート (Τὰ Ζιφίλου Βιβλία) |

## ディレクトリ構成
- **`generator/`** — 変換スクリプトの本体。ファイル走査・ZenML のパース・SCSS/TS のコンパイル・FTP アップロードを行う。
  - **`generator/generator.ts`** — 中心。コマンドラインオプションの処理と各変換の入口。
  - **`generator/configs.ts`** — `config/config.json` の読み出しとパス変換。
  - **`generator/service/`** … 単発で走らせる補助処理 (現在は索引生成 `reference` のみ)。
- **`plugin/`** — ZenML パーサのプラグイン (`&m` などのマクロを定義)。
- **`template/`** — ZenML の各タグを HTML に変換するルール。`template/index.ts` に全マネージャの登録順がある。
  - **`template/template.html`** — ページ全体の HTML の枠 (doT.js テンプレート)。
  - **`template/translations.json`** — セクション名などの日英対訳。
- **`document/`** — 原稿ファイル本体。
  - **`document/ja/`** — 日本語版。
  - **`document/en/`** — 英語版。
  - **`document/common/`** — 両言語に出力される共通ファイル。SCSS や TS などのページの内容によらないもの。 
- **`config/`** — 設定ファイル。`config/default.json` が雛形で、実際に使う `config/config.json` は **git 管理外**。
- **`log/`** — 更新履歴・索引・エラーログ (git 管理外)。
- **`dist/`** — ビルド成果物 (git 管理外)。

## 原稿ファイルの規則
変換対象になるのは、ファイル名が `index.<拡張子>` または `<数字>.<拡張子>` のものだけ (`generator/generator.ts` の `checkValidDocumentPath`)。
それ以外の名前のファイルは無視される。

拡張子は以下のように変換される。
- `.zml` → `.html` (ZenML → HTML)
- `.scss` → `.css` (`rpx` 単位は 1/16 されて `rem` に変換される)
- `.ts`, `.tsx` → `.js` (webpack でバンドル)
- `.cgi` → そのままコピー

`document/ja/` 以下は日本語サイト、`document/en/` 以下は英語サイトに、`document/common/` 以下は**両方**に出力される。

画像・PDF などのバイナリ (`document/*/file/`, `document/*/material/`) と `.htaccess` はこのリポジトリに含まれていない

## ZenML (`.zml`) の読み書き
ページの中身は **Zenithal Markup Language (ZenML)** という独自形式で書かれている。
XML とほぼ同じ構造を TeX 風の構文で書く形式。
```
\tag|attr="value"|<内容>     →  <tag attr="value">内容</tag>
\tag|attr="value"|;          →  <tag attr="value"/>
{...} [...] /.../            →  \x, \xn, \i のショートパンド
&m<...>                      →  数式マクロ
`< `> `|                     →  エスケープ (バッククォートを前置)
#<コメント>
## 行コメント
```

**`.zml` ファイルを読み書きする際は、あらかじめ必ず次の 2 つを読むこと**。
- `.claude/references/zenml-syntax.md` — ZenML の言語仕様 (要素・属性・マーク・エスケープ・マクロ・コメント)
- `.claude/references/avendia-zenml-spec.md` — このサイトで使えるタグの一覧 (ページ構造・ブロック・インライン・数式)

とくに重要な注意点:
- **未登録のタグを書いてもエラーにならず、その要素は出力から黙って消える** (`template/fallback.ts`)。
  タグ名や属性名を推測で書かないこと。
  `template/` を grep するか既存の `.zml` から用例を探すこと。
- ファイル冒頭は `\zml?|version="1.1"|;` と `\xml?|version="1.0",encoding="UTF-8"|;` の 2 行が定型。
  既存ファイルの大半は UTF-8 BOM 付きで、BOM は変換時に除去されるので有無は問われない。
- 属性値は必ず `"` で囲む。
  HTML と違って`'` は使えない。
- `<`, `>`, `|`, `;`, `&`, `{`, `}`, `[`, `]`, `/`, `\`, `` ` ``, `#` にはエスケープが必要 (バッククォートを前置)。
  特に **`;` がエスケープ必須なことに注意**。

## 作業上の注意
- `config/config.json` にはサーバーのパスワード等が記載されているため、**これの読み書きは禁止する**。
  特に**内容を出力したりコミットしたりしない**。
- 各種 npm コマンド (`npm run build` や `npm run start` 等) は勝手に実行しない。
- **git リポジトリの操作も勝手に実行しない**。
  commit や push はユーザーの指示がない限り行わない。