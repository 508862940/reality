// Reality App - 数据桥接
// 连接新旧系统的数据，确保兼容性

const DataBridge = {
    // 角色数据（来自角色创建页面）
    characterCreationData: null,

    // 游戏数据引用
    gameDataRef: null,

    // 初始化数据桥接
    init() {
        console.log('🌉 初始化数据桥接...');

        // 连接到原有的游戏数据
        if (typeof gameData !== 'undefined') {
            this.gameDataRef = gameData;
            console.log('✅ 已连接到游戏数据');
        } else {
            console.warn('⚠️ 游戏数据未找到，创建新实例');
            this.createDefaultGameData();
        }

        // 连接到高级游戏数据
        if (typeof advancedGameData !== 'undefined') {
            this.mergeAdvancedData();
        }

        // 恢复保存的数据
        this.loadSavedData();
    },

    // 创建默认游戏数据
    createDefaultGameData() {
        window.gameData = {
            character: {
                name: '玩家',
                gender: 'female',
                age: 18,
                health: 100,
                mood: 50,
                money: 100,
                energy: 100,
                location: 'school',
                // 外貌
                appearance: {
                    hair: 'long',
                    hairColor: 'black',
                    body: 'normal'
                },
                // 属性
                attributes: {
                    intelligence: 5,
                    strength: 5,
                    charisma: 5,
                    courage: 5
                }
            },
            // 地点数据（使用原有的）
            locations: {},
            // 关系数据
            relationships: {},
            // 物品数据
            inventory: []
        };
        this.gameDataRef = window.gameData;
    },

    // 合并高级游戏数据
    mergeAdvancedData() {
        console.log('🔄 合并高级游戏系统数据...');

        if (typeof advancedGameData !== 'undefined') {
            // 合并角色属性
            Object.assign(this.gameDataRef.character, {
                hunger: advancedGameData.character.hunger || 50,
                hygiene: advancedGameData.character.hygiene || 80,
                effects: advancedGameData.character.effects || []
            });

            // 合并技能系统
            this.gameDataRef.skills = advancedGameData.skills || {};

            // 合并时间系统
            this.gameDataRef.time = advancedGameData.time || {
                day: 1,
                hour: 8,
                minute: 0,
                week: 1,
                season: 'spring'
            };

            // 合并事件系统
            this.gameDataRef.events = advancedGameData.events || {};

            console.log('✅ 高级系统数据已合并');
        }
    },

    // 保存角色创建数据
    saveCharacterCreationData(data) {
        console.log('💾 保存角色创建数据:', data);

        this.characterCreationData = data;

        // 更新游戏数据
        if (this.gameDataRef) {
            // 基础信息
            this.gameDataRef.character.name = data.name || '玩家';
            this.gameDataRef.character.gender = data.gender || 'female';
            this.gameDataRef.character.age = data.age || 18;

            // 外貌
            if (data.appearance) {
                this.gameDataRef.character.appearance = data.appearance;
            }

            // 属性
            if (data.attributes) {
                this.gameDataRef.character.attributes = data.attributes;

                // 同步到高级系统的属性
                if (this.gameDataRef.character.intelligence !== undefined) {
                    this.gameDataRef.character.intelligence = data.attributes.intelligence * 10;
                    this.gameDataRef.character.strength = data.attributes.strength * 10;
                    this.gameDataRef.character.charisma = data.attributes.charisma * 10;
                    this.gameDataRef.character.athletics = data.attributes.courage * 10;
                }
            }

            // NPC设置
            if (data.npcs) {
                this.gameDataRef.enabledNPCs = data.npcs;
            }

            // 难度设置
            if (data.difficulty) {
                this.gameDataRef.difficulty = data.difficulty;
            }

            // 保存到本地存储
            this.saveToLocal();
        }
    },

    // 获取角色数据（供页面使用）
    getCharacterData() {
        return this.gameDataRef ? this.gameDataRef.character : null;
    },

    // 更新角色数据
    updateCharacterData(updates) {
        if (this.gameDataRef && this.gameDataRef.character) {
            Object.assign(this.gameDataRef.character, updates);
            this.saveToLocal();

            // 触发UI更新
            if (typeof updateCharacterPanel === 'function') {
                updateCharacterPanel();
            }
        }
    },

    // 保存到本地存储
    saveToLocal() {
        try {
            localStorage.setItem('realityGameData', JSON.stringify(this.gameDataRef));
            localStorage.setItem('realityCharacterCreation', JSON.stringify(this.characterCreationData));
            console.log('💾 数据已保存到本地');
        } catch (error) {
            console.error('❌ 保存数据失败:', error);
        }
    },

    // 从本地存储加载
    loadSavedData() {
        try {
            // 加载游戏数据
            const savedGameData = localStorage.getItem('realityGameData');
            if (savedGameData) {
                const parsed = JSON.parse(savedGameData);
                if (this.gameDataRef) {
                    Object.assign(this.gameDataRef, parsed);
                    console.log('✅ 已加载保存的游戏数据');
                }
            }

            // 加载角色创建数据
            const savedCharacterData = localStorage.getItem('realityCharacterCreation');
            if (savedCharacterData) {
                this.characterCreationData = JSON.parse(savedCharacterData);
                console.log('✅ 已加载保存的角色数据');
            }
        } catch (error) {
            console.error('❌ 加载数据失败:', error);
        }
    },

    // 清除所有数据
    clearAllData() {
        localStorage.removeItem('realityGameData');
        localStorage.removeItem('realityCharacterCreation');
        this.characterCreationData = null;

        // 重置游戏数据
        if (this.gameDataRef) {
            this.createDefaultGameData();
        }

        console.log('🗑️ 所有数据已清除');
    },

    // 导出存档
    exportSave() {
        const saveData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            gameData: this.gameDataRef,
            characterCreation: this.characterCreationData
        };

        const blob = new Blob([JSON.stringify(saveData, null, 2)],
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `reality-save-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        console.log('📤 存档已导出');
    },

    // 导入存档
    importSave(fileContent) {
        try {
            const saveData = JSON.parse(fileContent);

            if (saveData.gameData) {
                Object.assign(this.gameDataRef, saveData.gameData);
            }

            if (saveData.characterCreation) {
                this.characterCreationData = saveData.characterCreation;
            }

            this.saveToLocal();
            console.log('📥 存档已导入');

            // 刷新页面
            location.reload();
        } catch (error) {
            console.error('❌ 导入存档失败:', error);
            alert('导入存档失败，请确保文件格式正确');
        }
    }
};

// 全局函数
window.saveCharacterData = function(data) {
    DataBridge.saveCharacterCreationData(data);
};

window.getCharacterData = function() {
    return DataBridge.getCharacterData();
};

// 导出
window.DataBridge = DataBridge;