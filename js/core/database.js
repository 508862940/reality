// 数据库模块 - 使用IndexedDB持久化存储
const Database = {
    db: null,

    // 初始化数据库
    init() {
        this.db = new Dexie('realityGameDB');

        // 版本1：初始结构
        this.db.version(1).stores({
            gameState: '&id',           // 游戏状态
            apiConfig: '&id',           // API配置
            characterData: '&id',       // 角色数据
            saveSlots: '&id, timestamp' // 存档槽位
        });

        // 版本2：改进的存档表结构
        this.db.version(2).stores({
            gameState: '&id',           // 游戏状态（当前进度）
            apiConfig: '&id',           // API配置
            characterData: '&id',       // 角色数据
            saveSlots: '&id, type, slot, timestamp' // 存档槽位（增加type和slot索引）
        });

        return this.db;
    },

    // 保存API配置
    async saveAPIConfig(config) {
        try {
            await this.db.apiConfig.put({
                id: 'main',
                presets: config.presets || [],
                activePresetId: config.activePresetId || null,
                lastModified: Date.now()
            });
            console.log('✅ API配置已保存到IndexedDB');
            return true;
        } catch (error) {
            console.error('保存API配置失败:', error);
            return false;
        }
    },

    // 加载API配置
    async loadAPIConfig() {
        try {
            const config = await this.db.apiConfig.get('main');
            if (config) {
                console.log('📥 从IndexedDB加载API配置');
                return {
                    presets: config.presets || [],
                    activePresetId: config.activePresetId
                };
            }

            // 尝试从localStorage迁移旧配置
            const oldConfig = this.migrateOldAPIConfig();
            if (oldConfig) {
                await this.saveAPIConfig(oldConfig);
                return oldConfig;
            }

            // 返回默认配置
            return this.getDefaultAPIConfig();
        } catch (error) {
            console.error('加载API配置失败:', error);
            return this.getDefaultAPIConfig();
        }
    },

    // 迁移旧的API配置
    migrateOldAPIConfig() {
        try {
            // 尝试从多个可能的位置迁移配置
            const possibleKeys = ['game_api_configs', 'ai_config', 'apiConfig'];

            for (const key of possibleKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    console.log(`🔄 从localStorage迁移配置: ${key}`);

                    // 转换为统一格式
                    if (Array.isArray(parsed)) {
                        // 旧版多配置格式
                        return {
                            presets: parsed.map((cfg, idx) => ({
                                id: `preset_${Date.now()}_${idx}`,
                                name: cfg.name || `配置${idx + 1}`,
                                provider: cfg.service || cfg.provider || 'openai',
                                endpoint: cfg.baseURL || cfg.endpoint || '',
                                apiKey: cfg.apiKey || '',
                                model: cfg.model || 'gpt-3.5-turbo'
                            })),
                            activePresetId: `preset_${Date.now()}_0`
                        };
                    } else if (parsed.apiKey) {
                        // 单配置格式
                        const presetId = `preset_${Date.now()}`;
                        return {
                            presets: [{
                                id: presetId,
                                name: '迁移的配置',
                                provider: parsed.provider || 'openai',
                                endpoint: parsed.baseUrl || parsed.baseURL || parsed.endpoint || '',
                                apiKey: parsed.apiKey,
                                model: parsed.model || 'gpt-3.5-turbo'
                            }],
                            activePresetId: presetId
                        };
                    }

                    // 迁移成功后删除旧数据
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('迁移旧配置失败:', error);
        }
        return null;
    },

    // 获取默认API配置
    getDefaultAPIConfig() {
        const defaultId = `preset_${Date.now()}`;
        return {
            presets: [
                {
                    id: defaultId,
                    name: '默认配置',
                    provider: 'openai',
                    endpoint: 'https://api.openai.com/v1/chat/completions',
                    apiKey: '',
                    model: 'gpt-3.5-turbo'
                },
                {
                    id: `preset_claude_${Date.now()}`,
                    name: 'Claude配置',
                    provider: 'claude',
                    endpoint: 'https://api.anthropic.com/v1/messages',
                    apiKey: '',
                    model: 'claude-3-sonnet-20240229'
                },
                {
                    id: `preset_gemini_${Date.now()}`,
                    name: 'Gemini配置',
                    provider: 'gemini',
                    endpoint: '',
                    apiKey: '',
                    model: 'gemini-1.5-flash-latest'
                }
            ],
            activePresetId: defaultId
        };
    },

    // 保存游戏状态
    async saveGameState(state) {
        try {
            await this.db.gameState.put({
                id: 'main',
                ...state,
                lastSaved: Date.now()
            });
            console.log('💾 游戏状态已保存');
            return true;
        } catch (error) {
            console.error('保存游戏状态失败:', error);
            return false;
        }
    },

    // 加载游戏状态
    async loadGameState() {
        try {
            const state = await this.db.gameState.get('main');
            if (state) {
                console.log('📥 加载游戏状态');
                return state;
            }
            return null;
        } catch (error) {
            console.error('加载游戏状态失败:', error);
            return null;
        }
    },

    // 导出所有数据
    async exportAllData() {
        try {
            const [gameState, apiConfig, characterData] = await Promise.all([
                this.db.gameState.get('main'),
                this.db.apiConfig.get('main'),
                this.db.characterData.toArray()
            ]);

            const exportData = {
                version: '1.0',
                timestamp: Date.now(),
                date: new Date().toLocaleString('zh-CN'),
                data: {
                    gameState,
                    apiConfig,
                    characterData
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reality_game_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log('✅ 数据导出成功');
            return true;
        } catch (error) {
            console.error('导出数据失败:', error);
            alert('导出失败: ' + error.message);
            return false;
        }
    },

    // 导入数据
    async importData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.data) {
                throw new Error('无效的备份文件格式');
            }

            // 导入前备份当前数据
            console.log('📦 备份当前数据...');
            await this.createBackup();

            // 导入数据
            await this.db.transaction('rw', this.db.tables, async () => {
                if (importData.data.gameState) {
                    await this.db.gameState.put(importData.data.gameState);
                }
                if (importData.data.apiConfig) {
                    await this.db.apiConfig.put(importData.data.apiConfig);
                }
                if (importData.data.characterData) {
                    await this.db.characterData.bulkPut(importData.data.characterData);
                }
            });

            console.log('✅ 数据导入成功');
            alert('数据导入成功！页面将刷新以应用新数据。');
            location.reload();
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            alert('导入失败: ' + error.message);
            return false;
        }
    },

    // 创建备份
    async createBackup() {
        try {
            const slot = {
                id: `backup_${Date.now()}`,
                timestamp: Date.now(),
                gameState: await this.db.gameState.get('main'),
                apiConfig: await this.db.apiConfig.get('main'),
                characterData: await this.db.characterData.toArray()
            };

            await this.db.saveSlots.put(slot);

            // 只保留最近5个备份
            const allSlots = await this.db.saveSlots.orderBy('timestamp').reverse().toArray();
            if (allSlots.length > 5) {
                const toDelete = allSlots.slice(5);
                for (const slot of toDelete) {
                    await this.db.saveSlots.delete(slot.id);
                }
            }

            console.log('📦 自动备份已创建');
            return true;
        } catch (error) {
            console.error('创建备份失败:', error);
            return false;
        }
    },

    // 清理所有数据
    async clearAllData() {
        if (!confirm('确定要清除所有数据吗？这将无法恢复！')) {
            return false;
        }

        try {
            await this.db.delete();
            localStorage.clear();
            sessionStorage.clear();

            // 清理Service Worker缓存
            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(name => caches.delete(name)));
            }

            alert('所有数据已清除，页面将刷新。');
            location.reload();
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            return false;
        }
    }
};

// 初始化数据库
if (typeof Dexie !== 'undefined') {
    Database.init();
    console.log('🗄️ IndexedDB数据库已初始化');
} else {
    console.error('❌ Dexie.js未加载，请检查依赖');
}

// 导出到全局
window.Database = Database;