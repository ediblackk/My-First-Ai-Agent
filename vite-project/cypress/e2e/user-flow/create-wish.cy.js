describe('Create Wish Flow', () => {
  beforeEach(() => {
    // Reset și seed database
    cy.task('db:seed');
    
    // Vizitează homepage
    cy.visit('/');
  });

  it('should complete full wish creation flow', () => {
    // 1. Conectare wallet
    cy.connectWallet('test-user-wallet');

    // Verifică că suntem autentificați
    cy.get('[data-cy=user-wallet]')
      .should('be.visible')
      .and('contain', 'test-user-wallet');

    // Verifică credite inițiale
    cy.get('[data-cy=user-credits]')
      .should('be.visible')
      .and('contain', '100');

    // 2. Deschide modal creare dorință
    cy.get('[data-cy=create-wish-button]').click();
    cy.shouldShowModal('Dorință Nouă');

    // 3. Completează dorința
    const wishContent = 'Vreau să învăț programare și să devin developer în 6 luni.';
    cy.get('[data-cy=wish-content]').type(wishContent);

    // 4. Submit pentru analiză
    cy.get('[data-cy=continue-button]').click();

    // Verifică loading state
    cy.shouldShowLoading();

    // 5. Verifică preview analiză
    cy.get('[data-cy=analysis-preview]', { timeout: 10000 }).should('be.visible');
    
    // Verifică componentele analizei
    cy.get('[data-cy=complexity-meter]').should('be.visible');
    cy.get('[data-cy=categories]').should('be.visible');
    cy.get('[data-cy=challenges]').should('be.visible');
    cy.get('[data-cy=resources]').should('be.visible');

    // 6. Confirmă crearea
    cy.get('[data-cy=submit-wish]').click();

    // Verifică loading state
    cy.shouldShowLoading();

    // 7. Verifică succes
    cy.shouldShowToast('Dorința a fost creată cu succes!');

    // Verifică că modalul s-a închis
    cy.get('[data-cy=modal]').should('not.exist');

    // 8. Verifică actualizare credite
    cy.get('[data-cy=user-credits]')
      .should('be.visible')
      .and('contain', '99');

    // 9. Verifică că dorința apare în listă
    cy.get('[data-cy=wish-list]')
      .should('contain', wishContent);

    // Verifică detaliile dorinței
    cy.get('[data-cy=wish-card]').first().click();
    cy.shouldShowModal('Detalii Dorință');

    // Verifică conținut
    cy.get('[data-cy=wish-content]')
      .should('contain', wishContent);

    // Verifică analiză
    cy.get('[data-cy=analysis-section]').should('be.visible');

    // Verifică soluție
    cy.get('[data-cy=solution-section]').should('be.visible');

    // Verifică status
    cy.get('[data-cy=wish-status]')
      .should('contain', 'În Așteptare');
  });

  it('should handle validation errors', () => {
    // Conectare
    cy.connectWallet('test-user-wallet');

    // Deschide modal
    cy.get('[data-cy=create-wish-button]').click();

    // Încearcă submit cu conținut prea scurt
    cy.get('[data-cy=wish-content]').type('Test');
    cy.get('[data-cy=continue-button]').click();

    // Verifică eroare validare
    cy.shouldShowValidation('content', 'Dorința trebuie să aibă cel puțin 10 caractere');
  });

  it('should handle insufficient credits', () => {
    // Conectare cu user fără credite
    cy.connectWallet('no-credits-user');

    // Mock user fără credite
    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          publicKey: 'no-credits-user',
          credits: 0
        }
      }
    });

    // Încearcă să creeze dorință
    cy.get('[data-cy=create-wish-button]').click();

    // Verifică mesaj credite insuficiente
    cy.shouldShowError('Nu ai suficiente credite pentru a crea o dorință');
  });

  it('should handle network errors', () => {
    // Conectare
    cy.connectWallet('test-user-wallet');

    // Deschide modal
    cy.get('[data-cy=create-wish-button]').click();

    // Completează dorința
    cy.get('[data-cy=wish-content]')
      .type('O dorință suficient de lungă pentru test');

    // Mock network error
    cy.mockNetworkError('POST', '/api/wishes');

    // Submit
    cy.get('[data-cy=continue-button]').click();

    // Verifică error state
    cy.shouldShowError('A apărut o eroare. Te rugăm să încerci din nou.');
  });

  it('should be responsive', () => {
    // Test pe mobile
    cy.checkResponsive('mobile');
    cy.connectWallet('test-user-wallet');
    cy.get('[data-cy=create-wish-button]').click();

    // Verifică layout
    cy.get('[data-cy=modal]')
      .should('have.css', 'width', '100%');
    
    // Test pe tablet
    cy.checkResponsive('tablet');
    cy.get('[data-cy=modal]')
      .should('have.css', 'max-width', '600px');
    
    // Test pe desktop
    cy.checkResponsive('desktop');
    cy.get('[data-cy=modal]')
      .should('have.css', 'max-width', '800px');
  });
});
