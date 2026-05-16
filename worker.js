// CORS 代理 Worker — 兼容格式
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetUrl = url.pathname.substring(1) + url.search;

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return new Response('请在 URL 路径后附加目标链接。例如: /https://example.com/video.m3u8', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const headers = new Headers(request.headers);
  headers.delete('Origin');
  headers.delete('Referer');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      redirect: 'follow'
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Expose-Headers', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response('代理请求失败: ' + err.message, {
      status: 502,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
