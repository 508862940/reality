/**
 * NPC关系音乐系统
 * 根据与NPC的关系阶段动态调整背景音乐
 */

class NPCMusicSystem {
    constructor() {
        // NPC音乐配置
        this.npcThemes = {
            // Zero的音乐主题
            'Zero': {
                // 基础主题（不同关系阶段的变化）
                themes: {
                    stranger: 'bgm/npc/zero/zero_distant.mp3',        // 陌生人：疏离感
                    acquaintance: 'bgm/npc/zero/zero_curious.mp3',    // 认识：好奇
                    friend: 'bgm/npc/zero/zero_warm.mp3',             // 朋友：温暖
                    close: 'bgm/npc/zero/zero_tender.mp3',            // 亲密：温柔
                    lover: 'bgm/npc/zero/zero_love.mp3'               // 恋人：深情
                },
                // 特殊场景音乐
                special: {
                    first_meeting: 'bgm/npc/zero/zero_encounter.mp3',
                    wolf_soul: 'bgm/npc/zero/zero_wolf_soul.mp3',
                    battle: 'bgm/npc/zero/zero_battle.mp3',
                    memory: 'bgm/npc/zero/zero_memory.mp3',
                    romance: 'bgm/npc/zero/zero_romance.mp3',
                    ending: 'bgm/npc/zero/zero_ending.mp3'
                },
                // 音乐动机（会随机叠加到日常BGM中）
                motifs: {
                    piano: 'bgm/npc/zero/motif_piano.mp3',      // 钢琴动机
                    strings: 'bgm/npc/zero/motif_strings.mp3',  // 弦乐动机
                    wolf: 'bgm/npc/zero/motif_wolf.mp3'         // 狼嚎动机
                },
                // 动机出现概率（根据好感度）
                motifProbability: {
                    0: 0,      // 0-19: 不出现
                    20: 0.05,  // 20-39: 5%概率
                    40: 0.1,   // 40-59: 10%概率
                    60: 0.2,   // 60-79: 20%概率
                    80: 0.3    // 80-100: 30%概率
                }
            },

            // Observer的音乐主题
            'Observer': {
                themes: {
                    stranger: 'bgm/npc/observer/observer_mystery.mp3',
                    acquaintance: 'bgm/npc/observer/observer_intrigue.mp3',
                    friend: 'bgm/npc/observer/observer_trust.mp3',
                    close: 'bgm/npc/observer/observer_truth.mp3',
                    lover: 'bgm/npc/observer/observer_hope.mp3'
                },
                special: {
                    first_meeting: 'bgm/npc/observer/observer_encounter.mp3',
                    reveal_truth: 'bgm/npc/observer/observer_revelation.mp3',
                    dark_past: 'bgm/npc/observer/observer_dark.mp3',
                    gentle_moment: 'bgm/npc/observer/observer_gentle.mp3',
                    ending: 'bgm/npc/observer/observer_ending.mp3'
                },
                motifs: {
                    mystery: 'bgm/npc/observer/motif_mystery.mp3',
                    truth: 'bgm/npc/observer/motif_truth.mp3'
                },
                motifProbability: {
                    0: 0,
                    20: 0.03,
                    40: 0.07,
                    60: 0.15,
                    80: 0.25
                }
            },

            // 其他NPC（占位）
            'DrChen': {
                themes: {
                    stranger: 'bgm/npc/chen/chen_professional.mp3',
                    acquaintance: 'bgm/npc/chen/chen_friendly.mp3',
                    friend: 'bgm/npc/chen/chen_caring.mp3'
                },
                special: {},
                motifs: {},
                motifProbability: { 0: 0 }
            }
        };

        // 当前交互状态
        this.currentInteraction = {
            npc: null,
            isPrivate: false,  // 是否私密场景
            startTime: null,
            theme: null
        };

        // 动机播放控制
        this.motifInterval = null;
        this.motifCheckFrequency = 30000;  // 每30秒检查一次是否播放动机

        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 监听NPC互动事件
        window.addEventListener('npcInteraction', (e) => {
            this.onNPCInteraction(e.detail);
        });

        // 监听关系变化
        if (window.relationshipSystem) {
            window.addEventListener('relationshipChange', (e) => {
                this.onRelationshipChange(e.detail);
            });
        }

        console.log('💕 NPC音乐系统已初始化');
    }

    /**
     * 开始NPC互动
     */
    startInteraction(npcId, options = {}) {
        const npcConfig = this.npcThemes[npcId];
        if (!npcConfig) {
            console.log(`⚠️ 未找到NPC音乐配置: ${npcId}`);
            return;
        }

        // 获取关系阶段
        let relationshipStage = 'stranger';
        if (window.relationshipSystem) {
            const relationship = window.relationshipSystem.getRelationship(npcId);
            if (relationship) {
                relationshipStage = relationship.stage || 'stranger';
            }
        }

        // 选择BGM
        let bgm = null;
        let priority = 'npc';

        // 特殊场景优先
        if (options.special && npcConfig.special[options.special]) {
            bgm = npcConfig.special[options.special];
            console.log(`🎭 播放特殊场景BGM: ${options.special}`);
        }
        // 私密场景播放角色主题
        else if (options.isPrivate) {
            bgm = npcConfig.themes[relationshipStage];
            console.log(`💕 播放私密场景BGM: ${relationshipStage}`);
        }
        // 普通互动可能触发动机
        else {
            // 不立即切换BGM，但可能触发动机
            this.maybePlayMotif(npcId);
            priority = null;  // 不改变当前BGM
        }

        // 播放BGM
        if (bgm && window.musicPriority) {
            const fadeTime = options.isPrivate ? 3000 : 2000;

            window.musicPriority.requestMusic(priority, bgm, {
                fadeIn: fadeTime,
                volume: options.volume || 0.5,
                locked: options.isPrivate  // 私密场景锁定音乐
            });
        }

        // 更新状态
        this.currentInteraction = {
            npc: npcId,
            isPrivate: options.isPrivate || false,
            startTime: Date.now(),
            theme: bgm
        };

        // 如果是私密场景，启动动机检查
        if (options.isPrivate) {
            this.startMotifCheck(npcId);
        }
    }

    /**
     * 结束NPC互动
     */
    endInteraction() {
        if (!this.currentInteraction.npc) return;

        console.log(`👋 结束与 ${this.currentInteraction.npc} 的互动`);

        // 如果是私密场景，解锁音乐
        if (this.currentInteraction.isPrivate && window.musicPriority) {
            window.musicPriority.unlockMusic();

            // 渐变回日常BGM
            setTimeout(() => {
                if (window.dailyBGM) {
                    window.dailyBGM.playCurrentBGM({ fadeIn: 5000 });
                }
            }, 1000);
        }

        // 停止动机检查
        this.stopMotifCheck();

        // 清除状态
        this.currentInteraction = {
            npc: null,
            isPrivate: false,
            startTime: null,
            theme: null
        };
    }

    /**
     * 可能播放动机
     */
    maybePlayMotif(npcId) {
        const npcConfig = this.npcThemes[npcId];
        if (!npcConfig || !npcConfig.motifs) return;

        // 获取好感度
        let affection = 0;
        if (window.relationshipSystem) {
            const relationship = window.relationshipSystem.getRelationship(npcId);
            if (relationship) {
                affection = relationship.affection || 0;
            }
        }

        // 计算概率
        let probability = 0;
        for (let threshold in npcConfig.motifProbability) {
            if (affection >= parseInt(threshold)) {
                probability = npcConfig.motifProbability[threshold];
            }
        }

        // 随机决定是否播放
        if (Math.random() < probability) {
            // 随机选择一个动机
            const motifs = Object.keys(npcConfig.motifs);
            if (motifs.length > 0) {
                const randomMotif = motifs[Math.floor(Math.random() * motifs.length)];
                const motifPath = npcConfig.motifs[randomMotif];

                console.log(`🎵 触发${npcId}的音乐动机: ${randomMotif} (概率${probability})`);

                // 播放动机音效（作为SFX层，不打断BGM）
                if (window.audioSystem) {
                    window.audioSystem.playSFX(motifPath, 0.3);
                }
            }
        }
    }

    /**
     * 开始动机检查
     */
    startMotifCheck(npcId) {
        this.stopMotifCheck();  // 先停止旧的

        this.motifInterval = setInterval(() => {
            this.maybePlayMotif(npcId);
        }, this.motifCheckFrequency);

        console.log(`🎵 开始${npcId}的动机检查 (每${this.motifCheckFrequency/1000}秒)`);
    }

    /**
     * 停止动机检查
     */
    stopMotifCheck() {
        if (this.motifInterval) {
            clearInterval(this.motifInterval);
            this.motifInterval = null;
        }
    }

    /**
     * NPC互动事件处理
     */
    onNPCInteraction(detail) {
        const { npcId, action, isPrivate, special } = detail;

        if (action === 'start') {
            this.startInteraction(npcId, {
                isPrivate,
                special
            });
        } else if (action === 'end') {
            this.endInteraction();
        }
    }

    /**
     * 关系变化处理
     */
    onRelationshipChange(detail) {
        const { npcId, oldStage, newStage, affection } = detail;

        // 如果当前正在和该NPC互动，可能需要切换BGM
        if (this.currentInteraction.npc === npcId &&
            this.currentInteraction.isPrivate) {

            const npcConfig = this.npcThemes[npcId];
            if (npcConfig && oldStage !== newStage) {
                const newTheme = npcConfig.themes[newStage];

                console.log(`💕 关系进展，切换${npcId}的BGM: ${oldStage} → ${newStage}`);

                // 渐变到新主题
                if (window.musicPriority) {
                    window.musicPriority.requestMusic('npc', newTheme, {
                        fadeIn: 5000,  // 缓慢渐变
                        volume: 0.5,
                        locked: true
                    });
                }

                this.currentInteraction.theme = newTheme;
            }
        }

        // 特殊里程碑
        if (affection === 80 && npcId === 'Zero') {
            console.log('🐺 Zero的音乐完全融入了你的日常...');
            // 可以添加特殊效果
        }
    }

    /**
     * 播放特殊事件音乐
     */
    playSpecialEvent(npcId, eventName, options = {}) {
        const npcConfig = this.npcThemes[npcId];
        if (!npcConfig || !npcConfig.special[eventName]) {
            console.warn(`⚠️ 未找到特殊事件音乐: ${npcId}/${eventName}`);
            return;
        }

        const bgm = npcConfig.special[eventName];
        console.log(`🎭 播放${npcId}的特殊事件BGM: ${eventName}`);

        if (window.musicPriority) {
            window.musicPriority.requestMusic('story', bgm, {
                fadeIn: options.fadeIn || 2000,
                volume: options.volume || 0.6,
                locked: true,
                duration: options.duration  // 可选的持续时间
            });
        }
    }

    /**
     * 获取NPC音乐状态
     */
    getNPCMusicStatus(npcId) {
        const npcConfig = this.npcThemes[npcId];
        if (!npcConfig) return null;

        let relationshipStage = 'stranger';
        let affection = 0;

        if (window.relationshipSystem) {
            const relationship = window.relationshipSystem.getRelationship(npcId);
            if (relationship) {
                relationshipStage = relationship.stage || 'stranger';
                affection = relationship.affection || 0;
            }
        }

        return {
            npc: npcId,
            relationshipStage,
            affection,
            currentTheme: npcConfig.themes[relationshipStage],
            hasMotifs: Object.keys(npcConfig.motifs).length > 0,
            motifProbability: this.getMotifProbability(npcId, affection)
        };
    }

    /**
     * 获取动机概率
     */
    getMotifProbability(npcId, affection) {
        const npcConfig = this.npcThemes[npcId];
        if (!npcConfig) return 0;

        let probability = 0;
        for (let threshold in npcConfig.motifProbability) {
            if (affection >= parseInt(threshold)) {
                probability = npcConfig.motifProbability[threshold];
            }
        }
        return probability;
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            currentInteraction: this.currentInteraction,
            isMotifActive: this.motifInterval !== null
        };
    }
}

// 创建全局实例
window.npcMusic = new NPCMusicSystem();

// 测试命令
window.testNPC = {
    // 开始互动
    meet: (npcId) => window.npcMusic.startInteraction(npcId, { isPrivate: false }),
    private: (npcId) => window.npcMusic.startInteraction(npcId, { isPrivate: true }),
    special: (npcId, event) => window.npcMusic.playSpecialEvent(npcId, event),

    // 结束互动
    leave: () => window.npcMusic.endInteraction(),

    // 触发动机
    motif: (npcId) => window.npcMusic.maybePlayMotif(npcId),

    // 查看状态
    status: () => console.table(window.npcMusic.getStatus()),
    npcStatus: (npcId) => console.table(window.npcMusic.getNPCMusicStatus(npcId))
};

console.log('💕 NPC音乐系统已加载');
console.log('测试命令:');
console.log('  testNPC.meet("Zero")     - 开始普通互动');
console.log('  testNPC.private("Zero")  - 开始私密互动');
console.log('  testNPC.special("Zero", "wolf_soul") - 特殊事件');
console.log('  testNPC.leave()          - 结束互动');
console.log('  testNPC.npcStatus("Zero") - 查看NPC音乐状态');

// 导出到全局
window.NPCMusicSystem = NPCMusicSystem;