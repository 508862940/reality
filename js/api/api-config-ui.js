// API配置UI管理
// 提供游戏内的配置界面

let currentEditIndex = -1;

// 打开API配置面板
function openAPIConfigPanel() {
    document.getElementById('api-config-panel').style.display = 'flex';
    loadConfigList();
}

// 关闭API配置面板
function closeAPIConfigPanel() {
    document.getElementById('api-config-panel').style.display = 'none';
}

// 加载配置列表
function loadConfigList() {
    const configs = apiManager.getAllConfigs();
    const container = document.getElementById('config-items');
    container.innerHTML = '';

    configs.forEach((config, index) => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.style.cssText = `
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: ${index === apiManager.currentConfigIndex ? '#e7f3ff' : '#f9f9f9'};
        `;

        const status = config.apiKey && config.baseURL ? '✅' : '⚠️';
        const current = index === apiManager.currentConfigIndex ? '⭐' : '';

        item.innerHTML = `
            <div>
                <strong>${current} ${config.name}</strong>
                <small style="color: #666;"> - ${config.service}</small>
                <span>${status}</span>
            </div>
            <div>
                <button onclick="editConfig(${index})" style="margin: 0 2px;">✏️</button>
                <button onclick="useConfig(${index})" style="margin: 0 2px;">▶️</button>
                <button onclick="testConfigByIndex(${index})" style="margin: 0 2px;">🧪</button>
                ${configs.length > 1 ? `<button onclick="deleteConfig(${index})" style="margin: 0 2px;">🗑️</button>` : ''}
            </div>
        `;

        container.appendChild(item);
    });
}

// 添加新配置
function addNewConfig() {
    currentEditIndex = -1;
    clearConfigEditor();
    document.getElementById('config-name').value = `配置 ${apiManager.configs.length + 1}`;
    document.getElementById('config-editor').scrollIntoView({ behavior: 'smooth' });
}

// 编辑配置
function editConfig(index) {
    currentEditIndex = index;
    const config = apiManager.configs[index];

    document.getElementById('config-name').value = config.name || '';
    document.getElementById('config-service').value = config.service || 'openai_proxy';
    document.getElementById('config-apikey').value = config.apiKey || '';
    document.getElementById('config-baseurl').value = config.baseURL || '';
    document.getElementById('config-model').value = config.model || 'gpt-3.5-turbo';

    document.getElementById('config-editor').scrollIntoView({ behavior: 'smooth' });
}

// 清空编辑器
function clearConfigEditor() {
    document.getElementById('config-name').value = '';
    document.getElementById('config-service').value = 'openai_proxy';
    document.getElementById('config-apikey').value = '';
    document.getElementById('config-baseurl').value = '';
    document.getElementById('config-model').value = 'gpt-3.5-turbo';
}

// 保存当前配置
function saveCurrentConfig() {
    const config = {
        name: document.getElementById('config-name').value || '未命名配置',
        service: document.getElementById('config-service').value,
        apiKey: document.getElementById('config-apikey').value,
        baseURL: document.getElementById('config-baseurl').value,
        model: document.getElementById('config-model').value
    };

    if (!config.apiKey || !config.baseURL) {
        alert('请填写API密钥和地址！');
        return;
    }

    if (currentEditIndex === -1) {
        // 添加新配置
        const index = apiManager.addConfig(config);
        alert(`✅ 配置"${config.name}"已添加！`);
        currentEditIndex = index;
    } else {
        // 更新现有配置
        apiManager.updateConfig(currentEditIndex, config);
        alert(`✅ 配置"${config.name}"已更新！`);
    }

    loadConfigList();
}

// 测试当前配置
async function testCurrentConfig() {
    const config = {
        apiKey: document.getElementById('config-apikey').value,
        baseURL: document.getElementById('config-baseurl').value,
        model: document.getElementById('config-model').value
    };

    if (!config.apiKey || !config.baseURL) {
        alert('请先填写API密钥和地址！');
        return;
    }

    const resultDiv = document.getElementById('test-result');
    const contentDiv = document.getElementById('test-result-content');

    resultDiv.style.display = 'block';
    contentDiv.innerHTML = '⏳ 正在测试...';

    try {
        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: '说"测试成功"' }],
                max_tokens: 50
            })
        });

        if (response.ok) {
            const data = await response.json();
            const message = data.choices?.[0]?.message?.content || '成功';
            contentDiv.innerHTML = `<div style="color: green;">✅ 测试成功！<br>AI回复: ${message}</div>`;
        } else {
            const error = await response.text();
            contentDiv.innerHTML = `<div style="color: red;">❌ 测试失败！<br>错误: ${error}</div>`;
        }
    } catch (error) {
        contentDiv.innerHTML = `<div style="color: red;">❌ 网络错误！<br>${error.message}</div>`;
    }
}

// 测试指定配置
async function testConfigByIndex(index) {
    const result = await apiManager.testConfig(index);
    if (result.success) {
        alert(`✅ 配置测试成功！\nAI回复: ${result.message}`);
    } else {
        alert(`❌ 配置测试失败！\n错误: ${result.error}`);
    }
}

// 应用当前配置
function applyCurrentConfig() {
    if (currentEditIndex === -1) {
        alert('请先保存配置！');
        return;
    }

    apiManager.switchConfig(currentEditIndex);
    alert('✅ 配置已应用到游戏！');
    loadConfigList();
}

// 使用配置
function useConfig(index) {
    apiManager.switchConfig(index);
    alert(`✅ 已切换到配置: ${apiManager.configs[index].name}`);
    loadConfigList();
}

// 删除配置
function deleteConfig(index) {
    if (confirm(`确定要删除配置"${apiManager.configs[index].name}"吗？`)) {
        if (apiManager.deleteConfig(index)) {
            alert('✅ 配置已删除');
            loadConfigList();
        } else {
            alert('❌ 无法删除最后一个配置');
        }
    }
}

// 切换密码可见性
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// 修改原有的toggleAISettings函数
function toggleAISettings() {
    openAPIConfigPanel();
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }

    .modal-header h2 {
        margin: 0;
        color: #333;
    }

    .close-btn {
        font-size: 30px;
        cursor: pointer;
        color: #999;
        line-height: 20px;
    }

    .close-btn:hover {
        color: #333;
    }

    .form-group {
        margin: 15px 0;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #555;
    }

    .form-group input,
    .form-group select {
        width: calc(100% - 50px);
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    .button-group {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    .btn-primary,
    .btn-success,
    .btn-info,
    .btn-warning {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        font-weight: bold;
    }

    .btn-primary {
        background: #007bff;
    }

    .btn-success {
        background: #28a745;
    }

    .btn-info {
        background: #17a2b8;
    }

    .btn-warning {
        background: #ffc107;
        color: #333;
    }

    .config-item {
        transition: background 0.3s;
    }

    .config-item:hover {
        background: #f0f0f0 !important;
    }

    #test-result {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
        border: 1px solid #dee2e6;
    }

    #test-result h3 {
        margin-top: 0;
        color: #495057;
    }
`;
document.head.appendChild(style);

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 API配置UI已加载');

    // 添加快捷键
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+A 打开API配置
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            openAPIConfigPanel();
        }
        // ESC关闭配置面板
        if (e.key === 'Escape') {
            closeAPIConfigPanel();
        }
    });

    // 自动迁移旧配置
    const oldConfig = localStorage.getItem('ai_config');
    if (oldConfig) {
        try {
            const config = JSON.parse(oldConfig);
            if (config.apiKey && config.baseUrl) {
                console.log('🔄 发现旧配置，自动迁移...');
                if (apiManager.configs[0] && !apiManager.configs[0].apiKey) {
                    apiManager.updateConfig(0, {
                        name: '迁移的配置',
                        apiKey: config.apiKey,
                        baseURL: config.baseUrl || config.baseURL,
                        model: config.model || 'gpt-3.5-turbo',
                        service: 'openai_proxy',
                        enabled: true
                    });
                    console.log('✅ 旧配置已成功迁移');
                }
            }
        } catch (error) {
            console.error('迁移旧配置失败:', error);
        }
    }
});

console.log('💡 提示: 点击"AI设置"按钮或按 Ctrl+Shift+A 打开配置面板');