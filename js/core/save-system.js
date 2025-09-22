/**
 * 统一的存档系统模块
 * 管理所有存档相关功能，确保menu和game-main页面存档互通
 */

class SaveSystem {
    constructor() {
        this.db = null;
        this.maxManualSlots = 10;  // 手动存档槽位数
        this.maxQuickSlots = 3;    // 快速存档槽位数
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

            // 保存到数据库
            await this.db.saveSlots.put(saveData);
            console.log(`✅ 存档创建成功: ${saveId}`);

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
            // 自动存档总是覆盖槽位0
            const saveData = await this.createSave('auto', 0, '自动存档');
            return saveData;

        } catch (error) {
            console.error('❌ 自动存档失败:', error);
            throw error;
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
        // 优先使用全局的gameState
        if (window.gameState) {
            return window.gameState;
        }

        // 尝试从页面特定的变量获取
        if (typeof gameState !== 'undefined') {
            return gameState;
        }

        // 返回默认状态
        console.warn('⚠️ 无法获取当前游戏状态，使用默认值');
        return {
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
        };
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