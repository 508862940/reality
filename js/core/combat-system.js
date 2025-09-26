/**
 * 战斗系统
 * 管理游戏中的战斗机制、创伤系统、技能系统
 */

class CombatSystem {
    constructor() {
        // 战斗状态
        this.inCombat = false;
        this.currentBattle = null;
        this.combatLog = [];

        // 玩家战斗数据
        this.playerCombatStats = {
            // User特有的创伤系统（代替HP）
            trauma: {
                physical: 0,    // 物理创伤 (0-100)
                system: 0,      // 系统创伤 (0-100)
                mental: 0       // 精神创伤 (0-100)
            },
            stamina: 100,       // 耐力
            defense: 10,        // 防御力
            attack: 15,         // 攻击力
            speed: 20,          // 速度

            // 特殊状态
            isOverloaded: false,  // 系统过载
            isRebooting: false    // 重启中
        };

        // Zero的特殊系统（如果Zero在队伍中）
        this.zeroStats = {
            hp: 100,            // 传统HP（Zero是人类改造体）
            wolfEnergy: 100,    // 狼魂能量
            wolfSync: 0,        // 狼魂同步率 (0-100)
            isTransformed: false, // 是否狼化
            berserkLevel: 0     // 狂暴等级 (0-3)
        };

        // 战斗回合数据
        this.currentRound = 0;
        this.turnOrder = [];
        this.currentTurn = 0;

        // 技能冷却
        this.skillCooldowns = {};

        // 战斗统计
        this.statistics = {
            battlesWon: 0,
            battlesLost: 0,
            battlesFled: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            skillsUsed: {}
        };

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        console.log('⚔️ 战斗系统初始化完成');
    }

    /**
     * 开始战斗
     */
    startBattle(enemies) {
        if (this.inCombat) {
            console.log('❌ 已经在战斗中');
            return false;
        }

        this.inCombat = true;
        this.currentRound = 0;
        this.combatLog = [];

        // 创建战斗实例
        this.currentBattle = {
            enemies: enemies.map(e => this.createEnemy(e)),
            allies: this.getAllies(),
            startTime: Date.now(),
            environment: this.getBattleEnvironment()
        };

        // 计算行动顺序
        this.calculateTurnOrder();

        // 记录战斗开始
        this.addCombatLog('战斗开始！', 'system');

        // 触发剧情事件
        if (window.storyFlags) {
            window.storyFlags.incrementCounter('BATTLES_STARTED');
        }

        // 显示战斗UI（如果存在）
        this.showCombatUI();

        return true;
    }

    /**
     * 创建敌人
     */
    createEnemy(enemyData) {
        return {
            id: enemyData.id || 'enemy_' + Math.random(),
            name: enemyData.name || '未知敌人',
            hp: enemyData.hp || 50,
            maxHp: enemyData.hp || 50,
            attack: enemyData.attack || 10,
            defense: enemyData.defense || 5,
            speed: enemyData.speed || 15,
            skills: enemyData.skills || ['basic_attack'],
            ai: enemyData.ai || 'aggressive',  // aggressive, defensive, balanced
            loot: enemyData.loot || []
        };
    }

    /**
     * 获取盟友列表
     */
    getAllies() {
        const allies = [{
            id: 'player',
            name: window.gameState?.character?.name || 'User',
            type: 'ai',  // AI类型角色
            stats: this.playerCombatStats
        }];

        // 如果Zero在队伍中
        if (window.storyFlags?.checkFlag('ZERO_IN_PARTY')) {
            allies.push({
                id: 'zero',
                name: 'Zero',
                type: 'human',  // 人类改造体
                stats: this.zeroStats
            });
        }

        return allies;
    }

    /**
     * 获取战斗环境
     */
    getBattleEnvironment() {
        const environment = {
            location: window.gameState?.character?.location || 'unknown',
            weather: window.weatherSystem?.currentWeather || 'clear',
            visibility: 100,
            hazards: []
        };

        // 天气影响
        if (window.weatherSystem) {
            const weather = window.weatherSystem.weatherTypes[window.weatherSystem.currentWeather];
            if (weather) {
                environment.visibility = weather.effects.visibility;
            }
        }

        // 雾天降低命中率
        if (environment.weather === 'foggy') {
            environment.hazards.push('low_visibility');
        }

        // 雨天降低速度
        if (environment.weather === 'rainy' || environment.weather === 'stormy') {
            environment.hazards.push('slippery');
        }

        return environment;
    }

    /**
     * 计算行动顺序
     */
    calculateTurnOrder() {
        this.turnOrder = [];

        // 添加所有参战单位
        this.currentBattle.allies.forEach(ally => {
            const speed = ally.type === 'ai' ? ally.stats.speed : ally.stats.speed || 20;
            this.turnOrder.push({
                unit: ally,
                side: 'ally',
                initiative: speed + Math.random() * 10
            });
        });

        this.currentBattle.enemies.forEach(enemy => {
            this.turnOrder.push({
                unit: enemy,
                side: 'enemy',
                initiative: enemy.speed + Math.random() * 10
            });
        });

        // 按速度排序
        this.turnOrder.sort((a, b) => b.initiative - a.initiative);
        this.currentTurn = 0;
    }

    /**
     * 执行玩家攻击
     */
    playerAttack(targetId, skillId = 'basic_attack') {
        if (!this.inCombat) return false;

        const target = this.currentBattle.enemies.find(e => e.id === targetId);
        if (!target || target.hp <= 0) {
            console.log('❌ 无效目标');
            return false;
        }

        // 检查技能冷却
        if (this.skillCooldowns[skillId] > 0) {
            console.log('❌ 技能冷却中');
            return false;
        }

        // 计算伤害
        let damage = this.playerCombatStats.attack;
        let traumaType = 'physical';

        // 根据技能调整伤害
        switch (skillId) {
            case 'basic_attack':
                damage = this.playerCombatStats.attack;
                break;
            case 'system_overload':
                damage = this.playerCombatStats.attack * 1.5;
                traumaType = 'system';
                this.skillCooldowns[skillId] = 3;
                break;
            case 'logic_bomb':
                damage = this.playerCombatStats.attack * 2;
                traumaType = 'mental';
                this.skillCooldowns[skillId] = 5;
                break;
        }

        // 应用防御
        damage = Math.max(1, damage - target.defense);

        // 环境影响
        if (this.currentBattle.environment.hazards.includes('low_visibility')) {
            if (Math.random() < 0.3) {
                this.addCombatLog('攻击未命中（能见度低）', 'miss');
                return true;
            }
        }

        // 造成伤害
        target.hp -= damage;
        this.statistics.totalDamageDealt += damage;

        this.addCombatLog(`对${target.name}造成${damage}点伤害`, 'damage');

        // 检查敌人是否死亡
        if (target.hp <= 0) {
            this.handleEnemyDefeat(target);
        }

        // 记录技能使用
        if (!this.statistics.skillsUsed[skillId]) {
            this.statistics.skillsUsed[skillId] = 0;
        }
        this.statistics.skillsUsed[skillId]++;

        return true;
    }

    /**
     * 受到伤害（User特有的创伤系统）
     */
    takeDamage(amount, type = 'physical', source = 'unknown') {
        // User不使用HP，而是积累创伤
        const traumaIncrease = Math.floor(amount * 0.7); // 伤害转换为创伤

        // 根据类型增加创伤
        switch (type) {
            case 'physical':
                this.playerCombatStats.trauma.physical += traumaIncrease;
                this.addCombatLog(`受到物理创伤 +${traumaIncrease}`, 'trauma');
                break;
            case 'system':
                this.playerCombatStats.trauma.system += traumaIncrease;
                this.addCombatLog(`系统受损 +${traumaIncrease}`, 'trauma');
                break;
            case 'mental':
                this.playerCombatStats.trauma.mental += traumaIncrease;
                this.addCombatLog(`精神创伤 +${traumaIncrease}`, 'trauma');
                break;
        }

        this.statistics.totalDamageTaken += amount;

        // 检查创伤效果
        this.checkTraumaEffects();

        // 检查是否需要强制重启
        if (this.getTotalTrauma() >= 100) {
            this.forceReboot();
        }
    }

    /**
     * 获取总创伤值
     */
    getTotalTrauma() {
        const trauma = this.playerCombatStats.trauma;
        return Math.floor((trauma.physical + trauma.system + trauma.mental) / 3);
    }

    /**
     * 检查创伤效果
     */
    checkTraumaEffects() {
        const totalTrauma = this.getTotalTrauma();

        if (totalTrauma >= 90) {
            // 极限状态
            this.playerCombatStats.isOverloaded = true;
            this.addCombatLog('⚠️ 系统严重过载！', 'warning');
        } else if (totalTrauma >= 60) {
            // 重度创伤
            this.playerCombatStats.speed = Math.floor(this.playerCombatStats.speed * 0.5);
            this.playerCombatStats.attack = Math.floor(this.playerCombatStats.attack * 0.7);
            this.addCombatLog('功能受限', 'warning');
        } else if (totalTrauma >= 30) {
            // 中度创伤
            this.playerCombatStats.speed = Math.floor(this.playerCombatStats.speed * 0.8);
            this.addCombatLog('动作迟缓', 'warning');
        }

        // 更新UI显示
        if (window.showNotification) {
            if (totalTrauma >= 60) {
                window.showNotification(`⚠️ 创伤严重 (${totalTrauma}/100)`);
            }
        }
    }

    /**
     * 强制重启（战斗失败）
     */
    forceReboot() {
        this.playerCombatStats.isRebooting = true;
        this.addCombatLog('💥 系统崩溃！强制重启中...', 'critical');

        // 结束战斗
        this.endBattle(false);

        // 重置创伤（但保留一些后遗症）
        setTimeout(() => {
            this.playerCombatStats.trauma.physical = 10;
            this.playerCombatStats.trauma.system = 10;
            this.playerCombatStats.trauma.mental = 10;
            this.playerCombatStats.isRebooting = false;
            this.playerCombatStats.isOverloaded = false;

            if (window.showNotification) {
                window.showNotification('系统重启完成，但仍有轻微损伤');
            }
        }, 3000);
    }

    /**
     * Zero的狼魂变身
     */
    zeroTransform() {
        if (!this.zeroStats || this.zeroStats.wolfEnergy < 30) {
            console.log('❌ 狼魂能量不足');
            return false;
        }

        this.zeroStats.isTransformed = true;
        this.zeroStats.wolfSync += 20;

        // 变身加成
        this.zeroStats.hp = Math.min(this.zeroStats.hp + 30, 150);
        this.addCombatLog('🐺 Zero狼化变身！', 'special');

        // 消耗能量
        this.zeroStats.wolfEnergy -= 30;

        // 触发剧情标记
        if (window.storyFlags) {
            window.storyFlags.setFlag('ZERO_TRANSFORMED_IN_BATTLE', true);
        }

        return true;
    }

    /**
     * 处理敌人死亡
     */
    handleEnemyDefeat(enemy) {
        this.addCombatLog(`${enemy.name}被击败！`, 'victory');

        // 掉落物品
        if (enemy.loot && enemy.loot.length > 0) {
            enemy.loot.forEach(item => {
                if (window.inventory) {
                    window.inventory.addItem(item.id, item.quantity || 1);
                }
                this.addCombatLog(`获得 ${item.name || item.id}`, 'loot');
            });
        }

        // 获得经验和金钱
        const expGain = enemy.exp || 10;
        const moneyGain = enemy.money || Math.floor(Math.random() * 20 + 10);

        if (window.gameState?.character) {
            window.gameState.character.money = (window.gameState.character.money || 0) + moneyGain;
            this.addCombatLog(`获得 ¥${moneyGain}`, 'loot');
        }

        // 检查战斗是否结束
        const remainingEnemies = this.currentBattle.enemies.filter(e => e.hp > 0);
        if (remainingEnemies.length === 0) {
            this.endBattle(true);
        }
    }

    /**
     * 结束战斗
     */
    endBattle(victory) {
        this.inCombat = false;

        if (victory) {
            this.statistics.battlesWon++;
            this.addCombatLog('🎉 战斗胜利！', 'victory');

            // 触发剧情事件
            if (window.storyFlags) {
                window.storyFlags.incrementCounter('BATTLES_WON');
            }

            // 恢复一些耐力
            this.playerCombatStats.stamina = Math.min(100, this.playerCombatStats.stamina + 20);
        } else {
            this.statistics.battlesLost++;
            this.addCombatLog('💀 战斗失败...', 'defeat');
        }

        // 清理战斗数据
        const battleDuration = Date.now() - this.currentBattle.startTime;
        console.log(`战斗持续时间: ${Math.floor(battleDuration / 1000)}秒`);

        this.currentBattle = null;
        this.turnOrder = [];
        this.currentRound = 0;

        // 减少技能冷却
        for (const skill in this.skillCooldowns) {
            this.skillCooldowns[skill] = 0;
        }

        // 隐藏战斗UI
        this.hideCombatUI();

        // 自动保存
        if (window.saveSystem && victory) {
            window.saveSystem.autoSave();
        }
    }

    /**
     * 逃跑
     */
    flee() {
        if (!this.inCombat) return false;

        // 基于速度计算逃跑成功率
        const fleeChance = Math.min(0.9, this.playerCombatStats.speed / 100);

        if (Math.random() < fleeChance) {
            this.statistics.battlesFled++;
            this.addCombatLog('成功逃离战斗！', 'system');
            this.endBattle(false);
            return true;
        } else {
            this.addCombatLog('逃跑失败！', 'warning');
            // 逃跑失败会被攻击
            this.takeDamage(10, 'physical', 'flee_penalty');
            return false;
        }
    }

    /**
     * 添加战斗日志
     */
    addCombatLog(message, type = 'normal') {
        const logEntry = {
            message,
            type,
            timestamp: Date.now(),
            round: this.currentRound
        };

        this.combatLog.push(logEntry);

        // 限制日志长度
        if (this.combatLog.length > 100) {
            this.combatLog.shift();
        }

        // 更新UI（如果存在）
        this.updateCombatLog(logEntry);
    }

    /**
     * 显示战斗UI
     */
    showCombatUI() {
        // TODO: 实现战斗UI显示
        console.log('⚔️ 进入战斗模式');
    }

    /**
     * 隐藏战斗UI
     */
    hideCombatUI() {
        // TODO: 实现战斗UI隐藏
        console.log('🕊️ 退出战斗模式');
    }

    /**
     * 更新战斗日志显示
     */
    updateCombatLog(logEntry) {
        // TODO: 更新UI中的战斗日志
        console.log(`[${logEntry.type}] ${logEntry.message}`);
    }

    /**
     * 修复创伤
     */
    healTrauma(amount, type = 'all') {
        if (type === 'all') {
            this.playerCombatStats.trauma.physical = Math.max(0, this.playerCombatStats.trauma.physical - amount);
            this.playerCombatStats.trauma.system = Math.max(0, this.playerCombatStats.trauma.system - amount);
            this.playerCombatStats.trauma.mental = Math.max(0, this.playerCombatStats.trauma.mental - amount);
        } else {
            this.playerCombatStats.trauma[type] = Math.max(0, this.playerCombatStats.trauma[type] - amount);
        }

        console.log(`🔧 修复创伤 -${amount}`);
    }

    /**
     * 保存战斗数据
     */
    save() {
        // 只在战斗中保存临时数据
        if (!this.inCombat) {
            return {
                statistics: this.statistics,
                playerCombatStats: {
                    trauma: this.playerCombatStats.trauma,
                    // 不保存临时的战斗加成
                },
                zeroStats: this.zeroStats ? {
                    wolfEnergy: this.zeroStats.wolfEnergy,
                    wolfSync: this.zeroStats.wolfSync
                } : null
            };
        }

        // 战斗中保存完整状态
        return {
            inCombat: true,
            currentBattle: this.currentBattle,
            currentRound: this.currentRound,
            turnOrder: this.turnOrder,
            currentTurn: this.currentTurn,
            combatLog: this.combatLog.slice(-20), // 只保存最近20条
            playerCombatStats: this.playerCombatStats,
            zeroStats: this.zeroStats,
            skillCooldowns: this.skillCooldowns,
            statistics: this.statistics
        };
    }

    /**
     * 加载战斗数据
     */
    load(data) {
        if (data.statistics) this.statistics = data.statistics;
        if (data.playerCombatStats) {
            Object.assign(this.playerCombatStats, data.playerCombatStats);
        }
        if (data.zeroStats) {
            Object.assign(this.zeroStats, data.zeroStats);
        }

        // 如果在战斗中
        if (data.inCombat) {
            this.inCombat = true;
            this.currentBattle = data.currentBattle;
            this.currentRound = data.currentRound || 0;
            this.turnOrder = data.turnOrder || [];
            this.currentTurn = data.currentTurn || 0;
            this.combatLog = data.combatLog || [];
            this.skillCooldowns = data.skillCooldowns || {};

            console.log('⚔️ 战斗状态已恢复');
            this.showCombatUI();
        }
    }

    /**
     * 重置战斗系统
     */
    reset() {
        this.inCombat = false;
        this.currentBattle = null;
        this.combatLog = [];
        this.currentRound = 0;
        this.turnOrder = [];
        this.currentTurn = 0;
        this.skillCooldowns = {};

        // 重置创伤
        this.playerCombatStats.trauma = {
            physical: 0,
            system: 0,
            mental: 0
        };

        // 重置统计
        this.statistics = {
            battlesWon: 0,
            battlesLost: 0,
            battlesFled: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            skillsUsed: {}
        };

        console.log('🔄 战斗系统已重置');
    }
}

// 创建全局实例
window.combatSystem = new CombatSystem();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}

console.log('⚔️ 战斗系统已加载');