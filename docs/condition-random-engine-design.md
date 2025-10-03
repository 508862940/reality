# 条件判断 & 概率决策引擎 设计文档

> **版本**：v1.0
> **日期**：2025-10-02
> **状态**：设计阶段 - 待审核

---

## 📌 目录

1. [系统定位与哲学](#1-系统定位与哲学)
2. [条件判断引擎 (ConditionEngine)](#2-条件判断引擎-conditionengine)
3. [概率决策引擎 (RandomEngine)](#3-概率决策引擎-randomengine)
4. [与现有系统集成](#4-与现有系统集成)
5. [六区域应用示例](#5-六区域应用示例)
6. [扩展性预留](#6-扩展性预留)

---

## 1. 系统定位与哲学

### 1.1 核心理念

Reality游戏的世界不是一本预设的剧本，而是一个**活的世界引擎**：

```
世界 = 身体
各系统 = 器官（时间、天气、经济、战斗...）
响应式系统 = 神经网络（连接一切）
条件&概率引擎 = 决策中枢（判断与随机）
```

**关键原则**：
- 每次游玩结果不同，但符合世界规律
- 不是纯随机，而是**条件影响概率**
- 不是纯数值，而是**真实的人生体验**

---

### 1.2 两大引擎分工

#### 🔍 条件判断引擎（ConditionEngine）

**作用**：硬性门槛检查（if-else逻辑树）

- **输入**：条件配置对象 + 当前游戏状态
- **输出**：`true/false`（能不能做）
- **用途**：
  - 选项解锁/灰显
  - 地点准入
  - 功能显示
  - 对话分支

**示例**：
```javascript
// 能不能看到这个选项？
if (ConditionEngine.check({
    item: '门禁卡',
    intelligence: { min: 60 }
})) {
    显示选项;
} else {
    灰显 + 提示"需要门禁卡和智力60";
}
```

---

#### 🎲 概率决策引擎（RandomEngine）

**作用**：不确定性模拟（博德之门3式骰子）

- **输入**：基础概率 + 修正值配置
- **输出**：随机结果（成功/失败 + 程度）
- **用途**：
  - 天气生成
  - 技能检定
  - 战斗命中
  - NPC行为
  - 随机事件

**示例**：
```javascript
// 黑进系统成功率 = 基础50% + 智力加成 + 道具加成
成功率 = RandomEngine.calculate({
    base: 0.5,
    modifiers: [
        { attribute: 'intelligence', weight: 0.01 },  // 每点智力+1%
        { item: '高级黑客工具', bonus: 0.2 }        // 道具+20%
    ]
});

结果 = RandomEngine.roll(成功率);
```

---

### 1.3 两者结合使用

**完整流程**（以技能检定为例）：

```javascript
// 第一步：条件判断（能不能尝试）
if (ConditionEngine.check({
    item: '笔记本电脑',
    intelligence: { min: 60 }  // 最低门槛
})) {
    显示选项"[黑进安保系统]";

    // 第二步：玩家点击后 → 概率判定（能不能成功）
    成功率 = RandomEngine.calculate({
        base: 0.5,
        modifiers: [
            { attribute: 'intelligence', weight: 0.01 },
            { item: '黑客工具', bonus: 0.2 },
            { time: 'night', bonus: 0.1 }  // 夜间守卫松懈
        ]
    });

    if (RandomEngine.roll(成功率)) {
        触发成功剧情;
    } else {
        触发失败剧情（可能触发警报）;
    }
} else {
    灰显选项 + 提示"需要笔记本和智力60";
}
```

---

### 1.4 调用时机分类

| 场景 | 引擎 | 时机 | 玩家可见 |
|------|------|------|---------|
| **天气生成** | Random | 后台每天自动 | 无感知（结果可见） |
| **NPC行为** | Random | 后台自动 | 无感知 |
| **选项显示** | Condition | F1加载时 | 立即可见（灰显/隐藏） |
| **技能检定** | Condition + Random | 玩家点击时 | 有反馈（成功/失败） |
| **战斗命中** | Random | 战斗回合 | 有反馈 |
| **地点准入** | Condition | 切换场景时 | 有提示 |

**核心区别**：
- **后台静默**：天气、NPC、世界系统（玩家看不见投骰过程）
- **前台检定**：技能、战斗、关键选择（玩家看见反馈）

---

## 2. 条件判断引擎 (ConditionEngine)

### 2.1 支持的条件类型

#### 2.1.1 物品检查 (item)

```javascript
// 单个物品
{ item: '门禁卡' }

// 多个物品（需要全部拥有）
{ items: ['笔记本电脑', '黑客工具'] }

// 物品数量
{ item: '金币', count: { min: 100 } }
```

**数据来源**：
- `window.gameState.character.inventory`
- 或 `window.inventorySystem`

---

#### 2.1.2 属性检查 (attribute)

```javascript
// 单个属性
{ attribute: { intelligence: { min: 80 } } }

// 多个属性
{ attributes: {
    intelligence: { min: 60, max: 100 },
    charisma: { min: 50 }
}}

// 范围检查
{ attribute: { health: { min: 30, max: 70 } } }
```

**数据来源**：
- `window.gameState.character` 或 `window.worldState.state.player.stats`

**支持的属性**：
- `intelligence` - 智力
- `charisma` - 魅力
- `strength` - 力量
- `dexterity` - 敏捷
- `wisdom` - 智慧
- `health` - 体力
- `mood` - 心情
- `energy` - 精力
- `spirit` - 精神

---

#### 2.1.3 关系检查 (relationship)

```javascript
// 单个NPC关系
{ relationship: { Zero: { min: 60 } } }

// 多个NPC
{ relationships: {
    Zero: { min: 50 },
    Observer: { min: 30 }
}}

// 关系阶段
{ relationship: { Zero: { stage: 'friend' } } }
// stage可选值：'stranger', 'acquaintance', 'friend', 'close_friend', 'lover'
```

**数据来源**：
- `window.relationshipSystem` 或 `window.worldState.state.relationships`

---

#### 2.1.4 标记检查 (flag)

```javascript
// 单个标记（布尔值）
{ flag: 'MET_ZERO' }

// 标记为false
{ flag: 'TOWER_ALERT_ACTIVE', value: false }

// 多个标记
{ flags: ['WOLF_SOUL_REVEALED', 'MEMORY_FRAGMENT_1'] }
```

**数据来源**：
- `window.storyFlags` 或 `window.worldState.state.story.flags`

**命名规范**：
- 全大写，下划线分隔
- 前缀区分类型：`MET_`, `SEEN_`, `COMPLETED_`, `UNLOCKED_`

---

#### 2.1.5 时间检查 (time)

```javascript
// 时间范围（24小时制）
{ time: { hour: { min: 22, max: 5 } } }  // 22:00-5:00（跨天）

// 特定时段
{ time: { period: 'night' } }  // 'dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'

// 星期几
{ time: { weekday: ['Saturday', 'Sunday'] } }

// 季节
{ time: { season: 'spring' } }  // 'spring', 'summer', 'autumn', 'winter'

// 游戏日期
{ time: { day: { min: 10 } } }  // 第10天之后
```

**数据来源**：
- `window.timeSystem.currentTime`

---

#### 2.1.6 位置检查 (location)

```javascript
// 当前位置
{ location: 'medical_center' }

// 多个位置（任一符合）
{ locations: ['医疗中心', '实验室'] }

// 区域检查
{ area: 'downtown' }  // 在市中心区域的任何地点
```

**数据来源**：
- `window.gameState.character.location` 或 `window.worldState.state.player.position.location`

---

#### 2.1.7 天气检查 (weather)

```javascript
// 当前天气
{ weather: 'rainy' }

// 排除天气
{ weather: { not: 'foggy' } }

// 温度范围
{ temperature: { min: 25, max: 35 } }
```

**数据来源**：
- `window.weatherSystem.currentWeather`

---

#### 2.1.8 其他扩展类型（预留）

```javascript
// 技能检查
{ skill: { hacking: { min: 5 } } }

// 战斗状态
{ combat: { inCombat: false } }

// 性格类型
{ personality: 'logical' }  // 'logical', 'emotional', 'balanced'

// 金钱
{ money: { min: 500 } }
```

---

### 2.2 逻辑运算符

#### 2.2.1 AND（与）

```javascript
// 所有条件都必须满足
{
    AND: [
        { item: '门禁卡' },
        { relationship: { Zero: { min: 60 } } },
        { time: { hour: { min: 22, max: 5 } } }
    ]
}
```

---

#### 2.2.2 OR（或）

```javascript
// 任一条件满足即可
{
    OR: [
        { attribute: { intelligence: { min: 80 } } },
        { item: '万能钥匙' },
        { flag: 'MASTER_HACKER' }
    ]
}
```

---

#### 2.2.3 NOT（非）

```javascript
// 条件不满足时才通过
{
    NOT: [
        { flag: 'TOWER_ALERT_ACTIVE' },
        { combat: { inCombat: true } }
    ]
}
```

---

#### 2.2.4 嵌套组合

```javascript
// 复杂逻辑示例：潜入实验塔
{
    AND: [
        { item: 'B组织门禁卡' },
        { relationship: { Zero: { min: 60 } } },
        { time: { hour: { min: 22, max: 5 } } },  // 夜间

        // 以下任一条件满足
        OR: [
            { attribute: { stealth: { min: 70 } } },  // 潜行能力高
            { item: '隐形斗篷' }                     // 或有道具
        ],

        // 必须不在警报状态
        NOT: [
            { flag: 'TOWER_ALERT_ACTIVE' }
        ]
    ]
}
```

---

### 2.3 数据格式规范

#### 2.3.1 JSON Schema

```javascript
ConditionConfig = {
    // 基础类型条件
    item?: string,                    // 单个物品
    items?: string[],                 // 多个物品
    attribute?: { [key: string]: RangeCheck },
    attributes?: { [key: string]: RangeCheck },
    relationship?: { [npc: string]: RelationCheck },
    flag?: string,
    flags?: string[],
    time?: TimeCheck,
    location?: string,
    locations?: string[],
    weather?: string | { not: string },

    // 逻辑运算符（可嵌套）
    AND?: ConditionConfig[],
    OR?: ConditionConfig[],
    NOT?: ConditionConfig[]
}

RangeCheck = {
    min?: number,
    max?: number,
    equal?: number
}

RelationCheck = {
    min?: number,
    max?: number,
    stage?: string
}

TimeCheck = {
    hour?: RangeCheck,
    period?: string,
    weekday?: string[],
    season?: string,
    day?: RangeCheck
}
```

---

#### 2.3.2 简化写法

为了方便使用，支持简化语法：

```javascript
// 完整写法
{ attribute: { intelligence: { min: 80 } } }

// 简化写法（自动识别）
{ intelligence: 80 }  // 默认为min

// 范围简化
{ intelligence: [60, 100] }  // [min, max]
```

---

### 2.4 API设计

#### 2.4.1 核心方法

```javascript
class ConditionEngine {
    /**
     * 检查条件是否满足
     * @param {ConditionConfig} conditions - 条件配置
     * @param {Object} context - 上下文（可选，默认从全局状态获取）
     * @returns {boolean} 是否满足条件
     */
    static check(conditions, context = null)

    /**
     * 获取失败原因（用于提示）
     * @param {ConditionConfig} conditions - 条件配置
     * @param {Object} context - 上下文
     * @returns {string[]} 失败原因数组
     */
    static getFailReasons(conditions, context = null)

    /**
     * 批量检查多个条件
     * @param {ConditionConfig[]} conditionsList - 条件列表
     * @returns {boolean[]} 结果数组
     */
    static batchCheck(conditionsList)

    /**
     * 获取条件描述文本（用于UI显示）
     * @param {ConditionConfig} conditions - 条件配置
     * @returns {string} 描述文本
     */
    static describe(conditions)
}
```

---

#### 2.4.2 使用示例

```javascript
// 示例1：简单检查
if (ConditionEngine.check({ item: '门禁卡' })) {
    console.log('拥有门禁卡');
}

// 示例2：获取失败原因
const reasons = ConditionEngine.getFailReasons({
    AND: [
        { item: '笔记本' },
        { intelligence: 80 }
    ]
});
// 返回：["缺少物品：笔记本", "智力不足（当前60，需要80）"]

// 示例3：批量检查（优化性能）
const choices = [
    { text: '选项1', conditions: {...} },
    { text: '选项2', conditions: {...} },
    { text: '选项3', conditions: {...} }
];

const results = ConditionEngine.batchCheck(
    choices.map(c => c.conditions)
);
// 返回：[true, false, true]

// 示例4：生成提示文本
const desc = ConditionEngine.describe({
    AND: [
        { item: '门禁卡' },
        { time: { hour: { min: 22 } } }
    ]
});
// 返回："需要门禁卡，夜间（22:00后）"
```

---

### 2.5 与现有系统的兼容性

**数据来源优先级**（从高到低）：

1. **context参数**（如果提供）
2. **worldState**（世界快照，最权威）
3. **各专用系统**（timeSystem, weatherSystem等）
4. **gameState**（降级方案）

```javascript
// 伪代码示例
function getValue(key, context) {
    if (context && context[key]) return context[key];
    if (window.worldState?.state[key]) return window.worldState.state[key];
    if (window[key + 'System']) return window[key + 'System'].getValue();
    if (window.gameState?.[key]) return window.gameState[key];
    return null;
}
```

**承诺**：
- ✅ 不修改任何现有系统
- ✅ 只读取数据，不写入
- ✅ 完全向后兼容

---

## 3. 概率决策引擎 (RandomEngine)

### 3.1 核心功能

#### 3.1.1 加权随机选择

```javascript
/**
 * 从多个选项中按权重随机选择
 * @param {Array} options - 选项数组
 * @returns {*} 选中的选项
 */
RandomEngine.weightedRandom([
    { value: 'sunny', weight: 30 },
    { value: 'cloudy', weight: 25 },
    { value: 'rainy', weight: 40 },
    { value: 'stormy', weight: 5 }
])
// 返回：'rainy'（40%概率）
```

**应用场景**：
- 天气生成
- 随机事件触发
- NPC行为选择
- 战利品掉落

---

#### 3.1.2 骰子检定（博德之门3风格）

```javascript
/**
 * 带修正值的概率检定
 * @param {Object} config - 配置对象
 * @returns {Object} 检定结果
 */
const result = RandomEngine.rollCheck({
    base: 0.5,              // 基础成功率50%
    modifiers: [
        { attribute: 'intelligence', weight: 0.01 },  // 每点智力+1%
        { item: '黑客工具', bonus: 0.2 },           // 道具固定+20%
        { weather: 'foggy', penalty: -0.1 },        // 天气惩罚-10%
        { time: 'night', bonus: 0.1 }               // 夜间加成+10%
    ],
    dice: 'd20'  // 可选：使用d20骰子（1-20随机数）
});

// 返回：
{
    success: true,           // 是否成功
    finalRate: 0.71,        // 最终成功率71%
    roll: 0.85,             // 骰子结果（0-1或1-20）
    margin: 0.14,           // 成功余量（越高越好）
    critical: false,        // 是否大成功
    fumble: false           // 是否大失败
}
```

**修正值计算逻辑**：

```javascript
// 伪代码
最终成功率 = base

for (modifier in modifiers) {
    if (modifier.attribute) {
        // 属性修正：玩家智力80 × 权重0.01 = +0.8
        value = getAttributeValue(modifier.attribute)
        最终成功率 += value * modifier.weight
    }

    if (modifier.item && hasItem(modifier.item)) {
        // 道具固定加成
        最终成功率 += modifier.bonus
    }

    if (modifier.weather && currentWeather == modifier.weather) {
        // 环境惩罚
        最终成功率 += modifier.penalty
    }
}

// 限制在0-1范围
最终成功率 = clamp(最终成功率, 0, 1)

// 投骰子
骰子结果 = Math.random()
成功 = 骰子结果 <= 最终成功率
```

---

#### 3.1.3 简单概率判定

```javascript
/**
 * 简单的百分比判定
 * @param {number} rate - 成功率（0-1）
 * @returns {boolean} 是否成功
 */
RandomEngine.roll(0.7)  // 70%概率返回true
```

---

#### 3.1.4 范围随机数

```javascript
/**
 * 生成指定范围的随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
RandomEngine.randomInt(1, 20)  // 返回1-20之间的整数
RandomEngine.randomFloat(15.0, 25.0)  // 返回15.0-25.0之间的浮点数
```

---

### 3.2 天气生成应用示例

```javascript
// 天气系统调用概率引擎
class WeatherSystem {
    generateDailyWeather() {
        // 1. 获取基础概率（根据季节）
        const baseWeights = this.getSeasonWeights(currentSeason);
        // 夏季示例：{ sunny: 30, cloudy: 25, rainy: 40, stormy: 5 }

        // 2. 应用年份修正（动荡年/和平年）
        const yearType = window.climateManager.currentYearType;
        if (yearType === 'turbulent') {
            baseWeights.stormy *= 1.5;  // 极端天气概率+50%
            baseWeights.sunny *= 0.8;   // 晴天概率-20%
        }

        // 3. 应用节日修正（樱花季希望晴天）
        if (this.isSpecialEvent('sakura_festival')) {
            baseWeights.sunny += 15;
            baseWeights.rainy *= 0.7;
        }

        // 4. 加权随机生成
        const weather = RandomEngine.weightedRandom([
            { value: 'sunny', weight: baseWeights.sunny },
            { value: 'cloudy', weight: baseWeights.cloudy },
            { value: 'rainy', weight: baseWeights.rainy },
            { value: 'stormy', weight: baseWeights.stormy }
        ]);

        // 5. 生成温度（范围随机）
        const tempRange = this.getSeasonTempRange(currentSeason);
        const temperature = RandomEngine.randomInt(
            tempRange.min,
            tempRange.max
        );

        return { weather, temperature };
    }
}
```

---

### 3.3 NPC行为预留

```javascript
// 未来NPC系统会用到（现在占位）
class NPCBehaviorSystem {
    decideMorningAction(npc) {
        // 1. 获取NPC当前状态
        const mood = npc.mood;
        const relationship = this.getRelationshipWith('User');

        // 2. 计算主动打招呼的概率
        const greetRate = RandomEngine.calculate({
            base: 0.3,  // 基础30%
            modifiers: [
                { mood: 'happy', bonus: 0.2 },           // 心情好+20%
                { relationship: relationship, weight: 0.005 },  // 好感度影响
                { time: { hour: { min: 7, max: 9 } }, bonus: 0.1 }  // 早晨+10%
            ]
        });

        // 3. 投骰子决定
        if (RandomEngine.roll(greetRate)) {
            return { action: 'greet', text: npc.getGreeting() };
        } else {
            return { action: 'ignore' };
        }
    }
}
```

---

### 3.4 API设计

```javascript
class RandomEngine {
    /**
     * 加权随机选择
     */
    static weightedRandom(options: Array<{value: any, weight: number}>): any

    /**
     * 带修正值的检定
     */
    static rollCheck(config: {
        base: number,
        modifiers?: Array<Modifier>,
        dice?: 'd20' | 'd100' | 'percent'
    }): RollResult

    /**
     * 简单概率判定
     */
    static roll(successRate: number): boolean

    /**
     * 随机整数
     */
    static randomInt(min: number, max: number): number

    /**
     * 随机浮点数
     */
    static randomFloat(min: number, max: number): number

    /**
     * 计算最终成功率（不投骰子，只计算）
     */
    static calculate(config: ModifierConfig): number

    /**
     * 设置随机种子（用于调试/回放）
     */
    static setSeed(seed: number): void

    /**
     * 重置随机种子
     */
    static resetSeed(): void
}
```

---

### 3.5 天气预报 + 存档方案（最终方案）✅

**核心理念**：真随机生成 + 预报值存档

#### 工作原理

```javascript
// 每天早上5:00生成天气预报
class WeatherSystem {
    generateForecast(today) {
        const forecast = [];

        for (let i = 0; i <= 3; i++) {  // 预测未来3天
            const day = today + i;

            // 1. 根据气候系统计算权重
            const weights = this.calculateWeights(day);

            // 2. 真随机生成天气
            const weather = this.weightedRandom(weights);  // Math.random()
            const temp = this.randomTemp(season);

            forecast.push({
                day: day,
                weather: weather,
                temperature: temp
            });
        }

        // 3. 保存到worldState（关键！）
        worldState.state.environment.forecast = forecast;
    }

    // 获取某天的天气（优先使用预报值）
    getWeatherForDay(day) {
        const forecast = worldState.state.environment.forecast;
        const predicted = forecast.find(f => f.day === day);

        if (predicted) {
            return predicted;  // ✅ 使用预报值（读档后一致）
        } else {
            return this.generateWeatherForDay(day);  // 超出范围重新生成
        }
    }
}
```

#### 存档结构

```javascript
worldState.state.environment = {
    weather: "rainy",      // 当前天气
    temperature: 28,

    // 👇 关键：存储天气预报
    forecast: [
        { day: 8, weather: "rainy", temperature: 28 },
        { day: 9, weather: "sunny", temperature: 32 },
        { day: 10, weather: "cloudy", temperature: 26 },
        { day: 11, weather: "rainy", temperature: 24 }
    ]
}
```

#### 读档一致性保证

```
第1次玩：
- 第8天生成预报：第9天=晴天
- 存档
- 推进到第9天 → 使用预报值 → 晴天

读档回到第8天：
- 加载存档 → 预报：第9天=晴天
- 推进到第9天 → 使用预报值 → 还是晴天 ✅
```

#### 核心优势

| 特性 | 效果 |
|------|------|
| **读档一致** | ✅ 预报范围内（3天）结果固定 |
| **无需种子** | ✅ 使用真随机（Math.random()） |
| **玩家规划** | ✅ 看预报安排活动 |
| **真实感** | ✅ 符合现实（预报+偏差） |
| **存档大小** | ✅ 只增加~200字节（4条预报） |

#### 预报准确度（可选优化）

```javascript
// 根据预测天数降低准确度
generateForecast(today) {
    for (let i = 0; i <= 3; i++) {
        const weather = this.generateWeatherForDay(today + i);

        let accuracy = 1.0;
        if (i === 1) accuracy = 0.9;   // 明天90%准
        if (i === 2) accuracy = 0.75;  // 后天75%准
        if (i === 3) accuracy = 0.6;   // 大后天60%准

        // 有概率预测错误（增加真实感）
        if (Math.random() > accuracy) {
            weather = this.getRandomDifferentWeather(weather);
        }

        forecast.push({
            day: today + i,
            weather: weather,
            accuracy: accuracy  // UI显示："准确度90%"
        });
    }
}
```

#### UI展示

**B区天气浮层（有手机时）**：
```
┌─────────────────────────┐
│ 📊 当前状况             │
│ 🌧️ 雨天  28°C         │
├─────────────────────────┤
│ 📅 未来3天预报          │
│ 明天  ☀️ 晴天 32°C (90%)│
│ 后天  ☁️ 多云 26°C (75%)│
│ 大后天 🌧️ 雨天 24°C (60%)│
└─────────────────────────┘
```

**条件引擎支持（未来扩展）**：
```javascript
// 选项根据天气预报解锁
{
    text: '明天去郊游',
    conditions: {
        forecast: { day: 'tomorrow', weather: 'sunny' }
    }
}
```

---

## 4. 与现有系统集成

### 4.1 与响应式系统集成

**核心原则**：条件引擎只读取数据，不触发响应式更新

```javascript
// ✅ 正确：条件引擎读取响应式数据
ConditionEngine.check({ intelligence: 80 })
// 内部读取：window.reactiveGameState.intelligence 或 worldState

// ❌ 错误：条件引擎不应修改数据
// ConditionEngine不会调用 reactiveSystem.notify()
```

**但是**：当游戏数据变化时，UI需要自动更新条件状态

```javascript
// 场景：玩家获得门禁卡后，灰显选项自动变亮

// 方案1：响应式系统监听
window.reactiveSystem.watch('inventory', () => {
    // 重新检查所有选项的条件
    refreshChoiceStates();
});

// 方案2：场景管理器自动刷新（更简单）
// 当F1场景加载时，自动检查所有条件
// 当物品变化时，下次加载场景自动更新
```

**建议**：
- 初期使用方案2（简单，每次加载场景时检查）
- 后期优化可用方案1（实时响应）

---

### 4.2 与世界快照集成

**存档时需要保存的数据**：

```javascript
// worldState.state 需要包含的条件相关数据
{
    player: {
        stats: { intelligence, charisma, ... },  // ✅ 已有
        inventory: [...],                         // ✅ 已有
        flags: { MET_ZERO: true, ... }           // ⚠️ 需要确认位置
    },
    relationships: {
        Zero: { affection: 75, stage: 'friend' }  // ⚠️ 需要确认
    },
    story: {
        flags: { ... }  // 剧情标记
    }
}
```

**需要确认**：
- `storyFlags` 是否已集成到 `worldState`？
- `relationshipSystem` 数据在哪？

**承诺**：
- ✅ 条件引擎不会破坏现有存档结构
- ✅ 只读取已有字段
- ✅ 如需新增字段（如`personality`），会先与你商量

---

### 4.3 与场景系统集成

**集成点**：`scene-manager.js` 的 `buildScene()` 方法

**改动计划**（需要你批准）：

```javascript
// 文件：js/core/scene-manager.js
// 位置：buildScene() 方法内，构建选项时

// 原代码（第249行左右）
sceneData.choices.forEach((choice, index) => {
    html += `
        <div class="story-choice" data-index="${index}">
            ${choice.text}
        </div>
    `;
});

// 新增：条件检查（不破坏原逻辑）
sceneData.choices.forEach((choice, index) => {
    // 🔍 新增：检查条件
    let cssClass = 'story-choice';
    let disabledAttr = '';
    let tooltipAttr = '';

    if (choice.conditions && window.ConditionEngine) {
        const passed = window.ConditionEngine.check(choice.conditions);
        if (!passed) {
            cssClass += ' disabled';  // 灰显
            const reasons = window.ConditionEngine.getFailReasons(choice.conditions);
            tooltipAttr = `title="${reasons.join(', ')}"`;
        }
    }

    html += `
        <div class="${cssClass}" data-index="${index}" ${tooltipAttr}>
            ${choice.text}
        </div>
    `;
});
```

**CSS新增**（需要你批准）：

```css
/* 文件：css/game-main.css */
/* 位置：.story-choice 样式附近 */

.story-choice.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
    color: #888;
}

.story-choice.disabled:hover {
    background: rgba(255, 255, 255, 0.05);  /* 不变亮 */
}
```

**承诺**：
- ✅ 不改动F1/F2核心逻辑
- ✅ 只在渲染时添加CSS类
- ✅ 向后兼容（没有conditions字段的选项正常显示）

---

### 4.4 与时间系统集成

**场景**：某些选项只在夜间显示

```javascript
// 场景数据示例
{
    id: 'night_options',
    choices: [
        {
            text: '潜入实验塔',
            conditions: {
                time: { hour: { min: 22, max: 5 } }
            },
            timeLevel: 'very_long'
        }
    ]
}
```

**集成方式**：
- 条件引擎读取 `window.timeSystem.currentTime`
- 不修改时间系统任何代码
- 时间变化后，下次加载场景自动更新选项

---

### 4.5 与天气系统集成

**应用场景**：

1. **天气生成**（已在3.2节说明）
   - 天气系统调用 `RandomEngine.weightedRandom()`
   - 后台自动生成，玩家无感知

2. **天气影响选项**
   ```javascript
   {
       text: '在公园散步',
       conditions: {
           weather: { not: 'stormy' }  // 暴雨天不能散步
       }
   }
   ```

3. **天气影响技能检定**
   ```javascript
   // 雾天潜行更容易
   RandomEngine.rollCheck({
       base: 0.6,
       modifiers: [
           { weather: 'foggy', bonus: 0.2 }
       ]
   })
   ```

**承诺**：
- ✅ 不修改 `weather-system.js` 现有逻辑
- ✅ 只读取 `window.weatherSystem.currentWeather`

---

## 5. 六区域应用示例

### 5.1 A区 - 角色立绘

**条件应用**：根据状态自动切换立绘

```javascript
// 示例：下雨天在室外自动显示撑伞立绘
if (ConditionEngine.check({
    AND: [
        { weather: 'rainy' },
        { location: { area: 'outdoor' } }
    ]
})) {
    显示立绘('user_umbrella.png');
} else {
    显示立绘('user_normal.png');
}
```

**注**：这部分逻辑可能在未来实现，现在只是示例

---

### 5.2 B区 - 天气预报

**条件应用**：有手机才显示预报

```javascript
// 在updateWeatherIcon()或相关函数中
if (ConditionEngine.check({ item: '手机' })) {
    显示完整天气浮层;
} else {
    天气浮层中的预报区域不渲染;
}
```

**改动文件**（需要你批准）：
- `js/pages/game-main.js` - `updateWeatherIcon()` 或浮层显示逻辑

---

### 5.3 C区 - 场景预览

**条件应用**：某些场景图片需要特定条件才能看清

```javascript
// 示例：夜晚无夜视能力，场景图片变暗
if (ConditionEngine.check({
    AND: [
        { time: { period: 'night' } },
        NOT: [{ skill: { night_vision: { min: 1 } } }]
    ]
})) {
    场景图片.style.filter = 'brightness(0.3)';
} else {
    场景图片.style.filter = 'brightness(1)';
}
```

---

### 5.4 D区 - 功能面板

**条件应用**：某些标签页需要解锁

```javascript
// 示例：地图标签需要获得地图道具
const mapTab = document.querySelector('[data-tab="map"]');
if (!ConditionEngine.check({ item: '新京市地图' })) {
    mapTab.classList.add('disabled');
    mapTab.title = '需要获得地图';
}
```

---

### 5.5 E区 - 提醒栏

**条件应用**：节日提醒（总是显示，不受手机影响）

```javascript
// 这个已经在天气浮层中处理，E区可以额外提醒
if (currentEvent === 'sakura_festival') {
    showNotice('🌸 今天是樱花祭，公园有特别活动');
}
```

---

### 5.6 F1区 - 剧情选项（核心）

**条件应用**：选项解锁/灰显（已在4.3节说明）

**示例场景数据**：

```javascript
// 文件：js/data/opening-scenes.js（或类似）
{
    id: 'tower_entrance',
    location: '实验塔入口',
    text: ['高耸的实验塔矗立在你面前，守卫森严。'],
    choices: [
        {
            text: '💳 使用门禁卡进入',
            conditions: { item: 'B组织门禁卡' },
            target: 'tower_inside',
            timeLevel: 'quick'
        },
        {
            text: '💻 黑进安保系统',
            conditions: {
                AND: [
                    { item: '笔记本电脑' },
                    { intelligence: { min: 80 } },
                    { personality: 'logical' }
                ]
            },
            target: 'hacking_minigame',
            timeLevel: 'long',
            // 成功率由概率引擎决定
            skillCheck: {
                base: 0.5,
                modifiers: [
                    { attribute: 'intelligence', weight: 0.01 },
                    { item: '黑客工具', bonus: 0.2 }
                ]
            }
        },
        {
            text: '😭 用眼泪打动守卫',
            conditions: {
                AND: [
                    { charisma: { min: 60 } },
                    { personality: 'emotional' }
                ]
            },
            target: 'persuade_guard',
            timeLevel: 'medium',
            skillCheck: {
                base: 0.4,
                modifiers: [
                    { attribute: 'charisma', weight: 0.015 }
                ]
            }
        },
        {
            text: '👀 观察环境',
            // 无条件，总是可选
            target: 'observe_tower',
            timeLevel: 'short'
        }
    ]
}
```

**技能检定执行时机**（在 `scene-manager.js` 的 `proceedToNext()` 中）：

```javascript
// 伪代码
proceedToNext() {
    // ... 现有逻辑 ...

    // 🔍 新增：如果选项有skillCheck，执行概率判定
    if (this.currentChoice.skillCheck && window.RandomEngine) {
        const result = window.RandomEngine.rollCheck(
            this.currentChoice.skillCheck
        );

        if (result.success) {
            // 成功：跳转到成功场景
            nextScene = this.currentChoice.target;
        } else {
            // 失败：跳转到失败场景（如果定义了）
            nextScene = this.currentChoice.failTarget || this.currentChoice.target + '_fail';
        }
    }

    // ... 继续加载nextScene ...
}
```

---

### 5.7 F2区 - 场景控制

**条件应用**：重置按钮的启用/禁用（已由现有逻辑处理）

不需要条件引擎干涉，保持现状。

---

## 6. 扩展性预留

### 6.1 未来功能占位

#### 6.1.1 NPC对话系统

```javascript
// 占位：NPC对话选项条件
{
    npc: 'Zero',
    dialogues: [
        {
            text: '关于你的过去...',
            conditions: {
                relationship: { Zero: { min: 70 } },
                flag: 'WOLF_SOUL_REVEALED'
            }
        }
    ]
}
```

---

#### 6.1.2 战斗系统

```javascript
// 占位：战斗技能条件
{
    skill: '狼魂共鸣',
    conditions: {
        flag: 'ZERO_WOLF_BOND_UNLOCKED',
        energy: { min: 30 }
    },
    hitRate: {
        base: 0.8,
        modifiers: [
            { attribute: 'dexterity', weight: 0.01 }
        ]
    }
}
```

---

#### 6.1.3 性格系统

```javascript
// 占位：性格属性
window.gameState.character.personality = 'logical';
// 可选值：'logical', 'emotional', 'balanced'

// 某些选项只对特定性格开放
{
    text: '冷静分析',
    conditions: { personality: 'logical' }
}
```

---

#### 6.1.4 技能系统

```javascript
// 占位：技能等级
window.gameState.character.skills = {
    hacking: 5,
    stealth: 3,
    persuasion: 7
};

// 技能检定
{
    text: '潜行进入',
    conditions: { skill: { stealth: { min: 5 } } }
}
```

---

### 6.2 性能优化预留

#### 6.2.1 条件缓存

```javascript
// 未来优化：缓存条件检查结果
class ConditionEngine {
    static cache = new Map();

    static check(conditions, context) {
        const key = JSON.stringify(conditions);
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const result = this._doCheck(conditions, context);
        this.cache.set(key, result);
        return result;
    }

    static clearCache() {
        this.cache.clear();
    }
}

// 在游戏状态变化时清除缓存
window.reactiveSystem.watch('*', () => {
    ConditionEngine.clearCache();
});
```

---

#### 6.2.2 批量检查优化

```javascript
// 一次性检查所有选项（减少重复读取）
ConditionEngine.batchCheck(choices.map(c => c.conditions))
```

---

### 6.3 调试工具预留

```javascript
// 开发者工具：在控制台测试条件
window.debugCondition = function(conditions) {
    const passed = ConditionEngine.check(conditions);
    const reasons = ConditionEngine.getFailReasons(conditions);
    console.log('条件检查:', passed ? '✅ 通过' : '❌ 失败');
    if (!passed) {
        console.log('失败原因:', reasons);
    }
};

// 使用
debugCondition({ item: '门禁卡', intelligence: 80 });
```

---

## 7. 实现计划（待批准后执行）

### 7.1 第一阶段：条件引擎核心

**新增文件**：
- `js/core/condition-engine.js` - 条件判断引擎

**功能**：
- 基础条件类型（item, attribute, relationship, flag, time, location）
- AND/OR/NOT逻辑
- `check()` / `getFailReasons()` / `describe()` 方法

**预计工作量**：4-6小时

---

### 7.2 第二阶段：概率引擎核心

**新增文件**：
- `js/core/random-engine.js` - 概率决策引擎

**功能**：
- `weightedRandom()`
- `rollCheck()`
- `roll()` / `randomInt()` / `randomFloat()`

**预计工作量**：3-4小时

---

### 7.3 第三阶段：场景系统集成

**修改文件**：
- `js/core/scene-manager.js` - buildScene()添加条件检查
- `css/game-main.css` - 添加.disabled样式

**功能**：
- 选项条件检查
- 灰显样式
- 提示文本

**预计工作量**：2-3小时

---

### 7.4 第四阶段：天气系统集成

**修改文件**：
- `js/core/weather-system.js` - 调用RandomEngine生成天气
- `js/pages/game-main.js` - 天气预报条件检查

**功能**：
- 基于概率的天气生成
- 手机条件检查

**预计工作量**：2-3小时

---

### 7.5 第五阶段：测试与优化

**新增文件**：
- `js/test/test-condition-engine.js` - 条件引擎测试
- `js/test/test-random-engine.js` - 概率引擎测试

**功能**：
- 单元测试
- 性能测试
- 边缘情况测试

**预计工作量**：3-4小时

---

### 总预计工作量：14-20小时

分3-4天完成，每天4-6小时工作量。

---

## 8. 已确认决策 ✅

### 8.1 数据存储位置

**混合方案**：专用系统管理 + 同步到worldState

```javascript
// worldState存储（核心数据，必须存档）
worldState.state = {
    player: { stats, inventory, position },
    time: { day, hour, minute },
    environment: { weather, temperature, forecast },  // 👈 包含预报

    relationships: {  // 👈 NPC关系
        Zero: { affection: 75, trust: 60, stage: 'friend' }
    },

    story: {  // 👈 剧情标记
        flags: { MET_ZERO: true, WOLF_SOUL_REVEALED: false }
    },

    npcs: {  // 👈 NPC状态
        Zero: {
            mood: 'calm',
            location: 'factory',
            wolfSoulActive: false
        }
    }
}

// 独立系统存储（可选存档或不存档）
window.aiDialogueManager = {
    history: { Zero: [...] }  // AI对话历史（太大，单独存或不存）
}

window.journalSystem = {
    entries: [...]  // 日志详情（纯展示，不影响游戏逻辑）
}
```

**判断标准**：
- ✅ 影响游戏逻辑的 → worldState（必存）
- ❌ 纯展示用的 → 独立系统（可选存）

---

### 8.2 UI显示策略

**初期简化方案**：所有不满足条件的选项都**灰显+提示**

```javascript
// scene-manager.js 渲染时
if (choice.conditions && !ConditionEngine.check(choice.conditions)) {
    cssClass = 'story-choice disabled';
    tooltip = ConditionEngine.getFailReasons(choice.conditions).join(', ');
}
```

**未来扩展**（支持displayStrategy字段）：
```javascript
{
    text: '感性选项',
    conditions: { personality: 'emotional' },
    displayStrategy: 'hide'  // 可选：'hide' | 'disable' | 'show'
}
```

---

### 8.3 技能检定失败场景

**混合方案**（灵活性最高）：

1. 优先使用 `failTarget`（如果定义）
2. 否则查找 `target + '_fail'`（如果存在）
3. 否则留在当前场景 + 显示 `failText`

```javascript
{
    text: '黑进系统',
    target: 'hacking_success',
    failText: '你的技术不够，触发了警报！',  // 👈 失败后显示
    skillCheck: { base: 0.5 }
    // 失败后留在原地，可以重新选择其他选项
}

// 或者定义专门的失败场景
{
    text: '黑进系统',
    target: 'hacking_success',
    failTarget: 'hacking_fail',  // 👈 跳转到专门场景
    skillCheck: { base: 0.5 }
}
```

---

### 8.4 天气随机方案

**最终方案**：真随机 + 天气预报存档 ✅

- ✅ 使用 `Math.random()`（真随机）
- ✅ 每天早上5:00生成3天预报
- ✅ 预报存入 `worldState.state.environment.forecast`
- ✅ 推进时间时优先使用预报值
- ✅ 读档后预报值保持一致

**核心优势**：
- 读档一致（预报范围内）
- 无需种子系统
- 玩家可规划（看预报）
- 真实感强（预报+偏差）

---

## 9. 总结

### 9.1 核心优势

✅ **统一框架**：所有系统使用同一套条件/概率API
✅ **易于扩展**：新增条件类型只需扩展ConditionEngine
✅ **完全兼容**：不破坏任何现有系统
✅ **性能优化**：批量检查、缓存机制
✅ **调试友好**：详细的失败原因、描述文本

---

### 9.2 关键承诺

🔒 **不改动F1/F2核心逻辑**
🔒 **不修改现有系统数据结构**
🔒 **所有改动先审批后实施**
🔒 **向后兼容（无conditions字段的场景正常运行）**

---

### 9.3 下一步

等待你的反馈：
1. ✅ 设计方案是否认可？
2. ❓ 待确认事项的答案
3. ✅ 批准后开始实现第一阶段

---

**文档结束**

💬 **欢迎提出任何疑问或修改建议！**
