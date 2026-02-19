// ═══════════════════════════════════════════════════════════
// GEOGRAPHICAL HIERARCHY DATA - Countries, States, Cities
// Support for drill-down navigation: Country → State → City
// ═══════════════════════════════════════════════════════════

export const geographicalHierarchy = {
  
  // ────────────────────────────────────────────────────────
  // INDIA - Complete state and major city data
  // ────────────────────────────────────────────────────────
  'India': {
    code: 'IN',
    capital: 'New Delhi',
    population: 1428627663,
    states: [
      {
        name: 'Maharashtra',
        capital: 'Mumbai',
        population: 112374333,
        area: 307713, // km²
        cities: [
          {
            name: 'Mumbai',
            population: 20411000,
            coords: [72.8777, 19.0760],
            type: 'metropolis',
            gdp: 310, // billion USD
            industries: ['Finance', 'Entertainment', 'Technology', 'Trade'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Pune',
            population: 7500000,
            coords: [73.8567, 18.5204],
            type: 'major',
            gdp: 69,
            industries: ['IT', 'Manufacturing', 'Education', 'Automotive'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Nagpur',
            population: 2497000,
            coords: [79.0882, 21.1458],
            type: 'major',
            gdp: 15,
            industries: ['Agriculture', 'Mining', 'Textiles'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Nashik',
            population: 1562000,
            coords: [73.7898, 19.9975],
            type: 'city',
            gdp: 12,
            industries: ['Wine Production', 'Agriculture', 'Tourism'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'Karnataka',
        capital: 'Bengaluru',
        population: 61095297,
        area: 191791,
        cities: [
          {
            name: 'Bengaluru',
            population: 13608000,
            coords: [77.5946, 12.9716],
            type: 'metropolis',
            gdp: 110,
            industries: ['IT', 'Biotechnology', 'Aerospace', 'E-commerce'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Mysuru',
            population: 1059000,
            coords: [76.6394, 12.2958],
            type: 'city',
            gdp: 8,
            industries: ['Tourism', 'IT', 'Silk Production'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Mangaluru',
            population: 720000,
            coords: [74.8560, 12.9141],
            type: 'city',
            gdp: 6,
            industries: ['Port', 'Petrochemicals', 'Banking'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'Delhi',
        capital: 'New Delhi',
        population: 16753235,
        area: 1484,
        cities: [
          {
            name: 'New Delhi',
            population: 16753000,
            coords: [77.2090, 28.6139],
            type: 'capital',
            gdp: 167,
            industries: ['Government', 'IT', 'Tourism', 'Retail'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'Tamil Nadu',
        capital: 'Chennai',
        population: 72147030,
        area: 130060,
        cities: [
          {
            name: 'Chennai',
            population: 11503000,
            coords: [80.2707, 13.0827],
            type: 'metropolis',
            gdp: 92,
            industries: ['Automotive', 'IT', 'Healthcare', 'Manufacturing'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Coimbatore',
            population: 2207000,
            coords: [76.9558, 11.0168],
            type: 'major',
            gdp: 23,
            industries: ['Textiles', 'Engineering', 'Agriculture'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Madurai',
            population: 1470000,
            coords: [78.1198, 9.9252],
            type: 'city',
            gdp: 10,
            industries: ['Tourism', 'Textiles', 'Retail'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'Gujarat',
        capital: 'Gandhinagar',
        population: 60439692,
        area: 196244,
        cities: [
          {
            name: 'Ahmedabad',
            population: 8451000,
            coords: [72.5714, 23.0225],
            type: 'metropolis',
            gdp: 75,
            industries: ['Textiles', 'Pharmaceuticals', 'IT', 'Chemicals'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Surat',
            population: 6564000,
            coords: [72.8311, 21.1702],
            type: 'major',
            gdp: 58,
            industries: ['Diamonds', 'Textiles', 'IT'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'West Bengal',
        capital: 'Kolkata',
        population: 91276115,
        area: 88752,
        cities: [
          {
            name: 'Kolkata',
            population: 15134000,
            coords: [88.3639, 22.5726],
            type: 'metropolis',
            gdp: 150,
            industries: ['IT', 'Finance', 'Manufacturing', 'Retail'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'Telangana',
        capital: 'Hyderabad',
        population: 35003674,
        area: 112077,
        cities: [
          {
            name: 'Hyderabad',
            population: 10494000,
            coords: [78.4867, 17.3850],
            type: 'metropolis',
            gdp: 95,
            industries: ['IT', 'Pharmaceuticals', 'Biotechnology', 'Finance'],
            timezone: 'Asia/Kolkata'
          }
        ]
      },
      {
        name: 'Uttar Pradesh',
        capital: 'Lucknow',
        population: 199812341,
        area: 240928,
        cities: [
          {
            name: 'Lucknow',
            population: 3592000,
            coords: [80.9462, 26.8467],
            type: 'major',
            gdp: 28,
            industries: ['Government', 'IT', 'Retail'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Kanpur',
            population: 3214000,
            coords: [80.3319, 26.4499],
            type: 'major',
            gdp: 22,
            industries: ['Textiles', 'Leather', 'Chemicals'],
            timezone: 'Asia/Kolkata'
          },
          {
            name: 'Agra',
            population: 1760000,
            coords: [78.0081, 27.1767],
            type: 'city',
            gdp: 12,
            industries: ['Tourism', 'Handicrafts', 'Leather'],
            timezone: 'Asia/Kolkata'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // UNITED STATES - States and major cities
  // ────────────────────────────────────────────────────────
  'United States': {
    code: 'US',
    capital: 'Washington, D.C.',
    population: 331893745,
    states: [
      {
        name: 'California',
        capital: 'Sacramento',
        population: 39237836,
        area: 423970,
        cities: [
          {
            name: 'Los Angeles',
            population: 12447000,
            coords: [-118.2437, 34.0522],
            type: 'metropolis',
            gdp: 1055,
            industries: ['Entertainment', 'Technology', 'Trade', 'Tourism'],
            timezone: 'America/Los_Angeles'
          },
          {
            name: 'San Francisco',
            population: 4749000,
            coords: [-122.4194, 37.7749],
            type: 'metropolis',
            gdp: 592,
            industries: ['Technology', 'Finance', 'Tourism', 'Biotechnology'],
            timezone: 'America/Los_Angeles'
          },
          {
            name: 'San Diego',
            population: 3298000,
            coords: [-117.1611, 32.7157],
            type: 'major',
            gdp: 265,
            industries: ['Defense', 'Tourism', 'Biotechnology', 'Manufacturing'],
            timezone: 'America/Los_Angeles'
          },
          {
            name: 'San Jose',
            population: 1030000,
            coords: [-121.8863, 37.3382],
            type: 'major',
            gdp: 310,
            industries: ['Technology', 'Software', 'Hardware', 'Semiconductors'],
            timezone: 'America/Los_Angeles'
          }
        ]
      },
      {
        name: 'New York',
        capital: 'Albany',
        population: 19835913,
        area: 141300,
        cities: [
          {
            name: 'New York City',
            population: 19499000,
            coords: [-74.0060, 40.7128],
            type: 'capital',
            gdp: 1930,
            industries: ['Finance', 'Media', 'Technology', 'Real Estate'],
            timezone: 'America/New_York'
          }
        ]
      },
      {
        name: 'Texas',
        capital: 'Austin',
        population: 29472295,
        area: 695662,
        cities: [
          {
            name: 'Houston',
            population: 6603000,
            coords: [-95.3698, 29.7604],
            type: 'metropolis',
            gdp: 490,
            industries: ['Energy', 'Aerospace', 'Healthcare', 'Manufacturing'],
            timezone: 'America/Chicago'
          },
          {
            name: 'Dallas',
            population: 6426000,
            coords: [-96.7970, 32.7767],
            type: 'metropolis',
            gdp: 512,
            industries: ['Technology', 'Finance', 'Telecommunications', 'Logistics'],
            timezone: 'America/Chicago'
          },
          {
            name: 'Austin',
            population: 2227000,
            coords: [-97.7431, 30.2672],
            type: 'major',
            gdp: 168,
            industries: ['Technology', 'Government', 'Education', 'Music'],
            timezone: 'America/Chicago'
          }
        ]
      },
      {
        name: 'Illinois',
        capital: 'Springfield',
        population: 12587530,
        area: 149995,
        cities: [
          {
            name: 'Chicago',
            population: 9110000,
            coords: [-87.6298, 41.8781],
            type: 'metropolis',
            gdp: 689,
            industries: ['Finance', 'Manufacturing', 'Technology', 'Transportation'],
            timezone: 'America/Chicago'
          }
        ]
      },
      {
        name: 'Florida',
        capital: 'Tallahassee',
        population: 21781128,
        area: 170312,
        cities: [
          {
            name: 'Miami',
            population: 6166000,
            coords: [-80.1918, 25.7617],
            type: 'metropolis',
            gdp: 345,
            industries: ['Tourism', 'Finance', 'Trade', 'Real Estate'],
            timezone: 'America/New_York'
          }
        ]
      },
      {
        name: 'Washington',
        capital: 'Olympia',
        population: 7738692,
        area: 184661,
        cities: [
          {
            name: 'Seattle',
            population: 3489000,
            coords: [-122.3321, 47.6062],
            type: 'metropolis',
            gdp: 418,
            industries: ['Technology', 'Aerospace', 'Biotechnology', 'Trade'],
            timezone: 'America/Los_Angeles'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // CHINA - Provinces and major cities
  // ────────────────────────────────────────────────────────
  'China': {
    code: 'CN',
    capital: 'Beijing',
    population: 1412175000,
    states: [
      {
        name: 'Beijing',
        capital: 'Beijing',
        population: 21540000,
        area: 16410,
        cities: [
          {
            name: 'Beijing',
            population: 21540000,
            coords: [116.4074, 39.9042],
            type: 'capital',
            gdp: 571,
            industries: ['Technology', 'Finance', 'Government', 'Manufacturing'],
            timezone: 'Asia/Shanghai'
          }
        ]
      },
      {
        name: 'Shanghai',
        capital: 'Shanghai',
        population: 24870000,
        area: 6341,
        cities: [
          {
            name: 'Shanghai',
            population: 24870000,
            coords: [121.4737, 31.2304],
            type: 'metropolis',
            gdp: 634,
            industries: ['Finance', 'Trade', 'Manufacturing', 'Shipping'],
            timezone: 'Asia/Shanghai'
          }
        ]
      },
      {
        name: 'Guangdong',
        capital: 'Guangzhou',
        population: 126012510,
        area: 179800,
        cities: [
          {
            name: 'Guangzhou',
            population: 15300000,
            coords: [113.2644, 23.1291],
            type: 'metropolis',
            gdp: 428,
            industries: ['Manufacturing', 'Trade', 'Technology', 'Automotive'],
            timezone: 'Asia/Shanghai'
          },
          {
            name: 'Shenzhen',
            population: 17560000,
            coords: [114.0579, 22.5431],
            type: 'metropolis',
            gdp: 472,
            industries: ['Technology', 'Manufacturing', 'Finance', 'Logistics'],
            timezone: 'Asia/Shanghai'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // UNITED KINGDOM - Countries and major cities
  // ────────────────────────────────────────────────────────
  'United Kingdom': {
    code: 'GB',
    capital: 'London',
    population: 67326569,
    states: [
      {
        name: 'England',
        capital: 'London',
        population: 56550138,
        area: 130279,
        cities: [
          {
            name: 'London',
            population: 9648000,
            coords: [-0.1276, 51.5074],
            type: 'capital',
            gdp: 653,
            industries: ['Finance', 'Technology', 'Tourism', 'Creative Industries'],
            timezone: 'Europe/London'
          },
          {
            name: 'Manchester',
            population: 2730000,
            coords: [-2.2426, 53.4808],
            type: 'major',
            gdp: 88,
            industries: ['Finance', 'Media', 'Manufacturing', 'Education'],
            timezone: 'Europe/London'
          },
          {
            name: 'Birmingham',
            population: 2897000,
            coords: [-1.8904, 52.4862],
            type: 'major',
            gdp: 82,
            industries: ['Manufacturing', 'Finance', 'Retail', 'Education'],
            timezone: 'Europe/London'
          }
        ]
      },
      {
        name: 'Scotland',
        capital: 'Edinburgh',
        population: 5466000,
        area: 77933,
        cities: [
          {
            name: 'Edinburgh',
            population: 524000,
            coords: [-3.1883, 55.9533],
            type: 'capital',
            gdp: 38,
            industries: ['Finance', 'Tourism', 'Education', 'Technology'],
            timezone: 'Europe/London'
          },
          {
            name: 'Glasgow',
            population: 635000,
            coords: [-4.2518, 55.8642],
            type: 'major',
            gdp: 42,
            industries: ['Finance', 'Manufacturing', 'Shipbuilding', 'Tourism'],
            timezone: 'Europe/London'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // JAPAN - Prefectures and major cities
  // ────────────────────────────────────────────────────────
  'Japan': {
    code: 'JP',
    capital: 'Tokyo',
    population: 125502000,
    states: [
      {
        name: 'Tokyo',
        capital: 'Tokyo',
        population: 14047594,
        area: 2194,
        cities: [
          {
            name: 'Tokyo',
            population: 37400000,
            coords: [139.6917, 35.6895],
            type: 'capital',
            gdp: 1793,
            industries: ['Finance', 'Technology', 'Manufacturing', 'Services'],
            timezone: 'Asia/Tokyo'
          }
        ]
      },
      {
        name: 'Osaka',
        capital: 'Osaka',
        population: 8837685,
        area: 1905,
        cities: [
          {
            name: 'Osaka',
            population: 19110000,
            coords: [135.5022, 34.6937],
            type: 'metropolis',
            gdp: 687,
            industries: ['Manufacturing', 'Pharmaceuticals', 'Steel', 'Food'],
            timezone: 'Asia/Tokyo'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // GERMANY - States and major cities
  // ────────────────────────────────────────────────────────
  'Germany': {
    code: 'DE',
    capital: 'Berlin',
    population: 83149300,
    states: [
      {
        name: 'Berlin',
        capital: 'Berlin',
        population: 3769495,
        area: 892,
        cities: [
          {
            name: 'Berlin',
            population: 3769000,
            coords: [13.4050, 52.5200],
            type: 'capital',
            gdp: 163,
            industries: ['Technology', 'Creative Industries', 'Tourism', 'Government'],
            timezone: 'Europe/Berlin'
          }
        ]
      },
      {
        name: 'Bavaria',
        capital: 'Munich',
        population: 13140183,
        area: 70550,
        cities: [
          {
            name: 'Munich',
            population: 1488000,
            coords: [11.5820, 48.1351],
            type: 'metropolis',
            gdp: 141,
            industries: ['Automotive', 'Technology', 'Finance', 'Tourism'],
            timezone: 'Europe/Berlin'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // FRANCE - Regions and major cities
  // ────────────────────────────────────────────────────────
  'France': {
    code: 'FR',
    capital: 'Paris',
    population: 67413000,
    states: [
      {
        name: 'Île-de-France',
        capital: 'Paris',
        population: 12278210,
        area: 12012,
        cities: [
          {
            name: 'Paris',
            population: 11060000,
            coords: [2.3522, 48.8566],
            type: 'capital',
            gdp: 739,
            industries: ['Tourism', 'Finance', 'Fashion', 'Technology'],
            timezone: 'Europe/Paris'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // BRAZIL - States and major cities
  // ────────────────────────────────────────────────────────
  'Brazil': {
    code: 'BR',
    capital: 'Brasília',
    population: 214326223,
    states: [
      {
        name: 'São Paulo',
        capital: 'São Paulo',
        population: 46649132,
        area: 248222,
        cities: [
          {
            name: 'São Paulo',
            population: 22043000,
            coords: [-46.6333, -23.5505],
            type: 'metropolis',
            gdp: 430,
            industries: ['Finance', 'Manufacturing', 'Services', 'Technology'],
            timezone: 'America/Sao_Paulo'
          }
        ]
      },
      {
        name: 'Rio de Janeiro',
        capital: 'Rio de Janeiro',
        population: 17463349,
        area: 43696,
        cities: [
          {
            name: 'Rio de Janeiro',
            population: 13634000,
            coords: [-43.1729, -22.9068],
            type: 'metropolis',
            gdp: 187,
            industries: ['Tourism', 'Oil & Gas', 'Services', 'Entertainment'],
            timezone: 'America/Sao_Paulo'
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────
  // RUSSIA - Federal subjects and major cities
  // ────────────────────────────────────────────────────────
  'Russia': {
    code: 'RU',
    capital: 'Moscow',
    population: 146171015,
    states: [
      {
        name: 'Moscow',
        capital: 'Moscow',
        population: 12655000,
        area: 2511,
        cities: [
          {
            name: 'Moscow',
            population: 12655000,
            coords: [37.6173, 55.7558],
            type: 'capital',
            gdp: 432,
            industries: ['Finance', 'Technology', 'Manufacturing', 'Government'],
            timezone: 'Europe/Moscow'
          }
        ]
      },
      {
        name: 'Saint Petersburg',
        capital: 'Saint Petersburg',
        population: 5384000,
        area: 1439,
        cities: [
          {
            name: 'Saint Petersburg',
            population: 5384000,
            coords: [30.3351, 59.9311],
            type: 'major',
            gdp: 124,
            industries: ['Shipbuilding', 'Manufacturing', 'Tourism', 'Technology'],
            timezone: 'Europe/Moscow'
          }
        ]
      }
    ]
  }
};

// Helper function to get all cities for a country
export function getCitiesForCountry(countryName) {
  const country = geographicalHierarchy[countryName];
  if (!country || !country.states) return [];
  
  const allCities = [];
  country.states.forEach(state => {
    if (state.cities) {
      state.cities.forEach(city => {
        allCities.push({
          ...city,
          state: state.name,
          country: countryName
        });
      });
    }
  });
  
  return allCities;
}

// Helper function to get state data
export function getStateData(countryName, stateName) {
  const country = geographicalHierarchy[countryName];
  if (!country || !country.states) return null;
  
  return country.states.find(s => s.name === stateName);
}

// Helper function to get city data
export function getCityData(countryName, stateName, cityName) {
  const state = getStateData(countryName, stateName);
  if (!state || !state.cities) return null;
  
  return state.cities.find(c => c.name === cityName);
}

// Helper function to check if country has hierarchical data
export function hasHierarchicalData(countryName) {
  return !!geographicalHierarchy[countryName];
}