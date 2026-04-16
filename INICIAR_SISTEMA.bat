@echo off
setlocal
title Sistema Holansoft - Iniciando...

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ========================================================
echo          SISTEMA HOLANSOFT - INICIO SEGURO
echo ========================================================
echo.

:: --- 0. Limpieza Total (Nuke) ---
echo [.] Limpiando procesos previos (Puertos 3000 y 5173)...
powershell -NoProfile -Command "$p3 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($p3) { Stop-Process -Id $p3.OwningProcess -Force -ErrorAction SilentlyContinue }; $p5 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue; if ($p5) { Stop-Process -Id $p5.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo [.] Esperando liberacion de puertos...
ping 127.0.0.1 -n 4 > nul
echo [OK] Entorno limpio.
echo.

:: --- 1. Docker / Base de datos ---
if exist "%ROOT%\docker-compose.yml" (
    echo [+] Asegurando base de datos PostgreSQL...
    docker compose -f "%ROOT%\docker-compose.yml" up -d
)

:: --- 2. Preparar Servicios ---
if not exist "%ROOT%\backend\node_modules\" (
    echo [.] Instalando dependencias del Backend...
    cd "%ROOT%\backend"
    call npm install
    cd "%ROOT%"
)

if not exist "%ROOT%\frontend\node_modules\" (
    echo [.] Instalando dependencias del Frontend...
    cd "%ROOT%\frontend"
    call npm install
    cd "%ROOT%"
)

:: --- 3. Crear Sub-Scripts Localmente (Para evitar errores de Temp) ---
if not exist "%ROOT%\.scripts" mkdir "%ROOT%\.scripts"

echo @echo off > "%ROOT%\.scripts\compilador.bat"
echo title Backend COMPILADOR >> "%ROOT%\.scripts\compilador.bat"
echo cd "%ROOT%\backend" >> "%ROOT%\.scripts\compilador.bat"
echo :RETRY >> "%ROOT%\.scripts\compilador.bat"
echo call npx tsc --watch --preserveWatchOutput >> "%ROOT%\.scripts\compilador.bat"
echo ping 127.0.0.1 -n 11 ^> nul >> "%ROOT%\.scripts\compilador.bat"
echo goto RETRY >> "%ROOT%\.scripts\compilador.bat"

echo @echo off > "%ROOT%\.scripts\servidor.bat"
echo title Backend SERVIDOR >> "%ROOT%\.scripts\servidor.bat"
echo cd "%ROOT%\backend" >> "%ROOT%\.scripts\servidor.bat"
echo :RETRY >> "%ROOT%\.scripts\servidor.bat"
echo node --watch dist/main.js >> "%ROOT%\.scripts\servidor.bat"
echo ping 127.0.0.1 -n 11 ^> nul >> "%ROOT%\.scripts\servidor.bat"
echo goto RETRY >> "%ROOT%\.scripts\servidor.bat"

echo @echo off > "%ROOT%\.scripts\frontend.bat"
echo title Frontend Vite >> "%ROOT%\.scripts\frontend.bat"
echo cd "%ROOT%\frontend" >> "%ROOT%\.scripts\frontend.bat"
echo :RETRY >> "%ROOT%\.scripts\frontend.bat"
echo call npm run dev >> "%ROOT%\.scripts\frontend.bat"
echo echo Servidor detenido, esperando a OneDrive... >> "%ROOT%\.scripts\frontend.bat"
echo ping 127.0.0.1 -n 11 ^> nul >> "%ROOT%\.scripts\frontend.bat"
echo goto RETRY >> "%ROOT%\.scripts\frontend.bat"

:: --- 4. Lanzar los procesos ---
echo [+] Iniciando Compilador...
start "Compilador" /MIN cmd /k ""%ROOT%\.scripts\compilador.bat""

echo [+] Iniciando Servidor...
start "Servidor" /MIN cmd /k ""%ROOT%\.scripts\servidor.bat""

echo [+] Iniciando Frontend...
start "Frontend" /MIN cmd /k ""%ROOT%\.scripts\frontend.bat""

:: --- 5. Esperas y Validaciones Finales ---
echo.
echo [.] Iniciando sistema (esto puede tardar unos segundos)...
ping 127.0.0.1 -n 6 > nul

echo.
echo [+] Abriendo sistema...
start "" "http://127.0.0.1:5173"

echo ========================================================
echo         SISTEMA HOLANSOFT ACTIVO (127.0.0.1:5173)
echo ========================================================
pause
