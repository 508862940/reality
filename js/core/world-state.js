/**
 * 统一的世界状态管理器
 * 所有游戏数据的单一来源
 */

class WorldState {
    constructor() {
        // 初始世界状态
        this.state = {
            // 版本信息
            version: '1.0.0',

            // 世界时间（核心驱动）
            time: {
                day: 1,
                hour: 7,
                minute: 30,
                weekday: 1
            },

            // 环境
            environment: {
                weather: 'sunny',
                season: 'spring',
                temperature: 22
            },

            // 玩家（详细记录）
            player: {
                // 基础信息
                name: '未命名',
                type: 'ai',  // AI角色

                // 位置（重要！）
                position: {
                    map: 'school',
                    location: 'awakening_room',
                    x: 0,
                    y: 0
                },

                // 状态
                stats: {
                    health: 100,
                    mood: 50,
                    money: 100,
                    energy: 80,
                    spirit: 60
                },

                // 背包
                inventory: {
                    items: [],
                    maxSlots: 20,
                    equipment: {
                        weapon: null,
                        armor: null,
                        accessory: null
                    }
                },

                // 技能
                skills: {
                    combat: 0,
                    social: 0,
                    farming: 0,
                    crafting: 0
                },

                // 当前状态
                currentAction: 'idle',
                expression: 'normal',

                // A区 - 视觉状态
                visual: {
                    sprite: 'default',      // 立绘ID
                    expression: 'normal',   // 表情
                    outfit: 'school',       // 服装
                    pose: 'standing'        // 姿势
                },

                // D区补充 - 日志系统
                journal: {
                    mainQuests: [],         // 主线任务
                    sideQuests: [],         // 支线任务
                    achievements: [],       // 成就
                    unlockedLocations: []   // 解锁地点
                },

                // D区补充 - 设置
                settings: {
                    autoSaveEnabled: true,
                    volume: 80,
                    textSpeed: 'medium'
                }
            },

            // NPC（简化记录）
            npcs: {},

            // 剧情
            story: {
                mainQuest: 'prologue',
                currentSceneId: null,
                decisions: {},
                triggers: [],
                flags: {}
            },

            // 经济
            economy: {
                marketPrices: {},
                globalMultiplier: 1.0
            },

            // E区 - 提醒通知流
            notifications: {
                current: '',            // 当前显示的提醒
                history: [],            // 历史提醒记录（最近10条）
                queue: []              // 待显示的提醒队列
            },

            // NPC关系详情（补充）
            relationships: {
                Zero: {
                    affection: 0,
                    trust: 0,
                    stage: 'stranger',
                    memories: [],
                    lastMet: null
                }
            },

            // 地图GPS状态
            mapState: {
                currentMap: 'school',
                discoveredMaps: ['school'],
                fogOfWar: {},          // 迷雾状态
                markers: []            // 地图标记
            }
        };

        // 创建响应式代理（可选）
        this.createProxy();
    }

    /**
     * 创建响应式代理
     */
    createProxy() {
        // 如果需要响应式，可以在这里添加Proxy
        // 现在先保持简单
    }

    /**
     * 获取玩家数据
     */
    getPlayer() {
        return this.state.player;
    }

    /**
     * 获取玩家位置
     */
    getPlayerPosition() {
        return this.state.player.position;
    }

    /**
     * 更新玩家位置
     */
    setPlayerPosition(location, map = null) {
        if (map) {
            this.state.player.position.map = map;
        }
        this.state.player.position.location = location;

        // 触发场景更新
        this.onPositionChange();
    }

    /**
     * 位置变化时的回调
     */
    onPositionChange() {
        // 更新gameState中的location（兼容旧代码）
        if (window.gameState && window.gameState.character) {
            window.gameState.character.location = this.state.player.position.location;
        }

        // 根据新位置加载场景
        this.loadSceneByPosition();
    }

    /**
     * 根据位置加载对应场景
     */
    loadSceneByPosition() {
        const position = this.state.player.position;
        const location = position.location;

        // 查找对应的场景
        if (window.sceneManager) {
            // 这里需要一个位置到场景的映射
            const sceneId = this.getSceneIdByLocation(location);
            if (sceneId) {
                console.log(`📍 位置 ${location} 对应场景 ${sceneId}`);
                // 更新story中的当前场景
                this.state.story.currentSceneId = sceneId;
            }
        }
    }

    /**
     * 位置到场景的映射
     */
    getSceneIdByLocation(location) {
        const locationSceneMap = {
            'awakening_room': 'awakening',
            'classroom': 'classroom_morning',
            'hallway': 'school_hallway',
            'training_ground': 'training_intro',
            'dormitory': 'dorm_room'
        };

        return locationSceneMap[location] || null;
    }

    /**
     * 获取NPC数据
     */
    getNPC(npcId) {
        if (!this.state.npcs[npcId]) {
            // 初始化NPC
            this.state.npcs[npcId] = {
                name: npcId,
                position: { map: 'unknown', location: 'unknown' },
                relationship: {
                    affection: 0,
                    trust: 0,
                    stage: 'stranger'
                },
                currentAction: 'idle'
            };
        }
        return this.state.npcs[npcId];
    }

    /**
     * 更新NPC关系
     */
    updateNPCRelationship(npcId, affection = 0, trust = 0) {
        const npc = this.getNPC(npcId);
        npc.relationship.affection += affection;
        npc.relationship.trust += trust;

        // 更新关系阶段
        if (npc.relationship.affection >= 80) {
            npc.relationship.stage = 'lover';
        } else if (npc.relationship.affection >= 60) {
            npc.relationship.stage = 'close_friend';
        } else if (npc.relationship.affection >= 40) {
            npc.relationship.stage = 'friend';
        } else if (npc.relationship.affection >= 20) {
            npc.relationship.stage = 'acquaintance';
        }
    }

    /**
     * 更新当前场景（场景加载完成后调用）
     */
    updateCurrentScene(sceneData) {
        if (!sceneData) return;

        // 更新剧情系统中的当前场景ID
        this.state.story.currentSceneId = sceneData.id;

        console.log('🔄 世界状态更新当前场景:', sceneData.id);
    }

    /**
     * 获取完整的世界状态（用于存档）
     */
    getFullState() {
        const fullState = JSON.parse(JSON.stringify(this.state));

        // 保存完整的场景数据（不仅仅是ID）
        if (window.sceneManager && window.sceneManager.currentScene) {
            console.log('🔍 检查scene对象:', window.sceneManager.currentScene);

            try {
                // 测试序列化场景对象
                const serialized = JSON.stringify(window.sceneManager.currentScene);
                console.log('✅ 场景对象可以序列化，大小:', serialized.length, '字符');

                // 保存场景数据，但要清理临时状态
                const cleanScene = JSON.parse(JSON.stringify(window.sceneManager.currentScene));

                fullState.currentSceneData = {
                    scene: cleanScene,
                    currentTextIndex: window.sceneManager.currentTextIndex || 0,
                    isInChoice: false,  // 总是重置为未选择状态
                    // 不保存预览相关状态（previewChoice, isPreviewMode等）
                };
                console.log('💾 保存场景数据到worldState:', fullState.currentSceneData);
            } catch (error) {
                console.error('❌ 场景对象序列化失败:', error);
                // 降级保存：只保存基本信息
                fullState.currentSceneData = {
                    sceneId: window.sceneManager.currentScene.id,
                    sceneTitle: window.sceneManager.currentScene.title,
                    currentTextIndex: window.sceneManager.currentTextIndex || 0,
                    isInChoice: window.sceneManager.isInChoice || false
                };
                console.log('⚠️ 降级保存场景基本信息:', fullState.currentSceneData);
            }
        }

        // 保存F1区域的当前显示内容
        const storyArea = document.getElementById('storyArea');  // 使用storyArea而不是storyText
        if (storyArea) {
            // 保存整个storyArea的内容
            const htmlContent = storyArea.innerHTML || '';
            // 总是保存，即使是空的
            fullState.f1Content = {
                html: htmlContent,
                lastUpdate: Date.now()
            };
            console.log('💾 保存F1内容到worldState，长度:', htmlContent.length);
        }

        // 保存A区立绘状态
        const spriteImg = document.getElementById('characterSprite');
        if (spriteImg) {
            fullState.areaA = {
                sprite: spriteImg.src || '',
                name: document.getElementById('characterName')?.textContent || ''
            };
            console.log('🎨 保存A区立绘状态');
        }

        // 保存C区场景预览
        const scenePreview = document.getElementById('scenePreview');
        if (scenePreview) {
            fullState.areaC = {
                icon: scenePreview.querySelector('.scene-icon')?.textContent || '',
                description: scenePreview.querySelector('.scene-description')?.textContent || ''
            };
            console.log('🏞️ 保存C区场景预览');
        }

        // 保存E区提醒文本
        const noticeText = document.getElementById('noticeText');
        if (noticeText) {
            fullState.areaE = {
                text: noticeText.textContent || '',
                timestamp: Date.now()
            };
            console.log('💡 保存E区提醒状态');
        }

        // 保存所有引擎系统状态
        fullState.engineStates = {};

        // 保存天气系统
        if (window.weatherSystem && typeof window.weatherSystem.save === 'function') {
            fullState.engineStates.weather = window.weatherSystem.save();
            console.log('🌤️ 保存天气系统状态');
        }

        // 保存经济系统
        if (window.economySystem && typeof window.economySystem.save === 'function') {
            fullState.engineStates.economy = window.economySystem.save();
            console.log('💰 保存经济系统状态');
        }

        // 保存种植系统
        if (window.farmingSystem && typeof window.farmingSystem.save === 'function') {
            fullState.engineStates.farming = window.farmingSystem.save();
            console.log('🌱 保存种植系统状态');
        }

        // 保存时间系统
        if (window.timeSystem && typeof window.timeSystem.save === 'function') {
            fullState.engineStates.time = window.timeSystem.save();
            console.log('⏰ 保存时间系统状态');
        }

        // 保存战斗系统（如果在战斗中）
        if (window.combatSystem && typeof window.combatSystem.save === 'function') {
            const combatData = window.combatSystem.save();
            if (combatData && combatData.inCombat) {
                fullState.engineStates.combat = combatData;
                console.log('⚔️ 保存战斗系统状态');
            }
        }

        // 保存关系系统
        if (window.relationships && typeof window.relationships.save === 'function') {
            fullState.engineStates.relationships = window.relationships.save();
            console.log('💕 保存关系系统状态');
        }

        console.log('💾 getFullState返回的数据包含:', {
            hasCurrentSceneData: !!fullState.currentSceneData,
            hasF1Content: !!fullState.f1Content,
            hasEngineStates: !!fullState.engineStates,
            engineCount: Object.keys(fullState.engineStates || {}).length,
            sceneId: fullState.currentSceneData?.scene?.id
        });

        return fullState;
    }

    /**
     * 加载世界状态（用于读档）
     */
    loadFullState(savedState) {
        console.log('🔄 loadFullState被调用，savedState包含:', {
            hasCurrentSceneData: !!savedState?.currentSceneData,
            hasF1Content: !!savedState?.f1Content,
            sceneManagerExists: !!window.sceneManager
        });

        // 深度合并，保留未保存的默认值
        this.state = this.deepMerge(this.state, savedState);

        // 🌟 重新连接响应式系统
        this.reconnectReactiveSystems();

        // 保存场景数据以便稍后恢复
        this.pendingSceneData = null;
        if (savedState && savedState.currentSceneData) {
            this.pendingSceneData = savedState.currentSceneData;
            console.log('📦 场景数据已保存，等待sceneManager初始化');
        }

        // 恢复场景数据 - 暂时禁用，让game-bootstrap统一处理
        // if (savedState && savedState.currentSceneData && window.sceneManager) {
        //     const sceneData = savedState.currentSceneData;
        //     console.log('📖 正在恢复场景数据:', sceneData);
        //
        //     window.sceneManager.currentScene = sceneData.scene;
        //     window.sceneManager.currentTextIndex = sceneData.currentTextIndex || 0;
        //     window.sceneManager.isInChoice = sceneData.isInChoice || false;
        //
        //     // 重新显示场景
        //     if (sceneData.scene && window.sceneManager.loadScene) {
        //         console.log('📖 调用loadScene恢复场景显示');
        //         // 设置恢复标记，避免触发自动存档
        //         window.sceneManager.isRestoring = true;
        //         window.sceneManager.loadScene(sceneData.scene);
        //         // 恢复完成后清除标记
        //         setTimeout(() => {
        //             window.sceneManager.isRestoring = false;
        //         }, 100);
        //     }
        // } else if (savedState && savedState.currentSceneData && !window.sceneManager) {
        //     console.log('⏳ sceneManager尚未初始化，场景数据将延迟恢复');
        // }

        // 只保存场景数据，不立即恢复
        if (savedState && savedState.currentSceneData) {
            this.pendingSceneData = savedState.currentSceneData;
            console.log('📦 场景数据已保存到pendingSceneData，由game-bootstrap处理');
        }

        // 恢复F1区域内容（如果场景没有恢复成功）
        if (savedState && savedState.f1Content) {
            const storyArea = document.getElementById('storyArea');
            if (storyArea) {
                console.log('📝 恢复F1区域HTML内容，长度:', savedState.f1Content.html.length);
                storyArea.innerHTML = savedState.f1Content.html;
            }
        }

        // 恢复A区立绘状态
        if (savedState && savedState.areaA) {
            const spriteImg = document.getElementById('characterSprite');
            if (spriteImg && savedState.areaA.sprite) {
                spriteImg.src = savedState.areaA.sprite;
                console.log('🎨 恢复A区立绘');
            }
            const nameElement = document.getElementById('characterName');
            if (nameElement && savedState.areaA.name) {
                nameElement.textContent = savedState.areaA.name;
            }
        }

        // 恢复C区场景预览
        if (savedState && savedState.areaC) {
            const scenePreview = document.getElementById('scenePreview');
            if (scenePreview) {
                const icon = scenePreview.querySelector('.scene-icon');
                const desc = scenePreview.querySelector('.scene-description');
                if (icon) icon.textContent = savedState.areaC.icon || '';
                if (desc) desc.textContent = savedState.areaC.description || '';
                console.log('🏞️ 恢复C区场景预览');
            }
        }

        // 恢复E区提醒文本
        if (savedState && savedState.areaE) {
            const noticeText = document.getElementById('noticeText');
            if (noticeText && savedState.areaE.text) {
                noticeText.textContent = savedState.areaE.text;
                console.log('💡 恢复E区提醒状态');
            }
        }

        // 恢复所有引擎系统状态
        if (savedState && savedState.engineStates) {
            console.log('🔧 开始恢复引擎系统状态...');

            // 恢复天气系统
            if (savedState.engineStates.weather && window.weatherSystem) {
                window.weatherSystem.load(savedState.engineStates.weather);
                console.log('🌤️ 天气系统已恢复');
            }

            // 恢复经济系统
            if (savedState.engineStates.economy && window.economySystem) {
                window.economySystem.load(savedState.engineStates.economy);
                console.log('💰 经济系统已恢复');
            }

            // 恢复种植系统
            if (savedState.engineStates.farming && window.farmingSystem) {
                window.farmingSystem.load(savedState.engineStates.farming);
                console.log('🌱 种植系统已恢复');
            }

            // 恢复时间系统
            if (savedState.engineStates.time && window.timeSystem) {
                window.timeSystem.load(savedState.engineStates.time);
                console.log('⏰ 时间系统已恢复');
            }

            // 恢复战斗系统（如果在战斗中）
            if (savedState.engineStates.combat && window.combatSystem) {
                window.combatSystem.load(savedState.engineStates.combat);
                console.log('⚔️ 战斗系统已恢复');
            }

            // 恢复关系系统
            if (savedState.engineStates.relationships && window.relationships) {
                window.relationships.load(savedState.engineStates.relationships);
                console.log('💕 关系系统已恢复');
            }

            console.log('✅ 所有引擎系统恢复完成');
        }

        // 触发必要的更新
        this.onPositionChange();

        console.log('✅ 世界状态已加载');
    }

    /**
     * 尝试恢复待处理的场景数据
     */
    tryRestorePendingScene() {
        if (this.pendingSceneData && window.sceneManager) {
            const sceneData = this.pendingSceneData;
            console.log('📖 延迟恢复场景数据:', sceneData);

            window.sceneManager.currentScene = sceneData.scene;
            window.sceneManager.currentTextIndex = sceneData.currentTextIndex || 0;
            window.sceneManager.isInChoice = sceneData.isInChoice || false;

            // 重新显示场景
            if (sceneData.scene && window.sceneManager.loadScene) {
                console.log('📖 调用loadScene恢复场景显示');
                // 设置恢复标记，避免触发自动存档
                window.sceneManager.isRestoring = true;
                window.sceneManager.loadScene(sceneData.scene);
                // 恢复完成后清除标记
                setTimeout(() => {
                    window.sceneManager.isRestoring = false;
                }, 100);
            }

            // 清除待处理数据
            this.pendingSceneData = null;
            console.log('✅ 场景恢复完成');
            return true;
        }
        return false;
    }

    /**
     * 深度合并对象
     */
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * 初始化所有引擎系统（确保它们存在）
     */
    initializeEngineSystems() {
        console.log('🔧 初始化引擎系统...');

        // 时间系统
        if (!window.timeSystem && window.TimeSystem) {
            window.timeSystem = new TimeSystem();
            console.log('⏰ 时间系统已创建');
        }

        // 天气系统
        if (!window.weatherSystem && window.WeatherSystem) {
            window.weatherSystem = new WeatherSystem();
            console.log('🌤️ 天气系统已创建');
        }

        // 经济系统
        if (!window.economySystem && window.EconomySystem) {
            window.economySystem = new EconomySystem();
            console.log('💰 经济系统已创建');
        }

        // 种植系统
        if (!window.farmingSystem && window.FarmingSystem) {
            window.farmingSystem = new FarmingSystem();
            console.log('🌱 种植系统已创建');
        }

        // 战斗系统
        if (!window.combatSystem && window.CombatSystem) {
            window.combatSystem = new CombatSystem();
            console.log('⚔️ 战斗系统已创建');
        }

        // 关系系统
        if (!window.relationships && window.RelationshipSystem) {
            window.relationships = new RelationshipSystem();
            console.log('💕 关系系统已创建');
        }

        console.log('✅ 引擎系统初始化完成');
    }

    /**
     * 连接到现有系统（兼容层）
     */
    connectToExistingSystems() {
        // 同步到旧的gameState（逐步迁移）
        if (window.gameState) {
            // 让gameState.character指向我们的player stats
            window.gameState.character = {
                name: this.state.player.name,
                health: this.state.player.stats.health,
                mood: this.state.player.stats.mood,
                money: this.state.player.stats.money,
                energy: this.state.player.stats.energy,
                spirit: this.state.player.stats.spirit,
                location: this.state.player.position.location
            };
        }

        // 连接时间系统
        if (window.timeSystem) {
            // 同步时间
            window.timeSystem.currentTime = this.state.time;
        }

        // 连接关系系统
        if (window.relationships) {
            // 让关系系统使用我们的NPC数据
            window.relationships.getData = () => {
                const relationshipData = {};
                Object.keys(this.state.npcs).forEach(npcId => {
                    relationshipData[npcId] = this.state.npcs[npcId].relationship;
                });
                return relationshipData;
            };
        }

        console.log('✅ 世界状态已连接到现有系统');
    }

    /**
     * 重新连接响应式系统（时光倒流时使用）
     */
    reconnectReactiveSystems() {
        console.log('🔄 重新连接响应式系统...');

        // 更新gameState.character（保持兼容性）
        if (window.gameState && window.gameState.character) {
            Object.assign(window.gameState.character, {
                name: this.state.player.name,
                health: this.state.player.stats.health,
                mood: this.state.player.stats.mood,
                money: this.state.player.stats.money,
                energy: this.state.player.stats.energy,
                spirit: this.state.player.stats.spirit,
                location: this.state.player.position.location
            });
            console.log('📊 已更新gameState.character');
        }

        // 🌟 如果有响应式系统，触发批量更新
        if (window.reactiveSystem) {
            const updateData = {
                ...this.state.player.stats,
                location: this.state.player.position.location
            };
            window.reactiveSystem.batchUpdate(updateData);
            console.log('✨ 响应式批量更新已触发');
        }

        // 更新时间系统
        if (window.timeSystem && this.state.time) {
            window.timeSystem.currentTime = this.state.time;
            // 如果有更新时间显示的函数，调用它
            if (window.updateLocationTime) {
                window.updateLocationTime();
            }
        }

        console.log('✅ 响应式系统重连完成');
    }
}

// 创建全局实例
window.worldState = new WorldState();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldState;
}