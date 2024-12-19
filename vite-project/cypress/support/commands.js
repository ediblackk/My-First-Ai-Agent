// ***********************************************
// Custom Commands pentru E2E Testing
// ***********************************************

// Command pentru conectare wallet
Cypress.Commands.add('connectWallet', (walletAddress = 'test-wallet-address') => {
  cy.window().then((win) => {
    win.solana.publicKey.toString = () => walletAddress;
  });
  cy.get('[data-cy=connect-wallet-button]').click();
  cy.wait('@apiPost'); // Așteaptă autentificarea
});

// Command pentru conectare ca admin
Cypress.Commands.add('connectAsAdmin', () => {
  const adminWallet = Cypress.env('ADMIN_WALLET');
  cy.connectWallet(adminWallet);
  cy.url().should('include', '/admin');
});

// Command pentru creare dorință
Cypress.Commands.add('createWish', (content) => {
  cy.get('[data-cy=create-wish-button]').click();
  cy.get('[data-cy=wish-content]').type(content);
  cy.get('[data-cy=submit-wish]').click();
  cy.wait('@apiPost');
});

// Command pentru modificare credite utilizator
Cypress.Commands.add('modifyUserCredits', (userId, amount, reason) => {
  cy.get(`[data-cy=modify-credits-${userId}]`).click();
  cy.get('[data-cy=credit-amount]').type(amount.toString());
  cy.get('[data-cy=credit-reason]').type(reason);
  cy.get('[data-cy=submit-credits]').click();
  cy.wait('@apiPost');
});

// Command pentru verificare loading state
Cypress.Commands.add('shouldShowLoading', () => {
  cy.get('[data-cy=loading-indicator]').should('be.visible');
});

// Command pentru verificare error state
Cypress.Commands.add('shouldShowError', (message) => {
  cy.get('[data-cy=error-message]')
    .should('be.visible')
    .and('contain', message);
});

// Command pentru navigare în admin
Cypress.Commands.add('navigateAdminSection', (section) => {
  cy.get(`[data-cy=admin-nav-${section}]`).click();
  cy.url().should('include', `/admin/${section}`);
});

// Command pentru modificare configurare sistem
Cypress.Commands.add('updateConfig', (key, value) => {
  cy.get(`[data-cy=edit-config-${key}]`).click();
  cy.get('[data-cy=config-value]').clear().type(value);
  cy.get('[data-cy=save-config]').click();
  cy.wait('@apiPut');
});

// Command pentru verificare toast notification
Cypress.Commands.add('shouldShowToast', (message) => {
  cy.get('[data-cy=toast]')
    .should('be.visible')
    .and('contain', message);
});

// Command pentru așteptare loading
Cypress.Commands.add('waitForLoad', () => {
  cy.get('[data-cy=loading-indicator]').should('not.exist');
});

// Command pentru verificare modal
Cypress.Commands.add('shouldShowModal', (title) => {
  cy.get('[data-cy=modal]')
    .should('be.visible')
    .find('[data-cy=modal-title]')
    .should('contain', title);
});

// Command pentru închidere modal
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-cy=modal-close]').click();
  cy.get('[data-cy=modal]').should('not.exist');
});

// Command pentru verificare tabel
Cypress.Commands.add('shouldHaveTableRows', (count) => {
  cy.get('table tbody tr').should('have.length', count);
});

// Command pentru filtrare tabel
Cypress.Commands.add('filterTable', (value) => {
  cy.get('[data-cy=table-filter]').type(value);
  cy.wait('@apiGet');
});

// Command pentru verificare paginare
Cypress.Commands.add('shouldShowPagination', (currentPage, totalPages) => {
  cy.get('[data-cy=pagination]')
    .should('contain', `Pagina ${currentPage} din ${totalPages}`);
});

// Command pentru navigare la pagină
Cypress.Commands.add('goToPage', (page) => {
  cy.get(`[data-cy=page-${page}]`).click();
  cy.wait('@apiGet');
});

// Command pentru verificare chart
Cypress.Commands.add('shouldShowChart', () => {
  cy.get('canvas').should('be.visible');
});

// Command pentru verificare stats
Cypress.Commands.add('shouldShowStats', (stats) => {
  Object.entries(stats).forEach(([key, value]) => {
    cy.get(`[data-cy=stat-${key}]`).should('contain', value);
  });
});

// Command pentru verificare form validation
Cypress.Commands.add('shouldShowValidation', (field, message) => {
  cy.get(`[data-cy=error-${field}]`)
    .should('be.visible')
    .and('contain', message);
});

// Command pentru mock network error
Cypress.Commands.add('mockNetworkError', (method, url) => {
  cy.intercept(method, url, {
    statusCode: 500,
    body: { error: 'Network error' }
  }).as('networkError');
});

// Command pentru verificare responsive
Cypress.Commands.add('checkResponsive', (breakpoint) => {
  const breakpoints = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1280, 720]
  };
  cy.viewport(...breakpoints[breakpoint]);
});
