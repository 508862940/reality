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

    // 从 localStorage 迁移存档数据
    async migrateFromLocalStorage() {
        try {
            console.log('🔄 开始迁移 localStorage 数据到 IndexedDB...');
            let migratedCount = 0;

            // 遍历所有 localStorage 键
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                // 识别存档相关的键
                if (key && (
                    key.startsWith('auto_') ||
                    key.startsWith('quick_') ||
                    key.startsWith('manual_') ||
                    key.startsWith('quicksave_') ||
                    key === 'gameState'
                )) {
                    try {
                        const value = localStorage.getItem(key);
                        const data = JSON.parse(value);

                        // 迁移到 IndexedDB
                        if (key === 'gameState') {
                            // 迁移当前游戏状态
                            await this.saveGameState(data);
                            console.log('✅ 迁移游戏状态');
                        } else {
                            // 迁移存档
                            let saveData = data;

                            // 适配旧格式
                            if (!saveData.type) {
                                if (key.startsWith('auto')) saveData.type = 'auto';
                                else if (key.startsWith('quick')) saveData.type = 'quick';
                                else saveData.type = 'manual';
                            }

                            if (!saveData.id) {
                                saveData.id = key;
                            }

                            if (!saveData.timestamp) {
                                saveData.timestamp = Date.now();
                            }

                            await this.db.saveSlots.put(saveData);
                            console.log(`✅ 迁移存档: ${key}`);
                            migratedCount++;
                        }

                        // 迁移成功后删除 localStorage 中的数据
                        localStorage.removeItem(key);

                    } catch (error) {
                        console.error(`迁移 ${key} 失败:`, error);
                    }
                }
            }

            if (migratedCount > 0) {
                console.log(`✅ 成功迁移 ${migratedCount} 个存档到 IndexedDB`);
            }

            return migratedCount;
        } catch (error) {
            console.error('❌ 迁移失败:', error);
            return 0;
        }
    },

    // 请求持久化存储权限（iOS优化）
    async requestPersistence() {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persisted();

                if (isPersisted) {
                    console.log('✅ 存储已经是持久化的');
                    return true;
                }

                // 请求持久化权限
                const granted = await navigator.storage.persist();
                if (granted) {
                    console.log('✅ 存储持久化请求成功');

                    // iOS 特殊处理：提醒用户添加到主屏幕
                    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                        if (!window.matchMedia('(display-mode: standalone)').matches) {
                            console.log('💡 iOS设备：建议添加到主屏幕获得更好体验');
                        }
                    }

                    return true;
                } else {
                    console.warn('⚠️ 存储持久化请求被拒绝');
                    return false;
                }
            } catch (error) {
                console.error('请求持久化失败:', error);
                return false;
            }
        }
        return false;
    },

    // 导出单个存档
    async exportSave(saveId) {
        try {
            const save = await this.db.saveSlots.get(saveId);
            if (!save) {
                throw new Error('存档不存在');
            }

            const exportData = {
                version: '1.0',
                type: 'single_save',
                timestamp: Date.now(),
                save: save
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reality_save_${save.name || saveId}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log('✅ 存档导出成功:', saveId);
            return true;
        } catch (error) {
            console.error('导出存档失败:', error);
            return false;
        }
    },

    // 导出所有存档
    async exportAllSaves() {
        try {
            const saves = await this.db.saveSlots.toArray();

            const exportData = {
                version: '1.0',
                type: 'all_saves',
                timestamp: Date.now(),
                date: new Date().toLocaleString('zh-CN'),
                saves: saves,
                count: saves.length
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reality_all_saves_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`✅ 导出了 ${saves.length} 个存档`);
            return true;
        } catch (error) {
            console.error('导出所有存档失败:', error);
            return false;
        }
    },

    // 导入存档文件
    async importSaves(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            // 验证文件格式
            if (!importData.version || !importData.type) {
                throw new Error('无效的存档文件格式');
            }

            let importedCount = 0;

            if (importData.type === 'single_save' && importData.save) {
                // 导入单个存档
                await this.db.saveSlots.put(importData.save);
                importedCount = 1;
            } else if (importData.type === 'all_saves' && importData.saves) {
                // 导入多个存档
                for (const save of importData.saves) {
                    await this.db.saveSlots.put(save);
                    importedCount++;
                }
            } else {
                throw new Error('未识别的存档类型');
            }

            console.log(`✅ 成功导入 ${importedCount} 个存档`);
            alert(`成功导入 ${importedCount} 个存档！`);
            return importedCount;
        } catch (error) {
            console.error('导入存档失败:', error);
            alert('导入失败: ' + error.message);
            return 0;
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

    // 自动迁移 localStorage 数据（如果有）
    setTimeout(async () => {
        const migratedCount = await Database.migrateFromLocalStorage();
        if (migratedCount > 0) {
            console.log(`✅ 自动迁移了 ${migratedCount} 个存档`);
        }

        // 请求持久化存储权限
        await Database.requestPersistence();
    }, 1000);
} else {
    console.error('❌ Dexie.js未加载，请检查依赖');
}

// 导出到全局
window.Database = Database;