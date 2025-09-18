// API状态管理 - 参照yoyo项目实现
// 管理所有API配置的状态

const APIState = {
    // 默认状态
    getDefaultState() {
        return {
            apiConfig: {
                activePresetId: 'preset_default',
                presets: [{
                    id: 'preset_default',
                    name: '默认配置',
                    provider: 'openai-compatible',
                    endpoint: '',
                    apiKey: '',
                    model: 'gpt-3.5-turbo'
                }]
            }
        };
    },

    // 初始化状态
    async init() {
        // 从IndexedDB加载（如果Database可用）
        if (typeof Database !== 'undefined' && Database.loadAPIConfig) {
            try {
                const config = await Database.loadAPIConfig();
                if (config && config.presets) {
                    this.state = {
                        apiConfig: {
                            activePresetId: config.activePresetId,
                            presets: config.presets
                        }
                    };
                    console.log('✅ 从IndexedDB加载了API配置');
                } else {
                    this.state = this.getDefaultState();
                }
            } catch (e) {
                console.error('从IndexedDB加载配置失败:', e);
                // 降级到localStorage
                const saved = localStorage.getItem('game_api_state');
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        this.state = data;
                        console.log('✅ 从localStorage加载了保存的API配置');
                    } catch (e2) {
                        console.error('加载配置失败:', e2);
                        this.state = this.getDefaultState();
                    }
                } else {
                    this.state = this.getDefaultState();
                }
            }
        } else {
            // Database不可用，使用localStorage
            const saved = localStorage.getItem('game_api_state');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.state = data;
                    console.log('✅ 从localStorage加载了保存的API配置');
                } catch (e) {
                    console.error('加载配置失败:', e);
                    this.state = this.getDefaultState();
                }
            } else {
                this.state = this.getDefaultState();
            }
        }

        // 自动应用配置
        this.applyActivePreset();
    },

    // 获取当前状态
    get() {
        if (!this.state) {
            this.init();
        }
        return this.state;
    },

    // 保存状态
    async save() {
        // 优先保存到IndexedDB
        if (typeof Database !== 'undefined' && Database.saveAPIConfig) {
            try {
                await Database.saveAPIConfig({
                    presets: this.state.apiConfig.presets,
                    activePresetId: this.state.apiConfig.activePresetId
                });
                console.log('💾 API配置已保存到IndexedDB');
            } catch (e) {
                console.error('保存到IndexedDB失败:', e);
                // 降级到localStorage
                localStorage.setItem('game_api_state', JSON.stringify(this.state));
                console.log('💾 API配置已保存到localStorage（备用）');
            }
        } else {
            // Database不可用，使用localStorage
            localStorage.setItem('game_api_state', JSON.stringify(this.state));
            console.log('💾 API配置已保存到localStorage');
        }
    },

    // 获取当前激活的预设
    getActivePreset() {
        const state = this.get();
        return state.apiConfig.presets.find(p => p.id === state.apiConfig.activePresetId);
    },

    // 切换预设
    switchPreset(presetId) {
        const state = this.get();
        const preset = state.apiConfig.presets.find(p => p.id === presetId);
        if (preset) {
            state.apiConfig.activePresetId = presetId;
            this.save();
            this.applyActivePreset();
            return true;
        }
        return false;
    },

    // 添加新预设
    addPreset(name = '新配置') {
        const state = this.get();
        const newId = `preset_${Date.now()}`;
        const newPreset = {
            id: newId,
            name: name,
            provider: 'openai-compatible',
            endpoint: '',
            apiKey: '',
            model: 'gpt-3.5-turbo'
        };
        state.apiConfig.presets.push(newPreset);
        state.apiConfig.activePresetId = newId;
        this.save();
        return newId;
    },

    // 更新预设
    updatePreset(presetId, updates) {
        const state = this.get();
        const presetIndex = state.apiConfig.presets.findIndex(p => p.id === presetId);
        if (presetIndex !== -1) {
            state.apiConfig.presets[presetIndex] = {
                ...state.apiConfig.presets[presetIndex],
                ...updates
            };
            this.save();

            // 如果更新的是当前激活的预设，立即应用
            if (presetId === state.apiConfig.activePresetId) {
                this.applyActivePreset();
            }
            return true;
        }
        return false;
    },

    // 删除预设
    deletePreset(presetId) {
        const state = this.get();
        if (state.apiConfig.presets.length <= 1) {
            alert('不能删除最后一个预设！');
            return false;
        }

        state.apiConfig.presets = state.apiConfig.presets.filter(p => p.id !== presetId);

        // 如果删除的是当前激活的预设，切换到第一个
        if (presetId === state.apiConfig.activePresetId) {
            state.apiConfig.activePresetId = state.apiConfig.presets[0].id;
            this.applyActivePreset();
        }

        this.save();
        return true;
    },

    // 应用当前激活的预设到游戏系统
    applyActivePreset() {
        const preset = this.getActivePreset();
        if (!preset || !preset.apiKey || !preset.endpoint) {
            // 配置不完整时静默返回，不警告（因为初始状态就是空的）
            return false;
        }

        console.log(`🔧 应用预设: ${preset.name}`);

        // 应用到AIConfig（旧系统）
        if (typeof AIConfig !== 'undefined' && AIConfig.api) {
            // 清除所有配置
            Object.keys(AIConfig.api).forEach(key => {
                if (AIConfig.api[key]) {
                    AIConfig.api[key].enabled = false;
                }
            });

            // 根据provider类型应用配置
            if (preset.provider === 'openai-compatible' || preset.provider === 'openai') {
                AIConfig.api.openai_proxy = {
                    enabled: true,
                    apiKey: preset.apiKey,
                    baseURL: preset.endpoint,
                    model: preset.model
                };
                AIConfig.currentProvider = 'openai_proxy';
            } else if (preset.provider === 'gemini') {
                AIConfig.api.gemini = {
                    enabled: true,
                    apiKey: preset.apiKey,
                    baseURL: preset.endpoint || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                    model: preset.model || 'gemini-pro'
                };
                AIConfig.currentProvider = 'gemini';
            }

            console.log('✅ AIConfig已更新');
        }

        // 应用到AIServices（新系统）
        if (typeof AIServices !== 'undefined') {
            if (preset.provider === 'openai-compatible' || preset.provider === 'openai') {
                AIServices.openai_proxy = {
                    name: 'OpenAI兼容代理',
                    baseURL: preset.endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + preset.apiKey
                    },
                    apiKey: preset.apiKey,
                    enabled: true
                };
            }
            console.log('✅ AIServices已更新');
        }

        // 同步配置
        if (typeof syncAIServiceConfig === 'function') {
            syncAIServiceConfig();
            console.log('✅ 配置已同步');
        }

        return true;
    },

    // 测试预设
    async testPreset(presetId) {
        const preset = this.state.apiConfig.presets.find(p => p.id === presetId);
        if (!preset || !preset.apiKey || !preset.endpoint) {
            return { success: false, error: '配置不完整' };
        }

        try {
            const response = await fetch(preset.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${preset.apiKey}`
                },
                body: JSON.stringify({
                    model: preset.model,
                    messages: [{ role: 'user', content: '你好' }],
                    max_tokens: 50
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: data.choices?.[0]?.message?.content || '测试成功'
                };
            } else {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${await response.text()}`
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await APIState.init();
    });
} else {
    APIState.init();
}

// 定期检查和应用配置（防止配置丢失）
setInterval(() => {
    if (typeof AIConfig !== 'undefined' && AIConfig.api) {
        const currentProvider = AIConfig.currentProvider;
        const providerConfig = AIConfig.api[currentProvider];
        const preset = APIState.getActivePreset();

        // 只有当有有效配置但丢失时才重新应用
        if (preset && preset.apiKey && preset.endpoint) {
            if (!providerConfig || !providerConfig.enabled || !providerConfig.apiKey) {
                console.log('🔄 检测到配置丢失，重新应用...');
                APIState.applyActivePreset();
            }
        }
    }
}, 3000);

// 导出到全局
window.APIState = APIState;