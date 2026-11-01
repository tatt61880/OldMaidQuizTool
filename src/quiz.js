(function () {
  'use strict';

  let segmenter;

  function analyze(input, { ignoreWhitespace = false } = {}) {
    segmenter ??= new Intl.Segmenter('ja', { granularity: 'grapheme' });
    const characters = [];
    const counts = new Map();
    let ignoredCount = 0;

    for (const { segment } of segmenter.segment(input)) {
      if (ignoreWhitespace && /^\s+$/u.test(segment)) {
        ignoredCount++;
        continue;
      }
      // 表示する文字は保ち、濁点などの等価な表現だけを照合時にそろえる。
      const key = segment.normalize('NFC');
      const index = characters.length;
      characters.push({ text: segment, key });
      const entry = counts.get(key) ?? { character: segment, count: 0 };
      entry.count++;
      entry.lastIndex = index;
      counts.set(key, entry);
    }

    // 先頭からペアを取り除く元の処理と同じく、奇数回出る文字の最後を残す。
    const remaining = characters.filter(({ key }, index) => {
      const entry = counts.get(key);
      return entry.count % 2 === 1 && entry.lastIndex === index;
    });

    return {
      inputCount: characters.length,
      ignoredCount,
      remainingCount: remaining.length,
      pairCount: (characters.length - remaining.length) / 2,
      resultText: remaining.map(({ text }) => text).join(''),
      entries: Array.from(counts.values(), ({ character, count }) => ({
        character,
        count,
        pairs: Math.floor(count / 2),
        remaining: count % 2,
      })),
    };
  }

  function formatShareText(result) {
    return `#ババ抜きワードクイズ\n${result.resultText}(${result.inputCount})`;
  }

  const api = { analyze, formatShareText };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.OldMaidQuiz = api;
  }
})();
