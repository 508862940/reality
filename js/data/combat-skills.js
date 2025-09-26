/**
 * 战斗技能数据定义
 * 定义所有可用的战斗技能和效果
 */

const CombatSkills = {
    // ==================== User的AI技能 ====================
    user: {
        // 基础攻击
        basic_attack: {
            id: 'basic_attack',
            name: '数据冲击',
            description: '发送数据流冲击目标',
            type: 'damage',
            target: 'single',
            damage: 1.0,  // 伤害倍率
            cost: { stamina: 5 },
            cooldown: 0,
            animation: 'pulse'
        },

        // 系统过载
        system_overload: {
            id: 'system_overload',
            name: '系统过载',
            description: '过载自身系统以提升输出',
            type: 'damage',
            target: 'single',
            damage: 1.8,
            cost: { stamina: 15, trauma: { system: 5 } },  // 会对自己造成创伤
            cooldown: 3,
            effects: {
                selfBuff: { attack: 1.2, duration: 2 }
            },
            animation: 'overload'
        },

        // 逻辑炸弹
        logic_bomb: {
            id: 'logic_bomb',
            name: '逻辑炸弹',
            description: '植入逻辑悖论使目标混乱',
            type: 'damage',
            target: 'single',
            damage: 2.0,
            traumaType: 'mental',
            cost: { stamina: 20 },
            cooldown: 5,
            effects: {
                debuff: { confusion: true, duration: 2 }
            },
            animation: 'mind_blast'
        },

        // 数据修复
        data_repair: {
            id: 'data_repair',
            name: '数据修复',
            description: '修复自身系统损伤',
            type: 'heal',
            target: 'self',
            healTrauma: 20,  // 修复创伤值
            cost: { stamina: 25 },
            cooldown: 4,
            animation: 'repair'
        },

        // 防火墙
        firewall: {
            id: 'firewall',
            name: '防火墙',
            description: '生成数据防护屏障',
            type: 'defense',
            target: 'self',
            cost: { stamina: 15 },
            cooldown: 3,
            effects: {
                shield: 30,  // 吸收30点伤害
                duration: 3
            },
            animation: 'shield'
        },

        // 病毒扩散
        virus_spread: {
            id: 'virus_spread',
            name: '病毒扩散',
            description: '向所有敌人传播数据病毒',
            type: 'damage',
            target: 'all_enemies',
            damage: 0.6,
            cost: { stamina: 30 },
            cooldown: 6,
            effects: {
                dot: { damage: 5, duration: 3, type: 'system' }  // 持续伤害
            },
            animation: 'virus'
        },

        // 紧急重启
        emergency_reboot: {
            id: 'emergency_reboot',
            name: '紧急重启',
            description: '紧急重启系统，清除所有创伤但会眩晕一回合',
            type: 'special',
            target: 'self',
            cost: { stamina: 50 },
            cooldown: 10,
            effects: {
                clearTrauma: true,
                stun: { self: true, duration: 1 }
            },
            animation: 'reboot'
        }
    },

    // ==================== Zero的狼魂技能 ====================
    zero: {
        // 狼爪撕裂
        wolf_claw: {
            id: 'wolf_claw',
            name: '狼爪撕裂',
            description: '用狼爪撕裂敌人',
            type: 'damage',
            target: 'single',
            damage: 1.5,
            cost: { stamina: 10 },
            cooldown: 0,
            effects: {
                bleed: { damage: 3, duration: 3 }
            },
            animation: 'slash'
        },

        // 狼魂召唤
        wolf_summon: {
            id: 'wolf_summon',
            name: '狼魂召唤',
            description: '召唤狼魂协助战斗',
            type: 'summon',
            target: 'self',
            cost: { wolfEnergy: 30 },
            cooldown: 5,
            effects: {
                summon: 'wolf_spirit',
                duration: 5
            },
            animation: 'summon'
        },

        // 狂暴
        berserk: {
            id: 'berserk',
            name: '狂暴',
            description: '进入狂暴状态，大幅提升攻击但降低防御',
            type: 'buff',
            target: 'self',
            cost: { wolfEnergy: 20, hp: 10 },
            cooldown: 8,
            effects: {
                selfBuff: {
                    attack: 2.0,
                    defense: 0.5,
                    speed: 1.5,
                    duration: 4
                },
                berserkLevel: 1
            },
            animation: 'rage'
        },

        // 月光治愈
        moonlight_heal: {
            id: 'moonlight_heal',
            name: '月光治愈',
            description: '借助月光之力治疗伤势',
            type: 'heal',
            target: 'ally',
            heal: 40,
            cost: { wolfEnergy: 25 },
            cooldown: 4,
            conditions: {
                time: 'night'  // 只能在夜晚使用
            },
            animation: 'heal'
        },

        // 嗥叫
        howl: {
            id: 'howl',
            name: '嗥叫',
            description: '发出震慑的狼嚎',
            type: 'debuff',
            target: 'all_enemies',
            cost: { wolfEnergy: 15 },
            cooldown: 3,
            effects: {
                fear: { chance: 0.5, duration: 1 },
                debuff: { attack: 0.8, duration: 2 }
            },
            animation: 'howl'
        },

        // 狼化
        wolf_transformation: {
            id: 'wolf_transformation',
            name: '完全狼化',
            description: '完全解放狼魂之力',
            type: 'transformation',
            target: 'self',
            cost: { wolfEnergy: 50 },
            cooldown: 'once_per_battle',  // 每场战斗只能用一次
            requirements: {
                wolfSync: 50  // 需要足够的同步率
            },
            effects: {
                transform: 'wolf_form',
                stats: {
                    hp: 1.5,
                    attack: 2.0,
                    defense: 1.3,
                    speed: 1.8
                },
                duration: 'battle'  // 持续整场战斗
            },
            animation: 'transform'
        }
    },

    // ==================== 敌人技能 ====================
    enemy: {
        // 普通攻击
        enemy_attack: {
            id: 'enemy_attack',
            name: '攻击',
            type: 'damage',
            target: 'single',
            damage: 1.0,
            animation: 'hit'
        },

        // 重击
        heavy_strike: {
            id: 'heavy_strike',
            name: '重击',
            type: 'damage',
            target: 'single',
            damage: 1.8,
            chargeTime: 1,  // 需要蓄力一回合
            animation: 'heavy_hit'
        },

        // 防御姿态
        defensive_stance: {
            id: 'defensive_stance',
            name: '防御姿态',
            type: 'defense',
            target: 'self',
            effects: {
                selfBuff: { defense: 2.0, duration: 2 }
            },
            animation: 'guard'
        },

        // 群体攻击
        area_attack: {
            id: 'area_attack',
            name: '横扫',
            type: 'damage',
            target: 'all_allies',
            damage: 0.7,
            animation: 'sweep'
        },

        // 自爆
        self_destruct: {
            id: 'self_destruct',
            name: '自爆',
            type: 'damage',
            target: 'all',
            damage: 3.0,
            effects: {
                killSelf: true  // 自己也会死亡
            },
            animation: 'explosion'
        }
    },

    // ==================== 物品技能 ====================
    items: {
        // 修复工具
        repair_kit: {
            id: 'repair_kit',
            name: '修复工具',
            description: '修复20点创伤',
            type: 'item',
            target: 'self',
            healTrauma: 20,
            consumable: true
        },

        // 能量饮料
        energy_drink: {
            id: 'energy_drink',
            name: '能量饮料',
            description: '恢复30点耐力',
            type: 'item',
            target: 'self',
            restoreStamina: 30,
            consumable: true
        },

        // 烟雾弹
        smoke_bomb: {
            id: 'smoke_bomb',
            name: '烟雾弹',
            description: '提高逃跑成功率',
            type: 'item',
            target: 'battlefield',
            effects: {
                fleeBonus: 0.5,
                duration: 1
            },
            consumable: true
        }
    }
};

// ==================== 技能辅助函数 ====================

/**
 * 获取技能信息
 */
function getSkill(category, skillId) {
    return CombatSkills[category]?.[skillId] || null;
}

/**
 * 检查技能是否可用
 */
function canUseSkill(user, skill) {
    // 检查冷却
    if (window.combatSystem?.skillCooldowns[skill.id] > 0) {
        return false;
    }

    // 检查消耗
    if (skill.cost) {
        if (skill.cost.stamina && user.stamina < skill.cost.stamina) {
            return false;
        }
        if (skill.cost.hp && user.hp < skill.cost.hp) {
            return false;
        }
        if (skill.cost.wolfEnergy && user.wolfEnergy < skill.cost.wolfEnergy) {
            return false;
        }
    }

    // 检查条件
    if (skill.conditions) {
        if (skill.conditions.time === 'night') {
            const hour = window.gameState?.gameTime?.hour || 12;
            if (hour < 18 || hour > 6) return false;
        }
    }

    // 检查需求
    if (skill.requirements) {
        if (skill.requirements.wolfSync && user.wolfSync < skill.requirements.wolfSync) {
            return false;
        }
    }

    return true;
}

/**
 * 计算技能伤害
 */
function calculateSkillDamage(skill, attacker, defender) {
    let baseDamage = attacker.attack * (skill.damage || 1.0);

    // 应用防御
    baseDamage -= defender.defense || 0;

    // 环境影响
    if (window.combatSystem?.currentBattle?.environment) {
        const env = window.combatSystem.currentBattle.environment;

        // 雾天降低命中率
        if (env.hazards?.includes('low_visibility')) {
            baseDamage *= 0.8;
        }

        // 雨天降低火系伤害
        if (env.weather === 'rainy' && skill.element === 'fire') {
            baseDamage *= 0.7;
        }
    }

    // 随机波动
    baseDamage *= (0.9 + Math.random() * 0.2);

    return Math.max(1, Math.floor(baseDamage));
}

/**
 * 获取可用技能列表
 */
function getAvailableSkills(unit) {
    const skills = [];

    if (unit.id === 'player') {
        // User的技能
        for (const [skillId, skill] of Object.entries(CombatSkills.user)) {
            if (canUseSkill(unit.stats || unit, skill)) {
                skills.push(skill);
            }
        }
    } else if (unit.id === 'zero') {
        // Zero的技能
        for (const [skillId, skill] of Object.entries(CombatSkills.zero)) {
            if (canUseSkill(unit.stats || unit, skill)) {
                skills.push(skill);
            }
        }
    } else if (unit.skills) {
        // 敌人技能
        unit.skills.forEach(skillId => {
            const skill = CombatSkills.enemy[skillId];
            if (skill) {
                skills.push(skill);
            }
        });
    }

    return skills;
}

// 导出到全局
window.CombatSkills = CombatSkills;
window.combatSkillHelpers = {
    getSkill,
    canUseSkill,
    calculateSkillDamage,
    getAvailableSkills
};

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CombatSkills,
        getSkill,
        canUseSkill,
        calculateSkillDamage,
        getAvailableSkills
    };
}

console.log('⚔️ 战斗技能数据已加载');