/**
 * 快速测试存档功能
 * 包括F1区场景保存和恢复
 */

// 测试命令集合
const SaveTest = {
    // 1. 快速测试存档（F5）
    async quickSave() {
        console.log('========== 测试快速存档 ==========');

        if (!window.saveSystem) {
            console.error('❌ 存档系统未初始化');
            return;
        }

        try {
            // 显示当前状态
            console.log('📍 当前位置:', window.gameState?.character?.location || '未知');
            console.log('🎭 当前场景:', window.sceneManager?.currentScene?.id || '无');
            console.log('✅ 当前选择:', window.sceneManager?.currentChoice || '无');

            // 执行快速存档
            const result = await window.saveSystem.quickSave();

            if (result) {
                console.log('✅ 快速存档成功！');
                console.log('存档ID:', result.id);
                console.log('存档时间:', new Date(result.timestamp).toLocaleTimeString());

                // 检查场景数据是否被保存（新版本在worldData中）
                if (result.gameData.worldData && result.gameData.worldData.currentSceneData) {
                    console.log('📖 场景数据已包含（worldData）：');
                    console.log('  - 当前场景:', result.gameData.worldData.currentSceneData.scene?.id);
                    console.log('  - 文本索引:', result.gameData.worldData.currentSceneData.currentTextIndex);
                    console.log('  - 是否在选择:', result.gameData.worldData.currentSceneData.isInChoice);
                } else if (result.gameData.sceneData) {
                    console.log('📖 场景数据已包含（旧版本）：');
                    console.log('  - 当前场景:', result.gameData.sceneData.currentScene?.id);
                    console.log('  - 当前选择:', result.gameData.sceneData.currentChoice);
                    console.log('  - 历史记录:', result.gameData.sceneData.sceneHistory?.length || 0, '个');
                } else {
                    console.warn('⚠️ 没有保存场景数据');
                    console.log('🔍 实际保存的数据结构:', {
                        hasWorldData: !!result.gameData.worldData,
                        worldDataKeys: result.gameData.worldData ? Object.keys(result.gameData.worldData) : [],
                        hasSceneData: !!result.gameData.sceneData
                    });
                    console.log('🔍 完整的worldData内容:', result.gameData.worldData);
                    console.log('🔍 完整的result结构:', result);
                }

                return result.id;
            }
        } catch (error) {
            console.error('❌ 快速存档失败:', error);
        }
    },

    // 2. 测试读取存档
    async quickLoad(saveId = 'quick_0') {
        console.log('========== 测试读取存档 ==========');

        if (!window.saveSystem) {
            console.error('❌ 存档系统未初始化');
            return;
        }

        try {
            const saveData = await window.saveSystem.loadSave(saveId);

            if (saveData) {
                console.log('✅ 读取存档成功！');
                console.log('存档名称:', saveData.name);
                console.log('存档时间:', new Date(saveData.timestamp).toLocaleString());

                if (saveData.gameData.sceneData) {
                    console.log('📖 场景数据：');
                    console.log('  - 场景ID:', saveData.gameData.sceneData.currentScene?.id);
                    console.log('  - 场景文本:', saveData.gameData.sceneData.currentScene?.text?.[0]?.substring(0, 50) + '...');
                }

                // 询问是否要恢复这个存档
                if (confirm('是否要恢复这个存档？')) {
                    this.restoreSave(saveData);
                }
            } else {
                console.log('❌ 没有找到存档:', saveId);
            }
        } catch (error) {
            console.error('❌ 读取存档失败:', error);
        }
    },

    // 3. 恢复存档数据
    restoreSave(saveData) {
        console.log('========== 恢复存档数据 ==========');

        const gameData = saveData.gameData;

        // 恢复基础状态
        if (gameData.character && window.gameState) {
            window.gameState.character = gameData.character;
            console.log('✅ 角色数据已恢复');
        }

        // 恢复场景
        if (gameData.sceneData && window.sceneManager) {
            if (gameData.sceneData.currentScene) {
                window.sceneManager.loadScene(gameData.sceneData.currentScene);
                console.log('✅ 场景已恢复');
            }
        }

        // 恢复剧情标记
        if (gameData.storyData && window.storyFlags) {
            window.storyFlags.load(gameData.storyData);
            console.log('✅ 剧情标记已恢复');
        }

        // 更新UI
        if (window.updateGameUI) {
            window.updateGameUI();
        }

        console.log('✅ 存档恢复完成！');
    },

    // 4. 列出所有存档
    async listSaves() {
        console.log('========== 所有存档列表 ==========');

        if (!window.saveSystem) {
            console.error('❌ 存档系统未初始化');
            return;
        }

        const saves = await window.saveSystem.getSavesList();

        if (saves.length === 0) {
            console.log('📭 没有任何存档');
            return;
        }

        saves.forEach((save, index) => {
            const time = new Date(save.timestamp).toLocaleString();
            const sceneId = save.gameData?.sceneData?.currentScene?.id || '无';
            console.log(`${index + 1}. [${save.type}] ${save.name}`);
            console.log(`   时间: ${time}`);
            console.log(`   场景: ${sceneId}`);
            console.log(`   ID: ${save.id}`);
            console.log('---');
        });

        console.log(`📦 共 ${saves.length} 个存档`);
    },

    // 5. 测试游戏内5点存档
    async test5AM() {
        console.log('========== 测试游戏内5点存档 ==========');

        if (!window.timeSystem) {
            console.error('❌ 时间系统未初始化');
            return;
        }

        // 记录当前场景
        const currentSceneId = window.sceneManager?.currentScene?.id;
        console.log('📖 当前场景:', currentSceneId || '无');

        // 设置时间为4:55
        window.timeSystem.currentTime = {
            day: window.timeSystem.currentTime.day,
            hour: 4,
            minute: 55,
            weekday: window.timeSystem.currentTime.weekday
        };

        console.log('⏰ 时间设为 4:55');
        console.log('⏰ 推进10分钟到5:05...');

        // 清除防抖
        if (window.saveSystem) {
            window.saveSystem.lastAutoSaveTime = 0;
        }

        // 推进时间
        window.timeSystem.advanceTime(10);

        // 等待存档完成
        setTimeout(async () => {
            // 检查自动存档
            const autoSave = await window.saveSystem.loadSave('auto_0');
            if (autoSave) {
                console.log('✅ 5点自动存档创建成功');

                // 检查场景是否被保存
                if (autoSave.gameData.sceneData) {
                    const savedSceneId = autoSave.gameData.sceneData.currentScene?.id;
                    if (savedSceneId === currentSceneId) {
                        console.log('✅ 场景正确保存！场景ID:', savedSceneId);
                    } else {
                        console.log('⚠️ 场景可能不匹配');
                        console.log('  原场景:', currentSceneId);
                        console.log('  保存的:', savedSceneId);
                    }
                } else {
                    console.log('⚠️ 自动存档中没有场景数据');
                }
            }
        }, 1000);
    },

    // 6. 详细验证修复效果
    async verifyFix() {
        console.log('========== 验证存档修复效果 ==========');

        // 先显示当前场景状态
        console.log('📖 当前场景状态：');
        if (window.sceneManager && window.sceneManager.currentScene) {
            console.log('  - 场景ID:', window.sceneManager.currentScene.id);
            console.log('  - 场景标题:', window.sceneManager.currentScene.title);
            console.log('  - 文本索引:', window.sceneManager.currentTextIndex);
            console.log('  - 是否在选择:', window.sceneManager.isInChoice);
        } else {
            console.log('  - 无当前场景');
        }

        // 显示F1区域内容
        const storyText = document.getElementById('storyText');
        if (storyText && storyText.innerHTML) {
            console.log('📝 F1区域内容长度:', storyText.innerHTML.length, '字符');
            console.log('📝 F1内容预览:', storyText.textContent.substring(0, 100) + '...');
        }

        // 执行存档前检查worldState
        if (window.worldState) {
            console.log('🌍 检查worldState.getFullState():');
            const fullState = window.worldState.getFullState();
            console.log('  - 是否有currentSceneData:', !!fullState.currentSceneData);
            if (fullState.currentSceneData) {
                console.log('  - 保存的场景ID:', fullState.currentSceneData.scene?.id);
                console.log('  - 保存的文本索引:', fullState.currentSceneData.currentTextIndex);
            }
            console.log('  - 是否有f1Content:', !!fullState.f1Content);
        }

        // 执行快速存档
        console.log('💾 执行快速存档...');
        const saveId = await this.quickSave();

        if (saveId) {
            // 读取刚保存的数据验证
            console.log('🔍 验证保存的数据...');
            const saveData = await window.saveSystem.loadSave(saveId);

            console.log('✅ 修复验证结果:');
            console.log('  - worldData存在:', !!saveData.gameData.worldData);
            console.log('  - currentSceneData存在:', !!saveData.gameData.worldData?.currentSceneData);
            console.log('  - f1Content存在:', !!saveData.gameData.worldData?.f1Content);

            if (saveData.gameData.worldData?.currentSceneData) {
                console.log('  - 场景数据正确保存 ✅');
                console.log('    场景ID:', saveData.gameData.worldData.currentSceneData.scene?.id);
            } else {
                console.log('  - 场景数据丢失 ❌');
            }
        }

        console.log('========== 修复验证完成 ==========');
    },

    // 7. 清除所有存档（危险操作）
    async clearAll() {
        if (!confirm('⚠️ 确定要清除所有存档吗？此操作不可撤销！')) {
            return;
        }

        const saves = await window.saveSystem.getSavesList();
        for (const save of saves) {
            await window.saveSystem.deleteSave(save.id);
        }
        console.log('✅ 已清除所有存档');
    },

    // 8. 调试场景状态
    async debugScene() {
        console.log('========== 调试场景状态 ==========');

        // 检查sceneManager的currentScene
        if (window.sceneManager) {
            console.log('📍 sceneManager.currentScene:', window.sceneManager.currentScene);
            if (window.sceneManager.currentScene) {
                console.log('  - ID:', window.sceneManager.currentScene.id);
                console.log('  - Location:', window.sceneManager.currentScene.location);
                console.log('  - Time:', window.sceneManager.currentScene.time);
            } else {
                console.log('  - currentScene is null or undefined');
            }
        }

        // 检查worldState中保存的场景
        if (window.worldState) {
            const fullState = window.worldState.getFullState();
            console.log('🌍 worldState中的场景数据:');
            if (fullState.currentSceneData) {
                console.log('  - Scene ID:', fullState.currentSceneData.scene?.id);
                console.log('  - Text Index:', fullState.currentSceneData.currentTextIndex);
            } else {
                console.log('  - 无currentSceneData');
            }
        }

        // 检查gameState
        if (window.gameState) {
            console.log('🎮 gameState.currentSceneId:', window.gameState.currentSceneId);
        }

        // 检查F1区域内容
        const storyArea = document.getElementById('storyArea');
        if (storyArea) {
            const textContent = storyArea.textContent || '';
            console.log('📝 F1区域内容预览:', textContent.substring(0, 100));
        }

        console.log('========== 调试完成 ==========');
    },

    // 9. 检查存档内容详情
    async checkSaveDetail() {
        console.log('========== 检查存档详情 ==========');

        // 获取最新的自动存档
        const saves = await window.saveSystem.getSavesList();
        const autoSave = saves.find(s => s.type === 'auto');

        if (autoSave) {
            const saveData = await window.saveSystem.loadSave(autoSave.id);
            console.log('📦 自动存档内容:');
            console.log('  - 有worldData:', !!saveData.gameData.worldData);

            if (saveData.gameData.worldData) {
                const worldData = saveData.gameData.worldData;
                console.log('  - 有currentSceneData:', !!worldData.currentSceneData);
                console.log('  - 有f1Content:', !!worldData.f1Content);

                if (worldData.currentSceneData) {
                    console.log('  - 场景ID:', worldData.currentSceneData.scene?.id);
                    console.log('  - 场景位置:', worldData.currentSceneData.scene?.location);
                }

                if (worldData.f1Content) {
                    console.log('  - F1内容长度:', worldData.f1Content.html?.length);
                }
            }
        } else {
            console.log('❌ 没有找到自动存档');
        }

        console.log('========== 检查完成 ==========');
    }
};

// 绑定到全局快捷键
document.addEventListener('keydown', function(e) {
    // F5 - 快速存档
    if (e.key === 'F5') {
        e.preventDefault();
        SaveTest.quickSave();
    }
    // F9 - 快速读档
    if (e.key === 'F9') {
        e.preventDefault();
        SaveTest.quickLoad();
    }
});

// 导出到全局
window.SaveTest = SaveTest;

console.log('💾 存档测试工具已加载');
console.log('可用命令：');
console.log('  SaveTest.debugScene() - 🔍 调试当前场景状态');
console.log('  SaveTest.checkSaveDetail() - 📦 检查存档详情');
console.log('  SaveTest.verifyFix()  - 🔧 验证存档修复效果');
console.log('  SaveTest.quickSave()  - 快速存档（或按F5）');
console.log('  SaveTest.quickLoad()  - 快速读档（或按F9）');
console.log('  SaveTest.listSaves()  - 列出所有存档');
console.log('  SaveTest.test5AM()    - 测试5点自动存档');
console.log('  SaveTest.clearAll()   - 清除所有存档（危险）');