// AI驱动的NPC系统 - 专门用于主角NPC和随机事件

// AI服务配置
const AIServices = {
    gemini: {
        name: 'Google Gemini',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        headers: {
            'Content-Type': 'application/json'
        },
        apiKey: '', // 用户配置
        enabled: false
    },
    
    openai: {
        name: 'OpenAI GPT',
        baseURL: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' // + apiKey
        },
        apiKey: '', // 用户配置
        enabled: false
    },
    
    claude: {
        name: 'Anthropic Claude',
        baseURL: 'https://api.anthropic.com/v1/messages',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': '', // 用户配置
            'anthropic-version': '2023-06-01'
        },
        apiKey: '', // 用户配置
        enabled: false
    },
    
    // OpenAI兼容代理
    openai_proxy: {
        name: 'OpenAI兼容代理',
        baseURL: '', // 用户配置代理地址
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' // + apiKey
        },
        apiKey: '', // 用户配置
        enabled: false
    }
};

// 主角NPC配置
const MainNPCs = {
    '学霸学长': {
        name: '林学长',
        personality: '温柔体贴，成绩优秀，喜欢帮助别人。说话比较正式，但很关心他人。',
        background: '学生会主席，成绩年级第一，家里很有钱但很谦虚。',
        relationship: {
            level: 0, // 0-100
            stage: 'stranger', // stranger, friend, close_friend, lover
            mood: 50, // 当前心情
            lastInteraction: null
        },
        aiConfig: {
            provider: 'openai_proxy', // 默认使用OpenAI代理
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            maxTokens: 200
        },
        locations: ['school', 'library', 'cafeteria'],
        greeting: '你好，有什么需要帮助的吗？',
        specialEvents: [
            '学习辅导', '学生会活动', '图书馆相遇'
        ]
    },
    
    '运动健将': {
        name: '张同学',
        personality: '阳光开朗，热爱运动，说话比较随意，喜欢开玩笑。',
        background: '篮球队队长，体育成绩优秀，性格外向。',
        relationship: {
            level: 0,
            stage: 'stranger',
            mood: 50,
            lastInteraction: null
        },
        aiConfig: {
            provider: 'openai_proxy',
            model: 'gpt-3.5-turbo',
            temperature: 0.9,
            maxTokens: 200
        },
        locations: ['playground', 'gym', 'cafeteria'],
        greeting: '嘿！你也在这里啊！要不要一起运动？',
        specialEvents: [
            '篮球比赛', '晨跑相遇', '健身房训练'
        ]
    },
    
    '神秘转学生': {
        name: '夜同学',
        personality: '高冷神秘，说话简洁，有秘密，但内心善良。',
        background: '刚转学来的学生，身份神秘，成绩很好但很少与人交流。',
        relationship: {
            level: 0,
            stage: 'stranger',
            mood: 50,
            lastInteraction: null
        },
        aiConfig: {
            provider: 'openai_proxy',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 200
        },
        locations: ['classroom', 'rooftop', 'library'],
        greeting: '...',
        specialEvents: [
            '天台相遇', '图书馆秘密', '转学真相'
        ]
    },
    
    '邻家男孩': {
        name: '小明',
        personality: '温暖可靠，青梅竹马，说话亲切，总是关心你。',
        background: '从小一起长大的邻居，关系很好，性格温和。',
        relationship: {
            level: 50, // 初始关系较好
            stage: 'friend',
            mood: 50,
            lastInteraction: null
        },
        aiConfig: {
            provider: 'openai_proxy',
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
            maxTokens: 200
        },
        locations: ['home', 'park', 'school'],
        greeting: '你来了！今天过得怎么样？',
        specialEvents: [
            '童年回忆', '家庭聚餐', '公园散步'
        ]
    }
};

// AI对话管理器
class AINPCDialogManager {
    constructor() {
        this.conversationHistory = {};
        this.isProcessing = false;
    }
    
    // 初始化对话历史
    initConversationHistory(npcId) {
        if (!this.conversationHistory[npcId]) {
            this.conversationHistory[npcId] = [];
        }
    }
    
    // 与主角NPC对话
    async talkToMainNPC(npcId, playerMessage = '', context = {}) {
        if (this.isProcessing) {
            return '请稍等，我正在思考...';
        }
        
        this.isProcessing = true;
        
        try {
            const npc = MainNPCs[npcId];
            if (!npc) {
                throw new Error('NPC不存在');
            }
            
            this.initConversationHistory(npcId);
            
            const prompt = this.buildNPCPrompt(npc, playerMessage, context);
            const response = await this.callAI(npc.aiConfig, prompt);
            
            // 更新对话历史
            this.conversationHistory[npcId].push({
                player: playerMessage,
                npc: response,
                timestamp: Date.now()
            });
            
            // 更新NPC关系（简单的AI分析）
            this.updateNPCRelationship(npcId, playerMessage, response);
            
            return response;
            
        } catch (error) {
            console.error('AI对话失败:', error);
            
            // 根据错误类型提供更具体的反馈
            if (error.message.includes('503')) {
                return '服务器暂时不可用，请稍后重试。';
            } else if (error.message.includes('429')) {
                return '请求过于频繁，请稍后重试。';
            } else if (error.message.includes('401') || error.message.includes('403')) {
                return 'API密钥可能有问题，请检查设置。';
            } else if (error.message.includes('Failed to fetch')) {
                return '网络连接失败，请检查网络或代理设置。';
            } else {
                return '抱歉，我现在无法回应。请稍后再试。';
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    // 构建NPC提示词
    buildNPCPrompt(npc, playerMessage, context) {
        const systemPrompt = `你是${npc.name}，${npc.personality}

背景设定：${npc.background}

当前状态：
- 与玩家的关系等级：${npc.relationship.level}/100
- 关系阶段：${npc.relationship.stage}
- 当前心情：${npc.relationship.mood}/100
- 当前位置：${context.location || '未知'}

请以${npc.name}的身份回应，保持角色的一致性。回应应该：
1. 符合角色的性格设定
2. 根据当前关系阶段调整语气
3. 简短有趣（1-2句话）
4. 可能包含互动选项或建议
5. 适合乙女向游戏的风格

游戏设定：现代校园生活，乙女向互动游戏`;

        const userPrompt = playerMessage ? 
            `玩家说："${playerMessage}"` : 
            `玩家来到了你所在的地方，请主动打招呼。`;

        return { system: systemPrompt, user: userPrompt };
    }
    
    // 调用AI API
    async callAI(aiConfig, prompt) {
        console.log('调用AI服务:', aiConfig.provider, aiConfig);
        const service = AIServices[aiConfig.provider];
        
        if (!service) {
            console.error('AI服务未找到:', aiConfig.provider);
            return this.getFallbackResponse(prompt.user);
        }
        
        if (!service.enabled) {
            console.error('AI服务未启用:', aiConfig.provider, service);
            return this.getFallbackResponse(prompt.user);
        }
        
        console.log('使用AI服务:', service.name, '模型:', aiConfig.model);
        
        switch (aiConfig.provider) {
            case 'gemini':
                return await this.callGemini(service, aiConfig, prompt);
            case 'openai':
                return await this.callOpenAI(service, aiConfig, prompt);
            case 'claude':
                return await this.callClaude(service, aiConfig, prompt);
            case 'openai_proxy':
                return await this.callOpenAIProxy(service, aiConfig, prompt);
            default:
                return this.getFallbackResponse(prompt.user);
        }
    }
    
    // Gemini API调用
    async callGemini(service, config, prompt) {
        try {
            const response = await fetch(service.baseURL + `?key=${service.apiKey}`, {
                method: 'POST',
                headers: service.headers,
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${prompt.system}\n\n${prompt.user}`
                        }]
                    }],
                    generationConfig: {
                        temperature: config.temperature,
                        maxOutputTokens: config.maxTokens
                    }
                })
            });
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('Gemini API调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // OpenAI API调用
    async callOpenAI(service, config, prompt) {
        try {
            const response = await fetch(service.baseURL, {
                method: 'POST',
                headers: {
                    ...service.headers,
                    'Authorization': `Bearer ${service.apiKey}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        { role: 'system', content: prompt.system },
                        { role: 'user', content: prompt.user }
                    ],
                    max_tokens: config.maxTokens,
                    temperature: config.temperature
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('OpenAI API调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // Claude API调用
    async callClaude(service, config, prompt) {
        try {
            const response = await fetch(service.baseURL, {
                method: 'POST',
                headers: {
                    ...service.headers,
                    'x-api-key': service.apiKey
                },
                body: JSON.stringify({
                    model: config.model,
                    max_tokens: config.maxTokens,
                    temperature: config.temperature,
                    messages: [
                        { role: 'user', content: `${prompt.system}\n\n${prompt.user}` }
                    ]
                })
            });
            
            const data = await response.json();
            return data.content[0].text || '抱歉，我现在无法回应。';
        } catch (error) {
            console.error('Claude API调用失败:', error);
            return this.getFallbackResponse(prompt.user);
        }
    }
    
    // OpenAI兼容代理调用 - 使用统一的AI配置系统
    async callOpenAIProxy(service, config, prompt) {
        // 直接使用 AIConversation 类的实现，避免重复代码
        if (typeof aiConversation !== 'undefined') {
            return await aiConversation.callOpenAIProxy(prompt);
        }

        // 如果没有全局的 aiConversation，则返回fallback
        console.error('AI配置系统不可用，使用本地fallback');
        return this.getFallbackResponse(prompt.user);
    }
    
    // 备用回应
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
    
    // 更新NPC关系
    updateNPCRelationship(npcId, playerMessage, npcResponse) {
        const npc = MainNPCs[npcId];
        if (!npc) return;
        
        // 简单的AI分析（可以根据需要改进）
        let relationshipChange = 0;
        
        // 根据玩家消息长度和内容判断互动质量
        if (playerMessage.length > 10) {
            relationshipChange += 1;
        }
        
        // 根据关键词判断关系变化
        const positiveKeywords = ['谢谢', '帮助', '一起', '喜欢', '关心'];
        const negativeKeywords = ['讨厌', '烦人', '无聊', '拒绝'];
        
        if (positiveKeywords.some(keyword => playerMessage.includes(keyword))) {
            relationshipChange += 2;
        }
        
        if (negativeKeywords.some(keyword => playerMessage.includes(keyword))) {
            relationshipChange -= 2;
        }
        
        // 更新关系等级
        npc.relationship.level += relationshipChange;
        npc.relationship.level = Math.max(0, Math.min(100, npc.relationship.level));
        
        // 更新关系阶段
        if (npc.relationship.level >= 80) {
            npc.relationship.stage = 'lover';
        } else if (npc.relationship.level >= 60) {
            npc.relationship.stage = 'close_friend';
        } else if (npc.relationship.level >= 30) {
            npc.relationship.stage = 'friend';
        } else {
            npc.relationship.stage = 'stranger';
        }
        
        // 更新心情
        npc.relationship.mood += relationshipChange;
        npc.relationship.mood = Math.max(0, Math.min(100, npc.relationship.mood));
        
        // 更新最后互动时间
        npc.relationship.lastInteraction = Date.now();
    }
}

// 随机事件生成器
class AIRandomEventGenerator {
    constructor() {
        this.eventHistory = [];
    }
    
    // 生成随机事件
    async generateRandomEvent(context = {}) {
        try {
            const prompt = this.buildEventPrompt(context);
            // 使用默认的AI配置生成事件
            const defaultAIConfig = {
                provider: 'gemini',
                model: 'gemini-pro',
                temperature: 0.8,
                maxTokens: 200
            };
            const response = await this.callAI(defaultAIConfig, prompt);
            
            // 解析AI生成的事件
            const event = this.parseEventResponse(response);
            
            // 记录事件历史
            this.eventHistory.push({
                event: event,
                timestamp: Date.now(),
                context: context
            });
            
            return event;
            
        } catch (error) {
            console.error('AI事件生成失败:', error);
            return this.getFallbackEvent();
        }
    }
    
    // 构建事件提示词
    buildEventPrompt(context) {
        const systemPrompt = `你是一个乙女向游戏的随机事件生成器。

游戏设定：现代校园生活，乙女向互动游戏
当前地点：${context.location || '未知'}
当前时间：${context.time || '未知'}
玩家状态：体力${context.health || 100}，心情${context.mood || 50}

请生成一个有趣的随机事件，格式如下：
标题：事件标题
描述：事件描述
选择：[选择1, 选择2, 选择3]
影响：属性变化描述

要求：
1. 事件要符合乙女向游戏风格
2. 内容要积极向上
3. 选择要有意义
4. 描述要生动有趣`;

        const userPrompt = `请生成一个随机事件。`;

        return { system: systemPrompt, user: userPrompt };
    }
    
    // 解析事件回应
    parseEventResponse(response) {
        try {
            const lines = response.split('\n');
            const event = {
                title: '',
                description: '',
                choices: [],
                effects: {}
            };
            
            let currentSection = '';
            
            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('标题：')) {
                    event.title = line.replace('标题：', '').trim();
                } else if (line.startsWith('描述：')) {
                    event.description = line.replace('描述：', '').trim();
                } else if (line.startsWith('选择：')) {
                    const choicesText = line.replace('选择：', '').trim();
                    event.choices = choicesText.split(',').map(choice => choice.trim());
                } else if (line.startsWith('影响：')) {
                    event.effects = this.parseEffects(line.replace('影响：', '').trim());
                }
            });
            
            return event;
            
        } catch (error) {
            console.error('解析事件回应失败:', error);
            return this.getFallbackEvent();
        }
    }
    
    // 解析效果
    parseEffects(effectsText) {
        const effects = {};
        
        // 简单的效果解析
        if (effectsText.includes('体力')) {
            effects.health = Math.floor(Math.random() * 10) - 5;
        }
        if (effectsText.includes('心情')) {
            effects.mood = Math.floor(Math.random() * 15) - 5;
        }
        if (effectsText.includes('金钱')) {
            effects.money = Math.floor(Math.random() * 20) - 10;
        }
        
        return effects;
    }
    
    // 备用事件
    getFallbackEvent() {
        const fallbackEvents = [
            {
                title: '意外相遇',
                description: '你在路上遇到了一个熟悉的人。',
                choices: ['打招呼', '假装没看见', '主动聊天'],
                effects: { mood: 5 }
            },
            {
                title: '小幸运',
                description: '你发现了一个小惊喜。',
                choices: ['接受', '拒绝', '分享给别人'],
                effects: { mood: 10 }
            }
        ];
        
        return fallbackEvents[Math.floor(Math.random() * fallbackEvents.length)];
    }
}

// 全局实例
const aiNPCDialogManager = new AINPCDialogManager();
const aiRandomEventGenerator = new AIRandomEventGenerator();

// 初始化函数，从AIConfig同步配置
function syncAIServiceConfig() {
    // 检查AIConfig是否存在
    if (typeof AIConfig !== 'undefined' && AIConfig.api) {
        // 同步OpenAI代理配置
        if (AIConfig.api.openai_proxy) {
            AIServices.openai_proxy.apiKey = AIConfig.api.openai_proxy.apiKey;
            AIServices.openai_proxy.baseURL = AIConfig.api.openai_proxy.baseURL;
            AIServices.openai_proxy.enabled = AIConfig.api.openai_proxy.enabled;
            AIServices.openai_proxy.headers['Authorization'] = 'Bearer ' + AIConfig.api.openai_proxy.apiKey;
            console.log('同步OpenAI代理配置:', AIServices.openai_proxy);
        }

        // 同步其他服务配置
        if (AIConfig.api.openai) {
            AIServices.openai.apiKey = AIConfig.api.openai.apiKey;
            AIServices.openai.enabled = AIConfig.api.openai.enabled;
            AIServices.openai.headers['Authorization'] = 'Bearer ' + AIConfig.api.openai.apiKey;
        }

        if (AIConfig.api.gemini) {
            AIServices.gemini.apiKey = AIConfig.api.gemini.apiKey;
            AIServices.gemini.enabled = AIConfig.api.gemini.enabled;
        }

        if (AIConfig.api.claude) {
            AIServices.claude.apiKey = AIConfig.api.claude.apiKey;
            AIServices.claude.enabled = AIConfig.api.claude.enabled;
            AIServices.claude.headers['x-api-key'] = AIConfig.api.claude.apiKey;
        }

        console.log('AI服务配置已同步');
    }
}

// 页面加载后自动同步配置
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAIServiceConfig);
} else {
    syncAIServiceConfig();
}

// 导出给全局使用
window.aiNPCDialogManager = aiNPCDialogManager;
window.aiRandomEventGenerator = aiRandomEventGenerator;
window.MainNPCs = MainNPCs;
window.AIServices = AIServices;
window.syncAIServiceConfig = syncAIServiceConfig;
