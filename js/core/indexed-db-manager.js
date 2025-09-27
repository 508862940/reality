/**
 * IndexedDB 数据库管理器
 * 负责所有 IndexedDB 操作的封装
 * 解决 iOS localStorage 7天清理问题
 */

class IndexedDBManager {
    constructor() {
        this.dbName = 'RealityGameDB';
        this.version = 1;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * 初始化数据库
     */
    async init() {
        if (this.isInitialized) {
            console.log('📦 IndexedDB 已经初始化');
            return this.db;
        }

        try {
            // 检查浏览器支持
            if (!window.indexedDB) {
                throw new Error('浏览器不支持 IndexedDB');
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);

                // 数据库升级/创建
                request.onupgradeneeded = (event) => {
                    console.log('🔧 创建/升级 IndexedDB 数据库...');
                    const db = event.target.result;

                    // 创建存档表
                    if (!db.objectStoreNames.contains('saves')) {
                        const savesStore = db.createObjectStore('saves', {
                            keyPath: 'id',
                            autoIncrement: true
                        });

                        // 创建索引
                        savesStore.createIndex('type', 'type', { unique: false });
                        savesStore.createIndex('timestamp', 'timestamp', { unique: false });
                        savesStore.createIndex('slot', ['type', 'slot'], { unique: false });
                        savesStore.createIndex('typeSlot', ['type', 'slot'], { unique: true });

                        console.log('✅ 创建 saves 表');
                    }

                    // 创建游戏状态表
                    if (!db.objectStoreNames.contains('gameState')) {
                        db.createObjectStore('gameState', { keyPath: 'id' });
                        console.log('✅ 创建 gameState 表');
                    }

                    // 创建设置表
                    if (!db.objectStoreNames.contains('settings')) {
                        db.createObjectStore('settings', { keyPath: 'key' });
                        console.log('✅ 创建 settings 表');
                    }

                    // 创建API配置表
                    if (!db.objectStoreNames.contains('apiConfig')) {
                        db.createObjectStore('apiConfig', { keyPath: 'service' });
                        console.log('✅ 创建 apiConfig 表');
                    }

                    // 创建迁移日志表
                    if (!db.objectStoreNames.contains('migrationLog')) {
                        db.createObjectStore('migrationLog', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        console.log('✅ 创建 migrationLog 表');
                    }
                };

                // 成功打开数据库
                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.isInitialized = true;
                    console.log('✅ IndexedDB 初始化成功');

                    // 设置错误处理
                    this.db.onerror = (event) => {
                        console.error('❌ IndexedDB 错误:', event.target.error);
                    };

                    resolve(this.db);
                };

                // 打开失败
                request.onerror = (event) => {
                    console.error('❌ 打开 IndexedDB 失败:', event.target.error);
                    reject(event.target.error);
                };

                // 阻塞（版本冲突）
                request.onblocked = (event) => {
                    console.warn('⚠️ IndexedDB 被阻塞，请关闭其他标签页');
                    reject(new Error('数据库被阻塞'));
                };
            });
        } catch (error) {
            console.error('❌ IndexedDB 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 确保数据库已连接
     */
    async ensureConnection() {
        if (!this.db || !this.isInitialized) {
            await this.init();
        }
        return this.db;
    }

    /**
     * 保存存档
     */
    async saveSave(saveData) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['saves'], 'readwrite');
            const store = transaction.objectStore('saves');

            // 如果有 type 和 slot，先检查是否存在
            if (saveData.type && saveData.slot !== undefined) {
                const index = store.index('typeSlot');
                const request = index.get([saveData.type, saveData.slot]);

                request.onsuccess = (event) => {
                    const existingSave = event.target.result;

                    if (existingSave) {
                        // 更新现有存档，保留ID
                        saveData.id = existingSave.id;
                        const updateRequest = store.put(saveData);

                        updateRequest.onsuccess = () => {
                            console.log('✅ 更新存档:', saveData.id);
                            resolve(saveData);
                        };

                        updateRequest.onerror = (event) => {
                            console.error('❌ 更新存档失败:', event.target.error);
                            reject(event.target.error);
                        };
                    } else {
                        // 创建新存档
                        const addRequest = store.add(saveData);

                        addRequest.onsuccess = (event) => {
                            saveData.id = event.target.result;
                            console.log('✅ 创建新存档:', saveData.id);
                            resolve(saveData);
                        };

                        addRequest.onerror = (event) => {
                            console.error('❌ 创建存档失败:', event.target.error);
                            reject(event.target.error);
                        };
                    }
                };

                request.onerror = (event) => {
                    console.error('❌ 查询存档失败:', event.target.error);
                    reject(event.target.error);
                };
            } else {
                // 没有指定槽位，直接添加
                const request = store.add(saveData);

                request.onsuccess = (event) => {
                    saveData.id = event.target.result;
                    console.log('✅ 创建存档:', saveData.id);
                    resolve(saveData);
                };

                request.onerror = (event) => {
                    console.error('❌ 保存存档失败:', event.target.error);
                    reject(event.target.error);
                };
            }
        });
    }

    /**
     * 读取存档
     */
    async loadSave(saveId) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['saves'], 'readonly');
            const store = transaction.objectStore('saves');
            const request = store.get(saveId);

            request.onsuccess = (event) => {
                const save = event.target.result;
                if (save) {
                    console.log('✅ 读取存档:', saveId);
                    resolve(save);
                } else {
                    console.warn('⚠️ 存档不存在:', saveId);
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                console.error('❌ 读取存档失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 获取存档列表
     */
    async getSavesList(type = null) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['saves'], 'readonly');
            const store = transaction.objectStore('saves');

            let request;
            if (type) {
                // 按类型查询
                const index = store.index('type');
                request = index.getAll(type);
            } else {
                // 获取所有
                request = store.getAll();
            }

            request.onsuccess = (event) => {
                const saves = event.target.result;
                console.log(`✅ 获取存档列表 (${type || '全部'}):`, saves.length, '个');
                resolve(saves);
            };

            request.onerror = (event) => {
                console.error('❌ 获取存档列表失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 删除存档
     */
    async deleteSave(saveId) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['saves'], 'readwrite');
            const store = transaction.objectStore('saves');
            const request = store.delete(saveId);

            request.onsuccess = () => {
                console.log('✅ 删除存档:', saveId);
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('❌ 删除存档失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 保存游戏状态
     */
    async saveGameState(state) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['gameState'], 'readwrite');
            const store = transaction.objectStore('gameState');

            // 使用固定ID 'current'
            state.id = 'current';
            state.timestamp = Date.now();

            const request = store.put(state);

            request.onsuccess = () => {
                console.log('✅ 保存游戏状态');
                resolve(state);
            };

            request.onerror = (event) => {
                console.error('❌ 保存游戏状态失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 读取游戏状态
     */
    async loadGameState() {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['gameState'], 'readonly');
            const store = transaction.objectStore('gameState');
            const request = store.get('current');

            request.onsuccess = (event) => {
                const state = event.target.result;
                if (state) {
                    console.log('✅ 读取游戏状态');
                    resolve(state);
                } else {
                    console.log('ℹ️ 没有保存的游戏状态');
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                console.error('❌ 读取游戏状态失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 保存设置
     */
    async saveSetting(key, value) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');

            const data = {
                key: key,
                value: value,
                timestamp: Date.now()
            };

            const request = store.put(data);

            request.onsuccess = () => {
                console.log('✅ 保存设置:', key);
                resolve(data);
            };

            request.onerror = (event) => {
                console.error('❌ 保存设置失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 读取设置
     */
    async loadSetting(key) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = (event) => {
                const setting = event.target.result;
                resolve(setting ? setting.value : null);
            };

            request.onerror = (event) => {
                console.error('❌ 读取设置失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 清空指定表
     */
    async clearStore(storeName) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log(`✅ 清空 ${storeName} 表`);
                resolve(true);
            };

            request.onerror = (event) => {
                console.error(`❌ 清空 ${storeName} 表失败:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 获取存储使用情况
     */
    async getStorageInfo() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                const used = estimate.usage || 0;
                const quota = estimate.quota || 0;
                const percent = quota > 0 ? (used / quota * 100).toFixed(2) : 0;

                return {
                    used: this.formatBytes(used),
                    quota: this.formatBytes(quota),
                    percent: parseFloat(percent),
                    raw: { used, quota }
                };
            }
            return null;
        } catch (error) {
            console.error('获取存储信息失败:', error);
            return null;
        }
    }

    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 请求持久化存储（iOS优化）
     */
    async requestPersistence() {
        if (navigator.storage && navigator.storage.persist) {
            try {
                const isPersisted = await navigator.storage.persisted();

                if (isPersisted) {
                    console.log('✅ 存储已经是持久化的');
                    return true;
                }

                const granted = await navigator.storage.persist();
                if (granted) {
                    console.log('✅ 存储持久化请求成功');
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
    }

    /**
     * 记录迁移日志
     */
    async logMigration(action, details) {
        const db = await this.ensureConnection();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['migrationLog'], 'readwrite');
            const store = transaction.objectStore('migrationLog');

            const logEntry = {
                action: action,
                details: details,
                timestamp: Date.now(),
                success: true
            };

            const request = store.add(logEntry);

            request.onsuccess = () => {
                console.log('📝 记录迁移日志:', action);
                resolve(logEntry);
            };

            request.onerror = (event) => {
                console.error('❌ 记录迁移日志失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

// 创建全局实例
window.indexedDBManager = new IndexedDBManager();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexedDBManager;
}