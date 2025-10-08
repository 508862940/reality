/**
 * 🧠 记忆系统调试工具
 * 用于快速诊断记忆系统问题
 */

window.debugMemory = {
    /**
     * 完整诊断
     */
    diagnose() {
        console.log('🔍 开始诊断记忆系统...\n');

        // 1. 检查类是否加载
        console.log('1️⃣ 检查类加载状态：');
        console.log('   MemorySystem:', typeof window.MemorySystem);
        console.log('   MemoryIntegration:', typeof window.MemoryIntegration);
        console.log('   EmotionSystem:', typeof window.EmotionSystem);
        console.log('   UtilityAI:', typeof window.UtilityAI);
        console.log('');

        // 2. 检查 Zero 实例
        console.log('2️⃣ 检查 Zero 实例：');
        if (window.zero) {
            console.log('   ✅ Zero 存在');
            console.log('   - id:', window.zero.id);
            console.log('   - memory 类型:', window.zero.memory?.constructor?.name);
            console.log('   - memory 方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.zero.memory || {})));
        } else {
            console.log('   ❌ Zero 不存在');
        }
        console.log('');

        // 3. 检查记忆内容
        console.log('3️⃣ 检查记忆内容：');
        if (window.zero?.memory) {
            console.log('   - shortTerm 长度:', window.zero.memory.shortTerm?.length || 0);
            console.log('   - longTerm 长度:', window.zero.memory.longTerm?.length || 0);
            console.log('   - eventCounts:', window.zero.memory.eventCounts);
        } else {
            console.log('   ❌ 无法访问记忆');
        }
        console.log('');

        // 4. 检查 WorldState
        console.log('4️⃣ 检查 WorldState：');
        if (window.worldState?.state?.npcs?.Zero?.memory) {
            const mem = window.worldState.state.npcs.Zero.memory;
            console.log('   ✅ WorldState 中有记忆');
            console.log('   - shortTerm:', mem.shortTerm?.length || 0);
            console.log('   - longTerm:', mem.longTerm?.length || 0);
        } else {
            console.log('   ❌ WorldState 中没有记忆数据');
            console.log('   - npcs 存在？', !!window.worldState?.state?.npcs);
            console.log('   - Zero 存在？', !!window.worldState?.state?.npcs?.Zero);
        }
        console.log('');

        // 5. 检查存档
        console.log('5️⃣ 检查存档（异步）：');
        this.checkSave();
    },

    /**
     * 检查存档中的记忆
     */
    async checkSave() {
        if (!window.saveSystem) {
            console.log('   ❌ saveSystem 不存在');
            return;
        }

        try {
            const saves = await window.saveSystem.getSavesList();
            const autoSave = saves.find(s => s.type === 'auto');

            if (autoSave) {
                const data = await window.saveSystem.loadSave(autoSave.id);
                const memory = data?.gameData?.worldData?.npcs?.Zero?.memory;

                if (memory) {
                    console.log('   ✅ 存档中有记忆');
                    console.log('   - shortTerm:', memory.shortTerm?.length || 0);
                    console.log('   - longTerm:', memory.longTerm?.length || 0);
                } else {
                    console.log('   ❌ 存档中没有记忆');
                }
            } else {
                console.log('   ❌ 没有自动存档');
            }
        } catch (e) {
            console.error('   ❌ 检查存档失败:', e);
        }
    },

    /**
     * 手动添加测试记忆
     */
    addTestMemory() {
        if (!window.zero?.memory) {
            console.error('❌ Zero 或 memory 不存在');
            return;
        }

        // 检查是否有 addWithContext 方法
        if (typeof window.zero.memory.addWithContext === 'function') {
            console.log('✅ 使用增强方法 addWithContext');
            window.zero.memory.addWithContext({
                type: 'test_event',
                content: '这是调试工具添加的测试记忆',
                tags: ['debug', 'test'],
                emotionImpact: { affection: 5 }
            });
        } else if (typeof window.zero.memory.addMemory === 'function') {
            console.log('⚠️ 使用旧方法 addMemory');
            window.zero.memory.addMemory({
                type: 'test_event',
                description: '这是调试工具添加的测试记忆（旧方法）',
                intensity: 0.8
            });
        } else {
            console.error('❌ 没有找到添加记忆的方法');
            return;
        }

        // 同步到 WorldState
        if (window.MemoryIntegration) {
            window.MemoryIntegration.syncToWorldState('Zero');
            console.log('✅ 已同步到 WorldState');
        } else {
            console.warn('⚠️ MemoryIntegration 不存在，无法同步');
        }

        // 显示结果
        console.log('📊 当前记忆：', window.zero.memory.shortTerm);
    },

    /**
     * 测试记忆检索
     */
    testRecall() {
        if (!window.zero?.memory) {
            console.error('❌ Zero 或 memory 不存在');
            return;
        }

        console.log('🔍 测试记忆检索...\n');

        // 测试新方法
        if (typeof window.zero.memory.recallByTag === 'function') {
            console.log('✅ recallByTag 方法存在');
            const result = window.zero.memory.recallByTag('test');
            console.log('   结果:', result);
        } else {
            console.error('❌ recallByTag 方法不存在');
        }

        if (typeof window.zero.memory.recallByType === 'function') {
            console.log('✅ recallByType 方法存在');
            const result = window.zero.memory.recallByType('test_event');
            console.log('   结果:', result);
        } else {
            console.error('❌ recallByType 方法不存在');
        }
    },

    /**
     * 强制重新初始化 Zero（使用新版 MemorySystem）
     */
    reinitZero() {
        if (!window.EmotionSystem || !window.MemorySystem || !window.UtilityAI) {
            console.error('❌ AI 系统类未加载');
            return;
        }

        console.log('🔄 重新初始化 Zero...');

        window.zero = {
            id: 'Zero',
            name: '凌',
            health: 100,
            mood: 70,
            wolfControl: 70,
            medication: 80,
            guilt: 30,
            emotionSystem: new EmotionSystem(),
            memory: new MemorySystem(),
            utilityAI: null
        };

        window.zero.utilityAI = new UtilityAI(window.zero);

        console.log('✅ Zero 已重新初始化');
        console.log('   - memory 类型:', window.zero.memory.constructor.name);
        console.log('   - 可用方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.zero.memory)));
    },

    /**
     * 显示期望的返回值示例
     */
    showExpected() {
        console.log('📋 期望的返回值示例：\n');

        console.log('1️⃣ window.MemoryIntegration');
        console.log('   应该返回：class MemoryIntegration { ... }');
        console.log('   实际返回：', window.MemoryIntegration);
        console.log('');

        console.log('2️⃣ window.zero.memory.shortTerm（添加记忆后）');
        console.log('   应该返回：');
        console.log(`   [
     {
       type: 'player_choice',
       content: '→ 慢慢靠近',
       tags: ['approach', 'brave'],
       emotionImpact: { affection: 5, intrigue: 3 },
       gameDay: 1,
       importance: 0.5,
       scene: 'meet_zero',
       ...
     }
   ]`);
        console.log('   实际返回：', window.zero?.memory?.shortTerm || '❌ 不存在');
        console.log('');

        console.log('3️⃣ window.worldState.state.npcs.Zero.memory');
        console.log('   应该返回：');
        console.log(`   {
     shortTerm: [...],
     longTerm: [...],
     eventCounts: { player_choice: 1 },
     exportTime: 1234567890
   }`);
        console.log('   实际返回：', window.worldState?.state?.npcs?.Zero?.memory || '❌ 不存在');
    },

    /**
     * 快速修复（尝试解决常见问题）
     */
    quickFix() {
        console.log('🔧 尝试快速修复...\n');

        // 1. 检查并重新加载脚本
        if (!window.MemoryIntegration) {
            console.log('⚠️ MemoryIntegration 未加载，尝试手动加载...');
            const script = document.createElement('script');
            script.src = 'js/core/memory-integration.js?v=' + Date.now();
            script.onload = () => {
                console.log('✅ memory-integration.js 已重新加载');
                this.diagnose();
            };
            script.onerror = () => {
                console.error('❌ 加载失败，请检查文件路径');
            };
            document.head.appendChild(script);
            return;
        }

        // 2. 重新初始化 Zero
        this.reinitZero();

        // 3. 重新诊断
        setTimeout(() => {
            this.diagnose();
        }, 100);
    },

    /**
     * 帮助信息
     */
    help() {
        console.log(`
🧠 记忆系统调试工具使用指南

基础命令：
  debugMemory.diagnose()      - 完整诊断
  debugMemory.showExpected()  - 显示期望返回值
  debugMemory.quickFix()      - 快速修复

测试命令：
  debugMemory.addTestMemory() - 添加测试记忆
  debugMemory.testRecall()    - 测试记忆检索
  debugMemory.reinitZero()    - 重新初始化Zero

检查命令：
  debugMemory.checkSave()     - 检查存档（异步）
        `);
    }
};

console.log('🧠 记忆系统调试工具已加载');
console.log('💡 输入 debugMemory.help() 查看使用指南');
console.log('💡 输入 debugMemory.diagnose() 开始诊断');