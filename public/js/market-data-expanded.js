// ═══════════════════════════════════════════════════════════
// ENHANCED MARKET DATA MODULE
// Comprehensive financial telemetry across multiple asset classes
// ═══════════════════════════════════════════════════════════

export const marketData = {
  
  // ────────────────────────────────────────────────────────
  // PRECIOUS METALS (Expanded)
  // ────────────────────────────────────────────────────────
  preciousMetals: {
    'Gold (XAU)': {
      symbol: 'XAU/USD',
      price: 2031.50,
      change: 0.8,
      high24h: 2045.20,
      low24h: 2018.30,
      unit: 'per troy oz',
      icon: '🥇'
    },
    'Silver (XAG)': {
      symbol: 'XAG/USD',
      price: 23.45,
      change: -0.3,
      high24h: 23.89,
      low24h: 23.12,
      unit: 'per troy oz',
      icon: '🥈'
    },
    'Platinum (XPT)': {
      symbol: 'XPT/USD',
      price: 912.30,
      change: 1.2,
      high24h: 925.10,
      low24h: 905.40,
      unit: 'per troy oz',
      icon: '⚪'
    },
    'Palladium (XPD)': {
      symbol: 'XPD/USD',
      price: 1043.70,
      change: -0.5,
      high24h: 1055.20,
      low24h: 1038.90,
      unit: 'per troy oz',
      icon: '⚫'
    },
    'Copper (HG)': {
      symbol: 'HG',
      price: 3.87,
      change: 0.4,
      high24h: 3.92,
      low24h: 3.84,
      unit: 'per lb',
      icon: '🟤'
    },
    'Aluminum': {
      symbol: 'ALU',
      price: 2.34,
      change: 0.2,
      high24h: 2.38,
      low24h: 2.31,
      unit: 'per kg',
      icon: '⚪'
    }
  },

  // ────────────────────────────────────────────────────────
  // MAJOR COUNTRY INDICES
  // ────────────────────────────────────────────────────────
  indices: {
    'United States': {
      'S&P 500': {
        symbol: 'SPX',
        value: 4783.45,
        change: 0.5,
        volume: '3.2B',
        marketCap: '42.5T'
      },
      'Dow Jones': {
        symbol: 'DJI',
        value: 37305.16,
        change: 0.3,
        volume: '412M',
        marketCap: '11.8T'
      },
      'NASDAQ': {
        symbol: 'IXIC',
        value: 14813.92,
        change: 0.7,
        volume: '5.1B',
        marketCap: '19.3T'
      },
      'Russell 2000': {
        symbol: 'RUT',
        value: 2034.58,
        change: 0.2,
        volume: '1.8B',
        marketCap: '3.2T'
      }
    },
    'India': {
      'NIFTY 50': {
        symbol: 'NSEI',
        value: 21731.40,
        change: 1.2,
        volume: '₹42,350Cr',
        marketCap: ''
      },
      'SENSEX': {
        symbol: 'BSESN',
        value: 72240.26,
        change: 1.1,
        volume: '₹6,543Cr',
        marketCap: '₹374L Cr'
      },
      'NIFTY Bank': {
        symbol: 'BANKNIFTY',
        value: 46923.30,
        change: 0.9,
        volume: '₹23,456Cr',
        marketCap: ''
      },
      'NIFTY IT': {
        symbol: 'CNXIT',
        value: 33245.75,
        change: 1.5,
        volume: '₹3,234Cr',
        marketCap: ''
      }
    },
    'United Kingdom': {
      'FTSE 100': {
        symbol: 'FTSE',
        value: 7733.25,
        change: -0.2,
        volume: '£2.1B',
        marketCap: '£2.0T'
      },
      'FTSE 250': {
        symbol: 'MCX',
        value: 19234.67,
        change: 0.1,
        volume: '£890M',
        marketCap: '£0.3T'
      }
    },
    'Japan': {
      'Nikkei 225': {
        symbol: 'N225',
        value: 33464.17,
        change: 0.8,
        volume: '¥3.2T',
        marketCap: '¥690T'
      },
      'TOPIX': {
        symbol: 'TPX',
        value: 2389.45,
        change: 0.6,
        volume: '¥2.8T',
        marketCap: '¥638T'
      }
    },
    'China': {
      'Shanghai Composite': {
        symbol: 'SSEC',
        value: 2974.93,
        change: -0.4,
        volume: '¥295B',
        marketCap: '¥65T'
      },
      'Hang Seng': {
        symbol: 'HSI',
        value: 16541.42,
        change: -0.6,
        volume: 'HK$112B',
        marketCap: 'HK$34T'
      },
      'CSI 300': {
        symbol: 'CSI300',
        value: 3498.23,
        change: -0.3,
        volume: '¥387B',
        marketCap: ''
      }
    },
    'Germany': {
      'DAX': {
        symbol: 'GDAXI',
        value: 16786.60,
        change: 0.4,
        volume: '€3.8B',
        marketCap: '€1.9T'
      }
    },
    'France': {
      'CAC 40': {
        symbol: 'FCHI',
        value: 7512.34,
        change: 0.3,
        volume: '€4.2B',
        marketCap: '€2.7T'
      }
    },
    'Canada': {
      'S&P/TSX': {
        symbol: 'GSPTSE',
        value: 21234.56,
        change: 0.2,
        volume: 'C$7.3B',
        marketCap: 'C$3.5T'
      }
    },
    'Australia': {
      'ASX 200': {
        symbol: 'AXJO',
        value: 7634.20,
        change: 0.5,
        volume: 'A$6.1B',
        marketCap: 'A$2.4T'
      }
    },
    'Brazil': {
      'BOVESPA': {
        symbol: 'BVSP',
        value: 126543.78,
        change: 0.7,
        volume: 'R$18B',
        marketCap: 'R$4.9T'
      }
    },
    'South Korea': {
      'KOSPI': {
        symbol: 'KS11',
        value: 2523.45,
        change: 0.4,
        volume: '₩8.7T',
        marketCap: '₩2,100T'
      }
    }
  },

  // ────────────────────────────────────────────────────────
  // CRYPTOCURRENCIES (Top 15)
  // ────────────────────────────────────────────────────────
  crypto: {
    'Bitcoin': {
      symbol: 'BTC',
      price: 43250,
      change: 2.3,
      marketCap: '846B',
      volume24h: '28.5B',
      icon: '₿'
    },
    'Ethereum': {
      symbol: 'ETH',
      price: 2287,
      change: 1.8,
      marketCap: '275B',
      volume24h: '15.2B',
      icon: 'Ξ'
    },
    'Binance Coin': {
      symbol: 'BNB',
      price: 312,
      change: -0.5,
      marketCap: '48B',
      volume24h: '1.3B',
      icon: '🅱'
    },
    'Solana': {
      symbol: 'SOL',
      price: 98,
      change: 5.2,
      marketCap: '42B',
      volume24h: '3.1B',
      icon: '◎'
    },
    'Cardano': {
      symbol: 'ADA',
      price: 0.52,
      change: 1.1,
      marketCap: '18B',
      volume24h: '542M',
      icon: '₳'
    },
    'XRP': {
      symbol: 'XRP',
      price: 0.61,
      change: 0.8,
      marketCap: '33B',
      volume24h: '1.8B',
      icon: '✕'
    },
    'Polkadot': {
      symbol: 'DOT',
      price: 7.23,
      change: -0.3,
      marketCap: '9.1B',
      volume24h: '287M',
      icon: '●'
    },
    'Avalanche': {
      symbol: 'AVAX',
      price: 36.50,
      change: 2.1,
      marketCap: '13.4B',
      volume24h: '612M',
      icon: '▲'
    },
    'Chainlink': {
      symbol: 'LINK',
      price: 14.87,
      change: 1.5,
      marketCap: '8.3B',
      volume24h: '534M',
      icon: '⬢'
    },
    'Polygon': {
      symbol: 'MATIC',
      price: 0.87,
      change: 3.2,
      marketCap: '8.1B',
      volume24h: '423M',
      icon: '⬡'
    },
    'Litecoin': {
      symbol: 'LTC',
      price: 72.45,
      change: 0.9,
      marketCap: '5.4B',
      volume24h: '387M',
      icon: 'Ł'
    },
    'Uniswap': {
      symbol: 'UNI',
      price: 6.23,
      change: 1.2,
      marketCap: '4.7B',
      volume24h: '198M',
      icon: '🦄'
    },
    'Toncoin': {
      symbol: 'TON',
      price: 2.34,
      change: 4.1,
      marketCap: '8.1B',
      volume24h: '134M',
      icon: '💎'
    },
    'Stellar': {
      symbol: 'XLM',
      price: 0.13,
      change: -0.7,
      marketCap: '3.7B',
      volume24h: '87M',
      icon: '✦'
    },
    'Cosmos': {
      symbol: 'ATOM',
      price: 10.56,
      change: 2.8,
      marketCap: '4.1B',
      volume24h: '223M',
      icon: '⚛'
    }
  },

  // ────────────────────────────────────────────────────────
  // FOREX PAIRS (Major + Cross)
  // ────────────────────────────────────────────────────────
  forex: {
    'EUR/USD': {
      rate: 1.0732,
      change: 0.15,
      high: 1.0748,
      low: 1.0718,
      volume: '$598B'
    },
    'GBP/USD': {
      rate: 1.2634,
      change: -0.08,
      high: 1.2652,
      low: 1.2619,
      volume: '$312B'
    },
    'USD/JPY': {
      rate: 149.83,
      change: 0.22,
      high: 150.12,
      low: 149.54,
      volume: '$458B'
    },
    'AUD/USD': {
      rate: 0.6512,
      change: 0.31,
      high: 0.6528,
      low: 0.6495,
      volume: '$134B'
    },
    'USD/CAD': {
      rate: 1.3521,
      change: -0.12,
      high: 1.3543,
      low: 1.3512,
      volume: '$178B'
    },
    'USD/CHF': {
      rate: 0.8834,
      change: 0.09,
      high: 0.8846,
      low: 0.8821,
      volume: '$198B'
    },
    'USD/CNY': {
      rate: 7.2145,
      change: 0.05,
      high: 7.2234,
      low: 7.2087,
      volume: '$287B'
    },
    'USD/INR': {
      rate: 83.12,
      change: -0.18,
      high: 83.28,
      low: 83.05,
      volume: '$45B'
    },
    'EUR/GBP': {
      rate: 0.8495,
      change: 0.23,
      high: 0.8512,
      low: 0.8478,
      volume: '$156B'
    },
    'EUR/JPY': {
      rate: 160.78,
      change: 0.37,
      high: 161.12,
      low: 160.45,
      volume: '$98B'
    }
  },

  // ────────────────────────────────────────────────────────
  // COMMODITIES (Energy, Agriculture, Metals)
  // ────────────────────────────────────────────────────────
  commodities: {
    // Energy
    'Crude Oil (WTI)': {
      price: 78.32,
      change: 1.2,
      unit: 'per barrel',
      category: 'energy',
      icon: '🛢️'
    },
    'Brent Oil': {
      price: 83.15,
      change: 0.9,
      unit: 'per barrel',
      category: 'energy',
      icon: '🛢️'
    },
    'Natural Gas': {
      price: 2.87,
      change: -2.1,
      unit: 'per MMBtu',
      category: 'energy',
      icon: '🔥'
    },
    'Gasoline': {
      price: 2.23,
      change: 0.8,
      unit: 'per gallon',
      category: 'energy',
      icon: '⛽'
    },
    // Agriculture
    'Wheat': {
      price: 6.23,
      change: 0.5,
      unit: 'per bushel',
      category: 'agriculture',
      icon: '🌾'
    },
    'Corn': {
      price: 4.87,
      change: -0.3,
      unit: 'per bushel',
      category: 'agriculture',
      icon: '🌽'
    },
    'Soybeans': {
      price: 13.45,
      change: 1.1,
      unit: 'per bushel',
      category: 'agriculture',
      icon: '🫘'
    },
    'Coffee': {
      price: 1.87,
      change: 2.3,
      unit: 'per lb',
      category: 'agriculture',
      icon: '☕'
    },
    'Sugar': {
      price: 0.21,
      change: 0.7,
      unit: 'per lb',
      category: 'agriculture',
      icon: '🍬'
    },
    'Cotton': {
      price: 0.83,
      change: -0.4,
      unit: 'per lb',
      category: 'agriculture',
      icon: '🧵'
    },
    // Livestock
    'Live Cattle': {
      price: 173.45,
      change: 0.6,
      unit: 'per 100 lbs',
      category: 'livestock',
      icon: '🐄'
    },
    'Lean Hogs': {
      price: 81.23,
      change: -0.9,
      unit: 'per 100 lbs',
      category: 'livestock',
      icon: '🐷'
    }
  },

  // ────────────────────────────────────────────────────────
  // BONDS & TREASURY
  // ────────────────────────────────────────────────────────
  bonds: {
    'US 10Y Treasury': {
      yield: 4.23,
      change: 0.05,
      price: 98.34
    },
    'US 2Y Treasury': {
      yield: 4.58,
      change: 0.02,
      price: 99.12
    },
    'US 30Y Treasury': {
      yield: 4.45,
      change: 0.08,
      price: 94.56
    },
    'Germany 10Y Bund': {
      yield: 2.34,
      change: 0.03,
      price: 101.23
    },
    'UK 10Y Gilt': {
      yield: 3.98,
      change: 0.04,
      price: 97.89
    },
    'Japan 10Y JGB': {
      yield: 0.68,
      change: 0.01,
      price: 103.45
    }
  }
};

// ────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────

export function getIndicesForCountry(countryName) {
  return marketData.indices[countryName] || {};
}

export function getAllPreciousMetals() {
  return marketData.preciousMetals;
}

export function getTopCrypto(limit = 10) {
  return Object.entries(marketData.crypto)
    .slice(0, limit)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
}

export function getMajorForexPairs() {
  return Object.entries(marketData.forex)
    .slice(0, 6)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
}

export function getCommoditiesByCategory(category) {
  return Object.entries(marketData.commodities)
    .filter(([key, val]) => val.category === category)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
}

// Generate AI market analysis
export async function generateMarketAnalysis(country) {
  const indices = getIndicesForCountry(country);
  const metals = getAllPreciousMetals();
  const crypto = getTopCrypto(5);
  
  // This would call your AI API with comprehensive market data
  return {
    summary: `Global markets showing mixed sentiment. ${country} indices trending ${getAverageTrend(indices)}.`,
    keyMovers: identifyKeyMovers(indices),
    riskLevel: calculateRiskLevel(indices, metals, crypto),
    recommendations: generateRecommendations(indices)
  };
}

function getAverageTrend(indices) {
  const changes = Object.values(indices).map(i => i.change);
  const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
  return avg > 0 ? 'positive' : 'negative';
}

function identifyKeyMovers(indices) {
  return Object.entries(indices)
    .sort((a, b) => Math.abs(b[1].change) - Math.abs(a[1].change))
    .slice(0, 3)
    .map(([name, data]) => ({ name, change: data.change }));
}

function calculateRiskLevel(indices, metals, crypto) {
  // Simple volatility-based risk calculation
  const indicesVol = Object.values(indices).reduce((sum, i) => sum + Math.abs(i.change), 0);
  const cryptoVol = Object.values(crypto).reduce((sum, c) => sum + Math.abs(c.change), 0);
  
  const avgVol = (indicesVol + cryptoVol) / (Object.keys(indices).length + Object.keys(crypto).length);
  
  if (avgVol < 0.5) return 'LOW';
  if (avgVol < 1.5) return 'MEDIUM';
  return 'HIGH';
}

function generateRecommendations(indices) {
  const avgChange = Object.values(indices).reduce((sum, i) => sum + i.change, 0) / Object.keys(indices).length;
  
  if (avgChange > 0.5) {
    return ['Bullish momentum observed', 'Consider long positions', 'Monitor for pullbacks'];
  } else if (avgChange < -0.5) {
    return ['Bearish pressure evident', 'Defensive posturing advised', 'Watch support levels'];
  } else {
    return ['Markets consolidating', 'Range-bound trading likely', 'Await breakout signals'];
  }
}