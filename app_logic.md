# Logica Aplicației

## Principii de Bază

### 1. Securitate prin Separare
- Frontend-ul NU are acces direct la baza de date
- Toate operațiunile de date trec prin backend
- Frontend-ul trimite doar comenzi/request-uri
- Backend-ul validează TOATE request-urile

### 2. Flow de Date
```
Frontend -> API Request -> Backend -> Database
Frontend <- API Response <- Backend <- Database
```

### 3. Responsabilități

#### Frontend
- Interfață utilizator
- Validare de bază pentru UX
- Trimitere comenzi către backend
- Afișare date primite de la backend
- Gestionare stare locală (UI state)

#### Backend
- Validare TOATE request-urile
- Procesare logică de business
- Acces și manipulare date
- Autorizare și autentificare
- Rate limiting și securitate

### 4. Autentificare și Autorizare
- Frontend: Conectare wallet Solana
- Backend: Validare și generare token JWT
- Toate request-urile autentificate folosesc token
- Backend verifică token-ul la FIECARE request

### 5. Operațiuni de Bază

#### Create Wish
Frontend:
- Colectează date de la user
- Validare de bază (lungime text, format)
- Trimite request la backend

Backend:
- Validare completă date
- Verificare permisiuni user
- Verificare credite disponibile
- Salvare în bază de date

#### View Wishes
Frontend:
- Request listă dorințe
- Afișare date primite
- Paginare locală

Backend:
- Verificare autentificare
- Filtrare date după permisiuni
- Rate limiting
- Paginare

#### Admin Operations
Frontend:
- Interfață admin separată
- Verificare rol admin local
- Request-uri specifice admin

Backend:
- Verificare rol admin la FIECARE request
- Validare operațiuni admin
- Logging operațiuni admin

### 6. Validare și Sanitizare

#### Frontend (minimal)
- Format date
- Lungime text
- Tip date

#### Backend (complet)
- Re-validare TOATE datele
- Sanitizare input
- Verificare permisiuni
- Verificare business rules

### 7. Rate Limiting și Protecție

#### Frontend
- Debounce pentru request-uri
- Retry logic cu backoff
- Gestionare erori

#### Backend
- Rate limiting per IP/user
- Protecție DDOS
- Request size limiting
- Input sanitization

### 8. Logging și Monitoring

#### Frontend
- Error logging
- User actions
- Performance metrics

#### Backend
- Access logs
- Error logs
- Security events
- Performance metrics
- Audit trail pentru admin

### 9. Error Handling

#### Frontend
- Afișare erori user-friendly
- Retry pentru erori temporare
- Fallback UI

#### Backend
- Error codes standardizate
- Logging detaliat
- No stack traces în producție
- Sanitizare mesaje de eroare

### 10. Optimizări

#### Frontend
- Caching local
- Lazy loading
- State management eficient

#### Backend
- Caching
- Database indexing
- Query optimization
- Connection pooling
