/**
 * 🎨 立绘系统 - 响应式立绘管理
 * 配合响应式系统，自动切换角色立绘
 */

class SpriteSystem {
    constructor() {
        this.sprites = new Map();
        this.currentSprite = null;
        console.log('🎨 立绘系统初始化');
    }

    /**
     * 注册角色的立绘集
     */
    registerCharacterSprites(characterName, spriteConfig) {
        this.sprites.set(characterName, {
            // 基础立绘（根据心情）
            moods: {
                happy: 'images/characters/' + characterName + '/happy.png',
                sad: 'images/characters/' + characterName + '/sad.png',
                angry: 'images/characters/' + characterName + '/angry.png',
                neutral: 'images/characters/' + characterName + '/neutral.png',
                shy: 'images/characters/' + characterName + '/shy.png',
                excited: 'images/characters/' + characterName + '/excited.png',
                worried: 'images/characters/' + characterName + '/worried.png',
                ...spriteConfig.moods
            },

            // 特殊状态立绘
            special: {
                battle: 'images/characters/' + characterName + '/battle.png',
                injured: 'images/characters/' + characterName + '/injured.png',
                sleeping: 'images/characters/' + characterName + '/sleeping.png',
                ...spriteConfig.special
            },

            // 服装变化
            outfits: {
                casual: spriteConfig.outfits?.casual || {},
                school: spriteConfig.outfits?.school || {},
                formal: spriteConfig.outfits?.formal || {},
                pajamas: spriteConfig.outfits?.pajamas || {},
                ...spriteConfig.outfits
            },

            // 好感度特殊立绘
            affectionLevels: {
                0: 'cold',      // 0-29: 冷淡
                30: 'neutral',  // 30-59: 中立
                60: 'friendly', // 60-79: 友好
                80: 'intimate', // 80-100: 亲密
                ...spriteConfig.affectionLevels
            }
        });

        console.log(`🖼️ 注册${characterName}的立绘集`);
    }

    /**
     * 自动选择合适的立绘
     */
    getSprite(characterName, state) {
        const spriteSet = this.sprites.get(characterName);
        if (!spriteSet) return null;

        // 优先级：特殊状态 > 服装+心情 > 基础心情
        if (state.specialState && spriteSet.special[state.specialState]) {
            return spriteSet.special[state.specialState];
        }

        // 组合服装和心情
        if (state.outfit && state.mood) {
            const outfitMood = spriteSet.outfits[state.outfit]?.[state.mood];
            if (outfitMood) return outfitMood;
        }

        // 基础心情立绘
        if (state.mood && spriteSet.moods[state.mood]) {
            return spriteSet.moods[state.mood];
        }

        // 默认立绘
        return spriteSet.moods.neutral;
    }

    /**
     * 更新显示的立绘
     */
    updateSprite(characterName, state) {
        const sprite = this.getSprite(characterName, state);
        const spriteContainer = document.querySelector('.character-sprite-container');

        if (sprite && spriteContainer) {
            // 如果是图片路径
            if (sprite.includes('.png') || sprite.includes('.jpg')) {
                spriteContainer.innerHTML = `
                    <img src="${sprite}" alt="${characterName}" class="character-sprite fade-in" />
                `;
            } else {
                // 如果是emoji占位符
                spriteContainer.innerHTML = `
                    <div class="sprite-placeholder">${sprite}</div>
                `;
            }

            // 添加切换动画
            spriteContainer.classList.add('sprite-change');
            setTimeout(() => {
                spriteContainer.classList.remove('sprite-change');
            }, 500);
        }
    }
}

// 创建全局立绘系统
window.spriteSystem = new SpriteSystem();

/**
 * 示例：Zero的立绘配置
 */
window.setupZeroSprites = function() {
    window.spriteSystem.registerCharacterSprites('Zero', {
        moods: {
            // 基础表情
            neutral: '😐',  // 临时用emoji，后续替换为图片
            cold: '❄️',
            protective: '🛡️',
            gentle: '💫',

            // 狼魂相关
            wolfAwaken: '🐺',
            wolfRage: '🔥🐺',
        },

        special: {
            // 战斗状态
            battle: '⚔️',
            wolfForm: '🐺✨',
            injured: '💔',

            // 特殊剧情
            memoryUnlock: '🌟',
            finalForm: '👁️‍🗨️'  // 狼魂共鸣状态
        },

        outfits: {
            // 不同服装下的心情变化
            casual: {
                happy: '😊',
                sad: '😔'
            },
            battle: {
                angry: '😤',
                determined: '💪'
            }
        },

        affectionLevels: {
            0: { mood: 'cold', special: 'distant' },
            50: { mood: 'neutral', special: 'observing' },
            80: { mood: 'gentle', special: 'protective' },
            100: { mood: 'gentle', special: 'devoted' }
        }
    });
};

/**
 * 将立绘系统与响应式系统连接
 */
window.connectSpriteToReactive = function() {
    // 监听NPC心情变化，自动切换立绘
    if (window.reactiveSystem) {
        // Zero的心情变化
        window.reactiveSystem.watch('npc_Zero_mood', (newMood) => {
            window.spriteSystem.updateSprite('Zero', { mood: newMood });
        });

        // Zero的好感度变化
        window.reactiveSystem.watch('npc_Zero_affection', (newAffection) => {
            // 根据好感度选择立绘风格
            let spriteState = { mood: 'neutral' };

            if (newAffection >= 80) {
                spriteState.mood = 'gentle';
                spriteState.special = 'protective';
            } else if (newAffection >= 50) {
                spriteState.mood = 'neutral';
            } else {
                spriteState.mood = 'cold';
            }

            window.spriteSystem.updateSprite('Zero', spriteState);
        });

        // 狼魂能量变化
        window.reactiveSystem.watch('npc_Zero_wolfSoulEnergy', (energy) => {
            if (energy > 90) {
                // 狼魂暴走
                window.spriteSystem.updateSprite('Zero', {
                    specialState: 'wolfRage'
                });
            }
        });
    }

    console.log('✨ 立绘系统已连接到响应式系统');
};

/**
 * 测试立绘切换
 */
window.testSpriteChange = function() {
    console.log('🎨 测试立绘切换...');

    // 初始化Zero立绘
    window.setupZeroSprites();
    window.connectSpriteToReactive();

    // 模拟心情变化
    setTimeout(() => {
        console.log('切换到开心');
        window.spriteSystem.updateSprite('Zero', { mood: 'happy' });
    }, 1000);

    setTimeout(() => {
        console.log('切换到战斗状态');
        window.spriteSystem.updateSprite('Zero', { specialState: 'battle' });
    }, 2000);

    setTimeout(() => {
        console.log('切换到狼魂觉醒');
        window.spriteSystem.updateSprite('Zero', { specialState: 'wolfForm' });
    }, 3000);
};