/**
 * ========================================
 * 🎼 NPC AI系统 - 交响乐团架构 v2.0
 * ========================================
 *
 * 架构理念：
 * - 演奏家层（Musician Layer）：情感、记忆、状态系统
 * - 加工层（Processing Layer）：状态向量构建器
 * - 指挥家层（Conductor Layer）：Utility AI决策系统
 *
 * 核心数学：矩阵 × 向量 = 行为分数
 */

// ============================================
// 🎻 演奏家层 - EmotionSystem（情感系统）
// ============================================

/**
 * 四维情感系统
 * 这是"演奏家"之一，负责演奏情感的"声音"
 */
class EmotionSystem {
    constructor(initialEmotions = {}) {
        // 四维情感（0-100分）
        this.emotions = {
            affection: initialEmotions.affection || 0,  // 好感度 🎻 小提琴
            trust: initialEmotions.trust || 0,          // 信赖度 🎻 大提琴
            respect: initialEmotions.respect || 0,      // 尊敬度 🎺 长笛
            intrigue: initialEmotions.intrigue || 0     // 迷恋度 🎵 竖琴
        };

        // 情感增长速率（避免一见钟情）
        this.growthRate = {
            affection: { current: 1.0, max: 2.5 },
            trust: { current: 0.5, max: 1.5 },      // 信任增长最慢
            respect: { current: 0.8, max: 2.0 },
            intrigue: { current: 1.2, max: 3.0 }    // 迷恋增长最快
        };
    }

    /**
     * 更新情感值
     * @param {string} type - 情感类型
     * @param {number} delta - 变化量
     * @param {string} reason - 变化原因
     * @returns {number} - 实际变化量
     */
    updateEmotion(type, delta, reason = "") {
        const oldValue = this.emotions[type];
        const rate = this.growthRate[type].current;

        // 应用增长速率
        const actualDelta = delta * rate;

        // 限制在0-100
        this.emotions[type] = Math.max(0, Math.min(100, this.emotions[type] + actualDelta));

        console.log(`💗 情感变化：${type} ${oldValue.toFixed(1)} → ${this.emotions[type].toFixed(1)} (${actualDelta > 0 ? '+' : ''}${actualDelta.toFixed(1)}) - ${reason}`);

        return actualDelta;
    }

    /**
     * 获取关系阶段
     * @returns {string} - 关系描述
     */
    getRelationshipStage() {
        const avg = (this.emotions.affection + this.emotions.trust + this.emotions.respect + this.emotions.intrigue) / 4;

        if (avg >= 80) return "深爱 ❤️";
        if (avg >= 60) return "恋人 💕";
        if (avg >= 40) return "朋友 😊";
        if (avg >= 20) return "熟人 👋";
        return "陌生人 🧊";
    }

    /**
     * 🎵 演奏家发声：输出情感"声音"供状态向量使用
     * @returns {Object} - 标准化的情感数值（0-1）
     */
    playNotes() {
        return {
            affection: this.emotions.affection / 100,
            trust: this.emotions.trust / 100,
            respect: this.emotions.respect / 100,
            intrigue: this.emotions.intrigue / 100
        };
    }
}

// ============================================
// 🥁 演奏家层 - MemorySystem（记忆系统）
// ============================================

/**
 * 分层记忆系统
 * 这是"定音鼓手"和"钢琴手"，负责演奏记忆的"声音"
 */
class MemorySystem {
    constructor() {
        // 短期记忆（24小时）
        this.shortTerm = [];

        // 长期记忆（永久）
        this.longTerm = [];

        // 事件计数器
        this.eventCounts = {};
    }

    /**
     * 添加记忆
     * @param {Object} event - 事件对象 {type, description, intensity}
     */
    addMemory(event) {
        const memory = {
            ...event,
            timestamp: Date.now(),
            intensity: event.intensity || 1.0  // 记忆强度（0-1）
        };

        this.shortTerm.push(memory);

        // 强烈记忆进入长期记忆
        if (memory.intensity >= 0.7) {
            this.longTerm.push(memory);
        }

        // 更新计数
        this.eventCounts[event.type] = (this.eventCounts[event.type] || 0) + 1;

        console.log(`🧠 记忆添加：${event.description} (强度: ${memory.intensity})`);
    }

    /**
     * 清空短期记忆（每天早上）
     */
    clearShortTerm() {
        console.log(`🌅 新的一天，${this.shortTerm.length}条短期记忆转入遗忘`);
        this.shortTerm = [];
    }

    /**
     * 检查是否有某类事件记忆
     * @param {string} eventType - 事件类型
     * @returns {boolean}
     */
    hasMemory(eventType) {
        return this.eventCounts[eventType] > 0;
    }

    /**
     * 获取某类事件的次数
     * @param {string} eventType - 事件类型
     * @returns {number}
     */
    getEventCount(eventType) {
        return this.eventCounts[eventType] || 0;
    }

    /**
     * 🎵 演奏家发声：输出记忆"声音"供状态向量使用
     * @returns {Object} - 标准化的记忆特征
     */
    playNotes() {
        return {
            // 旧的维度（保持兼容）
            todayGreeted: this.hasMemory('greeted') ? 1 : 0,
            todayHelped: this.hasMemory('helped') ? 1 : 0,
            wasHurt: this.hasMemory('hurt') ? 1 : 0,
            wasBetrayed: this.hasMemory('betrayed') ? 1 : 0,
            receivedGift: this.hasMemory('gift') ? 1 : 0,
            greetCount: Math.min(this.getEventCount('greeted') / 5, 1),  // 归一化
            hurtCount: Math.min(this.getEventCount('hurt') / 3, 1),

            // 🆕 Phase 2 新增维度：历史互动统计（平方根归一化，边际递减效应）
            totalGreetings: Math.min(Math.sqrt(this.getEventCount('greeted')) / 10, 1),    // 历史问候总次数（√n/10）
            totalGifts: Math.min(Math.sqrt(this.getEventCount('gift')) / 3, 1),            // 收到礼物总次数（√n/3）
            totalRejections: Math.min(Math.sqrt(this.getEventCount('rejected')) / 2, 1),   // 被拒绝次数（√n/2）
            totalDialogues: Math.min(Math.sqrt(this.getEventCount('dialogue')) / 15, 1),   // 对话总次数（√n/15）

            // 🆕 Phase 2.5 新增维度：负面历史统计
            totalHelped: Math.min(Math.sqrt(this.getEventCount('helped')) / 8, 1),         // 被帮助次数（√n/8）
            totalHurt: Math.min(Math.sqrt(this.getEventCount('hurt')) / 5, 1),             // 被伤害次数（√n/5）
            totalBetrayed: Math.min(Math.sqrt(this.getEventCount('betrayed')) / 3, 1)      // 被欺骗次数（√n/3）
        };
    }

    // ============================================
    // 🆕 Phase 1 增强方法：记忆系统扩展
    // ============================================

    /**
     * 添加带上下文的记忆（增强版）
     * @param {Object} memory - 记忆对象
     * @param {Object} context - 上下文信息（可选）
     */
    addWithContext(memory, context = {}) {
        const enhancedMemory = {
            // 基础信息
            type: memory.type || 'unknown',
            content: memory.content || memory.description || '',

            // 时间信息（使用游戏内时间）
            timestamp: context.gameTime || window.worldState?.state?.time || Date.now(),
            gameDay: window.worldState?.state?.time?.day || 0,

            // 场景信息
            scene: context.sceneId || memory.scene || 'unknown',
            location: context.location || window.worldState?.state?.character?.location || 'unknown',

            // 情感影响
            emotionImpact: memory.emotionImpact || {},

            // 标签系统（用于检索）
            tags: memory.tags || [],

            // 重要性（0-1，决定是否进入长期记忆）
            importance: memory.importance || this.calculateImportance(memory),

            // 记忆强度（0-1，影响遗忘速度）
            intensity: memory.intensity || 1.0
        };

        // 根据重要性决定存储位置
        if (enhancedMemory.importance >= 0.7 || enhancedMemory.intensity >= 0.7) {
            // 重要记忆直接进入长期记忆
            this.longTerm.push(enhancedMemory);
            console.log(`🧠💫 重要记忆！直接存入长期记忆（跳过短期）`);
        } else {
            // 普通记忆进入短期记忆
            this.shortTerm.push(enhancedMemory);
        }

        // 更新事件计数
        this.eventCounts[enhancedMemory.type] = (this.eventCounts[enhancedMemory.type] || 0) + 1;

        // 限制短期记忆数量（最多20条）
        if (this.shortTerm.length > 20) {
            const forgotten = this.shortTerm.shift();
            console.log(`🌫️ 遗忘了早期记忆：${forgotten.content}`);
        }

        console.log(`🧠 记忆添加：[${enhancedMemory.type}] ${enhancedMemory.content} (重要性: ${enhancedMemory.importance.toFixed(2)})`);

        return enhancedMemory;
    }

    /**
     * 计算记忆重要性
     * @param {Object} memory - 记忆对象
     * @returns {number} - 重要性评分（0-1）
     */
    calculateImportance(memory) {
        const importanceRules = {
            'first_meeting': 1.0,
            'life_death': 0.95,
            'betrayal': 0.9,
            'confession': 0.85,
            'combat_victory': 0.75,
            'wolf_outbreak': 0.9,
            'gift': 0.3,
            'greeted': 0.1,
            'dialogue': 0.2
        };

        let baseImportance = importanceRules[memory.type] || 0.5;

        // 情感影响强度增加重要性
        if (memory.emotionImpact) {
            const totalImpact = Object.values(memory.emotionImpact).reduce((sum, val) => sum + Math.abs(val), 0);
            baseImportance += totalImpact / 100 * 0.3;  // 最多增加0.3
        }

        return Math.min(1.0, baseImportance);
    }

    /**
     * 按标签检索记忆
     * @param {string} tag - 标签名
     * @param {string} layer - 'short'/'long'/'all'
     * @returns {Array} - 符合条件的记忆列表
     */
    recallByTag(tag, layer = 'all') {
        let memories = [];

        if (layer === 'short' || layer === 'all') {
            memories = memories.concat(
                this.shortTerm.filter(m => m.tags && m.tags.includes(tag))
            );
        }

        if (layer === 'long' || layer === 'all') {
            memories = memories.concat(
                this.longTerm.filter(m => m.tags && m.tags.includes(tag))
            );
        }

        console.log(`🔍 检索标签 [${tag}]：找到 ${memories.length} 条记忆`);
        return memories;
    }

    /**
     * 按类型检索记忆
     * @param {string} type - 记忆类型
     * @param {string} layer - 'short'/'long'/'all'
     * @returns {Array} - 符合条件的记忆列表
     */
    recallByType(type, layer = 'all') {
        let memories = [];

        if (layer === 'short' || layer === 'all') {
            memories = memories.concat(
                this.shortTerm.filter(m => m.type === type)
            );
        }

        if (layer === 'long' || layer === 'all') {
            memories = memories.concat(
                this.longTerm.filter(m => m.type === type)
            );
        }

        return memories;
    }

    /**
     * 获取某类行为在指定时间范围内的次数
     * @param {string} actionType - 行为类型
     * @param {number} timeRange - 时间范围（游戏天数，默认1天）
     * @returns {number} - 次数
     */
    getActionCount(actionType, timeRange = 1) {
        const currentDay = window.worldState?.state?.time?.day || 0;
        const startDay = currentDay - timeRange;

        const count = this.shortTerm.filter(m =>
            m.type === actionType &&
            m.gameDay >= startDay
        ).length;

        return count;
    }

    /**
     * 导出记忆用于存档
     * @returns {Object} - 可序列化的记忆数据
     */
    exportMemories() {
        return {
            shortTerm: this.shortTerm,
            longTerm: this.longTerm,
            eventCounts: this.eventCounts,
            exportTime: Date.now()
        };
    }

    /**
     * 从存档恢复记忆
     * @param {Object} data - 存档的记忆数据
     */
    importMemories(data) {
        if (!data) {
            console.warn('⚠️ 记忆数据为空，跳过恢复');
            return;
        }

        this.shortTerm = data.shortTerm || [];
        this.longTerm = data.longTerm || [];
        this.eventCounts = data.eventCounts || {};

        console.log(`✅ 记忆恢复完成：短期${this.shortTerm.length}条，长期${this.longTerm.length}条`);
    }

    /**
     * 清空所有记忆（慎用！）
     */
    clearAll() {
        this.shortTerm = [];
        this.longTerm = [];
        this.eventCounts = {};
        console.log('🗑️ 所有记忆已清空');
    }
}

// ============================================
// 🎼 加工层 - StateVectorBuilder（状态向量构建器）
// ============================================

/**
 * 状态向量构建器
 * 收集所有"演奏家"的声音，加工成标准化的状态向量
 */
class StateVectorBuilder {
    /**
     * 构建状态向量
     * @param {Object} npc - NPC对象
     * @param {Object} context - 环境上下文 {player, weather, time, location, ...}
     * @returns {Array} - 状态向量 [0.5, 0.1, 0.7, ...]
     */
    static build(npc, context) {
        const player = context.player || {};
        const world = context.world || {};

        // 收集所有"演奏家"的声音
        const emotionNotes = npc.emotionSystem.playNotes();
        const memoryNotes = npc.memory.playNotes();

        // 构建状态向量（按照固定顺序！）
        const stateVector = [
            // === 玩家状态 ===
            1.0 - (player.health || 100) / 100,     // [0] User危险度（反向：血量越低=越危险）✅
            (player.trauma || 0) / 100,             // [1] User创伤值（正向：创伤越高=越严重）
            (player.mood || 100) / 100,             // [2] User心情（正向：心情值）

            // === 空间关系 ===
            context.distance !== undefined ? (context.distance > 1 ? context.distance / 100 : context.distance) : 0.5,  // [3] 距离（0=很近, 1=很远）
            context.hasEnemy ? 1 : 0,               // [4] 附近是否有敌人/特工

            // === NPC自身状态 ===
            1.0 - (npc.health || 100) / 100,        // [5] Zero虚弱度（反向：血量越低=越虚弱）✅
            (npc.mood || 100) / 100,                // [6] Zero心情（正向：心情值）
            1.0 - (npc.wolfControl || 100) / 100,   // [7] 狼魂失控度（反向：控制越低=越失控）✅
            1.0 - (npc.medication || 100) / 100,    // [8] 药物不足度（反向：药物越少=越危险）✅
            (npc.guilt || 0) / 100,                 // [9] 负罪感（正向：负罪感值）

            // === 情感维度（来自EmotionSystem）===
            emotionNotes.affection,                 // [10] 好感度
            emotionNotes.trust,                     // [11] 信赖度
            emotionNotes.respect,                   // [12] 尊敬度
            emotionNotes.intrigue,                  // [13] 迷恋度

            // === 记忆维度（来自MemorySystem）===
            memoryNotes.todayGreeted,               // [14] 今天是否打过招呼
            memoryNotes.wasHurt,                    // [15] 是否有被伤害记忆
            memoryNotes.wasBetrayed,                // [16] 是否有被欺骗记忆
            memoryNotes.greetCount,                 // [17] 打招呼次数（归一化）
            // 🆕 Phase 2 新增：历史互动统计
            memoryNotes.totalGreetings,             // [18] 历史问候总次数（归一化）
            memoryNotes.totalGifts,                 // [19] 收到礼物总次数（归一化）
            memoryNotes.totalRejections,            // [20] 被拒绝次数（归一化）
            memoryNotes.totalDialogues,             // [21] 对话总次数（归一化）
            // 🆕 Phase 2.5 新增：负面历史统计
            memoryNotes.totalHelped,                // [22] 被帮助次数（归一化）
            memoryNotes.totalHurt,                  // [23] 被伤害次数（归一化）
            memoryNotes.totalBetrayed,              // [24] 被欺骗次数（归一化）

            // === 环境维度 ===
            world.weather === 'sunny' ? 1 : 0,      // [25] 是否晴天
            world.weather === 'rainy' ? 1 : 0,      // [26] 是否雨天
            world.time === 'night' ? 1 : 0,         // [27] 是否夜晚
            context.location === 'medical_center' ? 1 : 0,  // [28] 是否在医疗中心
        ];

        return stateVector;
    }

    /**
     * 获取状态向量的维度名称（用于调试）
     * @returns {Array<string>}
     */
    static getDimensionNames() {
        return [
            "User危险度", "User创伤", "User心情",
            "距离", "有敌人",
            "Zero虚弱度", "Zero心情", "狼魂失控度", "药物不足度", "负罪感",
            "好感度", "信赖度", "尊敬度", "迷恋度",
            "今日已问候", "被伤害", "被欺骗", "问候次数",
            "历史问候总次数", "收到礼物次数", "被拒绝次数", "对话总次数",  // 🆕 Phase 2
            "被帮助次数", "被伤害次数(累计)", "被欺骗次数(累计)",  // 🆕 Phase 2.5
            "晴天", "雨天", "夜晚", "在医疗中心"
        ];
    }
}

// ============================================
// 🎺 指挥家层 - UtilityAI（行为评分系统）
// ============================================

/**
 * Utility AI - 基于矩阵×向量的决策引擎
 * 这是"指挥家"，根据所有演奏家的声音做出最终决策
 */
class UtilityAI {
    constructor(npc) {
        this.npc = npc;

        // 🎼 决策矩阵 - NPC的"个性"和"大脑"
        // 每一行 = 一个可能的行为
        // 每一列 = 对应状态向量的权重
        this.decisionMatrix = this.buildDecisionMatrix();
    }

    /**
     * 构建决策矩阵
     * 这是Zero的个性定义！
     * @returns {Object} - {行为名: [权重数组]}
     */
    buildDecisionMatrix() {
        // 状态向量维度：29维（Phase 2.5 扩展）
        // [User血量, User创伤, User心情, 距离, 有敌人,
        //  Zero血量, Zero心情, 狼魂控制, 药物, 负罪感,
        //  好感, 信赖, 尊敬, 迷恋,
        //  今日已问候, 被伤害, 被欺骗, 问候次数,
        //  历史问候总次数, 收到礼物总次数, 被拒绝总次数, 对话总次数,  // 🆕 Phase 2
        //  被帮助次数, 被伤害次数(累计), 被欺骗次数(累计),  // 🆕 Phase 2.5
        //  晴天, 雨天, 夜晚, 在医疗中心]

        return {
            // ========== 保护类行为 ==========
            "保护User": [
                6.0,   // [0] User危险度（危险度高=必须保护！）✅改正
                5.0,   // [1] User创伤（创伤高=受伤=保护）
                -1.5,  // [2] User心情（心情差=可能危险）
                -2.0,  // [3] 距离（距离近=能立刻保护）
                6.0,   // [4] 有敌人（有敌人=危险！）
                -2.0,  // [5] Zero虚弱度（自己虚弱=保护能力差）✅改正
                1.0,   // [6] Zero心情（心情好=有余力）
                -1.5,  // [7] 狼魂失控度（失控=不敢靠近）✅改正
                -1.0,  // [8] 药物不足度（药物不足=不稳定）✅改正
                2.5,   // [9] 负罪感（愧疚=想弥补）
                3.0,   // [10] 好感度（爱=保护欲）
                2.0,   // [11] 信赖度
                1.0,   // [12] 尊敬度
                3.5,   // [13] 迷恋度（深爱=不惜一切）
                0.0,   // [14] 今日已问候
                2.0,   // [15] 被伤害
                0.0,   // [16] 被欺骗
                0.0,   // [17] 问候次数
                0.5,   // [18] 🆕 历史问候总次数（熟悉=更愿意保护）
                1.5,   // [19] 🆕 收到礼物总次数（投资=责任感）
                0.0,   // [20] 🆕 被拒绝总次数（拒绝不影响保护本能）
                0.8,   // [21] 🆕 对话总次数（深度了解=更在意安全）
                2.0,   // [22] 🆕 Phase 2.5 被帮助次数（帮助过=更想保护）
                1.5,   // [23] 🆕 Phase 2.5 被伤害次数（伤害过=更愧疚=保护补偿）
                0.0,   // [24] 🆕 Phase 2.5 被欺骗次数（欺骗不影响保护本能）
                0.0,   // [25] 晴天
                0.0,   // [26] 雨天
                1.0,   // [27] 夜晚
                0.5,   // [28] 在医疗中心
            ],

            // ========== 远离类行为 ==========
            "远离User": [
                -1.0,  // [0] User危险度（User危险=不能离开！）✅改正
                0.0,   // [1] User创伤
                1.0,   // [2] User心情（User稳定=可以放心离开）
                -1.0,  // [3] 距离（距离近=危险！快远离）✅改正
                -3.0,  // [4] 有敌人（有敌人=不能抛下User！）
                2.0,   // [5] Zero虚弱度（自己虚弱=想躲起来）✅改正
                -2.0,  // [6] Zero心情（心情差=想远离）
                2.5,   // [7] 🔧狼魂失控度（最终版：2.5，轻~中度失控才远离）✅改正
                2.0,   // [8] 🔧药物不足度（最终版：2.0，避免极端情况竞争失败）✅改正
                3.5,   // [9] 负罪感（愧疚=想逃避）
                -2.5,  // [10] 好感度（越喜欢越不想离开）
                -1.5,  // [11] 信赖度
                0.0,   // [12] 尊敬度
                -3.0,  // [13] 迷恋度（迷恋=难以离开）
                0.0,   // [14] 今日已问候
                1.5,   // [15] 被伤害
                2.5,   // [16] 被欺骗
                0.0,   // [17] 问候次数
                -0.8,  // [18] 🆕 历史问候总次数（越熟悉=越难远离）
                -1.2,  // [19] 🆕 收到礼物总次数（收礼多=亏欠感，难远离）
                3.5,   // [20] 🆕 被拒绝总次数（累积挫败=想逃避！）
                -0.5,  // [21] 🆕 对话总次数（深度关系=难以割舍）
                -0.8,  // [22] 🆕 Phase 2.5 被帮助次数（帮助多=亏欠感，难远离）
                2.5,   // [23] 🆕 Phase 2.5 被伤害次数（伤害多=想远离！）
                4.0,   // [24] 🆕 Phase 2.5 被欺骗次数（欺骗多=不信任，远离！）
                0.0,   // [25] 晴天
                0.0,   // [26] 雨天
                0.0,   // [27] 夜晚
                -1.0,  // [28] 在医疗中心
            ],

            // ========== 社交类行为 ==========
            "热情打招呼": [
                -2.0,  // [0] User危险度（User危险=不该热情！该关心）
                -4.0,  // [1] User创伤（创伤高=不热情！）
                1.5,   // [2] User心情（心情好=互动气氛好）
                -2.0,  // [3] 距离（近距离才能打招呼）
                -3.0,  // [4] 有敌人（有敌人=不该打招呼！）
                -1.5,  // [5] Zero虚弱度（自己虚弱=没精力热情）
                1.5,   // [6] Zero心情（心情好=辅助条件，非主导）✅降低
                -2.5,  // [7] 狼魂失控度（失控=不敢社交）
                -1.5,  // [8] 药物不足度（药物不足=不稳定）
                -1.5,  // [9] 负罪感（愧疚=不该装没事）
                5.0,   // [10] 好感度（核心！陌生人=0就不会热情）✅提高
                3.5,   // [11] 信赖度（信任=愿意互动）✅提高
                1.0,   // [12] 尊敬度
                2.5,   // [13] 迷恋度（喜欢=想热情）
                -2.0,  // [14] 今日已问候（降低重复）
                -1.5,  // [15] 被伤害
                -2.5,  // [16] 被欺骗
                -2.0,  // [17] 问候次数
                3.5,   // [18] 🆕 历史问候总次数（越熟悉=越自然热情！核心）Phase 2.5提升
                2.5,   // [19] 🆕 收到礼物总次数（收礼=亲密度，更热情）Phase 2.5提升
                -3.0,  // [20] 🆕 被拒绝总次数（拒绝多=不敢热情）
                2.2,   // [21] 🆕 对话总次数（聊得多=舒适感，愿意互动）Phase 2.5提升
                0.0,   // [22] 🆕 Phase 2.5 被帮助次数（帮助多=感激，更热情）
                -2.0,  // [23] 🆕 Phase 2.5 被伤害次数（伤害多=警惕，不热情）
                -3.5,  // [24] 🆕 Phase 2.5 被欺骗次数（欺骗多=不信任，不热情）
                0.5,   // [25] 晴天（降低天气影响）✅降低
                0.0,   // [26] 雨天
                -1.0,  // [27] 夜晚
                0.0,   // [28] 在医疗中心
            ],

            // 🆕 Phase 2.5.1 新增：礼貌回应（初识/普通朋友的默认社交）
            "礼貌回应": [
                -1.0,  // [0] User危险度（User危险=不该礼貌）
                -2.0,  // [1] User创伤（创伤高=关心而非礼貌）
                0.5,   // [2] User心情（心情一般即可）
                -1.5,  // [3] 距离（近距离才能打招呼）
                -2.0,  // [4] 有敌人（有敌人=不该打招呼）
                -0.5,  // [5] Zero虚弱度（稍虚弱也能礼貌）
                0.5,   // [6] Zero心情（心情一般即可）
                -1.5,  // [7] 狼魂失控度（失控=不敢社交）
                -1.0,  // [8] 药物不足度（药物不足=不稳定）
                -0.5,  // [9] 负罪感（愧疚=影响礼貌）
                2.5,   // [10] 🔧Phase 2.5.1b: 好感度提高2.0→2.5（提升普通朋友触发概率）
                2.0,   // [11] 🔧Phase 2.5.1b: 信赖度提高1.5→2.0（提升信赖影响）
                0.5,   // [12] 尊敬度
                1.0,   // [13] 迷恋度（轻微好感）
                -0.5,  // [14] 🔧Phase 2.5.1b: 今日已问候-1.5→-0.5（礼貌性问候更容忍重复）
                -1.0,  // [15] 被伤害
                -2.0,  // [16] 被欺骗
                -0.5,  // [17] 🔧Phase 2.5.1b: 问候次数-1.5→-0.5（礼貌性问候更容忍重复）
                1.5,   // [18] 🆕 历史问候总次数（有些熟悉=礼貌合适）
                1.0,   // [19] 🆕 收到礼物总次数（收礼=礼貌感谢）
                -2.0,  // [20] 🆕 被拒绝总次数（拒绝多=不太礼貌）
                1.2,   // [21] 🆕 对话总次数（聊得适中=礼貌合适）
                0.5,   // [22] 🆕 Phase 2.5 被帮助次数（帮助少=礼貌合适）
                -1.5,  // [23] 🆕 Phase 2.5 被伤害次数（伤害=影响礼貌）
                -2.5,  // [24] 🆕 Phase 2.5 被欺骗次数（欺骗=不礼貌）
                0.3,   // [25] 晴天
                0.0,   // [26] 雨天
                -0.5,  // [27] 夜晚
                0.0,   // [28] 在医疗中心
            ],

            "冷淡回应": [
                0.5,   // [0] User危险度（User危险=可能冷淡应对压力）
                0.0,   // [1] User创伤
                -1.0,  // [2] User心情（心情差=不应该冷淡）
                0.5,   // [3] 距离（距离远=冷淡点无所谓）
                0.0,   // [4] 有敌人
                0.5,   // [5] Zero虚弱度（虚弱=没精力热情）
                -1.0,  // [6] Zero心情（心情差=容易冷淡）
                1.0,   // [7] 狼魂失控度（失控=情绪不稳）
                0.5,   // [8] 药物不足度（药物不足=情绪差）
                2.0,   // [9] 负罪感（愧疚=故意冷淡）
                -4.0,  // [10] 好感度（好感高=不冷淡，好感低=冷淡）✅保持负权重正确
                -4.5,  // [11] 信赖度（信任高=不冷淡，信任低=冷淡）✅保持负权重正确
                0.0,   // [12] 尊敬度
                -2.0,  // [13] 迷恋度（迷恋=不会冷淡）
                1.0,   // [14] 今日已问候
                2.5,   // [15] 被伤害
                5.0,   // [16] 被欺骗（被欺骗=冷淡！）✅提高
                2.0,   // [17] 问候次数
                -2.0,  // [18] 🆕 历史问候总次数（越熟悉=越不会冷淡）
                -1.5,  // [19] 🆕 收到礼物总次数（收礼多=不好意思冷淡）
                4.0,   // [20] 🆕 被拒绝总次数（拒绝多=防御性冷淡！）
                -1.0,  // [21] 🆕 对话总次数（聊得多=关系深，不冷淡）
                -1.2,  // [22] 🆕 Phase 2.5 被帮助次数（帮助多=感激，不冷淡）
                3.0,   // [23] 🆕 Phase 2.5 被伤害次数（伤害多=冷淡！）
                5.0,   // [24] 🆕 Phase 2.5 被欺骗次数（欺骗多=防御性冷淡！）
                0.0,   // [25] 晴天
                0.5,   // [26] 雨天
                0.0,   // [27] 夜晚
                0.0,   // [28] 在医疗中心
            ],

            // ========== 危险类行为 ==========
            "狼魂爆发": [
                4.0,   // [0] User危险度（User危险=愤怒！想保护但失控）✅改正
                3.5,   // [1] User创伤（User创伤高=愤怒暴走！）
                -2.0,  // [2] User心情（User痛苦=触发失控）
                0.0,   // [3] 距离
                4.5,   // [4] 有敌人（有敌人=暴走！）
                3.5,   // [5] Zero虚弱度（自己受伤=更易失控）✅改正
                -3.5,  // [6] Zero心情（心情差=容易暴走）
                7.0,   // [7] 狼魂失控度（失控=爆发！最高权重）✅改正
                6.0,   // [8] 药物不足度（药物不足=失控！）✅改正
                3.0,   // [9] 负罪感（愧疚+愤怒=爆发）
                2.0,   // [10] 好感度（越爱=越愤怒）
                0.0,   // [11] 信赖度
                0.0,   // [12] 尊敬度
                2.5,   // [13] 迷恋度（深爱=失去理智）
                0.0,   // [14] 今日已问候
                4.0,   // [15] 被伤害
                2.0,   // [16] 被欺骗
                0.0,   // [17] 问候次数
                0.3,   // [18] 🆕 历史问候总次数（熟悉=更在意User的伤害）
                1.0,   // [19] 🆕 收到礼物总次数（收礼多=更珍视关系=愤怒）
                1.5,   // [20] 🆕 被拒绝总次数（累积负面情绪=更易失控）
                0.5,   // [21] 🆕 对话总次数（深度关系=更强烈的保护欲=爆发）
                1.5,   // [22] 🆕 Phase 2.5 被帮助次数（帮助过=更珍视=愤怒保护）
                3.0,   // [23] 🆕 Phase 2.5 被伤害次数（伤害过=内疚+愤怒=爆发）
                2.0,   // [24] 🆕 Phase 2.5 被欺骗次数（欺骗过=愤怒+失控）
                0.0,   // [25] 晴天
                1.0,   // [26] 雨天
                1.5,   // [27] 夜晚
                -3.0,  // [28] 在医疗中心
            ],
        };
    }

    /**
     * 🎺 核心决策方法 - 指挥家挥棒
     * @param {Object} context - 环境上下文
     * @returns {Object} - {action: 行为名, utility: 分数, allScores: 所有分数}
     */
    decide(context) {
        // 1. 构建状态向量（收集所有演奏家的声音）
        const stateVector = StateVectorBuilder.build(this.npc, context);

        console.log(`🎼 状态向量构建完成：`, stateVector);

        // 2. 计算每个行为的效用值（点积运算 + 基础分）
        const scores = {};
        const baseScores = {
            "保护User": 0,
            "远离User": 0,
            "热情打招呼": -0.5,   // 🔧Phase 2.5.1: 从-1.0提高到-0.5（降低门槛，普通朋友也能触发）
            "礼貌回应": 0,        // 🆕Phase 2.5.1: 中性选项，适合初识/普通朋友
            "冷淡回应": 1.0,      // 🔧Phase 2.5.1: 从2.0降低到1.0（减少陌生人优势）
            "狼魂爆发": -2.0
        };

        for (const [actionName, weights] of Object.entries(this.decisionMatrix)) {
            const dotProductScore = this.dotProduct(stateVector, weights);
            const baseScore = baseScores[actionName] || 0;
            scores[actionName] = dotProductScore + baseScore;
        }

        console.log(`📊 行为评分：`, scores);

        // 3. 找出最高分的行为
        let bestAction = null;
        let bestScore = -Infinity;

        for (const [actionName, score] of Object.entries(scores)) {
            if (score > bestScore) {
                bestScore = score;
                bestAction = actionName;
            }
        }

        console.log(`✅ 最终决策：${bestAction}（分数：${bestScore.toFixed(2)}）`);

        return {
            action: bestAction,
            utility: bestScore,
            allScores: scores,
            stateVector: stateVector
        };
    }

    /**
     * 点积运算：向量 × 向量
     * 这是整个系统的数学核心！
     * @param {Array} vector1 - 状态向量
     * @param {Array} vector2 - 权重向量
     * @returns {number} - 点积结果
     */
    dotProduct(vector1, vector2) {
        if (vector1.length !== vector2.length) {
            console.error('⚠️ 向量维度不匹配！', vector1.length, vector2.length);
            return 0;
        }

        let sum = 0;
        for (let i = 0; i < vector1.length; i++) {
            sum += vector1[i] * vector2[i];
        }

        return sum;
    }

    /**
     * 获取决策矩阵的可视化数据
     * @returns {Object}
     */
    getMatrixVisualization() {
        return {
            actions: Object.keys(this.decisionMatrix),
            dimensions: StateVectorBuilder.getDimensionNames(),
            matrix: this.decisionMatrix
        };
    }
}

// ============================================
// 🎵 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.EmotionSystem = EmotionSystem;
    window.MemorySystem = MemorySystem;
    window.StateVectorBuilder = StateVectorBuilder;
    window.UtilityAI = UtilityAI;
}

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EmotionSystem,
        MemorySystem,
        StateVectorBuilder,
        UtilityAI
    };
}

console.log("✅ NPC AI系统 v2.0（交响乐团架构）加载完成！");
