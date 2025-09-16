// AI配置
const AIConfig = {
    // API配置 - 你可以选择不同的AI服务
    api: {
        // OpenAI配置
        openai: {
            enabled: false,
            apiKey: '', // 在这里填入你的API密钥
            model: 'gpt-3.5-turbo',
            baseURL: 'https://api.openai.com/v1/chat/completions'
        },
        
        // Google Gemini配置
        gemini: {
            enabled: false,
            apiKey: '', // 在这里填入你的API密钥
            model: 'gemini-pro',
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        },
        
        // 通义千问配置（国内推荐）
        qwen: {
            enabled: false,
            apiKey: '', // 在这里填入你的API密钥
            model: 'qwen-turbo',
            baseURL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
        },
        
        // 本地AI配置（如果有本地部署的AI服务）
        local: {
            enabled: true, // 默认启用本地模式
            baseURL: 'http://localhost:11434/api/generate', // Ollama默认地址
            model: 'llama2'
        },
        
        // OpenAI兼容代理配置
        openai_proxy: {
            enabled: true, // 启用代理
            apiKey: '', // 用户配置
            model: 'gpt-3.5-turbo',
            baseURL: '' // 用户配置代理地址
        },
        
        // Anthropic Claude配置
        claude: {
            enabled: false,
            apiKey: '', // 在这里填入你的API密钥
            model: 'claude-3-sonnet-20240229',
            baseURL: 'https://api.anthropic.com/v1/messages'
        }
    },
    
    // 当前使用的AI服务
    currentProvider: 'openai_proxy', // 使用OpenAI代理
    
    // AI角色设定
    npcPersonalities: {
        teacher: {
            name: '张老师',
            personality: '温和但严格的数学老师，喜欢鼓励学生，但也会指出错误。说话比较正式，有时会引用数学概念。',
            greeting: '你好，同学！今天有什么数学问题需要帮助吗？'
        },
        student: {
            name: '小明',
            personality: '活泼开朗的同学，喜欢运动和游戏。说话比较随意，经常用网络用语。',
            greeting: '嘿！你也在这里啊！要不要一起去玩？'
        },
        shopkeeper: {
            name: '李老板',
            personality: '热情的商店老板，总是想推销商品。说话比较商业，但很友善。',
            greeting: '欢迎光临！今天有什么需要的吗？我们店里的商品都很不错哦！'
        },
        stranger: {
            name: '神秘人',
            personality: '在公园里遇到的陌生人，说话比较神秘，喜欢问哲学问题。',
            greeting: '年轻人，你在这里寻找什么呢？'
        }
    },
    
    // 游戏场景设定
    gameContext: {
        setting: '一个现代的小镇，有学校、商店、公园等地点。玩家是一个学生。',
        tone: '轻松愉快的校园生活模拟，适合所有年龄段的玩家。',
        language: '中文',
        style: '互动小说游戏，注重角色扮演和选择后果。'
    }
};

// AI对话管理类
class AIConversation {
    constructor() {
        this.conversationHistory = [];
        this.isProcessing = false;
    }

    // 验证API配置
    validateAPIConfig(provider) {
        const config = AIConfig.api[provider];
        if (!config) {
            console.error('AI服务配置不存在:', provider);
            return false;
        }

        if (!config.enabled) {
            console.error('AI服务未启用:', provider);
            return false;
        }

        // 验证必需的配置项
        switch (provider) {
            case 'openai_proxy':
            case 'openai':
                if (!config.apiKey || !config.baseURL) {
                    console.error('OpenAI配置缺失: apiKey或baseURL为空');
                    return false;
                }
                break;
            case 'gemini':
                if (!config.apiKey) {
                    console.error('Gemini配置缺失: apiKey为空');
                    return false;
                }
                break;
            case 'claude':
                if (!config.apiKey) {
                    console.error('Claude配置缺失: apiKey为空');
                    return false;
                }
                break;
            case 'qwen':
                if (!config.apiKey) {
                    console.error('通义千问配置缺失: apiKey为空');
                    return false;
                }
                break;
            case 'local':
                if (!config.baseURL) {
                    console.error('本地AI配置缺失: baseURL为空');
                    return false;
                }
                break;
            default:
                console.error('未知的AI服务:', provider);
                return false;
        }

        return true;
    }
    
    // 生成AI对话
    async generateResponse(npcType, playerMessage = '', context = {}) {
        if (this.isProcessing) {
            return '请稍等，我正在思考...';
        }
        
        this.isProcessing = true;
        
        try {
            const npc = AIConfig.npcPersonalities[npcType];
            const prompt = this.buildPrompt(npc, playerMessage, context);
            
            const response = await this.callAI(prompt);
            this.conversationHistory.push({
                npc: npc.name,
                message: playerMessage,
                response: response,
                timestamp: Date.now()
            });
            
            return response;
        } catch (error) {
            console.error('AI对话生成失败:', error);
            return '抱歉，我现在无法回应。请稍后再试。';
        } finally {
            this.isProcessing = false;
        }
    }
    
    // 构建AI提示词
    buildPrompt(npc, playerMessage, context) {
        const systemPrompt = `你是${npc.name}，${npc.personality}

游戏设定：${AIConfig.gameContext.setting}
游戏风格：${AIConfig.gameContext.tone}
语言：${AIConfig.gameContext.language}

请以${npc.name}的身份回应，保持角色的一致性。回应应该：
1. 符合角色的性格设定
2. 简短有趣（1-2句话）
3. 可能包含互动选项或建议
4. 适合游戏环境

当前地点：${context.location || '未知'}
玩家状态：体力${context.health || 100}，心情${context.mood || 50}，金钱${context.money || 100}`;

        const userPrompt = playerMessage ? 
            `玩家说："${playerMessage}"` : 
            `玩家来到了你所在的地方，请主动打招呼。`;

        return {
            system: systemPrompt,
            user: userPrompt
        };
    }
    
    // 调用AI API
    async callAI(prompt) {
        // 验证当前AI服务配置
        if (!this.validateAPIConfig(AIConfig.currentProvider)) {
            console.error('当前AI服务配置无效，尝试使用本地AI');
            // 尝试使用本地AI作为备用
            if (AIConfig.currentProvider !== 'local' && this.validateAPIConfig('local')) {
                return await this.callLocal(prompt);
            }
            return this.getFallbackResponse(prompt.user);
        }

        const config = AIConfig.api[AIConfig.currentProvider];
        
        if (!config) {
            console.error('AI配置未找到:', AIConfig.currentProvider);
            return this.getFallbackResponse(prompt.user);
        }
        
        if (!config.enabled) {
            console.log('AI服务未启用:', AIConfig.currentProvider);
            return this.getFallbackResponse(prompt.user);
        }
        
        switch (AIConfig.currentProvider) {
            case 'local':
                return await this.callLocalAI(prompt);
            case 'openai':
                return await this.callOpenAI(prompt);
            case 'openai_proxy':
                return await this.callOpenAIProxy(prompt);
            case 'gemini':
                return await this.callGemini(prompt);
            case 'claude':
                return await this.callClaude(prompt);
            case 'qwen':
                return await this.callQwen(prompt);
            default:
                return this.getFallbackResponse(prompt.user);
        }
    }
    
    // 本地AI调用（Ollama）
    async callLocalAI(prompt) {
        try {
            const response = await fetch(AIConfig.api.local.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: AIConfig.api.local.model,
                    prompt: `${prompt.system}\n\n${prompt.user}`,
                    stream: false
                })
            });
            
            const data = await response.json();
            return data.response || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('本地AI调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // OpenAI调用
    async callOpenAI(prompt) {
        try {
            const response = await fetch(AIConfig.api.openai.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AIConfig.api.openai.apiKey}`
                },
                body: JSON.stringify({
                    model: AIConfig.api.openai.model,
                    messages: [
                        { role: 'system', content: prompt.system },
                        { role: 'user', content: prompt.user }
                    ],
                    max_tokens: 150,
                    temperature: 0.8
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('OpenAI调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // OpenAI兼容代理调用
    async callOpenAIProxy(prompt) {
        try {
            // 验证配置
            const config = AIConfig.api.openai_proxy;
            if (!this.validateAPIConfig('openai_proxy')) {
                console.error('OpenAI代理配置无效');
                return this.getFallbackResponse(prompt.user);
            }

            console.log('调用OpenAI代理API:', config.baseURL);

            const response = await fetch(config.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        { role: 'system', content: prompt.system },
                        { role: 'user', content: prompt.user }
                    ],
                    max_tokens: 150,
                    temperature: 0.8
                })
            });

            console.log('响应状态:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API响应错误:', errorText);

                // 详细的错误处理
                if (response.status === 503) {
                    throw new Error('服务器暂时不可用 (503)，请稍后重试。这通常是因为服务器过载或维护中。');
                } else if (response.status === 429) {
                    throw new Error('请求过于频繁 (429)，请稍后重试。');
                } else if (response.status === 401) {
                    throw new Error('API密钥无效 (401)，请检查密钥是否正确。');
                } else if (response.status === 403) {
                    throw new Error('访问被拒绝 (403)，请检查API密钥权限。');
                } else {
                    throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
                }
            }

            const data = await response.json();
            console.log('API响应数据:', data);

            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content || '抱歉，我现在无法回应。';
            } else {
                console.error('响应格式不正确:', data);
                return '抱歉，响应格式不正确。';
            }
        } catch (error) {
            console.error('OpenAI代理调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // Gemini调用
    async callGemini(prompt) {
        try {
            const response = await fetch(AIConfig.api.gemini.baseURL + `?key=${AIConfig.api.gemini.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${prompt.system}\n\n${prompt.user}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 150
                    }
                })
            });
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('Gemini调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // Claude调用
    async callClaude(prompt) {
        try {
            const response = await fetch(AIConfig.api.claude.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': AIConfig.api.claude.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 150,
                    messages: [
                        { role: 'user', content: `${prompt.system}\n\n${prompt.user}` }
                    ]
                })
            });
            
            const data = await response.json();
            return data.content[0].text || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('Claude调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // 通义千问调用
    async callQwen(prompt) {
        try {
            const response = await fetch(AIConfig.api.qwen.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AIConfig.api.qwen.apiKey}`
                },
                body: JSON.stringify({
                    model: AIConfig.api.qwen.model,
                    input: {
                        messages: [
                            { role: 'system', content: prompt.system },
                            { role: 'user', content: prompt.user }
                        ]
                    },
                    parameters: {
                        max_tokens: 150,
                        temperature: 0.8
                    }
                })
            });
            
            const data = await response.json();
            return data.output.text || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('通义千问调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // 备用回应（当AI不可用时）
    getFallbackResponse(userMessage) {
        const fallbackResponses = [
            '这很有趣！你能告诉我更多吗？',
            '我明白了。你想怎么做呢？',
            '这是个好想法！',
            '让我们继续探索吧！',
            '你真是个有趣的人！'
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
}

// 全局AI对话实例
const aiConversation = new AIConversation();
