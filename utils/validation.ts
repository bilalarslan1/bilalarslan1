// XSS koruması için input temizleme
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Coin sembolü doğrulama
export const validateCoinSymbol = (symbol: string): boolean => {
  // Sadece harf ve rakamlardan oluşan 2-10 karakter uzunluğunda semboller
  const symbolRegex = /^[A-Za-z0-9]{2,10}$/;
  return symbolRegex.test(symbol);
};

// API endpoint doğrulama
export const validateEndpoint = (endpoint: string): boolean => {
  const validEndpoints = [
    'search',
    'coins/list',
    'coins',
    'simple/price',
    'market_chart',
    'ohlc'
  ];
  return validEndpoints.some(valid => endpoint.startsWith(valid));
};

// URL parametrelerini doğrulama
export const validateQueryParams = (params: string): boolean => {
  // Sadece izin verilen parametrelere izin ver
  const allowedParams = [
    'vs_currency',
    'days',
    'interval',
    'localization',
    'tickers',
    'market_data',
    'community_data',
    'developer_data',
    'sparkline'
  ];

  const queryParams = new URLSearchParams(params);
  const entries = Array.from(queryParams.entries());
  for (const [key] of entries) {
    if (!allowedParams.includes(key)) {
      return false;
    }
  }
  return true;
};

// API yanıtlarını doğrulama
export const validateApiResponse = (data: any): boolean => {
  // Temel veri yapısını kontrol et
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Hata yanıtlarını kontrol et
  if (data.error) {
    return false;
  }

  return true;
}; 