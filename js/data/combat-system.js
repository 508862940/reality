/**
 * 战斗系统设计
 * User使用创伤值替代血条
 */

const CombatSystem = {
    // User的创伤系统
    traumaSystem: {
        current: 0,  // 当前创伤值
        max: 100,    // 最大创伤值

        // 创伤类型
        types: {
            physical: {
                name: '物理创伤',
                realCause: '零件损坏',
                displayEffect: '身体疼痛',
                symptoms: [
                    '手臂有些发麻...',
                    '腿部传来钝痛感...',
                    '呼吸变得困难...'  // 其实AI不需要呼吸
                ]
            },
            system: {
                name: '系统创伤',
                realCause: '程序错误',
                displayEffect: '反应迟缓',
                symptoms: [
                    '思维有些迟钝...',
                    '视线开始模糊...',
                    '耳边传来嗡鸣声...'  // 其实是系统警报
                ]
            },
            mental: {
                name: '精神创伤',
                realCause: '情感过载',
                displayEffect: '精神压力',
                symptoms: [
                    '感到强烈的不安...',
                    '记忆变得混乱...',
                    '无法集中注意力...'
                ]
            }
        },

        // 创伤等级描述
        levels: {
            light: {
                range: [0, 30],
                description: '轻微不适',
                effects: {
                    speed: -10,
                    accuracy: -5
                }
            },
            medium: {
                range: [31, 60],
                description: '明显疲劳',
                effects: {
                    speed: -25,
                    accuracy: -15,
                    skillLocked: ['高级技能']
                }
            },
            heavy: {
                range: [61, 90],
                description: '濒临崩溃',
                effects: {
                    speed: -50,
                    accuracy: -30,
                    randomGlitch: true  // 随机"故障"
                }
            },
            critical: {
                range: [91, 100],
                description: '系统崩溃',
                effects: {
                    forceReboot: true  // 强制重启
                }
            }
        }
    },

    // 战斗对比示例
    combatExample: {
        // User被攻击
        userHit: {
            damage: 20,
            display: '你感到胸口一阵剧痛，视线有些模糊。',
            reality: 'chassis_damage_20_percent',  // 机箱损坏20%
            traumaIncrease: 20
        },

        // 人类NPC被攻击
        humanHit: {
            damage: 20,
            display: '敌人受到20点伤害！HP: 80/100',
            hpDecrease: 20
        },

        // Zero被攻击
        zeroHit: {
            damage: 20,
            display: 'Zero咬牙承受攻击，狼魂发出低吼。',
            hpDecrease: 15,  // 狼魂减伤
            wolfEnergy: -5
        }
    },

    // 修复/治疗对比
    recovery: {
        // User的"治疗"
        userRecovery: {
            item: '止痛药',
            realEffect: 'system_repair_protocol',  // 系统修复协议
            display: '疼痛感减轻了一些...',
            traumaDecrease: 30
        },

        // 人类的治疗
        humanRecovery: {
            item: '医疗包',
            display: '恢复30点HP',
            hpRecover: 30
        }
    },

    // 特殊：User接近系统崩溃时的表现
    nearCritical: {
        symptoms: [
            '眼前突然闪过一些错乱的代码...不，是幻觉吧？',
            '你听到自己的心跳声异常规律...等等，心跳？',
            '手指尖传来奇怪的麻木感，像是...电流？',
            '记忆中闪过一个画面：白色的维修室...这是什么？'
        ],

        // 可能触发的认知失调
        cognitiveBreak: {
            trigger: 85,  // 创伤值达到85时
            event: '为什么我没有流血？为什么疼痛如此...规律？'
        }
    }
};

// 战斗动作
class CombatAction {
    // User的攻击
    userAttack(target, attackType) {
        const result = {
            damage: this.calculateDamage(attackType),
            description: this.getAttackDescription(attackType),
            // 小体型高敏捷，大体型高力量
            modifier: window.userStats.bodyType === 'small' ? 1.2 : 0.8
        };

        return result;
    }

    // User受到攻击
    userTakeDamage(damage, damageType) {
        const trauma = this.convertToTrauma(damage, damageType);
        CombatSystem.traumaSystem.current += trauma;

        // 返回症状描述而非伤害数值
        return this.getTraumaSymptom(damageType);
    }

    // 转换伤害为创伤值
    convertToTrauma(damage, type) {
        // 不同体型有不同抗性
        const resistance = window.userStats.bodyType === 'large' ? 0.8 : 1.2;
        return Math.floor(damage * resistance);
    }

    // 获取创伤症状描述
    getTraumaSymptom(type) {
        const symptoms = CombatSystem.traumaSystem.types[type].symptoms;
        return symptoms[Math.floor(Math.random() * symptoms.length)];
    }
}

// 导出
window.CombatSystem = CombatSystem;
window.CombatAction = new CombatAction();