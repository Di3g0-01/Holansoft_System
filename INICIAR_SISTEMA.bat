@echo off
setlocal
title Iniciando Sistema Holansoft...

:: Configuración de colores (si el terminal lo soporta)
echo ========================================================
echo          SISTEMA HOLANSOFT - INICIO LOCAL
echo ========================================================
echo.

:: 1. Verificar Docker y Database (REQUERIDO para PostgreSQL)
if exist "docker-compose.yml" (
    echo [+] Iniciando base de datos en Docker...
    docker compose up -d
    if %errorlevel% neq 0 (
        echo.
        echo [!] ERROR CRITICO: No se pudo iniciar Docker Compose.
        echo     Para usar PostgreSQL, Docker Desktop DEBE estar funcionando.
        echo.
        pause
        exit /b
    )
) else (
    echo [!] ADVERTENCIA: No se encontro docker-compose.yml. 
    echo     La conexion a PostgreSQL podria fallar si no tienes el servidor corriendo manualmente.
    pause
)

:: 2. Verificar dependencias de Backend
if not exist "backend\node_modules\" (
    echo [!] node_modules no encontrados en backend. Instalando dependencias...
    cd backend && call npm install && cd ..
)

:: 3. Verificar dependencias de Frontend
if not exist "frontend\node_modules\" (
    echo [!] node_modules no encontrados en frontend. Instalando dependencias...
    cd frontend && call npm install && cd ..
)

:: 4. Iniciar Backend en una nueva ventana
echo [+] Iniciando Backend (NestJS)...
start "Backend Holansoft" cmd /k "cd backend && npm run start:dev"

:: 5. Iniciar Frontend en una nueva ventana
echo [+] Iniciando Frontend (Vite)...
start "Frontend Holansoft" cmd /k "cd frontend && npm run dev"

:: 6. Espera Dinámica por el Backend
echo.
echo [+] Esperando a que el Backend este listo en el puerto 3000...
echo     (Esto puede tardar unos segundos la primera vez)
echo.

:WAIT_BACKEND
powershell -Command "$check = (Test-NetConnection localhost -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded; if (!$check) { exit 1 } else { exit 0 }"
if %errorlevel% neq 0 (
    echo [.] El servidor aun no responde, reintentando...
    timeout /t 3 /nobreak > nul
    goto WAIT_BACKEND
)

echo.
echo [+] ¡Servidor Backend detectado!
echo [+] Abriendo el sistema en el navegador: http://localhost:5173
echo.
start "" "http://localhost:5173"

echo ========================================================
echo            SISTEMA INICIADO EXITOSAMENTE
echo ========================================================
echo.
echo [INFO] Puedes cerrar esta ventana. 
echo [INFO] NO cierres las ventanas de terminal que se abrieron.
echo.
pause

