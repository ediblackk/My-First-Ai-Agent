const mongoose = require('mongoose');

module.exports = async () => {
  // Închidere conexiune MongoDB
  await mongoose.disconnect();

  // Oprire server MongoDB în memorie
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }

  // Curățare mocks
  global.mockOpenRouterApi = null;
  global.mockJwt = null;

  // Resetare variabile de mediu
  delete process.env.JWT_SECRET;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.ADMIN_WALLET_ADDRESS;
  delete process.env.PRIZE_POOL_PERCENTAGE;
};
