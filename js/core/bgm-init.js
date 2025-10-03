/**
 * BGM系统初始化
 * 确保所有音乐系统按正确顺序初始化
 */

(function() {
    // 防止重复初始化
    if (window._bgmInitialized) {
        console.log('⚠️ BGM系统已初始化，跳过重复初始化');
        return;
    }

    console.log('🎵 BGM系统初始化中...');

    // 等待DOM和基础系统加载
    function initBGMSystem() {
        // 检查依赖
        const required = [
            'AudioSystem',
            'MusicPriorityManager',
            'DailyBGMSystem',
            'NPCMusicSystem',
            'VenueMusicSystem'
        ];

        let allReady = true;
        for (const className of required) {
            if (typeof window[className] === 'undefined') {
                console.warn(`⏳ 等待 ${className} 加载...`);
                allReady = false;
                break;
            }
        }

        if (!allReady) {
            // 如果还没准备好，100ms后重试
            setTimeout(initBGMSystem, 100);
            return;
        }

        console.log('✅ 所有音乐类已加载');

        // 初始化音频系统
        if (!window.audioSystem) {
            window.audioSystem = new AudioSystem();
            console.log('✅ AudioSystem已初始化');
        }

        // 初始化优先级管理器
        if (!window.musicPriority) {
            window.musicPriority = new MusicPriorityManager();
            console.log('✅ MusicPriorityManager已初始化');
        }

        // 初始化日常BGM系统
        if (!window.dailyBGM) {
            window.dailyBGM = new DailyBGMSystem();
            console.log('✅ DailyBGMSystem已初始化');
        }

        // 初始化NPC音乐系统
        if (!window.npcMusic) {
            window.npcMusic = new NPCMusicSystem();
            console.log('✅ NPCMusicSystem已初始化');
        }

        // 初始化场所音乐系统
        if (!window.venueMusic) {
            window.venueMusic = new VenueMusicSystem();
            console.log('✅ VenueMusicSystem已初始化');
        }

        // 应用实际BGM配置（如果存在）
        if (window.RealBGMConfig) {
            console.log('🎵 应用实际BGM配置...');
            window.RealBGMConfig.applyConfig();
            console.log('✅ 实际BGM配置已应用');

            // 自动播放当前时段的BGM
            setTimeout(() => {
                if (window.dailyBGM && window.timeSystem) {
                    console.log('🎵 自动播放当前时段BGM...');
                    // 使用正确的方法名
                    window.dailyBGM.playCurrentBGM();
                }
            }, 500);
        }

        console.log('🎉 BGM系统初始化完成！');

        // 标记为已初始化
        window._bgmInitialized = true;

        // 添加全局快捷命令
        window.bgm = {
            play: (file) => window.audioSystem.playBGM(file || 'assets/sounds/还未整理的音乐包合集（不全）/zero1.wav'),
            stop: () => window.audioSystem.stopBGM(),
            volume: (v) => window.audioSystem.setBGMVolume(v),
            test: () => window.RealBGMConfig && window.RealBGMConfig.test(),
            status: () => {
                console.log('🎵 BGM系统状态:');
                console.log('  AudioSystem:', !!window.audioSystem);
                console.log('  MusicPriority:', !!window.musicPriority);
                console.log('  DailyBGM:', !!window.dailyBGM);
                console.log('  NPCMusic:', !!window.npcMusic);
                console.log('  VenueMusic:', !!window.venueMusic);
                if (window.audioSystem) {
                    console.log('  当前BGM:', window.audioSystem.currentBGM || '无');
                    console.log('  BGM音量:', window.audioSystem.bgmVolume);
                }
            }
        };

        console.log('💡 可用命令:');
        console.log('  bgm.play()     - 播放测试BGM');
        console.log('  bgm.stop()     - 停止BGM');
        console.log('  bgm.volume(50) - 设置音量(0-100)');
        console.log('  bgm.test()     - 运行测试');
        console.log('  bgm.status()   - 查看状态');
    }

    // 确保在页面加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initBGMSystem, 100);
        });
    } else {
        // 页面已加载，延迟一点执行以确保其他脚本已运行
        setTimeout(initBGMSystem, 100);
    }
})();