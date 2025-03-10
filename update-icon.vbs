Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Convertidor PDF a Markdown.lnk")
oShellLink.TargetPath = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown\start-server.bat"
oShellLink.WindowStyle = 1
' Usar un ícono más moderno de documento de shell32.dll
oShellLink.IconLocation = "%SystemRoot%\System32\shell32.dll,77"
oShellLink.Description = "Convertidor PDF a Markdown"
oShellLink.WorkingDirectory = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown"
oShellLink.Save

Set oShellLink = Nothing
Set WshShell = Nothing