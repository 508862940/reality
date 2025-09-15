// API设置UI - 完全在页面内管理，无需控制台
// 参照yoyo项目实现

const APISettingsUI = {
    // 渲染设置界面
    render() {
        // 检查APIState是否存在
        if (typeof APIState === 'undefined' || !APIState.get) {
            console.warn('APIState 尚未加载');
            return;
        }

        const state = APIState.get();
        const activePreset = APIState.getActivePreset();

        // 更新预设选择下拉框
        const presetSelect = document.getElementById('api-preset-select');
        if (presetSelect) {
            presetSelect.innerHTML = '';
            state.apiConfig.presets.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
            presetSelect.value = state.apiConfig.activePresetId;
        }

        // 更新当前预设的表单
        if (activePreset) {
            const nameInput = document.getElementById('preset-name-input');
            const providerSelect = document.getElementById('api-provider-select');
            const endpointInput = document.getElementById('api-endpoint-input');
            const keyInput = document.getElementById('api-key-input');
            const modelInput = document.getElementById('api-model-input');

            if (nameInput) nameInput.value = activePreset.name || '';
            if (providerSelect) providerSelect.value = activePreset.provider || 'openai-compatible';
            if (endpointInput) endpointInput.value = activePreset.endpoint || '';
            if (keyInput) keyInput.value = activePreset.apiKey || '';
            if (modelInput) modelInput.value = activePreset.model || '';

            // 根据provider更新endpoint提示
            this.updateEndpointPlaceholder();
        }

        // 更新删除按钮状态
        const deleteBtn = document.getElementById('delete-preset-btn');
        if (deleteBtn) {
            deleteBtn.disabled = state.apiConfig.presets.length <= 1;
        }
    },

    // 更新endpoint输入框的提示和模型列表
    updateEndpointPlaceholder() {
        const providerSelect = document.getElementById('api-provider-select');
        const endpointInput = document.getElementById('api-endpoint-input');
        const modelInput = document.getElementById('api-model-input');
        const modelsList = document.getElementById('api-models-list');

        if (!providerSelect || !endpointInput) return;

        const provider = providerSelect.value;

        // 更新endpoint提示
        switch (provider) {
            case 'gemini':
                endpointInput.placeholder = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
                if (!endpointInput.value) {
                    endpointInput.value = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
                }
                break;
            case 'openai':
                endpointInput.placeholder = 'https://api.openai.com/v1/chat/completions';
                if (!endpointInput.value) {
                    endpointInput.value = 'https://api.openai.com/v1/chat/completions';
                }
                break;
            case 'openai-compatible':
                endpointInput.placeholder = '例如：https://api.example.com/v1/chat/completions';
                break;
        }

        // 更新模型列表
        if (modelsList) {
            modelsList.innerHTML = '';
            let models = [];

            switch (provider) {
                case 'gemini':
                    models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
                    if (modelInput && !modelInput.value) {
                        modelInput.value = 'gemini-pro';
                    }
                    break;
                case 'openai':
                case 'openai-compatible':
                    models = ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'];
                    if (modelInput && !modelInput.value) {
                        modelInput.value = 'gpt-3.5-turbo';
                    }
                    break;
            }

            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                modelsList.appendChild(option);
            });
        }
    },

    // 切换预设
    switchPreset() {
        if (typeof APIState === 'undefined' || !APIState.switchPreset) {
            console.warn('APIState 尚未加载');
            return;
        }

        const presetSelect = document.getElementById('api-preset-select');
        if (presetSelect) {
            APIState.switchPreset(presetSelect.value);
            this.render();
            this.showMessage('已切换预设', 'success');
        }
    },

    // 保存当前预设
    saveCurrentPreset() {
        if (typeof APIState === 'undefined' || !APIState.getActivePreset) {
            console.warn('APIState 尚未加载');
            return;
        }

        const state = APIState.get();
        const activePreset = APIState.getActivePreset();

        if (!activePreset) return;

        const nameInput = document.getElementById('preset-name-input');
        const providerSelect = document.getElementById('api-provider-select');
        const endpointInput = document.getElementById('api-endpoint-input');
        const keyInput = document.getElementById('api-key-input');
        const modelInput = document.getElementById('api-model-input');

        if (!nameInput || !providerSelect || !endpointInput || !keyInput || !modelInput) {
            console.error('表单元素未找到');
            return;
        }

        const updates = {
            name: nameInput.value.trim() || '未命名预设',
            provider: providerSelect.value,
            endpoint: endpointInput.value.trim(),
            apiKey: keyInput.value.trim(),
            model: modelInput.value.trim()
        };

        // 验证必填项
        if (!updates.apiKey) {
            this.showMessage('请填写API密钥', 'error');
            return;
        }

        if (!updates.endpoint) {
            this.showMessage('请填写API地址', 'error');
            return;
        }

        if (!updates.model) {
            this.showMessage('请填写模型名称', 'error');
            return;
        }

        APIState.updatePreset(activePreset.id, updates);
        this.render();
        this.showMessage('预设已保存并应用', 'success');
    },

    // 添加新预设
    addNewPreset() {
        if (typeof APIState === 'undefined' || !APIState.addPreset) {
            console.warn('APIState 尚未加载');
            return;
        }

        const name = prompt('请输入新预设的名称：', '新配置');
        if (name) {
            APIState.addPreset(name);
            this.render();
            this.showMessage('已添加新预设', 'success');
        }
    },

    // 删除当前预设
    deleteCurrentPreset() {
        if (typeof APIState === 'undefined' || !APIState.get) {
            console.warn('APIState 尚未加载');
            return;
        }

        const state = APIState.get();
        if (state.apiConfig.presets.length <= 1) {
            this.showMessage('不能删除最后一个预设', 'error');
            return;
        }

        if (confirm('确定要删除当前预设吗？')) {
            const activeId = state.apiConfig.activePresetId;
            APIState.deletePreset(activeId);
            this.render();
            this.showMessage('预设已删除', 'success');
        }
    },

    // 测试当前预设
    async testCurrentPreset() {
        if (typeof APIState === 'undefined' || !APIState.getActivePreset) {
            console.warn('APIState 尚未加载');
            return;
        }

        const activePreset = APIState.getActivePreset();
        if (!activePreset) {
            this.showMessage('没有激活的预设', 'error');
            return;
        }

        // 先保存当前配置
        this.saveCurrentPreset();

        this.showMessage('正在测试API...', 'info');

        const result = await APIState.testPreset(activePreset.id);
        if (result.success) {
            this.showMessage(`✅ 测试成功！AI回复: ${result.message}`, 'success');
        } else {
            this.showMessage(`❌ 测试失败: ${result.error}`, 'error');
        }
    },

    // 显示消息
    showMessage(message, type = 'info') {
        // 查找或创建消息容器
        let messageDiv = document.getElementById('api-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'api-message';
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                transition: opacity 0.3s;
                font-size: 14px;
                max-width: 300px;
            `;
            document.body.appendChild(messageDiv);
        }

        // 设置样式
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };

        messageDiv.style.backgroundColor = colors[type] || colors.info;
        messageDiv.style.color = type === 'warning' ? '#333' : 'white';
        messageDiv.textContent = message;
        messageDiv.style.opacity = '1';

        // 3秒后自动隐藏
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            if (messageDiv) {
                messageDiv.style.opacity = '0';
            }
        }, 3000);
    },

    // 打开设置面板
    open() {
        const panel = document.getElementById('api-settings-panel');
        if (panel) {
            panel.style.display = 'flex';
            this.render();
        }
    },

    // 关闭设置面板
    close() {
        const panel = document.getElementById('api-settings-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
};

// 绑定到全局
window.APISettingsUI = APISettingsUI;

// 覆盖原有的toggleAISettings函数（增加存在性检查）
window.toggleAISettings = function() {
    if (window.APISettingsUI && window.APISettingsUI.open) {
        APISettingsUI.open();
    }
};

// 关闭设置面板（增加存在性检查）
window.closeAPISettings = function() {
    if (window.APISettingsUI && window.APISettingsUI.close) {
        APISettingsUI.close();
    }
};

// 页面加载完成后绑定事件
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保所有脚本都已加载
    setTimeout(() => {
        // 绑定预设选择
        const presetSelect = document.getElementById('api-preset-select');
        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                if (window.APISettingsUI && window.APISettingsUI.switchPreset) {
                    APISettingsUI.switchPreset();
                }
            });
        }

        // 绑定provider选择
        const providerSelect = document.getElementById('api-provider-select');
        if (providerSelect) {
            providerSelect.addEventListener('change', () => {
                if (window.APISettingsUI && window.APISettingsUI.updateEndpointPlaceholder) {
                    APISettingsUI.updateEndpointPlaceholder();
                }
            });
        }

        // 为模型输入框添加点击事件，显示所有可选项
        const modelInput = document.getElementById('api-model-input');
        if (modelInput) {
            modelInput.addEventListener('click', function() {
                // 触发datalist显示
                this.setAttribute('list', 'api-models-list');
                this.focus();
            });

            modelInput.addEventListener('focus', function() {
                // 当获得焦点时，如果为空则显示占位符
                if (!this.value) {
                    const provider = document.getElementById('api-provider-select');
                    if (provider && provider.value === 'gemini') {
                        this.placeholder = '点击选择或输入：gemini-pro, gemini-1.5-pro...';
                    } else {
                        this.placeholder = '点击选择或输入：gpt-3.5-turbo, gpt-4...';
                    }
                }
            });
        }

        // 绑定按钮
        const addBtn = document.getElementById('add-preset-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (window.APISettingsUI && window.APISettingsUI.addNewPreset) {
                    APISettingsUI.addNewPreset();
                }
            });
        }

        const deleteBtn = document.getElementById('delete-preset-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (window.APISettingsUI && window.APISettingsUI.deleteCurrentPreset) {
                    APISettingsUI.deleteCurrentPreset();
                }
            });
        }

        const saveBtn = document.getElementById('save-preset-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (window.APISettingsUI && window.APISettingsUI.saveCurrentPreset) {
                    APISettingsUI.saveCurrentPreset();
                }
            });
        }

        const testBtn = document.getElementById('test-preset-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                if (window.APISettingsUI && window.APISettingsUI.testCurrentPreset) {
                    APISettingsUI.testCurrentPreset();
                }
            });
        }

        console.log('✅ API设置UI已初始化');
    }, 100); // 延迟100ms确保APIState已加载
});