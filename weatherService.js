const { pool } = require('../config/database');
const qweatherService = require('./qweatherService');

class WeatherService {
  async updateWeatherData(locationId) {
    try {
      console.log(`Updating weather data for location: ${locationId}`);
      
      // 获取实时天气数据
      const realtimeData = await qweatherService.getRealTimeWeather(locationId);
      if (realtimeData.code === '200' && realtimeData.now) {
        await this.saveRealTimeWeather(locationId, realtimeData.now);
        console.log(`Updated real-time weather for location: ${locationId}`);
      } else {
        console.error(`Failed to get real-time weather for ${locationId}:`, realtimeData);
      }

      // 获取每日天气预报数据
      const dailyData = await qweatherService.getDailyWeather(locationId);
      if (dailyData.code === '200' && dailyData.daily && dailyData.daily.length > 0) {
        for (const day of dailyData.daily) {
          await this.saveDailyWeather(locationId, day);
        }
        console.log(`Updated daily weather for location: ${locationId}`);
      } else {
        console.error(`Failed to get daily weather for ${locationId}:`, dailyData);
      }

      // 获取小时天气预报数据
      const hourlyData = await qweatherService.getHourlyWeather(locationId);
      if (hourlyData.code === '200' && hourlyData.hourly && hourlyData.hourly.length > 0) {
        for (const hour of hourlyData.hourly) {
          await this.saveHourlyWeather(locationId, hour);
        }
        console.log(`Updated hourly weather for location: ${locationId}`);
      } else {
        console.error(`Failed to get hourly weather for ${locationId}:`, hourlyData);
      }

      return true;
    } catch (error) {
      console.error('Error updating weather data:', error);
      throw error;
    }
  }

  async saveRealTimeWeather(cityId, data) {
    const sql = `
      INSERT INTO weather_realtime (
        city_id, temp, feels_like, text, wind_dir, wind_speed, 
        humidity, pressure, vis, cloud, dew, obs_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cityId,
      data.temp,
      data.feelsLike,
      data.text,
      data.windDir,
      data.windSpeed,
      data.humidity,
      data.pressure,
      data.vis,
      data.cloud,
      data.dew,
      new Date(data.obsTime)
    ];
    await pool.execute(sql, values);
  }

  async saveDailyWeather(cityId, data) {
    const sql = `
      REPLACE INTO weather_daily (
        city_id, date, text_day, text_night, temp_high, temp_low, 
        wind_dir_day, wind_speed_day, wind_dir_night, wind_speed_night, 
        humidity, precip, pressure, vis, uv_index, sunrise, sunset, 
        moonrise, moonset, moon_phase
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cityId,
      data.fxDate,
      data.textDay,
      data.textNight,
      data.tempMax,
      data.tempMin,
      data.windDirDay,
      data.windSpeedDay,
      data.windDirNight,
      data.windSpeedNight,
      data.humidity,
      data.precip,
      data.pressure,
      data.vis,
      data.uvIndex,
      data.sunrise,
      data.sunset,
      data.moonrise,
      data.moonset,
      data.moonPhase
    ];
    await pool.execute(sql, values);
  }

  async saveHourlyWeather(cityId, data) {
    const sql = `
      REPLACE INTO weather_hourly (
        city_id, time, text, temp, feels_like, wind_dir, wind_speed, 
        humidity, precip, pressure, cloud, dew, uv_index, vis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cityId,
      new Date(data.fxTime),
      data.text,
      data.temp,
      data.feelsLike,
      data.windDir,
      data.windSpeed,
      data.humidity,
      data.precip,
      data.pressure,
      data.cloud,
      data.dew,
      data.uvIndex,
      data.vis
    ];
    await pool.execute(sql, values);
  }

  async getRealTimeWeather(cityId) {
    const sql = `
      SELECT * FROM weather_realtime 
      WHERE city_id = ? 
      ORDER BY obs_time DESC 
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [cityId]);
    return rows[0] || null;
  }

  async getDailyWeather(cityId, days = 7) {
    const sql = `
      SELECT * FROM weather_daily 
      WHERE city_id = ? 
      AND date >= CURDATE() 
      ORDER BY date ASC 
      LIMIT ?
    `;
    const [rows] = await pool.execute(sql, [cityId, days]);
    return rows;
  }

  async getHourlyWeather(cityId, hours = 24) {
    const sql = `
      SELECT * FROM weather_hourly 
      WHERE city_id = ? 
      AND time >= NOW() 
      ORDER BY time ASC 
      LIMIT ?
    `;
    const [rows] = await pool.execute(sql, [cityId, hours]);
    return rows;
  }

  async getAllCities() {
    const sql = `
      SELECT * FROM cities 
      ORDER BY name ASC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async addCity(cityData) {
    const sql = `
      INSERT INTO cities (city_id, name, province, latitude, longitude) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        province = VALUES(province),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        updated_at = CURRENT_TIMESTAMP
    `;
    const values = [
      cityData.city_id,
      cityData.name,
      cityData.province || '',
      cityData.latitude,
      cityData.longitude
    ];
    await pool.execute(sql, values);
    return true;
  }

  async searchCity(keyword) {
    const sql = `
      SELECT * FROM cities 
      WHERE name LIKE ? 
      OR province LIKE ? 
      ORDER BY name ASC
    `;
    const likeKeyword = `%${keyword}%`;
    const [rows] = await pool.execute(sql, [likeKeyword, likeKeyword]);
    return rows;
  }
}

module.exports = new WeatherService();
