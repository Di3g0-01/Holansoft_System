@echo off 
title Backend SERVIDOR 
cd "C:\Users\doval\OneDrive - Universidad Rafael Landivar\Escritorio\Proyectos Propios\Sistema Holansoft\backend" 
:RETRY 
node --watch dist/main.js 
ping 127.0.0.1 -n 11 > nul 
goto RETRY 
