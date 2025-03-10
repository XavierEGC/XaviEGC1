Add-Type -AssemblyName System.Drawing

# Cargar la imagen PNG
$png = [System.Drawing.Image]::FromFile("$PSScriptRoot\pdf.png")

# Crear un nuevo bitmap con el tamaño deseado para el ícono
$size = New-Object System.Drawing.Size(32, 32)
$icon = New-Object System.Drawing.Bitmap($png, $size)

# Guardar como ícono
$icon.Save("$PSScriptRoot\pdf.ico", [System.Drawing.Imaging.ImageFormat]::Icon)

# Liberar recursos
$icon.Dispose()
$png.Dispose()

# Crear el acceso directo con el nuevo ícono
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Convertidor PDF a Markdown.lnk")
$shortcut.TargetPath = "$PSScriptRoot\start-server.bat"
$shortcut.IconLocation = "$PSScriptRoot\pdf.ico"
$shortcut.Description = "Convertidor PDF a Markdown"
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Save()

Write-Host "Ícono actualizado correctamente"