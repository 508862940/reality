/**
 * 统一的存档系统模块
 * 管理所有存档相关功能，确保menu和game-main页面存档互通
 */

class SaveSystem {
    constructor() {
        this.db = null;
        this.maxManualSlots = 10;  // 手动存档槽位数
        this.maxQuickSlots = 3;    // 快速存档槽位数

        // 自动存档设置
        this.autoSaveEnabled = true;
        this.autoSaveInterval = 5 * 60 * 1000; // 5分钟（作为参考值）
        this.autoSaveTimer = null;
        this.lastAutoSaveTime = 0;
        this.isAutoSaving = false;
        this.lastActivityTime = Date.now(); // 记录最后活动时间
        this.inCombat = false; // 是否在战斗中

        this.init();
    }

    // 初始化
    async init() {
        // 确保数据库已初始化
        if (window.Database && window.Database.db) {
            this.db = window.Database.db;
            console.log('💾 SaveSystem: 使用现有数据库连接');
        } else {
            console.error('❌ SaveSystem: 数据库未初始化');
        }

        // 加载自动存档设置
        this.loadAutoSaveSettings();

        // 如果在游戏页面，启动自动存档
        if (window.location.pathname.includes('game-main')) {
            this.startAutoSave();
        }
    }

    // ==================== 基础功能 ====================

    /**
     * 创建存档
     * @param {string} type - 存档类型 (manual/quick/auto)
     * @param {number} slot - 槽位号
     * @param {string} name - 存档名称
     * @param {object} gameData - 游戏数据
     */
    async createSave(type = 'manual', slot = null, name = null, gameData = null) {
        try {
            // 如果没有提供游戏数据，获取当前游戏状态
            if (!gameData) {
                gameData = this.getCurrentGameState();
            }

            // 自动分配槽位
            if (slot === null) {
                slot = await this.findAvailableSlot(type);
                if (slot === -1) {
                    throw new Error('没有可用的存档槽位');
                }
            }

            // 生成存档ID
            const saveId = `${type}_${slot}`;

            // 自动生成名称
            if (!name) {
                const now = new Date();
                name = `${type === 'manual' ? '手动存档' : type === 'quick' ? '快速存档' : '自动存档'} - ${now.toLocaleString('zh-CN')}`;
            }

            // 构建存档数据
            const saveData = {
                id: saveId,
                type: type,
                slot: slot,
                name: name,
                timestamp: Date.now(),
                gameData: gameData,
                metadata: {
                    version: '1.0.0',
                    chapter: gameData.chapter || 1,
                    location: gameData.character?.location || 'unknown',
                    playTime: this.calculatePlayTime()
                }
            };

            // 保存到数据库前检查数据
            console.log('💾 保存前的gameData.worldData包含:', {
                hasCurrentSceneData: !!gameData.worldData?.currentSceneData,
                worldDataKeys: gameData.worldData ? Object.keys(gameData.worldData) : [],
                sceneId: gameData.worldData?.currentSceneData?.scene?.id
            });

            await this.db.saveSlots.put(saveData);
            console.log(`✅ 存档创建成功: ${saveId}`);

            // 立即读取验证
            const verification = await this.db.saveSlots.get(saveId);
            console.log('🔍 保存后立即读取验证:', {
                hasWorldData: !!verification.gameData?.worldData,
                worldDataKeys: verification.gameData?.worldData ? Object.keys(verification.gameData.worldData) : [],
                hasCurrentSceneData: !!verification.gameData?.worldData?.currentSceneData,
                sceneId: verification.gameData?.worldData?.currentSceneData?.scene?.id
            });

            return saveData;

        } catch (error) {
            console.error('❌ 创建存档失败:', error);
            throw error;
        }
    }

    /**
     * 读取存档
     * @param {string} saveId - 存档ID
     */
    async loadSave(saveId) {
        try {
            const saveData = await this.db.saveSlots.get(saveId);

            if (!saveData) {
                throw new Error(`存档不存在: ${saveId}`);
            }

            console.log(`✅ 存档读取成功: ${saveId}`);
            return saveData;

        } catch (error) {
            console.error('❌ 读取存档失败:', error);
            throw error;
        }
    }

    /**
     * 删除存档
     * @param {string} saveId - 存档ID
     */
    async deleteSave(saveId) {
        try {
            await this.db.saveSlots.delete(saveId);
            console.log(`✅ 存档删除成功: ${saveId}`);
            return true;

        } catch (error) {
            console.error('❌ 删除存档失败:', error);
            throw error;
        }
    }

    /**
     * 获取存档列表
     * @param {string} type - 存档类型，不传则返回所有
     */
    async getSavesList(type = null) {
        try {
            let saves;

            if (type) {
                // 获取特定类型的存档
                saves = await this.db.saveSlots
                    .where('type')
                    .equals(type)
                    .toArray();
            } else {
                // 获取所有存档
                saves = await this.db.saveSlots.toArray();
            }

            // 按时间戳排序（最新的在前）
            saves.sort((a, b) => b.timestamp - a.timestamp);

            console.log(`✅ 获取存档列表成功: ${saves.length} 个存档`);
            return saves;

        } catch (error) {
            console.error('❌ 获取存档列表失败:', error);
            return [];
        }
    }

    // ==================== 快捷功能 ====================

    /**
     * 快速存档
     */
    async quickSave() {
        try {
            // 获取所有快速存档
            const quickSaves = await this.getSavesList('quick');

            let slot;
            if (quickSaves.length < this.maxQuickSlots) {
                // 还有空槽位，使用下一个
                slot = quickSaves.length;
            } else {
                // 槽位已满，覆盖最旧的
                const oldestSave = quickSaves[quickSaves.length - 1];
                slot = oldestSave.slot;
            }

            const saveData = await this.createSave('quick', slot);
            return saveData;

        } catch (error) {
            console.error('❌ 快速存档失败:', error);
            throw error;
        }
    }

    /**
     * 自动存档
     */
    async autoSave() {
        try {
            // 防止重复触发
            if (this.isAutoSaving) {
                console.log('⏳ 自动存档进行中，跳过本次请求');
                return null;
            }

            this.isAutoSaving = true;

            // 自动存档总是覆盖槽位0
            const saveData = await this.createSave('auto', 0, '自动存档');

            this.lastAutoSaveTime = Date.now();
            this.isAutoSaving = false;

            console.log('💾 自动存档成功');

            // 显示通知（如果存在）
            if (window.showNotification) {
                window.showNotification('自动存档完成', 'success');
            }

            return saveData;

        } catch (error) {
            this.isAutoSaving = false;
            console.error('❌ 自动存档失败:', error);
            throw error;
        }
    }

    /**
     * 启动自动存档（简化版 - 仅依赖游戏内时间）
     */
    startAutoSave() {
        if (!this.autoSaveEnabled) {
            console.log('⚠️ 自动存档已禁用');
            return;
        }

        // 清除旧的定时器
        this.stopAutoSave();

        // 简化版：不使用真实时间定时器
        // 完全依赖游戏内时间系统的每日5点存档
        console.log('⏰ 自动存档已启用（游戏内每天早上5点自动保存）');

        // 可选：保留一个备用定时器，但间隔很长（30分钟）
        // 仅作为保险，防止游戏时间系统出问题
        this.autoSaveTimer = setInterval(() => {
            // 超过30分钟没存档才触发（作为保险）
            const timeSinceLastSave = Date.now() - this.lastAutoSaveTime;
            if (timeSinceLastSave > 30 * 60 * 1000) {
                console.log('⚠️ 超过30分钟未存档，触发备用存档');
                this.triggerAutoSave('backup');
            }
        }, 10 * 60 * 1000); // 每10分钟检查一次
    }

    // 注释掉智能检查功能（保留代码以备将来使用）
    /*
    checkAutoSaveConditions() {
        // 如果正在战斗中，跳过
        if (this.inCombat || (window.combatSystem && window.combatSystem.inCombat)) {
            console.log('⚔️ 战斗中，暂不自动存档');
            return;
        }

        // 如果正在AI对话中，跳过
        if (window.aiDialogueManager && window.aiDialogueManager.isActive) {
            console.log('💬 对话中，暂不自动存档');
            return;
        }

        // 检查距离上次存档的时间
        const timeSinceLastSave = Date.now() - this.lastAutoSaveTime;
        const timeSinceLastActivity = Date.now() - this.lastActivityTime;

        // 条件1：超过5分钟没存档且最近有活动
        if (timeSinceLastSave > this.autoSaveInterval && timeSinceLastActivity < 60000) {
            this.triggerAutoSave('smart_timer');
            return;
        }

        // 条件2：超过10分钟没存档（强制存档）
        if (timeSinceLastSave > this.autoSaveInterval * 2) {
            this.triggerAutoSave('force_timer');
            return;
        }
    }

    updateActivityTime() {
        this.lastActivityTime = Date.now();
    }
    */

    /**
     * 停止自动存档定时器
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('⏸️ 自动存档定时器已停止');
        }
    }

    /**
     * 触发自动存档（带防抖）
     */
    triggerAutoSave(reason = 'manual') {
        // 检查是否启用
        if (!this.autoSaveEnabled) {
            return;
        }

        // 防抖：根据不同触发原因设置不同的间隔
        const timeSinceLastSave = Date.now() - this.lastAutoSaveTime;

        // 不同触发类型的最小间隔
        const minIntervals = {
            'scene_change': 500,         // 场景切换：0.5秒（减少到0.5秒，确保新场景能保存）
            'combat_victory': 30000,     // 战斗胜利：30秒
            'smart_timer': 0,            // 智能定时：无限制（已经过滤）
            'force_timer': 0,            // 强制定时：无限制
            'important': 0,              // 重要事件：无限制
            'daily_5am': 0,              // 每日5点：无限制
            'page_unload': 0,            // 页面卸载：无限制
            'manual': 15000              // 手动触发：15秒
        };

        const minInterval = minIntervals[reason] || 30000; // 默认30秒

        if (timeSinceLastSave < minInterval) {
            console.log(`⏱️ 距离上次自动存档太近，跳过（${Math.floor(timeSinceLastSave / 1000)}秒前，需要${minInterval/1000}秒间隔）`);
            return;
        }

        // 执行自动存档
        this.autoSave().then(() => {
            console.log(`💾 自动存档触发原因: ${reason}`);
        }).catch(error => {
            console.error('自动存档失败:', error);
        });
    }

    /**
     * 设置自动存档开关
     */
    setAutoSaveEnabled(enabled) {
        this.autoSaveEnabled = enabled;

        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }

        // 保存设置
        if (window.localStorage) {
            localStorage.setItem('autoSaveEnabled', enabled ? 'true' : 'false');
        }
    }

    /**
     * 设置自动存档间隔
     */
    setAutoSaveInterval(minutes) {
        this.autoSaveInterval = minutes * 60 * 1000;

        // 重启定时器
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }

        // 保存设置
        if (window.localStorage) {
            localStorage.setItem('autoSaveInterval', minutes.toString());
        }
    }

    /**
     * 加载自动存档设置
     */
    loadAutoSaveSettings() {
        if (window.localStorage) {
            // 加载开关状态
            const enabled = localStorage.getItem('autoSaveEnabled');
            if (enabled !== null) {
                this.autoSaveEnabled = enabled === 'true';
            }

            // 加载间隔时间
            const interval = localStorage.getItem('autoSaveInterval');
            if (interval) {
                this.autoSaveInterval = parseInt(interval) * 60 * 1000;
            }
        }
    }

    // ==================== 工具功能 ====================

    /**
     * 查找可用的存档槽位
     * @param {string} type - 存档类型
     */
    async findAvailableSlot(type) {
        const saves = await this.getSavesList(type);
        const usedSlots = saves.map(s => s.slot);

        let maxSlots = type === 'manual' ? this.maxManualSlots :
                       type === 'quick' ? this.maxQuickSlots : 1;

        for (let i = 0; i < maxSlots; i++) {
            if (!usedSlots.includes(i)) {
                return i;
            }
        }

        return -1; // 没有可用槽位
    }

    /**
     * 获取当前游戏状态
     */
    getCurrentGameState() {
        const gameData = {};

        // 优先使用统一的世界状态
        if (window.worldState) {
            // 获取完整的世界快照
            const worldSnapshot = window.worldState.getFullState();

            console.log('🔍 getCurrentGameState - worldSnapshot原始数据:', {
                hasCurrentSceneData: !!worldSnapshot.currentSceneData,
                worldSnapshotKeys: Object.keys(worldSnapshot),
                sceneId: worldSnapshot.currentSceneData?.scene?.id
            });

            // ⚠️ 深拷贝避免引用问题！
            gameData.worldData = JSON.parse(JSON.stringify(worldSnapshot));

            console.log('💾 存档worldData包含:', {
                hasCurrentSceneData: !!worldSnapshot.currentSceneData,
                hasF1Content: !!worldSnapshot.f1Content,
                sceneId: worldSnapshot.currentSceneData?.scene?.id
            });

            console.log('🔍 赋值后的gameData.worldData:', {
                hasCurrentSceneData: !!gameData.worldData.currentSceneData,
                gameDataWorldKeys: Object.keys(gameData.worldData),
                sceneId: gameData.worldData.currentSceneData?.scene?.id
            });

            // 保持向后兼容（提取关键数据到顶层）
            gameData.character = {
                name: worldSnapshot.player.name,
                health: worldSnapshot.player.stats.health,
                mood: worldSnapshot.player.stats.mood,
                money: worldSnapshot.player.stats.money,
                energy: worldSnapshot.player.stats.energy,
                spirit: worldSnapshot.player.stats.spirit,
                location: worldSnapshot.player.position.location,
                // 保存外观数据！
                appearance: worldSnapshot.player.appearance,
                appearanceData: worldSnapshot.player.appearance  // 保持兼容性
            };

            gameData.gameTime = worldSnapshot.time;
            gameData.currentSceneId = worldSnapshot.story.currentSceneId;
            gameData.sceneHistory = worldSnapshot.story.sceneHistory || [];

            console.log('📸 使用统一世界状态创建存档');

            // 🔒 防止被其他数据覆盖，直接返回！
            console.log('🔒 跳过其他数据源，防止覆盖worldData');
        }
        // 后备方案：使用旧的gameState（仅当worldState不存在时）
        else if (window.gameState) {
            console.log('📦 使用window.gameState作为后备数据源');
            Object.assign(gameData, window.gameState);
        } else if (typeof gameState !== 'undefined') {
            console.log('📦 使用全局gameState作为后备数据源');
            Object.assign(gameData, gameState);
        } else {
            // 使用默认值
            console.warn('⚠️ 无法获取当前游戏状态，使用默认值');
            Object.assign(gameData, {
                character: {
                    name: '未知',
                    health: 100,
                    mood: 50,
                    money: 100,
                    location: 'unknown'
                },
                gameTime: {
                    day: 1,
                    hour: 8,
                    minute: 0
                }
            });
        }

        // 添加剧情标记数据
        if (window.storyFlags) {
            gameData.storyData = window.storyFlags.save();
        }

        // 添加关系数据（如果系统存在）
        if (window.relationships) {
            gameData.relationshipData = window.relationships.save();
        }

        // 场景数据已经包含在gameState中，不需要重复保存
        // gameState.currentSceneId 和 gameState.sceneHistory 已经是世界快照的一部分

        // 添加世界系统数据（仅当worldState不存在时）
        if (!window.worldState) {
            const worldData = {};
            if (window.weatherSystem) {
                worldData.weather = window.weatherSystem.save();
            }
            if (window.economySystem) {
                worldData.economy = window.economySystem.save();
            }
            if (window.farmingSystem) {
                worldData.farming = window.farmingSystem.save();
            }
            if (Object.keys(worldData).length > 0) {
                gameData.worldData = worldData;
            }
            console.log('📦 添加了独立的世界系统数据（无worldState）');
        } else {
            console.log('🔒 跳过独立世界系统数据（已有worldState完整数据）');
        }

        // 添加战斗状态（如果存在）
        if (window.combatSystem) {
            gameData.combatData = window.combatSystem.save();
        }

        return gameData;
    }

    /**
     * 计算游戏时长
     */
    calculatePlayTime() {
        // TODO: 实现游戏时长统计
        return 0;
    }

    /**
     * 验证存档数据
     */
    validateSaveData(data) {
        if (!data) return false;
        if (!data.id || !data.type || !data.gameData) return false;
        return true;
    }

    /**
     * 获取存档信息（不包含完整游戏数据）
     */
    async getSaveInfo(saveId) {
        try {
            const save = await this.loadSave(saveId);
            if (!save) return null;

            // 只返回基本信息
            return {
                id: save.id,
                type: save.type,
                slot: save.slot,
                name: save.name,
                timestamp: save.timestamp,
                metadata: save.metadata
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * 重命名存档
     */
    async renameSave(saveId, newName) {
        try {
            const save = await this.loadSave(saveId);
            if (!save) {
                throw new Error('存档不存在');
            }

            save.name = newName;
            await this.db.saveSlots.put(save);

            console.log(`✅ 存档重命名成功: ${saveId}`);
            return true;

        } catch (error) {
            console.error('❌ 重命名存档失败:', error);
            throw error;
        }
    }

    /**
     * 导出存档为JSON
     */
    async exportSave(saveId) {
        try {
            const save = await this.loadSave(saveId);
            if (!save) {
                throw new Error('存档不存在');
            }

            const json = JSON.stringify(save, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // 创建下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reality_Save_${save.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
            a.click();

            URL.revokeObjectURL(url);
            console.log(`✅ 存档导出成功: ${saveId}`);

        } catch (error) {
            console.error('❌ 导出存档失败:', error);
            throw error;
        }
    }

    /**
     * 从文件导入存档
     */
    async importSave(file) {
        try {
            const text = await file.text();
            const saveData = JSON.parse(text);

            // 验证存档数据
            if (!this.validateSaveData(saveData)) {
                throw new Error('无效的存档文件');
            }

            // 检查是否存在相同ID的存档
            const existingSave = await this.getSaveInfo(saveData.id);
            if (existingSave) {
                if (!confirm(`存档 "${existingSave.name}" 已存在，是否覆盖？`)) {
                    return null;
                }
            }

            // 保存到数据库
            await this.db.saveSlots.put(saveData);
            console.log(`✅ 存档导入成功: ${saveData.id}`);

            return saveData;

        } catch (error) {
            console.error('❌ 导入存档失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
window.saveSystem = new SaveSystem();
console.log('💾 SaveSystem 模块已加载');