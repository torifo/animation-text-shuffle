---
name: anim-text-shuffle
description: "Typographic hover / micro-interaction animation (pure HTML/CSS/JS, no deps). Use when you need a hover / micro-interaction effect with a typographic feel — e.g. ナビリンク、見出し、ロゴ、CTA のホバー装飾. ホバーした位置を起点に、近い文字から順にデコードが伝染して「正解」へ収束する演出。カーソルを置いた場所から波紋のように解けていく。"
---

# anim-text-shuffle (C·Ho · ホバー文字シャッフル)

Pure HTML + CSS + vanilla JS, **zero dependencies**. ホバーした位置を起点に、近い文字から順にデコードが伝染して「正解」へ収束する演出。カーソルを置いた場所から波紋のように解けていく。

## When to use / 使いどころ
- **EN:** a *hover / micro-interaction* effect with a *typographic* feel.
- **JP:** タイポグラフィ × ホバー／マイクロインタラクション。推奨配置: ナビリンク、見出し、ロゴ、CTA のホバー装飾

## Bundled assets / 同梱アセット
This skill folder is the reference implementation — copy from these files:
- `index.html` — full working demo (open to preview)
- `style.css` — component styles
- `script.js` — the self-contained logic
- `README.md` — full human-facing doc (JP): mechanism, accessibility, constraints

## How to apply / 組み込み手順
Copy the component CSS block from `style.css` and the script from `script.js` (no build step), then follow the markup/parameters below.

### 1. 2 ファイルをコピー

`script.js` をそのまま、`style.css` からは以下だけ取り込めば動く：

```css
.ts{ font-family:monospace; white-space:pre-wrap; }
.ts .ts-dud{ color:#ff2d55; opacity:.85; }   /* 乱れ文字の色 */
```

### 2. 属性を付ける

```html
<!-- ホバーで再デコード（初期テキストが正解） -->
<a class="ts" data-text-shuffle>PROJECTS</a>

<!-- 読み込み時に1回だけデコード -->
<h1 class="ts" data-text-shuffle data-shuffle-on="load">Letters decode</h1>

<!-- ホバーで別テキストへスワップ（離れると戻る） -->
<span class="ts" data-text-shuffle data-shuffle-to="DECODED">HOVER ME</span>

<script src="./script.js"></script>
```

## Customize / カスタマイズ
### data 属性
| 属性 | 役割 | 既定 |
|---|---|---|
| `data-text-shuffle` | 有効化マーカー（値不要） | — |
| `data-shuffle-on` | トリガー。`hover`（既定）／ `load`（読み込み時に1回） | `hover` |
| `data-shuffle-to` | ホバーで入れ替える先のテキスト（離れると元へ戻る） | なし |
| `data-shuffle-chars` | シャッフル中に巡るグリフ集合 | 記号 + カナ + 数字 |
| `data-shuffle-spread` | 伝播の波が最遠の文字へ届くまでのフレーム数（大きいほどゆっくり広がる） | `40` |

### よくある調整例

```html
<!-- 0 と 1 だけで「バイナリ解読」風 -->
<span class="ts" data-text-shuffle data-shuffle-chars="01">ANIMATION</span>

<!-- ゆっくり長く乱れる -->
<span class="ts" data-text-shuffle data-shuffle-spread="60">SLOW</span>
```

```css
/* 乱れ文字の色をシアンに（ダーク背景向け） */
.big-word{ --ts-dud:#00e5ff; }
```

> CSS 変数 `--ts-dud` で乱れ文字の色を要素ごとに変えられる。

---
> Full mechanism, accessibility and known constraints: see **`README.md`** / 詳細・機構・アクセシビリティは README.md 参照。
