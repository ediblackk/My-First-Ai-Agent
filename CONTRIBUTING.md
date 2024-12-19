# Ghid de Dezvoltare

## Arhitectură

### Frontend (React + Vite)
- **Structură**
  ```
  vite-project/
  ├── src/
  │   ├── components/     # Componente reutilizabile
  │   │   ├── header/    # Componente pentru header
  │   │   ├── wishes/    # Componente pentru dorințe
  │   │   └── admin/     # Componente pentru admin
  │   ├── pages/         # Componente la nivel de pagină
  │   ├── services/      # Servicii pentru API
  │   ├── utils/         # Utilități și helpere
  │   ├── tests/         # Configurare și utilități teste
  │   └── assets/        # Resurse statice
  ├── .storybook/        # Configurare Storybook
  └── cypress/           # Teste E2E
  ```

- **State Management**
  - Context API pentru state global
  - Custom hooks pentru logică reutilizabilă
  - React Query pentru caching și sincronizare

- **Stilizare**
  - Tailwind CSS pentru styling
  - CSS Modules pentru stiluri specifice componentelor
  - Design system consistent

### Backend (Express)
- **Structură**
  ```
  express/
  ├── controllers/    # Logică business
  ├── models/         # Modele date
  ├── routes/         # Rutare API
  ├── middleware/     # Middleware custom
  ├── services/       # Servicii externe
  ├── utils/          # Utilități
  ├── config/         # Configurări
  └── tests/          # Teste
  ```

- **Arhitectură API**
  - RESTful endpoints
  - Validare input cu Joi
  - Error handling centralizat
  - Rate limiting și caching

## Convenții Cod

### JavaScript/React
```javascript
// Componente funcționale cu destructurare props
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks la început
  const [state, setState] = useState(null);
  const { data } = useQuery('key', fetchData);

  // Event handlers
  const handleClick = () => {
    // ...
  };

  // Render helpers
  const renderItem = (item) => {
    return <div key={item.id}>{item.name}</div>;
  };

  // JSX
  return (
    <div>
      {data?.map(renderItem)}
    </div>
  );
};

// PropTypes pentru validare props
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};
```

### Testing
```javascript
// Grupare teste logică
describe('MyComponent', () => {
  // Setup comun
  beforeEach(() => {
    // ...
  });

  // Teste clare și descriptive
  it('should handle successful data fetch', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Workflow Git

### Branching
- `main`: Producție
- `develop`: Development
- `feature/*`: Feature nou
- `bugfix/*`: Fix bug
- `release/*`: Pregătire release

### Commit Messages
```
type(scope): descriere scurtă

Descriere detaliată dacă e necesar
```

Tipuri:
- `feat`: Feature nou
- `fix`: Bug fix
- `docs`: Documentație
- `style`: Formatare
- `refactor`: Refactorizare
- `test`: Adăugare teste
- `chore`: Maintenance

## Testing

### Unit Testing
- Jest pentru teste unitare
- React Testing Library pentru componente
- Coverage minim 80%

### E2E Testing
- Cypress pentru teste end-to-end
- Scenarii critice de business
- Device testing

### Performance Testing
- k6 pentru teste de performanță
- Lighthouse pentru frontend
- Monitorizare continuă

## Securitate

### Frontend
- Sanitizare input
- CSP headers
- HTTPS only
- Secure cookies
- XSS protection

### Backend
- Rate limiting
- Input validation
- JWT security
- CORS configuration
- Dependency scanning

## CI/CD

### GitHub Actions
- Build și teste automate
- Analiză cod
- Deployment automat
- Notificări

### Quality Gates
- Test coverage > 80%
- No critical bugs
- Sonar quality gate pass
- Performance budgets

## Monitorizare

### Metrics
- Response times
- Error rates
- Resource usage
- User metrics

### Logging
- Structured logging
- Error tracking
- Audit trails
- Performance monitoring

## Best Practices

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Caching strategy
- Bundle size monitoring

### Accessibility
- WCAG compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- ARIA attributes

### Code Quality
- ESLint configuration
- Prettier formatting
- Code reviews
- Documentation
- Regular refactoring

## Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB
- Git

### Installation
```bash
# Clone repository
git clone [repo-url]

# Install dependencies
cd vite-project && npm install
cd ../express && npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev
```

## Deployment

### Staging
```bash
# Build
npm run build

# Test
npm run test:all

# Deploy
npm run deploy:staging
```

### Production
```bash
# Build
npm run build:prod

# Test
npm run test:all

# Deploy
npm run deploy:prod
```

## Troubleshooting

### Common Issues
- Port conflicts
- Environment variables
- Dependencies
- Build errors

### Debug Tools
- Chrome DevTools
- React DevTools
- Network panel
- Console logging

## Resources

### Documentation
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Architecture](./docs/architecture.md)

### Tools
- [VS Code Extensions](./docs/tools.md)
- [Development Tools](./docs/dev-tools.md)
- [Testing Tools](./docs/testing.md)
