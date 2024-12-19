# Erori și Pași de Rezolvare

## Erori Identificate

1. MongoDB Connection Error:
```
MongoDB connection error: MongooseServerSelectionError: getaddrinfo ENOTFOUND mongodb
```

2. API Connection Errors (ERR_CONNECTION_REFUSED):
- POST /api/users/authenticate
- GET /api/wishes/current-round
- GET /api/stats/latest-wishes
- GET /api/stats/top-rewards
- GET /api/stats/round-stats
- GET /api/users/credits

3. Frontend Warning:
```
Warning: UserStats: Support for defaultProps will be removed from function components
```

## Pași de Rezolvare

1. MongoDB Connection
   - Modifică MONGODB_URI în express/.env să folosească localhost în loc de 'mongodb':
   ```
   MONGODB_URI=mongodb://localhost:27017/wishdb
   ```

2. Backend Server
   - Verifică dacă serverul rulează pe portul 3001
   - Pornește serverul cu:
   ```
   cd express
   npm run dev
   ```

3. Frontend Development
   - Actualizează UserStats component să folosească parametri default în loc de defaultProps
   - Pornește frontend-ul cu:
   ```
   cd vite-project
   npm run dev
   ```

4. Verificare Finală
   - Confirmă că MongoDB rulează local
   - Verifică că backend-ul rulează pe 3001
   - Verifică că frontend-ul poate accesa backend-ul
   - Testează autentificarea cu wallet
   - Verifică că toate API call-urile funcționează

## Ordine de Execuție

1. Start MongoDB local
2. Start Backend (express)
3. Start Frontend (vite-project)
4. Verifică conexiunile și rezolvă erorile una câte una
