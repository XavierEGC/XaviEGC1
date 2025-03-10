@echo off
title Convertidor PDF a Markdown
cd /d "%~dp0"
echo Iniciando servidor...
start http://localhost:3000
node index.js