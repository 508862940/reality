/**
 * 世界状态测试工具
 * 验证统一世界状态的存档和恢复
 */

const TestWorldState = {
    /**
     * 1. 测试世界状态初始化
     */
    testInit() {
        console.log('========== 测试世界状态初始化 ==========');

        if (!window.worldState) {
            console.error('❌ 世界状态管理器未加载');
            return false;
        }

        console.log('🌍 当前世界状态:');
        console.log('  玩家名称:', window.worldState.state.player.name);
        console.log('  玩家位置:', window.worldState.getPlayerPosition());
        console.log('  游戏时间:', window.worldState.state.time);
        console.log('  当前场景:', window.worldState.state.story.currentSceneId);

        return true;
    },

    /**
     * 2. 测试修改世界状态
     */
    testModify() {
        console.log('\n========== 测试修改世界状态 ==========');

        // 修改玩家数据
        window.worldState.state.player.name = '测试玩家';
        window.worldState.state.player.stats.health = 75;
        window.worldState.state.player.stats.money = 999;

        // 修改位置
        window.worldState.setPlayerPosition('classroom', 'school');

        // 修改NPC关系
        window.worldState.updateNPCRelationship('Zero', 10, 5);

        // 修改时间
        window.worldState.state.time.hour = 14;
        window.worldState.state.time.minute = 30;

        console.log('✅ 世界状态已修改:');
        console.log('  玩家名称:', window.worldState.state.player.name);
        console.log('  玩家健康:', window.worldState.state.player.stats.health);
        console.log('  玩家金钱:', window.worldState.state.player.stats.money);
        console.log('  玩家位置:', window.worldState.getPlayerPosition());
        console.log('  Zero关系:', window.worldState.getNPC('Zero').relationship);
        console.log('  游戏时间:', window.worldState.state.time);

        return true;
    },

    /**
     * 3. 测试存档
     */
    async testSave() {
        console.log('\n========== 测试统一世界存档 ==========');

        if (!window.saveSystem) {
            console.error('❌ 存档系统未初始化');
            return null;
        }

        // 执行快速存档
        const result = await window.saveSystem.quickSave();

        if (result) {
            console.log('✅ 存档成功！');
            console.log('  存档ID:', result.id);

            // 检查是否包含世界数据
            if (result.gameData.worldData) {
                console.log('✅ 存档包含完整世界数据:');
                const world = result.gameData.worldData;
                console.log('  - 玩家数据:', world.player ? '✓' : '✗');
                console.log('  - NPC数据:', world.npcs ? '✓' : '✗');
                console.log('  - 时间数据:', world.time ? '✓' : '✗');
                console.log('  - 剧情数据:', world.story ? '✓' : '✗');
                console.log('  - 环境数据:', world.environment ? '✓' : '✗');

                // 详细检查
                if (world.player) {
                    console.log('\n📝 玩家数据详情:');
                    console.log('  名称:', world.player.name);
                    console.log('  位置:', world.player.position.location);
                    console.log('  状态:', world.player.stats);
                }

                if (world.npcs && world.npcs.Zero) {
                    console.log('\n👥 NPC数据详情:');
                    console.log('  Zero关系:', world.npcs.Zero.relationship);
                }

                return result.id;
            } else {
                console.warn('⚠️ 存档未包含世界数据');
                return null;
            }
        }

        console.error('❌ 存档失败');
        return null;
    },

    /**
     * 4. 修改状态后的二次测试
     */
    testModifyAgain() {
        console.log('\n========== 修改世界状态（准备对比）==========');

        // 大幅修改状态
        window.worldState.state.player.name = '另一个玩家';
        window.worldState.state.player.stats.health = 10;
        window.worldState.state.player.stats.money = 0;
        window.worldState.setPlayerPosition('dormitory', 'school');
        window.worldState.state.time.day = 5;
        window.worldState.state.time.hour = 23;

        console.log('✅ 状态已大幅修改:');
        console.log('  玩家名称:', window.worldState.state.player.name);
        console.log('  玩家健康:', window.worldState.state.player.stats.health);
        console.log('  玩家金钱:', window.worldState.state.player.stats.money);
        console.log('  玩家位置:', window.worldState.getPlayerPosition());
        console.log('  游戏时间: 第', window.worldState.state.time.day, '天',
            window.worldState.state.time.hour, '时');
    },

    /**
     * 5. 测试读档恢复
     */
    async testLoad(saveId) {
        console.log('\n========== 测试读档恢复世界 ==========');

        if (!saveId) {
            console.error('❌ 需要存档ID');
            return false;
        }

        // 读取存档
        const saveData = await window.saveSystem.loadSave(saveId);

        if (!saveData) {
            console.error('❌ 无法读取存档');
            return false;
        }

        console.log('📂 读取存档:', saveData.name);

        // 恢复世界状态
        if (saveData.gameData.worldData) {
            window.worldState.loadFullState(saveData.gameData.worldData);
            console.log('✅ 世界状态已恢复');

            // 验证恢复结果
            console.log('\n📋 恢复后的世界状态:');
            console.log('  玩家名称:', window.worldState.state.player.name);
            console.log('  玩家健康:', window.worldState.state.player.stats.health);
            console.log('  玩家金钱:', window.worldState.state.player.stats.money);
            console.log('  玩家位置:', window.worldState.getPlayerPosition());
            console.log('  游戏时间: 第', window.worldState.state.time.day, '天',
                window.worldState.state.time.hour, '时');

            // 检查NPC数据
            if (window.worldState.state.npcs.Zero) {
                console.log('  Zero关系:', window.worldState.state.npcs.Zero.relationship);
            }

            return true;
        } else {
            console.warn('⚠️ 存档中没有世界数据');
            return false;
        }
    },

    /**
     * 完整测试流程
     */
    async runFullTest() {
        console.log('🎯 开始完整的世界状态测试...\n');

        // 1. 初始化测试
        if (!this.testInit()) {
            console.error('初始化失败，测试中止');
            return;
        }

        // 2. 修改状态
        this.testModify();

        // 3. 存档
        const saveId = await this.testSave();
        if (!saveId) {
            console.error('存档失败，测试中止');
            return;
        }

        // 4. 再次修改（用于对比）
        this.testModifyAgain();

        // 5. 读档恢复
        const restored = await this.testLoad(saveId);

        if (restored) {
            console.log('\n✅✅✅ 测试完成！世界状态系统工作正常 ✅✅✅');
            console.log('世界快照成功保存和恢复了所有数据！');
        } else {
            console.error('\n❌ 测试失败，请检查错误');
        }
    },

    /**
     * 快速检查当前世界
     */
    quickCheck() {
        if (!window.worldState) {
            console.error('世界状态未初始化');
            return;
        }

        const world = window.worldState.state;
        console.log('🌍 世界快照:');
        console.log(JSON.stringify(world, null, 2));
    },

    /**
     * 测试位置与场景关联
     */
    testPositionScene() {
        console.log('\n========== 测试位置-场景关联 ==========');

        const positions = ['awakening_room', 'classroom', 'hallway', 'dormitory'];

        positions.forEach(location => {
            window.worldState.setPlayerPosition(location);
            const sceneId = window.worldState.getSceneIdByLocation(location);
            console.log(`位置: ${location} → 场景: ${sceneId || '未映射'}`);
        });
    }
};

// 导出到全局
window.TestWorldState = TestWorldState;

// 添加控制台提示
console.log('🌍 世界状态测试工具已加载');
console.log('可用命令:');
console.log('  TestWorldState.runFullTest()   - 运行完整测试');
console.log('  TestWorldState.testInit()      - 测试初始化');
console.log('  TestWorldState.testModify()    - 测试修改状态');
console.log('  TestWorldState.testSave()      - 测试存档');
console.log('  TestWorldState.testLoad(id)    - 测试读档');
console.log('  TestWorldState.quickCheck()    - 查看当前世界');
console.log('  TestWorldState.testPositionScene() - 测试位置映射');