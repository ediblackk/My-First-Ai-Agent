describe('Admin User Management Flow', () => {
  beforeEach(() => {
    // Reset și seed database
    cy.task('db:seed');
    
    // Vizitează homepage
    cy.visit('/');
  });

  it('should complete full user management flow', () => {
    // 1. Conectare ca admin
    cy.connectAsAdmin();

    // Verifică că suntem în panoul admin
    cy.url().should('include', '/admin');
    cy.get('[data-cy=admin-header]')
      .should('contain', 'Panou Administrare');

    // 2. Navigare la secțiunea Users
    cy.navigateAdminSection('users');

    // Verifică tabel utilizatori
    cy.get('[data-cy=users-table]').should('be.visible');
    cy.shouldHaveTableRows(10); // Număr default per pagină

    // 3. Căutare utilizator
    cy.filterTable('test-user-wallet');
    cy.shouldHaveTableRows(1);
    cy.get('[data-cy=user-row]')
      .should('contain', 'test-user-wallet');

    // 4. Modificare credite
    cy.get('[data-cy=modify-credits-button]').click();
    cy.shouldShowModal('Modificare Credite');

    // Completare formular
    cy.get('[data-cy=credit-amount]').type('50');
    cy.get('[data-cy=credit-reason]').type('Bonus pentru testare');
    cy.get('[data-cy=submit-credits]').click();

    // Verifică succes
    cy.shouldShowToast('Creditele au fost actualizate cu succes');

    // Verifică actualizare în tabel
    cy.get('[data-cy=user-credits]')
      .should('contain', '150'); // 100 inițial + 50 adăugat

    // 5. Verificare audit log
    cy.navigateAdminSection('system');
    cy.get('[data-cy=audit-tab]').click();

    // Verifică log modificare credite
    cy.get('[data-cy=audit-log]')
      .should('contain', 'USER_CREDIT_MODIFY')
      .and('contain', 'test-user-wallet')
      .and('contain', '50')
      .and('contain', 'Bonus pentru testare');

    // 6. Verificare statistici
    cy.navigateAdminSection('stats');

    // Verifică total credite actualizat
    cy.get('[data-cy=total-credits-stat]')
      .should('contain', '150');

    // 7. Filtrare și paginare
    cy.navigateAdminSection('users');

    // Reset filtru
    cy.get('[data-cy=clear-filter]').click();
    cy.shouldHaveTableRows(10);

    // Test paginare
    cy.get('[data-cy=next-page]').click();
    cy.url().should('include', 'page=2');
    cy.shouldHaveTableRows(5); // Presupunem 15 utilizatori total
  });

  it('should handle validation and errors', () => {
    // Conectare ca admin
    cy.connectAsAdmin();
    cy.navigateAdminSection('users');

    // 1. Validare sumă negativă
    cy.get('[data-cy=modify-credits-button]').first().click();
    cy.get('[data-cy=credit-amount]').type('-50');
    cy.get('[data-cy=submit-credits]').click();

    cy.shouldShowValidation('amount', 'Suma nu poate fi negativă');

    // 2. Validare motiv lipsă
    cy.get('[data-cy=credit-amount]').clear().type('50');
    cy.get('[data-cy=submit-credits]').click();

    cy.shouldShowValidation('reason', 'Motivul este obligatoriu');

    // 3. Network error
    cy.get('[data-cy=credit-amount]').clear().type('50');
    cy.get('[data-cy=credit-reason]').type('Test');

    // Mock network error
    cy.mockNetworkError('POST', '/api/admin/users/*/credits');
    cy.get('[data-cy=submit-credits]').click();

    cy.shouldShowError('A apărut o eroare. Te rugăm să încerci din nou.');
  });

  it('should handle permissions correctly', () => {
    // 1. Conectare ca support admin (permisiuni limitate)
    cy.connectWallet('support-admin-wallet');

    // Verifică acces limitat
    cy.get('[data-cy=config-section]').should('not.exist');
    cy.get('[data-cy=system-section]').should('not.exist');

    // Verifică butoane dezactivate
    cy.navigateAdminSection('users');
    cy.get('[data-cy=modify-credits-button]')
      .should('be.disabled')
      .and('have.attr', 'title', 'Nu ai permisiunea necesară');
  });

  it('should be responsive', () => {
    cy.connectAsAdmin();
    cy.navigateAdminSection('users');

    // Test pe mobile
    cy.checkResponsive('mobile');
    
    // Verifică tabel responsiv
    cy.get('[data-cy=users-table]')
      .should('have.css', 'overflow-x', 'auto');
    
    // Verifică că coloanele mai puțin importante sunt ascunse
    cy.get('[data-cy=created-at-column]')
      .should('not.be.visible');

    // Test pe tablet
    cy.checkResponsive('tablet');
    
    // Verifică layout adaptat
    cy.get('[data-cy=users-table]')
      .should('have.css', 'overflow-x', 'visible');
    
    // Verifică că toate coloanele sunt vizibile
    cy.get('[data-cy=created-at-column]')
      .should('be.visible');

    // Test pe desktop
    cy.checkResponsive('desktop');
    
    // Verifică layout complet
    cy.get('[data-cy=admin-sidebar]')
      .should('be.visible');
  });

  it('should handle bulk actions', () => {
    cy.connectAsAdmin();
    cy.navigateAdminSection('users');

    // Selectare multiplă
    cy.get('[data-cy=select-all]').click();
    cy.get('[data-cy=user-checkbox]:checked')
      .should('have.length', 10);

    // Acțiune bulk
    cy.get('[data-cy=bulk-action-select]')
      .select('add_credits');
    
    cy.get('[data-cy=bulk-amount]').type('10');
    cy.get('[data-cy=bulk-reason]')
      .type('Bonus bulk pentru toți utilizatorii');
    
    cy.get('[data-cy=apply-bulk-action]').click();

    // Verifică succes
    cy.shouldShowToast('Creditele au fost actualizate pentru 10 utilizatori');

    // Verifică audit log
    cy.navigateAdminSection('system');
    cy.get('[data-cy=audit-tab]').click();

    cy.get('[data-cy=audit-log]')
      .should('contain', 'BULK_CREDIT_MODIFY')
      .and('contain', '10 utilizatori')
      .and('contain', 'Bonus bulk');
  });
});
