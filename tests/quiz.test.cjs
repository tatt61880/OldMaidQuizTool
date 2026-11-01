const assert = require('node:assert/strict');
const { test } = require('node:test');
const { analyze, formatShareText } = require('../src/quiz.js');

// 変更前の「前から一致する2文字を取り除く」処理を比較用に保つ。
function originalResult(input) {
  let result = input;
  let i = 0;
  while (i < result.length - 1) {
    const j = result.indexOf(result[i], i + 1);
    if (j === -1) {
      i++;
    } else {
      result =
        result.slice(0, i) + result.slice(i + 1, j) + result.slice(j + 1);
    }
  }
  return result;
}

test('空文字とすべてがペアになる入力', () => {
  assert.deepEqual(analyze(''), {
    inputCount: 0,
    ignoredCount: 0,
    remainingCount: 0,
    pairCount: 0,
    resultText: '',
    entries: [],
  });
  const result = analyze('あいあい');
  assert.equal(result.resultText, '');
  assert.equal(result.pairCount, 2);
  assert.equal(formatShareText(result), '#ババ抜きワードクイズ\n(4)');
});

test('奇数回出る文字は最後の位置に残る', () => {
  const result = analyze('ああいあ');
  assert.equal(result.resultText, 'いあ');
  assert.equal(result.inputCount, 4);
  assert.equal(result.remainingCount, 2);
  assert.equal(result.pairCount, 1);
  assert.deepEqual(result.entries, [
    { character: 'あ', count: 3, pairs: 1, remaining: 1 },
    { character: 'い', count: 1, pairs: 0, remaining: 1 },
  ]);
});

test('3種類・最大8文字の全9841通りで元の処理と一致する', () => {
  let inputs = [''];
  for (let length = 0; length <= 8; length++) {
    for (const input of inputs) {
      const result = analyze(input);
      assert.equal(result.resultText, originalResult(input), input);
      assert.equal(
        result.inputCount,
        result.pairCount * 2 + result.remainingCount
      );
    }
    inputs = inputs.flatMap((input) =>
      ['あ', 'い', 'う'].map((c) => input + c)
    );
  }
});

test('サロゲートペアを共有する異なる絵文字を壊さない', () => {
  const result = analyze('😀😁😀');
  assert.equal(result.resultText, '😁');
  assert.equal(result.inputCount, 3);
  assert.equal(result.remainingCount, 1);
});

test('家族・肌の色・国旗・異体字セレクターを含む文字を1文字として数える', () => {
  for (const character of ['👨‍👩‍👧‍👦', '👍🏽', '🇯🇵', '✈️', '葛\u{E0100}']) {
    const result = analyze(`${character}あ${character}い${character}`);
    assert.equal(result.inputCount, 5);
    assert.equal(result.resultText, `あい${character}`);
    assert.equal(result.pairCount, 1);
  }
});

test('結合濁点を含む等価な文字を照合し、残る文字の表現を保つ', () => {
  const result = analyze('がか\u3099あか\u3099');
  assert.equal(result.inputCount, 4);
  assert.equal(result.resultText, 'あか\u3099');
  assert.equal(result.entries[0].count, 3);
});

test('全角・半角、大小、かなの種類は区別する', () => {
  const input = 'あアｱＡAaぁ';
  const result = analyze(input);
  assert.equal(result.resultText, input);
  assert.equal(result.inputCount, 7);
});

test('空白・改行は標準で数え、指定時だけ計算から除く', () => {
  const input = 'あ あ\nい\t　';
  const included = analyze(input);
  assert.equal(included.inputCount, 7);
  assert.equal(included.resultText, ' \nい\t　');
  const excluded = analyze(input, { ignoreWhitespace: true });
  assert.equal(excluded.inputCount, 3);
  assert.equal(excluded.ignoredCount, 4);
  assert.equal(excluded.resultText, 'い');
  assert.equal(formatShareText(excluded), '#ババ抜きワードクイズ\nい(3)');
});

test('空白だけの入力とCRLFを処理する', () => {
  assert.equal(analyze(' \t\n　', { ignoreWhitespace: true }).inputCount, 0);
  assert.equal(analyze('\r\n').inputCount, 1);
  assert.equal(analyze('\r\n', { ignoreWhitespace: true }).ignoredCount, 1);
});

test('コピー形式を維持し、記号はテキストのまま扱う', () => {
  assert.equal(
    formatShareText(analyze('ばばぬき')),
    '#ババ抜きワードクイズ\nぬき(4)'
  );
  assert.equal(
    formatShareText(analyze('<>&')),
    '#ババ抜きワードクイズ\n<>&(3)'
  );
});

test('長い入力でも最後の余りを保つ', () => {
  const result = analyze('あい'.repeat(50000) + 'うあ');
  assert.equal(result.resultText, 'うあ');
  assert.equal(result.inputCount, 100002);
  assert.equal(result.pairCount, 50000);
});
