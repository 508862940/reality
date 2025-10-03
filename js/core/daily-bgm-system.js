/**
 * 日常BGM系统
 * 管理基于时间、季节、地点的日常背景音乐
 */

class DailyBGMSystem {
    constructor() {
        // BGM配置（占位路径，之后替换为实际文件）
        this.bgmConfig = {
            // 春季
            spring: {
                earlyMorning: 'bgm/daily/spring_early_morning.mp3',  // 5-7点
                morning: 'bgm/daily/spring_morning.mp3',              // 7-12点
                afternoon: 'bgm/daily/spring_afternoon.mp3',          // 12-18点
                evening: 'bgm/daily/spring_evening.mp3',              // 18-22点
                night: 'bgm/daily/spring_night.mp3'                   // 22-5点
            },
            // 夏季
            summer: {
                earlyMorning: 'bgm/daily/summer_early_morning.mp3',
                morning: 'bgm/daily/summer_morning.mp3',
                afternoon: 'bgm/daily/summer_afternoon.mp3',
                evening: 'bgm/daily/summer_evening.mp3',
                night: 'bgm/daily/summer_night.mp3'
            },
            // 秋季
            autumn: {
                earlyMorning: 'bgm/daily/autumn_early_morning.mp3',
                morning: 'bgm/daily/autumn_morning.mp3',
                afternoon: 'bgm/daily/autumn_afternoon.mp3',
                evening: 'bgm/daily/autumn_evening.mp3',
                night: 'bgm/daily/autumn_night.mp3'
            },
            // 冬季
            winter: {
                earlyMorning: 'bgm/daily/winter_early_morning.mp3',
                morning: 'bgm/daily/winter_morning.mp3',
                afternoon: 'bgm/daily/winter_afternoon.mp3',
                evening: 'bgm/daily/winter_evening.mp3',
                night: 'bgm/daily/winter_night.mp3'
            }
        };

        // 特殊天气BGM（覆盖日常）
        this.weatherBGM = {
            rainy: {
                spring: 'bgm/weather/spring_rain.mp3',
                summer: 'bgm/weather/summer_rain.mp3',
                autumn: 'bgm/weather/autumn_rain.mp3',
                winter: 'bgm/weather/winter_rain.mp3'
            },
            stormy: 'bgm/weather/storm.mp3',  // 暴风雨统一BGM
            snowy: 'bgm/weather/snow.mp3',    // 雪天统一BGM
            foggy: null  // 雾天保持原BGM，只降低音量
        };

        // 节日BGM（最高优先级）
        this.festivalBGM = {
            'new_year': 'bgm/festival/new_year.mp3',        // 新年
            'valentine': 'bgm/festival/valentine.mp3',      // 情人节
            'summer_festival': 'bgm/festival/summer.mp3',   // 夏日祭
            'halloween': 'bgm/festival/halloween.mp3',      // 万圣节
            'christmas': 'bgm/festival/christmas.mp3'       // 圣诞节
        };

        // 地点音量调整
        this.locationModifiers = {
            'outdoor': 1.0,       // 户外正常
            'indoor': 0.7,        // 室内柔和
            'underground': 0.5,   // 地下空灵
            'shop': 1.1,          // 商店活泼
            'quiet': 0.3          // 安静场所（图书馆等）
        };

        // 当前状态
        this.currentState = {
            season: null,
            timeOfDay: null,
            weather: null,
            location: null,
            festival: null,
            bgm: null
        };

        // 是否启用
        this.enabled = true;
        this.autoSwitch = true;  // 自动切换

        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 获取初始状态
        this.updateCurrentState();

        // 监听时间变化
        if (window.timeSystem) {
            window.addEventListener('timeChange', (e) => {
                if (this.autoSwitch) {
                    this.onTimeChange(e.detail);
                }
            });
        }

        // 监听天气变化（使用响应式系统）
        if (window.reactiveSystem) {
            window.reactiveSystem.watch('environment.weather', (newWeather, oldWeather) => {
                if (this.autoSwitch) {
                    // 构建detail对象兼容旧接口
                    this.onWeatherChange({ weather: newWeather });
                }
            });
            console.log('🎵 BGM系统已连接响应式天气监听');
        } else {
            // 降级：使用旧的事件监听（如果响应式系统未加载）
            window.addEventListener('weatherChange', (e) => {
                if (this.autoSwitch) {
                    this.onWeatherChange(e.detail);
                }
            });
            console.warn('⚠️ ReactiveSystem未加载，使用降级事件监听');
        }

        console.log('☀️ 日常BGM系统已初始化');
    }

    /**
     * 更新当前状态
     */
    updateCurrentState() {
        // 从各系统获取当前状态
        if (window.timeSystem) {
            this.currentState.season = window.timeSystem.getSeason();
            this.currentState.timeOfDay = window.timeSystem.getCurrentTimeOfDay();
        }

        if (window.weatherSystem) {
            // weatherSystem使用currentWeather属性，不是方法
            this.currentState.weather = window.weatherSystem.currentWeather;
        }

        // 检查节日
        this.currentState.festival = this.checkFestival();
    }

    /**
     * 获取当前应该播放的BGM
     */
    getCurrentBGM() {
        // 优先级：节日 > 特殊天气 > 日常

        // 1. 检查节日
        if (this.currentState.festival) {
            return {
                bgm: this.festivalBGM[this.currentState.festival],
                reason: 'festival',
                priority: 'high'
            };
        }

        // 2. 检查特殊天气
        if (this.currentState.weather && this.weatherBGM[this.currentState.weather]) {
            const weatherBGM = this.weatherBGM[this.currentState.weather];

            // 如果天气BGM分季节
            if (typeof weatherBGM === 'object') {
                return {
                    bgm: weatherBGM[this.currentState.season] || weatherBGM.spring,
                    reason: 'weather',
                    priority: 'medium'
                };
            } else {
                return {
                    bgm: weatherBGM,
                    reason: 'weather',
                    priority: 'medium'
                };
            }
        }

        // 3. 返回日常BGM
        const season = this.currentState.season || 'spring';
        const timeOfDay = this.currentState.timeOfDay || 'morning';

        return {
            bgm: this.bgmConfig[season][timeOfDay],
            reason: 'daily',
            priority: 'low'
        };
    }

    /**
     * 播放当前BGM
     */
    playCurrentBGM(options = {}) {
        if (!this.enabled) return;

        const bgmInfo = this.getCurrentBGM();

        // 如果和当前相同，不切换
        if (bgmInfo.bgm === this.currentState.bgm) {
            console.log('🎵 BGM相同，无需切换');
            return;
        }

        // 获取地点修正音量
        const locationMod = this.locationModifiers[this.currentState.location] || 1.0;
        const baseVolume = options.volume || 0.5;
        const finalVolume = baseVolume * locationMod;

        console.log(`🎵 切换日常BGM: ${bgmInfo.reason} - ${bgmInfo.bgm}`);

        // 通过优先级管理器播放
        if (window.musicPriority) {
            window.musicPriority.requestMusic('daily', bgmInfo.bgm, {
                fadeIn: options.fadeIn || 3000,
                volume: finalVolume,
                reason: bgmInfo.reason
            });
        } else if (window.audioSystem) {
            // 直接播放（降级方案）
            window.audioSystem.playBGM(bgmInfo.bgm, {
                fadeIn: options.fadeIn || 3000,
                volume: finalVolume
            });
        }

        this.currentState.bgm = bgmInfo.bgm;
    }

    /**
     * 时间变化处理
     */
    onTimeChange(detail) {
        const newTimeOfDay = window.timeSystem.getCurrentTimeOfDay();
        const newSeason = window.timeSystem.getSeason();

        // 检查是否需要切换BGM
        if (newTimeOfDay !== this.currentState.timeOfDay ||
            newSeason !== this.currentState.season) {

            this.currentState.timeOfDay = newTimeOfDay;
            this.currentState.season = newSeason;

            console.log(`⏰ 时段变化: ${newTimeOfDay}，季节: ${newSeason}`);

            // 延迟一点切换，避免太突兀
            setTimeout(() => {
                this.playCurrentBGM({ fadeIn: 5000 });
            }, 1000);
        }
    }

    /**
     * 天气变化处理
     */
    onWeatherChange(detail) {
        const newWeather = detail.weather;

        if (newWeather !== this.currentState.weather) {
            this.currentState.weather = newWeather;

            console.log(`🌦️ 天气变化: ${newWeather}`);

            // 特殊天气立即切换
            if (this.weatherBGM[newWeather]) {
                this.playCurrentBGM({ fadeIn: 3000 });
            } else if (newWeather === 'foggy') {
                // 雾天降低音量
                if (window.audioSystem) {
                    window.audioSystem.setLayerVolume('bgm', 0.3);
                }
            }
        }
    }

    /**
     * 位置变化处理
     */
    onLocationChange(newLocation, locationType) {
        this.currentState.location = locationType;

        // 调整音量
        const modifier = this.locationModifiers[locationType] || 1.0;

        if (window.audioSystem) {
            const baseVolume = 0.5;
            window.audioSystem.setLayerVolume('bgm', baseVolume * modifier);
        }

        console.log(`📍 位置变化: ${newLocation} (${locationType})，音量调整: ${modifier}`);
    }

    /**
     * 检查是否是节日
     */
    checkFestival() {
        if (!window.timeSystem) return null;

        const month = window.timeSystem.currentTime.month;
        const day = window.timeSystem.currentTime.day;

        // 简单的节日判断
        if (month === 1 && day === 1) return 'new_year';
        if (month === 2 && day === 14) return 'valentine';
        if (month === 7 && day === 7) return 'summer_festival';
        if (month === 10 && day === 31) return 'halloween';
        if (month === 12 && day === 25) return 'christmas';

        return null;
    }

    /**
     * 手动设置BGM
     */
    setBGM(bgmPath, options = {}) {
        this.enabled = false;  // 暂时禁用自动切换

        if (window.musicPriority) {
            window.musicPriority.requestMusic('daily', bgmPath, options);
        }

        // 恢复自动切换
        if (options.temporary !== false) {
            setTimeout(() => {
                this.enabled = true;
            }, options.duration || 60000);  // 默认1分钟后恢复
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            ...this.currentState,
            enabled: this.enabled,
            autoSwitch: this.autoSwitch,
            currentBGM: this.getCurrentBGM()
        };
    }

    /**
     * 切换自动模式
     */
    toggleAutoSwitch() {
        this.autoSwitch = !this.autoSwitch;
        console.log(`🔄 自动切换BGM: ${this.autoSwitch ? '开启' : '关闭'}`);
        return this.autoSwitch;
    }
}

// 创建全局实例
window.dailyBGM = new DailyBGMSystem();

// 测试命令
window.testDaily = {
    // 手动触发不同时段
    morning: () => {
        window.dailyBGM.currentState.timeOfDay = 'morning';
        window.dailyBGM.playCurrentBGM();
    },
    night: () => {
        window.dailyBGM.currentState.timeOfDay = 'night';
        window.dailyBGM.playCurrentBGM();
    },

    // 手动触发天气
    rain: () => {
        window.dailyBGM.currentState.weather = 'rainy';
        window.dailyBGM.playCurrentBGM();
    },
    sunny: () => {
        window.dailyBGM.currentState.weather = 'sunny';
        window.dailyBGM.playCurrentBGM();
    },

    // 切换季节
    season: (s) => {
        window.dailyBGM.currentState.season = s;
        window.dailyBGM.playCurrentBGM();
    },

    // 查看状态
    status: () => console.table(window.dailyBGM.getStatus()),

    // 切换自动模式
    toggle: () => window.dailyBGM.toggleAutoSwitch()
};

console.log('☀️ 日常BGM系统已加载');
// 导出到全局
window.DailyBGMSystem = DailyBGMSystem;

console.log('测试命令:');
console.log('  testDaily.morning()    - 切换到早晨BGM');
console.log('  testDaily.rain()       - 切换到雨天BGM');
console.log('  testDaily.season("summer") - 切换季节');
console.log('  testDaily.status()     - 查看状态');