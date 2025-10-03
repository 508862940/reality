/**
 * 动态加载音乐系统
 * 解决音乐系统文件未加载的问题
 */

console.log('🎵 开始动态加载音乐系统...');

// 音乐系统文件列表
const musicSystemFiles = [
    'js/core/music-priority-manager.js',
    'js/core/daily-bgm-system.js',
    'js/core/npc-music-system.js',
    'js/core/venue-music-system.js',
    'js/core/bgm-test-config.js'
];

// 动态加载函数
function loadMusicSystems() {
    let loadedCount = 0;
    const totalFiles = musicSystemFiles.length;

    musicSystemFiles.forEach((file, index) => {
        setTimeout(() => {
            const script = document.createElement('script');
            script.src = file;

            script.onload = () => {
                loadedCount++;
                console.log(`✅ [${loadedCount}/${totalFiles}] 加载成功: ${file.split('/').pop()}`);

                // 所有文件加载完成
                if (loadedCount === totalFiles) {
                    console.log('🎉 所有音乐系统已加载完成！');

                    // 检查加载结果
                    const status = {
                        'MusicPriorityManager': typeof MusicPriorityManager,
                        'DailyBGMSystem': typeof DailyBGMSystem,
                        'NPCMusicSystem': typeof NPCMusicSystem,
                        'VenueMusicSystem': typeof VenueMusicSystem,
                        'BGMTestConfig': typeof BGMTestConfig
                    };

                    console.table(status);

                    // 如果都加载成功，显示可用命令
                    if (typeof MusicPriorityManager !== 'undefined') {
                        console.log('📋 可用命令:');
                        console.log('  testPriority.status() - 优先级状态');
                        console.log('  testDaily.morning()   - 日常BGM测试');
                        console.log('  testNPC.meet("Zero")  - NPC音乐测试');
                        console.log('  testVenue.list()      - 场所列表');
                    }
                }
            };

            script.onerror = () => {
                console.error(`❌ 加载失败: ${file}`);
            };

            document.head.appendChild(script);
        }, index * 100); // 每个文件延迟100ms，避免同时加载
    });
}

// 自动执行加载
loadMusicSystems();

// 导出到window供手动调用
window.loadMusicSystems = loadMusicSystems;