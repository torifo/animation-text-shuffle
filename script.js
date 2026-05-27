/* ────────────────────────────────────────────
   C·Ho · Text Shuffle (hover decode, 位置から伝播)
   - [data-text-shuffle] の各要素を初期化
   - ホバーした座標を起点に、近い文字から順に
     ランダムグリフを巡って「正解」へ収束（伝染）
   - data-shuffle-to で別テキストへスワップ
     （離れた座標を起点に元へ戻る）
   - load トリガーは左端起点で左→右に伝播
   - prefers-reduced-motion を尊重（即時確定）
   ──────────────────────────────────────────── */

(() => {
  const DEFAULT_CHARS = '!<>-_\\/[]{}—=+*^?#アイウエオカキクケコ0123456789';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // innerHTML 出力用の最小エスケープ（グリフ集合に < > & が含まれても安全に）
  const esc = (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c;

  class Scrambler {
    constructor(el) {
      this.el = el;
      this.chars = el.dataset.shuffleChars || DEFAULT_CHARS;
      this.spread = parseInt(el.dataset.shuffleSpread, 10) || 40;
      this.original = el.textContent;
      this.frameReq = null;
      this.update = this.update.bind(this);
    }

    /* 現在表示中テキストの各文字の中心座標（viewport 基準）を測る。
       一時的に文字を span で包んで getBoundingClientRect → 元に戻す。
       innerHTML を再設定する前に呼ぶので画面にはちらつかない。 */
    measure() {
      const text = this.el.textContent;
      this.el.innerHTML = [...text]
        .map((ch) => `<span class="ts-ch">${ch === ' ' ? ' ' : esc(ch)}</span>`)
        .join('');
      const centers = [...this.el.querySelectorAll('.ts-ch')].map((s) => {
        const r = s.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      return centers;
    }

    /* origin: {x,y}（viewport 座標）。null なら左端起点（load 用） */
    to(text, origin) {
      if (reduceMotion) { this.el.textContent = text; return; }

      const old = this.el.textContent;
      const len = Math.max(old.length, text.length);
      const pos = this.measure();
      const fallback = pos[pos.length - 1] || { x: 0, y: 0 };
      const o = origin || pos[0] || { x: 0, y: 0 };

      // 起点からの距離を測り、最大距離で正規化
      const dist = [];
      let maxD = 1;
      for (let i = 0; i < len; i++) {
        const p = pos[i] || fallback;
        const d = Math.hypot(p.x - o.x, p.y - o.y);
        dist.push(d);
        if (d > maxD) maxD = d;
      }

      const PROP = this.spread;        // 波が最遠の文字に届くまでのフレーム数
      this.queue = [];
      for (let i = 0; i < len; i++) {
        const from = old[i] || '';
        const to = text[i] || '';
        // 近い文字ほど start が小さい＝先にデコードが始まる（伝播）
        const start = Math.floor((dist[i] / maxD) * PROP + Math.random() * PROP * 0.25);
        const end = start + Math.floor(this.spread * 0.4 + Math.random() * this.spread * 0.5);
        this.queue.push({ from, to, start, end, char: null });
      }

      cancelAnimationFrame(this.frameReq);
      this.frame = 0;
      this.update();
    }

    update() {
      let out = '';
      let done = 0;
      for (const item of this.queue) {
        if (this.frame >= item.end) {
          done++;
          out += esc(item.to);
        } else if (this.frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
          }
          out += `<span class="ts-dud">${esc(item.char)}</span>`;
        } else {
          out += esc(item.from);
        }
      }
      this.el.innerHTML = out;

      if (done < this.queue.length) {
        this.frame++;
        this.frameReq = requestAnimationFrame(this.update);
      }
    }
  }

  document.querySelectorAll('[data-text-shuffle]').forEach((el) => {
    const s = new Scrambler(el);
    const swapTo = el.dataset.shuffleTo || null;
    const trigger = el.dataset.shuffleOn || 'hover';

    // ホバー：入った座標を起点に伝播。swapTo があれば入れ替え、無ければ再デコード
    el.addEventListener('mouseenter', (e) => {
      s.to(swapTo || s.original, { x: e.clientX, y: e.clientY });
    });
    if (swapTo) {
      // 離れた座標を起点に元テキストへ戻す
      el.addEventListener('mouseleave', (e) => {
        s.to(s.original, { x: e.clientX, y: e.clientY });
      });
    }

    // load：左端（最初の文字）起点で左→右に伝播
    if (trigger === 'load') {
      s.to(s.original, null);
    }
  });
})();
