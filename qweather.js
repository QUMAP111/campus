module.exports = {
  apiKey: process.env.QWEATHER_API_KEY || 'your_api_key',
  baseUrl: 'https://devapi.qweather.com',
  versions: {
    weather: 'v7',
    geo: 'v2'
  },
  endpoints: {
    weatherNow: '/weather/now',
    weatherDaily: '/weather/7d',
    weatherHourly: '/weather/24h',
    cityLookup: '/geo/city/lookup'
  },
  // 默认城市ID列表
  defaultCityIds: ['101010100', '101020100', '101280601']
};
