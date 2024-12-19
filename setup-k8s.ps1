# Verifică dacă scriptul rulează ca administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Acest script trebuie rulat ca administrator. Deschideți PowerShell ca administrator și încercați din nou." -ForegroundColor Red
    exit
}

# Funcție pentru a verifica dacă un program este instalat
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Verifică dacă Docker este instalat și rulează
if (-not (Test-CommandExists docker)) {
    Write-Host "Docker nu este instalat. Te rog instalează Docker Desktop și încearcă din nou." -ForegroundColor Red
    exit
}

try {
    docker info | Out-Null
} catch {
    Write-Host "Docker nu rulează. Te rog pornește Docker Desktop și încearcă din nou." -ForegroundColor Red
    exit
}

# Instalează Chocolatey dacă nu este instalat
if (-not (Test-CommandExists choco)) {
    Write-Host "Instalare Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

# Instalează Minikube dacă nu este instalat
if (-not (Test-CommandExists minikube)) {
    Write-Host "Instalare Minikube..." -ForegroundColor Yellow
    choco install minikube -y
}

# Instalează kubectl dacă nu este instalat
if (-not (Test-CommandExists kubectl)) {
    Write-Host "Instalare kubectl..." -ForegroundColor Yellow
    choco install kubernetes-cli -y
}

# Verifică instalarea
Write-Host "`nVerificare instalare..." -ForegroundColor Yellow
Write-Host "Docker: " -NoNewline
docker --version
Write-Host "Minikube: " -NoNewline
minikube version
Write-Host "kubectl: " -NoNewline
kubectl version --client

Write-Host "`nSetup complet!" -ForegroundColor Green
Write-Host "Pentru a începe, rulează: minikube start --driver=docker" -ForegroundColor Yellow
