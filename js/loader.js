// 动态加载 FFmpeg，然后加载转换器
(function() {
  var FFMPEG_URL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';

  // 检查是否已加载
  if (window.FFmpegWASM || window.FFmpeg) {
    loadConverter();
    return;
  }

  var script = document.createElement('script');
  script.src = FFMPEG_URL;
  script.onload = function() {
    if (window.FFmpegWASM || window.FFmpeg) {
      loadConverter();
    } else {
      fail('FFmpeg 库加载异常，请刷新重试');
    }
  };
  script.onerror = function() {
    fail('FFmpeg 库加载失败，请检查网络连接后刷新页面');
  };
  document.head.appendChild(script);

  function loadConverter() {
    var s = document.createElement('script');
    s.src = 'js/converter.js?v=7';
    s.onerror = function() { fail('转换器加载失败，请刷新重试'); };
    document.head.appendChild(s);
  }

  function fail(msg) {
    var el = document.getElementById('statusMsg');
    if (el) {
      el.className = 'status-msg error';
      el.textContent = msg;
      el.style.display = 'block';
    }
    console.error(msg);
  }
})();
