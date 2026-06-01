@echo off
echo ========================================
echo   Feishu MiMo Bot - Auto Start Setup
echo ========================================
echo.

schtasks /Create /TN "FeishuMimoBot" /TR "wscript.exe \"d:\网站建站\feishu-bot\start-bot.vbs\"" /SC ONLOGON /RL HIGHEST /F
schtasks /Create /TN "FeishuMimoNgrok" /TR "wscript.exe \"d:\网站建站\feishu-bot\start-ngrok.vbs\"" /SC ONLOGON /RL HIGHEST /F

echo.
echo Done! Two tasks registered:
echo   - FeishuMimoBot (Python service)
echo   - FeishuMimoNgrok (ngrok tunnel)
echo.
echo They will auto-start on every login.
pause
