/**
 * 概率决策引擎 (RandomEngine)
 *
 * 用于游戏中的不确定性模拟：
 * - 加权随机选择（天气生成）
 * - 骰子检定（技能判定）
 * - 随机数生成
 *
 * 版本：v1.0
 * 日期：2025-10-02
 */

class RandomEngine {
    /**
     * 加权随机选择
     * @param {Array} options - 选项数组 [{value: any, weight: number}, ...]
     * @returns {*} 选中的值
     */
    static weightedRandom(options) {
        if (!options || options.length === 0) {
            console.warn('⚠️ weightedRandom: 选项为空');
            return null;
        }

        // 计算总权重
        const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);

        if (totalWeight === 0) {
            console.warn('⚠️ weightedRandom: 总权重为0');
            return options[0].value;
        }

        // 生成随机数
        const random = Math.random() * totalWeight;

        // 按权重选择
        let cumulative = 0;
        for (const option of options) {
            cumulative += option.weight;
            if (random <= cumulative) {
                return option.value;
            }
        }

        // 降级返回最后一个
        return options[options.length - 1].value;
    }

    /**
     * 带修正值的骰子检定（博德之门3风格）
     * @param {Object} config - 配置对象
     * @param {number} config.base - 基础成功率（0-1）
     * @param {Array} config.modifiers - 修正值数组
     * @param {string} config.dice - 骰子类型（可选）'d20' | 'd100' | 'percent'
     * @returns {Object} 检定结果
     */
    static rollCheck(config, context = null) {
        if (!config || typeof config.base !== 'number') {
            console.error('❌ rollCheck: 配置错误', config);
            return { success: false, finalRate: 0, roll: 0 };
        }

        try {
            // 计算最终成功率（传递context）
            const finalRate = this.calculate(config, context);

            // 投骰子
            const roll = Math.random();

            // 判定成功
            const success = roll <= finalRate;

            // 计算成功余量
            const margin = finalRate - roll;

            // 大成功/大失败判定（可选）
            const critical = roll <= 0.05 && success;  // 骰子≤5%时大成功
            const fumble = roll >= 0.95 && !success;   // 骰子≥95%时大失败

            return {
                success: success,
                finalRate: finalRate,
                roll: roll,
                margin: margin,
                critical: critical,
                fumble: fumble
            };

        } catch (error) {
            console.error('❌ rollCheck出错:', error);
            return { success: false, finalRate: 0, roll: 0 };
        }
    }

    /**
     * 计算最终成功率（不投骰子）
     * @param {Object} config - 配置对象
     * @param {Object} context - 上下文数据（可选）
     * @returns {number} 最终成功率（0-1）
     */
    static calculate(config, context = null) {
        let finalRate = config.base || 0.5;

        if (config.modifiers && Array.isArray(config.modifiers)) {
            for (const modifier of config.modifiers) {
                try {
                    // 属性修正（如智力影响）
                    if (modifier.attribute) {
                        const value = this.getAttributeValue(modifier.attribute, context);
                        const weight = modifier.weight || 0.01;
                        finalRate += value * weight;
                    }

                    // 物品加成
                    if (modifier.item) {
                        if (this.hasItem(modifier.item, context)) {
                            finalRate += modifier.bonus || 0;
                        }
                    }

                    // 天气影响
                    if (modifier.weather) {
                        const currentWeather = this.getCurrentWeather(context);
                        if (currentWeather === modifier.weather) {
                            finalRate += modifier.bonus || modifier.penalty || 0;
                        }
                    }

                    // 时间影响
                    if (modifier.time) {
                        if (this.checkTimeCondition(modifier.time, context)) {
                            finalRate += modifier.bonus || modifier.penalty || 0;
                        }
                    }

                    // 直接加成/惩罚
                    if (modifier.bonus !== undefined && !modifier.item && !modifier.weather && !modifier.time) {
                        finalRate += modifier.bonus;
                    }
                    if (modifier.penalty !== undefined) {
                        finalRate -= Math.abs(modifier.penalty);  // 惩罚应该减去
                    }

                } catch (error) {
                    console.warn('⚠️ 修正值计算出错:', modifier, error);
                }
            }
        }

        // 限制在0-1范围
        return Math.max(0, Math.min(1, finalRate));
    }

    /**
     * 简单概率判定
     * @param {number} successRate - 成功率（0-1）
     * @returns {boolean} 是否成功
     */
    static roll(successRate) {
        if (typeof successRate !== 'number') {
            console.warn('⚠️ roll: 成功率必须是数字');
            return false;
        }
        return Math.random() <= successRate;
    }

    /**
     * 生成随机整数
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} 随机整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 生成随机浮点数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机浮点数
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * 从数组中随机选择一个元素
     * @param {Array} array - 数组
     * @returns {*} 随机元素
     */
    static randomChoice(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * 洗牌算法（Fisher-Yates）
     * @param {Array} array - 要打乱的数组
     * @returns {Array} 打乱后的数组（新数组）
     */
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 百分比判定（返回详细结果）
     * @param {number} percent - 百分比（0-100）
     * @returns {Object} {success: boolean, roll: number, target: number}
     */
    static percentCheck(percent) {
        const roll = Math.random() * 100;
        return {
            success: roll <= percent,
            roll: roll,
            target: percent
        };
    }

    // ==================== 辅助方法 ====================

    /**
     * 获取属性值
     */
    static getAttributeValue(attrName, context = null) {
        // 优先从 context.character 读取
        if (context?.character?.[attrName] !== undefined) {
            return context.character[attrName];
        }

        // 然后从 context 直接读取（兼容旧格式）
        if (context?.[attrName] !== undefined) {
            return context[attrName];
        }

        // 优先从worldState读取
        if (window.worldState?.state?.player?.stats?.[attrName] !== undefined) {
            return window.worldState.state.player.stats[attrName];
        }

        // 降级到gameState
        if (window.gameState?.character?.[attrName] !== undefined) {
            return window.gameState.character[attrName];
        }

        return 0;
    }

    /**
     * 检查是否拥有物品
     */
    static hasItem(itemName, context = null) {
        // 优先从 context 读取
        if (context?.inventory) {
            const inventory = context.inventory;
            if (Array.isArray(inventory)) {
                return inventory.includes(itemName);
            } else {
                return inventory[itemName] && inventory[itemName] > 0;
            }
        }

        // 优先从worldState读取
        if (window.worldState?.state?.player?.inventory) {
            const inventory = window.worldState.state.player.inventory;
            if (Array.isArray(inventory)) {
                return inventory.includes(itemName);
            } else {
                return inventory[itemName] && inventory[itemName] > 0;
            }
        }

        // 降级到gameState
        if (window.gameState?.character?.inventory) {
            const inventory = window.gameState.character.inventory;
            if (Array.isArray(inventory)) {
                return inventory.includes(itemName);
            } else {
                return inventory[itemName] && inventory[itemName] > 0;
            }
        }

        return false;
    }

    /**
     * 获取当前天气
     */
    static getCurrentWeather(context = null) {
        // 优先从 context 读取
        if (context?.weather) return context.weather;

        // 优先从weatherSystem读取
        if (window.weatherSystem?.currentWeather) {
            return window.weatherSystem.currentWeather;
        }

        // 降级到worldState
        if (window.worldState?.state?.environment?.weather) {
            return window.worldState.state.environment.weather;
        }

        return 'sunny';
    }

    /**
     * 检查时间条件
     */
    static checkTimeCondition(timeCondition, context = null) {
        // 使用ConditionEngine的时间检查（如果存在）
        if (window.ConditionEngine) {
            return window.ConditionEngine.checkTime(timeCondition, context);
        }

        // 简单降级实现
        const currentTime = this.getCurrentTime(context);

        if (timeCondition.hour) {
            const hour = currentTime.hour;
            if (timeCondition.hour.min !== undefined && hour < timeCondition.hour.min) return false;
            if (timeCondition.hour.max !== undefined && hour > timeCondition.hour.max) return false;
        }

        return true;
    }

    /**
     * 获取当前时间
     */
    static getCurrentTime(context = null) {
        // 优先从 context.gameTime 读取（测试用）
        if (context?.gameTime) return context.gameTime;

        // 然后从 context.time 读取
        if (context?.time) return context.time;

        if (window.timeSystem?.currentTime) {
            return window.timeSystem.currentTime;
        }

        if (window.worldState?.state?.time) {
            return window.worldState.state.time;
        }

        return { day: 1, hour: 8, minute: 0 };
    }

    // ==================== 高级功能（预留） ====================

    /**
     * 设置随机种子（调试用）
     * 注意：JavaScript的Math.random()不支持种子，这里仅作占位
     */
    static setSeed(seed) {
        console.warn('⚠️ JavaScript不支持Math.random()种子，此方法无效');
        // 如果需要可重现的随机数，可以使用第三方库如seedrandom.js
    }

    /**
     * 重置随机种子
     */
    static resetSeed() {
        // 占位方法
    }

    /**
     * 范围随机（带权重分布）
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {string} distribution - 分布类型：'uniform'（均匀）| 'normal'（正态）
     * @returns {number} 随机数
     */
    static randomRange(min, max, distribution = 'uniform') {
        if (distribution === 'normal') {
            // 简单的正态分布近似（Box-Muller变换）
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            // 将z（标准正态分布）映射到[min, max]
            const mean = (min + max) / 2;
            const stdDev = (max - min) / 6;  // 99.7%的值在范围内
            const value = z * stdDev + mean;
            return Math.max(min, Math.min(max, value));
        }

        // 默认均匀分布
        return this.randomFloat(min, max);
    }

    /**
     * 掷骰子（多个骰子）
     * @param {number} sides - 骰子面数
     * @param {number} count - 骰子数量（可选，默认1）
     * @param {number} modifier - 修正值（可选）
     * @returns {number|Object} 返回总点数，有modifier时返回对象 {total, rolls, modifier}
     * @example
     * rollDice(6)      // 掷1个D6，返回 1-6
     * rollDice(6, 3)   // 掷3个D6，返回 3-18
     * rollDice(6, 3, 2) // 掷3个D6+2，返回对象
     */
    static rollDice(sides, count = 1, modifier = 0) {
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(this.randomInt(1, sides));
        }
        const sum = rolls.reduce((a, b) => a + b, 0);
        const total = sum + modifier;

        // 如果没有modifier，返回数字
        if (modifier === 0) {
            return total;
        }

        // 有modifier时返回详细对象
        return {
            total: total,
            rolls: rolls,
            modifier: modifier
        };
    }

    /**
     * 掷d20（D&D风格）
     * @param {number} modifier - 修正值
     * @returns {number|Object} 无参数返回点数（1-20），有modifier返回对象
     */
    static rollD20(modifier = null) {
        const roll = this.randomInt(1, 20);

        // 无modifier：返回简单数字
        if (modifier === null) {
            return roll;
        }

        // 有modifier：返回详细对象
        return {
            total: roll + modifier,
            roll: roll,
            modifier: modifier,
            critical: roll === 20,  // 大成功
            fumble: roll === 1      // 大失败
        };
    }
}

// 导出到全局
window.RandomEngine = RandomEngine;

console.log('✅ 概率决策引擎已加载');
