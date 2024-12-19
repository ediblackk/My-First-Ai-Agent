@echo off
echo Pornire instalare Kubernetes...

REM Verifică dacă rulează ca administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Rulează ca administrator - OK
) else (
    echo Acest script trebuie rulat ca administrator
    echo Deschide Command Prompt ca administrator și încearcă din nou
    pause
    exit /b 1
)

REM Verifică dacă Docker este instalat și rulează
docker info >nul 2>&1
if %errorLevel% == 0 (
    echo Docker rulează - OK
) else (
    echo Docker nu rulează sau nu este instalat
    echo Te rog pornește Docker Desktop și încearcă din nou
    pause
    exit /b 1
)

REM Setează directorul curent
cd /d %~dp0

REM Pornește PowerShell cu politica de execuție bypass și rulează scriptul de setup
powershell -ExecutionPolicy Bypass -Command "& {Start-Process PowerShell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0setup-k8s.ps1\"' -Verb RunAs}"

echo.
echo După ce instalarea este completă, rulează:
echo minikube start --driver=docker
echo.
echo Apoi rulează:
echo .\deploy-k8s.ps1 -Environment dev
echo.
pause
