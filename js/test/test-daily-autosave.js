/**
 * 测试游戏内每日早上5点自动存档
 * 快速验证时间系统触发的自动存档
 */

async function testDailyAutoSave() {
    console.log('========== 测试游戏内每日5点自动存档 ==========');

    if (!window.timeSystem) {
        console.error('❌ 时间系统未初始化');
        return false;
    }

    if (!window.saveSystem) {
        console.error('❌ 存档系统未初始化');
        return false;
    }

    try {
        // 保存当前时间
        const originalTime = { ...window.timeSystem.currentTime };
        console.log('📅 当前游戏时间:', window.timeSystem.formatTime('long'));

        // 测试场景1：从凌晨4:30推进到5:30（应该触发存档）
        console.log('\n🧪 测试1: 从4:30推进到5:30');
        window.timeSystem.currentTime = {
            day: 1,
            hour: 4,
            minute: 30,
            weekday: 1
        };
        console.log('设置时间为 4:30');

        // 清除上次存档时间，确保能触发
        window.saveSystem.lastAutoSaveTime = 0;

        // 推进60分钟
        const change1 = window.timeSystem.advanceTime(60);
        console.log('推进60分钟后:', window.timeSystem.formatTime('long'));

        if (change1.crossedSaveTime) {
            console.log('✅ 成功检测到经过5点');
        } else {
            console.log('❌ 未检测到经过5点');
        }

        // 等待自动存档完成
        await new Promise(resolve => setTimeout(resolve, 500));

        // 检查自动存档是否创建
        const autoSave1 = await window.saveSystem.loadSave('auto_0');
        if (autoSave1) {
            console.log('✅ 自动存档已创建');
        }

        // 测试场景2：从晚上23:00推进到第二天6:00（跨天并经过5点）
        console.log('\n🧪 测试2: 从23:00推进到第二天6:00');
        window.timeSystem.currentTime = {
            day: 1,
            hour: 23,
            minute: 0,
            weekday: 1
        };
        console.log('设置时间为第1天 23:00');

        // 清除上次存档时间
        window.saveSystem.lastAutoSaveTime = 0;

        // 推进7小时
        const change2 = window.timeSystem.advanceTime(7 * 60);
        console.log('推进7小时后:', window.timeSystem.formatTime('long'));

        if (change2.crossedSaveTime) {
            console.log('✅ 成功检测到跨天经过5点');
        } else {
            console.log('❌ 未检测到跨天经过5点');
        }

        // 测试场景3：从5:00推进到5:01（刚好在5点）
        console.log('\n🧪 测试3: 从5:00推进到5:01');
        window.timeSystem.currentTime = {
            day: 2,
            hour: 5,
            minute: 0,
            weekday: 2
        };
        console.log('设置时间为 5:00');

        window.saveSystem.lastAutoSaveTime = 0;

        const change3 = window.timeSystem.advanceTime(1);
        console.log('推进1分钟后:', window.timeSystem.formatTime('long'));

        if (change3.crossedSaveTime) {
            console.log('❌ 不应该触发（已经过了5点）');
        } else {
            console.log('✅ 正确：5:00到5:01不触发');
        }

        // 测试场景4：从4:59推进到5:00（正好到达5点）
        console.log('\n🧪 测试4: 从4:59推进到5:00');
        window.timeSystem.currentTime = {
            day: 3,
            hour: 4,
            minute: 59,
            weekday: 3
        };
        console.log('设置时间为 4:59');

        window.saveSystem.lastAutoSaveTime = 0;

        const change4 = window.timeSystem.advanceTime(1);
        console.log('推进1分钟后:', window.timeSystem.formatTime('long'));

        if (change4.crossedSaveTime) {
            console.log('✅ 正确触发（到达5:00）');
        } else {
            console.log('❌ 应该触发但没有');
        }

        // 恢复原始时间
        window.timeSystem.currentTime = originalTime;
        console.log('\n📅 已恢复游戏时间:', window.timeSystem.formatTime('long'));

        console.log('\n========== 每日5点自动存档测试完成 ==========');
        return true;

    } catch (error) {
        console.error('❌ 测试失败:', error);
        return false;
    }
}

// 快速测试函数 - 模拟游戏中经过5点
async function quickTestDaily5AM() {
    console.log('⚡ 快速测试：将时间设为4:55并推进10分钟...');

    if (!window.timeSystem || !window.saveSystem) {
        console.error('系统未初始化');
        return;
    }

    // 设置时间为4:55
    window.timeSystem.currentTime = {
        day: window.timeSystem.currentTime.day,
        hour: 4,
        minute: 55,
        weekday: window.timeSystem.currentTime.weekday
    };

    console.log('当前时间:', window.timeSystem.formatTime('icon'));

    // 清除防抖
    window.saveSystem.lastAutoSaveTime = 0;

    // 推进10分钟（会经过5:00）
    window.timeSystem.advanceTime(10);

    console.log('推进后时间:', window.timeSystem.formatTime('icon'));
    console.log('💡 如果看到"游戏时间到达早上5点"的提示，说明功能正常');
}

// 导出到全局
window.testDailyAutoSave = testDailyAutoSave;
window.quickTestDaily5AM = quickTestDaily5AM;

console.log('📝 每日5点自动存档测试已加载');
console.log('可用命令：');
console.log('  testDailyAutoSave() - 完整测试');
console.log('  quickTestDaily5AM() - 快速测试（推荐）');