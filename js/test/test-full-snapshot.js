/**
 * 测试完整的世界快照系统 - ABCDEF全区域覆盖
 */

console.log('🧪 开始测试完整世界快照系统');

// 测试用例：验证所有区域的快照和恢复
function testFullSnapshot() {
    console.log('\n=== 测试ABCDEF全区域快照 ===');

    if (!window.worldState) {
        console.error('❌ worldState不存在');
        return;
    }

    // 准备测试数据
    const testData = {
        // A区 - 视觉状态
        visual: {
            sprite: 'test_sprite.png',
            expression: 'happy',
            outfit: 'casual',
            pose: 'sitting'
        },

        // B区 - 时空坐标
        time: {
            day: 5,
            hour: 14,
            minute: 30
        },
        position: {
            location: '教室',
            map: 'school'
        },

        // C区 - 场景
        scene: {
            id: 'test_scene',
            description: '测试场景描述'
        },

        // D区 - 状态面板
        stats: {
            health: 85,
            mood: 70,
            money: 1500,
            energy: 60,
            spirit: 75
        },
        inventory: {
            items: ['书本', '面包', '水瓶']
        },
        journal: {
            mainQuests: ['找到Zero'],
            achievements: ['初次觉醒']
        },

        // E区 - 通知
        notification: '系统提示：测试中',

        // F区 - 剧情
        storyContent: '<p>这是测试剧情文本</p>'
    };

    console.log('📝 设置测试数据...');

    // 设置测试数据到worldState
    if (window.worldState.state) {
        // 更新player数据
        window.worldState.state.player.visual = testData.visual;
        window.worldState.state.player.stats = testData.stats;
        window.worldState.state.player.position.location = testData.position.location;
        window.worldState.state.player.journal.mainQuests = testData.journal.mainQuests;
        window.worldState.state.player.journal.achievements = testData.journal.achievements;

        // 更新时间
        window.worldState.state.time = testData.time;

        // 更新通知
        window.worldState.state.notifications.current = testData.notification;
    }

    // 模拟DOM元素
    createMockDOM(testData);

    console.log('\n📸 创建世界快照...');
    const snapshot = window.worldState.getFullState();

    // 验证快照内容
    console.log('\n🔍 验证快照内容：');
    const checks = {
        '✅ A区-视觉状态': snapshot.player?.visual?.expression === 'happy',
        '✅ B区-时间': snapshot.time?.day === 5 && snapshot.time?.hour === 14,
        '✅ B区-位置': snapshot.player?.position?.location === '教室',
        '✅ C区-场景': snapshot.currentSceneData !== undefined,
        '✅ D区-状态条': snapshot.player?.stats?.health === 85,
        '✅ D区-背包': snapshot.player?.inventory !== undefined,
        '✅ D区-日志': snapshot.player?.journal?.mainQuests?.includes('找到Zero'),
        '✅ E区-通知': snapshot.notifications?.current === '系统提示：测试中',
        '✅ F区-剧情': snapshot.f1Content !== undefined
    };

    Object.entries(checks).forEach(([name, pass]) => {
        console.log(`${name}: ${pass ? '通过' : '失败'}`);
    });

    // 修改数据
    console.log('\n🔄 修改当前数据...');
    window.worldState.state.player.stats.health = 50;
    window.worldState.state.time.hour = 20;
    window.worldState.state.notifications.current = '已修改';

    // 恢复快照
    console.log('\n⏮️ 恢复世界快照...');
    window.worldState.loadFullState(snapshot);

    // 验证恢复结果
    console.log('\n🔍 验证恢复结果：');
    const restoreChecks = {
        '✅ 健康值恢复': window.worldState.state.player.stats.health === 85,
        '✅ 时间恢复': window.worldState.state.time.hour === 14,
        '✅ 通知恢复': window.worldState.state.notifications.current === '系统提示：测试中'
    };

    Object.entries(restoreChecks).forEach(([name, pass]) => {
        console.log(`${name}: ${pass ? '通过' : '失败'}`);
    });

    console.log('\n✅ 测试完成！');
}

// 创建模拟DOM元素
function createMockDOM(data) {
    // 确保有基本的DOM结构
    if (!document.getElementById('storyArea')) {
        const div = document.createElement('div');
        div.id = 'storyArea';
        div.innerHTML = data.storyContent;
        document.body.appendChild(div);
    }

    if (!document.getElementById('noticeText')) {
        const div = document.createElement('div');
        div.id = 'noticeText';
        div.textContent = data.notification;
        document.body.appendChild(div);
    }
}

// 测试时光倒流与快照的集成
function testRewindIntegration() {
    console.log('\n=== 测试时光倒流集成 ===');

    if (!window.sceneManager) {
        console.log('⚠️ sceneManager不存在，跳过集成测试');
        return;
    }

    // 保存快照
    console.log('📸 保存世界快照...');
    window.sceneManager.saveWorldSnapshot();

    // 修改一些数据
    if (window.reactiveGameState) {
        window.reactiveGameState.health = 60;
        window.reactiveGameState.mood = 40;
    }

    console.log('⏮️ 触发时光倒流...');

    // 模拟重置
    setTimeout(() => {
        window.sceneManager.restoreWorldSnapshot();

        // 检查响应式系统是否更新
        setTimeout(() => {
            if (window.reactiveGameState) {
                console.log('✅ 响应式系统已更新');
                console.log('健康值:', window.reactiveGameState.health);
                console.log('心情值:', window.reactiveGameState.mood);
            }
        }, 1000);
    }, 500);
}

// 运行测试
window.addEventListener('load', () => {
    setTimeout(() => {
        testFullSnapshot();
        testRewindIntegration();
    }, 1000);
});

// 导出测试函数
window.testFullSnapshot = testFullSnapshot;
window.testRewindIntegration = testRewindIntegration;

console.log('💡 可以手动调用: testFullSnapshot() 或 testRewindIntegration()');