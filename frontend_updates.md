# Updates Necesare Frontend

## 1. Dependențe Testing Lipsă

### Jest și React Testing Library
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### Cypress și Plugins
```json
{
  "devDependencies": {
    "cypress": "^13.0.0",
    "cypress-localstorage-commands": "^2.0.0",
    "@testing-library/cypress": "^10.0.0"
  }
}
```

### Performance și Accessibility
```json
{
  "devDependencies": {
    "@axe-core/react": "^4.0.0",
    "lighthouse": "^11.0.0",
    "@lhci/cli": "^0.12.0"
  }
}
```

## 2. Configurare Jest

### jest.config.js
```js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}
```

### setup.js
```js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 3. Scripts Necesare

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:a11y": "axe --react",
    "test:lighthouse": "lhci autorun"
  }
}
```

## 4. Structură Directoare

```
src/
├── tests/
│   ├── setup.js
│   ├── testUtils.js
│   └── __mocks__/
│       ├── fileMock.js
│       └── styleMock.js
├── components/
│   └── __tests__/
│       └── Component.test.jsx
└── cypress/
    ├── e2e/
    │   ├── user-flow/
    │   └── admin-flow/
    └── support/
        └── commands.js
```

## 5. Exemple Test

### Component Test
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WishForm from '../WishForm';

test('renders wish form and handles submission', async () => {
  render(<WishForm />);
  
  await userEvent.type(screen.getByRole('textbox'), 'My wish');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### E2E Test
```js
describe('Wish Creation', () => {
  it('creates a new wish successfully', () => {
    cy.login();
    cy.visit('/');
    cy.get('[data-cy=create-wish]').click();
    cy.get('[data-cy=wish-input]').type('My wish');
    cy.get('[data-cy=submit]').click();
    cy.get('[data-cy=success]').should('be.visible');
  });
});
```

## 6. Pași de Implementare

1. Instalare dependențe
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom cypress
   ```

2. Configurare Jest și Cypress
   - Creare fișiere config
   - Setup environment

3. Adăugare scripts în package.json
   - Test commands
   - Watch mode
   - Coverage

4. Creare structură directoare
   - Test directories
   - Mock files
   - Support files

5. Implementare teste de bază
   - Component tests
   - Integration tests
   - E2E tests
