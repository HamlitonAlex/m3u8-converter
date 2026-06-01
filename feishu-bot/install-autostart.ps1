$taskName1 = "FeishuMimoBot"
$taskName2 = "FeishuMimoNgrok"
$workDir = "d:\网站建站\feishu-bot"

Unregister-ScheduledTask -TaskName $taskName1 -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $taskName2 -Confirm:$false -ErrorAction SilentlyContinue

$action1 = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$workDir\start-bot.vbs`"" -WorkingDirectory $workDir
$trigger1 = New-ScheduledTaskTrigger -AtLogon
$settings1 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3 -ExecutionTimeLimit (New-TimeSpan -Days 365)

Register-ScheduledTask -TaskName $taskName1 -Action $action1 -Trigger $trigger1 -Settings $settings1 -Description "Feishu MiMo Bot Service" -RunLevel Highest

$action2 = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$workDir\start-ngrok.vbs`"" -WorkingDirectory $workDir
$trigger2 = New-ScheduledTaskTrigger -AtLogon
$settings2 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 3 -ExecutionTimeLimit (New-TimeSpan -Days 365)

Register-ScheduledTask -TaskName $taskName2 -Action $action2 -Trigger $trigger2 -Settings $settings2 -Description "Feishu MiMo ngrok tunnel" -RunLevel Highest

Write-Host "Done! Tasks registered:" -ForegroundColor Green
Write-Host "  - FeishuMimoBot"
Write-Host "  - FeishuMimoNgrok"
