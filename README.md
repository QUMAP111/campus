# 天气应用后端服务

这是一个基于Node.js和Express的天气应用后端服务，用于从和风天气API获取天气数据并存储到MySQL数据库中。该服务提供RESTful API接口供前端调用，支持实时天气、每日天气预报和小时天气预报数据的获取。

## 功能特点

- 从和风天气API获取实时天气数据
- 存储天气数据到MySQL数据库
- 提供RESTful API接口供前端调用
- 定时任务自动更新天气数据
- 支持多个城市的天气数据管理

## 技术栈

- Node.js
- Express.js
- MySQL
- Axios
- node-cron

## 项目结构

```
/
├── config/              # 配置文件
│   ├── database.js      # 数据库配置
│   └── qweather.js      # 和风天气API配置
├── services/            # 服务层
│   ├── qweatherService.js # 和风天气API服务
│   └── weatherService.js # 天气数据处理服务
├── routes/              # 路由
│   ├── cityRoutes.js    # 城市相关路由
│   └── weatherRoutes.js # 天气相关路由
├── app.js               # 应用入口文件
├── package.json         # 项目依赖
└── README.md            # 项目说明
```

## API接口说明

### 城市相关接口

#### 获取所有城市

```
GET /api/cities
```

#### 搜索城市

```
GET /api/cities/search?keyword=北京
```

#### 添加城市

```
POST /api/cities
Content-Type: application/json

{
  "city_id": "101010100",
  "name": "北京",
  "province": "北京",
  "latitude": 39.9042,
  "longitude": 116.4074
}
```

#### 获取城市天气概览

```
GET /api/cities/:cityId/overview
```

### 天气相关接口

#### 获取实时天气

```
GET /api/weather/realtime/:cityId
```

#### 获取每日天气预报

```
GET /api/weather/daily/:cityId?days=7
```

#### 获取小时天气预报

```
GET /api/weather/hourly/:cityId?hours=24
```

#### 更新天气数据

```
POST /api/weather/update/:cityId
```

#### 批量更新天气数据

```
POST /api/weather/update-all
```

## 在Sealos平台部署步骤

### 1. 准备工作

1. 注册并登录Sealos平台
2. 获取和风天气API密钥（https://dev.qweather.com/）
3. 准备好MySQL数据库（可以使用Sealos应用商店中的MySQL）

### 2. 创建Sealos项目

1. 在Sealos控制台中，点击"Devbox" -> "Create New Project"
2. 配置项目名称、运行环境（Node.js）、CPU和内存资源
3. 配置网络设置，开放3000端口
4. 点击"Create"创建项目

### 3. 部署MySQL数据库

1. 在Sealos控制台中，点击"App Store"
2. 搜索"MySQL"并选择合适的版本
3. 点击"Deploy"部署MySQL
4. 配置数据库名称、用户名、密码等信息
5. 记录数据库连接信息（主机、端口、用户名、密码）

### 4. 配置环境变量

在Sealos项目的"Settings" -> "Environment Variables"中添加以下环境变量：

```
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=weather_db
QWEATHER_API_KEY=your_qweather_api_key
PORT=3000
```

### 5. 上传代码并部署

1. 使用Git将代码推送到Sealos项目的代码仓库
2. 或者使用Sealos的Web IDE直接编写代码
3. 安装依赖：`npm install`
4. 启动应用：`npm start`

### 6. 测试API

使用Postman或curl测试API接口：

```bash
# 获取实时天气
curl https://your-sealos-domain/api/weather/realtime/101010100

# 获取每日天气预报
curl https://your-sealos-domain/api/weather/daily/101010100

# 获取小时天气预报
curl https://your-sealos-domain/api/weather/hourly/101010100

# 更新天气数据
curl -X POST https://your-sealos-domain/api/weather/update/101010100
```

## 本地开发

1. 克隆代码仓库
2. 安装依赖：`npm install`
3. 配置环境变量
4. 启动开发服务器：`npm run dev`

## 数据模型

### 城市信息表（cities）

存储需要查询天气的城市基本信息。

### 实时天气表（weather_realtime）

存储实时天气数据。

### 每日天气预报表（weather_daily）

存储未来多日的天气预报数据。

### 小时天气预报表（weather_hourly）

存储未来24小时的逐小时天气预报数据。

## 定时任务

服务启动后，会自动启动一个定时任务，每小时更新一次所有城市的天气数据。

## 注意事项

1. 和风天气API有调用次数限制，请合理使用
2. 数据库连接信息和API密钥请使用环境变量配置，不要硬编码在代码中
3. 定期备份数据库，防止数据丢失
4. 根据实际需求调整定时任务的执行频率

## 许可证

ISC
