@echo off
echo Descargando herramienta de conversión...
curl -L -o convert.exe "https://imagemagick.org/archive/binaries/ImageMagick-7.1.1-29-portable-Q16-HDRI-x64.zip"
echo Descomprimiendo...
powershell Expand-Archive -Path convert.exe -DestinationPath imagemagick
echo Creando icono...
imagemagick\convert.exe pdf-icon.png -define icon:auto-resize=256,128,64,32,16 icon.ico
echo Actualizando acceso directo...

:: Crear script VBS temporal para actualizar el acceso directo
echo Set WshShell = CreateObject("WScript.Shell") > update-shortcut.vbs
echo strDesktop = WshShell.SpecialFolders("Desktop") >> update-shortcut.vbs
echo Set oShellLink = WshShell.CreateShortcut(strDesktop ^& "\Convertidor PDF a Markdown.lnk") >> update-shortcut.vbs
echo oShellLink.TargetPath = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown\start-server.bat" >> update-shortcut.vbs
echo oShellLink.IconLocation = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown\icon.ico" >> update-shortcut.vbs
echo oShellLink.Description = "Convertidor PDF a Markdown" >> update-shortcut.vbs
echo oShellLink.WorkingDirectory = "C:\Users\telesalud_equipo\Desktop\pdf-to-markdown" >> update-shortcut.vbs
echo oShellLink.Save >> update-shortcut.vbs

cscript //nologo update-shortcut.vbs
del update-shortcut.vbs

echo Listo! El icono ha sido actualizado.