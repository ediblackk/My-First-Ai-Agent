# Comenzi pentru Curățare Proiect

## 1. Backup
```bash
# Creează un backup al proiectului curent
cp -r . ../my-first-project-backup
```

## 2. Ștergere Directoare și Fișiere

### Backend Cleanup
```bash
# Ștergere k6 și configurări
rm -rf express/k6

# Ștergere monitoring
rm -rf express/monitoring

# Ștergere scripts nenecesare
rm -rf express/scripts/security-scan.js
```

### Frontend Cleanup
```bash
# Ștergere Cypress
rm -rf vite-project/cypress
rm -f vite-project/cypress.config.js

# Ștergere Lighthouse
rm -f vite-project/lighthouserc.js
```

## 3. Înlocuire Fișiere de Configurare

### Package.json Files
```bash
# Înlocuire package.json backend
mv express/package.json.simplified express/package.json

# Înlocuire package.json frontend
mv vite-project/package.json.simplified vite-project/package.json
```

### Docker Configuration
```bash
# Înlocuire docker-compose
mv docker-compose.simplified.yml docker-compose.yml
```

## 4. Reinstalare Dependențe

### Backend
```bash
cd express
rm -rf node_modules
rm package-lock.json
npm install
```

### Frontend
```bash
cd ../vite-project
rm -rf node_modules
rm package-lock.json
npm install
```

## 5. Curățare Docker
```bash
# Oprește și șterge containerele existente
docker-compose down -v

# Șterge imagini vechi
docker rmi $(docker images -q 'my-first-project_*')

# Reconstruiește cu configurația nouă
docker-compose up -d --build
```

## 6. Verificare după Cleanup

### Verifică Structura
```bash
# Verifică că directoarele au fost șterse
ls express/
ls vite-project/

# Verifică că fișierele de configurare au fost actualizate
cat express/package.json
cat vite-project/package.json
cat docker-compose.yml
```

### Verifică Aplicația
```bash
# Verifică logs
docker-compose logs

# Verifică că serviciile rulează
docker-compose ps
```

### Testează Funcționalități
1. Deschide http://localhost:3000
2. Verifică:
   - Conectare wallet
   - Autentificare
   - Chat functionality
   - Admin panel

## 7. Cleanup Final
```bash
# Șterge fișiere temporare
rm -f express/package.json.simplified
rm -f vite-project/package.json.simplified
rm -f docker-compose.simplified.yml
```

## Ce Am Eliminat

### Testing Tools
- ✓ k6 performance testing
- ✓ Cypress E2E testing
- ✓ Lighthouse CI
- ✓ Complex monitoring

### Backend
- ✓ Redis
- ✓ Complex logging
- ✓ Performance monitoring
- ✓ Security scanning

### Frontend
- ✓ E2E tests
- ✓ Performance testing
- ✓ Accessibility testing
- ✓ Complex monitoring

## Ce Am Păstrat

### Esențiale
- MongoDB pentru storage
- Express pentru API
- React pentru UI
- Docker pentru deployment

### Testing
- Jest pentru unit tests
- Basic error handling
- Simple logging

### Security
- Wallet authentication
- JWT tokens
- Basic rate limiting

## Următorii Pași

1. Verificare Funcționalitate
   - Test conectare wallet
   - Test chat
   - Test admin panel

2. Adăugări Necesare
   - Implementare chat
   - Basic error handling
   - Simple monitoring

3. Documentație
   - Update README
   - Adaugă instrucțiuni de instalare
   - Documentează API-ul
