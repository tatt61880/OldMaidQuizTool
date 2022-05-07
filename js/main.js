window.onload = function() {
  'use strict';
  const version = 'Version: 2022.05.08';

  const elemText = document.getElementById('inputText');
  elemText.addEventListener('input', update, false);
  update();
  document.getElementById('versionInfo').innerText = version;


  function update() {
    const inputText = document.getElementById('inputText').value;

    let resultText = inputText;
    let i = 0;
    for (;;) {
      if (i >= resultText.length - 1) break;
      const ci = resultText.charAt(i);
      let flag = false;
      for (let j = i + 1; j < resultText.length; j++) {
        const cj = resultText.charAt(j);
        if (ci == cj) {
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
    document.getElementById('sub').innerHTML = `#ババ抜きワードクイズ<br>${str}(${inputText.length})`;
  }
};
