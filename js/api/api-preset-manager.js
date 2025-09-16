// API预设管理器 - 从yoyo项目移植
// 支持多预设保存、切换、导入导出

const APIPresetManager = {
    // 默认预设配置
    defaultPresets: [
        {
            id: 'preset_gemini_default',
            name: 'Gemini (默认)',
            provider: 'gemini',
            endpoint: '',
            apiKey: '',
            model: 'gemini-1.5-flash-latest'
        },
        {
            id: 'preset_openai_default',
            name: 'OpenAI',
            provider: 'openai',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: '',
            model: 'gpt-3.5-turbo'
        },
        {
            id: 'preset_claude_default',
            name: 'Claude',
            provider: 'claude',
            endpoint: 'https://api.anthropic.com/v1/messages',
            apiKey: '',
            model: 'claude-3-sonnet-20240229'
        }
    ],

    // 初始化
    init() {
        // 从localStorage加载或使用默认值
        const saved = localStorage.getItem('api_presets');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.presets = data.presets || this.defaultPresets;
                this.activePresetId = data.activePresetId || this.presets[0].id;
            } catch (e) {
                console.error('加载API预设失败:', e);
                this.resetToDefaults();
            }
        } else {
            this.resetToDefaults();
        }
    },

    // 重置为默认值
    resetToDefaults() {
        this.presets = [...this.defaultPresets];
        this.activePresetId = this.presets[0].id;
        this.save();
    },

    // 保存到localStorage
    save() {
        const data = {
            presets: this.presets,
            activePresetId: this.activePresetId
        };
        localStorage.setItem('api_presets', JSON.stringify(data));
        console.log('API预设已保存');
    },

    // 获取当前激活的预设
    getActivePreset() {
        return this.presets.find(p => p.id === this.activePresetId);
    },

    // 切换预设
    switchPreset(presetId) {
        if (this.presets.find(p => p.id === presetId)) {
            this.activePresetId = presetId;
            this.save();
            return true;
        }
        return false;
    },

    // 更新当前预设
    updateCurrentPreset(updates) {
        const preset = this.getActivePreset();
        if (preset) {
            Object.assign(preset, updates);
            this.save();
            return true;
        }
        return false;
    },

    // 创建新预设
    createPreset(name = '新预设') {
        const newPreset = {
            id: `preset_${Date.now()}`,
            name: name,
            provider: 'gemini',
            endpoint: '',
            apiKey: '',
            model: 'gemini-1.5-flash-latest'
        };
        this.presets.push(newPreset);
        this.activePresetId = newPreset.id;
        this.save();
        return newPreset;
    },

    // 删除预设
    deletePreset(presetId) {
        if (this.presets.length <= 1) {
            alert('至少需要保留一个预设');
            return false;
        }

        const index = this.presets.findIndex(p => p.id === presetId);
        if (index > -1) {
            this.presets.splice(index, 1);
            // 如果删除的是当前预设，切换到第一个
            if (this.activePresetId === presetId) {
                this.activePresetId = this.presets[0].id;
            }
            this.save();
            return true;
        }
        return false;
    },

    // 获取所有预设
    getAllPresets() {
        return this.presets;
    },

    // 导出配置
    exportConfig() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            presets: this.presets,
            activePresetId: this.activePresetId
        };
    },

    // 导入配置
    importConfig(config) {
        if (!config || !config.presets || !Array.isArray(config.presets)) {
            throw new Error('无效的配置文件');
        }

        this.presets = config.presets;
        this.activePresetId = config.activePresetId || this.presets[0].id;

        // 验证activePresetId是否存在
        if (!this.presets.find(p => p.id === this.activePresetId)) {
            this.activePresetId = this.presets[0].id;
        }

        this.save();
        return true;
    },

    // 拉取模型列表（从yoyo移植）
    async fetchModels(preset) {
        if (!preset.apiKey) {
            throw new Error('请先填写API密钥');
        }

        let fetchUrl;
        let headers = { 'Content-Type': 'application/json' };

        if (preset.provider === 'gemini') {
            fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${preset.apiKey}`;
        } else if (preset.provider === 'openai' || preset.provider === 'openai-compatible') {
            let endpoint = preset.endpoint;
            if (endpoint.endsWith('/chat/completions')) {
                endpoint = endpoint.replace('/chat/completions', '');
            }
            if (!endpoint.endsWith('/v1')) {
                endpoint = endpoint.replace(/\/$/, '') + '/v1';
            }
            fetchUrl = `${endpoint}/models`;
            headers['Authorization'] = `Bearer ${preset.apiKey}`;
        } else if (preset.provider === 'claude') {
            // Claude不支持列出模型，返回常用模型
            return [
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307',
                'claude-2.1',
                'claude-instant-1.2'
            ];
        }

        try {
            const response = await fetch(fetchUrl, { headers: headers });
            if (!response.ok) {
                throw new Error(`服务器错误: ${response.status}`);
            }

            const data = await response.json();

            if (preset.provider === 'gemini') {
                return data.models
                    .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
                    .map(model => model.name.replace('models/', ''));
            } else {
                return data.data.map(model => model.id);
            }
        } catch (error) {
            console.error('获取模型列表失败:', error);
            throw error;
        }
    }
};

// 初始化
APIPresetManager.init();

// 导出给全局使用
window.APIPresetManager = APIPresetManager;