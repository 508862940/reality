/**
 * 音乐优先级管理器
 * 管理不同来源音乐的优先级，防止音乐冲突
 */

class MusicPriorityManager {
    constructor() {
        // 优先级定义（数字越大优先级越高）
        this.priorities = {
            'daily': 1,        // 日常BGM
            'weather': 2,      // 天气环境音
            'player': 3,       // 玩家自选音乐
            'venue': 4,        // 特殊场所BGM
            'activity': 5,     // 活动BGM（如桌游）
            'minigame': 6,     // 小游戏BGM
            'story': 7,        // 剧情BGM（最高）
            'npc': 7           // NPC专属BGM（同剧情级别）
        };

        // 当前播放状态
        this.currentLayer = {
            type: 'daily',
            bgm: null,
            priority: 1,
            locked: false,
            startTime: null
        };

        // 音乐队列
        this.queue = [];

        // 淡入淡出设置
        this.defaultFadeTime = 2000;
        this.quickFadeTime = 500;
        this.slowFadeTime = 3000;

        // 状态历史（用于恢复）
        this.history = [];
        this.maxHistory = 10;
    }

    /**
     * 请求播放音乐
     * @param {string} type - 音乐类型
     * @param {string} bgmPath - 音乐文件路径
     * @param {Object} options - 播放选项
     * @returns {boolean} 是否成功播放
     */
    requestMusic(type, bgmPath, options = {}) {
        const priority = this.priorities[type] || 0;
        const currentPriority = this.currentLayer.priority;

        // 检查是否被锁定
        if (this.currentLayer.locked && priority < this.currentLayer.priority) {
            console.log(`🔒 音乐被锁定，无法播放 ${type} (优先级 ${priority} < ${currentPriority})`);
            this.addToQueue(type, bgmPath, options);
            return false;
        }

        // 检查优先级
        if (priority < currentPriority && !options.force) {
            console.log(`📊 优先级不足，${type} (${priority}) < 当前 (${currentPriority})`);
            this.addToQueue(type, bgmPath, options);
            return false;
        }

        // 相同优先级的处理
        if (priority === currentPriority && this.currentLayer.type !== type) {
            // 不同类型但同优先级，根据配置决定
            if (options.override === false) {
                console.log(`🔄 相同优先级，保持当前 ${this.currentLayer.type}`);
                return false;
            }
        }

        // 执行音乐切换
        this.switchMusic(type, bgmPath, options);
        return true;
    }

    /**
     * 切换音乐
     */
    switchMusic(type, bgmPath, options = {}) {
        // 保存历史
        if (this.currentLayer.bgm) {
            this.saveToHistory();
        }

        const fadeTime = options.fadeTime || this.defaultFadeTime;
        const volume = options.volume || 0.5;

        console.log(`🎵 切换音乐: ${this.currentLayer.type} → ${type}`);

        // 更新当前层
        const previousLayer = { ...this.currentLayer };
        this.currentLayer = {
            type: type,
            bgm: bgmPath,
            priority: this.priorities[type],
            locked: options.locked || false,
            startTime: Date.now(),
            volume: volume,
            options: options
        };

        // 调用实际的音频系统
        if (window.audioSystem) {
            // 处理渐变
            if (previousLayer.bgm && fadeTime > 0) {
                window.audioSystem.playBGM(bgmPath, {
                    fadeIn: fadeTime,
                    volume: volume
                });
            } else {
                window.audioSystem.playBGM(bgmPath, {
                    volume: volume
                });
            }

            // 触发事件
            this.onMusicChange(previousLayer, this.currentLayer);
        }
    }

    /**
     * 锁定当前音乐（防止被低优先级覆盖）
     */
    lockMusic(duration = null) {
        this.currentLayer.locked = true;
        console.log(`🔒 音乐已锁定: ${this.currentLayer.type}`);

        if (duration) {
            setTimeout(() => {
                this.unlockMusic();
            }, duration);
        }
    }

    /**
     * 解锁音乐
     */
    unlockMusic() {
        this.currentLayer.locked = false;
        console.log(`🔓 音乐已解锁: ${this.currentLayer.type}`);

        // 检查队列中是否有待播放的音乐
        this.processQueue();
    }

    /**
     * 添加到队列
     */
    addToQueue(type, bgmPath, options) {
        // 检查是否已在队列中
        const exists = this.queue.find(item =>
            item.type === type && item.bgm === bgmPath
        );

        if (!exists) {
            this.queue.push({
                type: type,
                bgm: bgmPath,
                priority: this.priorities[type],
                options: options,
                addedAt: Date.now()
            });

            // 按优先级排序
            this.queue.sort((a, b) => b.priority - a.priority);
            console.log(`📋 添加到队列: ${type} (队列长度: ${this.queue.length})`);
        }
    }

    /**
     * 处理队列
     */
    processQueue() {
        if (this.queue.length === 0) return;

        // 获取最高优先级的音乐
        const next = this.queue[0];

        // 尝试播放
        if (this.requestMusic(next.type, next.bgm, next.options)) {
            // 成功播放，从队列移除
            this.queue.shift();
            console.log(`✅ 从队列播放: ${next.type}`);
        }
    }

    /**
     * 保存到历史
     */
    saveToHistory() {
        this.history.push({ ...this.currentLayer, savedAt: Date.now() });

        // 限制历史长度
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * 恢复上一个音乐
     */
    restorePrevious() {
        if (this.history.length === 0) {
            console.log('📜 没有可恢复的音乐历史');
            return false;
        }

        const previous = this.history.pop();
        console.log(`↩️ 恢复音乐: ${previous.type}`);

        this.switchMusic(previous.type, previous.bgm, previous.options);
        return true;
    }

    /**
     * 音乐改变时的回调
     */
    onMusicChange(from, to) {
        // 触发自定义事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('musicChange', {
                detail: { from, to }
            }));
        }

        // 特殊处理
        if (to.type === 'story' || to.type === 'npc') {
            console.log('🎭 进入剧情/NPC音乐模式');
            // 可以添加特殊效果
        } else if (from.type === 'story' && to.type === 'daily') {
            console.log('🌅 剧情结束，恢复日常BGM');
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            current: this.currentLayer,
            queueLength: this.queue.length,
            historyLength: this.history.length,
            isLocked: this.currentLayer.locked
        };
    }

    /**
     * 清空队列
     */
    clearQueue() {
        this.queue = [];
        console.log('🗑️ 音乐队列已清空');
    }

    /**
     * 强制停止所有音乐
     */
    stopAll() {
        this.currentLayer = {
            type: null,
            bgm: null,
            priority: 0,
            locked: false,
            startTime: null
        };

        if (window.audioSystem) {
            window.audioSystem.stopBGM();
        }

        console.log('⏹️ 所有音乐已停止');
    }
}

// 创建全局实例
window.musicPriority = new MusicPriorityManager();

// 导出测试命令
window.testPriority = {
    // 请求播放不同类型的音乐
    daily: () => musicPriority.requestMusic('daily', 'bgm/daily.mp3'),
    story: () => musicPriority.requestMusic('story', 'bgm/story.mp3'),
    player: () => musicPriority.requestMusic('player', 'bgm/custom.mp3'),

    // 锁定/解锁
    lock: () => musicPriority.lockMusic(),
    unlock: () => musicPriority.unlockMusic(),

    // 查看状态
    status: () => console.table(musicPriority.getStatus()),
    queue: () => console.table(musicPriority.queue),
    history: () => console.table(musicPriority.history),

    // 恢复上一个
    restore: () => musicPriority.restorePrevious()
};

// 导出到全局
window.MusicPriorityManager = MusicPriorityManager;

console.log('🎵 音乐优先级管理器已加载');
console.log('测试命令:');
console.log('  testPriority.daily()  - 请求日常BGM');
console.log('  testPriority.story()  - 请求剧情BGM');
console.log('  testPriority.lock()   - 锁定当前音乐');
console.log('  testPriority.status() - 查看状态');