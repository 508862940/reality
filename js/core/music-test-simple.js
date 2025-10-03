/**
 * 简单音乐测试
 * 直接在控制台测试音乐系统是否工作
 */

console.log('🎵 开始加载音乐测试模块...');

// 手动检查和初始化音乐系统
window.musicTest = {
    init: function() {
        console.log('🔍 检查音乐系统组件...');

        // 检查各个组件
        const components = {
            'AudioSystem': typeof AudioSystem,
            'MusicPriorityManager': typeof MusicPriorityManager,
            'DailyBGMSystem': typeof DailyBGMSystem,
            'NPCMusicSystem': typeof NPCMusicSystem,
            'VenueMusicSystem': typeof VenueMusicSystem
        };

        console.table(components);

        // 尝试手动创建实例
        if (typeof AudioSystem !== 'undefined' && !window.audioSystem) {
            window.audioSystem = new AudioSystem();
            console.log('✅ AudioSystem已初始化');
        }

        if (typeof MusicPriorityManager !== 'undefined' && !window.musicPriority) {
            window.musicPriority = new MusicPriorityManager();
            console.log('✅ MusicPriorityManager已初始化');
        }

        if (typeof DailyBGMSystem !== 'undefined' && !window.dailyBGM) {
            window.dailyBGM = new DailyBGMSystem();
            console.log('✅ DailyBGMSystem已初始化');
        }

        if (typeof NPCMusicSystem !== 'undefined' && !window.npcMusic) {
            window.npcMusic = new NPCMusicSystem();
            console.log('✅ NPCMusicSystem已初始化');
        }

        if (typeof VenueMusicSystem !== 'undefined' && !window.venueMusic) {
            window.venueMusic = new VenueMusicSystem();
            console.log('✅ VenueMusicSystem已初始化');
        }

        // 返回状态
        return {
            audioSystem: !!window.audioSystem,
            musicPriority: !!window.musicPriority,
            dailyBGM: !!window.dailyBGM,
            npcMusic: !!window.npcMusic,
            venueMusic: !!window.venueMusic
        };
    },

    // 简单播放测试
    testPlay: function(audioPath) {
        if (!window.audioSystem) {
            console.error('❌ 音频系统未初始化，请先运行 musicTest.init()');
            return;
        }

        audioPath = audioPath || 'assets/sounds/bgm/zero1.wav';
        console.log(`🎵 测试播放: ${audioPath}`);
        window.audioSystem.playBGM(audioPath);
    },

    // 检查脚本加载状态
    checkScripts: function() {
        const scripts = Array.from(document.querySelectorAll('script'));
        const musicScripts = scripts.filter(s =>
            s.src.includes('music') ||
            s.src.includes('bgm') ||
            s.src.includes('npc-music') ||
            s.src.includes('venue')
        );

        console.log('🎵 音乐相关脚本:');
        musicScripts.forEach(s => {
            console.log(`  ${s.src.split('/').pop()}: ${s.src}`);
        });

        return musicScripts.length;
    }
};

console.log('✅ 音乐测试模块已加载');
console.log('使用方法:');
console.log('  musicTest.checkScripts() - 检查脚本加载');
console.log('  musicTest.init()          - 初始化音乐系统');
console.log('  musicTest.testPlay()      - 测试播放音乐');