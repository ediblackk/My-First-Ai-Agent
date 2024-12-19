@echo off
setlocal EnableDelayedExpansion
echo [%time%] Starting cleanup process...

:: Change to project directory
cd /d "%~dp0"
echo [%time%] Working directory: %CD%

echo [%time%] Starting cleanup based on simplified approach...

:: Kubernetes (not needed)
echo [%time%] Removing Kubernetes files...
rmdir /s /q k8s 2>nul
del /f /q deploy-k8s.ps1 2>nul
del /f /q install-k8s.bat 2>nul
del /f /q setup-k8s.ps1 2>nul

:: Complex testing (keeping Cypress and Jest)
echo [%time%] Removing complex testing files...
del /f /q vite-project/lighthouserc.js 2>nul
rmdir /s /q express/k6 2>nul
rmdir /s /q express/monitoring 2>nul

:: Documentation cleanup (keeping core docs)
echo [%time%] Cleaning up documentation...
del /f /q performance_testing.md 2>nul

:: Scripts cleanup
echo [%time%] Removing unused scripts...
del /f /q express/scripts/security-scan.js 2>nul

:: Storybook (not needed for basic UI)
echo [%time%] Removing Storybook...
rmdir /s /q vite-project/.storybook 2>nul
del /f /q vite-project/src/components/wishes/CreateWish.stories.jsx 2>nul

:: Docker simplification
echo [%time%] Cleaning up Docker files...
del /f /q docker-compose.simplified.yml 2>nul

echo [%time%] Files to keep:
echo - Cypress for basic flows
echo - Jest for simple logic
echo - Basic error tracking
echo - Console logs for debugging
echo - Core documentation
echo - Essential Docker files

echo [%time%] Cleanup complete!
echo [%time%] Please review changes and run backup.bat to create a new backup.
pause
endlocal
