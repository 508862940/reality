/**
 * 气候管理器
 * 管理游戏的气候层系统，包括基础气候、季节活动、年份周期等
 * 作为天气系统的上层，提供更宏观的环境控制
 */

class ClimateManager {
    constructor() {
        // 基础气候定义（表层世界）
        this.baseClimate = {
            type: 'subtropical_monsoon',
            name: '亚热带季风气候',
            description: 'B组织温室模拟的稳定气候环境',

            // 基础特征
            features: {
                annualTemp: 20,        // 年均温
                annualRainfall: 1200,  // 年降水量(mm)
                humidityRange: [60, 85],
                monsoonPeriod: [5, 9]  // 5-9月为季风期
            },

            // 季节基础参数
            seasons: {
                spring: {
                    tempRange: [15, 25],
                    avgRainDays: 10,
                    humidity: 75,
                    description: '温暖湿润，万物复苏'
                },
                summer: {
                    tempRange: [25, 35],
                    avgRainDays: 12,
                    humidity: 80,
                    description: '炎热多雨，时有台风'
                },
                autumn: {
                    tempRange: [15, 25],
                    avgRainDays: 6,
                    humidity: 65,
                    description: '秋高气爽，丰收时节'
                },
                winter: {
                    tempRange: [5, 15],
                    avgRainDays: 4,
                    humidity: 60,
                    description: '温和干燥，偶有霜冻'
                }
            }
        };

        // 年份周期系统（3年一循环）
        this.yearCycle = {
            pattern: [
                { type: 'peaceful', name: '和平年', modifier: 1.0 },
                { type: 'turbulent_1', name: '小动荡年', modifier: 1.3 },
                { type: 'turbulent_2', name: '大动荡年', modifier: 1.8 }
            ],
            specialYears: {
                9: { type: 'override', name: '全面复写年' }  // 每9年一次特殊年
            }
        };

        // 季节特色活动
        this.seasonalEvents = {
            spring: [
                {
                    id: 'sakura_week',
                    name: '樱花周',
                    week: 2,  // 春季第2周
                    duration: 7,
                    active: false,
                    effects: {
                        mood: 10,
                        romance: 20
                    },
                    description: '全城樱花盛开，浪漫氛围浓厚'
                },
                {
                    id: 'spring_rain',
                    name: '清明雨',
                    week: 4,
                    duration: 3,
                    active: false,
                    forceWeather: 'rainy',
                    description: '清明时节雨纷纷'
                }
            ],
            summer: [
                {
                    id: 'summer_festival',
                    name: '夏日祭',
                    week: 6,
                    duration: 3,
                    active: false,
                    effects: {
                        mood: 15,
                        specialMerchants: true
                    },
                    description: '传统夏日庆典，烟花大会'
                },
                {
                    id: 'heat_wave',
                    name: '三伏天',
                    week: 8,
                    duration: 10,
                    active: false,
                    effects: {
                        tempBonus: 5,
                        energy: -10
                    },
                    description: '一年中最热的时期'
                }
            ],
            autumn: [
                {
                    id: 'maple_season',
                    name: '枫叶季',
                    week: 3,
                    duration: 14,
                    active: false,
                    effects: {
                        scenery: 'red_maple',
                        photography: 30
                    },
                    description: '满山红叶，美不胜收'
                },
                {
                    id: 'harvest_festival',
                    name: '丰收节',
                    week: 8,
                    duration: 3,
                    active: false,
                    effects: {
                        cropYield: 20,
                        marketDiscount: 10
                    },
                    description: '庆祝丰收的传统节日'
                }
            ],
            winter: [
                {
                    id: 'first_snow',
                    name: '初雪',
                    trigger: 'weather',  // 天气触发型
                    active: false,
                    oneTime: true,  // 每年只触发一次
                    effects: {
                        mood: 5,
                        specialDialog: 'first_snow'
                    },
                    description: '今年的第一场雪'
                },
                {
                    id: 'new_year',
                    name: '新年',
                    week: 4,
                    duration: 7,
                    active: false,
                    effects: {
                        familyEvents: true,
                        redPackets: true
                    },
                    description: '新年快乐，万象更新'
                }
            ]
        };

        // 极端天气事件（动荡年特有）
        this.extremeEvents = {
            // 温度类
            heatWave: {
                name: '热浪',
                icon: '🔥',
                probability: 0.15,
                duration: [3, 7],
                seasons: ['summer'],
                yearTypes: ['turbulent_1', 'turbulent_2'],
                effects: {
                    temperature: 15,
                    cropGrowthRate: -0.5,
                    waterDemand: 2.0,
                    energyDrain: 1.5
                },
                marketImpact: {
                    water: 3.0,
                    iceCream: 5.0,
                    electricity: 2.0
                }
            },
            coldVortex: {
                name: '寒潮',
                icon: '🥶',
                probability: 0.15,
                duration: [2, 5],
                seasons: ['winter'],
                yearTypes: ['turbulent_1', 'turbulent_2'],
                effects: {
                    temperature: -20,
                    cropDamage: 0.3,
                    heatingCost: 5.0
                },
                marketImpact: {
                    fuel: 2.0,
                    warmClothes: 1.5,
                    hotDrinks: 2.5
                }
            },
            // 水文类
            drought: {
                name: '干旱',
                icon: '🏜️',
                probability: 0.1,
                duration: [15, 30],
                seasons: ['summer', 'autumn'],
                yearTypes: ['turbulent_2'],
                effects: {
                    rainfall: -0.8,
                    cropYield: -0.6,
                    fireRisk: 1.5
                },
                marketImpact: {
                    water: 10.0,
                    food: 2.0
                }
            },
            flood: {
                name: '洪涝',
                icon: '🌊',
                probability: 0.1,
                duration: [3, 5],
                seasons: ['summer'],
                yearTypes: ['turbulent_2'],
                effects: {
                    rainfall: 5.0,
                    cropDestroy: 0.7,
                    transportation: -0.8
                },
                marketImpact: {
                    food: 2.0,
                    medicine: 3.0
                }
            },
            // 风暴类
            typhoon: {
                name: '台风',
                icon: '🌀',
                probability: 0.08,
                duration: [1, 2],
                seasons: ['summer', 'autumn'],
                yearTypes: ['turbulent_1', 'turbulent_2'],
                effects: {
                    wind: 150,
                    buildingDamage: 0.3,
                    stayIndoor: true
                },
                marketImpact: {
                    all: 0,  // 市场关闭
                    emergency: 5.0
                }
            }
        };

        // 全面复写年事件
        this.overrideEvents = {
            eternalSpring: {
                name: '永恒之春',
                description: 'B组织实验：全年维持春天',
                effects: {
                    lockSeason: 'spring',
                    mood: 20,
                    cropDiversity: -0.5
                },
                storyTrigger: 'ETERNAL_SPRING_EVENT'
            },
            dataStorm: {
                name: '数据紊乱',
                description: '气候系统故障，天气完全随机',
                effects: {
                    randomWeather: true,
                    predictability: 0,
                    extremeChance: 0.8
                },
                storyTrigger: 'CLIMATE_CHAOS_EVENT'
            },
            iceAge: {
                name: '冰河纪元',
                description: '温室系统过度制冷',
                effects: {
                    globalTemp: -30,
                    survivalMode: true
                },
                storyTrigger: 'ICE_AGE_EVENT'
            }
        };

        // 当前状态
        this.currentState = {
            climate: 'subtropical_monsoon',
            year: 1,
            yearType: 'peaceful',
            turbulenceLevel: 0,
            activeSeasonalEvent: null,
            activeExtremeEvent: null,
            overrideEvent: null
        };

        // 预留的接口
        this.personalityHandlers = {};  // 性格影响处理器
        this.cropHandlers = {};         // 作物响应处理器
        this.economyHandlers = {};      // 经济影响处理器

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        console.log('🌍 气候管理器初始化');
        this.updateYearType();
    }

    /**
     * 获取当前年份类型
     */
    getYearType(year = null) {
        if (!year) year = this.currentState.year;

        // 检查特殊年
        if (this.yearCycle.specialYears[year]) {
            return this.yearCycle.specialYears[year];
        }

        // 普通循环
        const cycleIndex = (year - 1) % this.yearCycle.pattern.length;
        return this.yearCycle.pattern[cycleIndex];
    }

    /**
     * 更新年份类型
     */
    updateYearType() {
        const year = window.timeSystem?.currentTime?.year || 1;
        const yearInfo = this.getYearType(year);

        if (this.currentState.yearType !== yearInfo.type) {
            const oldType = this.currentState.yearType;
            this.currentState.year = year;
            this.currentState.yearType = yearInfo.type;
            this.currentState.turbulenceLevel = yearInfo.modifier || 0;

            console.log(`📅 年份类型变化: ${oldType} → ${yearInfo.name}`);

            // 通知其他系统
            if (window.showNotification) {
                window.showNotification(`进入${yearInfo.name}`);
            }
        }
    }

    /**
     * 检查并激活季节活动
     */
    checkSeasonalEvents(season, weekOfSeason) {
        if (!this.seasonalEvents[season]) return;

        const events = this.seasonalEvents[season];
        for (const event of events) {
            // 检查周触发型事件
            if (event.week === weekOfSeason && !event.active) {
                this.activateSeasonalEvent(event, season);
            }

            // 检查持续时间
            if (event.active && event.endWeek && weekOfSeason > event.endWeek) {
                this.deactivateSeasonalEvent(event);
            }
        }
    }

    /**
     * 激活季节活动
     */
    activateSeasonalEvent(event, season) {
        event.active = true;
        event.endWeek = event.week + Math.ceil(event.duration / 7);
        this.currentState.activeSeasonalEvent = event.id;

        console.log(`🎉 季节活动开始: ${event.name}`);

        // 应用效果
        if (event.effects) {
            this.applyEventEffects(event.effects);
        }

        // 强制天气
        if (event.forceWeather && window.weatherSystem) {
            window.weatherSystem.forceWeather(event.forceWeather, event.duration * 24);
        }

        // 显示通知
        if (window.showNotification) {
            window.showNotification(`${event.name}开始了！${event.description}`);
        }
    }

    /**
     * 结束季节活动
     */
    deactivateSeasonalEvent(event) {
        event.active = false;
        delete event.endWeek;

        if (this.currentState.activeSeasonalEvent === event.id) {
            this.currentState.activeSeasonalEvent = null;
        }

        console.log(`🏁 季节活动结束: ${event.name}`);
    }

    /**
     * 检查极端天气事件
     */
    checkExtremeEvents(season) {
        // 只在动荡年检查
        if (this.currentState.yearType === 'peaceful') return;

        // 如果已有极端事件在进行，不触发新的
        if (this.currentState.activeExtremeEvent) return;

        // 根据季节和年份类型筛选可能的事件
        for (const [eventId, event] of Object.entries(this.extremeEvents)) {
            if (!event.seasons.includes(season)) continue;
            if (!event.yearTypes.includes(this.currentState.yearType)) continue;

            // 根据概率决定是否触发
            const chance = event.probability * this.currentState.turbulenceLevel;
            if (Math.random() < chance) {
                this.triggerExtremeEvent(eventId, event);
                break;
            }
        }
    }

    /**
     * 触发极端天气事件
     */
    triggerExtremeEvent(eventId, event) {
        // 计算持续时间
        const duration = event.duration[0] +
            Math.floor(Math.random() * (event.duration[1] - event.duration[0] + 1));

        this.currentState.activeExtremeEvent = {
            id: eventId,
            name: event.name,
            remainingDays: duration,
            effects: event.effects
        };

        console.log(`⚠️ 极端天气事件: ${event.icon} ${event.name} (持续${duration}天)`);

        // 应用天气效果
        if (event.effects.temperature && window.weatherSystem) {
            const currentTemp = window.weatherSystem.currentTemperature;
            window.weatherSystem.currentTemperature = currentTemp + event.effects.temperature;
        }

        // 通知
        if (window.showNotification) {
            window.showNotification(`⚠️ 极端天气预警：${event.name}来袭！`, 'warning');
        }

        // 触发剧情标记
        if (window.storyFlags) {
            window.storyFlags.setFlag(`EXTREME_${eventId.toUpperCase()}`, true);
        }
    }

    /**
     * 应用事件效果
     */
    applyEventEffects(effects) {
        // 心情影响
        if (effects.mood && window.gameState?.character) {
            const current = window.gameState.character.mood || 50;
            window.gameState.character.mood = Math.max(0, Math.min(100, current + effects.mood));
        }

        // 精力影响
        if (effects.energy && window.gameState?.character) {
            const current = window.gameState.character.energy || 80;
            window.gameState.character.energy = Math.max(0, Math.min(100, current + effects.energy));
        }
    }

    /**
     * 获取气候对温度的修正
     */
    getTemperatureModifier(basetemp, season) {
        let modifier = 0;

        // 季节基础修正
        const seasonData = this.baseClimate.seasons[season];
        if (seasonData) {
            const avgTemp = (seasonData.tempRange[0] + seasonData.tempRange[1]) / 2;
            modifier = avgTemp - this.baseClimate.features.annualTemp;
        }

        // 季节活动修正
        if (this.currentState.activeSeasonalEvent) {
            const events = this.seasonalEvents[season];
            const activeEvent = events?.find(e => e.id === this.currentState.activeSeasonalEvent);
            if (activeEvent?.effects?.tempBonus) {
                modifier += activeEvent.effects.tempBonus;
            }
        }

        // 极端事件修正
        if (this.currentState.activeExtremeEvent?.effects?.temperature) {
            modifier += this.currentState.activeExtremeEvent.effects.temperature;
        }

        // 动荡年波动
        if (this.currentState.turbulenceLevel > 1) {
            modifier += (Math.random() - 0.5) * 10 * (this.currentState.turbulenceLevel - 1);
        }

        return modifier;
    }

    /**
     * 获取降水概率修正
     */
    getRainfallModifier(season) {
        let modifier = 1.0;

        // 季风期增加降水
        const month = window.timeSystem?.currentTime?.month || 1;
        if (this.baseClimate.features.monsoonPeriod.includes(month)) {
            modifier *= 1.5;
        }

        // 极端事件影响
        if (this.currentState.activeExtremeEvent?.effects?.rainfall) {
            modifier *= this.currentState.activeExtremeEvent.effects.rainfall;
        }

        // 动荡年增加变化（0=平和年不修正，1+=动荡年增加波动）
        if (this.currentState.turbulenceLevel > 0) {
            modifier *= (1.0 + this.currentState.turbulenceLevel * 0.2); // 每级+20%波动
        }

        return modifier;
    }

    /**
     * 每日更新
     */
    dailyUpdate() {
        // 更新年份类型
        this.updateYearType();

        // 检查极端事件持续时间
        if (this.currentState.activeExtremeEvent) {
            this.currentState.activeExtremeEvent.remainingDays--;
            if (this.currentState.activeExtremeEvent.remainingDays <= 0) {
                console.log(`☀️ 极端天气结束: ${this.currentState.activeExtremeEvent.name}`);
                this.currentState.activeExtremeEvent = null;
            }
        }

        // 检查季节活动（每周检查）
        const weekOfSeason = Math.floor((window.timeSystem?.currentTime?.dayOfYear || 1) / 7) % 13;
        const season = window.timeSystem?.currentTime?.season || 'spring';
        this.checkSeasonalEvents(season, weekOfSeason);

        // 随机检查极端天气（动荡年每日5%概率）
        if (Math.random() < 0.05) {
            this.checkExtremeEvents(season);
        }
    }

    /**
     * 获取市场价格修正
     */
    getMarketModifiers() {
        const modifiers = {};

        // 极端天气的市场影响
        if (this.currentState.activeExtremeEvent) {
            const eventId = this.currentState.activeExtremeEvent.id;
            const event = this.extremeEvents[eventId];
            if (event?.marketImpact) {
                Object.assign(modifiers, event.marketImpact);
            }
        }

        // 季节活动的市场影响
        if (this.currentState.activeSeasonalEvent) {
            const season = window.timeSystem?.currentTime?.season || 'spring';
            const events = this.seasonalEvents[season];
            const activeEvent = events?.find(e => e.id === this.currentState.activeSeasonalEvent);
            if (activeEvent?.effects?.marketDiscount) {
                modifiers.discount = activeEvent.effects.marketDiscount;
            }
        }

        return modifiers;
    }

    /**
     * 获取作物生长修正
     */
    getCropGrowthModifiers() {
        let growthRate = 1.0;
        let yieldModifier = 1.0;

        // 极端天气影响
        if (this.currentState.activeExtremeEvent?.effects) {
            const effects = this.currentState.activeExtremeEvent.effects;
            if (effects.cropGrowthRate) growthRate *= effects.cropGrowthRate;
            if (effects.cropYield) yieldModifier *= (1 + effects.cropYield);
            if (effects.cropDamage) yieldModifier *= (1 - effects.cropDamage);
        }

        // 季节活动影响
        if (this.currentState.activeSeasonalEvent) {
            const season = window.timeSystem?.currentTime?.season || 'spring';
            const events = this.seasonalEvents[season];
            const activeEvent = events?.find(e => e.id === this.currentState.activeSeasonalEvent);
            if (activeEvent?.effects?.cropYield) {
                yieldModifier *= (1 + activeEvent.effects.cropYield / 100);
            }
        }

        return { growthRate, yieldModifier };
    }

    /**
     * 注册性格处理器（预留接口）
     */
    registerPersonalityHandler(personality, handler) {
        this.personalityHandlers[personality] = handler;
        console.log(`🧠 注册性格处理器: ${personality}`);
    }

    /**
     * 获取活动建议（预留接口）
     */
    getActivitySuggestion(character, weather) {
        const personality = character.personality || 'normal';
        if (this.personalityHandlers[personality]) {
            return this.personalityHandlers[personality](weather, this.currentState);
        }
        return null;
    }

    /**
     * 获取当前气候信息（供UI显示）
     */
    getCurrentClimate() {
        return {
            yearType: this.currentState.yearType,
            turbulenceLevel: this.currentState.turbulenceLevel,
            seasonalEvent: this.currentState.activeSeasonalEvent,
            extremeEvent: this.currentState.activeExtremeEvent
        };
    }

    /**
     * 保存气候数据
     */
    save() {
        return {
            currentState: this.currentState,
            seasonalEvents: this.seasonalEvents  // 保存活动状态
        };
    }

    /**
     * 加载气候数据
     */
    load(data) {
        if (data.currentState) {
            this.currentState = data.currentState;
        }
        if (data.seasonalEvents) {
            // 恢复活动状态
            for (const season in data.seasonalEvents) {
                if (this.seasonalEvents[season]) {
                    const savedEvents = data.seasonalEvents[season];
                    const currentEvents = this.seasonalEvents[season];
                    for (let i = 0; i < currentEvents.length; i++) {
                        if (savedEvents[i]?.active) {
                            currentEvents[i].active = savedEvents[i].active;
                            currentEvents[i].endWeek = savedEvents[i].endWeek;
                        }
                    }
                }
            }
        }
        console.log('🌍 气候数据已恢复');
    }

    /**
     * 重置气候系统
     */
    reset() {
        this.currentState = {
            climate: 'subtropical_monsoon',
            year: 1,
            yearType: 'peaceful',
            turbulenceLevel: 0,
            activeSeasonalEvent: null,
            activeExtremeEvent: null,
            overrideEvent: null
        };

        // 重置所有季节活动
        for (const season in this.seasonalEvents) {
            this.seasonalEvents[season].forEach(event => {
                event.active = false;
                delete event.endWeek;
            });
        }

        console.log('🌍 气候系统已重置');
    }
}

// 创建全局实例
window.climateManager = new ClimateManager();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClimateManager;
}

// 测试命令集（开发用）
window.testClimate = {
    // 显示当前状态
    status: () => {
        const cm = window.climateManager;
        console.log('=== 🌍 气候系统状态 ===');
        console.log('基础气候:', cm.baseClimate.name);
        console.log('当前年份:', cm.currentState.year);
        console.log('年份类型:', cm.currentState.yearType);
        console.log('动荡等级:', cm.currentState.turbulenceLevel);
        console.log('季节活动:', cm.currentState.activeSeasonalEvent);
        console.log('极端天气:', cm.currentState.activeExtremeEvent);
        console.log('===================');
        return cm.currentState;
    },

    // 测试樱花周
    sakura: () => {
        console.log('🌸 触发樱花周...');
        window.climateManager.checkSeasonalEvents('spring', 2);
        const event = window.climateManager.seasonalEvents.spring[0];
        console.log('樱花周状态:', event.active ? '进行中' : '未激活');
        return event;
    },

    // 测试夏日祭
    festival: () => {
        console.log('🎆 触发夏日祭...');
        window.climateManager.checkSeasonalEvents('summer', 6);
        const event = window.climateManager.seasonalEvents.summer[0];
        console.log('夏日祭状态:', event.active ? '进行中' : '未激活');
        return event;
    },

    // 切换到动荡年
    turbulent: (level = 1) => {
        const years = { 1: 2, 2: 3 }; // 第2年是小动荡，第3年是大动荡
        window.climateManager.currentState.year = years[level] || 2;
        window.climateManager.updateYearType();
        console.log(`⚠️ 切换到动荡等级 ${level}`);
        return window.climateManager.currentState;
    },

    // 触发极端天气
    extreme: (type = 'heatWave') => {
        const event = window.climateManager.extremeEvents[type];
        if (event) {
            window.climateManager.triggerExtremeEvent(type, event);
            console.log(`🌪️ 触发极端天气: ${event.name}`);
            return window.climateManager.currentState.activeExtremeEvent;
        } else {
            console.log('未知的极端天气类型');
            console.log('可用类型:', Object.keys(window.climateManager.extremeEvents));
        }
    },

    // 推进一天
    nextDay: () => {
        console.log('⏭️ 推进一天...');
        window.climateManager.dailyUpdate();
        if (window.weatherSystem) {
            window.weatherSystem.dailyUpdate();
        }
        return window.climateManager.currentState;
    },

    // 测试存档
    testSave: () => {
        const data = window.climateManager.save();
        console.log('💾 存档数据:', data);
        return data;
    },

    // 测试读档
    testLoad: (data) => {
        if (!data) {
            data = window.climateManager.save();
        }
        window.climateManager.reset();
        window.climateManager.load(data);
        console.log('📂 读档完成');
        return window.climateManager.currentState;
    },

    // 显示所有可用命令
    help: () => {
        console.log(`
🌍 气候系统测试命令：
================================
testClimate.status()    - 查看当前状态
testClimate.sakura()    - 触发樱花周
testClimate.festival()  - 触发夏日祭
testClimate.turbulent(1) - 切换到小动荡年
testClimate.turbulent(2) - 切换到大动荡年
testClimate.extreme('heatWave') - 触发热浪
testClimate.extreme('coldVortex') - 触发寒潮
testClimate.extreme('drought') - 触发干旱
testClimate.extreme('flood') - 触发洪涝
testClimate.extreme('typhoon') - 触发台风
testClimate.nextDay()   - 推进一天
testClimate.testSave()  - 测试存档
testClimate.testLoad()  - 测试读档
================================
        `);
    }
};

console.log('🌍 气候管理器已加载');
console.log('💡 输入 testClimate.help() 查看测试命令');