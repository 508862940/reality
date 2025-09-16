// API设置界面 - 基于yoyo项目的预设系统
const APISettingsUI = {
    // 渲染设置界面
    render() {
        const modal = document.getElementById('api-config-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="api-settings-container">
                <div class="api-settings-header">
                    <h2>🤖 AI服务配置</h2>
                    <button class="close-btn" onclick="APISettingsUI.close()">×</button>
                </div>

                <div class="api-settings-body">
                    <!-- 预设选择 -->
                    <div class="preset-section">
                        <div class="preset-selector">
                            <select id="preset-select" onchange="APISettingsUI.onPresetChange()">
                                ${this.renderPresetOptions()}
                            </select>
                            <button onclick="APISettingsUI.addPreset()" class="btn-small">➕ 新建</button>
                            <button onclick="APISettingsUI.deletePreset()" class="btn-small btn-danger">🗑️ 删除</button>
                        </div>
                    </div>

                    <!-- 配置详情 -->
                    <div class="config-section">
                        <div class="form-group">
                            <label>预设名称</label>
                            <input type="text" id="preset-name" placeholder="给预设起个名字">
                        </div>

                        <div class="form-group">
                            <label>服务提供商</label>
                            <select id="provider-select" onchange="APISettingsUI.onProviderChange()">
                                <option value="openai">OpenAI 官方</option>
                                <option value="openai_compatible">OpenAI 兼容 (中转/代理)</option>
                                <option value="claude">Claude (Anthropic)</option>
                                <option value="gemini">Google Gemini</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>API密钥</label>
                            <input type="password" id="api-key" placeholder="输入你的API密钥">
                        </div>

                        <div class="form-group" id="endpoint-group">
                            <label>API端点</label>
                            <input type="text" id="api-endpoint" placeholder="https://api.example.com/v1/chat/completions">
                        </div>

                        <div class="form-group">
                            <label>模型</label>
                            <div class="input-with-button">
                                <input type="text" id="model-name" placeholder="例如: gpt-3.5-turbo" list="model-list">
                                <datalist id="model-list"></datalist>
                                <button onclick="APISettingsUI.fetchModels()" class="btn-small">获取列表</button>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button onclick="APISettingsUI.testConnection()" class="btn btn-test">🧪 测试连接</button>
                        <button onclick="APISettingsUI.save()" class="btn btn-primary">💾 保存配置</button>
                    </div>

                    <!-- 导入导出 -->
                    <div class="import-export-section">
                        <button onclick="APISettingsUI.exportConfig()" class="btn-small">📥 导出配置</button>
                        <button onclick="APISettingsUI.importConfig()" class="btn-small">📤 导入配置</button>
                    </div>

                    <!-- 状态显示 -->
                    <div id="status-message" class="status-message"></div>
                </div>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('api-settings-style')) {
            const style = document.createElement('style');
            style.id = 'api-settings-style';
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }

        // 加载当前配置
        this.loadCurrentPreset();
    },

    // 渲染预设选项
    renderPresetOptions() {
        if (!window.APIConfig) return '';
        const presets = window.APIConfig.getAllPresets();
        const currentId = window.APIConfig.activePresetId;

        return presets.map(preset =>
            `<option value="${preset.id}" ${preset.id === currentId ? 'selected' : ''}>
                ${preset.name} ${preset.apiKey ? '✅' : '❌'}
            </option>`
        ).join('');
    },

    // 加载当前预设
    loadCurrentPreset() {
        if (!window.APIConfig) return;
        const preset = window.APIConfig.getCurrentPreset();
        if (!preset) return;

        document.getElementById('preset-name').value = preset.name || '';
        document.getElementById('provider-select').value = preset.provider || 'openai';
        document.getElementById('api-key').value = preset.apiKey || '';
        document.getElementById('api-endpoint').value = preset.endpoint || '';
        document.getElementById('model-name').value = preset.model || '';

        this.onProviderChange();
    },

    // 预设变更
    async onPresetChange() {
        const select = document.getElementById('preset-select');
        await window.APIConfig.switchPreset(select.value);
        this.loadCurrentPreset();
    },

    // 提供商变更
    onProviderChange() {
        const provider = document.getElementById('provider-select').value;
        const endpointGroup = document.getElementById('endpoint-group');

        // 根据提供商调整界面
        switch(provider) {
            case 'gemini':
                endpointGroup.style.display = 'none';
                document.getElementById('model-name').placeholder = 'gemini-1.5-flash-latest';
                break;
            case 'openai':
                endpointGroup.style.display = 'block';
                document.getElementById('api-endpoint').placeholder = 'https://api.openai.com/v1/chat/completions';
                document.getElementById('api-endpoint').value = 'https://api.openai.com/v1/chat/completions';
                document.getElementById('model-name').placeholder = 'gpt-3.5-turbo';
                break;
            case 'openai_compatible':
                endpointGroup.style.display = 'block';
                document.getElementById('api-endpoint').placeholder = '输入中转API地址 (如: https://api.example.com/v1/chat/completions)';
                document.getElementById('api-endpoint').value = '';
                document.getElementById('model-name').placeholder = 'gpt-3.5-turbo 或其他支持的模型';
                break;
            case 'claude':
                endpointGroup.style.display = 'block';
                document.getElementById('api-endpoint').placeholder = 'https://api.anthropic.com/v1/messages';
                document.getElementById('api-endpoint').value = 'https://api.anthropic.com/v1/messages';
                document.getElementById('model-name').placeholder = 'claude-3-sonnet-20240229';
                break;
        }
    },

    // 添加预设
    async addPreset() {
        const name = prompt('请输入新预设的名称:');
        if (!name) return;

        const id = await window.APIConfig.addPreset({ name });
        await window.APIConfig.switchPreset(id);
        this.render();
        this.showStatus('✅ 新预设已创建', 'success');
    },

    // 删除预设
    async deletePreset() {
        if (!confirm('确定要删除当前预设吗？')) return;

        const currentId = window.APIConfig.activePresetId;
        const success = await window.APIConfig.deletePreset(currentId);

        if (success) {
            this.render();
            this.showStatus('✅ 预设已删除', 'success');
        } else {
            this.showStatus('❌ 无法删除最后一个预设', 'error');
        }
    },

    // 保存配置
    async save() {
        const currentId = window.APIConfig.activePresetId;
        const updates = {
            name: document.getElementById('preset-name').value,
            provider: document.getElementById('provider-select').value,
            apiKey: document.getElementById('api-key').value,
            endpoint: document.getElementById('api-endpoint').value,
            model: document.getElementById('model-name').value
        };

        const success = await window.APIConfig.updatePreset(currentId, updates);
        if (success) {
            this.showStatus('✅ 配置已保存', 'success');
            // 更新预设选择器
            document.getElementById('preset-select').innerHTML = this.renderPresetOptions();
        } else {
            this.showStatus('❌ 保存失败', 'error');
        }
    },

    // 测试连接
    async testConnection() {
        this.showStatus('🔄 测试中...', 'info');

        // 先保存当前配置
        await this.save();

        const result = await window.APIConfig.testPreset();
        if (result.success) {
            this.showStatus('✅ 连接成功！', 'success');
        } else {
            this.showStatus(`❌ 连接失败: ${result.error}`, 'error');
        }
    },

    // 获取模型列表
    async fetchModels() {
        this.showStatus('🔄 获取模型列表...', 'info');

        // 先保存当前配置
        await this.save();

        const result = await window.APIConfig.fetchModels();
        if (result.success) {
            const datalist = document.getElementById('model-list');
            datalist.innerHTML = result.models.map(m =>
                `<option value="${m.id}">${m.name}</option>`
            ).join('');
            this.showStatus(`✅ 获取到 ${result.models.length} 个模型`, 'success');
        } else {
            this.showStatus(`❌ 获取失败: ${result.error}`, 'error');
        }
    },

    // 导出配置
    exportConfig() {
        window.APIConfig.exportConfig();
        this.showStatus('✅ 配置已导出', 'success');
    },

    // 导入配置
    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const success = await window.APIConfig.importConfig(file);
            if (success) {
                this.render();
                this.showStatus('✅ 配置已导入', 'success');
            }
        };
        input.click();
    },

    // 显示状态消息
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        if (!statusEl) return;

        statusEl.className = `status-message status-${type}`;
        statusEl.textContent = message;

        // 3秒后自动隐藏
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 3000);
    },

    // 关闭界面
    close() {
        const modal = document.getElementById('api-config-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // 打开界面
    open() {
        const modal = document.getElementById('api-config-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.render();
        }
    },

    // 样式
    getStyles() {
        return `
            .api-settings-container {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }

            .api-settings-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .api-settings-header h2 {
                margin: 0;
                color: #333;
            }

            .api-settings-body {
                padding: 20px;
            }

            .preset-section {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }

            .preset-selector {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .preset-selector select {
                flex: 1;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 6px;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #666;
                font-size: 14px;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
            }

            .input-with-button {
                display: flex;
                gap: 10px;
            }

            .input-with-button input {
                flex: 1;
            }

            .btn-small {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                background: #007bff;
                color: white;
                cursor: pointer;
                font-size: 12px;
            }

            .btn-small:hover {
                background: #0056b3;
            }

            .btn-danger {
                background: #dc3545;
            }

            .btn-danger:hover {
                background: #c82333;
            }

            .action-buttons {
                display: flex;
                gap: 10px;
                margin: 20px 0;
            }

            .btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
            }

            .btn-test {
                background: #6c757d;
                color: white;
            }

            .btn-primary {
                background: #28a745;
                color: white;
            }

            .import-export-section {
                display: flex;
                gap: 10px;
                justify-content: center;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }

            .status-message {
                margin-top: 15px;
                padding: 10px;
                border-radius: 6px;
                text-align: center;
                font-size: 14px;
            }

            .status-success {
                background: #d4edda;
                color: #155724;
            }

            .status-error {
                background: #f8d7da;
                color: #721c24;
            }

            .status-info {
                background: #d1ecf1;
                color: #0c5460;
            }

            #api-config-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
        `;
    }
};

// 导出到全局
window.APISettingsUI = APISettingsUI;

// 绑定到menu.js的函数
window.openAPISettings = function() {
    APISettingsUI.open();
};