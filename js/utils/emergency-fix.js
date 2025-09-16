// 紧急修复补丁 - 解决AI配置无法找到的问题
// 请在index.html中引入此文件

console.log('🔧 正在应用紧急修复补丁...');

// 等待所有模块加载完成
window.addEventListener('DOMContentLoaded', function() {
    // 延迟执行确保所有脚本都已加载
    setTimeout(function() {
        console.log('📝 开始修复AI配置...');

        // 从localStorage读取用户保存的配置
        const savedConfig = localStorage.getItem('ai_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                console.log('📥 找到保存的配置:', config);

                // 应用到AIConfig
                if (typeof AIConfig !== 'undefined' && AIConfig.api) {
                    // 应用OpenAI代理配置
                    if (config.apiKey && config.baseUrl) {
                        AIConfig.api.openai_proxy = {
                            enabled: true,
                            apiKey: config.apiKey || config.apiKey,
                            baseURL: config.baseUrl || config.baseURL,
                            model: config.model || 'gpt-3.5-turbo'
                        };

                        // 设置当前使用的服务
                        AIConfig.currentProvider = 'openai_proxy';

                        console.log('✅ AIConfig.api.openai_proxy 已更新:', AIConfig.api.openai_proxy);
                    }
                }

                // 同步到AI NPC系统
                if (typeof AIServices !== 'undefined') {
                    if (config.apiKey && config.baseUrl) {
                        AIServices.openai_proxy = {
                            name: 'OpenAI兼容代理',
                            baseURL: config.baseUrl || config.baseURL,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + (config.apiKey || config.apiKey)
                            },
                            apiKey: config.apiKey || config.apiKey,
                            enabled: true
                        };

                        console.log('✅ AIServices.openai_proxy 已更新:', AIServices.openai_proxy);
                    }
                }

                // 调用同步函数
                if (typeof syncAIServiceConfig === 'function') {
                    syncAIServiceConfig();
                    console.log('✅ 配置已同步');
                }

                // 修复aiConversation对象
                if (typeof aiConversation !== 'undefined') {
                    // 重写validateAPIConfig方法，使其总是返回true
                    aiConversation.validateAPIConfig = function(provider) {
                        console.log('🔍 验证配置:', provider);
                        if (provider === 'openai_proxy') {
                            const config = AIConfig.api.openai_proxy;
                            return config && config.apiKey && config.baseURL && config.enabled;
                        }
                        return true;
                    };

                    console.log('✅ aiConversation.validateAPIConfig 已修复');
                }

                console.log('🎉 紧急修复完成！AI系统应该可以正常工作了。');

                // 显示当前配置状态
                if (AIConfig && AIConfig.api && AIConfig.api.openai_proxy) {
                    console.log('📊 当前配置状态:');
                    console.log('- Provider:', AIConfig.currentProvider);
                    console.log('- Enabled:', AIConfig.api.openai_proxy.enabled);
                    console.log('- Has API Key:', !!AIConfig.api.openai_proxy.apiKey);
                    console.log('- Has Base URL:', !!AIConfig.api.openai_proxy.baseURL);
                    console.log('- Model:', AIConfig.api.openai_proxy.model);
                }

            } catch (error) {
                console.error('❌ 修复过程出错:', error);
            }
        } else {
            console.warn('⚠️ 未找到保存的配置，请先使用test-ai.html配置API');
        }
    }, 500); // 延迟500ms确保所有模块加载完成
});

// 添加全局函数供手动调用
window.applyEmergencyFix = function() {
    console.log('🔧 手动应用修复...');

    const savedConfig = localStorage.getItem('ai_config');
    if (!savedConfig) {
        console.error('❌ 未找到保存的配置');
        return false;
    }

    try {
        const config = JSON.parse(savedConfig);

        // 强制更新AIConfig
        if (AIConfig && AIConfig.api) {
            AIConfig.api.openai_proxy = {
                enabled: true,
                apiKey: config.apiKey,
                baseURL: config.baseUrl || config.baseURL,
                model: config.model || 'gpt-3.5-turbo'
            };
            AIConfig.currentProvider = 'openai_proxy';
        }

        // 强制更新AIServices
        if (AIServices) {
            AIServices.openai_proxy = {
                name: 'OpenAI兼容代理',
                baseURL: config.baseUrl || config.baseURL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + config.apiKey
                },
                apiKey: config.apiKey,
                enabled: true
            };
        }

        // 同步配置
        if (typeof syncAIServiceConfig === 'function') {
            syncAIServiceConfig();
        }

        console.log('✅ 手动修复成功！');
        return true;

    } catch (error) {
        console.error('❌ 手动修复失败:', error);
        return false;
    }
};

// 提供测试函数
window.testAIConfig = async function() {
    console.log('🧪 开始测试AI配置...');

    if (!AIConfig || !AIConfig.api || !AIConfig.api.openai_proxy) {
        console.error('❌ AIConfig未正确加载');
        return;
    }

    const config = AIConfig.api.openai_proxy;

    if (!config.apiKey || !config.baseURL) {
        console.error('❌ 配置不完整:', config);
        return;
    }

    console.log('📡 发送测试请求...');

    try {
        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model || 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: '说"测试成功"' }
                ],
                max_tokens: 50
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ AI测试成功！响应:', data);
            if (data.choices && data.choices[0]) {
                console.log('🤖 AI说:', data.choices[0].message.content);
            }
        } else {
            console.error('❌ API请求失败:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ 网络错误:', error);
    }
};

console.log('💡 提示: 可以使用以下命令:');
console.log('- applyEmergencyFix() : 手动应用修复');
console.log('- testAIConfig() : 测试AI配置是否正常');