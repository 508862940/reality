/**
 * 温度系统 (TemperatureSystem)
 *
 * 功能：
 * 1. 管理环境温度 → 体感温度转换
 * 2. 衣服保暖值/降温值计算
 * 3. 食物温度buff管理
 * 4. 舒适度判定 → 心情影响
 *
 * 版本：v1.0
 * 日期：2025-10-03
 */

class TemperatureSystem {
    constructor() {
        // 舒适温度区间（体感温度）
        this.comfortZone = {
            ideal: { min: 18, max: 26 },      // 理想区间：无影响
            acceptable: { min: 10, max: 32 }, // 可接受：轻微影响
            // 超出acceptable即为不适区域
        };

        // 温度等级定义
        this.temperatureLevels = {
            freezing: { max: -10, name: '严寒', icon: '🥶', moodPenalty: -15 },
            cold: { min: -10, max: 10, name: '寒冷', icon: '🧊', moodPenalty: -10 },
            cool: { min: 10, max: 18, name: '偏凉', icon: '😌', moodPenalty: -3 },
            comfortable: { min: 18, max: 26, name: '舒适', icon: '😊', moodPenalty: 0 },
            warm: { min: 26, max: 32, name: '偏热', icon: '😓', moodPenalty: -3 },
            hot: { min: 32, max: 40, name: '炎热', icon: '🥵', moodPenalty: -10 },
            scorching: { min: 40, name: '酷热', icon: '🔥', moodPenalty: -15 }
        };

        // 当前状态
        this.currentState = {
            environmentTemp: 20,      // 环境温度（来自WeatherSystem）
            apparentTemp: 20,         // 体感温度
            comfortLevel: 'comfortable', // 舒适等级
            clothingModifier: 0,      // 衣服修正值
            foodBuffs: [],            // 食物buff列表
            totalModifier: 0          // 总修正值
        };

        console.log('🌡️ 温度系统已初始化');
    }

    /**
     * 初始化系统（连接响应式监听）
     */
    init() {
        // 监听天气变化 → 更新环境温度
        if (window.reactiveSystem) {
            window.reactiveSystem.watch('environment.weather', () => {
                this.updateEnvironmentTemp();
            });

            window.reactiveSystem.watch('environment.temperature', (newTemp) => {
                this.currentState.environmentTemp = newTemp;
                this.calculateApparentTemp();
            });

            console.log('🌡️ 温度系统已连接响应式监听');
        }

        // 初始化温度
        this.updateEnvironmentTemp();
    }

    /**
     * 从天气系统获取环境温度
     */
    updateEnvironmentTemp() {
        if (window.weatherSystem) {
            const temp = window.weatherSystem.currentTemperature;
            this.currentState.environmentTemp = temp;
            this.calculateApparentTemp();
        }
    }

    /**
     * 计算体感温度
     * 公式：体感温度 = 环境温度 + 衣服修正 + 食物buff修正
     */
    calculateApparentTemp() {
        const envTemp = this.currentState.environmentTemp;
        const clothingMod = this.currentState.clothingModifier;
        const foodMod = this.getFoodBuffModifier();

        this.currentState.totalModifier = clothingMod + foodMod;
        this.currentState.apparentTemp = envTemp + this.currentState.totalModifier;

        // 更新舒适等级
        this.updateComfortLevel();

        // 通知响应式系统
        if (window.reactiveSystem) {
            window.reactiveSystem.notify('temperature.apparent', this.currentState.apparentTemp);
            window.reactiveSystem.notify('temperature.comfort', this.currentState.comfortLevel);
        }

        console.log('🌡️ 体感温度更新:', {
            环境: envTemp,
            衣服修正: clothingMod,
            食物修正: foodMod,
            体感: this.currentState.apparentTemp,
            舒适度: this.currentState.comfortLevel
        });
    }

    /**
     * 获取食物buff的温度修正
     */
    getFoodBuffModifier() {
        let totalMod = 0;
        const currentDay = window.timeSystem?.currentTime?.day || 0;

        // 清理过期buff
        this.currentState.foodBuffs = this.currentState.foodBuffs.filter(buff => {
            return buff.expireDay > currentDay;
        });

        // 计算总修正
        this.currentState.foodBuffs.forEach(buff => {
            totalMod += buff.tempModifier;
        });

        return totalMod;
    }

    /**
     * 添加食物温度buff
     * @param {string} foodId - 食物ID
     * @param {number} tempModifier - 温度修正（负数=降温，正数=保暖）
     * @param {number} durationDays - 持续天数
     */
    addFoodBuff(foodId, tempModifier, durationDays) {
        const currentDay = window.timeSystem?.currentTime?.day || 0;

        const buff = {
            foodId: foodId,
            tempModifier: tempModifier,
            startDay: currentDay,
            expireDay: currentDay + durationDays
        };

        this.currentState.foodBuffs.push(buff);
        console.log('🍔 添加食物温度buff:', buff);

        // 重新计算体感温度
        this.calculateApparentTemp();

        return buff;
    }

    /**
     * 设置衣服保暖值
     * @param {number} modifier - 保暖修正（负数=凉爽，正数=保暖）
     */
    setClothingModifier(modifier) {
        this.currentState.clothingModifier = modifier;
        console.log('👔 更新衣服保暖值:', modifier);

        // 重新计算体感温度
        this.calculateApparentTemp();
    }

    /**
     * 更新舒适等级
     */
    updateComfortLevel() {
        const temp = this.currentState.apparentTemp;

        for (const [level, config] of Object.entries(this.temperatureLevels)) {
            const min = config.min !== undefined ? config.min : -Infinity;
            const max = config.max !== undefined ? config.max : Infinity;

            if (temp > min && temp <= max) {
                this.currentState.comfortLevel = level;
                return;
            }
        }

        // 默认舒适
        this.currentState.comfortLevel = 'comfortable';
    }

    /**
     * 获取当前舒适度的心情影响
     * @returns {number} 心情修正值
     */
    getMoodModifier() {
        const level = this.currentState.comfortLevel;
        const config = this.temperatureLevels[level];
        return config ? config.moodPenalty : 0;
    }

    /**
     * 获取舒适度描述
     * @returns {Object} { level, name, icon, description }
     */
    getComfortDescription() {
        const level = this.currentState.comfortLevel;
        const config = this.temperatureLevels[level];
        const temp = this.currentState.apparentTemp;
        const moodMod = this.getMoodModifier();

        let description = '';
        if (moodMod === 0) {
            description = '体感温度适宜，感觉很舒服。';
        } else if (moodMod < -10) {
            description = '温度极端不适，必须采取措施！';
        } else if (moodMod < 0) {
            description = '温度不太舒适，建议调整衣着。';
        }

        return {
            level: level,
            name: config.name,
            icon: config.icon,
            temperature: Math.round(temp),
            moodModifier: moodMod,
            description: description,
            suggestion: this.getSuggestion()
        };
    }

    /**
     * 获取穿衣建议
     */
    getSuggestion() {
        const temp = this.currentState.apparentTemp;

        if (temp <= 0) {
            return '建议穿着厚重冬装（羽绒服、毛衣）';
        } else if (temp <= 10) {
            return '建议穿着秋冬装（外套、长袖）';
        } else if (temp <= 18) {
            return '建议穿着春秋装（薄外套、长袖）';
        } else if (temp <= 26) {
            return '适合穿着日常服装（T恤、衬衫）';
        } else if (temp <= 32) {
            return '建议穿着夏装（短袖、透气衣物）';
        } else {
            return '建议穿着清凉夏装并注意防暑';
        }
    }

    /**
     * 检查是否需要更换衣服
     * @returns {boolean} true=需要更换
     */
    needClothingChange() {
        const moodMod = this.getMoodModifier();
        return moodMod < -5; // 心情惩罚超过-5即需要更换
    }

    /**
     * 应用温度对角色属性的影响
     * 注意：实际应用由外部系统调用（如每小时检查一次）
     */
    applyTemperatureEffects() {
        const moodMod = this.getMoodModifier();

        if (moodMod === 0) {
            return null; // 无影响
        }

        // 返回影响数据，由外部系统应用
        return {
            mood: moodMod,
            reason: `温度${this.temperatureLevels[this.currentState.comfortLevel].name}`
        };
    }

    /**
     * 获取当前温度状态（用于UI显示）
     */
    getState() {
        return {
            environment: Math.round(this.currentState.environmentTemp),
            apparent: Math.round(this.currentState.apparentTemp),
            comfort: this.getComfortDescription(),
            modifiers: {
                clothing: this.currentState.clothingModifier,
                food: this.getFoodBuffModifier(),
                total: this.currentState.totalModifier
            },
            foodBuffs: this.currentState.foodBuffs.map(buff => ({
                foodId: buff.foodId,
                modifier: buff.tempModifier,
                remainingDays: buff.expireDay - (window.timeSystem?.currentTime?.day || 0)
            }))
        };
    }

    /**
     * 同步到世界快照
     */
    syncToWorldState() {
        if (window.worldState) {
            window.worldState.updateState({
                temperature: {
                    environment: this.currentState.environmentTemp,
                    apparent: this.currentState.apparentTemp,
                    comfortLevel: this.currentState.comfortLevel,
                    clothingModifier: this.currentState.clothingModifier,
                    foodBuffs: this.currentState.foodBuffs
                }
            });
        }
    }

    /**
     * 从世界快照加载
     */
    loadFromWorldState() {
        if (window.worldState?.state?.temperature) {
            const data = window.worldState.state.temperature;
            this.currentState.environmentTemp = data.environment || 20;
            this.currentState.apparentTemp = data.apparent || 20;
            this.currentState.comfortLevel = data.comfortLevel || 'comfortable';
            this.currentState.clothingModifier = data.clothingModifier || 0;
            this.currentState.foodBuffs = data.foodBuffs || [];

            console.log('🌡️ 从存档加载温度数据:', this.currentState);
        }
    }
}

// 导出全局实例
if (typeof window !== 'undefined') {
    window.TemperatureSystem = TemperatureSystem;
    window.temperatureSystem = new TemperatureSystem();
}
