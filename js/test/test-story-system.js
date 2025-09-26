/**
 * 剧情标记系统测试工具
 * 用于在控制台测试剧情标记功能
 */

// ==================== 基础测试函数 ====================

/**
 * 测试剧情标记基础功能
 */
function testStoryFlags() {
    console.log('========== 测试剧情标记系统 ==========');

    // 测试设置标记
    console.log('\n1. 测试设置标记:');
    window.storyFlags.setFlag('TEST_FLAG', true);
    console.log('TEST_FLAG =', window.storyFlags.checkFlag('TEST_FLAG'));

    // 测试计数器
    console.log('\n2. 测试计数器:');
    window.storyFlags.incrementCounter('TEST_COUNTER', 5);
    console.log('TEST_COUNTER =', window.storyFlags.getCounter('TEST_COUNTER'));
    window.storyFlags.incrementCounter('TEST_COUNTER', 3);
    console.log('TEST_COUNTER after +3 =', window.storyFlags.getCounter('TEST_COUNTER'));

    // 测试选择记录
    console.log('\n3. 测试选择记录:');
    window.storyFlags.recordChoice('TEST_CHOICE', 'option_a');
    console.log('TEST_CHOICE =', window.storyFlags.getChoice('TEST_CHOICE'));

    // 测试进度更新
    console.log('\n4. 测试进度更新:');
    window.storyFlags.updateProgress('chapter', 2);
    window.storyFlags.updateProgress('scene', 'test_scene');
    console.log('当前进度:', window.storyFlags.progress);

    // 测试条件检查
    console.log('\n5. 测试条件检查:');
    const condition = {
        flags: ['TEST_FLAG'],
        counters: { TEST_COUNTER: 5 }
    };
    console.log('条件满足?', window.storyFlags.checkCondition(condition));

    console.log('\n========== 基础测试完成 ==========');
}

/**
 * 测试剧情事件系统
 */
function testStoryEvents() {
    console.log('\n========== 测试剧情事件系统 ==========');

    // 设置初始标记模拟游戏开始
    console.log('\n1. 设置游戏开始:');
    window.storyFlags.setFlag('GAME_STARTED', true);

    // 测试事件查找
    console.log('\n2. 查找觉醒事件:');
    const awakeningEvent = window.storyEventHelpers.findEventById('awakening');
    console.log('找到事件:', awakeningEvent ? awakeningEvent.name : '未找到');

    // 测试事件条件检查
    console.log('\n3. 检查事件触发条件:');
    const canTrigger = window.storyEventHelpers.canTriggerEvent('awakening');
    console.log('觉醒事件可以触发?', canTrigger);

    // 测试触发事件效果
    console.log('\n4. 触发事件效果:');
    window.storyEventHelpers.triggerEventEffects('awakening');
    console.log('章节进度:', window.storyFlags.progress);

    // 测试处理选择
    console.log('\n5. 处理玩家选择:');
    const nextEvent = window.storyEventHelpers.processEventChoice('awakening', 'explore_room');
    console.log('下一个事件:', nextEvent);
    console.log('探索房间标记:', window.storyFlags.checkFlag('EXPLORED_ROOM'));

    // 测试获取可用事件
    console.log('\n6. 获取当前可用事件:');
    const availableEvents = window.storyEventHelpers.getAvailableEvents();
    console.log('可用事件数量:', availableEvents.length);
    availableEvents.forEach(event => {
        console.log('-', event.name);
    });

    console.log('\n========== 事件测试完成 ==========');
}

/**
 * 模拟完整剧情流程
 */
function simulateStoryFlow() {
    console.log('\n========== 模拟剧情流程 ==========');

    // 重置所有数据
    console.log('\n1. 重置剧情数据...');
    window.storyFlags.init();

    // 开始游戏
    console.log('\n2. 开始游戏...');
    window.storyFlags.setFlag('GAME_STARTED', true);
    window.storyEventHelpers.triggerEventEffects('awakening');

    // 模拟玩家选择：探索房间
    console.log('\n3. 玩家选择：探索房间');
    window.storyEventHelpers.processEventChoice('awakening', 'explore_room');

    // 模拟遇见Zero
    console.log('\n4. 模拟遇见Zero...');
    window.storyFlags.incrementCounter('ZERO_MEETINGS', 1);
    window.storyFlags.setFlag('MET_ZERO', true);

    // 模拟玩家选择：信任Zero
    console.log('\n5. 玩家选择：信任Zero');
    window.storyEventHelpers.processEventChoice('first_meeting_zero', 'trust_zero');

    // 增加与Zero的见面次数
    console.log('\n6. 增加与Zero的互动...');
    for (let i = 0; i < 3; i++) {
        window.storyFlags.incrementCounter('ZERO_MEETINGS', 1);
    }
    console.log('Zero见面次数:', window.storyFlags.getCounter('ZERO_MEETINGS'));

    // 检查狼魂事件是否可触发
    console.log('\n7. 检查狼魂发现事件:');
    const canTriggerWolf = window.storyEventHelpers.canTriggerEvent('wolf_soul_discovery');
    console.log('狼魂事件可以触发?', canTriggerWolf);

    // 显示当前剧情摘要
    console.log('\n8. 当前剧情状态摘要:');
    const summary = window.storyFlags.getSummary();
    console.log(summary);

    console.log('\n========== 流程模拟完成 ==========');
}

/**
 * 测试存档和读档
 */
async function testSaveLoad() {
    console.log('\n========== 测试存档/读档 ==========');

    // 设置一些剧情数据
    console.log('\n1. 设置测试数据...');
    window.storyFlags.setFlag('SAVE_TEST_FLAG', true);
    window.storyFlags.incrementCounter('SAVE_TEST_COUNTER', 10);
    window.storyFlags.recordChoice('SAVE_TEST_CHOICE', 'test_value');

    // 保存当前状态
    console.log('\n2. 创建存档...');
    try {
        const save = await window.saveSystem.createSave('manual', null, '剧情系统测试存档');
        console.log('存档创建成功:', save.id);

        // 清空当前数据
        console.log('\n3. 清空当前数据...');
        window.storyFlags.init();
        console.log('SAVE_TEST_FLAG =', window.storyFlags.checkFlag('SAVE_TEST_FLAG'));
        console.log('SAVE_TEST_COUNTER =', window.storyFlags.getCounter('SAVE_TEST_COUNTER'));

        // 读取存档
        console.log('\n4. 读取存档...');
        const loadedSave = await window.saveSystem.loadSave(save.id);

        // 恢复剧情数据
        if (loadedSave.gameData.storyData) {
            window.storyFlags.load(loadedSave.gameData.storyData);
            console.log('剧情数据已恢复');
        }

        // 验证恢复的数据
        console.log('\n5. 验证恢复的数据:');
        console.log('SAVE_TEST_FLAG =', window.storyFlags.checkFlag('SAVE_TEST_FLAG'));
        console.log('SAVE_TEST_COUNTER =', window.storyFlags.getCounter('SAVE_TEST_COUNTER'));
        console.log('SAVE_TEST_CHOICE =', window.storyFlags.getChoice('SAVE_TEST_CHOICE'));

        // 清理测试存档
        console.log('\n6. 清理测试存档...');
        await window.saveSystem.deleteSave(save.id);
        console.log('测试存档已删除');

    } catch (error) {
        console.error('存档测试失败:', error);
    }

    console.log('\n========== 存档测试完成 ==========');
}

/**
 * 显示剧情统计
 */
function showStoryStats() {
    console.log('\n========== 剧情统计信息 ==========');

    const stats = {
        totalFlags: Object.keys(window.storyFlags.flags).length,
        trueFlags: Object.values(window.storyFlags.flags).filter(v => v === true).length,
        totalCounters: Object.keys(window.storyFlags.counters).length,
        totalChoices: Object.keys(window.storyFlags.choices).length,
        currentChapter: window.storyFlags.progress.chapter,
        currentScene: window.storyFlags.progress.scene,
        eventHistory: window.storyFlags.eventHistory.length
    };

    console.table(stats);

    console.log('\n激活的标记:');
    Object.entries(window.storyFlags.flags)
        .filter(([k, v]) => v === true)
        .forEach(([key]) => console.log('-', key));

    console.log('\n计数器值:');
    Object.entries(window.storyFlags.counters)
        .filter(([k, v]) => v > 0)
        .forEach(([key, value]) => console.log(`- ${key}: ${value}`));

    console.log('\n玩家选择:');
    Object.entries(window.storyFlags.choices)
        .forEach(([key, value]) => console.log(`- ${key}: ${value}`));

    console.log('\n========== 统计完成 ==========');
}

/**
 * 运行所有测试
 */
async function runAllStoryTests() {
    console.clear();
    console.log('%c🎮 Reality游戏 - 剧情系统测试套件', 'font-size: 16px; font-weight: bold; color: #f093fb;');

    // 运行基础测试
    testStoryFlags();

    // 延迟执行后续测试
    await new Promise(resolve => setTimeout(resolve, 1000));
    testStoryEvents();

    await new Promise(resolve => setTimeout(resolve, 1000));
    simulateStoryFlow();

    await new Promise(resolve => setTimeout(resolve, 1000));
    await testSaveLoad();

    await new Promise(resolve => setTimeout(resolve, 1000));
    showStoryStats();

    console.log('\n%c✅ 所有测试完成！', 'font-size: 14px; font-weight: bold; color: #4ade80;');
    console.log('\n可用的测试命令:');
    console.log('- testStoryFlags()     : 测试标记基础功能');
    console.log('- testStoryEvents()    : 测试事件系统');
    console.log('- simulateStoryFlow()  : 模拟剧情流程');
    console.log('- testSaveLoad()       : 测试存档功能');
    console.log('- showStoryStats()     : 显示统计信息');
    console.log('- runAllStoryTests()   : 运行所有测试');
}

// 导出测试函数到全局
window.storyTests = {
    testFlags: testStoryFlags,
    testEvents: testStoryEvents,
    simulate: simulateStoryFlow,
    testSave: testSaveLoad,
    stats: showStoryStats,
    runAll: runAllStoryTests
};

console.log('📚 剧情系统测试工具已加载');
console.log('使用 storyTests.runAll() 运行所有测试');
console.log('或使用 storyTests.testFlags() 等单独测试');