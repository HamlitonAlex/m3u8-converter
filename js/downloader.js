// M3U8 在线播放 + 下载
var CORS_PROXY = 'https://proxy-lgceaujdmq.cn-hangzhou.fcapp.run/';
var REWRITE = CORS_PROXY + 'rewrite/';
var MERGE = CORS_PROXY + 'merge/';
var isConverting = false, lastBlob = null;

function $(id) { return document.getElementById(id); }
function show(t, m) { var e = $('statusMsg'); if (e) { e.className = 'status-msg ' + t; e.textContent = m; } }
function hide() { var e = $('statusMsg'); if (e) { e.className = 'status-msg'; e.textContent = ''; } }
function fs(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : b < 1073741824 ? (b/1048576).toFixed(1) + ' MB' : (b/1073741824).toFixed(2) + ' GB'; }
function T(k) { return (window.I18N && I18N.t(k)) || k; }

// 监听语言切换，更新按钮和提示
window.addEventListener('langChange', function() {
  var pb = $('playBtn'), cb = $('convertBtn'), inp = $('m3u8Url');
  if (pb) pb.textContent = T('play_btn');
  if (cb) cb.textContent = T('download_btn');
  if (inp) inp.placeholder = T('convert_placeholder');
});

// ============ 下载 ============
function startConversion() {
  if (isConverting) return;
  var inp = $('m3u8Url'), url = inp ? inp.value.trim() : '';
  if (!url) { show('error', T('err_no_url')); return; }

  isConverting = true; hide();
  var pc = $('progressContainer'); if (pc) pc.style.display = 'block';
  var pf = $('progressFill'); if (pf) pf.style.width = '0%';
  var pt = $('progressText'); if (pt) pt.textContent = T('dl_prep');
  var btn = $('convertBtn'); if (btn) btn.disabled = true;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', MERGE + encodeURIComponent(url), true);
  xhr.responseType = 'blob'; xhr.timeout = 600000;

  xhr.onprogress = function(e) {
    if (e.lengthComputable && pt && pf) { pf.style.width = Math.round(e.loaded/e.total*90) + '%'; pt.textContent = T('dl_ing') + Math.round(e.loaded/e.total*100) + '% (' + fs(e.loaded) + ')'; }
  };

  xhr.onload = function() {
    if (xhr.status === 200) {
      var blob = xhr.response;
      var name = (xhr.getResponseHeader('Content-Disposition') || '').match(/filename="(.+)"/);
      var fn = name ? name[1] : 'video.ts';
      lastBlob = blob;
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fn;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      if (pf) pf.style.width = '100%'; if (pt) pt.textContent = T('dl_done') + fs(blob.size);
      show('success', fn + T('dl_ok'));
    } else { show('error', T('dl_err_server') + xhr.status); }
    isConverting = false; if (btn) btn.disabled = false;
  };
  xhr.onerror = function() { show('error', T('dl_err_conn')); isConverting = false; if (btn) btn.disabled = false; };
  xhr.send();
}

function downloadFile() { if (!lastBlob) return; var n = 'video.ts'; var a = document.createElement('a'); a.href = URL.createObjectURL(lastBlob); a.download = n; document.body.appendChild(a); a.click(); document.body.removeChild(a); }

// ============ 播放 ============
function playM3u8() {
  var inp = $('m3u8Url'), url = inp ? inp.value.trim() : '';
  if (!url) { show('error', T('err_no_url')); return; }
  closePlayer();
  var vp = $('videoPlayer'), ve = $('videoEl');
  if (vp) vp.style.display = 'block';
  show('info', T('play_load'));

  if (window.Hls && Hls.isSupported()) {
    var hls = new Hls({});
    hls.loadSource(REWRITE + encodeURIComponent(url));
    hls.attachMedia(ve); ve._hls = hls;
    hls.on(Hls.Events.MANIFEST_PARSED, function() { hide(); ve.play().catch(function(){}); });
    hls.on(Hls.Events.ERROR, function(evt, data) {
      if (data.fatal) { var m = (data.details || data.type || ''); if (data.frag && data.frag.url) m += ' | ' + data.frag.url.substring(0, 100); show('error', T('play_fail') + m); hls.destroy(); }
    });
  } else if (ve.canPlayType('application/vnd.apple.mpegurl')) { ve.src = REWRITE + encodeURIComponent(url); ve.play().catch(function(){}); hide(); }
  else { show('error', T('play_err')); vp.style.display = 'none'; }
}

function closePlayer() { var ve = $('videoEl'); if (ve) { ve.pause(); ve.removeAttribute('src'); if (ve._hls) { ve._hls.destroy(); ve._hls = null; } } var vp = $('videoPlayer'); if (vp) vp.style.display = 'none'; }
