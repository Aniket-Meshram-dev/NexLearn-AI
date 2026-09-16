@echo off
setlocal

echo.
echo ==========================================
echo       NexLearn Setup Script
echo      (Unified Full-Stack Setup)
echo ==========================================
echo.

:: Check for .env file
if not exist .env (
    echo [WARNING] .env file not found!
    echo Prisma and authentication require configuration defined in .env.
    if exist .env.example (
        echo Copying .env.example to .env...
        copy .env.example .env > nul
    )
    echo Please configure your database URL and API keys in .env before starting the server.
    echo.
)

:: Step 1: Install Dependencies
echo.
echo [1/3] Installing Project Dependencies (npm install)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    exit /b %ERRORLEVEL%
)

:: Step 2: Push Prisma schema & Generate Client
echo.
echo [2/3] Initializing Database (npx prisma db push ^&^& npx prisma generate)...
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Prisma db push failed. Please verify your DATABASE_URL in .env.
)
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma generate failed.
    exit /b %ERRORLEVEL%
)

:: Step 3: Type check
echo.
echo [3/3] Validating TypeScript (npm run type-check)...
call npm run type-check

echo.
echo ==========================================
echo       Setup Completed Successfully!
echo ==========================================
echo Run the unified full-stack application:
echo    npm run dev
echo.
echo App will be available at http://localhost:3000
echo.

pause
endlocal
