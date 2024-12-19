# Make-A-Wish Game

O aplicație web pentru crearea și gestionarea dorințelor, construită cu React și Express.

## Cerințe de Sistem

- Windows 10
- PowerShell
- Docker Desktop
- Minim 8GB RAM
- Minim 20GB spațiu liber pe disk

## Instalare

1. Clonează repository-ul:
```bash
git clone <repository-url>
cd my-first-project
```

2. Deschide PowerShell ca Administrator și rulează scriptul de setup pentru Kubernetes:
```powershell
.\setup-k8s.ps1
```

Acest script va instala:
- Chocolatey (package manager pentru Windows)
- VirtualBox (hypervisor pentru Minikube)
- Minikube (Kubernetes local)
- kubectl (CLI pentru Kubernetes)

3. Pornește Minikube:
```powershell
minikube start --driver=virtualbox
```

## Deployment

### Dezvoltare Locală cu Docker Compose

Pentru dezvoltare locală rapidă, poți folosi Docker Compose:
```bash
docker-compose up -d
```

Aplicația va fi disponibilă la:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Deployment pe Kubernetes

Pentru un mediu mai robust cu scalare automată și high availability, folosește Kubernetes:

1. Pentru mediul de dezvoltare:
```powershell
.\deploy-k8s.ps1 -Environment dev
```

2. Pentru mediul de producție:
```powershell
.\deploy-k8s.ps1 -Environment prod
```

Kubernetes oferă:
- Scalare automată
- High availability
- Rolling updates fără downtime
- Health checks și auto-healing
- Load balancing
- Service discovery
- Management configurări

## Structură Kubernetes

```
k8s/
├── base/                   # Configurații de bază
│   ├── namespace.yaml     # Namespace pentru izolare
│   ├── mongodb.yaml       # Deployment și Service pentru MongoDB
│   ├── redis.yaml         # Deployment și Service pentru Redis
│   ├── backend.yaml       # Deployment și Service pentru Backend
│   ├── frontend.yaml      # Deployment, Service și Ingress pentru Frontend
│   └── kustomization.yaml # Configurare Kustomize pentru base
│
└── overlays/              # Configurații specifice mediului
    ├── dev/              # Mediu de dezvoltare
    │   └── kustomization.yaml
    └── prod/             # Mediu de producție
        └── kustomization.yaml
```

## Monitorizare

Pentru a vedea statusul pod-urilor:
```bash
kubectl get pods -n wish-app-dev  # pentru dev
kubectl get pods -n wish-app-prod # pentru prod
```

Pentru a vedea log-urile:
```bash
kubectl logs -f deployment/backend -n wish-app-dev  # pentru backend
kubectl logs -f deployment/frontend -n wish-app-dev # pentru frontend
```

## Troubleshooting

1. Dacă pod-urile nu pornesc, verifică log-urile:
```bash
kubectl describe pod <pod-name> -n wish-app-dev
```

2. Pentru a reporni un deployment:
```bash
kubectl rollout restart deployment/<deployment-name> -n wish-app-dev
```

3. Pentru a șterge tot și a începe din nou:
```bash
kubectl delete namespace wish-app-dev
kubectl delete namespace wish-app-prod
