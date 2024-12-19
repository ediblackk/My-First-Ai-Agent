@echo off
echo Starting rebuild process...

REM Get the directory where the script is located
set SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

REM Verify docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo Error: docker-compose.yml not found!
    echo Current directory: %CD%
    echo Make sure to run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if Docker Desktop is running
echo Checking Docker Desktop status...
tasklist /FI "IMAGENAME eq Docker Desktop.exe" 2>NUL | find /I /N "Docker Desktop.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo Docker Desktop is not running!
    echo Please start Docker Desktop and wait for it to be ready.
    echo Then run this script again.
    pause
    exit /b 1
)

REM Wait for Docker daemon to be responsive
echo Checking Docker daemon...
:DOCKERCHECK
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Waiting for Docker daemon to be ready...
    timeout /t 2 /nobreak >nul
    goto DOCKERCHECK
)

echo Docker is ready! Proceeding with rebuild...
echo.

REM Stop and remove containers
echo Stopping and removing containers...
docker-compose down
if %ERRORLEVEL% NEQ 0 (
    echo Error stopping containers!
    pause
    exit /b 1
)

REM Remove old images
echo Removing old images...
for /f "tokens=*" %%i in ('docker images -q "my-first-project_*"') do (
    docker rmi %%i
    if %ERRORLEVEL% NEQ 0 (
        echo Warning: Could not remove image %%i
    )
)

REM Rebuild and start containers
echo Rebuilding and starting containers...
docker-compose up -d --build
if %ERRORLEVEL% NEQ 0 (
    echo Error rebuilding containers!
    pause
    exit /b 1
)

echo.
echo Rebuild process complete!
echo.
echo Container status:
docker-compose ps
if %ERRORLEVEL% NEQ 0 (
    echo Error checking container status!
)

echo.
echo If all steps completed successfully, you can now:
echo 1. Access the frontend at: http://localhost:3000
echo 2. The backend API is available at: http://localhost:3001
echo 3. MongoDB is running on: localhost:27017
echo.
echo Press any key to exit...
pause > nul
