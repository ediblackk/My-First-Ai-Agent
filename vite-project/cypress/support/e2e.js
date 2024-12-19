// Import comenzi
import './commands';

// Configurare pentru intercept requests
Cypress.on('window:before:load', (win) => {
  // Stub pentru localStorage
  let storage = {};
  win.localStorage.setItem = (key, value) => storage[key] = value;
  win.localStorage.getItem = (key) => storage[key];
  win.localStorage.removeItem = (key) => delete storage[key];
  win.localStorage.clear = () => storage = {};
});

// Configurare pentru Solana Wallet
Cypress.on('window:before:load', (win) => {
  win.solana = {
    isPhantom: true,
    connect: cy.stub().resolves(),
    disconnect: cy.stub().resolves(),
    signMessage: cy.stub().resolves(new Uint8Array([1, 2, 3])),
    signTransaction: cy.stub().resolves(new Uint8Array([1, 2, 3])),
    publicKey: {
      toString: () => Cypress.env('WALLET_ADDRESS') || 'test-wallet-address'
    }
  };
});

// Supress uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returnând false aici previne Cypress să eșueze testul
  return false;
});

// Configurare pentru network requests
beforeEach(() => {
  // Reset interceptors
  cy.intercept('GET', '/api/**').as('apiGet');
  cy.intercept('POST', '/api/**').as('apiPost');
  cy.intercept('PUT', '/api/**').as('apiPut');
  cy.intercept('DELETE', '/api/**').as('apiDelete');
});

// Configurare pentru screenshots
afterEach(function() {
  if (this.currentTest.state === 'failed') {
    Cypress.runner.stop();
  }
});

// Configurare pentru viewport
beforeEach(() => {
  // Reset viewport la desktop
  cy.viewport(1280, 720);
});

// Configurare pentru cookies
beforeEach(() => {
  // Preservă cookies între teste
  Cypress.Cookies.preserveOnce('session_id', 'remember_token');
});

// Configurare pentru retry-uri
Cypress.Commands.add('waitForResponse', (alias, timeout = 10000) => {
  return cy.wait(alias, { timeout });
});

// Configurare pentru assertions
chai.config.truncateThreshold = 0; // Disable string truncation
chai.config.includeStack = true; // Include stack traces

// Adaugă custom assertions
chai.Assertion.addMethod('containClass', function(className) {
  const obj = this._obj;
  const classes = obj.attr('class').split(' ');
  this.assert(
    classes.includes(className),
    `expected #{this} to contain class '${className}'`,
    `expected #{this} not to contain class '${className}'`,
    className,
    classes.join(' ')
  );
});
