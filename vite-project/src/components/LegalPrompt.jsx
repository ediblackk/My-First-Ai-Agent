import React, { useState } from 'react';

const LegalPrompt = ({ onAccept, onDecline }) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100;
    if (bottom) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bun venit în Make-A-Wish!
          </h2>
        </div>

        {/* Content */}
        <div 
          className="p-6 max-h-[60vh] overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-lg">
              Înainte de a începe, vă rugăm să citiți și să acceptați următoarele condiții:
            </p>

            <section className="space-y-4">
              <h3 className="font-semibold">Termeni și Condiții</h3>
              <p>
                Prin utilizarea platformei noastre, sunteți de acord să respectați termenii și condițiile noastre de utilizare. 
                Acest joc implică tranzacții cu tokens și credite virtuale. Toate tranzacțiile sunt ireversibile și finale.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold">Politica de Confidențialitate și GDPR</h3>
              <p>
                Colectăm și procesăm date personale în conformitate cu GDPR. Acestea includ:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Adresa portofelului pentru identificare</li>
                <li>Istoricul tranzacțiilor și al dorințelor</li>
                <li>Date tehnice necesare funcționării platformei</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold">Cookies</h3>
              <p>
                Utilizăm cookies și tehnologii similare pentru:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Autentificare și menținerea sesiunii</li>
                <li>Preferințe și setări utilizator</li>
                <li>Analiză și îmbunătățirea serviciilor</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold">Responsabilitate</h3>
              <p>
                Participarea la joc este voluntară și pe propria răspundere. Nu ne asumăm responsabilitatea pentru:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pierderi cauzate de fluctuațiile pieței crypto</li>
                <li>Probleme tehnice ale rețelei Solana</li>
                <li>Erori în transmiterea dorințelor</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold">Reguli de Conduită</h3>
              <p>
                Ne rezervăm dreptul de a restricționa accesul utilizatorilor care:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Folosesc limbaj sau conținut inadecvat</li>
                <li>Încearcă să manipuleze sistemul</li>
                <li>Încalcă termenii și condițiile</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={onDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Nu Accept
            </button>
            <button
              onClick={onAccept}
              disabled={!hasScrolled}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                hasScrolled
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {hasScrolled ? 'Accept' : 'Vă rugăm citiți până la sfârșit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPrompt;
