/**
 * 天气系统
 * 管理游戏中的天气变化、季节更替和环境影响
 */

class WeatherSystem {
    constructor() {
        // 天气类型定义
        this.weatherTypes = {
            sunny: {
                id: 'sunny',
                name: '晴天',
                icon: '☀️',
                description: '阳光明媚的好天气',
                effects: {
                    mood: 5,        // 心情加成
                    energy: 0,      // 精力影响
                    visibility: 100 // 能见度
                }
            },
            cloudy: {
                id: 'cloudy',
                name: '多云',
                icon: '☁️',
                description: '天空布满了云朵',
                effects: {
                    mood: 0,
                    energy: 0,
                    visibility: 80
                }
            },
            rainy: {
                id: 'rainy',
                name: '雨天',
                icon: '🌧️',
                description: '淅淅沥沥的雨水',
                effects: {
                    mood: -5,
                    energy: -5,
                    visibility: 60
                }
            },
            stormy: {
                id: 'stormy',
                name: '暴雨',
                icon: '⛈️',
                description: '电闪雷鸣，暴雨倾盆',
                effects: {
                    mood: -10,
                    energy: -10,
                    visibility: 30
                }
            },
            snowy: {
                id: 'snowy',
                name: '雪天',
                icon: '❄️',
                description: '雪花纷飞',
                effects: {
                    mood: 3,
                    energy: -5,
                    visibility: 50
                }
            },
            foggy: {
                id: 'foggy',
                name: '雾天',
                icon: '🌫️',
                description: '浓雾弥漫',
                effects: {
                    mood: -3,
                    energy: 0,
                    visibility: 20
                }
            }
        };

        // 季节定义
        this.seasons = {
            spring: {
                id: 'spring',
                name: '春季',
                months: [3, 4, 5],
                weatherProbability: {
                    sunny: 0.3,
                    cloudy: 0.3,
                    rainy: 0.3,
                    stormy: 0.05,
                    foggy: 0.05,
                    snowy: 0
                },
                temperature: { min: 10, max: 25 }
            },
            summer: {
                id: 'summer',
                name: '夏季',
                months: [6, 7, 8],
                weatherProbability: {
                    sunny: 0.5,
                    cloudy: 0.2,
                    rainy: 0.15,
                    stormy: 0.15,
                    foggy: 0,
                    snowy: 0
                },
                temperature: { min: 20, max: 35 }
            },
            autumn: {
                id: 'autumn',
                name: '秋季',
                months: [9, 10, 11],
                weatherProbability: {
                    sunny: 0.25,
                    cloudy: 0.35,
                    rainy: 0.25,
                    stormy: 0.05,
                    foggy: 0.1,
                    snowy: 0
                },
                temperature: { min: 5, max: 20 }
            },
            winter: {
                id: 'winter',
                name: '冬季',
                months: [12, 1, 2],
                weatherProbability: {
                    sunny: 0.15,
                    cloudy: 0.3,
                    rainy: 0.1,
                    stormy: 0,
                    foggy: 0.15,
                    snowy: 0.3
                },
                temperature: { min: -10, max: 10 }
            }
        };

        // 当前状态
        this.currentWeather = 'sunny';
        this.currentSeason = 'spring';
        this.currentTemperature = 20;
        this.forecast = [];  // 未来几天的天气预报

        // 天气变化设置
        this.changeInterval = 4;  // 每4小时检查一次天气变化
        this.lastChangeHour = 0;
        this.weatherDuration = 8; // 天气最少持续8小时

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 根据游戏日期初始化季节
        this.updateSeason();
        // 生成初始天气
        this.generateWeather();
        // 生成天气预报
        this.generateForecast();

        console.log('🌤️ 天气系统初始化完成');
    }

    /**
     * 获取当前月份对应的季节
     */
    getSeasonByMonth(month) {
        for (const [seasonId, season] of Object.entries(this.seasons)) {
            if (season.months.includes(month)) {
                return seasonId;
            }
        }
        return 'spring'; // 默认春季
    }

    /**
     * 更新季节
     */
    updateSeason() {
        // 假设游戏从1月开始，根据天数计算月份
        const day = window.gameState?.gameTime?.day || 1;
        const month = Math.floor((day - 1) / 30) % 12 + 1; // 简化：每月30天

        const newSeason = this.getSeasonByMonth(month);
        if (newSeason !== this.currentSeason) {
            const oldSeason = this.currentSeason;
            this.currentSeason = newSeason;
            console.log(`🍂 季节变化: ${this.seasons[oldSeason].name} → ${this.seasons[newSeason].name}`);

            // 触发季节变化事件
            if (window.storyFlags) {
                window.storyFlags.setFlag(`SEASON_${newSeason.toUpperCase()}`, true);
            }
        }
    }

    /**
     * 生成天气
     */
    generateWeather() {
        const season = this.seasons[this.currentSeason];
        const probabilities = season.weatherProbability;

        // 根据概率随机选择天气
        const random = Math.random();
        let cumulative = 0;

        for (const [weather, probability] of Object.entries(probabilities)) {
            cumulative += probability;
            if (random < cumulative) {
                this.setWeather(weather);
                break;
            }
        }

        // 生成温度
        const tempRange = season.temperature;
        this.currentTemperature = Math.round(
            tempRange.min + Math.random() * (tempRange.max - tempRange.min)
        );
    }

    /**
     * 设置天气
     */
    setWeather(weatherType) {
        if (!this.weatherTypes[weatherType]) {
            console.error('未知的天气类型:', weatherType);
            return;
        }

        const oldWeather = this.currentWeather;
        this.currentWeather = weatherType;

        if (oldWeather !== weatherType) {
            const weather = this.weatherTypes[weatherType];
            console.log(`🌦️ 天气变化: ${weather.icon} ${weather.name}`);

            // 应用天气效果
            this.applyWeatherEffects(weather);

            // 更新UI显示
            this.updateWeatherDisplay();
        }
    }

    /**
     * 应用天气效果
     */
    applyWeatherEffects(weather) {
        if (!window.gameState?.character) return;

        const effects = weather.effects;

        // 影响心情
        if (effects.mood !== 0) {
            const currentMood = window.gameState.character.mood || 50;
            window.gameState.character.mood = Math.max(0, Math.min(100, currentMood + effects.mood));
        }

        // 影响精力
        if (effects.energy !== 0) {
            const currentEnergy = window.gameState.character.energy || 80;
            window.gameState.character.energy = Math.max(0, Math.min(100, currentEnergy + effects.energy));
        }

        // 触发天气相关事件
        if (window.storyFlags) {
            window.storyFlags.setFlag(`WEATHER_${weather.id.toUpperCase()}`, true);
        }

        // 显示通知
        if (window.showNotification) {
            window.showNotification(`${weather.icon} ${weather.description}`);
        }
    }

    /**
     * 生成天气预报
     */
    generateForecast() {
        this.forecast = [];
        const season = this.seasons[this.currentSeason];

        // 生成未来3天的预报
        for (let i = 1; i <= 3; i++) {
            const probabilities = season.weatherProbability;
            const random = Math.random();
            let cumulative = 0;
            let forecastWeather = 'sunny';

            for (const [weather, probability] of Object.entries(probabilities)) {
                cumulative += probability;
                if (random < cumulative) {
                    forecastWeather = weather;
                    break;
                }
            }

            const tempRange = season.temperature;
            const temp = Math.round(tempRange.min + Math.random() * (tempRange.max - tempRange.min));

            this.forecast.push({
                day: i,
                weather: forecastWeather,
                temperature: temp
            });
        }
    }

    /**
     * 每小时更新
     */
    hourlyUpdate(hour) {
        // 检查是否需要改变天气
        if (hour - this.lastChangeHour >= this.changeInterval) {
            const changeChance = 0.3; // 30%概率改变天气
            if (Math.random() < changeChance) {
                this.generateWeather();
                this.lastChangeHour = hour;
            }
        }
    }

    /**
     * 每日更新
     */
    dailyUpdate() {
        // 更新季节
        this.updateSeason();

        // 更新天气预报
        this.generateForecast();

        // 重置天气变化计时
        this.lastChangeHour = 0;
    }

    /**
     * 获取当前天气信息
     */
    getCurrentWeatherInfo() {
        const weather = this.weatherTypes[this.currentWeather];
        const season = this.seasons[this.currentSeason];

        return {
            weather: weather.name,
            icon: weather.icon,
            description: weather.description,
            temperature: this.currentTemperature,
            season: season.name,
            visibility: weather.effects.visibility,
            forecast: this.forecast
        };
    }

    /**
     * 更新天气显示
     */
    updateWeatherDisplay() {
        // 查找天气显示元素（如果存在）
        const weatherDisplay = document.getElementById('weatherDisplay');
        if (weatherDisplay) {
            const info = this.getCurrentWeatherInfo();
            weatherDisplay.innerHTML = `${info.icon} ${info.weather} ${info.temperature}°C`;
        }

        // 更新场景描述中的天气（暂时注释，方法不存在）
        // if (window.sceneManager && window.sceneManager.updateWeatherDescription) {
        //     window.sceneManager.updateWeatherDescription(this.currentWeather);
        // }
    }

    /**
     * 检查特定天气条件
     */
    checkWeatherCondition(condition) {
        switch (condition) {
            case 'is_raining':
                return this.currentWeather === 'rainy' || this.currentWeather === 'stormy';
            case 'is_sunny':
                return this.currentWeather === 'sunny';
            case 'is_cold':
                return this.currentTemperature < 10;
            case 'is_hot':
                return this.currentTemperature > 30;
            case 'low_visibility':
                return this.weatherTypes[this.currentWeather].effects.visibility < 50;
            default:
                return false;
        }
    }

    /**
     * 强制设置天气（用于特殊事件）
     */
    forceWeather(weatherType, duration = 8) {
        this.setWeather(weatherType);
        this.weatherDuration = duration;
        console.log(`⚡ 强制天气: ${weatherType} (持续${duration}小时)`);
    }

    /**
     * 保存天气数据
     */
    save() {
        return {
            currentWeather: this.currentWeather,
            currentSeason: this.currentSeason,
            currentTemperature: this.currentTemperature,
            forecast: this.forecast,
            lastChangeHour: this.lastChangeHour,
            weatherDuration: this.weatherDuration
        };
    }

    /**
     * 加载天气数据
     */
    load(data) {
        if (data.currentWeather) this.currentWeather = data.currentWeather;
        if (data.currentSeason) this.currentSeason = data.currentSeason;
        if (data.currentTemperature !== undefined) this.currentTemperature = data.currentTemperature;
        if (data.forecast) this.forecast = data.forecast;
        if (data.lastChangeHour !== undefined) this.lastChangeHour = data.lastChangeHour;
        if (data.weatherDuration !== undefined) this.weatherDuration = data.weatherDuration;

        this.updateWeatherDisplay();
        console.log('🌤️ 天气数据已恢复');
    }

    /**
     * 重置天气系统
     */
    reset() {
        this.currentWeather = 'sunny';
        this.currentSeason = 'spring';
        this.currentTemperature = 20;
        this.forecast = [];
        this.lastChangeHour = 0;
        this.weatherDuration = 8;

        this.init();
    }
}

// 创建全局实例
window.weatherSystem = new WeatherSystem();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherSystem;
}

console.log('🌤️ 天气系统已加载');