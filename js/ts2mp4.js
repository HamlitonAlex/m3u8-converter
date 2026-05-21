// TS → MP4 client-side remux via FFmpeg.wasm
// With multi-CDN fallback for China accessibility
(function() {
  'use strict';
  var ff = null, loading = false, loadPromise = null;

  // Multiple CDN fallbacks ordered by China accessibility
  var CORE_URLS = [
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    'https://registry.npmmirror.com/@ffmpeg/core/0.12.6/files/dist/umd/ffmpeg-core.js'
  ];

  function tryLoad(ffmpegInstance, urls, idx) {
    if (idx >= urls.length) {
      return Promise.reject(new Error('所有 CDN 节点均加载失败，请检查网络后刷新页面'));
    }
    return ffmpegInstance.load({ coreURL: urls[idx] }).catch(function() {
      return tryLoad(ffmpegInstance, urls, idx + 1);
    });
  }

  function init() {
    if (ff) return Promise.resolve(ff);
    if (loadPromise) return loadPromise;
    loading = true;

    loadPromise = new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'js/ffmpeg.js';
      s.onload = function() {
        try {
          if (!window.FFmpegWASM || !window.FFmpegWASM.FFmpeg) {
            throw new Error('FFmpegWASM 未正确加载，请刷新重试');
          }
          var F = window.FFmpegWASM.FFmpeg;
          var instance = new F();
          tryLoad(instance, CORE_URLS, 0).then(function() {
            ff = instance;
            loading = false;
            resolve(ff);
          }).catch(function(e) {
            loading = false;
            loadPromise = null;
            reject(e);
          });
        } catch(e) {
          loading = false;
          loadPromise = null;
          reject(e);
        }
      };
      s.onerror = function() {
        loading = false;
        loadPromise = null;
        reject(new Error('FFmpeg 引擎脚本加载失败（js/ffmpeg.js），请检查文件是否存在'));
      };
      document.head.appendChild(s);
    });
    return loadPromise;
  }

  window.ts2mp4 = function(blob, onPhase) {
    onPhase && onPhase('正在加载转换引擎...');
    return init().then(function(instance) {
      onPhase && onPhase('正在分析视频流...');
      return blob.arrayBuffer().then(function(buf) {
        var inFile = 'input.ts';
        var outFile = 'output.mp4';

        instance.writeFile(inFile, new Uint8Array(buf));
        onPhase && onPhase('正在封装为 MP4（无损转换）...');

        return instance.exec(['-i', inFile, '-c', 'copy', '-movflags', '+faststart', outFile]).then(function() {
          return instance.readFile(outFile);
        }).then(function(data) {
          instance.deleteFile(inFile);
          instance.deleteFile(outFile);
          return new Blob([data.buffer], { type: 'video/mp4' });
        });
      });
    });
  };

  window.ts2mp4Ready = function() { return !!ff; };
  window.ts2mp4Loading = function() { return loading; };
})();
