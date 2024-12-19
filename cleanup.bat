@echo off
echo Starting cleanup process...

set PROJECT_DIR=%~dp0
echo Working directory: %PROJECT_DIR%

:STEP1
echo.
set /p DO_BACKUP="Step 1: Create backup? (y/n): "
if /i "%DO_BACKUP%"=="y" (
    echo Creating backup...
    xcopy /E /I /Y . ..\my-first-project-backup
    echo Backup complete.
)

:STEP2
echo.
set /p DO_CLEANUP="Step 2: Remove unnecessary directories and files? (y/n): "
if /i "%DO_CLEANUP%"=="y" (
    echo Removing directories...
    rmdir /S /Q "%PROJECT_DIR%express\k6"
    rmdir /S /Q "%PROJECT_DIR%express\monitoring"
    rmdir /S /Q "%PROJECT_DIR%express\scripts"

    echo Simplifying Cypress...
    rmdir /S /Q "%PROJECT_DIR%vite-project\cypress\e2e\admin-flow\system-monitoring.cy.js"
    rmdir /S /Q "%PROJECT_DIR%vite-project\cypress\component"
    del /F /Q "%PROJECT_DIR%vite-project\cypress.config.js"
    del /F /Q "%PROJECT_DIR%vite-project\lighthouserc.js"
    echo Directory cleanup complete.
)

:STEP3
echo.
set /p DO_CONFIG="Step 3: Replace configuration files? (y/n): "
if /i "%DO_CONFIG%"=="y" (
    echo Replacing configuration files...
    copy /Y "%PROJECT_DIR%express\package.json.simplified" "%PROJECT_DIR%express\package.json"
    copy /Y "%PROJECT_DIR%vite-project\package.json.simplified" "%PROJECT_DIR%vite-project\package.json"
    copy /Y "%PROJECT_DIR%docker-compose.simplified.yml" "%PROJECT_DIR%docker-compose.yml"

    echo Creating simplified Cypress config...
    (
    echo {
    echo   "baseUrl": "http://localhost:3000",
    echo   "supportFile": "cypress/support/e2e.js",
    echo   "specPattern": "cypress/e2e/**/*.cy.{js,jsx}",
    echo   "viewportWidth": 1280,
    echo   "viewportHeight": 720,
    echo   "video": false
    echo }
    ) > "%PROJECT_DIR%vite-project\cypress.config.js"
    echo Configuration files replaced.
)

:STEP4
echo.
set /p DO_DEPS="Step 4: Clean and reinstall dependencies? (y/n): "
if /i "%DO_DEPS%"=="y" (
    cd "%PROJECT_DIR%express"
    echo Cleaning express node_modules...
    rmdir /S /Q node_modules
    del /F /Q package-lock.json
    call npm install
    if errorlevel 1 (
        echo Error installing express dependencies
        pause
        exit /b 1
    )

    cd "%PROJECT_DIR%vite-project"
    echo Cleaning vite-project node_modules...
    rmdir /S /Q node_modules
    del /F /Q package-lock.json
    call npm install
    if errorlevel 1 (
        echo Error installing vite-project dependencies
        pause
        exit /b 1
    )

    cd "%PROJECT_DIR%"
    echo Dependencies reinstalled.
)

:STEP5
echo.
set /p DO_DOCKER="Step 5: Clean and rebuild Docker containers? (y/n): "
if /i "%DO_DOCKER%"=="y" (
    echo Checking Docker...
    echo Verifying Docker Desktop is running...
    tasklist /FI "IMAGENAME eq Docker Desktop.exe" 2>NUL | find /I /N "Docker Desktop.exe">NUL
    if "%ERRORLEVEL%"=="1" (
        echo Docker Desktop is not running.
        echo Please start Docker Desktop and wait for it to be ready.
        echo Press any key when Docker Desktop is running...
        pause > nul
    )

    echo Starting Docker cleanup...
    docker info > nul 2>&1
    if errorlevel 1 (
        echo Docker is not responding. Please ensure Docker Desktop is running and try again.
        pause
        exit /b 1
    )

    echo Docker is running. Proceeding with cleanup...
    docker-compose down -v
    for /f "tokens=*" %%i in ('docker images -q "ssb_*"') do docker rmi %%i
    docker-compose up -d --build

    echo Docker containers rebuilt. Checking status...
    timeout /t 20 /nobreak
    docker-compose ps
)

:STEP6
echo.
set /p DO_CLEANUP_TEMP="Step 6: Remove temporary files? (y/n): "
if /i "%DO_CLEANUP_TEMP%"=="y" (
    echo Removing temporary files...
    del /F /Q "%PROJECT_DIR%express\package.json.simplified"
    del /F /Q "%PROJECT_DIR%vite-project\package.json.simplified"
    del /F /Q "%PROJECT_DIR%docker-compose.simplified.yml"
)

echo.
echo Cleanup process complete!
echo.
echo Final system state:
echo Checking directories...
dir "%PROJECT_DIR%express"
echo.
dir "%PROJECT_DIR%vite-project"
echo.
echo Checking Docker containers...
docker-compose ps
echo.
echo All steps completed. Press any key to exit...
pause > nul
