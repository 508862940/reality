// API配置示例文件
// 请复制此文件为 api-config.js 并填入您的实际配置

// ⚠️ 重要：请将此示例复制为 api-config.js 并填入您的实际API密钥
// api-config.js 已在 .gitignore 中，不会被提交到Git

const API_CONFIG = {
    // OpenAI兼容代理配置（推荐）
    OPENAI_PROXY: {
        // 示例配置 - 请替换为您的实际值
        API_KEY: 'sk-xxxxxxxxxxxxxxxxxxxxx',  // 您的API密钥
        BASE_URL: 'https://api.openai-proxy.com/v1/chat/completions',  // 您的代理地址
        MODEL: 'gpt-3.5-turbo'
    },

    // 原生OpenAI配置
    OPENAI: {
        API_KEY: '',  // 如果使用原生OpenAI，在这里填入密钥
        MODEL: 'gpt-3.5-turbo'
    },

    // Google Gemini配置
    GEMINI: {
        API_KEY: '',  // 如果使用Gemini，在这里填入密钥
        MODEL: 'gemini-pro'
    },

    // Anthropic Claude配置
    CLAUDE: {
        API_KEY: '',  // 如果使用Claude，在这里填入密钥
        MODEL: 'claude-3-sonnet-20240229'
    }
};

// 自动应用配置
if (typeof window !== 'undefined') {
    // 立即应用配置，不等待DOMContentLoaded
    function applyAPIConfig() {
        // 应用配置到AIConfig
        if (typeof AIConfig !== 'undefined') {
            // OpenAI代理配置
            if (API_CONFIG.OPENAI_PROXY.API_KEY && API_CONFIG.OPENAI_PROXY.BASE_URL) {
                AIConfig.api.openai_proxy.apiKey = API_CONFIG.OPENAI_PROXY.API_KEY;
                AIConfig.api.openai_proxy.baseURL = API_CONFIG.OPENAI_PROXY.BASE_URL;
                AIConfig.api.openai_proxy.model = API_CONFIG.OPENAI_PROXY.MODEL;
                AIConfig.api.openai_proxy.enabled = true;
                console.log('✅ OpenAI代理配置已加载');
            }

            // OpenAI配置
            if (API_CONFIG.OPENAI.API_KEY) {
                AIConfig.api.openai.apiKey = API_CONFIG.OPENAI.API_KEY;
                AIConfig.api.openai.model = API_CONFIG.OPENAI.MODEL;
                AIConfig.api.openai.enabled = true;
                console.log('✅ OpenAI配置已加载');
            }

            // Gemini配置
            if (API_CONFIG.GEMINI.API_KEY) {
                AIConfig.api.gemini.apiKey = API_CONFIG.GEMINI.API_KEY;
                AIConfig.api.gemini.model = API_CONFIG.GEMINI.MODEL;
                AIConfig.api.gemini.enabled = true;
                console.log('✅ Gemini配置已加载');
            }

            // Claude配置
            if (API_CONFIG.CLAUDE.API_KEY) {
                AIConfig.api.claude.apiKey = API_CONFIG.CLAUDE.API_KEY;
                AIConfig.api.claude.model = API_CONFIG.CLAUDE.MODEL;
                AIConfig.api.claude.enabled = true;
                console.log('✅ Claude配置已加载');
            }

            // 同步到AI NPC系统
            if (typeof syncAIServiceConfig === 'function') {
                syncAIServiceConfig();
                console.log('✅ 配置已同步到AI NPC系统');
            }
        }
    }

    // 尝试立即应用
    applyAPIConfig();

    // 确保在页面加载后也应用
    window.addEventListener('DOMContentLoaded', applyAPIConfig);

    // 导出函数供手动调用
    window.applyAPIConfig = applyAPIConfig;
}