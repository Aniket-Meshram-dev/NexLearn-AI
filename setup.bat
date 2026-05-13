@echo off
setlocal

echo.
echo ==========================================
echo       Project Setup Script
echo ==========================================
echo.

:: Check for .env file
if not exist .env (
    echo [WARNING] .env file not found!
    echo Prisma commands require a database URL defined in .env.
    echo Please create a .env file with your database configuration.
    echo Press any key to continue if you have already set it up, or Ctrl+C to abort.
    pause > nul
)

:: Step 1: Install dependencies
echo.
echo [1/3] Installing dependencies (npm install)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    exit /b %ERRORLEVEL%
)

:: Step 2: Push Prisma schema to database
echo.
echo [2/3] Simulating database push (npx prisma db push)...
call npx prisma db push
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma db push failed.
    exit /b %ERRORLEVEL%
)

:: Step 3: Generate Prisma Client
echo.
echo [3/3] Generating Prisma Client (npx prisma generate)...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Prisma generate failed.
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo       Setup Completed Successfully!
echo ==========================================
echo You can now start the development server with:
echo npm run dev
echo.

pause
endlocal
