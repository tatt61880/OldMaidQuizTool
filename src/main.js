(function() {
  'use strict';
  const version = 'Version: 2022.12.04';

  window.onload = function() {
    document.getElementById('version-info').innerText = version;
    document.getElementById('input-text').addEventListener('input', update, false);
    document.getElementById('clip-result').addEventListener('click', clipResult, false);

    update();
  };

  function update() {
    const inputText = document.getElementById('input-text').value;

    let resultText = inputText;
    let i = 0;
    for (;;) {
      if (i >= resultText.length - 1) break;
      const ci = resultText.charAt(i);
      let flag = false;
      for (let j = i + 1; j < resultText.length; j++) {
        const cj = resultText.charAt(j);
        if (ci === cj) {
          flag = true;
          resultText = resultText.substring(0, i) + resultText.substring(i + 1, j) + resultText.substring(j + 1);
          break;
        }
      }
      if (!flag) {
        i++;
      }
    }

    document.getElementById('before').innerText = `元の文字列: 「${inputText}」(${inputText.length}文字)`;
    document.getElementById('after').innerText = `残った文字列: 「${resultText}」(${resultText.length}文字)`;

    const str = resultText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    document.getElementById('sub').innerHTML = `${str}(${inputText.length})`;
  }

  function clipResult() {
    const text = document.getElementById('sub').textContent;
    setClipboard('#ババ抜きワードクイズ\n' + text);
  }

  function setClipboard(clipboardText) {
    if (window.navigator.clipboard === undefined) {
      window.clipboardData.setData('Text', clipboardText);
    } else {
      window.navigator.clipboard.writeText(clipboardText);
    }
  }
})();
