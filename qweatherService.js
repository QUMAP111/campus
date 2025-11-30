const axios = require('axios');
const config = require('../config/qweather');

class QWeatherService {
  constructor() {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.versions = config.versions;
    this.endpoints = config.endpoints;
  }

  async getRealTimeWeather(locationId) {
    try {
      const url = `${this.baseUrl}/${this.versions.weather}${this.endpoints.weatherNow}`;
      const response = await axios.get(url, {
        params: {
          location: locationId,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time weather:', error.message);
      throw error;
    }
  }

  async getDailyWeather(locationId, days = 7) {
    try {
      const url = `${this.baseUrl}/${this.versions.weather}${this.endpoints.weatherDaily}`;
      const response = await axios.get(url, {
        params: {
          location: locationId,
          key: this.apiKey,
          days: days
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily weather:', error.message);
      throw error;
    }
  }

  async getHourlyWeather(locationId, hours = 24) {
    try {
      const url = `${this.baseUrl}/${this.versions.weather}${this.endpoints.weatherHourly}`;
      const response = await axios.get(url, {
        params: {
          location: locationId,
          key: this.apiKey,
          hours: hours
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hourly weather:', error.message);
      throw error;
    }
  }

  async searchCity(keyword) {
    try {
      const url = `${this.baseUrl}/${this.versions.geo}${this.endpoints.cityLookup}`;
      const response = await axios.get(url, {
        params: {
          location: keyword,
          key: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching city:', error.message);
      throw error;
    }
  }
}

module.exports = new QWeatherService();
