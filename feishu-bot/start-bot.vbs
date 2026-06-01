Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\网站建站\feishu-bot"
WshShell.Run "python main.py", 0, False
