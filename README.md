# M3U8 Online Player & Downloader — Free Tool

**Live site:** [m3u8tomp4.com.cn](https://m3u8tomp4.com.cn) | [www.m3u8tomp4.com.cn](https://www.m3u8tomp4.com.cn)

Free online M3U8/HLS streaming video player and downloader. Paste an M3U8 link to play or download videos instantly. No install, no registration, 100% free.

## Features

- **Online Player** — Stream M3U8/HLS videos directly in your browser via hls.js
- **Video Downloader** — Server-side TS segment merging, one-click download
- **Chinese / English** — Full i18n support with localStorage persistence
- **All Platforms** — Works on Windows, Mac, Linux, iOS, Android
- **Privacy First** — Server proxies requests but stores nothing

## Blog & Guides

Free tutorials about M3U8, HLS streaming, and video tools:

- [M3U8 to MP4 Converter Guide](https://m3u8tomp4.com.cn/blog/m3u8-to-mp4-online-converter.html)
- [How to Download Streaming Videos](https://m3u8tomp4.com.cn/blog/download-streaming-video-any-website.html)
- [M3U8 Troubleshooting](https://m3u8tomp4.com.cn/blog/m3u8-download-troubleshooting.html)
- [All guides →](https://m3u8tomp4.com.cn/blog/)

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS, hls.js
- **Proxy:** Alibaba Cloud Function Compute (Node.js) — handles CORS & referrer restrictions
- **Hosting:** Cloudflare Pages (free tier)
- **Analytics:** 51.la

## Local Dev

```bash
git clone https://github.com/HamlitonAlex/m3u8-converter.git
cd m3u8-converter
# Open with any static server, e.g. VS Code Live Server
```

## License

MIT

---

If this tool helped you, please consider starring the repo.
