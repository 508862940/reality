// API管理系统 - 支持多用户多API配置
// 自动从localStorage加载和保存配置

class APIManager {
    constructor() {
        this.configs = [];
        this.currentConfigIndex = 0;
        this.storageKey = 'game_api_configs';
        this.loadConfigs();
        this.initializeSystem();
    }

    // 加载保存的配置
    loadConfigs() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.configs = JSON.parse(saved);
                console.log(`📥 加载了 ${this.configs.length} 个API配置`);
            } else {
                // 默认配置模板
                this.configs = [{
                    name: '默认配置',
                    service: 'openai_proxy',
                    apiKey: '',
                    baseURL: '',
                    model: 'gpt-3.5-turbo',
                    enabled: false
                }];
            }
        } catch (error) {
            console.error('加载配置失败:', error);
            this.configs = [];
        }
    }

    // 保存配置到localStorage
    saveConfigs() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.configs));
            console.log('💾 配置已保存');
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    }

    // 添加新配置
    addConfig(config) {
        this.configs.push({
            name: config.name || `配置${this.configs.length + 1}`,
            service: config.service || 'openai_proxy',
            apiKey: config.apiKey || '',
            baseURL: config.baseURL || '',
            model: config.model || 'gpt-3.5-turbo',
            enabled: true,
            addedAt: new Date().toISOString()
        });
        this.saveConfigs();
        return this.configs.length - 1;
    }

    // 更新配置
    updateConfig(index, config) {
        if (index >= 0 && index < this.configs.length) {
            this.configs[index] = { ...this.configs[index], ...config };
            this.saveConfigs();
            this.applyConfig(index);
            return true;
        }
        return false;
    }

    // 删除配置
    deleteConfig(index) {
        if (index >= 0 && index < this.configs.length && this.configs.length > 1) {
            this.configs.splice(index, 1);
            if (this.currentConfigIndex >= this.configs.length) {
                this.currentConfigIndex = this.configs.length - 1;
            }
            this.saveConfigs();
            return true;
        }
        return false;
    }

    // 切换当前配置
    switchConfig(index) {
        if (index >= 0 && index < this.configs.length) {
            this.currentConfigIndex = index;
            this.applyConfig(index);
            return true;
        }
        return false;
    }

    // 应用配置到游戏系统
    applyConfig(index = this.currentConfigIndex) {
        const config = this.configs[index];
        if (!config || !config.apiKey || !config.baseURL) {
            console.warn('⚠️ 配置不完整，跳过应用');
            return false;
        }

        console.log(`🔧 应用配置: ${config.name}`);

        // 应用到AIConfig
        if (typeof AIConfig !== 'undefined' && AIConfig.api) {
            // 清除所有配置
            Object.keys(AIConfig.api).forEach(key => {
                if (AIConfig.api[key]) {
                    AIConfig.api[key].enabled = false;
                }
            });

            // 应用选中的配置
            const provider = config.service;
            if (AIConfig.api[provider]) {
                AIConfig.api[provider] = {
                    enabled: true,
                    apiKey: config.apiKey,
                    baseURL: config.baseURL,
                    model: config.model
                };
                AIConfig.currentProvider = provider;
                console.log('✅ AIConfig已更新');
            }
        }

        // 应用到AIServices
        if (typeof AIServices !== 'undefined') {
            const provider = config.service;
            if (AIServices[provider]) {
                AIServices[provider].apiKey = config.apiKey;
                AIServices[provider].baseURL = config.baseURL;
                AIServices[provider].enabled = true;

                if (AIServices[provider].headers) {
                    if (provider === 'openai_proxy' || provider === 'openai') {
                        AIServices[provider].headers['Authorization'] = 'Bearer ' + config.apiKey;
                    } else if (provider === 'claude') {
                        AIServices[provider].headers['x-api-key'] = config.apiKey;
                    }
                }
                console.log('✅ AIServices已更新');
            }
        }

        // 同步配置
        if (typeof syncAIServiceConfig === 'function') {
            syncAIServiceConfig();
            console.log('✅ 配置已同步');
        }

        return true;
    }

    // 测试配置
    async testConfig(index = this.currentConfigIndex) {
        const config = this.configs[index];
        if (!config || !config.apiKey || !config.baseURL) {
            return { success: false, error: '配置不完整' };
        }

        console.log(`🧪 测试配置: ${config.name}`);

        try {
            const response = await fetch(config.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
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

    // 获取当前配置
    getCurrentConfig() {
        return this.configs[this.currentConfigIndex];
    }

    // 获取所有配置
    getAllConfigs() {
        return this.configs;
    }

    // 初始化系统
    initializeSystem() {
        // 页面加载完成后自动应用配置
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.autoApply();
            });
        } else {
            this.autoApply();
        }

        // 定期检查并应用配置
        setInterval(() => {
            this.checkAndApply();
        }, 2000);
    }

    // 自动应用配置
    autoApply() {
        // 查找第一个有效的配置
        for (let i = 0; i < this.configs.length; i++) {
            const config = this.configs[i];
            if (config.enabled && config.apiKey && config.baseURL) {
                this.currentConfigIndex = i;
                this.applyConfig(i);
                console.log(`✅ 自动应用配置: ${config.name}`);
                break;
            }
        }
    }

    // 检查并应用配置
    checkAndApply() {
        // 如果AIConfig存在但没有正确配置，重新应用
        if (typeof AIConfig !== 'undefined' && AIConfig.api) {
            const currentProvider = AIConfig.currentProvider;
            const providerConfig = AIConfig.api[currentProvider];

            if (!providerConfig || !providerConfig.enabled || !providerConfig.apiKey) {
                console.log('🔄 检测到配置丢失，重新应用...');
                this.autoApply();
            }
        }
    }

    // 导出配置
    exportConfigs() {
        const data = JSON.stringify(this.configs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'api_configs.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // 导入配置
    importConfigs(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const configs = JSON.parse(e.target.result);
                    this.configs = configs;
                    this.saveConfigs();
                    resolve(configs.length);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

// 创建全局实例
const apiManager = new APIManager();

// 导出到全局
window.apiManager = apiManager;

// 提供便捷函数
window.addAPIConfig = function(apiKey, baseURL, name) {
    return apiManager.addConfig({
        name: name || '新配置',
        apiKey: apiKey,
        baseURL: baseURL,
        service: 'openai_proxy',
        model: 'gpt-3.5-turbo'
    });
};

window.switchAPIConfig = function(index) {
    return apiManager.switchConfig(index);
};

window.testAPIConfig = async function(index) {
    const result = await apiManager.testConfig(index);
    if (result.success) {
        console.log('✅ 测试成功:', result.message);
    } else {
        console.error('❌ 测试失败:', result.error);
    }
    return result;
};

window.listAPIConfigs = function() {
    const configs = apiManager.getAllConfigs();
    console.log('📋 所有API配置:');
    configs.forEach((config, index) => {
        const status = config.enabled && config.apiKey && config.baseURL ? '✅' : '❌';
        const current = index === apiManager.currentConfigIndex ? '👉' : '  ';
        console.log(`${current} [${index}] ${status} ${config.name} - ${config.service}`);
    });
    return configs;
};

console.log('🎮 API管理系统已加载');
console.log('💡 可用命令:');
console.log('- addAPIConfig(apiKey, baseURL, name) : 添加新配置');
console.log('- switchAPIConfig(index) : 切换配置');
console.log('- testAPIConfig(index) : 测试配置');
console.log('- listAPIConfigs() : 列出所有配置');

// 自动修复旧版本保存的配置
(function migrateOldConfig() {
    const oldConfig = localStorage.getItem('ai_config');
    if (oldConfig && apiManager.configs.length === 1 && !apiManager.configs[0].apiKey) {
        try {
            const config = JSON.parse(oldConfig);
            console.log('🔄 迁移旧配置...');
            apiManager.updateConfig(0, {
                name: '迁移的配置',
                apiKey: config.apiKey,
                baseURL: config.baseUrl || config.baseURL,
                model: config.model,
                enabled: true
            });
            console.log('✅ 旧配置已迁移');
        } catch (error) {
            console.error('迁移失败:', error);
        }
    }
})();