Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Convertidor PDF a Markdown.lnk")
oShellLink.TargetPath = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown\start-server.bat"
oShellLink.WindowStyle = 1
oShellLink.IconLocation = "%SystemRoot%\System32\SHELL32.dll,41"
oShellLink.Description = "Convertidor PDF a Markdown"
oShellLink.WorkingDirectory = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown"
oShellLink.Save