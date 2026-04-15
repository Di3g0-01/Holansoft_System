@echo off
setlocal
title Sistema Holansoft - Iniciando...

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ========================================================
echo          SISTEMA HOLANSOFT - INICIO LOCAL
echo ========================================================
echo.

:: ─── 1. Docker / Base de datos ───────────────────────────
if exist "%ROOT%\docker-compose.yml" (
    echo [+] Iniciando base de datos PostgreSQL...
    docker compose -f "%ROOT%\docker-compose.yml" up -d
    if %errorlevel% neq 0 (
        echo [!] ERROR: Docker Compose fallo. Asegurese de que Docker Desktop este abierto.
        pause
        exit /b
    )
) else (
    echo [!] docker-compose.yml no encontrado.
)

:: ─── 2. Instalar dependencias si faltan ──────────────────
if not exist "%ROOT%\backend\node_modules\" (
    echo [+] Instalando dependencias del Backend...
    pushd "%ROOT%\backend" && call npm install && popd
)
if not exist "%ROOT%\frontend\node_modules\" (
    echo [+] Instalando dependencias del Frontend...
    pushd "%ROOT%\frontend" && call npm install && popd
)

:: ─── 3. Compilar backend si no hay dist ───────────────────
if not exist "%ROOT%\backend\dist\" (
    echo [+] Compilando Backend por primera vez...
    pushd "%ROOT%\backend"
    call npm run build
    if %errorlevel% neq 0 (
        echo [!] ERROR: Fallo la compilacion del Backend.
        pause
        exit /b
    )
    popd
)

:: ─── 4. Script Backend: start:dev con reinicio automatico ────────
:: Usamos start:dev para recarga automatica al modificar codigo.
:: El watcher esta configurado en nest-cli.json para ignorar dist/
:: y archivos temporales de OneDrive, evitando bucles de reinicio.
set "BACKEND_SCRIPT=%TEMP%\holansoft_backend.bat"
(
    echo @echo off
    echo title Backend - Holansoft
    echo :LOOP
    echo pushd "%ROOT%\backend"
    echo npm run start:dev
    echo popd
    echo echo.
    echo echo [!] Backend detenido. Reiniciando en 4 segundos...
    echo timeout /t 4 /nobreak ^> nul
    echo goto LOOP
) > "%BACKEND_SCRIPT%"

:: ─── 5. Script Frontend: dev con reinicio automatico ─────
set "FRONTEND_SCRIPT=%TEMP%\holansoft_frontend.bat"
(
    echo @echo off
    echo title Frontend - Holansoft
    echo :LOOP
    echo pushd "%ROOT%\frontend"
    echo npm run dev
    echo popd
    echo echo.
    echo echo [!] Frontend detenido. Reiniciando en 4 segundos...
    echo timeout /t 4 /nobreak ^> nul
    echo goto LOOP
) > "%FRONTEND_SCRIPT%"

:: ─── 6. Lanzar ambos con reinicio automatico ─────────────
echo [+] Iniciando Backend con reinicio automatico...
start "Backend - Holansoft" cmd /k ""%BACKEND_SCRIPT%""

echo [+] Iniciando Frontend con reinicio automatico...
start "Frontend - Holansoft" cmd /k ""%FRONTEND_SCRIPT%""

:: ─── 7. Esperar Backend ───────────────────────────────────
echo.
echo [.] Esperando Backend en puerto 3000...
:WAIT_BACK
timeout /t 2 /nobreak > nul
powershell -NoProfile -Command "if ((Test-NetConnection 127.0.0.1 -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }"
if %errorlevel% neq 0 goto WAIT_BACK
echo [OK] Backend listo.

:: ─── 8. Esperar Frontend ──────────────────────────────────
echo [.] Esperando Frontend en puerto 5173...
:WAIT_FRONT
timeout /t 2 /nobreak > nul
powershell -NoProfile -Command "if ((Test-NetConnection 127.0.0.1 -Port 5173 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }"
if %errorlevel% neq 0 goto WAIT_FRONT
echo [OK] Frontend listo.

:: ─── 9. Abrir navegador ───────────────────────────────────
echo.
start "" "http://127.0.0.1:5173"

echo.
echo ========================================================
echo         HOLANSOFT ACTIVO - No cierres estas ventanas
echo   Backend:   http://127.0.0.1:3000
echo   Frontend:  http://127.0.0.1:5173
echo   Si la pagina se cae, se recupera sola en ~4 segundos
echo ========================================================
echo.
pause
