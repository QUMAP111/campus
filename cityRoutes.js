const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const qweatherService = require('../services/qweatherService');

// 获取所有城市
router.get('/', async (req, res) => {
  try {
    const cities = await weatherService.getAllCities();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 搜索城市
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    
    // 先从本地数据库搜索
    let cities = await weatherService.searchCity(keyword);
    
    // 如果本地数据库没有找到，从和风天气API搜索
    if (cities.length === 0) {
      const apiResult = await qweatherService.searchCity(keyword);
      if (apiResult.code === '200' && apiResult.location) {
        cities = apiResult.location.map(loc => ({
          city_id: loc.id,
          name: loc.name,
          province: loc.adm1 || '',
          country: loc.country,
          latitude: loc.lat,
          longitude: loc.lon
        }));
      }
    }
    
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加城市
router.post('/', async (req, res) => {
  try {
    const { city_id, name, province, latitude, longitude } = req.body;
    
    if (!city_id || !name) {
      return res.status(400).json({ error: 'city_id and name are required' });
    }
    
    const cityData = {
      city_id,
      name,
      province: province || '',
      latitude: latitude || null,
      longitude: longitude || null
    };
    
    const result = await weatherService.addCity(cityData);
    
    // 添加城市后立即更新天气数据
    if (result) {
      await weatherService.updateWeatherData(city_id);
    }
    
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取城市天气概览
router.get('/:cityId/overview', async (req, res) => {
  try {
    const { cityId } = req.params;
    
    // 获取实时天气
    const realtime = await weatherService.getRealTimeWeather(cityId);
    
    // 获取今日和明日天气预报
    const daily = await weatherService.getDailyWeather(cityId, 2);
    
    // 获取未来12小时天气预报
    const hourly = await weatherService.getHourlyWeather(cityId, 12);
    
    res.json({
      realtime,
      today: daily[0] || null,
      tomorrow: daily[1] || null,
      hourly
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
