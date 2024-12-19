const aiService = require('../../services/aiService');
const NodeCache = require('node-cache');

// Mock pentru axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })
}));

describe('AI Service', () => {
  let mockApi;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock responses
    mockApi = {
      post: jest.fn(),
      get: jest.fn()
    };

    // Mock successful responses
    mockApi.post.mockImplementation((endpoint) => {
      if (endpoint === '/chat/completions') {
        return Promise.resolve({
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  complexity: 5,
                  categories: ['Test'],
                  challenges: ['Challenge'],
                  suggestions: ['Suggestion'],
                  resources: {
                    timeEstimate: '1 day',
                    skillsRequired: ['Skill'],
                    toolsNeeded: ['Tool']
                  }
                })
              }
            }],
            usage: {
              total_tokens: 100
            }
          }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('analyzeWish', () => {
    it('should analyze a wish successfully', async () => {
      const wishContent = 'Test wish';
      const analysis = await aiService.analyzeWish(wishContent);

      expect(analysis).toBeDefined();
      expect(analysis.complexity).toBe(5);
      expect(analysis.categories).toContain('Test');
      expect(analysis.challenges).toContain('Challenge');
      expect(analysis.suggestions).toContain('Suggestion');
      expect(analysis.resources).toBeDefined();
      expect(analysis.resources.timeEstimate).toBe('1 day');
    });

    it('should use cache for repeated analysis', async () => {
      const wishContent = 'Test wish';
      
      // Prima analiză
      const analysis1 = await aiService.analyzeWish(wishContent);
      
      // A doua analiză - ar trebui să vină din cache
      const analysis2 = await aiService.analyzeWish(wishContent);

      expect(analysis1).toEqual(analysis2);
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const wishContent = 'Test wish';
      
      // Setup mock să eșueze o dată apoi să reușească
      mockApi.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  complexity: 5,
                  categories: ['Test'],
                  challenges: ['Challenge'],
                  suggestions: ['Suggestion'],
                  resources: {
                    timeEstimate: '1 day',
                    skillsRequired: ['Skill'],
                    toolsNeeded: ['Tool']
                  }
                })
              }
            }],
            usage: { total_tokens: 100 }
          }
        });

      const analysis = await aiService.analyzeWish(wishContent);

      expect(analysis).toBeDefined();
      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });

    it('should fall back to simpler model on failure', async () => {
      const wishContent = 'Test wish';
      
      // Setup mock să eșueze cu modelul principal
      mockApi.post
        .mockRejectedValueOnce(new Error('Model overloaded'))
        .mockResolvedValueOnce({
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  complexity: 3,
                  categories: ['Simple'],
                  challenges: ['Basic Challenge'],
                  suggestions: ['Basic Suggestion'],
                  resources: {
                    timeEstimate: '1 hour',
                    skillsRequired: ['Basic Skill'],
                    toolsNeeded: ['Basic Tool']
                  }
                })
              }
            }],
            usage: { total_tokens: 50 }
          }
        });

      const analysis = await aiService.analyzeWish(wishContent);

      expect(analysis).toBeDefined();
      expect(analysis.complexity).toBe(3);
      expect(mockApi.post).toHaveBeenCalledTimes(2);
      expect(mockApi.post.mock.calls[1][0]).toContain('fallback');
    });
  });

  describe('generateSolution', () => {
    const mockAnalysis = {
      complexity: 5,
      challenges: ['Challenge 1', 'Challenge 2']
    };

    it('should generate a solution successfully', async () => {
      const wishContent = 'Test wish';
      
      mockApi.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                steps: [{
                  order: 1,
                  description: 'Step 1',
                  timeEstimate: '1 day',
                  dependencies: []
                }],
                timeline: '1 week',
                resources: ['Resource 1'],
                risks: [{
                  description: 'Risk 1',
                  mitigation: 'Mitigation 1'
                }],
                successCriteria: ['Criteria 1']
              })
            }
          }],
          usage: { total_tokens: 150 }
        }
      });

      const solution = await aiService.generateSolution(
        wishContent,
        mockAnalysis.complexity,
        mockAnalysis.challenges
      );

      expect(solution).toBeDefined();
      expect(solution.steps).toHaveLength(1);
      expect(solution.timeline).toBe('1 week');
      expect(solution.risks).toHaveLength(1);
    });

    it('should use cache for repeated solutions', async () => {
      const wishContent = 'Test wish';
      
      // Prima generare
      const solution1 = await aiService.generateSolution(
        wishContent,
        mockAnalysis.complexity,
        mockAnalysis.challenges
      );
      
      // A doua generare - ar trebui să vină din cache
      const solution2 = await aiService.generateSolution(
        wishContent,
        mockAnalysis.complexity,
        mockAnalysis.challenges
      );

      expect(solution1).toEqual(solution2);
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON responses', async () => {
      const wishContent = 'Test wish';
      
      mockApi.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: 'Invalid JSON'
            }
          }]
        }
      });

      await expect(aiService.analyzeWish(wishContent))
        .rejects
        .toThrow('Invalid response format');
    });

    it('should handle rate limiting', async () => {
      const wishContent = 'Test wish';
      
      mockApi.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      });

      await expect(aiService.analyzeWish(wishContent))
        .rejects
        .toThrow('Rate limit exceeded');
    });

    it('should handle network errors', async () => {
      const wishContent = 'Test wish';
      
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(aiService.analyzeWish(wishContent))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('Cache Management', () => {
    it('should respect cache TTL', async () => {
      const wishContent = 'Test wish';
      
      // Override cache TTL pentru test
      const cache = new NodeCache({ stdTTL: 1 }); // 1 secundă
      aiService.cache = cache;

      // Prima analiză
      const analysis1 = await aiService.analyzeWish(wishContent);
      
      // Așteptare expirare cache
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // A doua analiză - ar trebui să facă un nou request
      const analysis2 = await aiService.analyzeWish(wishContent);

      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });

    it('should handle cache overflow', async () => {
      // Override cache size pentru test
      const cache = new NodeCache({ maxKeys: 2 });
      aiService.cache = cache;

      // Generare multiple analize
      await aiService.analyzeWish('Wish 1');
      await aiService.analyzeWish('Wish 2');
      await aiService.analyzeWish('Wish 3');

      // Verificare că cea mai veche analiză a fost eliminată
      const analysis1 = await aiService.analyzeWish('Wish 1');
      expect(mockApi.post).toHaveBeenCalledTimes(4);
    });
  });
});
