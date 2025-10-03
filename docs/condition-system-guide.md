# 条件系统使用指南

> Reality游戏的条件判断系统完整使用手册

## 📚 目录

- [快速开始](#快速开始)
- [条件类型](#条件类型)
- [使用场景](#使用场景)
- [进阶技巧](#进阶技巧)
- [最佳实践](#最佳实践)

---

## 快速开始

### 两种条件模式

Reality游戏支持两种条件判断模式：

| 模式 | 属性名 | 效果 | 使用场景 |
|------|--------|------|----------|
| **灰化模式** | `conditions` | 选项显示但不可点击，显示🔒图标 | 告诉玩家"有这个选项，但现在不能选" |
| **隐藏模式** | `showConditions` | 选项完全不显示 | 隐藏彩蛋、秘密选项、剧情分支 |

### 最简单的例子

```javascript
{
    id: 'example_scene',
    title: '示例场景',
    text: ['这是一个示例场景'],
    choices: [
        {
            text: '购买装备（需要100金钱）',
            target: 'shop',
            conditions: {                    // 灰化模式
                attribute: {
                    money: { min: 100 }
                }
            }
        },
        {
            text: '隐藏宝藏（金钱≥500才出现）',
            target: 'treasure',
            showConditions: {                // 隐藏模式
                attribute: {
                    money: { min: 500 }
                }
            }
        }
    ]
}
```

---

## 条件类型

### 1. 💰 金钱条件

```javascript
conditions: {
    attribute: {
        money: { min: 100 }           // 至少100
        // money: { max: 50 }         // 最多50
        // money: { min: 50, max: 200 } // 50-200之间
    }
}
```

### 2. 🎒 物品条件

```javascript
conditions: {
    inventory: {
        items: ['钥匙']               // 拥有钥匙
        // items: ['钥匙', '地图']    // 拥有钥匙和地图（AND关系）
    }
}
```

**注意**：多个物品默认是AND关系（都要有）。如果想要OR关系，见[复合条件](#7--复合条件andornot)。

### 3. ⏰ 时间条件

```javascript
conditions: {
    time: {
        hour: { min: 6, max: 18 }     // 白天（6:00-18:00）
        // hour: { min: 22 }           // 22点之后
        // hour: { max: 6 }            // 6点之前
    }
}
```

### 4. 🌤️ 天气条件

```javascript
conditions: {
    weather: 'sunny'                   // 晴天
    // weather: ['rainy', 'stormy']   // 雨天或暴雨（数组=OR关系）
}
```

**支持的天气类型**：
- `sunny` - 晴天 ☀️
- `cloudy` - 多云 ☁️
- `rainy` - 雨天 🌧️
- `stormy` - 暴雨 ⛈️
- `snowy` - 雪天 ❄️
- `foggy` - 雾天 🌫️

### 5. ❄️ 季节条件

```javascript
conditions: {
    season: 'winter'                   // 冬天
    // season: ['spring', 'summer']   // 春天或夏天
}
```

**支持的季节**：
- `spring` - 春天 🌸
- `summer` - 夏天 ☀️
- `autumn` - 秋天 🍂
- `winter` - 冬天 ❄️

### 6. 💪 属性条件

```javascript
conditions: {
    attribute: {
        strength: { min: 10 },         // 力量≥10
        energy: { min: 50, max: 100 }, // 体力50-100
        mood: { min: 60 }              // 心情≥60
    }
}
```

**支持的属性**：
- `money` - 金钱
- `energy` - 体力
- `mood` - 心情
- `health` - 健康
- `spirit` - 精力
- `strength` - 力量
- `agility` - 敏捷
- `intelligence` - 智力
- `charisma` - 魅力

### 7. 🔐 复合条件（AND/OR/NOT）

#### AND条件（所有条件都满足）

```javascript
conditions: {
    AND: [
        {
            attribute: {
                money: { min: 100 }
            }
        },
        {
            time: {
                hour: { min: 6, max: 18 }
            }
        },
        {
            weather: 'sunny'
        }
    ]
}
// 需要：金钱≥100 且 白天 且 晴天
```

#### OR条件（任意条件满足）

```javascript
conditions: {
    OR: [
        {
            attribute: {
                strength: { min: 20 }
            }
        },
        {
            inventory: {
                items: ['钥匙']
            }
        }
    ]
}
// 需要：力量≥20 或 有钥匙
```

#### NOT条件（条件不满足）

```javascript
conditions: {
    NOT: [
        {
            flag: 'in_combat'
        }
    ]
}
// 需要：不在战斗中
```

### 8. ❤️ 关系条件

```javascript
conditions: {
    relationship: {
        zero_affection: { min: 60 }    // Zero好感度≥60
    }
}
```

### 9. 📍 位置条件

```javascript
conditions: {
    location: '公园'                   // 在公园
    // location: ['公园', '咖啡厅']   // 在公园或咖啡厅
}
```

### 10. 🚩 剧情标记条件

```javascript
conditions: {
    flag: 'met_zero'                   // 设置了met_zero标记
    // flags: {
    //     met_zero: true,
    //     quest_complete: true
    // }
}
```

---

## 使用场景

### 场景1：商店购买

```javascript
{
    text: '购买高级装备（500金钱）',
    target: 'buy_equipment',
    conditions: {
        attribute: {
            money: { min: 500 }
        }
    },
    effects: { money: -500 }
}
```

- 玩家可以看到这个选项
- 金钱不足时显示🔒，鼠标悬停显示原因
- 金钱足够时可以购买

### 场景2：时间限定活动

```javascript
{
    text: '夜市（只在晚上开放）',
    target: 'night_market',
    showConditions: {
        time: {
            hour: { min: 18 }          // 18:00之后
        }
    }
}
```

- 白天这个选项完全不显示
- 晚上6点后自动出现

### 场景3：秘密分支

```javascript
{
    text: '🌟 隐藏结局',
    target: 'secret_ending',
    showConditions: {
        AND: [
            {
                attribute: {
                    money: { min: 1000 },
                    mood: { min: 80 }
                }
            },
            {
                relationship: {
                    zero_affection: { min: 90 }
                }
            },
            {
                flag: 'all_quests_complete'
            }
        ]
    }
}
```

- 需要同时满足：金钱≥1000、心情≥80、Zero好感≥90、完成所有任务
- 只有达成所有条件才会出现

### 场景4：季节活动

```javascript
{
    text: '🌸 赏樱花',
    target: 'sakura_viewing',
    showConditions: {
        AND: [
            {
                season: 'spring'       // 春天
            },
            {
                weather: 'sunny'       // 晴天
            }
        ]
    }
}
```

- 只在春天的晴天出现
- 其他时间完全不显示

### 场景5：能力检定

```javascript
{
    text: '强行破门（力量≥15）',
    target: 'break_door',
    conditions: {
        attribute: {
            strength: { min: 15 }
        }
    }
},
{
    text: '用钥匙开门',
    conditions: {
        inventory: {
            items: ['钥匙']
        }
    },
    target: 'unlock_door'
}
```

- 力量不够看得到但选不了
- 或者用钥匙也能开门

---

## 进阶技巧

### 技巧1：动态条件

场景中的条件会实时检查，改变游戏状态后自动更新：

```javascript
// 示例：点击按钮改变状态后，选项立即可用
window.worldState.state.player.stats.money = 200;
window.sceneManager.loadScene(currentScene);  // 重新加载场景
```

### 技巧2：组合灰化和隐藏

```javascript
choices: [
    // 普通选项：有钱就能买
    {
        text: '购买苹果（10金钱）',
        conditions: {
            attribute: { money: { min: 10 } }
        },
        target: 'buy_apple'
    },

    // VIP选项：金钱≥100才出现，出现后有会员才能买
    {
        text: '💎 VIP专属苹果',
        showConditions: {
            attribute: { money: { min: 100 } }
        },
        conditions: {
            flag: 'is_vip_member'
        },
        target: 'buy_vip_apple'
    }
]
```

### 技巧3：多重保险

```javascript
{
    text: '进入密室',
    target: 'secret_room',
    conditions: {
        OR: [
            {
                inventory: { items: ['钥匙'] }
            },
            {
                attribute: { strength: { min: 20 } }
            },
            {
                attribute: { intelligence: { min: 15 } }
            }
        ]
    }
}
// 有钥匙、力量够、或智力够，三选一即可
```

### 技巧4：排他性选项

```javascript
choices: [
    {
        text: '白天路线',
        showConditions: {
            time: { hour: { min: 6, max: 18 } }
        },
        target: 'day_route'
    },
    {
        text: '夜晚路线',
        showConditions: {
            time: { hour: { min: 18 } }
        },
        target: 'night_route'
    }
]
// 根据时间，只显示其中一个
```

---

## 最佳实践

### ✅ 推荐做法

1. **明确告知玩家条件**
   ```javascript
   text: '挑战BOSS（需要：白天、体力≥60、武器）'
   ```

2. **使用灰化展示可能性**
   ```javascript
   // 让玩家知道"有这个选项"，激励他们达成条件
   conditions: { attribute: { money: { min: 500 } } }
   ```

3. **用隐藏保持神秘感**
   ```javascript
   // 秘密、彩蛋、特殊结局用隐藏
   showConditions: { flag: 'secret_discovered' }
   ```

4. **复合条件保持简单**
   ```javascript
   // ✅ 好：2-3个条件
   AND: [条件1, 条件2]

   // ❌ 差：条件太复杂
   AND: [条件1, 条件2, OR: [条件3, 条件4], NOT: [条件5]]
   ```

### ❌ 避免的做法

1. **不要隐藏所有重要选项**
   ```javascript
   // ❌ 不好：玩家会困惑"我该干什么？"
   choices: [
       { text: '隐藏选项1', showConditions: {...} },
       { text: '隐藏选项2', showConditions: {...} }
   ]

   // ✅ 好：至少有一个始终可见的选项
   choices: [
       { text: '离开', target: 'exit' },  // 始终可见
       { text: '隐藏选项', showConditions: {...} }
   ]
   ```

2. **不要过度使用NOT条件**
   ```javascript
   // ❌ 不好：难以理解
   NOT: [NOT: [NOT: [condition]]]

   // ✅ 好：直接表达
   condition
   ```

3. **避免循环依赖**
   ```javascript
   // ❌ 不好：场景A需要去过场景B，场景B需要去过场景A
   sceneA: {
       conditions: { flag: 'visited_B' }
   },
   sceneB: {
       conditions: { flag: 'visited_A' }
   }
   ```

---

## 调试技巧

### 查看当前状态

在浏览器控制台输入：

```javascript
// 查看世界状态
console.log(window.worldState.state);

// 查看玩家金钱
console.log(window.worldState.state.player.stats.money);

// 查看当前时间
console.log(window.timeSystem.formatTime());

// 查看当前天气
console.log(window.weatherSystem.currentWeather);
```

### 手动修改状态

```javascript
// 设置金钱
window.worldState.state.player.stats.money = 1000;

// 设置时间
window.timeSystem.setTime({ hour: 12, minute: 0 });

// 设置天气
window.weatherSystem.forceWeather('sunny', 2);

// 重新加载场景
window.sceneManager.loadScene(currentSceneData);
```

### 测试所有分支

使用测试页面快速切换状态：
```
file://e:/yozi/条件系统测试.html
```

---

## 常见问题

### Q: 为什么我的条件不生效？

**A:** 检查以下几点：

1. **条件格式正确吗？**
   ```javascript
   // ❌ 错误
   conditions: { money: 100 }

   // ✅ 正确
   conditions: {
       attribute: {
           money: { min: 100 }
       }
   }
   ```

2. **ConditionEngine加载了吗？**
   ```javascript
   console.log(window.ConditionEngine);  // 应该有输出
   ```

3. **WorldState有数据吗？**
   ```javascript
   console.log(window.worldState.state.player.stats);
   ```

### Q: 如何测试隐藏选项？

**A:** 使用测试控制台：
```javascript
// 方法1：修改状态后重新加载场景
window.worldState.state.player.stats.money = 500;
window.sceneManager.loadScene(sceneData);

// 方法2：使用测试页面的预设按钮
// 打开：条件系统测试.html
```

### Q: 条件太复杂怎么办？

**A:** 拆分成多个场景：
```javascript
// ❌ 不好：一个场景里条件太复杂
{
    text: '超级复杂的选项',
    conditions: {
        AND: [
            {OR: [...]},
            {NOT: [...]},
            ...很多条件
        ]
    }
}

// ✅ 好：拆分成多个场景，每个场景条件简单
sceneA: {
    conditions: { simple_condition_1 },
    target: 'sceneB'
},
sceneB: {
    conditions: { simple_condition_2 },
    target: 'final'
}
```

---

## 相关文档

- [随机引擎使用指南](./random-engine-design.md)
- [天气系统指南](./weather-system-guide.md)
- [游戏引擎设计](./condition-random-engine-design.md)

---

**最后更新**: 2025-10-03
**版本**: 1.0
**作者**: Reality游戏开发团队