// M3U8→MP4 server-side via Alibaba FC
var FC_ENDPOINT = 'https://proxy-lgceaujdmq.cn-hangzhou.fcapp.run/merge/';
var isConverting = false;

function $(id) { return document.getElementById(id); }
function show(t, m) { var e = $('statusMsg'); if (e) { e.className = 'status-msg ' + t; e.textContent = m; } }
function hide() { var e = $('statusMsg'); if (e) { e.className = 'status-msg'; e.textContent = ''; } }
function fs(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : b < 1073741824 ? (b/1048576).toFixed(1) + ' MB' : (b/1073741824).toFixed(2) + ' GB'; }

function startConversion() {
  if (isConverting) return;
  var inp = $('m3u8Url'), url = inp ? inp.value.trim() : '';
  if (!url) { show('error', '请输入 M3U8 链接'); return; }
  try { new URL(url); } catch(e) { show('error', '请输入有效的 URL'); return; }

  isConverting = true; hide();
  var da = $('downloadArea'); if (da) da.classList.remove('show');
  var pc = $('progressContainer'); if (pc) pc.style.display = 'block';
  var pf = $('progressFill'); if (pf) pf.style.width = '20%';
  var pt = $('progressText'); if (pt) pt.textContent = '服务端转换中...';
  var btn = $('convertBtn'); if (btn) btn.disabled = true;

  // 通过 fetch 获取进度
  var xhr = new XMLHttpRequest();
  xhr.open('GET', FC_ENDPOINT + encodeURIComponent(url), true);
  xhr.responseType = 'blob';

  xhr.onprogress = function(e) {
    if (e.lengthComputable && pt && pf) {
      var pct = Math.round((e.loaded / e.total) * 100);
      pf.style.width = pct + '%';
      pt.textContent = '下载中... ' + pct + '% (' + fs(e.loaded) + ' / ' + fs(e.total) + ')';
    } else if (pf) {
      pf.style.width = '80%';
      if (pt) pt.textContent = '转换中，请稍候...';
    }
  };

  xhr.onload = function() {
    if (xhr.status === 200) {
      var blob = xhr.response;
      var disposition = xhr.getResponseHeader('Content-Disposition') || '';
      var match = disposition.match(/filename="(.+)"/);
      var filename = match ? match[1] : 'video.mp4';
      var type = xhr.getResponseHeader('Content-Type') || 'video/mp4';

      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(a.href); }, 2000);

      if (pf) pf.style.width = '100%';
      if (pt) pt.textContent = '完成！文件: ' + fs(blob.size) + ' (' + filename + ')';
      if (da) da.classList.add('show');
      show('success', '转换完成，文件已自动下载。如未开始请点下方按钮。');

      // 保存引用供手动下载
      window._lastBlob = blob;
      window._lastFilename = filename;
    } else {
      xhr.response.text().then(function(t) { show('error', '转换失败: ' + (t || 'HTTP ' + xhr.status)); });
    }
    isConverting = false;
    if (btn) btn.disabled = false;
  };

  xhr.onerror = function() {
    show('error', '连接转换服务器失败，请稍后重试');
    isConverting = false;
    if (btn) btn.disabled = false;
  };

  xhr.send();
}

function downloadFile() {
  var blob = window._lastBlob;
  var filename = window._lastFilename || 'video.mp4';
  if (!blob) return;
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
