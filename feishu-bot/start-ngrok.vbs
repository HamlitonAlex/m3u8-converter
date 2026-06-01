Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\网站建站\feishu-bot"
WshShell.Run "ngrok.exe http 9000 --log=ngrok.log", 0, False
