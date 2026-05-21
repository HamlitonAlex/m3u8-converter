// TS → MP4 client-side remux via FFmpeg.wasm
(function() {
  'use strict';
  var ff = null, loading = false, loadPromise = null;

  // jsDelivr has China CDN nodes, much better than unpkg for .com.cn
  var CORE_CDN = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';

  function init() {
    if (ff) return Promise.resolve(ff);
    if (loadPromise) return loadPromise;
    loading = true;

    loadPromise = new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'js/ffmpeg.js';
      s.onload = function() {
        try {
          var F = window.FFmpegWASM.FFmpeg;
          ff = new F();
          ff.load({ coreURL: CORE_CDN }).then(function() {
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
        reject(new Error('FFmpeg 引擎加载失败，请刷新重试'));
      };
      document.head.appendChild(s);
    });
    return loadPromise;
  }

  // Expose: convert TS Blob → MP4 Blob
  window.ts2mp4 = function(blob, onPhase) {
    onPhase && onPhase('正在加载转换引擎...');
    return init().then(function(ff) {
      onPhase && onPhase('正在分析视频流...');
      return blob.arrayBuffer().then(function(buf) {
        var inFile = 'input.ts';
        var outFile = 'output.mp4';

        ff.writeFile(inFile, new Uint8Array(buf));
        onPhase && onPhase('正在封装为 MP4（无损转换）...');

        return ff.exec(['-i', inFile, '-c', 'copy', '-movflags', '+faststart', outFile]).then(function() {
          return ff.readFile(outFile);
        }).then(function(data) {
          ff.deleteFile(inFile);
          ff.deleteFile(outFile);
          return new Blob([data.buffer], { type: 'video/mp4' });
        });
      });
    });
  };

  window.ts2mp4Ready = function() { return !!ff; };
  window.ts2mp4Loading = function() { return loading; };
})();
