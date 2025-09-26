/**
 * NPC关系管理系统
 * 管理玩家与所有NPC的关系状态、好感度、信任度等
 */

class RelationshipSystem {
    constructor() {
        this.relationships = {};
        this.relationshipStages = [
            'stranger',     // 陌生人 (0-19)
            'acquaintance', // 认识 (20-39)
            'friend',       // 朋友 (40-59)
            'close',        // 亲密 (60-79)
            'lover'         // 恋人 (80-100)
        ];

        // 关系事件触发阈值
        this.eventThresholds = {
            firstMeeting: 0,
            becomeAcquaintance: 20,
            becomeFriend: 40,
            becomeClose: 60,
            confession: 75,
            becomeLover: 80
        };

        // 每日关系衰减（如果长时间不互动）
        this.decayRate = 1; // 每天减少1点
        this.maxDaysWithoutInteraction = 7; // 7天不互动开始衰减

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 如果有存档数据，会在loadGameState时调用load方法恢复
        console.log('💕 关系系统初始化完成');
    }

    /**
     * 初始化NPC关系
     */
    initRelationship(npcId, initialData = {}) {
        if (!this.relationships[npcId]) {
            this.relationships[npcId] = {
                // 基础数值
                affection: initialData.affection || 0,  // 好感度 0-100
                trust: initialData.trust || 0,          // 信任度 0-100

                // 关系阶段
                stage: initialData.stage || 'stranger',

                // 互动记录
                lastInteractionDay: window.gameState?.gameTime?.day || 1,
                totalInteractions: 0,

                // 特殊标记
                flags: initialData.flags || {},

                // 对话记录（最近10条）
                dialogueHistory: [],

                // 礼物记录
                giftsReceived: [],

                // 事件记录
                events: []
            };
        }
        return this.relationships[npcId];
    }

    /**
     * 获取NPC关系
     */
    getRelationship(npcId) {
        if (!this.relationships[npcId]) {
            this.initRelationship(npcId);
        }
        return this.relationships[npcId];
    }

    /**
     * 调整好感度
     */
    adjustAffection(npcId, amount, reason = '') {
        const relationship = this.getRelationship(npcId);
        const oldValue = relationship.affection;

        // 调整数值（0-100范围）
        relationship.affection = Math.max(0, Math.min(100, relationship.affection + amount));

        // 更新关系阶段
        this.updateRelationshipStage(npcId);

        // 记录变化
        this.logEvent(npcId, 'affection_change', {
            oldValue,
            newValue: relationship.affection,
            amount,
            reason
        });

        // 检查是否触发关系事件
        this.checkRelationshipEvents(npcId, 'affection', oldValue, relationship.affection);

        console.log(`💕 ${npcId} 好感度: ${oldValue} → ${relationship.affection} (${amount > 0 ? '+' : ''}${amount})`);

        return relationship.affection;
    }

    /**
     * 调整信任度
     */
    adjustTrust(npcId, amount, reason = '') {
        const relationship = this.getRelationship(npcId);
        const oldValue = relationship.trust;

        relationship.trust = Math.max(0, Math.min(100, relationship.trust + amount));

        this.logEvent(npcId, 'trust_change', {
            oldValue,
            newValue: relationship.trust,
            amount,
            reason
        });

        this.checkRelationshipEvents(npcId, 'trust', oldValue, relationship.trust);

        console.log(`🤝 ${npcId} 信任度: ${oldValue} → ${relationship.trust} (${amount > 0 ? '+' : ''}${amount})`);

        return relationship.trust;
    }

    /**
     * 更新关系阶段
     */
    updateRelationshipStage(npcId) {
        const relationship = this.getRelationship(npcId);
        const affection = relationship.affection;
        const oldStage = relationship.stage;

        if (affection >= 80) {
            relationship.stage = 'lover';
        } else if (affection >= 60) {
            relationship.stage = 'close';
        } else if (affection >= 40) {
            relationship.stage = 'friend';
        } else if (affection >= 20) {
            relationship.stage = 'acquaintance';
        } else {
            relationship.stage = 'stranger';
        }

        // 如果关系阶段改变，触发事件
        if (oldStage !== relationship.stage) {
            this.logEvent(npcId, 'stage_change', {
                oldStage,
                newStage: relationship.stage
            });

            // 触发剧情标记
            if (window.storyFlags) {
                window.storyFlags.setFlag(`${npcId}_STAGE_${relationship.stage.toUpperCase()}`, true);
            }

            console.log(`💫 ${npcId} 关系阶段: ${oldStage} → ${relationship.stage}`);
        }
    }

    /**
     * 检查关系事件触发
     */
    checkRelationshipEvents(npcId, type, oldValue, newValue) {
        const relationship = this.getRelationship(npcId);

        // 检查各个阈值
        for (const [eventName, threshold] of Object.entries(this.eventThresholds)) {
            if (oldValue < threshold && newValue >= threshold) {
                // 触发事件
                this.triggerRelationshipEvent(npcId, eventName, { threshold, value: newValue });
            }
        }

        // 特殊检查：恋人关系需要额外条件
        if (type === 'affection' && newValue >= 80) {
            if (relationship.trust >= 60 && !relationship.flags.isLover) {
                this.triggerLoverEvent(npcId);
            }
        }
    }

    /**
     * 触发关系事件
     */
    triggerRelationshipEvent(npcId, eventName, data) {
        console.log(`🎉 触发关系事件: ${npcId} - ${eventName}`);

        // 记录事件
        this.logEvent(npcId, eventName, data);

        // 设置剧情标记
        if (window.storyFlags) {
            window.storyFlags.setFlag(`${npcId}_EVENT_${eventName.toUpperCase()}`, true);
        }

        // 触发对应的剧情事件
        if (window.storyEventHelpers) {
            const eventId = `${npcId.toLowerCase()}_${eventName}`;
            if (window.storyEventHelpers.canTriggerEvent(eventId)) {
                window.storyEventHelpers.triggerEventEffects(eventId);
            }
        }
    }

    /**
     * 触发恋人事件
     */
    triggerLoverEvent(npcId) {
        const relationship = this.getRelationship(npcId);
        relationship.flags.isLover = true;
        relationship.flags.confessionDate = window.gameState?.gameTime?.day || 1;

        console.log(`💖 ${npcId} 成为恋人！`);

        // 设置剧情标记
        if (window.storyFlags) {
            window.storyFlags.setFlag(`${npcId}_IS_LOVER`, true);
            window.storyFlags.recordChoice(`${npcId}_confession`, 'accepted');
        }
    }

    /**
     * 记录对话
     */
    recordDialogue(npcId, dialogue) {
        const relationship = this.getRelationship(npcId);

        // 保留最近10条对话
        relationship.dialogueHistory.push({
            day: window.gameState?.gameTime?.day || 1,
            content: dialogue,
            timestamp: Date.now()
        });

        if (relationship.dialogueHistory.length > 10) {
            relationship.dialogueHistory.shift();
        }

        // 更新最后互动时间
        relationship.lastInteractionDay = window.gameState?.gameTime?.day || 1;
        relationship.totalInteractions++;
    }

    /**
     * 赠送礼物
     */
    giveGift(npcId, giftId, reaction = 'neutral') {
        const relationship = this.getRelationship(npcId);

        relationship.giftsReceived.push({
            giftId,
            day: window.gameState?.gameTime?.day || 1,
            reaction
        });

        // 根据反应调整好感度
        const affectionChange = {
            'love': 10,
            'like': 5,
            'neutral': 2,
            'dislike': -3,
            'hate': -10
        }[reaction] || 0;

        if (affectionChange !== 0) {
            this.adjustAffection(npcId, affectionChange, `gift_${reaction}`);
        }

        console.log(`🎁 ${npcId} 收到礼物: ${giftId} (反应: ${reaction})`);
    }

    /**
     * 每日更新（处理关系衰减）
     */
    dailyUpdate() {
        const currentDay = window.gameState?.gameTime?.day || 1;

        for (const [npcId, relationship] of Object.entries(this.relationships)) {
            const daysSinceInteraction = currentDay - relationship.lastInteractionDay;

            // 如果超过指定天数没有互动，关系开始衰减
            if (daysSinceInteraction > this.maxDaysWithoutInteraction) {
                const decayAmount = -this.decayRate;

                // 恋人关系衰减更慢
                const actualDecay = relationship.stage === 'lover' ? decayAmount * 0.5 : decayAmount;

                if (relationship.affection > 20) { // 不会衰减到20以下
                    this.adjustAffection(npcId, actualDecay, 'daily_decay');
                }
            }
        }
    }

    /**
     * 记录事件
     */
    logEvent(npcId, eventType, data) {
        const relationship = this.getRelationship(npcId);

        relationship.events.push({
            type: eventType,
            data,
            day: window.gameState?.gameTime?.day || 1,
            timestamp: Date.now()
        });

        // 只保留最近50个事件
        if (relationship.events.length > 50) {
            relationship.events = relationship.events.slice(-50);
        }
    }

    /**
     * 获取关系摘要
     */
    getRelationshipSummary(npcId) {
        const relationship = this.getRelationship(npcId);

        return {
            npcId,
            stage: relationship.stage,
            affection: relationship.affection,
            trust: relationship.trust,
            isLover: relationship.flags.isLover || false,
            totalInteractions: relationship.totalInteractions,
            daysSinceInteraction: (window.gameState?.gameTime?.day || 1) - relationship.lastInteractionDay
        };
    }

    /**
     * 获取所有NPC关系摘要
     */
    getAllRelationshipSummaries() {
        const summaries = {};

        for (const npcId of Object.keys(this.relationships)) {
            summaries[npcId] = this.getRelationshipSummary(npcId);
        }

        return summaries;
    }

    /**
     * 检查是否可以触发特定关系事件
     */
    canTriggerEvent(npcId, eventType) {
        const relationship = this.getRelationship(npcId);

        switch (eventType) {
            case 'confession':
                return relationship.affection >= 75 &&
                       relationship.trust >= 50 &&
                       !relationship.flags.hasConfessed;

            case 'first_date':
                return relationship.stage === 'friend' ||
                       relationship.stage === 'close';

            case 'proposal':
                return relationship.stage === 'lover' &&
                       relationship.totalInteractions >= 50;

            default:
                return false;
        }
    }

    /**
     * 保存关系数据
     */
    save() {
        return {
            relationships: this.relationships,
            decayRate: this.decayRate,
            maxDaysWithoutInteraction: this.maxDaysWithoutInteraction
        };
    }

    /**
     * 加载关系数据
     */
    load(data) {
        if (data.relationships) {
            this.relationships = data.relationships;
        }
        if (data.decayRate !== undefined) {
            this.decayRate = data.decayRate;
        }
        if (data.maxDaysWithoutInteraction !== undefined) {
            this.maxDaysWithoutInteraction = data.maxDaysWithoutInteraction;
        }

        console.log('💕 关系数据已恢复:', Object.keys(this.relationships));
    }

    /**
     * 重置所有关系
     */
    reset() {
        this.relationships = {};
        console.log('🔄 所有关系已重置');
    }
}

// 创建全局实例
window.relationships = new RelationshipSystem();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RelationshipSystem;
}

console.log('💕 NPC关系系统已加载');