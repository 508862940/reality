/**
 * 立绘管理器
 * 负责角色立绘的显示、更新和动画
 */

class PortraitManager {
    constructor() {
        this.currentAppearance = null;
        this.currentExpression = 'normal';
        this.isInitialized = false;

        // Emoji映射表
        this.emojiMap = {
            gender: {
                'female': '👧',
                'male': '👦',
                'other': '🧑'
            },
            skinTone: {
                'pale': '🏻',
                'fair': '🏻',
                'medium': '🏼',
                'tan': '🏽',
                'dark': '🏾',
                'deep': '🏿'
            },
            expression: {
                'normal': '',
                'happy': '😊',
                'sad': '😢',
                'angry': '😠',
                'shy': '😊',
                'surprised': '😮'
            }
        };

        // 文字描述映射
        this.textMap = {
            gender: {
                'female': '女性',
                'male': '男性',
                'other': '中性'
            },
            bodyType: {
                'slim': '纤细',
                'normal': '标准',
                'athletic': '健壮',
                'plump': '丰满'
            },
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
            }
        };
    }

    /**
     * 初始化立绘系统
     */
    init() {
        console.log('🎨 立绘管理器初始化...');

        // 如果currentAppearance已经被设置（从存档加载），不要覆盖它
        if (!this.currentAppearance) {
            // 从WorldState获取外观数据
            if (window.worldState && window.worldState.state.player.appearance) {
                this.currentAppearance = window.worldState.state.player.appearance;
                console.log('📝 从WorldState获取外观数据:', this.currentAppearance);
            } else {
                // 使用默认外观
                this.currentAppearance = this.getDefaultAppearance();
                console.log('📝 使用默认外观数据');
            }
        } else {
            console.log('📝 使用已设置的外观数据:', this.currentAppearance);
        }

        // 初始化显示
        this.updatePortrait();
        this.isInitialized = true;

        console.log('✅ 立绘管理器初始化完成，当前发色:', this.currentAppearance?.hairColor);
    }

    /**
     * 更新角色外观数据
     */
    updateAppearance(appearanceData) {
        if (!appearanceData) return;

        console.log('🎨 更新角色外观:', appearanceData);
        this.currentAppearance = { ...this.currentAppearance, ...appearanceData };

        // 同步到WorldState
        if (window.worldState && window.worldState.state.player) {
            window.worldState.state.player.appearance = this.currentAppearance;
        }

        // 更新显示
        if (this.isInitialized) {
            this.updatePortrait();
        }
    }

    /**
     * 获取默认外观
     */
    getDefaultAppearance() {
        return {
            gender: 'female',
            bodyType: 'normal',
            skinTone: 'fair',
            hairStyle: 'long',
            hairColor: 'black',
            eyeShape: 'round',
            eyeColor: 'brown'
        };
    }

    /**
     * 更新立绘显示
     */
    updatePortrait() {
        // 更新A区大立绘
        this.updateMainPortrait();

        // 更新D区状态栏显示
        this.updateStatusDisplay();
    }

    /**
     * 更新A区主立绘
     */
    updateMainPortrait() {
        const container = document.querySelector('.area-a .character-sprite-container');
        if (!container) return;

        // 生成emoji和描述文字
        const emoji = this.generateEmoji(this.currentAppearance);
        const description = this.generateDescription(this.currentAppearance);

        // 获取现有的角色名称（如果有）
        let characterName = '角色';
        const existingNameElement = container.querySelector('#characterName') || document.getElementById('characterName');
        if (existingNameElement) {
            characterName = existingNameElement.textContent;
        }

        // 创建新的HTML结构，保留characterName元素
        container.innerHTML = `
            <div id="portraitContainer" class="portrait-container">
                <div class="emoji-avatar ${this.currentExpression}">${emoji}</div>
                <div class="appearance-desc">${description}</div>
                <div class="sprite-name" id="characterName">${characterName}</div>
            </div>
        `;
    }

    /**
     * 更新角色名称
     */
    updateCharacterName(name) {
        const nameElement = document.getElementById('characterName');
        if (nameElement) {
            nameElement.textContent = name;
        }

        // 也更新worldState
        if (window.worldState && window.worldState.state.player) {
            window.worldState.state.player.name = name;
        }
    }

    /**
     * 生成组合emoji
     */
    generateEmoji(appearance) {
        const gender = this.emojiMap.gender[appearance.gender] || '👤';
        const skinTone = this.emojiMap.skinTone[appearance.skinTone] || '';
        return gender + skinTone;
    }

    /**
     * 生成外观描述文字
     */
    generateDescription(appearance) {
        const gender = this.textMap.gender[appearance.gender] || '未知';
        const hairColor = this.textMap.hairColor[appearance.hairColor] || '';
        const hairStyle = this.textMap.hairStyle[appearance.hairStyle] || '';
        const bodyType = this.textMap.bodyType[appearance.bodyType] || '';

        return `${gender}·${hairColor}${hairStyle}·${bodyType}`;
    }

    /**
     * 更新D区状态栏显示
     */
    updateStatusDisplay() {
        // 如果有角色状态面板，添加角色外观信息
        const statusContent = document.getElementById('statusContent');
        if (!statusContent) return;

        // 检查是否已有角色显示区域
        let characterDisplay = statusContent.querySelector('.character-status-display');
        if (!characterDisplay) {
            // 创建新的显示区域
            characterDisplay = document.createElement('div');
            characterDisplay.className = 'character-status-display';
            statusContent.insertBefore(characterDisplay, statusContent.firstChild);
        }

        // 更新显示内容
        const emoji = this.generateEmoji(this.currentAppearance);
        const name = window.worldState?.state.player.name || '未命名';
        const desc = this.generateDescription(this.currentAppearance);

        characterDisplay.innerHTML = `
            <div class="status-portrait">${emoji}</div>
            <div class="status-info">
                <div class="status-name">${name}</div>
                <div class="status-appearance">${desc}</div>
            </div>
        `;
    }

    /**
     * 设置表情
     */
    setExpression(expression) {
        if (!this.emojiMap.expression.hasOwnProperty(expression)) {
            console.warn(`未知表情: ${expression}`);
            return;
        }

        this.currentExpression = expression;

        // 更新emoji显示
        const emojiAvatar = document.querySelector('.emoji-avatar');
        if (emojiAvatar) {
            // 移除所有表情类
            Object.keys(this.emojiMap.expression).forEach(exp => {
                emojiAvatar.classList.remove(exp);
            });
            // 添加新表情类
            emojiAvatar.classList.add(expression);
        }

        // 保存到WorldState
        if (window.worldState) {
            window.worldState.state.player.expression = expression;
        }
    }

    /**
     * 更新外观
     */
    updateAppearance(appearance) {
        this.currentAppearance = { ...this.currentAppearance, ...appearance };

        // 保存到WorldState
        if (window.worldState) {
            window.worldState.state.player.appearance = this.currentAppearance;
        }

        // 更新显示
        this.updatePortrait();
    }

    /**
     * 获取Q版小立绘HTML
     */
    getChibiPortrait(showMood = false) {
        const emoji = this.generateEmoji(this.currentAppearance);
        const name = window.worldState?.state.player.name || '未命名';
        const mood = showMood ? this.emojiMap.expression[this.currentExpression] : '';

        return `
            <span class="chibi-portrait">
                <span class="chibi-emoji">${emoji}</span>
                <span class="chibi-name">${name}</span>
                ${mood ? `<span class="chibi-mood">${mood}</span>` : ''}
            </span>
        `;
    }

    /**
     * 在对话中显示角色头像
     */
    getDialoguePortrait() {
        const emoji = this.generateEmoji(this.currentAppearance);
        return `<span class="dialogue-portrait">${emoji}</span>`;
    }

    /**
     * 播放动画效果
     */
    playAnimation(animationType) {
        const emojiAvatar = document.querySelector('.emoji-avatar');
        if (!emojiAvatar) return;

        switch(animationType) {
            case 'happy':
                this.setExpression('happy');
                emojiAvatar.style.animation = 'happyBounce 0.5s ease';
                setTimeout(() => {
                    emojiAvatar.style.animation = '';
                }, 500);
                break;

            case 'sad':
                this.setExpression('sad');
                break;

            case 'angry':
                this.setExpression('angry');
                emojiAvatar.style.animation = 'angryShake 0.3s';
                setTimeout(() => {
                    emojiAvatar.style.animation = '';
                }, 300);
                break;

            case 'surprise':
                this.setExpression('surprised');
                break;
        }
    }

    /**
     * 从角色创建数据加载外观
     */
    loadFromCharacterData(characterData) {
        if (!characterData) return;

        // 映射角色创建数据到外观系统
        const appearance = {
            gender: characterData.gender || 'female',
            bodyType: this.mapBodyType(characterData.appearance?.body),
            skinTone: 'fair', // 默认值，可以扩展
            hairStyle: characterData.appearance?.hair || 'long',
            hairColor: characterData.appearance?.hairColor || 'black',
            eyeShape: 'round', // 默认值
            eyeColor: 'brown' // 默认值
        };

        this.updateAppearance(appearance);
    }

    /**
     * 映射体型数据
     */
    mapBodyType(bodyType) {
        const mapping = {
            'slim': 'slim',
            'normal': 'normal',
            'athletic': 'athletic',
            'strong': 'athletic',
            'plump': 'plump'
        };
        return mapping[bodyType] || 'normal';
    }
}

// 创建全局实例
window.portraitManager = new PortraitManager();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortraitManager;
}