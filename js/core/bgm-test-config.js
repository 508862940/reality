/**
 * BGM测试配置
 * 使用现有的音频文件进行测试
 */

// 如果你有音频文件，可以修改这里的路径
window.BGMTestConfig = {
    // 使用你现有的音频文件进行测试
    testFiles: {
        zero1: 'assets/sounds/还未整理的音乐包合集（不全）/zero1.wav',
        observer: 'assets/sounds/bgm/observer.mp3',
        // 如果有其他文件，在这里添加
        // example: 'assets/sounds/还未整理的音乐包合集（不全）/其他文件.mp3'
    },

    // 临时覆盖BGM配置（用现有文件测试）
    overrideConfig: function() {
        if (window.dailyBGM) {
            // 覆盖日常BGM为测试文件
            window.dailyBGM.bgmConfig.spring.morning = this.testFiles.zero1 || 'bgm/placeholder.mp3';
            window.dailyBGM.bgmConfig.spring.night = this.testFiles.observer || 'bgm/placeholder.mp3';

            // 清除天气BGM（避免404）
            window.dailyBGM.weatherBGM.rainy = null;

            console.log('✅ BGM配置已覆盖为测试文件');
        }

        if (window.npcMusic) {
            // 覆盖NPC音乐
            window.npcMusic.npcThemes.Zero.themes.friend = this.testFiles.zero1 || 'bgm/placeholder.mp3';
            console.log('✅ NPC音乐配置已覆盖');
        }
    },

    // 测试播放
    test: function() {
        console.log('🎵 开始测试BGM系统...');

        // 覆盖配置
        this.overrideConfig();

        // 清除当前天气（避免播放雨天BGM）
        if (window.weatherSystem) {
            window.weatherSystem.currentWeather = 'sunny';
        }

        // 播放早晨BGM
        console.log('🌅 播放早晨BGM...');
        testDaily.morning();

        setTimeout(() => {
            console.log('🌙 切换到夜晚BGM...');
            testDaily.night();
        }, 5000);

        setTimeout(() => {
            console.log('💕 测试NPC音乐...');
            testNPC.private("Zero");
        }, 10000);
    }
};

console.log('🎵 BGM测试配置已加载');
console.log('使用 BGMTestConfig.test() 进行测试');
console.log('使用 BGMTestConfig.overrideConfig() 覆盖配置');