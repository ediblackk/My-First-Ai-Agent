exports.validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'API key is required' 
    });
  }

  // Get the API key from environment variables
  const validApiKey = process.env.AI_SERVICE_API_KEY;

  if (!validApiKey) {
    console.error('AI_SERVICE_API_KEY is not set in environment variables');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid API key' 
    });
  }

  next();
};
