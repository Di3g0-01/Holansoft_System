@echo off 
title Frontend Vite 
cd "C:\Users\doval\OneDrive - Universidad Rafael Landivar\Escritorio\Proyectos Propios\Sistema Holansoft\frontend" 
:RETRY 
call npm run dev 
echo Servidor detenido, esperando a OneDrive... 
ping 127.0.0.1 -n 11 > nul 
goto RETRY 
