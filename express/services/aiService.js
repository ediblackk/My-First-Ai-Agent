import axios from 'axios';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';
import { cache, openRouter, logging, retry, rateLimit as rateLimitConfig, timeouts, wishProcessing } from '../config/aiConfig.js';
import { Config } from '../models/config.js';

class AIService {
  constructor() {
    // Inițializare cache
    this.cache = new NodeCache({
      stdTTL: cache.ttl,
      maxKeys: cache.maxSize,
      checkperiod: 600 // Verificare cache la fiecare 10 minute
    });

    // Inițializare axios instance pentru OpenRouter
    this.api = axios.create({
      baseURL: openRouter.baseUrl,
      headers: {
        'Authorization': `Bearer ${openRouter.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: timeouts.request
    });

    // Adăugare interceptors pentru logging
    this.setupInterceptors();
  }

  // Configurare logging pentru request/response
  setupInterceptors() {
    if (logging.include.requests) {
      this.api.interceptors.request.use(
        (config) => {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] OpenRouter Request:`, {
            url: config.url,
            method: config.method,
            model: config.data?.model,
            prompt: config.data?.messages?.[0]?.content?.substring(0, 100) + '...'
          });
          return config;
        },
        (error) => {
          console.error('OpenRouter Request Error:', error);
          return Promise.reject(error);
        }
      );
    }

    if (logging.include.responses) {
      this.api.interceptors.response.use(
        (response) => {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] OpenRouter Response:`, {
            status: response.status,
            model: response.data?.model,
            usage: response.data?.usage
          });
          return response;
        },
        (error) => {
          console.error('OpenRouter Response Error:', error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    }
  }

  // Implementare retry logic
  async retryRequest(fn, attempts = retry.attempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        const delay = retry.delay * Math.pow(retry.backoff, i);
        console.log(`Retry attempt ${i + 1}/${attempts} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Generare cache key
  generateCacheKey(type, content, model) {
    return `${type}:${model}:${content}`.substring(0, 250);
  }

  // Analiză dorință
  async analyzeWish(wishContent, model = openRouter.defaultModel) {
    const cacheKey = this.generateCacheKey('analyze', wishContent, model);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for wish analysis');
      return cached;
    }

    const prompt = wishProcessing.analyzePrompt.replace(
      '{wishContent}',
      wishContent
    );

    try {
      const response = await this.retryRequest(() => 
        this.api.post('/chat/completions', {
          model,
          messages: [
            { role: 'system', content: 'You are an AI assistant analyzing wishes.' },
            { role: 'user', content: prompt }
          ]
        })
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      this.cache.set(cacheKey, analysis);
      
      if (logging.include.usage) {
        console.log('Analysis tokens used:', response.data.usage);
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing wish:', error);
      
      // Încercare cu model fallback dacă e disponibil
      if (model !== openRouter.fallbackModel) {
        console.log('Retrying with fallback model');
        return this.analyzeWish(wishContent, openRouter.fallbackModel);
      }
      
      throw error;
    }
  }

  // Generare soluție
  async generateSolution(wishContent, complexity, challenges, model = openRouter.defaultModel) {
    const cacheKey = this.generateCacheKey('solution', wishContent, model);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for solution generation');
      return cached;
    }

    const prompt = wishProcessing.solutionPrompt
      .replace('{wishContent}', wishContent)
      .replace('{complexity}', complexity)
      .replace('{challenges}', JSON.stringify(challenges));

    try {
      const response = await this.retryRequest(() => 
        this.api.post('/chat/completions', {
          model,
          messages: [
            { role: 'system', content: 'You are an AI assistant generating solutions for wishes.' },
            { role: 'user', content: prompt }
          ]
        })
      );

      const solution = JSON.parse(response.data.choices[0].message.content);
      this.cache.set(cacheKey, solution);

      if (logging.include.usage) {
        console.log('Solution tokens used:', response.data.usage);
      }

      return solution;
    } catch (error) {
      console.error('Error generating solution:', error);
      
      // Încercare cu model fallback dacă e disponibil
      if (model !== openRouter.fallbackModel) {
        console.log('Retrying with fallback model');
        return this.generateSolution(wishContent, complexity, challenges, openRouter.fallbackModel);
      }
      
      throw error;
    }
  }

  // Obținere modele disponibile
  async getAvailableModels() {
    try {
      const response = await this.api.get('/models');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      return openRouter.models; // Returnare modele din config ca fallback
    }
  }

  // Actualizare configurare AI
  async updateConfig(updates) {
    try {
      for (const [key, value] of Object.entries(updates)) {
        await Config.updateConfig(key, value);
      }
      
      // Reîncărcare cache dacă e necesar
      if (updates.cache?.ttl) {
        this.cache.close();
        this.cache = new NodeCache({
          stdTTL: updates.cache.ttl,
          maxKeys: updates.cache.maxSize || cache.maxSize
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating AI config:', error);
      throw error;
    }
  }

  // Rate limiter pentru API
  static getRateLimiter() {
    return rateLimit({
      windowMs: rateLimitConfig.windowMs,
      max: rateLimitConfig.maxRequests,
      message: {
        success: false,
        error: 'Prea multe request-uri. Încercați din nou mai târziu.'
      }
    });
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;
