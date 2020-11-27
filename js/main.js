$(window).load(function(){
  $('#input-text').change(update);

  function update(){
    const inputText = $('#input-text').val();

    let resultText = inputText;
    let i = 0;
    while(true){
      if(i >= resultText.length - 1) break;
      const ci = resultText.charAt(i);
      let flag = false;
      for(let j = i + 1; j < resultText.length; j++){
        const cj = resultText.charAt(j);
        if(ci == cj){
          // console.log('ci=' + ci + ', cj=' + cj + ', i=' + i + ', j=' + j);
          flag = true;
          resultText = resultText.substring(0, i) + resultText.substring(i + 1, j) + resultText.substring(j + 1);
          // console.log(resultText);
          break;
        }
      }
      if(!flag){
        i++;
      }
    }

    $('#before').text('元の文字列: 「' + inputText + '」');
    $('#after').text('残った文字列: 「' + resultText + '」');

    let sub = '元の文字列の長さ: ' + inputText.length + '<br>残った文字列の長さ: ' + resultText.length;
    $('#len').html(sub);
  }
});
