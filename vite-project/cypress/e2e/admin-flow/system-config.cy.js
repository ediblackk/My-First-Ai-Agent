describe('Admin System Configuration Flow', () => {
  beforeEach(() => {
    // Reset și seed database
    cy.task('db:seed');
    
    // Vizitează homepage
    cy.visit('/');
    
    // Conectare ca admin
    cy.connectAsAdmin();
  });

  it('should manage AI configuration', () => {
    // 1. Navigare la secțiunea Config
    cy.navigateAdminSection('config');

    // Filtrare configurări AI
    cy.get('[data-cy=config-filter]')
      .select('AI');

    // 2. Modificare model AI
    cy.updateConfig('AI_MODEL', 'gpt-3.5-turbo');
    cy.shouldShowToast('Configurare actualizată cu succes');

    // Verifică audit log
    cy.navigateAdminSection('system');
    cy.get('[data-cy=audit-log]')
      .should('contain', 'CONFIG_CHANGE')
      .and('contain', 'AI_MODEL')
      .and('contain', 'gpt-3.5-turbo');

    // 3. Modificare tokens maximi
    cy.navigateAdminSection('config');
    cy.updateConfig('AI_MAX_TOKENS', '2000');

    // 4. Testare configurări noi
    cy.navigateAdminSection('users');
    
    // Creare dorință cu noile setări
    cy.get('[data-cy=impersonate-user]').first().click();
    cy.createWish('Test wish with new AI config');

    // Verifică că s-a folosit modelul nou
    cy.get('[data-cy=wish-details]')
      .should('contain', 'gpt-3.5-turbo');
  });

  it('should manage game configuration', () => {
    cy.navigateAdminSection('config');

    // Filtrare configurări GAME
    cy.get('[data-cy=config-filter]')
      .select('GAME');

    // 1. Modificare rate credite
    cy.updateConfig('GAME_CREDITS_RATE', '10');
    cy.shouldShowToast('Configurare actualizată cu succes');

    // 2. Verificare efect
    cy.navigateAdminSection('users');
    cy.get('[data-cy=impersonate-user]').first().click();
    
    // Deschide modal token
    cy.get('[data-cy=token-button]').click();
    
    // Verifică rata nouă
    cy.get('[data-cy=conversion-rate]')
      .should('contain', '1 SOL = 10 credite');
  });

  it('should manage security configuration', () => {
    cy.navigateAdminSection('config');

    // Filtrare configurări SECURITY
    cy.get('[data-cy=config-filter]')
      .select('SECURITY');

    // 1. Modificare limită dorințe active
    cy.updateConfig('SECURITY_MAX_WISHES', '5');
    
    // 2. Testare limită
    cy.navigateAdminSection('users');
    cy.get('[data-cy=impersonate-user]').first().click();

    // Creare dorințe până la limită
    for (let i = 0; i < 5; i++) {
      cy.createWish(`Test wish ${i + 1}`);
    }

    // Verifică că nu mai poate crea
    cy.get('[data-cy=create-wish-button]').click();
    cy.shouldShowError('Ai atins limita maximă de dorințe active');
  });

  it('should validate configuration values', () => {
    cy.navigateAdminSection('config');

    // 1. Validare valoare numerică
    cy.get('[data-cy=edit-config-GAME_CREDITS_RATE]').click();
    cy.get('[data-cy=config-value]').clear().type('invalid');
    cy.get('[data-cy=save-config]').click();

    cy.shouldShowValidation('value', 'Valoarea trebuie să fie un număr');

    // 2. Validare valoare negativă
    cy.get('[data-cy=config-value]').clear().type('-5');
    cy.get('[data-cy=save-config]').click();

    cy.shouldShowValidation('value', 'Valoarea trebuie să fie pozitivă');

    // 3. Validare model AI invalid
    cy.get('[data-cy=edit-config-AI_MODEL]').click();
    cy.get('[data-cy=config-value]').clear().type('invalid-model');
    cy.get('[data-cy=save-config]').click();

    cy.shouldShowValidation('value', 'Model AI invalid');
  });

  it('should handle bulk configuration updates', () => {
    cy.navigateAdminSection('config');

    // 1. Selectare multiplă
    cy.get('[data-cy=select-configs]').click();
    cy.get('[data-cy=bulk-action-select]')
      .select('reset_defaults');

    // 2. Confirmare reset
    cy.get('[data-cy=confirm-bulk-action]').click();
    cy.get('[data-cy=confirm-dialog]')
      .should('contain', 'Această acțiune va reseta toate configurările selectate')
      .find('[data-cy=confirm-button]')
      .click();

    // 3. Verificare reset
    cy.shouldShowToast('Configurările au fost resetate cu succes');

    // 4. Verificare audit log
    cy.navigateAdminSection('system');
    cy.get('[data-cy=audit-log]')
      .should('contain', 'BULK_CONFIG_RESET');
  });

  it('should be responsive', () => {
    // Test pe mobile
    cy.checkResponsive('mobile');
    cy.navigateAdminSection('config');

    // Verifică layout adaptat
    cy.get('[data-cy=config-grid]')
      .should('have.css', 'grid-template-columns', '1fr');

    // Verifică că acțiunile sunt în dropdown
    cy.get('[data-cy=config-actions]')
      .should('have.css', 'position', 'absolute');

    // Test pe tablet
    cy.checkResponsive('tablet');
    
    // Verifică grid cu 2 coloane
    cy.get('[data-cy=config-grid]')
      .should('have.css', 'grid-template-columns', 'repeat(2, 1fr)');

    // Test pe desktop
    cy.checkResponsive('desktop');
    
    // Verifică grid cu 3 coloane
    cy.get('[data-cy=config-grid]')
      .should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');
  });

  it('should handle errors gracefully', () => {
    cy.navigateAdminSection('config');

    // 1. Network error la salvare
    cy.mockNetworkError('PUT', '/api/admin/config');
    
    cy.updateConfig('GAME_CREDITS_RATE', '10');
    cy.shouldShowError('A apărut o eroare. Te rugăm să încerci din nou.');

    // 2. Error la încărcare configurări
    cy.reload();
    cy.mockNetworkError('GET', '/api/admin/config');
    
    cy.shouldShowError('Nu s-au putut încărca configurările');
    cy.get('[data-cy=retry-button]').should('be.visible');

    // 3. Retry success
    cy.intercept('GET', '/api/admin/config', {
      statusCode: 200,
      body: { success: true, configs: [] }
    });
    
    cy.get('[data-cy=retry-button]').click();
    cy.get('[data-cy=config-grid]').should('be.visible');
  });
});
