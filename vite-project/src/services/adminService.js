import api from '../utils/axios';

class AdminService {
  // Autentificare
  static async verifyAdmin(publicKey) {
    const response = await api.post('/api/admin/auth/verify', { publicKey });
    return response.data;
  }

  // Utilizatori
  static async getUsers(page = 1, limit = 10, search = '') {
    const response = await api.get('/api/admin/users', {
      params: { page, limit, search }
    });
    return response.data;
  }

  static async getUserDetails(userId) {
    const response = await api.get(`/api/admin/users/${userId}`);
    return response.data;
  }

  static async modifyUserCredits(userId, amount, reason) {
    const response = await api.post(`/api/admin/users/${userId}/credits`, {
      amount,
      reason
    });
    return response.data;
  }

  // Configurări
  static async getConfig(category = '') {
    const response = await api.get('/api/admin/config', {
      params: { category }
    });
    return response.data;
  }

  static async updateConfig(key, value) {
    const response = await api.put('/api/admin/config', {
      key,
      value
    });
    return response.data;
  }

  // Configurări AI
  static async getAIConfig() {
    const response = await api.get('/api/admin/ai/config');
    return response.data;
  }

  static async updateAIConfig(config) {
    const response = await api.put('/api/admin/ai/config', config);
    return response.data;
  }

  // Statistici
  static async getStatsOverview() {
    const response = await api.get('/api/admin/stats/overview');
    return response.data;
  }

  static async getUserStats() {
    const response = await api.get('/api/admin/stats/users');
    return response.data;
  }

  static async getTransactionStats() {
    const response = await api.get('/api/admin/stats/transactions');
    return response.data;
  }

  static async getWishStats() {
    const response = await api.get('/api/admin/stats/wishes');
    return response.data;
  }

  // Loguri
  static async getLogs(page = 1, limit = 50) {
    const response = await api.get('/api/admin/logs', {
      params: { page, limit }
    });
    return response.data;
  }

  static async getAuditLogs(page = 1, limit = 50, action = '') {
    const response = await api.get('/api/admin/logs/audit', {
      params: { page, limit, action }
    });
    return response.data;
  }

  // Helpers
  static handleError(error) {
    console.error('Admin service error:', error);
    
    if (error.response) {
      // Eroare de la server
      throw new Error(error.response.data.error || 'Server error');
    } else if (error.request) {
      // Eroare de rețea
      throw new Error('Network error');
    } else {
      // Altă eroare
      throw error;
    }
  }

  // Wrapper pentru request-uri cu error handling
  static async request(method, ...args) {
    try {
      return await method.apply(this, args);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Adaugă wrapper pentru toate metodele
Object.getOwnPropertyNames(AdminService)
  .filter(prop => typeof AdminService[prop] === 'function' && prop !== 'handleError' && prop !== 'request')
  .forEach(methodName => {
    const originalMethod = AdminService[methodName];
    AdminService[methodName] = (...args) => AdminService.request(originalMethod, ...args);
  });

export default AdminService;
