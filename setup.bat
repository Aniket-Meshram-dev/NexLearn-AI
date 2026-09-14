@echo off
setlocal

echo.
echo ==========================================
echo       NexLearn Setup Script
echo   (FRONTEND ^& BACKEND Architecture)
echo ==========================================
echo.

:: Check for BACKEND/.env file
if not exist BACKEND\.env (
    echo [WARNING] BACKEND\.env file not found!
    echo Prisma and authentication require configuration defined in BACKEND\.env.
    echo Copying BACKEND\.env.example to BACKEND\.env...
    copy BACKEND\.env.example BACKEND\.env > nul
    echo Please configure your database URL and API keys in BACKEND\.env before starting the server.
    echo.
)

:: Step 1: Install Backend Dependencies
echo.
echo [1/4] Installing Backend Dependencies (cd BACKEND ^&^& npm install)...
cd BACKEND
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend npm install failed.
    cd ..
    exit /b %ERRORLEVEL%
)

:: Step 2: Push Prisma schema & Generate Client in BACKEND
echo.
echo [2/4] Initializing Database (npx prisma db push ^&^& npx prisma generate)...
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Prisma db push failed. Please verify your DATABASE_URL in BACKEND\.env.
)
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma generate failed.
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

:: Step 3: Install Frontend Dependencies
echo.
echo [3/4] Installing Frontend Dependencies (cd FRONTEND ^&^& npm install)...
cd FRONTEND
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend npm install failed.
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

:: Step 4: Install Root Dependencies (concurrently)
echo.
echo [4/4] Installing Root Development Tools (npm install)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Root npm install failed, you can still run FRONTEND and BACKEND independently.
)

echo.
echo ==========================================
echo       Setup Completed Successfully!
echo ==========================================
echo You can run the application using either method:
echo.
echo Method 1: Start both simultaneously from root:
echo    npm run dev
echo.
echo Method 2: Start independently:
echo    Backend (port 5000):  cd BACKEND ^&^& npm run dev
echo    Frontend (port 3000): cd FRONTEND ^&^& npm run dev
echo.

pause
endlocal
