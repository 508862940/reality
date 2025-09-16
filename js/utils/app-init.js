// Reality App - 初始化脚本
// 应用启动和初始化逻辑

(function() {
    'use strict';

    console.log('✨ Reality 游戏启动中...');

    // 应用初始化
    const AppInit = {
        // 初始化状态
        initialized: false,

        // 初始化应用
        async init() {
            try {
                console.log('🚀 开始初始化应用...');

                // 1. 检查依赖
                this.checkDependencies();

                // 2. 初始化数据桥接
                if (typeof DataBridge !== 'undefined') {
                    DataBridge.init();
                    console.log('✅ 数据桥接已初始化');
                }

                // 3. 初始化API管理器
                this.initializeAPIs();

                // 4. 初始化游戏数据
                this.initializeGameData();

                // 5. 初始化路由系统
                if (typeof AppRouter !== 'undefined') {
                    AppRouter.init();
                    console.log('✅ 路由系统已初始化');
                }

                // 6. 隐藏加载界面
                this.hideLoading();

                // 标记初始化完成
                this.initialized = true;
                console.log('🎉 Reality 游戏初始化完成！');

            } catch (error) {
                console.error('❌ 初始化失败:', error);
                this.showError('初始化失败', error.message);
            }
        },

        // 检查依赖
        checkDependencies() {
            console.log('🔍 检查依赖...');

            const requiredModules = [
                'gameData',
                'AppRouter',
                'DataBridge'
            ];

            const missingModules = [];

            requiredModules.forEach(module => {
                if (typeof window[module] === 'undefined') {
                    console.warn(`⚠️ 模块未加载: ${module}`);
                    missingModules.push(module);
                }
            });

            // 如果缺少核心模块，尝试创建默认实例
            if (missingModules.includes('gameData')) {
                console.log('📦 创建默认游戏数据...');
                window.gameData = {
                    character: {
                        health: 100,
                        mood: 50,
                        money: 100,
                        location: 'school'
                    }
                };
            }
        },

        // 初始化API系统
        initializeAPIs() {
            console.log('🔧 初始化API系统...');

            // 初始化API状态管理
            if (typeof APIState !== 'undefined' && APIState.init) {
                APIState.init();
                console.log('✅ API状态管理已初始化');
            }

            // 初始化API管理器
            if (typeof apiManager !== 'undefined') {
                console.log('✅ API管理器已就绪');
            }

            // 检查API配置
            if (typeof API_CONFIG !== 'undefined') {
                console.log('✅ API配置已加载');
            }
        },

        // 初始化游戏数据
        initializeGameData() {
            console.log('🎮 初始化游戏数据...');

            // 确保游戏数据存在
            if (typeof gameData === 'undefined') {
                window.gameData = {};
            }

            // 加载地点数据（如果原game.js已加载）
            if (typeof locations !== 'undefined') {
                gameData.locations = locations;
            }

            // 初始化高级游戏系统
            if (typeof advancedGameData !== 'undefined') {
                console.log('🎯 发现高级游戏系统');
                // 数据将由DataBridge合并
            }

            console.log('✅ 游戏数据初始化完成');
        },

        // 隐藏加载界面
        hideLoading() {
            setTimeout(() => {
                const loadingOverlay = document.getElementById('loadingOverlay');
                if (loadingOverlay) {
                    loadingOverlay.classList.add('hidden');
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                    }, 500);
                }
            }, 500);
        },

        // 显示错误
        showError(title, message) {
            // 隐藏加载界面
            this.hideLoading();

            // 创建错误提示
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <h3>${title}</h3>
                <p>${message}</p>
                <p>请刷新页面重试，或使用原版游戏。</p>
                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="margin-right: 10px;">
                        刷新页面
                    </button>
                    <button onclick="location.href='index.html'">
                        使用原版
                    </button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        }
    };

    // 全局函数：开始新游戏
    window.startNewGame = function() {
        console.log('🎮 开始新游戏');
        DataBridge.clearAllData();
        AppRouter.navigate('character-creation');
    };

    // 全局函数：加载游戏
    window.loadGame = function() {
        console.log('💾 加载存档');
        const savedData = DataBridge.getCharacterData();
        if (savedData && savedData.name) {
            // 有存档，直接进入游戏
            AppRouter.navigate('game-main');
        } else {
            alert('没有找到存档，请开始新游戏');
        }
    };

    // 全局函数：打开设置
    window.openSettings = function() {
        console.log('⚙️ 打开设置面板');
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.style.display = 'flex';
        }
    };

    // 全局函数：关闭设置
    window.closeSettings = function() {
        console.log('⚙️ 关闭设置面板');
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.style.display = 'none';
        }
    };

    // 全局函数：打开API配置
    window.openAPIConfig = function() {
        console.log('🤖 打开API配置');
        if (typeof openAPIConfigPanel === 'function') {
            openAPIConfigPanel();
        } else if (typeof toggleAISettings === 'function') {
            toggleAISettings();
        } else {
            alert('API配置面板未加载');
        }
    };

    // 全局函数：进入游戏世界
    window.enterReality = function() {
        console.log('🌟 进入Reality世界');

        // 收集角色创建数据
        const characterData = collectCharacterData();
        if (characterData) {
            // 保存数据
            DataBridge.saveCharacterCreationData(characterData);
            // 进入游戏主界面
            AppRouter.navigate('game-main');
        }
    };

    // 收集角色创建数据
    window.collectCharacterData = function() {
        const data = {
            name: document.getElementById('characterName')?.value || '玩家',
            gender: document.querySelector('.option-group .option-btn.active[onclick*="gender"]')?.textContent || 'female',
            age: document.getElementById('ageSlider')?.value || 18,
            appearance: {
                hair: document.querySelector('.option-group .option-btn.active[onclick*="hair"]')?.textContent || 'long',
                hairColor: document.querySelector('.option-group .option-btn.active[onclick*="hairColor"]')?.textContent || 'black',
                body: document.querySelector('.option-group .option-btn.active[onclick*="body"]')?.textContent || 'normal'
            },
            attributes: {
                intelligence: parseInt(document.getElementById('intSlider')?.value || 5),
                strength: parseInt(document.getElementById('strSlider')?.value || 5),
                charisma: parseInt(document.getElementById('chaSlider')?.value || 5),
                courage: parseInt(document.getElementById('couSlider')?.value || 5)
            },
            npcs: [],
            difficulty: document.querySelector('.difficulty-card.active')?.dataset.difficulty || 'easy'
        };

        // 收集启用的NPC
        document.querySelectorAll('.npc-toggle.active').forEach(toggle => {
            data.npcs.push(toggle.dataset.npc);
        });

        console.log('📋 收集的角色数据:', data);
        return data;
    };

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AppInit.init();
        });
    } else {
        // DOM已加载
        AppInit.init();
    }

    // 导出初始化器
    window.AppInit = AppInit;

})();