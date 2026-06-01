# 查看当前 ngrok 公网 URL
# 运行后复制输出的 URL，到飞书开放平台更新事件回调地址

try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 3
    $url = $resp.tunnels[0].public_url
    Write-Host ""
    Write-Host "当前 ngrok URL:" -ForegroundColor Green
    Write-Host "  $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "飞书回调地址:" -ForegroundColor Yellow
    Write-Host "  ${url}/webhook/event" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "去飞书开放平台 -> 事件与回调 -> 更新请求地址" -ForegroundColor Yellow
} catch {
    Write-Host "ngrok 未运行或无法连接。请先启动 ngrok。" -ForegroundColor Red
}
