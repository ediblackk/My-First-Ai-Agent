@echo off
setlocal enabledelayedexpansion

:: Colors for output
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set NC=[0m

:: Environment variables
set ENV=%1
if "%ENV%"=="" set ENV=development
set TAG=%2
if "%TAG%"=="" set TAG=latest

:: Configuration
if "%ENV%"=="development" (
    set MONGODB_URI=mongodb://localhost:27017/wishdb
    set API_URL=http://localhost:3001
) else if "%ENV%"=="staging" (
    set MONGODB_URI=mongodb://mongodb-staging:27017/wishdb
    set API_URL=https://api-staging.example.com
) else if "%ENV%"=="production" (
    set MONGODB_URI=mongodb://mongodb-prod:27017/wishdb
    set API_URL=https://api.example.com
) else (
    echo %RED%Invalid environment: %ENV%%NC%
    exit /b 1
)

:: Check prerequisites
echo %YELLOW%Checking prerequisites...%NC%
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%docker is required but not installed.%NC%
    exit /b 1
)
where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%docker-compose is required but not installed.%NC%
    exit /b 1
)

:: Build stage
echo %YELLOW%Building for %ENV% environment...%NC%
docker-compose build --build-arg NODE_ENV=%ENV% --build-arg API_URL=%API_URL%
if %ERRORLEVEL% neq 0 (
    echo %RED%Build failed%NC%
    exit /b 1
)

:: Test stage
if not "%ENV%"=="production" (
    echo %YELLOW%Running tests...%NC%
    
    echo Starting containers for testing...
    docker-compose up -d
    
    echo Waiting for services to be ready...
    timeout /t 30 /nobreak
    
    echo Running backend tests...
    docker-compose exec -T backend npm run test
    if %ERRORLEVEL% neq 0 (
        echo %RED%Backend tests failed%NC%
        exit /b 1
    )
    
    echo Running frontend tests...
    docker-compose exec -T frontend npm run test
    if %ERRORLEVEL% neq 0 (
        echo %RED%Frontend tests failed%NC%
        exit /b 1
    )
    
    echo Running E2E tests...
    docker-compose exec -T frontend npm run test:e2e
    if %ERRORLEVEL% neq 0 (
        echo %RED%E2E tests failed%NC%
        exit /b 1
    )
    
    echo Running security scan...
    docker-compose exec -T backend npm run security-scan
    if %ERRORLEVEL% neq 0 (
        echo %RED%Security scan failed%NC%
        exit /b 1
    )
    
    echo Stopping test containers...
    docker-compose down
)

:: Tag images
echo %YELLOW%Tagging images...%NC%
docker tag wish-frontend:latest ghcr.io/yourusername/wish-frontend:%TAG%
docker tag wish-backend:latest ghcr.io/yourusername/wish-backend:%TAG%

:: Push to registry if not development
if not "%ENV%"=="development" (
    echo %YELLOW%Pushing images to registry...%NC%
    docker push ghcr.io/yourusername/wish-frontend:%TAG%
    docker push ghcr.io/yourusername/wish-backend:%TAG%
)

:: Deploy
echo %YELLOW%Deploying to %ENV%...%NC%
if "%ENV%"=="development" (
    docker-compose up -d
) else (
    echo Deploying to %ENV% environment...
    rem Here you would typically use kubectl for Kubernetes deployment
    rem kubectl apply -f k8s/%ENV%/
)

:: Verify deployment
echo %YELLOW%Verifying deployment...%NC%
if "%ENV%"=="development" (
    timeout /t 30 /nobreak
    curl -s -o nul -w "%%{http_code}" http://localhost:3001/health | findstr "200" >nul
    if %ERRORLEVEL% equ 0 (
        echo %GREEN%Backend health check passed%NC%
    ) else (
        echo %RED%Backend health check failed%NC%
        exit /b 1
    )
    
    curl -s -o nul -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul
    if %ERRORLEVEL% equ 0 (
        echo %GREEN%Frontend health check passed%NC%
    ) else (
        echo %RED%Frontend health check failed%NC%
        exit /b 1
    )
) else (
    echo Verifying %ENV% deployment...
    rem Add verification for staging/production environments
    rem kubectl get pods | findstr wish
)

:: Post-deployment tasks
echo %YELLOW%Running post-deployment tasks...%NC%
if "%ENV%"=="development" (
    echo No post-deployment tasks for development
) else if "%ENV%"=="staging" (
    echo Running smoke tests...
    npm run test:smoke
) else if "%ENV%"=="production" (
    echo Running performance tests...
    npm run test:performance
    echo Monitoring deployment...
    npm run monitor
)

echo %GREEN%Deployment to %ENV% completed successfully!%NC%

:: Usage information
if "%ENV%"=="development" (
    echo.
    echo %GREEN%Application is running at:%NC%
    echo Frontend: http://localhost:3000
    echo Backend:  http://localhost:3001
    echo API Docs: http://localhost:3001/api-docs
    echo.
    echo %YELLOW%Available commands:%NC%
    echo docker-compose logs -f    # View logs
    echo docker-compose down       # Stop application
    echo docker-compose restart    # Restart services
)

endlocal
