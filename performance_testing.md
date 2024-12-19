# Strategie de Testare Performanță

[Previous content remains the same until "## 9. Next Steps"]

## 9. Scenarii Specifice API

### Wish API Testing
```js
// Custom metrics
const errorRate = new Rate('error_rate');
const createWishTrend = new Trend('create_wish_duration');
const listWishesTrend = new Trend('list_wishes_duration');
const updateWishTrend = new Trend('update_wish_duration');

// Flow complet
1. Setup
   ```js
   // Creare user și autentificare
   const registerRes = http.post('/api/auth/register', {
     publicKey: `test-${randomString(8)}`
   });
   const authRes = http.post('/api/auth/login', {
     publicKey: registerRes.json().user.publicKey
   });
   ```

2. Create Wish
   ```js
   const createRes = http.post(
     '/api/wishes',
     { content: wishContent },
     { headers: { Authorization: `Bearer ${token}` } }
   );
   createWishTrend.add(duration);
   ```

3. List Wishes
   ```js
   const listRes = http.get(
     '/api/wishes?page=1&limit=10',
     { headers: { Authorization: `Bearer ${token}` } }
   );
   listWishesTrend.add(duration);
   ```

4. Update Wish
   ```js
   const updateRes = http.put(
     `/api/wishes/${wishId}/status`,
     { status: 'completed' },
     { headers: { Authorization: `Bearer ${token}` } }
   );
   updateWishTrend.add(duration);
   ```

### Thresholds Specifice
```js
thresholds: {
  'error_rate': ['rate<0.1'],           // Error rate sub 10%
  'create_wish_duration': ['p95<2000'],  // Creare wish sub 2s
  'list_wishes_duration': ['p95<1000'],  // Listare wishes sub 1s
  'update_wish_duration': ['p95<1000']   // Update wish sub 1s
}
```

### Verificări
```js
check(createRes, {
  'create wish successful': (r) => r.status === 200,
  'wish has correct content': (r) => r.json().wish.content === wishContent
});

check(listRes, {
  'list wishes successful': (r) => r.status === 200,
  'wishes array present': (r) => Array.isArray(r.json().wishes)
});

check(updateRes, {
  'update wish successful': (r) => r.status === 200,
  'status updated correctly': (r) => r.json().wish.status === 'completed'
});
```

### Helper Functions
```js
// Verificare response time
function checkResponseTime(res, maxDuration) {
  return res.timings.duration <= maxDuration;
}

// Verificare response
function checkResponse(res, expectedStatus = 200) {
  return {
    'status is correct': res.status === expectedStatus,
    'response has body': res.body.length > 0,
    'response is json': () => {
      try {
        JSON.parse(res.body);
        return true;
      } catch {
        return false;
      }
    }
  };
}
```

## 10. Next Steps

### Priority 1
- [ ] Setup baseline performance metrics
- [ ] Implementare smoke tests în CI
- [ ] Configurare alerting
- [ ] Adăugare scenarii pentru admin API

### Priority 2
- [ ] Extindere test scenarios
- [ ] Îmbunătățire reporting
- [ ] Automatizare completă
- [ ] Adăugare teste pentru WebSocket

### Priority 3
- [ ] Optimizare thresholds bazat pe date reale
- [ ] Implementare custom metrics pentru business KPIs
- [ ] Setup monitoring dashboard
