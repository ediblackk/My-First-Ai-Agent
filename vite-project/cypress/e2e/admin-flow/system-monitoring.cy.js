describe('Admin System Monitoring Flow', () => {
  beforeEach(() => {
    // Reset și seed database
    cy.task('db:seed');
    
    // Vizitează homepage
    cy.visit('/');
    
    // Conectare ca admin
    cy.connectAsAdmin();
  });

  it('should monitor system stats and metrics', () => {
    // 1. Verificare statistici generale
    cy.navigateAdminSection('stats');

    // Verifică prezența tuturor cardurilor de statistici
    cy.get('[data-cy=stats-grid]').within(() => {
      cy.get('[data-cy=total-users]').should('be.visible');
      cy.get('[data-cy=active-users]').should('be.visible');
      cy.get('[data-cy=total-wishes]').should('be.visible');
      cy.get('[data-cy=total-credits]').should('be.visible');
    });

    // 2. Verificare grafice
    cy.get('[data-cy=users-chart]').should('be.visible');
    cy.get('[data-cy=wishes-chart]').should('be.visible');
    cy.get('[data-cy=credits-chart]').should('be.visible');

    // 3. Verificare auto-refresh
    cy.get('[data-cy=auto-refresh-toggle]').click();
    cy.get('[data-cy=refresh-interval]').select('10');

    // Verifică că datele se actualizează
    cy.wait(10000); // Așteaptă refresh
    cy.get('@apiGet').should('have.been.called');
  });

  it('should view and filter system logs', () => {
    // 1. Navigare la secțiunea System
    cy.navigateAdminSection('system');

    // 2. Verificare tab-uri
    cy.get('[data-cy=system-tabs]').within(() => {
      cy.contains('Loguri Sistem').should('be.visible');
      cy.contains('Audit Trail').should('be.visible');
    });

    // 3. Filtrare loguri sistem
    cy.get('[data-cy=log-filter]').type('ERROR');
    cy.get('[data-cy=log-entries]').should('contain', 'ERROR');

    // 4. Verificare detalii log
    cy.get('[data-cy=log-entry]').first().click();
    cy.get('[data-cy=log-details]').should('be.visible');

    // 5. Export loguri
    cy.get('[data-cy=export-logs]').click();
    cy.get('[data-cy=export-format]').select('CSV');
    cy.get('[data-cy=confirm-export]').click();
    
    // Verifică download
    cy.readFile('cypress/downloads/system-logs.csv')
      .should('exist');
  });

  it('should monitor audit trail', () => {
    cy.navigateAdminSection('system');
    
    // 1. Switch la tab Audit
    cy.get('[data-cy=audit-tab]').click();

    // 2. Filtrare după acțiune
    cy.get('[data-cy=audit-filter]').select('USER_CREDIT_MODIFY');
    cy.get('[data-cy=audit-entries]')
      .should('contain', 'USER_CREDIT_MODIFY');

    // 3. Filtrare după admin
    cy.get('[data-cy=admin-filter]').type('admin-wallet');
    cy.get('[data-cy=audit-entries]')
      .should('contain', 'admin-wallet');

    // 4. Filtrare după dată
    const today = new Date().toISOString().split('T')[0];
    cy.get('[data-cy=date-filter]').type(today);
    cy.get('[data-cy=audit-entries]')
      .should('contain', today);
  });

  it('should handle real-time monitoring', () => {
    cy.navigateAdminSection('system');

    // 1. Activare monitorizare real-time
    cy.get('[data-cy=realtime-toggle]').click();

    // 2. Simulare evenimente noi
    cy.window().then((win) => {
      // Simulare WebSocket message
      win.postMessage({
        type: 'NEW_LOG',
        data: {
          level: 'ERROR',
          message: 'Test error message',
          timestamp: new Date().toISOString()
        }
      }, '*');
    });

    // 3. Verificare actualizare automată
    cy.get('[data-cy=log-entries]')
      .should('contain', 'Test error message');

    // 4. Verificare notificări
    cy.get('[data-cy=notifications]')
      .should('contain', 'Eroare nouă detectată');
  });

  it('should manage system alerts', () => {
    cy.navigateAdminSection('system');

    // 1. Configurare alerte
    cy.get('[data-cy=alerts-config]').click();
    
    // Adăugare alertă nouă
    cy.get('[data-cy=add-alert]').click();
    cy.get('[data-cy=alert-type]').select('ERROR_RATE');
    cy.get('[data-cy=threshold]').type('5');
    cy.get('[data-cy=interval]').type('10');
    cy.get('[data-cy=save-alert]').click();

    // 2. Simulare declanșare alertă
    cy.window().then((win) => {
      // Simulare multiple erori
      for (let i = 0; i < 6; i++) {
        win.postMessage({
          type: 'NEW_LOG',
          data: {
            level: 'ERROR',
            message: `Error ${i}`,
            timestamp: new Date().toISOString()
          }
        }, '*');
      }
    });

    // 3. Verificare alertă
    cy.get('[data-cy=alert-notification]')
      .should('contain', 'Rată de erori ridicată');
  });

  it('should be responsive', () => {
    cy.navigateAdminSection('system');

    // Test pe mobile
    cy.checkResponsive('mobile');
    
    // Verifică layout adaptat
    cy.get('[data-cy=log-table]')
      .should('have.css', 'overflow-x', 'auto');
    
    // Verifică că coloanele mai puțin importante sunt ascunse
    cy.get('[data-cy=log-details-column]')
      .should('not.be.visible');

    // Test pe tablet
    cy.checkResponsive('tablet');
    
    // Verifică că graficele sunt responsive
    cy.get('[data-cy=stats-chart]')
      .should('have.attr', 'width')
      .and('match', /^(768|100%)$/);

    // Test pe desktop
    cy.checkResponsive('desktop');
    
    // Verifică layout complet
    cy.get('[data-cy=system-grid]')
      .should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');
  });

  it('should handle errors gracefully', () => {
    cy.navigateAdminSection('system');

    // 1. Error la încărcare loguri
    cy.mockNetworkError('GET', '/api/admin/logs');
    cy.reload();
    
    cy.shouldShowError('Nu s-au putut încărca logurile');
    cy.get('[data-cy=retry-button]').should('be.visible');

    // 2. Error la export
    cy.get('[data-cy=export-logs]').click();
    cy.mockNetworkError('POST', '/api/admin/logs/export');
    cy.get('[data-cy=confirm-export]').click();
    
    cy.shouldShowError('Export eșuat');

    // 3. Error la configurare alertă
    cy.get('[data-cy=alerts-config]').click();
    cy.get('[data-cy=add-alert]').click();
    cy.mockNetworkError('POST', '/api/admin/alerts');
    cy.get('[data-cy=save-alert]').click();
    
    cy.shouldShowError('Nu s-a putut salva alerta');
  });
});
