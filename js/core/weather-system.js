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
                description: '晴空万里，阳光明媚',
                detailDescription: '万里无云，阳光洒满大地，是适合户外活动的好天气。温暖的阳光让人心情愉悦。',
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
                description: '云层密布，遮蔽阳光',
                detailDescription: '厚厚的云层遮挡了阳光，天空灰蒙蒙的。空气有些闷热，让人提不起精神。',
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
                description: '淅淅沥沥的雨声',
                detailDescription: '细雨绵绵，雨滴敲打着窗户。空气湿润，地面湿滑，记得带伞出门。',
                visibilityConditions: {  // 🆕 雨天特效可见性
                    // 户外雨滴特效，室内看不到
                    outdoor: true,
                    locations: {
                        visible: ['all_outdoor'],  // 所有户外
                        hidden: ['indoor', 'underground', 'covered_area']  // 室内/有遮挡
                    }
                },
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
                description: '电闪雷鸣，狂风暴雨',
                detailDescription: '乌云密布，雷声轰鸣，瓢泼大雨倾盆而下。能见度极低，建议留在室内等待雨势减弱。',
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
                description: '雪花纷纷扬扬飘落',
                detailDescription: '洁白的雪花从天而降，为世界披上银装。空气清冽，脚下的积雪发出咯吱咯吱的声音。',
                visibilityConditions: {  // 🆕 雪天特效可见性
                    outdoor: true,
                    locations: {
                        visible: ['all_outdoor'],
                        hidden: ['indoor', 'underground', 'covered_area']
                    }
                },
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
                description: '浓雾笼罩，朦胧不清',
                detailDescription: '大雾弥漫，能见度极低。远处的景物都笼罩在白茫茫的雾气中，若隐若现。出行需格外小心。',
                effects: {
                    mood: -3,
                    energy: 0,
                    visibility: 20
                }
            },

            // ===== 特殊天气 =====
            sakura: {
                id: 'sakura',
                name: '樱花飘落',
                icon: '🌸',
                description: '樱花花瓣漫天飞舞',
                detailDescription: '粉色的樱花花瓣随风飘舞，空气中弥漫着淡淡的花香。浪漫的氛围让人心旷神怡。',
                baseWeather: 'sunny',  // 基于晴天
                specialEffect: 'sakura_petals',  // 樱花特效
                isSpecial: true,  // 标记为特殊天气
                conditions: {  // 触发条件
                    time: { season: 'spring' },
                    climate: { event: 'SAKURA_WEEK' }
                },
                visibilityConditions: {  // 🆕 特效可见性条件
                    outdoor: true,  // 户外可见
                    locations: {
                        // 增强区域（花瓣密度更高）
                        enhanced: ['park', 'school_yard', 'cherry_blossom_avenue'],
                        // 可见区域（正常密度）
                        visible: ['street', 'square', 'commercial_district'],
                        // 室内完全不可见
                        hidden: ['indoor', 'underground', 'building_interior']
                    }
                },
                effects: {
                    mood: 5,      // 心情+5
                    spirit: 3,    // 精神+3
                    energy: 0,
                    visibility: 95,
                    romantic: 10  // 浪漫值+10
                }
            },

            rainbow: {
                id: 'rainbow',
                name: '雨后彩虹',
                icon: '🌈',
                description: '七彩虹桥横跨天际',
                detailDescription: '雨过天晴，绚丽的彩虹挂在天空。这是幸运的征兆，让人充满希望。',
                baseWeather: 'sunny',
                specialEffect: 'rainbow_arc',
                isSpecial: true,
                conditions: {  // 雨天转晴时有概率出现
                    weather: { previous: ['rainy', 'stormy'] }
                },
                visibilityConditions: {  // 🆕 彩虹可见性
                    outdoor: true,  // 必须户外才能看到
                    sky_visible: true,  // 需要能看到天空
                    locations: {
                        // 视野开阔的地方看得最清楚
                        enhanced: ['rooftop', 'hilltop', 'open_field', 'waterfront'],
                        // 普通户外可见
                        visible: ['street', 'park', 'square'],
                        // 室内/遮挡区域不可见
                        hidden: ['indoor', 'underground', 'tunnel', 'dense_forest']
                    }
                },
                effects: {
                    mood: 15,     // 大幅提升心情
                    spirit: 10,   // 精神恢复
                    energy: 5,
                    visibility: 100,
                    luck: 20      // 幸运值+20（影响随机事件）
                },
                duration: 2  // 持续2小时
            },

            meteor_shower: {
                id: 'meteor_shower',
                name: '流星雨',
                icon: '🌠',
                description: '繁星划过夜空',
                detailDescription: '无数流星划破夜空，留下璀璨的轨迹。这是难得一见的天文奇观，许个愿吧。',
                baseWeather: 'clear_night',  // 晴朗夜晚
                specialEffect: 'meteor_rain',
                isSpecial: true,
                conditions: {  // 特定时间+天文事件
                    time: { hour: { min: 20, max: 4 } },  // 夜晚
                    climate: { event: 'METEOR_SHOWER_EVENT' }
                },
                visibilityConditions: {  // 🆕 流星雨可见性
                    outdoor: true,  // 必须户外
                    sky_visible: true,  // 必须能看到天空
                    time: { hour: { min: 20, max: 4 } },  // 必须夜晚
                    locations: {
                        // 最佳观测点（流星密度高）
                        enhanced: ['rooftop', 'hilltop', 'observatory', 'open_field', 'beach'],
                        // 普通户外可见
                        visible: ['park', 'street', 'square'],
                        // 任何有遮挡的地方不可见
                        hidden: ['indoor', 'underground', 'tunnel', 'dense_forest', 'building_interior']
                    },
                    weather_required: ['sunny', 'cloudy']  // 需要晴朗/少云天气
                },
                effects: {
                    mood: 10,
                    spirit: 15,   // 大幅提升精神
                    energy: 0,
                    visibility: 100,
                    luck: 15,
                    stargazing: true  // 解锁观星活动
                },
                npcEffects: {  // NPC特殊反应
                    romantic: 'special_dialogue',  // 浪漫约会对话
                    scientist: 'excited'           // 科学家NPC兴奋
                }
            },

            polluted: {
                id: 'polluted',
                name: '污染雾霾',
                icon: '☢️',
                description: '有毒雾霾笼罩',
                detailDescription: '灰黄色的雾霾弥漫在空气中，散发着刺鼻的气味。呼吸困难，必须做好防护。',
                baseWeather: 'foggy',
                specialEffect: 'pollution_haze',
                isSpecial: true,
                isDangerous: true,  // 危险天气
                conditions: {  // 只在污染区域或事件期间
                    OR: [
                        { location: { zone: 'pollution_area' } },
                        { climate: { event: 'POLLUTION_CRISIS' } }
                    ]
                },
                visibilityConditions: {  // 🆕 污染特效可见性
                    // 污染是区域性的，在污染区域内外都能看到特效
                    locations: {
                        // 污染核心区（特效最强）
                        enhanced: ['pollution_core', 'factory_district', 'waste_zone'],
                        // 污染扩散区（正常强度）
                        visible: ['pollution_area', 'industrial_zone', 'old_district'],
                        // 室内有过滤系统的地方看不到
                        hidden: ['clean_room', 'sealed_building', 'air_filtered_zone']
                    },
                    // 室内也能看到污染特效（因为空气污染会渗透）
                    penetrates_indoor: true
                },
                effects: {
                    mood: -5,
                    spirit: -10,  // 精神大幅下降
                    health: -3,   // 健康减少
                    energy: -5,
                    visibility: 30,
                    mask_recommended: true  // 建议口罩
                },
                locationMultiplier: {  // 区域增强效果
                    pollution_core: 2.0,  // 核心区域双倍伤害
                    pollution_area: 1.0,  // 普通污染区
                    safe_zone: 0          // 安全区无影响
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
                    snowy: 0,
                    // 特殊天气（需满足条件才会生成）
                    sakura: 0,     // 由气候事件触发
                    rainbow: 0.05  // 雨后5%概率
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
                    snowy: 0,
                    rainbow: 0.05,
                    meteor_shower: 0  // 由天文事件触发
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
                    snowy: 0,
                    rainbow: 0.05,
                    meteor_shower: 0
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
                    snowy: 0.3,
                    rainbow: 0.02,  // 冬季彩虹罕见
                    meteor_shower: 0
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
        // 1. 获取初始季节（从时间系统或worldState）
        if (window.timeSystem) {
            this.currentSeason = window.timeSystem.getSeason();
            console.log(`🌤️ 初始季节: ${this.seasons[this.currentSeason]?.name}`);
        } else {
            this.updateSeason();
        }

        // 2. 生成初始天气
        this.generateWeather();
        this.generateForecast();

        // 3. 🔥 设置响应式监听（核心！）
        this.setupReactiveListeners();

        // 4. 同步初始状态到worldState
        this.syncToWorldState();

        // 5. 集成气候管理器
        if (window.climateManager) {
            console.log('🌍 天气系统已连接气候管理器');
        }

        console.log('🌤️ 天气系统初始化完成（响应式模式）');
    }

    /**
     * 设置响应式监听器（自动响应时间变化）
     */
    setupReactiveListeners() {
        if (!window.reactiveSystem) {
            console.warn('⚠️ 响应式系统未初始化，天气系统将无法自动更新');
            return;
        }

        // 🔥 监听季节变化（时间系统推进时自动触发）
        window.reactiveSystem.watch('gameTime.season', (newSeason, oldSeason) => {
            console.log(`🍂 响应式：季节变化 ${oldSeason} → ${newSeason}`);

            // 转换季节名称（'春季' → 'spring'）
            const seasonMap = {
                '春季': 'spring',
                '夏季': 'summer',
                '秋季': 'autumn',
                '冬季': 'winter'
            };
            const seasonKey = seasonMap[newSeason] || newSeason;

            if (seasonKey !== this.currentSeason) {
                this.currentSeason = seasonKey;
                // 季节变化时重新生成天气
                this.generateWeather();
                this.syncToWorldState();
            }
        });

        // 🔥 监听天气强制变化（外部系统触发）
        window.reactiveSystem.watch('environment.weather', (newWeather, oldWeather) => {
            if (newWeather !== oldWeather && this.weatherTypes[newWeather]) {
                console.log(`🌦️ 响应式：天气变化 ${oldWeather} → ${newWeather}`);
                this.currentWeather = newWeather;
            }
        });

        console.log('✅ 天气系统响应式监听已设置');
    }

    /**
     * 同步到世界快照
     */
    syncToWorldState() {
        if (window.worldState && window.worldState.state.environment) {
            window.worldState.state.environment.season = this.seasons[this.currentSeason].name;
            window.worldState.state.environment.weather = this.weatherTypes[this.currentWeather].name;
            window.worldState.state.environment.temperature = this.currentTemperature;

            // 🌤️ Stage 3: 同步天气预报到worldState
            window.worldState.state.environment.forecast = this.forecast || [];
        }
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
        // 🔥 关键修复：从时间系统直接获取季节，不再重新计算
        if (!window.timeSystem) {
            console.warn('⚠️ 时间系统未初始化，无法更新季节');
            return;
        }

        const newSeason = window.timeSystem.getSeason(); // 'spring', 'summer', 'autumn', 'winter'

        if (newSeason !== this.currentSeason) {
            const oldSeason = this.currentSeason;
            this.currentSeason = newSeason;
            console.log(`🍂 季节变化: ${this.seasons[oldSeason]?.name || oldSeason} → ${this.seasons[newSeason]?.name || newSeason}`);

            // 更新worldState中的季节
            if (window.worldState && window.worldState.state.environment) {
                window.worldState.state.environment.season = this.seasons[newSeason].name;
            }

            // 触发季节变化事件
            if (window.storyFlags) {
                window.storyFlags.setFlag(`SEASON_${newSeason.toUpperCase()}`, true);
            }

            // 通知响应式系统
            if (window.reactiveSystem) {
                window.reactiveSystem.notify('environment.season', this.seasons[newSeason].name, this.seasons[oldSeason]?.name);
            }
        }
    }

    /**
     * 检查特殊天气条件（使用ConditionEngine）
     * @param {string} weatherType - 天气类型ID
     * @returns {boolean} 条件是否满足
     */
    checkSpecialWeatherConditions(weatherType) {
        const weather = this.weatherTypes[weatherType];

        // 普通天气无条件限制
        if (!weather.isSpecial || !weather.conditions) {
            return true;
        }

        // 使用ConditionEngine检查条件
        if (!window.ConditionEngine) {
            console.warn('⚠️ ConditionEngine未加载，跳过特殊天气');
            return false;
        }

        // 构建上下文
        const context = {
            weather: this.currentWeather,
            previousWeather: this.previousWeather || this.currentWeather,
            season: this.currentSeason,
            time: window.timeSystem?.currentTime,
            location: window.worldState?.state?.character?.location,
            climate: window.climateManager?.currentState
        };

        const result = window.ConditionEngine.check(weather.conditions, context);

        if (!result) {
            console.log(`🚫 特殊天气 ${weatherType} 条件不满足`);
        }

        return result;
    }

    /**
     * 生成天气
     * 🎲 Stage 4: 使用RandomEngine加权随机
     * 🌸 Stage 6: 集成ConditionEngine进行特殊天气条件判断
     */
    generateWeather() {
        const season = this.seasons[this.currentSeason];
        const probabilities = season.weatherProbability;

        // 获取气候系统的降水修正
        let rainfallModifier = 1.0;
        if (window.climateManager) {
            rainfallModifier = window.climateManager.getRainfallModifier(this.currentSeason);
        }

        // 🎲 构建加权选项（应用气候修正 + 条件过滤）
        const weatherOptions = [];
        for (const [weather, probability] of Object.entries(probabilities)) {
            // 🌸 检查特殊天气条件
            if (!this.checkSpecialWeatherConditions(weather)) {
                continue; // 条件不满足，跳过此天气
            }

            // 雨天相关天气应用降水修正
            let adjustedWeight = probability;
            if ((weather === 'rainy' || weather === 'stormy') && rainfallModifier !== 1.0) {
                adjustedWeight = Math.min(1, probability * rainfallModifier);
            }

            // 只添加权重>0的选项
            if (adjustedWeight > 0) {
                weatherOptions.push({
                    value: weather,
                    weight: adjustedWeight
                });
            }
        }

        // 防止所有选项被过滤（保底晴天）
        if (weatherOptions.length === 0) {
            console.warn('⚠️ 所有天气选项被过滤，使用晴天');
            weatherOptions.push({ value: 'sunny', weight: 1.0 });
        }

        // 🎲 使用RandomEngine的加权随机选择天气
        let selectedWeather;
        if (window.RandomEngine) {
            selectedWeather = window.RandomEngine.weightedRandom(weatherOptions);
        } else {
            // 降级方案：如果RandomEngine未加载，使用原始方法
            console.warn('⚠️ RandomEngine未加载，使用降级随机方法');
            const random = Math.random();
            let cumulative = 0;
            const totalWeight = weatherOptions.reduce((sum, opt) => sum + opt.weight, 0);

            for (const option of weatherOptions) {
                cumulative += option.weight / totalWeight;
                if (random < cumulative) {
                    selectedWeather = option.value;
                    break;
                }
            }
        }

        // 保存上一个天气（用于彩虹等条件判断）
        this.previousWeather = this.currentWeather;

        this.setWeather(selectedWeather);

        // 🎲 生成温度（使用RandomEngine）
        const tempRange = season.temperature;
        let baseTemp;

        if (window.RandomEngine) {
            baseTemp = window.RandomEngine.randomInt(tempRange.min, tempRange.max);
        } else {
            // 降级方案
            baseTemp = Math.round(
                tempRange.min + Math.random() * (tempRange.max - tempRange.min)
            );
        }

        // 应用气候系统的温度修正
        if (window.climateManager) {
            const modifier = window.climateManager.getTemperatureModifier(baseTemp, this.currentSeason);
            this.currentTemperature = Math.round(baseTemp + modifier);
        } else {
            this.currentTemperature = baseTemp;
        }

        // 🌡️ 通知响应式系统：温度已更新
        if (window.reactiveSystem) {
            window.reactiveSystem.notify('environment.temperature', this.currentTemperature);
        }

        console.log('🌡️ 环境温度生成:', this.currentTemperature + '°C');
    }

    /**
     * 设置天气
     */
    setWeather(weatherType, forceRefresh = false) {
        if (!this.weatherTypes[weatherType]) {
            console.error('未知的天气类型:', weatherType);
            return;
        }

        const oldWeather = this.currentWeather;
        this.currentWeather = weatherType;

        // 🔥 修复：forceRefresh=true 时即使天气相同也刷新特效
        if (oldWeather !== weatherType || forceRefresh) {
            const weather = this.weatherTypes[weatherType];
            console.log(`🌦️ 天气${forceRefresh ? '刷新' : '变化'}: ${weather.icon} ${weather.name}`);

            // 🔥 同步到世界快照
            this.syncToWorldState();

            // 🔥 通知响应式系统（触发UI自动更新）
            if (window.reactiveSystem) {
                window.reactiveSystem.notify('environment.weather', weather.name, this.weatherTypes[oldWeather]?.name);
            }

            // 更新音频系统的天气环境音
            if (window.audioSystem) {
                // 计算天气强度（用于雨声大小等）
                let intensity = 0.5;  // 默认中等强度
                if (weatherType === 'rainy') {
                    intensity = 0.4;  // 普通雨
                } else if (weatherType === 'stormy') {
                    intensity = 0.9;  // 暴风雨
                } else if (weatherType === 'snowy') {
                    intensity = 0.3;  // 雪
                }

                window.audioSystem.updateAmbient(weatherType, null, null, intensity);
                console.log(`🎵 天气音效更新: ${weatherType} (强度:${intensity})`);
            }

            // 应用天气效果
            this.applyWeatherEffects(weather);

            // 🌈 显示天气特效（v2.0集成）
            if (window.weatherEffectController) {
                const effectType = this.getEffectType(weatherType);
                if (effectType) {
                    window.weatherEffectController.showEffect(effectType, 1.0);
                    console.log(`✨ 天气特效已显示: ${effectType}`);
                }
            }

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
    /**
     * 生成天气预报（Stage 3优化：使用RandomEngine + 真实日期）
     * 🔥 关键设计：真随机生成 + 存储预报值，确保load后一致
     */
    generateForecast() {
        this.forecast = [];
        const season = this.seasons[this.currentSeason];

        // 获取当前游戏日期
        const currentDay = window.timeSystem?.currentTime?.dayOfYear ||
                          window.worldState?.state?.time?.dayOfYear || 1;

        // 生成未来3天的预报
        for (let i = 1; i <= 3; i++) {
            const forecastDay = currentDay + i;

            // 🎲 使用RandomEngine的权重随机（真随机）
            const weatherOptions = Object.entries(season.weatherProbability)
                .filter(([_, prob]) => prob > 0)  // 过滤掉概率为0的天气
                .map(([weather, weight]) => ({ value: weather, weight: weight * 100 }));

            const forecastWeather = window.RandomEngine
                ? window.RandomEngine.weightedRandom(weatherOptions)
                : this._fallbackWeightedRandom(season.weatherProbability);

            // 生成温度
            const tempRange = season.temperature;
            const temp = window.RandomEngine
                ? window.RandomEngine.randomInt(tempRange.min, tempRange.max)
                : Math.round(tempRange.min + Math.random() * (tempRange.max - tempRange.min));

            this.forecast.push({
                day: forecastDay,          // 真实游戏日期
                weather: forecastWeather,
                temperature: temp,
                icon: this.weatherTypes[forecastWeather]?.icon || '☀️'
            });
        }

        console.log(`🌤️ 生成天气预报（第${currentDay}天）:`, this.forecast);

        // 同步到worldState
        if (window.worldState?.state?.environment) {
            window.worldState.state.environment.forecast = this.forecast;
        }
    }

    /**
     * 降级：无RandomEngine时的权重随机
     */
    _fallbackWeightedRandom(probabilities) {
        const random = Math.random();
        let cumulative = 0;

        for (const [weather, probability] of Object.entries(probabilities)) {
            cumulative += probability;
            if (random < cumulative) {
                return weather;
            }
        }
        return 'sunny';
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

        // 通知气候管理器进行每日更新
        if (window.climateManager) {
            window.climateManager.dailyUpdate();
        }
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

        // 🔥 特效创建已移至setWeather()统一管理（避免重复调用）
        // updateWeatherDisplay()只负责更新UI文字，不创建特效

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
        // 🔥 强制刷新：即使天气相同也重新显示特效
        this.setWeather(weatherType, true);
        this.weatherDuration = duration;

        // 🌡️ 根据新天气生成对应温度
        const season = this.seasons[this.currentSeason];
        const tempRange = season.temperature;
        let baseTemp;

        if (window.RandomEngine) {
            baseTemp = window.RandomEngine.randomInt(tempRange.min, tempRange.max);
        } else {
            baseTemp = Math.round(
                tempRange.min + Math.random() * (tempRange.max - tempRange.min)
            );
        }

        // 应用气候系统的温度修正
        if (window.climateManager) {
            const modifier = window.climateManager.getTemperatureModifier(baseTemp, this.currentSeason);
            this.currentTemperature = Math.round(baseTemp + modifier);
        } else {
            this.currentTemperature = baseTemp;
        }

        // 🌡️ 通知响应式系统：温度已更新
        if (window.reactiveSystem) {
            window.reactiveSystem.notify('environment.temperature', this.currentTemperature);
        }

        console.log(`⚡ 强制天气: ${weatherType} (持续${duration}小时), 温度: ${this.currentTemperature}°C`);
    }

    /**
     * 获取天气对应的特效类型
     * @param {string} weatherType - 天气类型
     * @returns {string|null} - 特效类型
     */
    getEffectType(weatherType) {
        const effectMapping = {
            'rainy': 'rain',
            'stormy': 'storm',
            'snowy': 'snow',
            'sakura': 'sakura',
            'rainbow': 'rainbow',
            'meteor_shower': 'meteor',
            'polluted': 'polluted',
            'sunny': null,     // 晴天无特效
            'cloudy': null,    // 多云无特效
            'foggy': null      // 雾天暂无特效（可以后续添加）
        };
        return effectMapping[weatherType] || null;
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