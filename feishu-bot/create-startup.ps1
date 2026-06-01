$startup = [Environment]::GetFolderPath('Startup')
$path = Join-Path $startup "feishu-mimo.vbs"
$content = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\网站建站\feishu-bot"
WshShell.Run "python main.py", 0, False
WshShell.Run "ngrok.exe http 9000 --log=ngrok.log", 0, False
"@
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::ASCII)
Write-Host "Created: $path"
Get-ChildItem $startup | Where-Object { $_.Name -like "feishu*" }
