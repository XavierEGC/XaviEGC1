On Error Resume Next

' Obtener rutas absolutas
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
desktopPath = shell.SpecialFolders("Desktop")
currentDir = fso.GetAbsolutePathName(".")
iconPath = currentDir & "\pdf-icon.ico"
targetPath = currentDir & "\start-server.bat"

' Verificar que los archivos existen
If Not fso.FileExists(iconPath) Then
    WScript.Echo "Error: No se encuentra el ícono en: " & iconPath
    WScript.Quit 1
End If

If Not fso.FileExists(targetPath) Then
    WScript.Echo "Error: No se encuentra el archivo start-server.bat en: " & targetPath
    WScript.Quit 1
End If

' Eliminar acceso directo existente
shortcutPath = desktopPath & "\Convertidor PDF a Markdown.lnk"
If fso.FileExists(shortcutPath) Then
    fso.DeleteFile(shortcutPath)
    WScript.Echo "Acceso directo anterior eliminado"
End If

' Crear nuevo acceso directo
Set shortcut = shell.CreateShortcut(shortcutPath)
shortcut.TargetPath = targetPath
shortcut.WorkingDirectory = currentDir
shortcut.IconLocation = iconPath
shortcut.Save

If Err.Number <> 0 Then
    WScript.Echo "Error al crear acceso directo: " & Err.Description
    WScript.Quit 1
Else
    WScript.Echo "Acceso directo creado exitosamente"
    WScript.Echo "Ubicación: " & shortcutPath
    WScript.Echo "Ícono: " & iconPath
End If

Set shortcut = Nothing
Set shell = Nothing
Set fso = Nothing