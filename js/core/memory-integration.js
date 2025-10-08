/**
 * ========================================
 * 🧠 记忆系统集成模块 v1.0
 * ========================================
 *
 * 职责：
 * - 连接 MemorySystem 和其他游戏系统
 * - 自动同步记忆到 WorldState
 * - 处理存档恢复
 * - 提供统一的记忆API
 *
 * Phase 1 - 基础记忆存储
 */

class MemoryIntegration {
    /**
     * 记录玩家选择到NPC记忆
     * @param {Object} choice - 选择对象
     * @param {string} sceneId - 场景ID
     * @param {string} npcId - NPC ID（默认 'Zero'）
     */
    static recordPlayerChoice(choice, sceneId, npcId = 'Zero') {
        // 检查NPC是否存在
        const npc = window[npcId.toLowerCase()];
        if (!npc || !npc.memory) {
            console.warn(`⚠️ NPC ${npcId} 或其记忆系统不存在`);
            return;
        }

        // 构建记忆对象
        const memory = {
            type: choice.memoryType || 'player_choice',
            content: choice.text || choice.content || '玩家做出了选择',
            tags: choice.memoryTags || [],
            emotionImpact: choice.emotionImpact || {},
            scene: sceneId,
            importance: choice.memoryImportance
        };

        // 添加到NPC记忆
        const context = {
            sceneId: sceneId,
            location: window.worldState?.state?.character?.location,
            gameTime: window.worldState?.state?.time
        };

        npc.memory.addWithContext(memory, context);

        // 同步到 WorldState
        this.syncToWorldState(npcId);

        // 通知响应式系统
        if (window.reactiveSystem) {
            window.reactiveSystem.notify(`npc.${npcId}.memory`, memory);
        }

        console.log(`✅ 已记录玩家选择到 ${npcId} 的记忆`);
    }

    /**
     * 记录游戏事件到NPC记忆
     * @param {string} npcId - NPC ID
     * @param {Object} event - 事件对象 {type, content, tags, emotionImpact}
     */
    static recordEvent(npcId, event) {
        const npc = window[npcId.toLowerCase()];
        if (!npc || !npc.memory) {
            console.warn(`⚠️ NPC ${npcId} 或其记忆系统不存在`);
            return;
        }

        const context = {
            location: window.worldState?.state?.character?.location,
            gameTime: window.worldState?.state?.time
        };

        npc.memory.addWithContext(event, context);
        this.syncToWorldState(npcId);

        console.log(`✅ 已记录事件 [${event.type}] 到 ${npcId} 的记忆`);
    }

    /**
     * 同步NPC记忆到 WorldState
     * @param {string} npcId - NPC ID
     */
    static syncToWorldState(npcId = 'Zero') {
        if (!window.worldState || !window.worldState.state) {
            console.warn('⚠️ WorldState 不存在，跳过同步');
            return;
        }

        const npc = window[npcId.toLowerCase()];
        if (!npc || !npc.memory) {
            return;
        }

        // 确保 npcs 节点存在
        if (!window.worldState.state.npcs) {
            window.worldState.state.npcs = {};
        }

        if (!window.worldState.state.npcs[npcId]) {
            window.worldState.state.npcs[npcId] = {};
        }

        // 导出记忆数据
        window.worldState.state.npcs[npcId].memory = npc.memory.exportMemories();

        console.log(`💾 已同步 ${npcId} 的记忆到 WorldState`);
    }

    /**
     * 从存档恢复NPC记忆
     * @param {Object} saveData - 存档数据
     * @param {string} npcId - NPC ID
     */
    static restoreFromSave(saveData, npcId = 'Zero') {
        const npc = window[npcId.toLowerCase()];
        if (!npc || !npc.memory) {
            console.warn(`⚠️ NPC ${npcId} 或其记忆系统不存在`);
            return;
        }

        // 检查存档中是否有记忆数据
        const memoryData = saveData?.npcs?.[npcId]?.memory;
        if (!memoryData) {
            console.log(`ℹ️ 存档中没有 ${npcId} 的记忆数据`);
            return;
        }

        // 恢复记忆
        npc.memory.importMemories(memoryData);

        console.log(`✅ 已从存档恢复 ${npcId} 的记忆`);
    }

    /**
     * 恢复所有NPC的记忆
     * @param {Object} saveData - 存档数据
     */
    static restoreAllNPCMemories(saveData) {
        if (!saveData || !saveData.npcs) {
            console.log('ℹ️ 存档中没有NPC数据');
            return;
        }

        // 遍历所有NPC
        for (const npcId of Object.keys(saveData.npcs)) {
            this.restoreFromSave(saveData, npcId);
        }

        console.log('✅ 所有NPC记忆恢复完成');
    }

    /**
     * 获取NPC的记忆摘要（用于调试/UI显示）
     * @param {string} npcId - NPC ID
     * @returns {Object} - 记忆摘要
     */
    static getMemorySummary(npcId = 'Zero') {
        const npc = window[npcId.toLowerCase()];
        if (!npc || !npc.memory) {
            return null;
        }

        return {
            npcId: npcId,
            shortTermCount: npc.memory.shortTerm.length,
            longTermCount: npc.memory.longTerm.length,
            eventCounts: npc.memory.eventCounts,
            recentMemories: npc.memory.shortTerm.slice(-5).map(m => ({
                type: m.type,
                content: m.content,
                gameDay: m.gameDay
            }))
        };
    }

    /**
     * 清理旧记忆（每游戏天调用一次）
     * @param {string} npcId - NPC ID
     */
    static dailyMemoryCleanup(npcId = 'Zero') {
        const npc = window[npcId.toLowerCase()];
        if (!npc || !npc.memory) {
            return;
        }

        // 调用原有的清理方法
        npc.memory.clearShortTerm();

        // 同步到 WorldState
        this.syncToWorldState(npcId);

        console.log(`🌅 ${npcId} 的每日记忆清理完成`);
    }
}

// ============================================
// 🎵 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.MemoryIntegration = MemoryIntegration;
}

// Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MemoryIntegration };
}

console.log("✅ 记忆系统集成模块 v1.0 加载完成！");
