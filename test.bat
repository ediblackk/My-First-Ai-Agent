@echo off
echo Starting test process...
echo.

REM Check Docker container status
echo === Checking Docker Containers ===
docker-compose ps
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker containers are not running!
    echo Please run rebuild.bat first.
    pause
    exit /b 1
)
echo.

REM Test frontend accessibility
echo === Testing Frontend ===
curl -I http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Frontend is not accessible!
) else (
    echo Frontend is accessible at http://localhost:3000
)
echo.

REM Test backend API
echo === Testing Backend API ===
curl -I http://localhost:3001/api/health >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Backend API is not accessible!
) else (
    echo Backend API is accessible at http://localhost:3001
)
echo.

REM Test MongoDB connection through backend
echo === Testing MongoDB Connection ===
curl -I http://localhost:3001/api/health/db >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: MongoDB connection test failed!
) else (
    echo MongoDB connection is working
)
echo.

REM Test public assets
echo === Testing Public Assets ===
curl -I http://localhost:3000/public/logo.png >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Logo asset is not accessible!
) else (
    echo Logo asset is accessible
)
echo.

REM Display container logs if there are errors
echo === Recent Container Logs ===
echo --- Frontend Logs ---
docker-compose logs --tail=10 frontend
echo.
echo --- Backend Logs ---
docker-compose logs --tail=10 backend
echo.

echo Test process complete!
echo.
echo Next steps if issues are found:
echo 1. Check Docker Desktop is running
echo 2. Run rebuild.bat to rebuild containers
echo 3. Check container logs for specific errors
echo 4. Verify environment variables are set correctly
echo.
echo Press any key to exit...
pause > nul
