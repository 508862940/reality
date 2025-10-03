/**
 * BGM调试工具
 * 用于检查和修复BGM系统问题
 */

console.log('🔍 开始BGM系统诊断...');

// 检查各个组件的加载状态
const checkStatus = {
    'AudioSystem': typeof AudioSystem,
    'MusicPriorityManager': typeof MusicPriorityManager,
    'DailyBGMSystem': typeof DailyBGMSystem,
    'NPCMusicSystem': typeof NPCMusicSystem,
    'VenueMusicSystem': typeof VenueMusicSystem,
    'RealBGMConfig': typeof RealBGMConfig,
    'window.audioSystem': typeof window.audioSystem,
    'window.musicPriority': typeof window.musicPriority,
    'window.dailyBGM': typeof window.dailyBGM,
    'window.npcMusic': typeof window.npcMusic,
    'window.venueMusic': typeof window.venueMusic,
    'window.bgm': typeof window.bgm
};

console.table(checkStatus);

// 手动初始化函数
window.initBGM = function() {
    console.log('🚀 手动初始化BGM系统...');

    try {
        // 1. 初始化音频系统
        if (typeof AudioSystem !== 'undefined' && !window.audioSystem) {
            window.audioSystem = new AudioSystem();
            console.log('✅ AudioSystem已初始化');
        }

        // 2. 初始化优先级管理器
        if (typeof MusicPriorityManager !== 'undefined' && !window.musicPriority) {
            window.musicPriority = new MusicPriorityManager();
            console.log('✅ MusicPriorityManager已初始化');
        }

        // 3. 初始化日常BGM
        if (typeof DailyBGMSystem !== 'undefined' && !window.dailyBGM) {
            window.dailyBGM = new DailyBGMSystem();
            console.log('✅ DailyBGMSystem已初始化');
        }

        // 4. 初始化NPC音乐
        if (typeof NPCMusicSystem !== 'undefined' && !window.npcMusic) {
            window.npcMusic = new NPCMusicSystem();
            console.log('✅ NPCMusicSystem已初始化');
        }

        // 5. 初始化场所音乐
        if (typeof VenueMusicSystem !== 'undefined' && !window.venueMusic) {
            window.venueMusic = new VenueMusicSystem();
            console.log('✅ VenueMusicSystem已初始化');
        }

        // 6. 应用配置
        if (window.RealBGMConfig) {
            window.RealBGMConfig.applyConfig();
            console.log('✅ 实际BGM配置已应用');
        }

        // 7. 创建快捷命令
        window.bgm = {
            play: function(file) {
                if (!window.audioSystem) {
                    console.error('❌ 音频系统未初始化');
                    return;
                }
                file = file || 'assets/sounds/还未整理的音乐包合集（不全）/zero1.wav';
                console.log('🎵 播放:', file);
                window.audioSystem.playBGM(file);
            },

            stop: function() {
                if (!window.audioSystem) {
                    console.error('❌ 音频系统未初始化');
                    return;
                }
                window.audioSystem.stopBGM();
                console.log('⏹️ BGM已停止');
            },

            volume: function(v) {
                if (!window.audioSystem) {
                    console.error('❌ 音频系统未初始化');
                    return;
                }
                window.audioSystem.setBGMVolume(v);
                console.log(`🔊 音量设置为: ${v}`);
            },

            test: function() {
                if (window.RealBGMConfig) {
                    window.RealBGMConfig.test();
                } else {
                    console.error('❌ RealBGMConfig未加载');
                }
            },

            status: function() {
                console.log('📊 BGM系统状态:');
                console.log('  AudioSystem:', !!window.audioSystem);
                console.log('  MusicPriority:', !!window.musicPriority);
                console.log('  DailyBGM:', !!window.dailyBGM);
                console.log('  NPCMusic:', !!window.npcMusic);
                console.log('  VenueMusic:', !!window.venueMusic);
                if (window.audioSystem && window.audioSystem.bgmPlayer) {
                    console.log('  当前BGM:', window.audioSystem.currentBGM || '无');
                    console.log('  BGM音量:', window.audioSystem.bgmVolume);
                    console.log('  播放状态:', !window.audioSystem.bgmPlayer.paused ? '播放中' : '已停止');
                }
            },

            // 直接播放测试
            quickTest: function() {
                console.log('🎵 快速测试播放...');
                const audio = new Audio('assets/sounds/还未整理的音乐包合集（不全）/zero1.wav');
                audio.volume = 0.5;
                audio.play().then(() => {
                    console.log('✅ 音频播放成功');
                    setTimeout(() => {
                        audio.pause();
                        console.log('⏹️ 测试播放停止');
                    }, 3000);
                }).catch(e => {
                    console.error('❌ 播放失败:', e);
                });
            }
        };

        console.log('✅ BGM快捷命令已创建');
        console.log('💡 可用命令:');
        console.log('  bgm.play()      - 播放默认BGM');
        console.log('  bgm.stop()      - 停止BGM');
        console.log('  bgm.volume(50)  - 设置音量(0-100)');
        console.log('  bgm.test()      - 运行完整测试');
        console.log('  bgm.status()    - 查看状态');
        console.log('  bgm.quickTest() - 快速测试音频');

        return true;

    } catch (error) {
        console.error('❌ 初始化失败:', error);
        return false;
    }
};

// 尝试自动初始化
if (typeof AudioSystem !== 'undefined') {
    console.log('✅ AudioSystem类已加载，正在初始化...');
    window.initBGM();
} else {
    console.log('⚠️ AudioSystem类未加载');
    console.log('请运行 initBGM() 手动初始化');
}

console.log('📋 调试命令:');
console.log('  initBGM()       - 手动初始化BGM系统');
console.log('  bgm.quickTest() - 快速测试音频播放');