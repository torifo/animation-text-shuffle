# C·Ho · ホバー文字シャッフル

> ホバーした位置を起点に、近い文字から順にデコードが伝染して「正解」へ収束する演出。カーソルを置いた場所から波紋のように解けていく。

**Live demo**: `./index.html`

## 概要

| 項目 | 内容 |
|---|---|
| ジャンル | C · タイポグラフィ |
| 用途 | Ho · ホバー / マイクロインタラクション |
| 主な参考 | Hover.dev, Aceternity UI |
| 依存 | なし（Pure HTML + CSS + Vanilla JS） |
| 推奨配置 | ナビリンク、見出し、ロゴ、CTA のホバー装飾 |


## スキルとして導入 / Install as a skill

このリポジトリは Claude Code / Codex CLI 共通の **`SKILL.md`**（オープン標準）を同梱しており、AI エージェントのスキルとして使えます。リポジトリ自体をスキルディレクトリへリンクするだけです。

This repo ships a cross-agent **`SKILL.md`** (open standard) usable by both Claude Code and Codex CLI. Just link the repo into the agent's skills directory.

```bash
# Claude Code
ln -s "$(pwd)" ~/.claude/skills/anim-text-shuffle
# Codex CLI
ln -s "$(pwd)" ~/.codex/skills/anim-text-shuffle
```

エージェントを再起動すると `description` に基づき自動でマッチします（スキル名: `anim-text-shuffle`）。
Restart the agent; it is matched automatically by the skill's `description` (skill name: `anim-text-shuffle`).

## 仕組み

1. 対象要素の初期テキストを「正解」として保持
2. トリガー時、まず各文字を一時的に span で包んで中心座標を測る（`measure()`、`innerHTML` 再設定前なので画面はちらつかない）
3. **ホバーした座標を起点**に各文字までの距離を測り、最大距離で正規化。`start`（乱れ始めるフレーム）を `距離 × data-shuffle-spread` に比例させる → **近い文字ほど先にデコードが始まる＝伝播**
4. `end = start + 収束時間`。`requestAnimationFrame` ループで、現在フレームが
   - `< start` … 元の文字のまま
   - `start〜end` … ランダムグリフ（`<span class="ts-dud">`）を 28% の確率で差し替え＝ちらつき
   - `>= end` … 正解の文字に確定
5. 全文字が確定したらループ終了

起点：**hover** はカーソルが要素に入った座標、**swap の戻り** は離れた座標、**load** は左端（最初の文字）→ 左から右へ。左右どちらから入るかで伝播の向きが変わる。

> グリフに `<` `>` `&` が含まれても安全なよう、出力時に最小エスケープしている。

## 組み込み手順

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

## data 属性

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

## アクセシビリティ

`prefers-reduced-motion: reduce` のとき、JS はシャッフルを行わず即座に確定テキストを表示する（CSS でも `.ts-dud` の装飾を無効化して二重に保険）。

## 制約 / 既知の挙動

- シャッフル中は `innerHTML` を毎フレーム書き換える。リンク内テキスト等の単純な用途を想定（子要素を持つ複雑な構造には非対応）
- 等幅フォント推奨（字幅が変わると横揺れする）。見出しでプロポーショナルフォントを使う場合は揺れを許容する前提で
- `data-shuffle-to` のスワップは、ホバー連打でアニメーションが再スタートする（前回フレームは `cancelAnimationFrame` で中断）

## ライセンス

ANIMATION DESIGN STUDY の一部として公開（コピペ自由）。
