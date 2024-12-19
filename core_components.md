# Componente Cheie

## 1. Autentificare
Singura metodă de autentificare: Solana Wallet
- **WalletProvider**: Gestionează conexiunea wallet
- **AuthProvider**: Gestionează starea autentificării
- **JWT**: Token pentru sesiune

## 2. User Management
Un singur tip de user cu două roluri posibile:
- Regular User
- Admin (setat prin wallet address)

## 3. Credite
Sistem simplu de credite:
- User primește credite inițiale la înregistrare
- Fiecare wish costă un număr fix de credite
- Admin poate acorda credite suplimentare

## 4. Wishes (Dorințe)
Entitate principală cu stări simple:
- Pending (În așteptare)
- Completed (Îndeplinită)
- Cancelled (Anulată)

## 5. Runde
Sistem basic de runde:
- O rundă activă la un moment dat
- Număr fix de wishes necesare pentru completare
- Tranziție automată la următoarea rundă

## 6. Comunicare Frontend-Backend

### Frontend Components
1. **Header**
   - Wallet Connect
   - User Info
   - Navigation

2. **Main Dashboard**
   - Wish List
   - Create Wish
   - Round Status

3. **Admin Panel** (când e cazul)
   - User Management
   - System Stats
   - Credit Management

### Backend Services
1. **User Service**
   - Autentificare
   - Gestionare credite
   - Profil user

2. **Wish Service**
   - Creare wish
   - Listare wishes
   - Update status

3. **Round Service**
   - Gestionare runde
   - Tranziții stare
   - Statistici

## 7. Bază de Date

### Collections Minime
1. **Users**
   ```js
   {
     walletAddress: String,
     credits: Number,
     isAdmin: Boolean,
     createdAt: Date
   }
   ```

2. **Wishes**
   ```js
   {
     userId: ObjectId,
     content: String,
     status: String,
     credits: Number,
     createdAt: Date
   }
   ```

3. **Rounds**
   ```js
   {
     status: String,
     requiredWishes: Number,
     currentWishes: Number,
     startedAt: Date
   }
   ```

## 8. API Endpoints

### Public
- POST /api/users/authenticate

### Protected
- GET /api/users/profile
- GET /api/wishes
- POST /api/wishes
- GET /api/rounds/current

### Admin Only
- GET /api/admin/users
- POST /api/admin/credits
- GET /api/admin/stats

## 9. Securitate

### Frontend
- Validare input de bază
- Sanitizare date afișate
- Token management
- Error handling

### Backend
- Validare completă input
- Rate limiting
- JWT verification
- Role-based access

## 10. Monitorizare

### Metrics de Bază
- Users activi
- Wishes per rundă
- Credite în circulație
- Success rate wishes

### Logging
- Autentificări
- Operațiuni admin
- Erori sistem
- Performanță

## 11. Deployment

### Docker Containers
- Frontend (Nginx)
- Backend (Node)
- MongoDB
- Redis (opțional pentru caching)

### Environment
- Development
- Production
- Staging (opțional)

## 12. Testing

### Frontend
- Component tests
- Integration tests
- E2E tests (minimal)

### Backend
- Unit tests
- API tests
- Integration tests
