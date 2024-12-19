// OpenRouter API
export const openRouter = {
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: 'openai/gpt-4',
  fallbackModel: 'openai/gpt-3.5-turbo',
  // Lista de modele disponibile
  models: [
    {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      description: 'Cel mai avansat model, recomandat pentru sarcini complexe',
      maxTokens: 4000,
      costPer1kTokens: 0.03
    },
    {
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Model rapid și eficient pentru sarcini generale',
      maxTokens: 4000,
      costPer1kTokens: 0.001
    },
    {
      id: 'anthropic/claude-2',
      name: 'Claude 2',
      description: 'Model avansat cu capacități de analiză și raționament',
      maxTokens: 100000,
      costPer1kTokens: 0.01
    }
  ]
};

// Configurări pentru procesarea dorințelor
export const wishProcessing = {
  // Prompt template pentru analiza dorințelor
  analyzePrompt: `Analizează următoarea dorință și oferă:
1. Evaluare complexitate (1-10)
2. Categorii relevante
3. Potențiale provocări
4. Sugestii de implementare
5. Estimare resurse necesare

Dorința: {wishContent}

Răspunde în format JSON cu următoarea structură:
{
  "complexity": number,
  "categories": string[],
  "challenges": string[],
  "suggestions": string[],
  "resources": {
    "timeEstimate": string,
    "skillsRequired": string[],
    "toolsNeeded": string[]
  }
}`,

  // Prompt template pentru generare soluții
  solutionPrompt: `Generează o soluție detaliată pentru următoarea dorință:

Dorința: {wishContent}
Complexitate: {complexity}
Provocări identificate: {challenges}

Oferă un plan de acțiune structurat care să includă:
1. Pași specifici de implementare
2. Timeline estimativ
3. Resurse necesare
4. Potențiale riscuri și cum să le mitigăm
5. Criterii de succes

Răspunde în format JSON cu următoarea structură:
{
  "steps": [
    {
      "order": number,
      "description": string,
      "timeEstimate": string,
      "dependencies": string[]
    }
  ],
  "timeline": string,
  "resources": string[],
  "risks": [
    {
      "description": string,
      "mitigation": string
    }
  ],
  "successCriteria": string[]
}`
};

// Rate limiting și caching
export const rateLimit = {
  windowMs: 60 * 1000, // 1 minut
  maxRequests: 60      // Requests per window
};

export const cache = {
  ttl: 24 * 60 * 60,  // 24 ore
  maxSize: 1000       // Număr maxim de intrări în cache
};

// Retry logic pentru request-uri eșuate
export const retry = {
  attempts: 3,
  delay: 1000,    // ms
  backoff: 2      // Factor multiplicativ pentru delay între încercări
};

// Timeout-uri
export const timeouts = {
  request: 30000,     // 30 secunde
  analysis: 45000,    // 45 secunde
  solution: 60000     // 60 secunde
};

// Logging
export const logging = {
  // Nivel de logging
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // Ce să se logheze
  include: {
    requests: true,     // Request-uri către OpenRouter
    responses: true,    // Răspunsuri de la OpenRouter
    errors: true,       // Erori
    performance: true,  // Metrici de performanță
    usage: true        // Utilizare tokeni și costuri
  },

  // Unde să se salveze log-urile
  destination: {
    console: true,      // Log în consolă
    file: true,        // Log în fișier
    database: true     // Log în baza de date
  },

  // Rotație log-uri
  rotation: {
    maxSize: '100m',    // Mărime maximă fișier
    maxFiles: '14d',    // Păstrare log-uri pentru 14 zile
    compress: true     // Compresie fișiere vechi
  }
};
