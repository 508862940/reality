/**
 * 条件判断引擎 (ConditionEngine)
 *
 * 用于检查游戏中各种条件：
 * - 选项解锁/灰显
 * - 地点准入
 * - 功能显示
 * - 对话分支
 *
 * 版本：v1.0
 * 日期：2025-10-02
 */

class ConditionEngine {
    /**
     * 检查条件是否满足
     * @param {Object} conditions - 条件配置对象
     * @param {Object} context - 上下文数据（可选，默认从全局状态获取）
     * @returns {boolean} 是否满足条件
     */
    static check(conditions, context = null) {
        // 无条件 = 总是通过
        if (!conditions || Object.keys(conditions).length === 0) {
            return true;
        }

        // 调试：显示条件类型
        console.log('🔎 ConditionEngine.check 调用:', {
            conditions: conditions,
            contextKeys: context ? Object.keys(context) : [],
            hasCharacter: !!context?.character,
            characterMoney: context?.character?.money,
            hasTime: !!(context?.time || context?.gameTime),
            timeHour: context?.gameTime?.hour || context?.time?.hour,
            hasWeather: !!context?.weather,
            weather: context?.weather
        });

        try {
            // 处理逻辑运算符
            if (conditions.AND) {
                const results = conditions.AND.map(c => {
                    const result = this.check(c, context);
                    console.log('  AND条件检查:', c, '结果:', result);
                    return result;
                });
                const finalResult = results.every(r => r);
                console.log('  AND最终结果:', finalResult);
                return finalResult;
            }

            if (conditions.OR) {
                return conditions.OR.some(c => this.check(c, context));
            }

            if (conditions.NOT) {
                return !conditions.NOT.some(c => this.check(c, context));
            }

            // 处理各种条件类型
            let allPassed = true;

            if (conditions.item) {
                allPassed = allPassed && this.checkItem(conditions.item, context);
            }

            if (conditions.items) {
                allPassed = allPassed && this.checkItems(conditions.items, context);
            }

            if (conditions.attribute) {
                allPassed = allPassed && this.checkAttribute(conditions.attribute, context);
            }

            if (conditions.attributes) {
                allPassed = allPassed && this.checkAttributes(conditions.attributes, context);
            }

            if (conditions.time) {
                allPassed = allPassed && this.checkTime(conditions.time, context);
            }

            if (conditions.location) {
                allPassed = allPassed && this.checkLocation(conditions.location, context);
            }

            if (conditions.locations) {
                allPassed = allPassed && this.checkLocations(conditions.locations, context);
            }

            if (conditions.weather) {
                allPassed = allPassed && this.checkWeather(conditions.weather, context);
            }

            if (conditions.climate) {
                allPassed = allPassed && this.checkClimate(conditions.climate, context);
            }

            // 预留：未实现的条件类型（自动跳过）
            if (conditions.relationship && window.relationshipSystem) {
                allPassed = allPassed && this.checkRelationship(conditions.relationship, context);
            }

            if (conditions.flag && (window.storyFlags || window.worldState?.state?.story?.flags)) {
                allPassed = allPassed && this.checkFlag(conditions.flag, context);
            }

            if (conditions.flags && (window.storyFlags || window.worldState?.state?.story?.flags)) {
                allPassed = allPassed && this.checkFlags(conditions.flags, context);
            }

            return allPassed;

        } catch (error) {
            console.error('❌ 条件检查出错:', error, conditions);
            return true;  // 出错时默认通过（避免阻塞游戏）
        }
    }

    /**
     * 获取条件失败的原因
     * @param {Object} conditions - 条件配置对象
     * @param {Object} context - 上下文数据
     * @returns {Array<string>} 失败原因数组
     */
    static getFailReasons(conditions, context = null) {
        if (!conditions || Object.keys(conditions).length === 0) {
            return [];
        }

        const reasons = [];

        try {
            // 处理逻辑运算符
            if (conditions.AND) {
                conditions.AND.forEach(c => {
                    const subReasons = this.getFailReasons(c, context);
                    reasons.push(...subReasons);
                });
                return reasons;
            }

            if (conditions.OR) {
                // OR逻辑：只有全部失败才返回原因
                const allFailed = conditions.OR.every(c => !this.check(c, context));
                if (allFailed) {
                    reasons.push('以下条件需要满足至少一个：');
                    conditions.OR.forEach(c => {
                        const subReasons = this.getFailReasons(c, context);
                        reasons.push(...subReasons.map(r => '  - ' + r));
                    });
                }
                return reasons;
            }

            if (conditions.NOT) {
                const anyPassed = conditions.NOT.some(c => this.check(c, context));
                if (anyPassed) {
                    reasons.push('以下条件不能满足：');
                    conditions.NOT.forEach(c => {
                        if (this.check(c, context)) {
                            reasons.push('  - ' + this.describeCondition(c));
                        }
                    });
                }
                return reasons;
            }

            // 检查各种条件类型
            if (conditions.item && !this.checkItem(conditions.item, context)) {
                reasons.push(`缺少物品：${conditions.item}`);
            }

            if (conditions.items && !this.checkItems(conditions.items, context)) {
                const missing = conditions.items.filter(item => !this.checkItem(item, context));
                reasons.push(`缺少物品：${missing.join('、')}`);
            }

            if (conditions.attribute && !this.checkAttribute(conditions.attribute, context)) {
                for (const [attr, check] of Object.entries(conditions.attribute)) {
                    const value = this.getAttributeValue(attr, context);
                    const attrName = this.getAttributeName(attr);

                    if (check.min !== undefined && value < check.min) {
                        reasons.push(`${attrName}不足（当前${value}，需要${check.min}）`);
                    }
                    if (check.max !== undefined && value > check.max) {
                        reasons.push(`${attrName}过高（当前${value}，最多${check.max}）`);
                    }
                }
            }

            if (conditions.time && !this.checkTime(conditions.time, context)) {
                reasons.push(this.describeTimeCondition(conditions.time));
            }

            if (conditions.location && !this.checkLocation(conditions.location, context)) {
                reasons.push(`需要在：${conditions.location}`);
            }

            if (conditions.weather && !this.checkWeather(conditions.weather, context)) {
                if (typeof conditions.weather === 'object' && conditions.weather.not) {
                    reasons.push(`天气不能是：${conditions.weather.not}`);
                } else {
                    reasons.push(`需要天气：${conditions.weather}`);
                }
            }

        } catch (error) {
            console.error('❌ 获取失败原因出错:', error);
        }

        return reasons;
    }

    /**
     * 生成条件描述文本
     * @param {Object} conditions - 条件配置对象
     * @returns {string} 描述文本
     */
    static describe(conditions) {
        if (!conditions || Object.keys(conditions).length === 0) {
            return '无条件';
        }

        const parts = [];

        try {
            if (conditions.AND) {
                const subDesc = conditions.AND.map(c => this.describe(c));
                return subDesc.join('，且');
            }

            if (conditions.OR) {
                const subDesc = conditions.OR.map(c => this.describe(c));
                return subDesc.join(' 或 ');
            }

            if (conditions.item) {
                parts.push(`需要${conditions.item}`);
            }

            if (conditions.attribute) {
                for (const [attr, check] of Object.entries(conditions.attribute)) {
                    const attrName = this.getAttributeName(attr);
                    if (check.min !== undefined) {
                        parts.push(`${attrName}≥${check.min}`);
                    }
                }
            }

            if (conditions.time) {
                parts.push(this.describeTimeCondition(conditions.time));
            }

            if (conditions.location) {
                parts.push(`在${conditions.location}`);
            }

        } catch (error) {
            console.error('❌ 生成描述出错:', error);
        }

        return parts.join('，') || '特定条件';
    }

    // ==================== 条件检查方法 ====================

    /**
     * 检查单个物品
     */
    static checkItem(itemName, context) {
        const inventory = this.getInventory(context);
        // inventory 是对象 { '物品名': 数量 } 或数组 ['物品1', '物品2']
        if (Array.isArray(inventory)) {
            return inventory.includes(itemName);
        } else {
            return inventory[itemName] && inventory[itemName] > 0;
        }
    }

    /**
     * 检查多个物品（全部拥有）
     */
    static checkItems(items, context) {
        return items.every(item => this.checkItem(item, context));
    }

    /**
     * 检查属性
     */
    static checkAttribute(attrCondition, context) {
        for (const [attrName, check] of Object.entries(attrCondition)) {
            const value = this.getAttributeValue(attrName, context);

            if (check.min !== undefined && value < check.min) return false;
            if (check.max !== undefined && value > check.max) return false;
            if (check.equal !== undefined && value !== check.equal) return false;
        }
        return true;
    }

    /**
     * 检查多个属性
     */
    static checkAttributes(attrs, context) {
        return this.checkAttribute(attrs, context);
    }

    /**
     * 检查时间条件
     */
    static checkTime(timeCondition, context) {
        const currentTime = this.getCurrentTime(context);
        console.log('🕐 检查时间条件:', {
            currentHour: currentTime?.hour,
            condition: timeCondition,
            currentTime: currentTime
        });

        // 小时范围检查
        if (timeCondition.hour) {
            const hour = currentTime.hour;
            const check = timeCondition.hour;

            if (check.min !== undefined && check.max !== undefined) {
                // 处理跨天情况（如22:00-5:00）
                if (check.min > check.max) {
                    if (!(hour >= check.min || hour <= check.max)) {
                        console.log('❌ 时间不在范围内（跨天）');
                        return false;
                    }
                } else {
                    if (hour < check.min || hour > check.max) {
                        console.log(`❌ 时间不在范围 ${check.min}-${check.max} 内，当前：${hour}`);
                        return false;
                    }
                }
            } else if (check.min !== undefined) {
                if (hour < check.min) return false;
            } else if (check.max !== undefined) {
                if (hour > check.max) return false;
            }
        }

        // 时段检查
        if (timeCondition.period) {
            const period = this.getTimePeriod(currentTime.hour);
            if (period !== timeCondition.period) return false;
        }

        // 季节检查
        if (timeCondition.season) {
            if (currentTime.season !== timeCondition.season) return false;
        }

        // 星期检查
        if (timeCondition.weekday) {
            const weekdays = Array.isArray(timeCondition.weekday) ?
                            timeCondition.weekday : [timeCondition.weekday];
            if (!weekdays.includes(currentTime.weekday)) return false;
        }

        // 日期检查
        if (timeCondition.day) {
            const day = currentTime.day;
            const check = timeCondition.day;

            if (check.min !== undefined && day < check.min) return false;
            if (check.max !== undefined && day > check.max) return false;
        }

        return true;
    }

    /**
     * 检查位置
     */
    static checkLocation(location, context) {
        const currentLoc = this.getCurrentLocation(context);
        return currentLoc === location;
    }

    /**
     * 检查多个位置（任一符合）
     */
    static checkLocations(locations, context) {
        const currentLoc = this.getCurrentLocation(context);
        return locations.includes(currentLoc);
    }

    /**
     * 检查天气
     * 🌸 扩展：支持previous检查上一个天气
     */
    static checkWeather(weatherCondition, context) {
        const currentWeather = this.getCurrentWeather(context);
        console.log('🌤️ 检查天气条件:', {
            currentWeather: currentWeather,
            condition: weatherCondition
        });

        // 支持数组格式（任一天气符合）
        if (Array.isArray(weatherCondition)) {
            const result = weatherCondition.includes(currentWeather);
            console.log(`${result ? '✅' : '❌'} 天气${result ? '符合' : '不符合'}条件`);
            return result;
        }

        if (typeof weatherCondition === 'string') {
            return currentWeather === weatherCondition;
        }

        // 🌸 扩展：检查上一个天气
        if (weatherCondition.previous) {
            const previousWeather = context?.previousWeather || '';
            const targets = Array.isArray(weatherCondition.previous) ?
                            weatherCondition.previous : [weatherCondition.previous];
            return targets.includes(previousWeather);
        }

        if (weatherCondition.not) {
            return currentWeather !== weatherCondition.not;
        }

        return true;
    }

    /**
     * 检查气候条件（气候事件、动荡年份等）
     * 🌸 新增：支持气候系统集成
     */
    static checkClimate(climateCondition, context) {
        // 从context或climateManager获取气候状态
        const climateState = context?.climate || window.climateManager?.currentState;

        if (!climateState) {
            console.warn('⚠️ 气候系统未初始化，气候条件默认通过');
            return true;
        }

        // 检查气候事件
        if (climateCondition.event) {
            const targetEvents = Array.isArray(climateCondition.event) ?
                                climateCondition.event : [climateCondition.event];

            // 检查季节活动
            if (climateState.seasonActivity && targetEvents.includes(climateState.seasonActivity)) {
                return true;
            }

            // 检查极端天气事件
            if (climateState.extremeWeather && targetEvents.includes(climateState.extremeWeather)) {
                return true;
            }

            // 检查覆写事件
            if (climateState.override && targetEvents.includes(climateState.override)) {
                return true;
            }

            return false;
        }

        // 检查动荡等级
        if (climateCondition.turbulence) {
            const turbulence = climateState.turbulenceLevel || 0;
            const check = climateCondition.turbulence;

            if (check.min !== undefined && turbulence < check.min) return false;
            if (check.max !== undefined && turbulence > check.max) return false;
            if (check.exact !== undefined && turbulence !== check.exact) return false;
        }

        // 检查年份类型
        if (climateCondition.yearType) {
            const yearType = climateState.yearType || 'peaceful';
            const targetTypes = Array.isArray(climateCondition.yearType) ?
                               climateCondition.yearType : [climateCondition.yearType];
            return targetTypes.includes(yearType);
        }

        return true;
    }

    /**
     * 检查关系（预留）
     */
    static checkRelationship(relCondition, context) {
        if (!window.relationshipSystem && !window.worldState?.state?.relationships) {
            return true;  // 系统未实现，默认通过
        }

        for (const [npc, check] of Object.entries(relCondition)) {
            const affection = this.getRelationshipValue(npc, context);

            if (check.min !== undefined && affection < check.min) return false;
            if (check.max !== undefined && affection > check.max) return false;
            if (check.stage && this.getRelationshipStage(npc, context) !== check.stage) return false;
        }
        return true;
    }

    /**
     * 检查单个标记（预留）
     */
    static checkFlag(flagName, context) {
        const flags = this.getStoryFlags(context);
        return flags[flagName] === true;
    }

    /**
     * 检查多个标记（全部为true）
     */
    static checkFlags(flagNames, context) {
        return flagNames.every(flag => this.checkFlag(flag, context));
    }

    // ==================== 数据获取方法 ====================

    /**
     * 获取背包数据
     */
    static getInventory(context) {
        if (context?.inventory) return context.inventory;

        // 优先从worldState读取
        if (window.worldState?.state?.player?.inventory) {
            return window.worldState.state.player.inventory;
        }

        // 降级到gameState
        if (window.gameState?.character?.inventory) {
            return window.gameState.character.inventory;
        }

        return [];
    }

    /**
     * 获取属性值
     */
    static getAttributeValue(attrName, context) {
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
     * 获取当前时间
     */
    static getCurrentTime(context) {
        // 优先从 context.gameTime 读取（测试用）
        if (context?.gameTime) return context.gameTime;

        // 然后从 context.time 读取
        if (context?.time) return context.time;

        // 优先从timeSystem读取
        if (window.timeSystem?.currentTime) {
            return window.timeSystem.currentTime;
        }

        // 降级到worldState
        if (window.worldState?.state?.time) {
            return window.worldState.state.time;
        }

        // 降级到gameState
        if (window.gameState?.gameTime) {
            return window.gameState.gameTime;
        }

        return { day: 1, hour: 8, minute: 0, season: 'spring' };
    }

    /**
     * 获取当前位置
     */
    static getCurrentLocation(context) {
        if (context?.location) return context.location;

        // 优先从worldState读取
        if (window.worldState?.state?.player?.position?.location) {
            return window.worldState.state.player.position.location;
        }

        // 降级到gameState
        if (window.gameState?.character?.location) {
            return window.gameState.character.location;
        }

        return '';
    }

    /**
     * 获取当前天气
     */
    static getCurrentWeather(context) {
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
     * 获取关系值（预留）
     */
    static getRelationshipValue(npc, context) {
        if (context?.relationships?.[npc]) return context.relationships[npc];

        if (window.worldState?.state?.relationships?.[npc]?.affection !== undefined) {
            return window.worldState.state.relationships[npc].affection;
        }

        if (window.relationshipSystem?.data?.[npc]?.affection !== undefined) {
            return window.relationshipSystem.data[npc].affection;
        }

        return 0;
    }

    /**
     * 获取关系阶段（预留）
     */
    static getRelationshipStage(npc, context) {
        if (window.worldState?.state?.relationships?.[npc]?.stage) {
            return window.worldState.state.relationships[npc].stage;
        }
        return 'stranger';
    }

    /**
     * 获取剧情标记（预留）
     */
    static getStoryFlags(context) {
        if (context?.flags) return context.flags;

        if (window.worldState?.state?.story?.flags) {
            return window.worldState.state.story.flags;
        }

        if (window.storyFlags) {
            return window.storyFlags;
        }

        return {};
    }

    // ==================== 工具方法 ====================

    /**
     * 获取时段
     */
    static getTimePeriod(hour) {
        if (hour >= 5 && hour < 7) return 'dawn';
        if (hour >= 7 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 14) return 'noon';
        if (hour >= 14 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * 获取属性中文名
     */
    static getAttributeName(attr) {
        const names = {
            intelligence: '智力',
            charisma: '魅力',
            strength: '力量',
            dexterity: '敏捷',
            wisdom: '智慧',
            health: '体力',
            mood: '心情',
            energy: '精力',
            spirit: '精神',
            money: '金钱'
        };
        return names[attr] || attr;
    }

    /**
     * 描述时间条件
     */
    static describeTimeCondition(timeCondition) {
        const parts = [];

        if (timeCondition.hour) {
            const h = timeCondition.hour;
            if (h.min !== undefined && h.max !== undefined) {
                parts.push(`时间${h.min}:00-${h.max}:00`);
            } else if (h.min !== undefined) {
                parts.push(`${h.min}:00之后`);
            }
        }

        if (timeCondition.period) {
            const periods = {
                dawn: '黎明',
                morning: '早晨',
                noon: '中午',
                afternoon: '下午',
                evening: '傍晚',
                night: '夜晚'
            };
            parts.push(periods[timeCondition.period] || timeCondition.period);
        }

        if (timeCondition.season) {
            const seasons = {
                spring: '春季',
                summer: '夏季',
                autumn: '秋季',
                winter: '冬季'
            };
            parts.push(seasons[timeCondition.season] || timeCondition.season);
        }

        return parts.join('，') || '特定时间';
    }

    /**
     * 描述单个条件
     */
    static describeCondition(condition) {
        if (condition.item) return `拥有${condition.item}`;
        if (condition.location) return `在${condition.location}`;
        if (condition.weather) return `天气为${condition.weather}`;
        return '特定条件';
    }
}

// 导出到全局
window.ConditionEngine = ConditionEngine;

console.log('✅ 条件判断引擎已加载');
