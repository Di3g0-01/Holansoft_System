@echo off 
title Backend COMPILADOR 
cd "C:\Users\doval\OneDrive - Universidad Rafael Landivar\Escritorio\Proyectos Propios\Sistema Holansoft\backend" 
:RETRY 
call npx tsc --watch --preserveWatchOutput 
ping 127.0.0.1 -n 11 > nul 
goto RETRY 
