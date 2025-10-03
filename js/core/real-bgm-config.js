/**
 * 实际BGM配置
 * 使用现有的音频文件配置游戏音乐
 */

// 防止重复定义
if (window.RealBGMConfig) {
    console.log('⚠️ RealBGMConfig已存在，跳过重复定义');
} else {
    window.RealBGMConfig = {
    // 基于你现有的文件配置
    files: {
        // BGM类
        zero_theme: 'assets/sounds/还未整理的音乐包合集（不全）/zero1.wav',
        luyang_theme: 'assets/sounds/还未整理的音乐包合集（不全）/luyang.wav',
        school_afternoon: 'assets/sounds/还未整理的音乐包合集（不全）/放学后轻.mp3',
        sad_story_1: 'assets/sounds/还未整理的音乐包合集（不全）/悲伤剧情1.mp3',
        sad_story_2: 'assets/sounds/还未整理的音乐包合集（不全）/悲伤剧情2，更严重.mp3',

        // 音效类
        save_sound: 'assets/sounds/还未整理的音乐包合集（不全）/保存.mp3',
        click_sound: 'assets/sounds/还未整理的音乐包合集（不全）/点开插图查看.mp3',
        footstep_snow: 'assets/sounds/还未整理的音乐包合集（不全）/踩雪.wav',
        dog_bark: 'assets/sounds/还未整理的音乐包合集（不全）/短狗吠.wav'
    },

    // 应用到游戏系统
    applyConfig: function() {
        console.log('🎵 应用实际BGM配置...');

        // 配置日常BGM
        if (window.dailyBGM) {
            // 春季
            window.dailyBGM.bgmConfig.spring.morning = this.files.school_afternoon;
            window.dailyBGM.bgmConfig.spring.afternoon = this.files.school_afternoon;
            window.dailyBGM.bgmConfig.spring.evening = this.files.luyang_theme;
            window.dailyBGM.bgmConfig.spring.night = this.files.zero_theme;

            // 夏季（暂时用同样的）
            window.dailyBGM.bgmConfig.summer.morning = this.files.school_afternoon;
            window.dailyBGM.bgmConfig.summer.night = this.files.zero_theme;

            // 秋季
            window.dailyBGM.bgmConfig.autumn.morning = this.files.luyang_theme;
            window.dailyBGM.bgmConfig.autumn.evening = this.files.sad_story_1;

            // 冬季
            window.dailyBGM.bgmConfig.winter.morning = this.files.school_afternoon;
            window.dailyBGM.bgmConfig.winter.night = this.files.sad_story_2;

            // 清除不存在的天气BGM
            window.dailyBGM.weatherBGM = {};

            console.log('✅ 日常BGM已配置');
        }

        // 配置NPC音乐
        if (window.npcMusic) {
            // Zero的主题
            window.npcMusic.npcThemes.Zero.themes.stranger = this.files.zero_theme;
            window.npcMusic.npcThemes.Zero.themes.friend = this.files.zero_theme;
            window.npcMusic.npcThemes.Zero.themes.close = this.files.zero_theme;
            window.npcMusic.npcThemes.Zero.themes.lover = this.files.zero_theme;

            // Zero的特殊场景
            window.npcMusic.npcThemes.Zero.special.memory = this.files.sad_story_1;
            window.npcMusic.npcThemes.Zero.special.battle = this.files.luyang_theme;

            console.log('✅ NPC音乐已配置');
        }

        // 配置场所音乐
        if (window.venueMusic) {
            // 电影院
            window.venueMusic.venues.cinema.bgm.lobby = this.files.school_afternoon;

            // 图书馆（安静的音乐）
            window.venueMusic.venues.library.special.studying_with_npc = this.files.luyang_theme;

            console.log('✅ 场所音乐已配置');
        }

        console.log('🎉 实际BGM配置完成！');
    },

    // 测试播放
    test: function() {
        console.log('🎵 测试实际音频文件...');

        // 确保音频系统初始化
        if (!window.audioSystem) {
            window.audioSystem = new AudioSystem();
        }

        // 应用配置
        this.applyConfig();

        // 播放测试
        console.log('🎵 播放: Zero主题曲');
        window.audioSystem.playBGM(this.files.zero_theme);

        setTimeout(() => {
            console.log('🎵 切换到: 放学后');
            window.audioSystem.playBGM(this.files.school_afternoon);
        }, 5000);

        setTimeout(() => {
            console.log('🎵 测试音效: 保存音');
            window.audioSystem.playSFX(this.files.save_sound);
        }, 8000);

        setTimeout(() => {
            console.log('🎵 测试NPC音乐（如果系统已加载）');
            if (window.npcMusic && typeof window.npcMusic.playPrivateBGM === 'function') {
                window.npcMusic.playPrivateBGM("Zero");
            } else {
                console.log('⚠️ NPC音乐系统尚未完全加载，跳过测试');
            }
        }, 10000);
    }
    };

    console.log('🎵 实际BGM配置已加载');
    console.log('使用方法:');
    console.log('  RealBGMConfig.applyConfig() - 应用配置');
    console.log('  RealBGMConfig.test()        - 测试播放');
}