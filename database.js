const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'weather_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// 初始化数据库表结构
async function initializeDatabase() {
  const createCitiesTable = `
    CREATE TABLE IF NOT EXISTS cities (
      id INT PRIMARY KEY AUTO_INCREMENT,
      city_id VARCHAR(20) NOT NULL COMMENT '城市ID（和风天气API使用的ID）',
      name VARCHAR(50) NOT NULL COMMENT '城市名称',
      country VARCHAR(50) DEFAULT '中国' COMMENT '国家',
      province VARCHAR(50) DEFAULT '' COMMENT '省份',
      latitude DECIMAL(10, 6) COMMENT '纬度',
      longitude DECIMAL(10, 6) COMMENT '经度',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      UNIQUE KEY uk_city_id (city_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='城市信息表';
  `;

  const createWeatherRealtimeTable = `
    CREATE TABLE IF NOT EXISTS weather_realtime (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      city_id VARCHAR(20) NOT NULL COMMENT '城市ID',
      temp INT COMMENT '温度，摄氏度',
      feels_like INT COMMENT '体感温度，摄氏度',
      text VARCHAR(20) COMMENT '天气状况文字描述',
      wind_dir VARCHAR(20) COMMENT '风向',
      wind_speed INT COMMENT '风速，km/h',
      humidity INT COMMENT '相对湿度，百分比',
      pressure INT COMMENT '气压，hPa',
      vis INT COMMENT '能见度，km',
      cloud INT COMMENT '云量，百分比',
      dew INT COMMENT '露点温度',
      obs_time DATETIME COMMENT '观测时间',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '数据获取时间',
      FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
      KEY idx_city_id (city_id),
      KEY idx_obs_time (obs_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实时天气数据表';
  `;

  const createWeatherDailyTable = `
    CREATE TABLE IF NOT EXISTS weather_daily (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      city_id VARCHAR(20) NOT NULL COMMENT '城市ID',
      date DATE NOT NULL COMMENT '预报日期',
      text_day VARCHAR(20) COMMENT '白天天气状况文字描述',
      text_night VARCHAR(20) COMMENT '夜间天气状况文字描述',
      temp_high INT COMMENT '最高温度，摄氏度',
      temp_low INT COMMENT '最低温度，摄氏度',
      wind_dir_day VARCHAR(20) COMMENT '白天风向',
      wind_speed_day INT COMMENT '白天风速，km/h',
      wind_dir_night VARCHAR(20) COMMENT '夜间风向',
      wind_speed_night INT COMMENT '夜间风速，km/h',
      humidity INT COMMENT '相对湿度，百分比',
      precip INT COMMENT '降水量，mm',
      pressure INT COMMENT '气压，hPa',
      vis INT COMMENT '能见度，km',
      uv_index INT COMMENT '紫外线指数',
      sunrise TIME COMMENT '日出时间',
      sunset TIME COMMENT '日落时间',
      moonrise TIME COMMENT '月出时间',
      moonset TIME COMMENT '月落时间',
      moon_phase VARCHAR(50) COMMENT '月相',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '数据获取时间',
      FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
      UNIQUE KEY uk_city_date (city_id, date),
      KEY idx_city_id (city_id),
      KEY idx_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日天气预报数据表';
  `;

  const createWeatherHourlyTable = `
    CREATE TABLE IF NOT EXISTS weather_hourly (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      city_id VARCHAR(20) NOT NULL COMMENT '城市ID',
      time DATETIME NOT NULL COMMENT '预报时间',
      text VARCHAR(20) COMMENT '天气状况文字描述',
      temp INT COMMENT '温度，摄氏度',
      feels_like INT COMMENT '体感温度，摄氏度',
      wind_dir VARCHAR(20) COMMENT '风向',
      wind_speed INT COMMENT '风速，km/h',
      humidity INT COMMENT '相对湿度，百分比',
      precip INT COMMENT '降水量，mm',
      pressure INT COMMENT '气压，hPa',
      cloud INT COMMENT '云量，百分比',
      dew INT COMMENT '露点温度',
      uv_index INT COMMENT '紫外线指数',
      vis INT COMMENT '能见度，km',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '数据获取时间',
      FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
      UNIQUE KEY uk_city_time (city_id, time),
      KEY idx_city_id (city_id),
      KEY idx_time (time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小时天气预报数据表';
  `;

  try {
    const connection = await pool.getConnection();
    await connection.execute(createCitiesTable);
    await connection.execute(createWeatherRealtimeTable);
    await connection.execute(createWeatherDailyTable);
    await connection.execute(createWeatherHourlyTable);
    console.log('Database tables created successfully');
    
    // 插入默认城市数据
    const defaultCities = [
      { city_id: '101010100', name: '北京', province: '北京', latitude: 39.9042, longitude: 116.4074 },
      { city_id: '101020100', name: '上海', province: '上海', latitude: 31.2304, longitude: 121.4737 },
      { city_id: '101280601', name: '深圳', province: '广东', latitude: 22.5431, longitude: 114.0579 }
    ];
    
    for (const city of defaultCities) {
      const [rows] = await connection.execute('SELECT * FROM cities WHERE city_id = ?', [city.city_id]);
      if (rows.length === 0) {
        await connection.execute(
          'INSERT INTO cities (city_id, name, province, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
          [city.city_id, city.name, city.province, city.latitude, city.longitude]
        );
        console.log(`Added default city: ${city.name}`);
      }
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
