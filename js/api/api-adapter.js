// API适配器 - 连接新的预设系统和游戏引擎
// 提供统一的AI调用接口

const APIAdapter = {
    // 发送消息到AI
    async sendMessage(message, options = {}) {
        const preset = APIPresetManager.getActivePreset();

        if (!preset || !preset.apiKey) {
            console.error('请先配置API');
            return '请先在设置中配置API密钥';
        }

        try {
            // 根据不同的提供商调用不同的API
            switch (preset.provider) {
                case 'gemini':
                    return await this.callGemini(message, preset, options);
                case 'openai':
                case 'openai-compatible':
                    return await this.callOpenAI(message, preset, options);
                case 'claude':
                    return await this.callClaude(message, preset, options);
                default:
                    throw new Error(`不支持的API提供商: ${preset.provider}`);
            }
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    },

    // 调用Gemini API
    async callGemini(message, preset, options) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${preset.model}:generateContent?key=${preset.apiKey}`;

        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: message }]
                }
            ],
            generationConfig: {
                temperature: options.temperature || 0.9,
                maxOutputTokens: options.maxTokens || 1000,
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        // 添加历史记录（如果有）
        if (options.history && options.history.length > 0) {
            const formattedHistory = options.history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));
            requestBody.contents.unshift(...formattedHistory);
        }

        // 添加系统提示（如果有）
        if (options.systemPrompt) {
            requestBody.systemInstruction = {
                parts: [{ text: options.systemPrompt }]
            };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '无响应';
    },

    // 调用OpenAI API
    async callOpenAI(message, preset, options) {
        const endpoint = preset.endpoint || 'https://api.openai.com/v1/chat/completions';

        const messages = [];

        // 添加系统提示
        if (options.systemPrompt) {
            messages.push({
                role: 'system',
                content: options.systemPrompt
            });
        }

        // 添加历史记录
        if (options.history && options.history.length > 0) {
            messages.push(...options.history);
        }

        // 添加当前消息
        messages.push({
            role: 'user',
            content: message
        });

        const requestBody = {
            model: preset.model || 'gpt-3.5-turbo',
            messages: messages,
            temperature: options.temperature || 0.9,
            max_tokens: options.maxTokens || 1000,
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${preset.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '无响应';
    },

    // 调用Claude API
    async callClaude(message, preset, options) {
        const endpoint = preset.endpoint || 'https://api.anthropic.com/v1/messages';

        const messages = [];

        // 添加历史记录
        if (options.history && options.history.length > 0) {
            messages.push(...options.history);
        }

        // 添加当前消息
        messages.push({
            role: 'user',
            content: message
        });

        const requestBody = {
            model: preset.model || 'claude-3-sonnet-20240229',
            messages: messages,
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.9
        };

        // 添加系统提示
        if (options.systemPrompt) {
            requestBody.system = options.systemPrompt;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': preset.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0]?.text || '无响应';
    },

    // 格式化历史记录（统一格式）
    formatHistory(history, format = 'standard') {
        if (!history || history.length === 0) return [];

        return history.map(msg => {
            if (typeof msg === 'string') {
                return { role: 'user', content: msg };
            }
            return {
                role: msg.role || 'user',
                content: msg.content || msg.text || msg.message || ''
            };
        });
    }
};

// 为游戏引擎提供的简化接口
window.AIChat = {
    // 发送消息（简化版）
    async send(message) {
        return await APIAdapter.sendMessage(message);
    },

    // 发送带上下文的消息
    async sendWithContext(message, context) {
        return await APIAdapter.sendMessage(message, {
            systemPrompt: context.systemPrompt,
            history: context.history
        });
    },

    // NPC对话
    async npcChat(npcName, message, personality) {
        const systemPrompt = `你是${npcName}。${personality}`;
        return await APIAdapter.sendMessage(message, {
            systemPrompt: systemPrompt,
            temperature: 0.8
        });
    },

    // 获取当前配置状态
    isConfigured() {
        const preset = APIPresetManager.getActivePreset();
        return preset && preset.apiKey && preset.model;
    },

    // 获取当前预设信息
    getCurrentPreset() {
        return APIPresetManager.getActivePreset();
    }
};

// 导出给全局使用
window.APIAdapter = APIAdapter;