Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strPath = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName(".")

' Borrar el acceso directo existente si existe
If CreateObject("Scripting.FileSystemObject").FileExists(strDesktop & "\Convertidor PDF a Markdown.lnk") Then
    CreateObject("Scripting.FileSystemObject").DeleteFile strDesktop & "\Convertidor PDF a Markdown.lnk"
End If

' Crear nuevo acceso directo
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Convertidor PDF a Markdown.lnk")
oShellLink.TargetPath = strPath & "\start-server.bat"
oShellLink.IconLocation = strPath & "\pdf-icon.ico"
oShellLink.WorkingDirectory = strPath
oShellLink.WindowStyle = 1
oShellLink.Save

WScript.Echo "Acceso directo creado en: " & strDesktop
WScript.Echo "Con ícono desde: " & strPath & "\pdf-icon.ico"