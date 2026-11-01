(function () {
  'use strict';

  const input = document.getElementById('input-text');
  const ignoreWhitespace = document.getElementById('ignore-whitespace');
  const copyButton = document.getElementById('clip-result');
  const clearButton = document.getElementById('clear-input');
  const exampleButton = document.getElementById('use-example');
  const shareText = document.getElementById('share-text');
  const status = document.getElementById('copy-status');
  const breakdown = document.getElementById('breakdown');
  const breakdownBody = document.getElementById('breakdown-body');
  const summary = document.getElementById('result-summary');
  let currentResult;
  let revision = 0;
  let copying = false;

  if (typeof Intl.Segmenter !== 'function') {
    document.getElementById('browser-error').hidden = false;
    input.disabled = true;
    ignoreWhitespace.disabled = true;
    exampleButton.disabled = true;
    return;
  }

  input.addEventListener('input', update);
  ignoreWhitespace.addEventListener('change', update);
  clearButton.addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  exampleButton.addEventListener('click', () => {
    input.value = 'ばばぬき';
    update();
    input.focus();
  });
  copyButton.addEventListener('click', copyResult);
  breakdown.addEventListener('toggle', () => {
    if (breakdown.open) renderBreakdown();
  });
  update();

  function update() {
    revision++;
    currentResult = window.OldMaidQuiz.analyze(input.value, {
      ignoreWhitespace: ignoreWhitespace.checked,
    });
    const { inputCount, pairCount, remainingCount, resultText, ignoredCount } =
      currentResult;
    const hasInput = inputCount > 0;

    document.getElementById('input-count').textContent = inputCount;
    document.getElementById('pair-count').textContent = pairCount;
    document.getElementById('remaining-count').textContent = remainingCount;
    document.getElementById('ignored-count').textContent =
      ignoredCount > 0
        ? `空白・改行 ${ignoredCount}文字を除いて計算しています。`
        : '';
    const output = document.getElementById('remaining-text');
    output.textContent = hasInput
      ? remainingCount
        ? resultText
        : 'すべてペアになりました'
      : '文字を入力してください';
    output.classList.toggle('is-message', !remainingCount);
    document.getElementById('whitespace-note').hidden =
      !remainingCount || !/^\s+$/u.test(resultText);
    summary.textContent = hasInput
      ? `${inputCount}文字から${pairCount}ペアを取り除き、${remainingCount}文字が残りました。`
      : '';
    shareText.value = hasInput
      ? window.OldMaidQuiz.formatShareText(currentResult)
      : '';
    copyButton.disabled = !hasInput || copying;
    clearButton.disabled = input.value.length === 0;
    status.textContent = '';
    status.classList.remove('is-error');
    if (breakdown.open) renderBreakdown();
  }

  function describeCharacter(character) {
    const labels = new Map([
      [' ', '半角スペース'],
      ['\u3000', '全角スペース'],
      ['\n', '改行'],
      ['\r', '改行'],
      ['\r\n', '改行'],
      ['\t', 'タブ'],
    ]);
    if (labels.has(character)) return labels.get(character);
    if (/^\s+$/u.test(character)) return '空白';
    return character;
  }

  function renderBreakdown() {
    const fragment = document.createDocumentFragment();
    for (const entry of currentResult.entries) {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = describeCharacter(entry.character);
      row.append(heading);
      for (const value of [entry.count, entry.pairs, entry.remaining]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      if (entry.remaining) row.classList.add('has-remaining');
      fragment.append(row);
    }
    breakdownBody.replaceChildren(fragment);
    document.getElementById('breakdown-table').hidden =
      currentResult.inputCount === 0;
    document.getElementById('breakdown-empty').hidden =
      currentResult.inputCount > 0;
  }

  async function copyResult() {
    if (!shareText.value || copying) return;
    const text = shareText.value;
    const copiedRevision = revision;
    const previousFocus = document.activeElement;
    copying = true;
    copyButton.disabled = true;
    status.textContent = '';
    status.classList.remove('is-error');
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // 非HTTPS環境やClipboard APIが使えない環境では、選択したテキストをコピーする。
      if (copiedRevision === revision) {
        shareText.focus();
        shareText.select();
        shareText.setSelectionRange(0, shareText.value.length);
        try {
          copied = document.execCommand('copy');
        } catch {
          // この方法も使えなければ、選択状態のまま手動コピーを案内する。
        }
        if (copied) previousFocus.focus({ preventScroll: true });
      }
    } finally {
      copying = false;
      copyButton.disabled = currentResult.inputCount === 0;
    }
    if (copiedRevision !== revision) return;
    status.textContent = copied
      ? 'コピーしました。'
      : '自動コピーができませんでした。選択された結果を手動でコピーしてください。';
    status.classList.toggle('is-error', !copied);
  }
})();
