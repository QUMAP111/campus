const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const cityRoutes = require('./routes/cityRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const { testConnection, initializeDatabase } = require('./config/database');
const weatherService = require('./services/weatherService');
const config = require('./config/qweather');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/cities', cityRoutes);
app.use('/api/weather', weatherRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 定时任务：每小时更新一次天气数据
const updateWeatherData = async () => {
  console.log('Running scheduled weather data update:', new Date().toISOString());
  try {
    const cities = await weatherService.getAllCities();
    
    if (cities.length === 0) {
      console.log('No cities found, using default city IDs');
      // 如果没有城市数据，使用默认城市ID
      for (const cityId of config.defaultCityIds) {
        try {
          await weatherService.updateWeatherData(cityId);
        } catch (error) {
          console.error(`Failed to update weather for city ${cityId}:`, error.message);
        }
      }
    } else {
      for (const city of cities) {
        try {
          await weatherService.updateWeatherData(city.city_id);
        } catch (error) {
          console.error(`Failed to update weather for city ${city.name} (${city.city_id}):`, error.message);
        }
      }
    }
    
    console.log('Scheduled weather data update completed:', new Date().toISOString());
  } catch (error) {
    console.error('Scheduled weather data update failed:', error.message);
  }
};

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Database connection failed, exiting...');
      process.exit(1);
    }
    
    // 初始化数据库
    await initializeDatabase();
    
    // 立即更新一次天气数据
    await updateWeatherData();
    
    // 启动定时任务：每小时执行一次
    cron.schedule('0 * * * *', updateWeatherData);
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// 启动服务器
startServer();
