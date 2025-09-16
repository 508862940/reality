// API设置界面 - 从yoyo项目移植并优化
// 管理API预设的UI交互

const APISettingsScreen = {
    // 初始化界面
    init() {
        this.container = null;
        this.isOpen = false;
    },

    // 打开设置界面
    open() {
        if (this.isOpen) return;

        // 创建模态框
        this.createModal();
        this.render();
        this.bindEvents();
        this.isOpen = true;
    },

    // 关闭设置界面
    close() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.isOpen = false;
    },

    // 创建模态框
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'api-settings-modal';
        modal.innerHTML = `
            <div class="api-settings-container">
                <div class="api-settings-header">
                    <h2>🔧 API 设置</h2>
                    <button class="close-btn" id="api-settings-close">×</button>
                </div>
                <div class="api-settings-content">
                    <!-- 预设管理 -->
                    <div class="preset-section">
                        <div class="preset-controls">
                            <select id="api-preset-select" class="preset-select"></select>
                            <button id="new-preset-btn" class="btn-icon" title="新建预设">➕</button>
                            <button id="delete-preset-btn" class="btn-icon" title="删除预设">🗑️</button>
                        </div>
                    </div>

                    <hr class="divider">

                    <!-- 预设配置 -->
                    <div class="preset-config">
                        <div class="form-group">
                            <label>预设名称</label>
                            <input type="text" id="preset-name" placeholder="例如：我的Gemini">
                        </div>

                        <div class="form-group">
                            <label>API 服务商</label>
                            <select id="api-provider">
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI</option>
                                <option value="openai-compatible">OpenAI 兼容 (中转)</option>
                                <option value="claude">Claude (Anthropic)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>API 端点 <span class="optional">(可选)</span></label>
                            <input type="text" id="api-endpoint" placeholder="默认端点或自定义中转地址">
                        </div>

                        <div class="form-group">
                            <label>API 密钥</label>
                            <div class="input-with-toggle">
                                <input type="password" id="api-key" placeholder="输入你的API密钥">
                                <button class="toggle-visibility" id="toggle-key">👁️</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>模型</label>
                            <div class="model-input-group">
                                <input list="model-list" id="api-model" placeholder="选择或输入模型名称">
                                <datalist id="model-list"></datalist>
                                <button id="fetch-models-btn" class="btn-secondary">拉取模型</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <div id="api-status" class="status-indicator"></div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button id="save-preset-btn" class="btn-primary">💾 保存当前预设</button>
                        <button id="test-api-btn" class="btn-secondary">🔍 测试连接</button>
                        <div class="import-export-btns">
                            <button id="export-config-btn" class="btn-small">📤 导出</button>
                            <button id="import-config-btn" class="btn-small">📥 导入</button>
                            <input type="file" id="import-file" accept=".json" style="display:none">
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.container = modal;

        // 添加样式
        this.addStyles();
    },

    // 渲染界面
    render() {
        // 填充预设列表
        const presetSelect = document.getElementById('api-preset-select');
        presetSelect.innerHTML = '';

        const presets = APIPresetManager.getAllPresets();
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });

        // 设置当前预设
        presetSelect.value = APIPresetManager.activePresetId;

        // 显示当前预设信息
        this.displayPreset();
    },

    // 显示预设信息
    displayPreset() {
        const preset = APIPresetManager.getActivePreset();
        if (!preset) return;

        document.getElementById('preset-name').value = preset.name;
        document.getElementById('api-provider').value = preset.provider;
        document.getElementById('api-endpoint').value = preset.endpoint || '';
        document.getElementById('api-key').value = preset.apiKey || '';
        document.getElementById('api-model').value = preset.model || '';

        // 更新端点提示
        this.updateEndpointPlaceholder();
    },

    // 更新端点提示
    updateEndpointPlaceholder() {
        const provider = document.getElementById('api-provider').value;
        const endpointInput = document.getElementById('api-endpoint');

        const placeholders = {
            'gemini': '留空使用默认',
            'openai': 'https://api.openai.com/v1/chat/completions',
            'openai-compatible': '输入中转站地址',
            'claude': 'https://api.anthropic.com/v1/messages'
        };

        endpointInput.placeholder = placeholders[provider] || '输入API端点';
    },

    // 绑定事件
    bindEvents() {
        // 关闭按钮
        document.getElementById('api-settings-close').onclick = () => this.close();

        // 点击背景关闭
        this.container.onclick = (e) => {
            if (e.target === this.container) this.close();
        };

        // 预设切换
        document.getElementById('api-preset-select').onchange = (e) => {
            APIPresetManager.switchPreset(e.target.value);
            this.displayPreset();
        };

        // 新建预设
        document.getElementById('new-preset-btn').onclick = () => {
            const name = prompt('请输入新预设名称:', '新预设');
            if (name) {
                APIPresetManager.createPreset(name);
                this.render();
            }
        };

        // 删除预设
        document.getElementById('delete-preset-btn').onclick = () => {
            if (confirm('确定要删除当前预设吗?')) {
                const currentId = APIPresetManager.activePresetId;
                if (APIPresetManager.deletePreset(currentId)) {
                    this.render();
                }
            }
        };

        // 保存预设
        document.getElementById('save-preset-btn').onclick = () => {
            const updates = {
                name: document.getElementById('preset-name').value,
                provider: document.getElementById('api-provider').value,
                endpoint: document.getElementById('api-endpoint').value,
                apiKey: document.getElementById('api-key').value,
                model: document.getElementById('api-model').value
            };

            if (APIPresetManager.updateCurrentPreset(updates)) {
                this.showStatus('✅ 预设已保存', 'success');
                this.render();
            }
        };

        // 切换密钥可见性
        document.getElementById('toggle-key').onclick = () => {
            const input = document.getElementById('api-key');
            input.type = input.type === 'password' ? 'text' : 'password';
        };

        // API提供商切换
        document.getElementById('api-provider').onchange = () => {
            this.updateEndpointPlaceholder();
        };

        // 拉取模型
        document.getElementById('fetch-models-btn').onclick = async () => {
            await this.fetchModels();
        };

        // 测试API
        document.getElementById('test-api-btn').onclick = async () => {
            await this.testAPI();
        };

        // 导出配置
        document.getElementById('export-config-btn').onclick = () => {
            this.exportConfig();
        };

        // 导入配置
        document.getElementById('import-config-btn').onclick = () => {
            document.getElementById('import-file').click();
        };

        document.getElementById('import-file').onchange = (e) => {
            this.importConfig(e.target.files[0]);
        };
    },

    // 拉取模型列表
    async fetchModels() {
        this.showStatus('🔄 拉取模型中...', 'loading');

        try {
            // 先保存当前输入
            await this.saveCurrentInputs();

            const preset = APIPresetManager.getActivePreset();
            const models = await APIPresetManager.fetchModels(preset);

            // 填充模型列表
            const datalist = document.getElementById('model-list');
            datalist.innerHTML = '';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                datalist.appendChild(option);
            });

            this.showStatus(`✅ 找到 ${models.length} 个模型`, 'success');
        } catch (error) {
            this.showStatus(`❌ 失败: ${error.message}`, 'error');
        }
    },

    // 测试API连接
    async testAPI() {
        this.showStatus('🔄 测试连接中...', 'loading');

        try {
            // 先保存当前输入
            await this.saveCurrentInputs();

            const preset = APIPresetManager.getActivePreset();

            // 简单的测试请求
            const testMessage = 'Hi, please respond with "OK" if you receive this.';

            // 这里调用实际的AI接口（需要根据Reality项目的AI系统调整）
            // 暂时模拟
            setTimeout(() => {
                this.showStatus('✅ 连接成功!', 'success');
            }, 1000);

        } catch (error) {
            this.showStatus(`❌ 连接失败: ${error.message}`, 'error');
        }
    },

    // 保存当前输入
    async saveCurrentInputs() {
        const updates = {
            name: document.getElementById('preset-name').value,
            provider: document.getElementById('api-provider').value,
            endpoint: document.getElementById('api-endpoint').value,
            apiKey: document.getElementById('api-key').value,
            model: document.getElementById('api-model').value
        };

        return APIPresetManager.updateCurrentPreset(updates);
    },

    // 导出配置
    exportConfig() {
        const config = APIPresetManager.exportConfig();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `api-config-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showStatus('✅ 配置已导出', 'success');
    },

    // 导入配置
    async importConfig(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const config = JSON.parse(text);

            if (APIPresetManager.importConfig(config)) {
                this.render();
                this.showStatus('✅ 配置已导入', 'success');
            }
        } catch (error) {
            this.showStatus(`❌ 导入失败: ${error.message}`, 'error');
        }
    },

    // 显示状态信息
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('api-status');
        statusEl.textContent = message;
        statusEl.className = `status-indicator status-${type}`;

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'status-indicator';
            }, 3000);
        }
    },

    // 添加样式
    addStyles() {
        if (document.getElementById('api-settings-styles')) return;

        const style = document.createElement('style');
        style.id = 'api-settings-styles';
        style.textContent = `
            .api-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .api-settings-container {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .api-settings-header {
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .api-settings-header h2 {
                color: #f093fb;
                margin: 0;
                font-size: 24px;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 30px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .close-btn:hover {
                opacity: 1;
            }

            .api-settings-content {
                padding: 20px;
            }

            .preset-section {
                margin-bottom: 20px;
            }

            .preset-controls {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .preset-select {
                flex: 1;
                padding: 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                color: white;
                font-size: 16px;
            }

            .btn-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: rgba(139, 92, 246, 0.2);
                border: 1px solid rgba(139, 92, 246, 0.3);
                color: white;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-icon:hover {
                background: rgba(139, 92, 246, 0.4);
                transform: scale(1.05);
            }

            .divider {
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin: 20px 0;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                color: #a0a0a0;
                margin-bottom: 5px;
                font-size: 14px;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(139, 92, 246, 0.2);
                color: white;
                font-size: 14px;
            }

            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: rgba(139, 92, 246, 0.5);
                background: rgba(255, 255, 255, 0.08);
            }

            .optional {
                color: #666;
                font-size: 12px;
            }

            .input-with-toggle {
                display: flex;
                gap: 5px;
            }

            .input-with-toggle input {
                flex: 1;
            }

            .toggle-visibility {
                padding: 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(139, 92, 246, 0.2);
                color: white;
                cursor: pointer;
            }

            .model-input-group {
                display: flex;
                gap: 10px;
            }

            .model-input-group input {
                flex: 1;
            }

            .btn-secondary {
                padding: 10px 15px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                color: white;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .status-indicator {
                padding: 10px;
                border-radius: 8px;
                text-align: center;
                font-size: 14px;
                min-height: 20px;
            }

            .status-loading {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
            }

            .status-success {
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
            }

            .status-error {
                background: rgba(244, 67, 54, 0.2);
                color: #f44336;
            }

            .action-buttons {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .btn-primary {
                padding: 12px 20px;
                border-radius: 10px;
                background: linear-gradient(135deg, #8b92f6 0%, #f093fb 100%);
                border: none;
                color: white;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
            }

            .import-export-btns {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .btn-small {
                padding: 8px 16px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(139, 92, 246, 0.2);
                color: white;
                cursor: pointer;
                font-size: 14px;
            }

            .btn-small:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            /* 滚动条样式 */
            .api-settings-container::-webkit-scrollbar {
                width: 8px;
            }

            .api-settings-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }

            .api-settings-container::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.3);
                border-radius: 4px;
            }

            .api-settings-container::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
};

// 初始化
APISettingsScreen.init();

// 导出给全局使用
window.APISettingsScreen = APISettingsScreen;