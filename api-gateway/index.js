const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// API yapılandırması
const COINGECKO_BASE_URL = 'https://pro-api.coingecko.com/api/v3';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Rate limiting için basit bir middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // Her IP için maksimum istek sayısı
});

app.use(limiter);

// OpenAI proxy endpoint'i
app.post('/api/openai/chat/completions', async (req, res) => {
  try {
    const response = await axios.post(`${OPENAI_BASE_URL}/chat/completions`, req.body, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'OpenAI API error',
      details: error.response?.data || error.message
    });
  }
});

// CoinGecko search endpoint'i
app.get('/api/coingecko/search', async (req, res) => {
  try {
    const { query } = req.query;
    const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-cg-pro-api-key': COINGECKO_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('CoinGecko Search API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'CoinGecko Search API error',
      details: error.response?.data || error.message
    });
  }
});

// Genel CoinGecko proxy endpoint'i
app.get('/api/coingecko/:endpoint(*)', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const queryParams = new URLSearchParams(req.query).toString();
    const url = `${COINGECKO_BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-cg-pro-api-key': COINGECKO_API_KEY
      }
    });

    // Rate limit bilgilerini header'lara ekle
    res.set({
      'x-ratelimit-limit': response.headers['x-ratelimit-limit'] || '',
      'x-ratelimit-remaining': response.headers['x-ratelimit-remaining'] || '',
      'x-ratelimit-reset': response.headers['x-ratelimit-reset'] || ''
    });

    res.json(response.data);
  } catch (error) {
    console.error('CoinGecko API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'CoinGecko API error',
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
}); 