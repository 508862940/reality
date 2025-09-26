/**
 * 动态文本解析器
 * 支持变量替换和条件文本
 */

class DialogueParser {
    constructor() {
        this.context = {};
        this.updateContext();
    }

    /**
     * 更新上下文数据
     */
    updateContext() {
        // 从WorldState获取数据
        if (window.worldState) {
            const state = window.worldState.state;

            this.context = {
                player: {
                    name: state.player.name || '未命名',
                    gender: state.player.appearance?.gender || 'female',
                    ...this.getAppearanceText(state.player.appearance)
                },
                time: {
                    day: state.time?.day || 1,
                    hour: state.time?.hour || 8,
                    weekday: this.getWeekdayText(state.time?.weekday || 1)
                },
                location: state.player.position?.location || '未知地点'
            };
        }

        // 添加NPC数据
        this.context.npc = {};
        if (window.npcManager) {
            // 预留NPC系统接口
        }
    }

    /**
     * 获取外观文本描述
     */
    getAppearanceText(appearance) {
        if (!appearance) return {};

        const textMap = {
            hairStyle: {
                'long': '长发',
                'short': '短发',
                'twintails': '双马尾',
                'ponytail': '单马尾'
            },
            hairColor: {
                'black': '黑色',
                'brown': '棕色',
                'blonde': '金色',
                'red': '红色',
                'purple': '紫色',
                'blue': '蓝色',
                'green': '绿色',
                'white': '白色'
            },
            bodyType: {
                'slim': '纤细',
                'normal': '标准',
                'athletic': '健壮',
                'plump': '丰满'
            },
            eyeColor: {
                'brown': '棕色',
                'blue': '蓝色',
                'green': '绿色',
                'red': '红色',
                'purple': '紫色',
                'gold': '金色'
            }
        };

        return {
            hairStyle: textMap.hairStyle[appearance.hairStyle] || appearance.hairStyle,
            hairColor: textMap.hairColor[appearance.hairColor] || appearance.hairColor,
            bodyType: textMap.bodyType[appearance.bodyType] || appearance.bodyType,
            eyeColor: textMap.eyeColor[appearance.eyeColor] || appearance.eyeColor,
            // 组合描述
            hair: `${textMap.hairColor[appearance.hairColor] || ''}${textMap.hairStyle[appearance.hairStyle] || ''}`,
            appearance: `${textMap.bodyType[appearance.bodyType] || '标准'}体型`
        };
    }

    /**
     * 获取星期文本
     */
    getWeekdayText(weekday) {
        const weekdays = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
        return weekdays[weekday] || '星期一';
    }

    /**
     * 解析文本中的变量
     * @param {string} text - 包含变量的文本
     * @returns {string} - 解析后的文本
     */
    parse(text) {
        if (!text) return '';

        // 更新上下文
        this.updateContext();

        // 替换变量 ${variable}
        return text.replace(/\${([^}]+)}/g, (match, path) => {
            // 支持嵌套属性访问，如 ${player.name} 或 ${player.hairColor}
            const value = this.getValueByPath(path.trim());
            return value !== undefined ? value : match;
        });
    }

    /**
     * 通过路径获取值
     */
    getValueByPath(path) {
        const keys = path.split('.');
        let value = this.context;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * 条件文本选择
     * 根据条件返回不同的文本
     */
    conditional(conditions) {
        this.updateContext();

        for (const condition of conditions) {
            if (this.evaluateCondition(condition.if)) {
                return this.parse(condition.then);
            }
        }

        // 默认文本
        return conditions.default ? this.parse(conditions.default) : '';
    }

    /**
     * 评估条件
     */
    evaluateCondition(condition) {
        // 简单的条件评估
        // 格式: "player.gender == 'female'"
        const parts = condition.split(/\s*(==|!=|>|<|>=|<=)\s*/);
        if (parts.length !== 3) return false;

        const [leftPath, operator, rightValue] = parts;
        const leftVal = this.getValueByPath(leftPath.trim());
        const rightVal = rightValue.replace(/['"]/g, '').trim();

        switch (operator) {
            case '==': return leftVal == rightVal;
            case '!=': return leftVal != rightVal;
            case '>': return Number(leftVal) > Number(rightVal);
            case '<': return Number(leftVal) < Number(rightVal);
            case '>=': return Number(leftVal) >= Number(rightVal);
            case '<=': return Number(leftVal) <= Number(rightVal);
            default: return false;
        }
    }

    /**
     * 获取外观相关的评论
     */
    getAppearanceComment(npcName = 'NPC') {
        this.updateContext();

        const comments = {
            hairColor: {
                'black': `${npcName}：「你的黑发很有光泽呢。」`,
                'blonde': `${npcName}：「金色的头发真漂亮！」`,
                'red': `${npcName}：「火红的头发很有个性。」`,
                'purple': `${npcName}：「紫色头发，很特别。」`,
                'blue': `${npcName}：「蓝色的头发像大海一样。」`
            },
            hairStyle: {
                'twintails': `${npcName}：「双马尾很可爱哦！」`,
                'ponytail': `${npcName}：「马尾辫很精神。」`,
                'short': `${npcName}：「短发很清爽。」`,
                'long': `${npcName}：「长发很有女人味。」`
            },
            bodyType: {
                'slim': `${npcName}：「你很苗条呢。」`,
                'athletic': `${npcName}：「你看起来很健康。」`,
                'plump': `${npcName}：「你的身材很有魅力。」`
            }
        };

        // 随机选择一个特征进行评论
        const appearance = this.context.player;
        const features = ['hairColor', 'hairStyle', 'bodyType'];
        const randomFeature = features[Math.floor(Math.random() * features.length)];

        if (randomFeature === 'hairColor' && appearance.hairColor) {
            return comments.hairColor[appearance.hairColor] || `${npcName}：「你今天看起来不错。」`;
        } else if (randomFeature === 'hairStyle' && appearance.hairStyle) {
            return comments.hairStyle[appearance.hairStyle] || `${npcName}：「你的发型很适合你。」`;
        } else if (randomFeature === 'bodyType' && appearance.bodyType) {
            return comments.bodyType[appearance.bodyType] || `${npcName}：「你看起来很精神。」`;
        }

        return `${npcName}：「你好啊，${appearance.name || '同学'}。」`;
    }

    /**
     * 格式化对话文本
     * 支持特殊标记
     */
    formatDialogue(speaker, text, mood = null) {
        // 解析文本中的变量
        const parsedText = this.parse(text);

        // 添加说话者头像（如果是玩家）
        let portrait = '';
        if (speaker === 'player' || speaker === '你') {
            if (window.portraitManager) {
                portrait = window.portraitManager.getDialoguePortrait();
            }
        }

        // 格式化输出
        return {
            speaker: speaker,
            portrait: portrait,
            text: parsedText,
            mood: mood
        };
    }

    /**
     * 批量解析场景文本
     */
    parseSceneText(sceneData) {
        if (!sceneData) return sceneData;

        // 深拷贝以避免修改原始数据
        const parsed = JSON.parse(JSON.stringify(sceneData));

        // 解析场景文本
        if (parsed.text) {
            if (Array.isArray(parsed.text)) {
                parsed.text = parsed.text.map(t => this.parse(t));
            } else {
                parsed.text = this.parse(parsed.text);
            }
        }

        // 解析选项文本
        if (parsed.choices) {
            parsed.choices = parsed.choices.map(choice => ({
                ...choice,
                text: this.parse(choice.text)
            }));
        }

        return parsed;
    }
}

// 创建全局实例
window.dialogueParser = new DialogueParser();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DialogueParser;
}