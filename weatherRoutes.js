const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// 获取实时天气
router.get('/realtime/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const weather = await weatherService.getRealTimeWeather(cityId);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取每日天气预报
router.get('/daily/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { days = 7 } = req.query;
    const weather = await weatherService.getDailyWeather(cityId, parseInt(days));
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取小时天气预报
router.get('/hourly/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { hours = 24 } = req.query;
    const weather = await weatherService.getHourlyWeather(cityId, parseInt(hours));
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新天气数据
router.post('/update/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const result = await weatherService.updateWeatherData(cityId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量更新天气数据
router.post('/update-all', async (req, res) => {
  try {
    const cities = await weatherService.getAllCities();
    const results = [];
    
    for (const city of cities) {
      try {
        const result = await weatherService.updateWeatherData(city.city_id);
        results.push({ city_id: city.city_id, name: city.name, success: result });
      } catch (error) {
        results.push({ city_id: city.city_id, name: city.name, success: false, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
