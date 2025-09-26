/**
 * 剧情标记管理系统
 * 用于追踪游戏剧情进度、玩家选择和重要事件
 */

class StoryFlags {
    constructor() {
        // 布尔标记（true/false）
        this.flags = {};

        // 计数器（数字）
        this.counters = {};

        // 选择记录（字符串）
        this.choices = {};

        // 章节和场景
        this.progress = {
            chapter: 1,
            scene: 'intro',
            mainQuest: 'beginning',
            subQuests: []
        };

        // 事件历史
        this.eventHistory = [];

        // 初始化标记
        this.init();
    }

    /**
     * 初始化默认标记
     */
    init() {
        // 设置一些默认标记
        this.flags = {
            // 主线剧情标记
            'GAME_STARTED': false,
            'TUTORIAL_COMPLETE': false,
            'MET_ZERO': false,
            'KNOWS_WOLF_SOUL': false,
            'MET_OBSERVER': false,
            'KNOWS_TRUTH': false,
            'ESCAPED_LAB': false,

            // 记忆碎片
            'MEMORY_FRAGMENT_1': false,
            'MEMORY_FRAGMENT_2': false,
            'MEMORY_FRAGMENT_3': false,

            // 重要选择
            'TRUSTED_ZERO': false,
            'TRUSTED_OBSERVER': false,
            'CHOSE_FREEDOM': false,
            'CHOSE_TRUTH': false
        };

        // 初始化计数器
        this.counters = {
            'ZERO_MEETINGS': 0,
            'OBSERVER_MEETINGS': 0,
            'MEMORIES_RECOVERED': 0,
            'BATTLES_WON': 0,
            'DAYS_SURVIVED': 0
        };

        console.log('📚 剧情标记系统初始化完成');
    }

    /**
     * 设置布尔标记
     */
    setFlag(name, value = true) {
        const oldValue = this.flags[name];
        this.flags[name] = value;

        console.log(`🏴 剧情标记: ${name} = ${value}`);

        // 记录到历史
        this.addToHistory('flag', name, value, oldValue);

        // 触发相关事件
        this.triggerFlagEvent(name, value);

        return this;
    }

    /**
     * 检查布尔标记
     */
    checkFlag(name) {
        return this.flags[name] || false;
    }

    /**
     * 增加计数器
     */
    incrementCounter(name, amount = 1) {
        if (!this.counters[name]) {
            this.counters[name] = 0;
        }

        const oldValue = this.counters[name];
        this.counters[name] += amount;

        console.log(`📊 计数器更新: ${name} = ${this.counters[name]} (+${amount})`);

        // 记录到历史
        this.addToHistory('counter', name, this.counters[name], oldValue);

        // 检查是否触发里程碑
        this.checkMilestone(name, this.counters[name]);

        return this;
    }

    /**
     * 获取计数器值
     */
    getCounter(name) {
        return this.counters[name] || 0;
    }

    /**
     * 记录玩家选择
     */
    recordChoice(choiceId, value) {
        this.choices[choiceId] = value;

        console.log(`📝 记录选择: ${choiceId} = ${value}`);

        // 记录到历史
        this.addToHistory('choice', choiceId, value);

        // 根据选择设置相关标记
        this.processChoice(choiceId, value);

        return this;
    }

    /**
     * 获取选择记录
     */
    getChoice(choiceId) {
        return this.choices[choiceId];
    }

    /**
     * 更新章节进度
     */
    updateProgress(type, value) {
        const oldValue = this.progress[type];
        this.progress[type] = value;

        console.log(`📖 进度更新: ${type} = ${value}`);

        // 章节变化时触发自动存档
        if (type === 'chapter' && oldValue !== value) {
            this.triggerChapterChange(value, oldValue);
        }

        return this;
    }

    /**
     * 添加到事件历史
     */
    addToHistory(type, name, newValue, oldValue = null) {
        const event = {
            type: type,
            name: name,
            value: newValue,
            oldValue: oldValue,
            timestamp: Date.now(),
            gameTime: window.gameState ? { ...window.gameState.gameTime } : null
        };

        this.eventHistory.push(event);

        // 限制历史记录数量（保留最近100条）
        if (this.eventHistory.length > 100) {
            this.eventHistory.shift();
        }
    }

    /**
     * 触发标记相关事件
     */
    triggerFlagEvent(flagName, value) {
        // 根据不同的标记触发不同的游戏事件
        switch(flagName) {
            case 'MET_ZERO':
                if (value) {
                    console.log('🎭 触发事件: 初次遇见Zero');
                    // 可以触发相关剧情或UI更新
                }
                break;

            case 'KNOWS_WOLF_SOUL':
                if (value) {
                    console.log('🐺 触发事件: 了解狼魂秘密');
                    // 解锁新的对话选项或能力
                }
                break;

            case 'ESCAPED_LAB':
                if (value) {
                    console.log('🏃 触发事件: 逃出实验室');
                    // 触发新章节或场景转换
                }
                break;
        }
    }

    /**
     * 检查里程碑
     */
    checkMilestone(counterName, value) {
        // 根据计数器值触发里程碑事件
        switch(counterName) {
            case 'MEMORIES_RECOVERED':
                if (value === 3) {
                    console.log('🏆 里程碑: 恢复了3个记忆碎片！');
                    this.setFlag('FIRST_AWAKENING', true);
                } else if (value === 5) {
                    console.log('🏆 里程碑: 恢复了5个记忆碎片！');
                    this.setFlag('HALF_AWAKENING', true);
                }
                break;

            case 'ZERO_MEETINGS':
                if (value === 5) {
                    console.log('💝 里程碑: 与Zero见面5次');
                    // 可以解锁亲密度等级
                }
                break;
        }
    }

    /**
     * 处理玩家选择的后果
     */
    processChoice(choiceId, value) {
        // 根据选择设置相关标记
        switch(choiceId) {
            case 'FIRST_MEETING_ZERO':
                if (value === 'trust') {
                    this.setFlag('TRUSTED_ZERO', true);
                } else if (value === 'suspicious') {
                    this.setFlag('SUSPICIOUS_OF_ZERO', true);
                }
                break;

            case 'WOLF_SOUL_REACTION':
                if (value === 'accept') {
                    this.setFlag('ACCEPTED_WOLF_SOUL', true);
                } else if (value === 'fear') {
                    this.setFlag('FEARED_WOLF_SOUL', true);
                }
                break;
        }
    }

    /**
     * 触发章节变化
     */
    triggerChapterChange(newChapter, oldChapter) {
        console.log(`📗 章节变化: ${oldChapter} → ${newChapter}`);

        // 触发自动存档
        if (window.saveSystem && window.saveSystem.autoSave) {
            window.saveSystem.autoSave();
        }

        // 可以触发过场动画或特殊事件
    }

    /**
     * 检查多个标记的组合条件
     */
    checkCondition(conditions) {
        // 支持复杂的条件检查
        // 例如: { flags: ['MET_ZERO', 'TRUSTED_ZERO'], counters: { ZERO_MEETINGS: 3 } }

        // 检查标记
        if (conditions.flags) {
            for (let flag of conditions.flags) {
                if (!this.checkFlag(flag)) {
                    return false;
                }
            }
        }

        // 检查计数器
        if (conditions.counters) {
            for (let [counter, minValue] of Object.entries(conditions.counters)) {
                if (this.getCounter(counter) < minValue) {
                    return false;
                }
            }
        }

        // 检查选择
        if (conditions.choices) {
            for (let [choiceId, expectedValue] of Object.entries(conditions.choices)) {
                if (this.getChoice(choiceId) !== expectedValue) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 获取当前剧情状态摘要
     */
    getSummary() {
        return {
            chapter: this.progress.chapter,
            scene: this.progress.scene,
            mainQuest: this.progress.mainQuest,

            // 关键标记
            metZero: this.checkFlag('MET_ZERO'),
            knowsWolfSoul: this.checkFlag('KNOWS_WOLF_SOUL'),
            memoriesRecovered: this.getCounter('MEMORIES_RECOVERED'),

            // 关系状态
            zeroRelationship: this.checkFlag('TRUSTED_ZERO') ? 'trusted' : 'neutral',
            observerRelationship: this.checkFlag('TRUSTED_OBSERVER') ? 'trusted' : 'neutral'
        };
    }

    /**
     * 保存剧情数据（用于存档）
     */
    save() {
        return {
            flags: { ...this.flags },
            counters: { ...this.counters },
            choices: { ...this.choices },
            progress: { ...this.progress },
            // 只保存最近20条历史
            eventHistory: this.eventHistory.slice(-20)
        };
    }

    /**
     * 加载剧情数据（用于读档）
     */
    load(data) {
        if (data.flags) this.flags = { ...data.flags };
        if (data.counters) this.counters = { ...data.counters };
        if (data.choices) this.choices = { ...data.choices };
        if (data.progress) this.progress = { ...data.progress };
        if (data.eventHistory) this.eventHistory = [...data.eventHistory];

        console.log('📚 剧情数据已加载');
    }
}

// 创建全局实例
window.storyFlags = new StoryFlags();

// 导出用于测试
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryFlags;
}

console.log('📚 剧情标记系统模块已加载');