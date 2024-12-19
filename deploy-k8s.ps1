# Parametru pentru mediul de deployment (dev sau prod)
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod")]
    [string]$Environment
)

Write-Host "Starting deployment for $Environment environment..." -ForegroundColor Green

# Construiește imaginile Docker
Write-Host "Building Docker images..." -ForegroundColor Yellow
docker build -t my-first-project-backend:latest ./express
docker build -t my-first-project-frontend:latest ./vite-project

# Verifică dacă Minikube rulează (pentru dezvoltare locală)
$minikubeStatus = minikube status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Minikube..." -ForegroundColor Yellow
    minikube start
    
    # Așteaptă să pornească Minikube
    Start-Sleep -Seconds 10
}

# Încarcă imaginile în Minikube
Write-Host "Loading images into Minikube..." -ForegroundColor Yellow
minikube image load my-first-project-backend:latest
minikube image load my-first-project-frontend:latest

# Aplică configurațiile Kubernetes
Write-Host "Applying Kubernetes configurations for $Environment environment..." -ForegroundColor Yellow
kubectl apply -k k8s/overlays/$Environment

# Verifică statusul pod-urilor
Write-Host "Waiting for pods to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
kubectl get pods -n wish-app-$Environment

# Afișează URL-ul pentru accesarea aplicației
if ($Environment -eq "dev") {
    $frontendUrl = minikube service frontend -n wish-app-dev --url
    Write-Host "Application is available at: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "Application is deployed to production environment" -ForegroundColor Green
    Write-Host "Make sure your DNS and SSL certificates are properly configured" -ForegroundColor Yellow
}

Write-Host "Deployment complete!" -ForegroundColor Green
