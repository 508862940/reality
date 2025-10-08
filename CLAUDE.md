# 🎮 Reality游戏 - 快速参考

## 项目概述
一个中文互动小说游戏，具有AI驱动的NPC对话系统。

---

## 📅 最近更新

### 2025-10-05 - 响应式计算架构v1.0 ⚡性能优化
- ✅ **新增ComputedValue（计算节点类）**
  - 延迟计算机制（脏标记 + requestAnimationFrame）
  - 循环依赖检测
  - 性能统计和调试工具
  - 文件：`js/core/computed-value.js` (229行)
- ✅ **新增DependencyGraph（依赖图管理器）**
  - 自动依赖追踪
  - 变化通知传播
  - 正向+反向依赖映射
  - 文件：`js/core/dependency-graph.js` (356行)
- ✅ **ReactiveSystem增强集成**
  - 集成DependencyGraph
  - 新增 `registerComputed()` / `unregisterComputed()` 方法
  - 增强 `notify()` 自动通知计算图
- ✅ **TemperatureSystemV2（优化版）**
  - 使用ComputedValue实现4个计算节点
  - 性能提升66%（减少重复计算）
  - 文件：`js/core/temperature-system-v2.js` (284行)
- 📝 详见：
  - [响应式架构设计文档](docs/reactive-architecture-design.md)
  - [实施总结](docs/reactive-computed-implementation.md)
  - [性能测试页面](测试-响应式性能对比.html)

### 2025-10-03 - 天气扩展系统v1.3 ⭐重大更新
- ✅ **新增TemperatureSystem（温度系统）**
  - 环境温度 → 体感温度转换
  - 衣服保暖值系统（-10°C ~ +10°C）
  - 食物温度buff系统（持续游戏天数）
  - 7级舒适度判定（严寒→酷热）
  - 完整响应式集成
- ✅ **新增4种特殊天气**
  - 🌸 樱花飘落 - 春季樱花周活动触发
  - 🌈 雨后彩虹 - 雨天转晴5%概率
  - 🌠 流星雨 - 夜晚天文事件
  - ☢️ 污染雾霾 - 污染区域/危机事件
- ✅ **ConditionEngine扩展**
  - 新增 `checkClimate()` - 气候事件检查
  - 扩展 `checkWeather()` - 支持上一次天气检查
  - 天气规则引擎 - 特殊天气条件驱动生成
- ✅ **WeatherSystem增强**
  - 特殊天气条件检查机制
  - 温度响应式通知修复
  - 强制天气自动生成温度
- 📝 详见：
  - [天气系统使用指南 v1.3](docs/weather-system-guide.md)
  - [温度系统API文档 v1.0](docs/temperature-system-api.md)

### 2025-10-03 - 天气系统RandomEngine集成 + BGM响应式修复
- ✅ **Stage 4-5完成**：天气系统集成RandomEngine，完成单元测试
- ✅ **修复重要bug**：ClimateManager降水修正（平和年无雨）
- ✅ **修复BGM响应式**：DailyBGM系统改用reactiveSystem.watch监听天气
- ✅ **测试验证**：8项单元测试全部通过，性能优秀（10000次调用5.20ms）

---

## ⚠️ 核心开发规范（必读！）

### 🌍 世界快照系统（WorldState）
**所有游戏系统必须与世界快照集成！**

- ✅ **必须遵守**：所有游戏数据的变化都必须同步到 `window.worldState.state`
- ✅ **必须遵守**：系统初始化时必须从 `worldState` 加载数据
- ✅ **必须遵守**：数据变更时必须通知 `worldState` 更新
- ❌ **禁止**：各系统独立存储数据，导致数据不一致

**示例：**
```javascript
// ✅ 正确：从worldState同步
this.currentSeason = window.worldState.state.environment.season;

// ❌ 错误：自己计算，导致不一致
this.currentSeason = this.calculateSeason(date);
```

### 🔄 响应式系统（ReactiveSystem）
**所有系统必须通过响应式监听自动响应数据变化！**

#### 工作原理
1. **数据源系统**（如时间系统）变化时 → 调用 `reactiveSystem.notify()`
2. **消费系统**（如天气系统）通过 `reactiveSystem.watch()` 监听 → 自动响应变化
3. **UI组件**也通过 `watch()` 监听 → 自动更新显示

#### 开发规范

- ✅ **必须遵守**：系统初始化时设置 `watch()` 监听器，自动响应变化
- ✅ **必须遵守**：数据变化时调用 `notify()` 通知所有监听者
- ❌ **禁止**：手动轮询检查数据变化
- ❌ **禁止**：直接操作DOM，绕过响应式系统

**正确示例（自动响应）：**
```javascript
// ✅ 天气系统：监听季节变化，自动调整天气概率
class WeatherSystem {
    init() {
        // 设置监听器：季节变了自动响应
        window.reactiveSystem.watch('gameTime.season', (newSeason) => {
            this.currentSeason = newSeason;
            this.generateWeather(); // 自动根据新季节概率生成天气
        });
    }
}

// ✅ 时间系统：推进时间后通知所有监听者
class TimeSystem {
    advanceTime(minutes) {
        this.currentTime.season = this.calculateSeason();
        // 通知所有监听季节的系统
        window.reactiveSystem.notify('gameTime.season', this.currentTime.season);
    }
}
```

**错误示例（手动同步）：**
```javascript
// ❌ 错误：每次手动调用同步
class WeatherSystem {
    updateWeather() {
        this.currentSeason = window.timeSystem.getSeason(); // 手动获取
        this.generateWeather();
    }
}

// ❌ 错误：直接改DOM
document.getElementById('weather').textContent = 'rainy';
```

### 💾 存档系统（IndexedDB）
**所有存档数据必须使用IndexedDB存储！**

- ✅ **必须遵守**：使用 `window.saveSystem` 进行存档操作
- ✅ **必须遵守**：自动存档存储在 IndexedDB，类型为 `type: 'auto'`
- ✅ **必须遵守**：手动存档提供10个槽位，类型为 `type: 'manual'`
- ⚠️ **可选**：localStorage 仅作为降级备份，不作为主存储
- ❌ **禁止**：直接使用 localStorage 存储游戏主数据

**示例：**
```javascript
// ✅ 正确：使用saveSystem
await window.saveSystem.createAutoSave();

// ❌ 错误：直接用localStorage
localStorage.setItem('gameData', JSON.stringify(data));
```

### 🔗 系统同步优先级
**时间系统 → 其他系统 → 世界快照**

1. **时间系统（TimeSystem）**是所有时间相关数据的唯一来源
2. **其他系统**（天气、经济等）从时间系统获取时间信息
3. **世界快照（WorldState）**汇总所有系统数据用于存档

**正确的系统集成流程：**
```javascript
// 1. 时间系统初始化
class TimeSystem {
    constructor() {
        this.currentTime = { season: 'spring', ... };
    }
}

// 2. 天气系统初始化：设置响应式监听
class WeatherSystem {
    init() {
        // ✅ 获取初始季节
        this.currentSeason = window.timeSystem.getSeason();

        // ✅ 设置监听器：自动响应季节变化
        window.reactiveSystem.watch('gameTime.season', (newSeason) => {
            this.currentSeason = newSeason;
            this.generateWeather(); // 自动重新生成天气
            this.syncToWorldState(); // 自动同步到世界快照
        });
    }

    setWeather(weather) {
        this.currentWeather = weather;
        // ✅ 同步到世界快照
        this.syncToWorldState();
        // ✅ 通知其他系统和UI
        window.reactiveSystem.notify('environment.weather', weather);
    }
}

// 3. 时间推进时自动触发连锁反应
class TimeSystem {
    advanceTime(minutes) {
        const oldSeason = this.currentTime.season;
        this.currentTime.season = this.calculateSeason();

        if (oldSeason !== this.currentTime.season) {
            // ✅ 通知所有监听者（天气系统会自动响应）
            window.reactiveSystem.notify('gameTime.season', this.currentTime.season);
        }
    }
}
```

---

## 🎲 条件与概率系统（2025-10-02 新增）

### ⚖️ 条件判断引擎（ConditionEngine）
**用于场景选项的显示控制和准入判断**

#### 核心理念
游戏中的"智能门卫系统" - 统一管理所有条件判断，无需每个场景自己写 if/else。

#### 两种模式

| 模式 | 属性名 | 效果 | 使用场景 |
|------|--------|------|----------|
| **灰化模式** | `conditions` | 显示🔒图标，不可点击，鼠标悬停显示原因 | 告诉玩家"有这个选项，但现在不能选" |
| **隐藏模式** | `showConditions` | 完全不显示选项 | 秘密分支、彩蛋、特殊结局 |

#### 支持的条件类型（10种）

- 💰 **金钱/属性**：`attribute: {money: {min: 100}}`
- 🎒 **物品**：`inventory: {items: ['钥匙']}`
- ⏰ **时间**：`time: {hour: {min: 6, max: 18}}`
- 🌤️ **天气**：`weather: 'sunny'` 或 `weather: ['rainy', 'stormy']`
- ❄️ **季节**：`season: 'winter'`
- 📍 **位置**：`location: '公园'`
- ❤️ **关系**：`relationship: {zero_affection: {min: 60}}`
- 🚩 **标记**：`flag: 'met_zero'`
- 🔗 **逻辑运算**：`AND` / `OR` / `NOT`

#### 快速示例

```javascript
// 场景定义示例
{
    id: 'shop',
    title: '商店',
    text: ['欢迎光临！'],
    choices: [
        {
            text: '购买装备（100金钱）',
            conditions: {                    // 灰化模式
                attribute: { money: { min: 100 } }
            },
            effects: { money: -100 },
            next: 'buy_equipment'
        },
        {
            text: '🌟 隐藏宝藏',
            showConditions: {                // 隐藏模式
                AND: [
                    { attribute: { money: { min: 500 } } },
                    { flag: 'secret_discovered' }
                ]
            },
            next: 'secret_treasure'
        }
    ]
}
```

#### 复杂条件示例

```javascript
// AND条件（全部满足）
conditions: {
    AND: [
        { attribute: { money: { min: 100 } } },
        { time: { hour: { min: 6, max: 18 } } },
        { weather: 'sunny' }
    ]
}

// OR条件（任一满足）
conditions: {
    OR: [
        { attribute: { strength: { min: 20 } } },
        { inventory: { items: ['钥匙'] } }
    ]
}

// NOT条件（条件不满足）
conditions: {
    NOT: [
        { flag: 'in_combat' }
    ]
}
```

#### 使用方法

**在场景中使用（自动）：**
```javascript
// SceneManager 已自动集成，只需在场景数据中添加条件即可
{
    text: '进入VIP房间',
    conditions: { attribute: { money: { min: 100 } } },
    next: 'vip_room'
}
```

**手动调用（代码中）：**
```javascript
// 检查条件
const canBuy = window.ConditionEngine.check({
    attribute: { money: { min: 100 } }
});

// 获取失败原因
const reasons = window.ConditionEngine.getFailReasons({
    attribute: { money: { min: 100 } }
});
// 返回：["金钱不足（当前30，需要100）"]

// 生成条件描述
const desc = window.ConditionEngine.describe({
    attribute: { money: { min: 100 } }
});
// 返回："金钱≥100"
```

#### 相关文件
- [/js/core/condition-engine.js](js/core/condition-engine.js) - 引擎核心（695行）
- [/docs/condition-system-guide.md](docs/condition-system-guide.md) - 完整使用指南（640行）
- [/条件系统测试.html](条件系统测试.html) - 测试页面

---

### 🎲 概率决策引擎（RandomEngine）
**用于游戏中的不确定性模拟（博德之门3风格）**

#### 核心理念
统一的概率计算引擎，支持加权随机、骰子检定、修正值系统。

#### 核心功能
1. **加权随机**：天气生成、战利品掉落
2. **骰子检定**：技能判定、战斗命中（支持修正值）
3. **随机数生成**：范围随机、数组洗牌
4. **D&D风格**：d20、大成功/大失败

#### 快速示例

```javascript
// 1. 加权随机（天气系统已用）
const weather = RandomEngine.weightedRandom([
    {value: 'sunny', weight: 60},    // 60%概率
    {value: 'rainy', weight: 30},    // 30%概率
    {value: 'stormy', weight: 10}    // 10%概率
]);

// 2. 骰子检定（含修正值）
const result = RandomEngine.rollCheck({
    base: 0.5,                              // 基础成功率50%
    modifiers: [
        {attribute: 'intelligence', weight: 0.01},  // 智力加成（智力*1%）
        {item: '幸运符', bonus: 0.1},               // 物品+10%
        {weather: 'rainy', penalty: 0.2}            // 雨天-20%
    ]
});
// 返回：{success: true/false, finalRate: 0.65, roll: 0.42, critical: false, fumble: false}

// 3. 简单概率判定
if (RandomEngine.roll(0.3)) {
    console.log('30%概率触发！');
}

// 4. D&D风格骰子
const d20 = RandomEngine.rollD20(5);  // 掷d20+5
// 返回：{total: 18, roll: 13, modifier: 5, critical: false, fumble: false}

// 5. 随机工具
const num = RandomEngine.randomInt(1, 100);      // 1-100随机整数
const item = RandomEngine.randomChoice(array);   // 从数组随机选一个
const shuffled = RandomEngine.shuffle(array);    // 洗牌
```

#### 修正值系统

支持多种修正值类型：

```javascript
{
    base: 0.6,
    modifiers: [
        // 属性修正
        {attribute: 'strength', weight: 0.01},

        // 物品加成
        {item: '幸运符', bonus: 0.1},

        // 天气影响
        {weather: 'rainy', penalty: 0.2},

        // 时间影响
        {time: {hour: {min: 22}}, penalty: 0.1},

        // 直接加成/惩罚
        {bonus: 0.05},
        {penalty: 0.1}
    ]
}
```

#### 已集成系统
- ✅ **天气系统**：使用 `weightedRandom` 生成天气
- ✅ **时间系统**：随机事件触发
- ⏳ **战斗系统**（待集成）：命中判定、暴击检定
- ⏳ **对话系统**（待集成）：技能检定、魅力判定

#### 相关文件
- [/js/core/random-engine.js](js/core/random-engine.js) - 引擎核心（455行）
- [/js/test/test-random-engine-unit.js](js/test/test-random-engine-unit.js) - 单元测试
- [/docs/condition-random-engine-design.md](docs/condition-random-engine-design.md) - 设计文档

---

### ⚠️ 开发规范补充（条件与概率系统）

#### 使用条件系统的规范
- ✅ **必须遵守**：场景选项优先使用 `conditions` 和 `showConditions`，不要手写条件判断
- ✅ **必须遵守**：新系统需要概率计算时，使用 `RandomEngine`，不要直接用 `Math.random()`
- ❌ **禁止**：在场景中写 `if (window.gameState.character.money >= 100)` 这种判断
- ❌ **禁止**：在系统中写 `Math.random() * 100 < 30` 这种概率计算

**正确示例：**
```javascript
// ✅ 正确：使用 ConditionEngine
{
    text: '购买',
    conditions: { attribute: { money: { min: 100 } } }
}

// ✅ 正确：使用 RandomEngine
const weather = RandomEngine.weightedRandom(weatherOptions);

// ❌ 错误：手写判断
if (window.gameState.character.money >= 100) {
    showBuyButton();
}

// ❌ 错误：直接用Math.random
if (Math.random() < 0.3) {
    triggerEvent();
}
```

---

## 文件结构速查
```
根目录HTML文件：
- index.html → 入口选择页
- menu.html → 主菜单
- character-creation.html → 角色创建
- game-main.html → 游戏主界面

资源文件夹：
- css/ → 所有样式
- js/core/ → 游戏核心
- js/ai/ → AI系统
- js/api/ → API管理
- js/pages/ → 页面逻辑
- js/data/ → 游戏数据
```

## game-main.html界面布局结构

### 上半部分 (45vh) - 信息展示区
```
┌──────────────────────────────────────┐
│  A区(35%)  │      右侧区域(65%)        │
│            │ ┌──────────────────────┐  │
│   角色     │ │ B区 - 位置/时间栏    │  │
│   立绘     │ ├──────────────────────┤  │
│            │ │ C区 - 景色预览       │  │
│            │ ├──────────────────────┤  │
│            │ │ D区 - 功能面板       │  │
│            │ │ (7个标签页+内容区)   │  │
│            │ └──────────────────────┘  │
├──────────────────────────────────────┤
│         E区 - 提醒栏(滚动文本)        │
└──────────────────────────────────────┘
```

#### 各区域功能：
- **A区**: 角色立绘 + 角色名
- **B区**: 📍当前位置 + 🕐游戏时间
- **C区**: 场景预览图/emoji + 场景描述
- **D区**: 功能标签页
  - 📊状态 (体力/心情/金钱/精力条)
  - 🎒背包 | 🗺️地图 | ⭐属性
  - 👥社交 | 📖日志 | ⚙️设置
- **E区**: 💡滚动提醒信息

### 下半部分 (55vh) - 剧情互动区
```
┌──────────────────────────────────────┐
│         F1区 - 剧情文本区             │
│  - 故事文本显示                       │
│  - 选项按钮(story-choice)            │
│  - 插图容器(illustrationContainer)   │
├──────────────────────────────────────┤
│    F2区 - 场景控制/AI输入(双模式)     │
│  场景模式: [▶️继续][↩️重置][🔍放大镜] │
│  AI模式: [输入框...........] [发送➤]  │
└──────────────────────────────────────┘
```

## 重要提醒
1. **HTML必须在根目录** - GitHub Pages需要
2. **资源路径格式**：
   - CSS: `href="css/xxx.css"`
   - JS: `src="js/folder/xxx.js"`
3. **API密钥通过UI配置** - 不硬编码

## 当前状态
- ✅ 文件结构已重组
- ✅ 路径引用已修正
- ✅ 三个主页面可正常导航
- ✅ 场景系统、插图系统已实现
- ✅ 插图浮层系统已集成（2024-12-28）
- ✅ 条件判断引擎已集成（ConditionEngine，2025-10-02）
- ✅ 概率决策引擎已集成（RandomEngine，2025-10-02）
- ✅ 天气扩展系统v1.3（TemperatureSystem + 4种特殊天气，2025-10-03）
- ⏳ 游戏内容开发中

---

# 🌍 游戏世界观设定

## 核心设定
**主题**：失控AI×人性实验×恋爱冒险
- 类似西部世界、楚门的世界的科幻题材
- 未来+超现实元素
- 黑暗组织人体实验背景

## 主角设定
**User（玩家角色）**
- **外观**：完全自定义
  - 性别：男/女/扶她（futanari）
  - 体型档位：
    - 小体型：灵活度高，潜行优势
    - 中体型：平衡型
    - 大体型：体力值高，力量优势
  - 外貌特征：完全自由设定
- **身份背景**：
  - 醒来时失忆状态
  - 真实身份：被废弃的人工智能产品
  - 特殊之处：产生了"情感BUG"被认为是严重损坏
  - 被B组织救活并暗中观察
- **关系选择**：
  - 与Zero：可发展为恋人（不限性别）或可靠的朋友
  - 与观察者：多种可能的关系走向
  - 完全自由的情感路线
- **目标**：探寻世界真相和自身之谜

## 核心组织势力

### A组织（军方实验组织）
- **性质**：政府军方合作组织
- **目标**：武器化改造实验
- **成果**：创造了Zero（拥有特殊力量）
- **立场**：绝不会放Zero自由，视其为战略资产

### B组织（思维研究组织）
- **性质**：思想统治研究机构，与官方有合作
- **目标**：探索机器人与人类的情感边界
- **手段**：
  - 救活并观察User（有情感bug的AI）
  - 利用Zero对User的情感进行实验
  - 表面帮助，实则操控和利用
- **特点**：比A组织更善于心理操控

## 可攻略角色

### 1. Zero（凌） - 狼魂守护者
- **真名**：凌
- **身份**：A组织的军事实验品，古老血脉的继承者
- **特殊能力**：
  - 体内绑定古老的白狼之魂
  - 猩红印记（胸前的荆棘图案）是血脉诅咒的象征
  - 可召唤半透明的白色狼魂进行战斗
  - 金色瞳孔是力量同步的标志
  - 超人的速度、力量和防御（狼魂屏障）
- **内在冲突**：
  - 平时依靠药物和意志力压制狼魂
  - 必须抵抗原始杀戮欲的侵蚀
  - 最终需要学会与狼魂"共鸣"而非对抗
- **性格**：
  - 表面：沉默寡言、锐利如刀
  - 内心：为了守护重要之人可以爆发一切
- **与User关系**：
  - User是他在冰冷城市中唯一的柔软
  - 被"核心"组织（即A组织）用作引诱他的诱饵
  - 产生真实情感，被B组织利用来研究
- **背景设定**：
  - 生活在"新京市"的阴影之下
  - 被A组织觊觎其无人能驾驭的狼魂之力

## 剧情时间线

### 第一阶段：虚假的温暖
- User醒来，失忆状态
- Zero通过B组织的"特权通道"暗中帮助User
- Zero以为自己在保护User，给予温暖
- User逐渐对这份神秘的帮助产生依赖和情感

### 第二阶段：残酷的真相
- Zero发现B组织的真实目的
- 他的每次帮助都是实验的一部分
- 目的是激发和研究User的情感反应
- Zero意识到自己让User陷入更深的实验陷阱

### 第三阶段：痛苦的抉择
- Zero面临选择：继续"帮助"还是切断联系
- 如果停止，User可能崩溃或被废弃
- 如果继续，就是助纣为虐
- 内心的狼魂因愤怒和痛苦开始失控

### 第四阶段：爆发事件（"zero的一段故事"）
- User被作为诱饵引Zero现身
- Zero狼魂完全爆发，大闹实验塔
- 与狼魂达成共鸣，暂时救出User
- 但组织并未被摧毁，两人再次被控制

### 第五阶段：游戏开始
- User再次"醒来"，记忆被清洗
- Zero被更强的药物控制，表面冷漠
- 玩家需要逐步揭开真相，唤醒两人的记忆

### 2. 观察者 - 复仇者与保护者
- **身份**：B组织高层（但非最高权力）
- **背景故事**：
  - 原本善良
  - 家人在政府秘密病毒实验灾难中丧生
  - 仅他和妹妹幸存，后妹妹神秘失踪
  - 加入B组织寻求真相/复仇
- **性格特点**：
  - 极强的自我保护机制
  - 不轻易建立信任关系
  - 内心矛盾：想保护User但受制于组织
- **攻略意义**：
  - 是User和Zero获得自由的"捷径"
  - 掌握关键信息和"钥匙"
  - 但若帮助Zero逃离，自己会陷入危险
- **结局分支**：
  - 温室结局：User留在他创造的"楚门世界"
  - 自由结局：冒险帮助User和Zero逃离

### 3. 其他NPC（待开发）
- **创造者博士** - User的创造者，可能有隐藏动机
- **守护者AI** - 另一个觉醒的AI，立场未明
- **观察者的妹妹**（？）- 失踪的关键人物

## 世界地图结构

### 表层世界 - 日常生活区
1. **中央广场** - 城市中心，信息集散地
2. **居住区** - User醒来的公寓
3. **商业街** - 购物、打工、收集线索
4. **学院区** - 表面是学校，实则观察设施
5. **医疗中心** - 关键地点，隐藏秘密实验室
6. **公园** - 约会地点，也有隐藏入口

### 里层世界 - 半隐藏区域
1. **废弃工厂** - Zero被关押/实验的地方
2. **地下通道** - 连接各区域的秘密网络
3. **数据档案馆** - 破解身份的关键
4. **监控中心** - 发现被观察的真相

### 深层世界 - 核心真相
1. **AI墓地** - 废弃AI存放地，User的"出生地"
2. **组织总部** - 救活User的神秘组织
3. **记忆银行** - 存储所有AI记忆的地方
4. **源代码室** - 最终真相揭露地

## 核心玩法系统

### 1. 探索系统
- 自由度极高的沙盒探索
- 新京市多层世界结构

### 2. 线索收集系统
- 剧本杀式收集证据，拼凑真相
- 矛盾线索触发认知失调

### 3. 战斗系统
- 与敌对势力对抗
- Zero的狼魂战斗机制
- **User的战斗机制**：
  - 没有传统HP血条
  - 使用"创伤值"系统（Trauma）
  - 创伤类型：
    - 物理创伤：零件损坏、外壳破损
    - 系统创伤：程序错误、响应延迟
    - 精神创伤：情感过载、逻辑冲突
  - 创伤累积效果：
    - 轻度（0-30）：动作略显迟缓
    - 中度（31-60）：部分功能受限
    - 重度（61-90）：系统不稳定，可能宕机
    - 极限（91-100）：强制重启（战斗失败）
  - 表现形式：
    - 玩家只看到"头疼"、"手臂发麻"、"视线模糊"
    - 不直接显示是机械损坏
- **对比**：
  - 人类NPC：传统HP血条
  - User：创伤值（隐藏真实原因）
  - Zero：HP+狼魂能量双系统

### 4. 关系培养系统
- 与NPC建立感情
- 影响结局走向

### 5. 记忆唤醒机制
- **记忆碎片收集**：逐步恢复User的记忆
- **三种唤醒触发器**：
  - **痛苦残响 (Pain Echo)**
    - 强烈情绪事件在AI神经网络中的深刻印记
    - 即使被清洗也会留下痕迹
    - 游戏表现：遇到类似场景时的幻痛反应
  - **情感回响 (Emotional Resonance)**
    - 真实情感连接无法完全抹除
    - 记忆消失但情感模式依然存在
    - 游戏表现：靠近特定人物时的莫名熟悉感
  - **认知失调 (Cognitive Dissonance)**
    - AI发现逻辑矛盾时的自我修复机制
    - "为什么我会对陌生人有反应？"
    - 游戏表现：收集足够矛盾线索触发觉醒

### 6. 情感印记系统
- **核心机制**：
  - 每个重要事件都会在User的"神经网络"留下印记
  - 印记类型：创伤型、温暖型、困惑型
  - 不同组合的印记触发不同觉醒路线
  - Zero的狼魂会对这些印记产生共鸣
- **玩家影响**：
  - 每个选择都在"训练"User的情感网络
  - 最终影响觉醒方式和游戏结局
- **哲学内核**：
  - 探讨AI情感的真实性
  - 即使是模拟的神经网络，当某个模式被反复强化，它就成为网络的特征
  - 痛苦和爱都会在网络中留下无法抹去的印记

## NPC系统设计
- 90% 脚本型NPC（背景人物）
- 8% 功能型NPC（商店、任务等）
- 2% API驱动NPC（重要角色，深度对话）

---

## 🤖 NPC动态系统设计（待实现，地图完成后优先级最高）

### 核心设计哲学
**目标**：创造一个动态、涌现式的沙盒世界，而非脚本化的重复事件系统

**对比传统系统（DoL风格）**：
```javascript
// ❌ 错误：固定脚本事件（玩几次就能背下来）
if (location === "park" && time === "night" && random() < 0.3) {
    event = "drunk_harassment"; // 永远一样
}
```

**Reality游戏风格（动态涌现）**：
```javascript
// ✅ 正确：基于NPC状态的动态生成
const nearbyNPC = getNearbyNPC(location);
const event = nearbyNPC.utilityAI.decide({
    mood: nearbyNPC.currentMood,           // NPC当前心情
    affection: nearbyNPC.emotions.affection[User], // 对User的情感
    recentMemory: nearbyNPC.memory.recall("last_met_User"), // 最近记忆
    weather: currentWeather,                // 当前天气
    timeOfDay: currentTime.hour,           // 时间
    personality: nearbyNPC.personality,    // 性格特质
    socialNetwork: nearbyNPC.relationships // 社交网络
});
// 结果：相同位置相同时间，因NPC状态不同而完全不同的事件
```

### NPC四级分层架构

#### Tier 0 - 背景NPC（60%）
**作用**：营造城市氛围，让世界"活起来"

**实现方式**：
- 简单循环脚本（固定路线+时间表）
- 无交互或最小交互（打招呼、问路）
- 数据极小（<500字节/NPC）

**示例**：
- 白桦社区的晨练老人（6:00-7:30固定路线）
- 医疗区的护士（8:00-18:00在诊所）
- 商业街的路人（随机游走）

#### Tier 1 - 功能NPC（25%）
**作用**：提供服务、商店、任务

**实现方式**：
- 固定功能脚本 + 基础对话树
- 简单状态机（开店/关门/休息）
- 数据：1-2KB/NPC

**示例**：
- 商店老板（开关店时间表+库存系统）
- 图书管理员（借书系统+推荐功能）
- 快递员（送件任务+时间触发）

#### Tier 2 - 社交AI（10%）
**作用**：核心NPC居住区（白桦社区）的动态社交网络

**实现方式**：
- **Utility AI决策引擎**（多维度加权计算）
- **多维情感模型**（好感/信赖/尊敬/迷恋）
- **短期记忆系统**（24小时内事件）
- **社交网络影响**（事件通过关系链传播）

**数据量**：5-10KB/NPC

**示例NPC**：
- 白桦社区的邻居（互相八卦、帮忙、借东西）
- 学院区的同学（组队学习、借笔记、竞争）
- 工业区的工友（下班聚会、抱怨、罢工）

**核心机制**：
```javascript
class SocialNPC {
    // Utility AI决策
    decide(context) {
        const actions = [
            {id: 'greet_warmly', utility: this.calcUtility_greet(context)},
            {id: 'share_gossip', utility: this.calcUtility_gossip(context)},
            {id: 'ask_help', utility: this.calcUtility_help(context)},
            {id: 'avoid_player', utility: this.calcUtility_avoid(context)}
        ];
        return this.selectBestAction(actions);
    }

    // 效用计算示例
    calcUtility_greet(context) {
        let utility = 0;
        utility += this.emotions.affection[context.target] * 0.3; // 好感度影响
        utility += (100 - this.mood.stress) * 0.2; // 压力低时更愿意打招呼
        utility -= this.memory.countRecent('greeted_today', context.target) * 20; // 今天打过招呼就不再打
        utility += context.weather === 'sunny' ? 10 : 0; // 晴天加成
        return Math.max(0, utility);
    }
}
```

#### Tier 3 - 核心角色（5%）
**作用**：主要可攻略角色，完整AI系统

**实现方式**：
- **完整Utility AI**
- **多维度情感系统**（4维情感 + 情感变化速率）
- **分层记忆系统**（短期→周→月→年→十年→核心永久）
- **记忆权重修正**（过去记忆影响未来情感获取）
- **社交网络核心节点**（影响周围NPC）
- **API驱动深度对话**（重要剧情时）

**数据量**：20-50KB/NPC

**示例**：Zero、观察者、第三主角

### 多维情感模型（Tier 2/3）

#### 情感四维度
```javascript
emotions: {
    affection: 0-100,   // 好感度（喜欢/讨厌）
    trust: 0-100,       // 信赖度（可靠/怀疑）
    respect: 0-100,     // 尊敬度（敬佩/轻视）
    intrigue: 0-100     // 迷恋度（着迷/无感）
}
```

**四维度组合示例**：
- **朋友**：好感80、信赖70、尊敬60、迷恋20
- **暗恋对象**：好感90、信赖50、尊敬70、迷恋95
- **导师**：好感40、信赖60、尊敬90、迷恋10
- **情敌**：好感20、信赖30、尊敬70、迷恋5

#### 情感变化速率（避免一见钟情）
```javascript
emotionGrowthRate: {
    affection: {current: 1.0, max: 2.5},  // 基础速率1.0，上限2.5
    trust: {current: 0.5, max: 1.5},      // 信赖增长慢
    respect: {current: 0.8, max: 2.0},
    intrigue: {current: 1.2, max: 3.0}    // 迷恋增长快但不稳定
}
```

**机制**：
- 每次互动获得的情感值 = 基础增量 × 当前速率
- 速率随互动次数缓慢提升（最多到max）
- 负面事件可降低速率

#### 记忆权重修正（防止反复刷好感）
```javascript
// 过去记忆影响未来情感获取
futureGain = baseGain × memoryModifier

// 示例：送过3次花
memoryModifier = {
    "gift_flower": {count: 3, totalAffection: 45},
    modifier: 0.6  // 第4次送花只有60%效果
}
```

### 分层记忆系统（Tier 3核心角色）

#### 六层时间衰减
```javascript
memory: {
    short: [],      // 24小时（100%权重）
    week: [],       // 7天（80%权重）
    month: [],      // 30天（60%权重）
    year: [],       // 365天（40%权重）
    decade: [],     // 3650天（20%权重）
    core: []        // 永久核心（100%权重，不衰减）
}
```

**自动晋升规则**：
- 短期记忆满100条 → 重要的晋升到week
- week满50条 → 重要的晋升到month
- 以此类推

**核心记忆判定**（直接进core，永不遗忘）：
- 生死相关事件
- 背叛/拯救
- 第一次表白/拒绝
- 重大秘密揭露

#### 记忆检索机制
```javascript
// 根据当前情境检索相关记忆
recall(context) {
    let relevantMemories = [];

    // 遍历所有层级
    for (let layer of ['short', 'week', 'month', 'year', 'decade', 'core']) {
        const memories = this.memory[layer].filter(m =>
            m.tags.includes(context.location) ||
            m.tags.includes(context.activity) ||
            m.involvedNPCs.includes(context.target)
        );

        // 应用时间衰减权重
        memories.forEach(m => {
            m.effectiveWeight = m.emotionalWeight * this.getLayerWeight(layer);
        });

        relevantMemories.push(...memories);
    }

    // 按权重排序，返回前5个最相关的
    return relevantMemories.sort((a,b) => b.effectiveWeight - a.effectiveWeight).slice(0, 5);
}
```

### 社交网络影响传播

#### 网络结构
```javascript
socialNetwork: {
    "NPC_001": {relationship: "friend", strength: 0.8},
    "NPC_002": {relationship: "colleague", strength: 0.5},
    "NPC_003": {relationship: "rival", strength: -0.6}
}
```

#### 事件传播机制
```javascript
// 玩家对NPC_A做了某事 → 通过社交网络影响NPC_B
function propagateEvent(event, sourceNPC) {
    for (let [npcId, relation] of Object.entries(sourceNPC.socialNetwork)) {
        const targetNPC = getNPC(npcId);

        // 根据关系强度和类型决定传播效果
        let impact = event.baseImpact * relation.strength;

        // 朋友的朋友是朋友（正面传播）
        if (relation.relationship === "friend" && event.type === "positive") {
            targetNPC.emotions.affection[User] += impact * 0.3;
        }

        // 敌人的朋友是敌人（负面传播）
        if (relation.relationship === "rival" && event.type === "positive") {
            targetNPC.emotions.affection[User] -= impact * 0.2;
        }

        // 添加二手记忆（听说的事）
        targetNPC.memory.short.push({
            type: "hearsay",
            content: `听说User对${sourceNPC.name}${event.description}`,
            reliability: 0.6, // 二手消息可靠度低
            source: sourceNPC.name
        });
    }
}
```

### 动态事件生成系统

#### 事件池架构
```javascript
// 不是固定事件列表，而是事件生成模板
const EventTemplates = {
    "random_encounter": {
        conditions: (context) => context.location.npcCount > 0,
        generate: (context) => {
            const npc = context.nearbyNPC;
            const mood = npc.currentMood;

            // 根据NPC状态动态生成事件内容
            if (mood.stress > 70 && npc.emotions.trust[User] > 50) {
                return {
                    type: "emotional_support",
                    text: `${npc.name}看起来很焦虑，向你倾诉烦恼...`,
                    choices: generateSupportChoices(npc)
                };
            } else if (npc.memory.recall({tag: "gossip", target: User}).length > 0) {
                return {
                    type: "gossip_confrontation",
                    text: `${npc.name}似乎听说了关于你的传闻...`,
                    choices: generateGossipChoices(npc)
                };
            }
            // ... 更多动态分支
        }
    }
};
```

### 性能优化策略

#### 1. 区域激活（Spatial Activation）
```javascript
// 只计算玩家附近的NPC
const ACTIVATION_RADIUS = 3; // 地图节点距离

function updateNPCs() {
    const playerLocation = window.worldState.state.character.location;

    // Tier 2/3 NPC：3个节点内全AI运算
    const nearNPCs = getNPCsInRadius(playerLocation, ACTIVATION_RADIUS);
    nearNPCs.filter(n => n.tier >= 2).forEach(npc => {
        npc.runFullAI();
    });

    // Tier 0/1 NPC：仅更新位置
    nearNPCs.filter(n => n.tier <= 1).forEach(npc => {
        npc.updatePosition();
    });

    // 远处NPC：完全暂停
    const distantNPCs = getAllNPCs().filter(n => !nearNPCs.includes(n));
    distantNPCs.forEach(npc => npc.pause());
}
```

#### 2. 时间切片（Time Slicing）
```javascript
// 不在同一帧计算所有NPC，分帧处理
const NPC_UPDATE_QUEUE = [];
let currentFrameIndex = 0;

function initNPCUpdateQueue() {
    const allNPCs = getAllNPCs();
    const framesPerCycle = 60; // 1秒更新一轮（60fps）

    for (let i = 0; i < allNPCs.length; i++) {
        const frameIndex = i % framesPerCycle;
        if (!NPC_UPDATE_QUEUE[frameIndex]) {
            NPC_UPDATE_QUEUE[frameIndex] = [];
        }
        NPC_UPDATE_QUEUE[frameIndex].push(allNPCs[i]);
    }
}

function updateNPCsThisFrame() {
    const npcsToUpdate = NPC_UPDATE_QUEUE[currentFrameIndex] || [];
    npcsToUpdate.forEach(npc => npc.update());

    currentFrameIndex = (currentFrameIndex + 1) % NPC_UPDATE_QUEUE.length;
}
```

#### 3. 内存管理
- Tier 0：500字节/NPC × 1000 = 0.5MB
- Tier 1：2KB/NPC × 200 = 0.4MB
- Tier 2：8KB/NPC × 80 = 0.64MB
- Tier 3：40KB/NPC × 5 = 0.2MB
- **总计**：约1.74MB（完全可接受）

### 实现文件规划

```
js/core/npc-ai-system.js         // NPC核心AI引擎（待创建）
├── class UtilityAI              // Utility AI决策引擎
├── class EmotionSystem          // 多维情感系统
├── class MemorySystem           // 分层记忆系统
└── class SocialNetwork          // 社交网络管理

js/core/npc-event-generator.js   // 动态事件生成器（待创建）
├── EventTemplates               // 事件模板库
├── generateEvent()              // 事件生成函数
└── propagateEvent()             // 社交传播函数

js/data/npc-definitions.js       // NPC定义数据（待创建）
├── Tier0_NPCs[]                 // 背景NPC列表
├── Tier1_NPCs[]                 // 功能NPC列表
├── Tier2_NPCs[]                 // 社交AI列表
└── Tier3_NPCs[]                 // 核心角色列表

js/core/npc-scheduler.js         // NPC时间表系统（待创建）
├── DailySchedule                // 日常时间表
├── WeeklyRoutine                // 周常规律
└── SpecialEvents                // 特殊事件时间表
```

### 与现有系统集成

#### 1. 响应式系统集成
```javascript
// NPC状态变化通知其他系统
window.reactiveSystem.watch('npc.emotions.Zero.affection', (newValue) => {
    if (newValue >= 80 && !window.worldState.state.flags.ZERO_FRIEND) {
        window.worldState.state.flags.ZERO_FRIEND = true;
        unlockNewDialogues('Zero', 'friend_stage');
    }
});
```

#### 2. 条件引擎集成
```javascript
// 场景选项根据NPC情感状态显示
{
    text: '邀请Zero去咖啡厅',
    showConditions: {
        AND: [
            {relationship: {zero_affection: {min: 60}}},
            {relationship: {zero_trust: {min: 50}}},
            {NOT: [{flag: 'zero_currently_angry'}]}
        ]
    },
    next: 'date_coffee_shop'
}
```

#### 3. WorldState存档集成
```javascript
// 存档时保存NPC状态
worldState.state.npcs = {
    tier2: Tier2NPCs.map(npc => npc.serialize()),  // 完整状态
    tier3: Tier3NPCs.map(npc => npc.serialize()),  // 完整状态
    tier1: Tier1NPCs.map(npc => ({id: npc.id, state: npc.currentState})), // 仅状态
    tier0: [] // 不保存，重新生成
};
```

### 开发优先级（地图完成后）

1. **阶段1**：Tier 3核心角色AI（Zero、观察者）
   - 实现Utility AI引擎
   - 实现多维情感系统
   - 实现分层记忆系统
   - 测试核心机制

2. **阶段2**：Tier 2社交AI（白桦社区邻居）
   - 简化版Utility AI
   - 短期记忆系统
   - 社交网络传播
   - 动态事件生成

3. **阶段3**：Tier 0/1 NPC（背景+功能）
   - 简单时间表系统
   - 基础对话树
   - 功能脚本（商店等）

4. **阶段4**：性能优化和平衡
   - 区域激活系统
   - 时间切片优化
   - 内存管理
   - 事件频率调优

### 相关设计文档
- [/docs/NPC-EMOTION-SYSTEM-DESIGN.md](docs/NPC-EMOTION-SYSTEM-DESIGN.md) - 完整设计文档（上一会话创建）
- `/js/core/npc-ai-system.js` - 待创建
- `/js/core/npc-event-generator.js` - 待创建
- `/js/data/npc-definitions.js` - 待创建

---

## 💾 存档系统设计方案（基础版已实现，高级功能开发中）

### 🌍 核心理念：世界摄像头快照
整个游戏界面就像一个"世界摄像头"，存档 = 某一时刻的完整快照。刷新页面后世界会从断点继续运行。

### 存档类型（三层结构）
1. **自动存档 (Auto Save)** ✅部分实现
   - 每30秒自动保存（game-bootstrap实现）
   - 切换场景时自动保存 ✅
   - 只保留最新的1个 ✅
   - 存储位置：localStorage + `type: 'auto'`

2. **快速存档 (Quick Save)**
   - F5键或快捷按钮一键保存
   - 保留最近3个快速存档
   - 循环覆盖最旧的
   - 存储位置：`type: 'quick', slot: 0-2`

3. **手动存档 (Manual Save)**
   - 10个存档槽位
   - 可命名、可覆盖
   - 显示截图、时间、进度
   - 存储位置：`type: 'manual', slot: 0-9`

### 数据库结构
```javascript
// IndexedDB 数据库设计
db.stores({
    gameState: 'id',                        // 当前游戏状态
    saves: '++id, type, slot, timestamp',   // 存档数据表
    apiConfig: 'service',                   // API配置
    settings: 'key'                         // 游戏设置
});
```

### 存档数据格式
```javascript
{
    id: auto_increment,           // 自增ID
    type: 'auto/quick/manual',    // 存档类型
    slot: 0-9,                    // 槽位号
    name: '存档名称',              // 用户定义的名称
    timestamp: Date.now(),         // 保存时间戳

    // 游戏数据
    gameData: {
        character: {},             // 角色数据
        gameTime: {},              // 游戏时间
        location: '',              // 当前位置
        scene: '',                 // 当前场景
        chapter: 1,                // 章节进度
        playTime: 0,               // 游戏时长(秒)
        // ... 其他游戏数据
    },

    // 元数据
    metadata: {
        version: '1.0.0',          // 游戏版本
        screenshot: '',            // Base64截图(可选)
        description: ''            // 存档描述
    }
}
```

### 存档系统API
```javascript
// js/core/save-system.js
class SaveSystem {
    // 基础功能
    async createSave(type, slot, name)    // 创建存档
    async loadSave(saveId)                // 读取存档
    async deleteSave(saveId)              // 删除存档
    async getSavesList(type)              // 获取存档列表

    // 快捷功能
    async quickSave()                     // 快速存档
    async autoSave()                      // 自动存档

    // 高级功能
    async exportSave(saveId)              // 导出存档为JSON
    async importSave(file)                // 从文件导入存档
    async exportAllSaves()                // 导出所有存档

    // 工具功能
    validateSaveData(data)                // 验证存档格式
    getSaveInfo(saveId)                   // 获取存档信息
    renameSave(saveId, newName)          // 重命名存档
}
```

### UI界面规划
- **游戏内快捷栏**：F5快速存档、F9快速读档
- **D区设置标签页**：快速存档、存档管理入口
- **存档管理对话框**：完整的存档列表、创建/读取/删除
- **主菜单存档页**：继续游戏、载入存档、新游戏

### 实现状态

#### ✅ 已完成功能
1. **基础架构**
   - game-bootstrap启动引导系统
   - worldState世界状态管理器
   - 完整世界快照保存/恢复
   - 刷新后自动继续游戏（不会重置）

2. **界面保存**
   - A区立绘状态 ✅
   - B区时间位置 ✅
   - C区场景预览 ✅
   - D区所有面板 ✅
   - E区提醒消息 ✅
   - F区剧情内容 ✅

3. **引擎系统集成**
   - 时间系统 ✅
   - 天气系统 ✅
   - 经济系统 ✅
   - 种植系统 ✅
   - 战斗系统 ✅
   - 关系系统 ✅

4. **存档功能**
   - 自动存档（30秒+场景切换）✅
   - 自动存档读取（刷新页面时）✅
   - 手动存档创建 ✅
   - 手动存档读取 ⚠️（刚修复，需测试）
   - 快速存档创建 ✅
   - 快速存档读取 ⚠️（需验证）

#### ⏳ 待开发功能
1. **UI优化**
   - 存档槽位可视化界面
   - 存档截图缩略图
   - 覆盖确认对话框
   - 存档详情显示（进度/时长）

2. **高级功能**
   - 导入/导出完善
   - 云同步
   - 存档加密防作弊
   - 版本兼容升级

3. **菜单集成**
   - 主菜单继续游戏
   - 新游戏覆盖提示
   - 多存档切换

### 自动存档系统（简化版）

#### 核心机制
- **游戏内时间**：每天早上5:00自动存档（主要依赖）
- **备用保险**：超过30分钟没存档时触发（防止意外）

#### 其他触发点
1. **场景切换**：切换场景时存档（间隔：1分钟）
2. **重要选择**：做出重要选择后立即存档
3. **战斗胜利**：战斗结束后存档（间隔：30秒）
4. **页面卸载**：离开游戏页面前必定存档

#### 设计理念
- 简单可靠：主要依赖游戏内时间，不会判断失误
- 每个游戏日自动存档一次，既安全又不频繁
- 保留手动存档和快速存档供玩家主动使用

### 注意事项
- 所有页面共用同一套存档系统
- menu.html和game-main.html的存档必须互通
- 存档版本兼容性处理
- 存档损坏检测和修复

---

## 🌍 完整存档系统设计（待实现）

### 核心理念：世界快照
存档 = 游戏世界在某一时刻的完整快照，保存后继续游玩不中断

### 1. 分层存储架构

#### 层级1：核心数据（必须保存）
```javascript
core: {
    version: "1.0.0",
    character: {
        name, health, mood, money, energy, spirit,
        location, position
    },
    gameTime: { day, hour, minute },
    playTime: 12580 // 总游玩秒数
}
```

#### 层级2：世界系统
```javascript
world: {
    // 天气系统
    weather: { current, forecast, temperature },

    // 经济系统
    economy: {
        marketPrices,  // 只保存与默认不同的
        playerTransactions: [] // 最近交易
    },

    // 种植系统
    farming: {
        plots: [
            { id, crop, plantedDay, growth, watered }
        ],
        warehouse: { "tomato": 50, "wheat": 100 }
    }
}
```

#### 层级3：剧情进度
```javascript
story: {
    mainQuest: "chapter2_part3",

    // 关键剧情标记（布尔值省空间）
    flags: {
        "MET_ZERO": true,
        "WOLF_SOUL_REVEALED": true,
        "MEMORY_FRAGMENT_1": true
    },

    // NPC关系
    relationships: {
        "Zero": {
            affection: 75,
            trust: 60,
            stage: "friend"
        }
    }
}
```

#### 层级4：战斗系统
```javascript
combat: {
    // 永久数据（始终保存）
    permanent: {
        combatLevel: 5,
        unlockedSkills: [],
        statistics: {}
    },

    // 临时数据（战斗中才有）
    temporary: null, // 平时为null节省空间

    // 如果在战斗中：
    // temporary: {
    //     round: 5,
    //     player: { hp, trauma, stamina },
    //     enemies: [],
    //     environment: {}
    // }
}
```

#### 层级5：AI记忆（独立管理）
```javascript
aiMemory: {
    // 暂时简单实现，等API接入后优化
    "Zero": {
        dialogues: [], // 最近20条
        summary: ""    // 关系摘要
    }
}
```

### 2. 存储优化策略

#### 差异存储
- 只保存与默认值不同的数据
- 世界变化只记录改变的部分

#### 数据压缩
- 使用ID代替完整数据
- 布尔值用位掩码存储
- 历史记录限制数量

#### 分级保存
- 快速存档：只保存core + world.time
- 完整存档：保存所有数据
- 增量存档：只保存变化（未来）

### 3. 预计存档大小
- 非战斗状态：~40KB
- 战斗中：~50KB
- 包含AI记忆：~60KB

### 4. 实现优先级
1. ✅ 基础存档系统（已完成）
2. ⏳ 剧情标记系统（待实现）
3. ⏳ NPC关系系统（待实现）
4. ⏳ 世界系统（天气/经济/种植）（待实现）
5. ⏳ 战斗状态保存（待实现）
6. ⏳ AI记忆管理（等API接入后）

---

## 🌤️ 天气UI系统（2025-10-01 更新）

### 概述
Reality游戏已集成完整的天气可视化系统，包括天气图标、详情浮层和全屏粒子特效。

### 核心功能
1. **B区天气图标**：简洁的emoji显示当前天气
2. **悬停浮层（v1.1完整版）**：详细天气信息（参考时间浮层设计）
   - **📊 当前状况区**：温度（带颜色标识）、季节、能见度、详细描述
   - **🌍 世界状态区**：年份周期（平和/动荡）、季节活动（金色高亮）、极端天气（红色警告）
   - **📅 未来3天预报区**：3天天气预报（带温度和图标）
   - **完整占位符系统**：无数据时显示友好占位提示
3. **全屏天气特效**：
   - 🌧️ 雨滴动画（普通雨/暴雨）
   - ❄️ 雪花飘落动画
   - 🌸 樱花花瓣动画（季节活动）
   - ⚠️ 待细化：特效强度、密度、动画细节需商讨
4. **响应式监听**：使用reactiveSystem自动更新
5. **E区通知**：天气变化时自动提醒

### 使用方法

#### 查看天气详情
- **PC端**：鼠标悬停在B区天气图标上
- **移动端**：长按天气图标

#### 手动控制天气
```javascript
// 强制改变天气
window.weatherSystem.forceWeather('rainy', 4); // 雨天持续4小时

// 更新天气图标
window.updateWeatherIcon();

// 显示天气特效
window.createWeatherEffects('rainy', 0.7); // 雨天，强度0.7

// 特殊：樱花特效（季节活动）
window.createWeatherEffects('sakura', 1.0);

// 停止所有特效
window.createWeatherEffects('sunny', 0);
```

#### 天气类型
- `sunny` - 晴天 ☀️
- `cloudy` - 多云 ☁️
- `rainy` - 雨天 🌧️
- `stormy` - 暴雨 ⛈️
- `snowy` - 雪天 ❄️
- `foggy` - 雾天 🌫️

### 相关文件
- [/game-main.html](game-main.html) - 天气UI HTML结构（第65-67, 71-120, 336-344行）
- [/css/game-main.css](css/game-main.css) - 天气UI样式（第3799-4158行）
- [/js/pages/game-main.js](js/pages/game-main.js) - 天气UI逻辑（第2620-2755行）
- [/js/core/weather-system.js](js/core/weather-system.js) - 天气系统核心（含详细描述）
- [/js/core/climate-manager.js](js/core/climate-manager.js) - 气候管理器
- [/js/test/test-weather-system.js](js/test/test-weather-system.js) - 测试工具
- [/docs/weather-system-guide.md](docs/weather-system-guide.md) - 完整使用文档
- [/天气UI系统演示.html](天气UI系统演示.html) - 独立演示文件

### 技术特点
- ✅ 与时间浮层保持一致的交互模式
- ✅ 响应式设计（PC鼠标悬停/移动端长按）
- ✅ 高性能CSS3动画（GPU加速）
- ✅ 自动监听环境变化并更新
- ✅ 模块化设计，易于扩展
- ✅ 完整的section分区设计（当前状况/世界状态/预报）
- ✅ 智能占位符系统（无数据友好提示）
- ✅ 视觉高亮（季节活动金色、极端天气红色）

### 待完善功能
1. **天气粒子特效细化**
   - 需商讨：雨/雪/樱花特效的强度、密度、动画细节
2. **响应权重系统**
   - 定义不同事件的优先级
   - 实现权重冲突处理机制

### 未来扩展
- C区场景图片应用天气滤镜效果
- A区角色立绘根据天气变化（雨伞等）
- 更多天气类型和粒子特效
- 天气音效同步

---

## 🌡️ 温度系统与天气扩展（2025-10-03 新增）

### 概述
Reality游戏现已集成独立的温度系统（TemperatureSystem）和4种特殊天气类型，支持完整的体感温度计算、衣物保暖、食物buff和条件驱动的特殊天气生成。

### 核心功能

#### 1. 温度系统（TemperatureSystem）
**环境温度 → 体感温度转换系统**

- **环境温度**：由天气系统根据季节+气候生成
- **体感温度**：环境温度 + 衣服修正 + 食物buff
- **舒适度判定**：7级系统（严寒→酷热）
- **心情影响**：舒适度影响玩家心情值

**温度修正系统**：
- **衣物保暖值**：-10°C ~ +10°C 修正
  - 冬装：+8°C（防寒）
  - 夏装：-3°C（清凉）
  - 普通衣物：0°C（无修正）
- **食物温度buff**：持续游戏天数（非实时分钟）
  - 热饮：+3°C，持续0.5天（半天）
  - 冰饮：-2°C，持续0.25天（6小时）
  - 辣味食物：+5°C，持续1天

**舒适度等级表**：

| 体感温度 | 等级 | 心情影响 | 描述 |
|---------|------|----------|------|
| ≤-10°C | freezing | -15 | 严寒刺骨，身体僵硬 |
| -9~5°C | cold | -8 | 寒冷，需要保暖 |
| 6~17°C | cool | -3 | 稍凉，略感不适 |
| 18~26°C | comfortable | 0 | 舒适宜人 |
| 27~32°C | warm | -5 | 温暖，略感闷热 |
| 33~39°C | hot | -10 | 炎热，汗流浃背 |
| ≥40°C | scorching | -20 | 酷热难耐，中暑风险 |

#### 2. 特殊天气系统（4种）

**🌸 樱花飘落（sakura）**
- **触发条件**：春季 + 樱花周活动（SAKURA_WEEK）
- **基础天气**：晴天
- **特效**：樱花花瓣飘落动画
- **效果**：心情+5、精神+3、浪漫度+10
- **双层设计**：全局天气 + 公园/校园区域增强

**🌈 雨后彩虹（rainbow）**
- **触发条件**：上一个天气是雨天 + 当前转晴 + 5%概率
- **基础天气**：晴天
- **特效**：彩虹渐变光效
- **效果**：幸运度+20、心情+10（幸运日）
- **特殊机制**：当天随机事件成功率提升

**🌠 流星雨（meteor_shower）**
- **触发条件**：夜晚（22-6点）+ 晴朗 + 天文事件
- **基础天气**：晴天
- **特效**：流星划过动画
- **效果**：好运+15、精神+5、NPC好感度+3
- **特殊玩法**：解锁观星约会活动

**☢️ 污染雾霾（polluted）**
- **触发条件**：污染区域 OR 危机事件
- **基础天气**：雾天
- **特效**：灰暗滤镜 + 污染粒子
- **效果**：精神-10、健康-5、能见度30
- **双层设计**：全局天气 + 污染区域debuff叠加

#### 3. ConditionEngine扩展

**新增条件类型：**

```javascript
// 气候事件检查
conditions: {
    climate: {
        event: 'SAKURA_WEEK'        // 季节活动
    }
}

// 上一次天气检查
conditions: {
    weather: {
        previous: 'rainy'           // 上一个天气是雨天
    }
}
```

**新增方法**：
- `ConditionEngine.checkClimate(climateCondition, context)` - 检查气候事件/年份类型/动荡等级
- `ConditionEngine.checkWeather()` - 扩展支持previous属性

### 使用方法

#### 温度系统API

```javascript
// 初始化（自动完成）
window.temperatureSystem.init();

// 设置衣物保暖值
window.temperatureSystem.setClothingModifier(8);  // 穿冬装+8°C

// 添加食物buff
window.temperatureSystem.addFoodBuff('hot_coffee', 3, 0.5);  // 热咖啡+3°C，持续半天

// 手动更新温度（通常不需要，响应式自动更新）
window.temperatureSystem.updateTemperature(15);  // 环境温度15°C

// 获取当前状态
const state = window.temperatureSystem.currentState;
console.log('环境温度:', state.environmentTemp);
console.log('体感温度:', state.apparentTemp);
console.log('舒适度:', state.comfortLevel);
console.log('心情影响:', state.moodPenalty);
```

#### 特殊天气触发

```javascript
// 手动强制特殊天气（测试用）
window.weatherSystem.forceWeather('sakura', 4);      // 樱花天持续4小时
window.weatherSystem.forceWeather('rainbow', 2);     // 彩虹2小时
window.weatherSystem.forceWeather('meteor_shower', 6); // 流星雨6小时
window.weatherSystem.forceWeather('polluted', 8);    // 污染天8小时

// 正常游戏中通过条件触发
// 天气系统会自动检查条件并生成特殊天气
```

#### 条件驱动示例

```javascript
// 场景选项：樱花天才能看到
{
    text: '赏樱花',
    showConditions: {
        weather: 'sakura'
    },
    next: 'sakura_viewing'
}

// 场景选项：彩虹天触发隐藏剧情
{
    text: '追逐彩虹',
    showConditions: {
        weather: 'rainbow'
    },
    effects: { luck: 10 },
    next: 'rainbow_treasure'
}
```

### 响应式集成

**完整响应链**：
1. 天气变化 → `weatherSystem.setWeather()`
2. 生成新温度 → `reactiveSystem.notify('environment.temperature')`
3. 温度系统监听 → `temperatureSystem.updateTemperature()`
4. 计算体感温度 → `calculateApparentTemp()`
5. 通知UI更新 → `reactiveSystem.notify('temperature.apparent')`
6. 界面自动刷新

**监听示例**：
```javascript
// 温度系统自动监听环境温度变化
window.reactiveSystem.watch('environment.temperature', (newTemp) => {
    window.temperatureSystem.updateTemperature(newTemp);
});

// UI监听体感温度变化
window.reactiveSystem.watch('temperature.apparent', (apparentTemp) => {
    updateTemperatureDisplay(apparentTemp);
});
```

### 相关文件

- [/js/core/temperature-system.js](js/core/temperature-system.js) - 温度系统核心（470行）
- [/js/core/weather-system.js](js/core/weather-system.js) - 天气系统扩展（特殊天气）
- [/js/core/condition-engine.js](js/core/condition-engine.js) - 条件引擎扩展（climate检查）
- [/docs/temperature-system-api.md](docs/temperature-system-api.md) - 温度系统API文档（完整4000字）
- [/docs/weather-system-guide.md](docs/weather-system-guide.md) - 天气系统使用指南 v1.3
- [/测试-天气扩展系统.html](测试-天气扩展系统.html) - 完整测试页面

### 技术特点

- ✅ **独立系统架构**：温度系统与天气系统分离，职责清晰
- ✅ **条件驱动生成**：特殊天气通过ConditionEngine智能判断触发
- ✅ **双层天气设计**：全局天气 + 区域增强（樱花/污染）
- ✅ **行动推进制时间**：食物buff使用游戏天数而非实时分钟
- ✅ **完整响应式链**：天气→温度→体感→UI 全自动更新
- ✅ **7级舒适度系统**：精确的温度-心情影响模型
- ✅ **WorldState集成**：所有数据同步到世界快照用于存档
- ✅ **单元测试验证**：8项测试全部通过，性能优秀（10000次调用5.20ms）

### 未来扩展方向

1. **极端天气规则**（待开发）
   - 台风（typhoon）：暴雨升级版，持续时间长
   - 干旱（drought）：连续无雨天气，影响种植
   - 洪涝（flood）：暴雨后遗症，区域淹没

2. **性格系统联动**（待开发）
   - 晴天性格：晴天心情+5，雨天-3
   - 雨天性格：雨天心情+3，晴天-2
   - 樱花过敏：樱花天无buff，甚至负面

3. **天气联动系统**（待开发）
   - 场景效果：雨天公园人少，晴天广场热闹
   - NPC行为：天气影响NPC出现概率
   - 战斗系统：雨天闪避-10%，雾天命中-20%

4. **衣物/食物系统**（待集成）
   - 衣物系统：自动推荐合适衣物
   - 食物系统：烹饪产生温度buff
   - 商店系统：季节性商品

---

## 🎨 插图浮层系统（2024-12-28 新增）

### 概述
Reality游戏现已集成先进的插图浮层系统，支持两种显示模式：
1. **内嵌模式**：小型插图在F1区内显示（原有功能）
2. **浮层模式**：大型/重要插图以模态框展示（新增功能）

### 核心特性
- **智能切换**：根据插图类型自动选择显示方式
- **缩放功能**：点击图片放大/缩小查看
- **PWA优化**：支持触摸手势，移动端体验优秀
- **可扩展性**：框架可复用于手机界面、日记本、烹饪系统等

### 使用方法

#### 基础插图（内嵌显示）
```javascript
{
    emoji: '🏠',
    caption: '温馨的房间',
    description: '描述文字'
}
```

#### 浮层插图（模态框显示）
```javascript
{
    emoji: '🏥',
    caption: '神秘的房间',
    description: '详细描述',
    type: 'modal',      // 关键：标记为浮层模式
    title: '浮层标题',   // 模态框标题
    isLarge: true       // 可选：标记为大图
}
```

#### 真实图片（未来支持）
```javascript
{
    url: 'images/scene/lab.jpg',  // 图片路径
    caption: '实验室全景',
    type: 'modal',
    title: '场景图片'
}
```

### 技术实现
1. **HTML结构**：在game-main.html添加modal容器
2. **CSS样式**：260+行专业浮层样式（game-main.css第2614行起）
3. **JS逻辑**：扩展IllustrationManager类，新增showModal等方法
4. **数据配置**：在scene-illustrations.js中添加type标记

### 相关文件
- `/js/core/illustration-manager.js` - 插图管理器（含浮层方法）
- `/js/data/scene-illustrations.js` - 场景插图数据配置
- `/css/game-main.css` - 浮层样式（第2614-2866行）
- `/game-main.html` - 浮层HTML结构（第232-263行）
- `/插图浮层系统演示.html` - 独立演示文件

### 快捷操作
- **🔍 F2放大镜按钮**：查看当前场景插图
- **ESC键**：关闭浮层
- **点击背景**：关闭浮层
- **点击图片**：缩放查看

### 未来扩展方向
这个浮层框架设计为通用组件，可轻松扩展为：
- 📱 **手机界面**：显示短信、通话、应用
- 📖 **日记系统**：翻页效果、手写风格
- 🍳 **烹饪界面**：食谱步骤、动画效果
- 🗺️ **地图系统**：可缩放的世界地图
- 💼 **物品查看**：3D旋转、详细属性
- 🖥️ **电脑界面**：操作系统模拟
- 📸 **相册系统**：照片墙、回忆录

### 开发注意事项
1. 保持向后兼容：旧场景自动使用内嵌模式
2. 性能优化：大图使用懒加载
3. 移动适配：确保触摸手势流畅
4. 主题一致：使用游戏统一配色
---

## ⏰ 时间消耗系统使用指南

### 快速接入方法

在场景的选项中添加 `timeLevel` 属性即可：

```javascript
// 场景定义示例
{
    id: 'morning_choice',
    title: '早晨选择',
    text: ['新的一天开始了，你要做什么？'],
    choices: [
        {
            text: '洗漱',
            timeLevel: 'quick',  // 5分钟
            next: 'after_wash'
        },
        {
            text: '去食堂吃早餐',
            timeLevel: 'medium',  // 30分钟
            effects: { energy: 20 },
            next: 'cafeteria'
        },
        {
            text: '去操场跑步',
            timeLevel: 'long',  // 1小时
            effects: { health: 10, energy: -10 },
            next: 'playground'
        },
        {
            text: '继续睡觉',
            timeLevel: 'very_long',  // 2小时
            effects: { energy: 30 },
            next: 'wake_up_late'
        }
    ]
}
```

### 时间等级参考表（24小时制）

| 等级 | 时长 | 适用场景 | 示例 |
|------|------|----------|------|
| `instant` | 0分钟 | UI操作、查看信息 | 打开地图、查看状态 |
| `quick` | 5分钟 | 简单互动 | 打招呼、捡东西、喝水 |
| `short` | 15分钟 | 日常小事 | 洗漱、换衣服、整理背包 |
| `medium` | 30分钟 | 一般活动 | 吃饭、跨区移动、对话 |
| `long` | 1小时 | 重要活动 | 上课、训练、约会喝咖啡 |
| `very_long` | 2小时 | 耗时活动 | 看电影、大型战斗、探索 |
| `half_day` | 6小时 | 半天活动 | 上午班/下午班工作 |
| `full_day` | 12小时 | 全天活动 | 全天工作、长途旅行 |
| `entire_day` | 24小时 | 整天活动 | 睡眠、昏迷、时间跳跃 |

### 特殊场景：多选/什么都不选

```javascript
// 多选场景（如整理背包）
{
    id: 'organize_bag',
    multiChoice: true,
    actionTimeCost: 15,  // 基础时间（无论选不选都消耗）
    zeroChoiceEffect: {
        timeCost: 5,     // 什么都不选的额外惩罚
        text: '你犹豫不决，浪费了一些时间'
    },
    choices: [ /* ... */ ]
}
```

### 代码中手动消耗时间

```javascript
// 方法1：使用时间等级（推荐）
window.timeSystem.consumeTime('medium', '认真思考');

// 方法2：直接推进时间
window.timeSystem.advanceTime(45, '做某事');

// 方法3：使用旧接口（兼容）
window.timeSystem.performAction('standard', 'organize_inventory');
```

### 自动功能

- ✅ **背包整理**：在背包页停留超过3秒，离开时自动消耗15分钟
- ✅ **时间提示**：
  - 15分钟：简短提示"片刻过去了..."
  - 30分钟以上：详细时间"X小时X分钟过去了..."
  - 2小时以上：显示时间流逝特效
- ✅ **跨天自动存档**：每天早上5:00自动存档
- ✅ **特殊时间提醒**：21:00提醒睡觉，7:00显示早安

### 相关文件

- `/js/core/time-system.js` - 时间系统核心（585-1074行）
- `/js/core/scene-manager.js` - 场景时间消耗集成（1666-1735行）
- `/js/pages/game-main.js` - 背包时间消耗（807-823行）
- `/css/game-main.css` - 时间流逝特效样式（90-134行）

### 测试命令

```javascript
// 在浏览器控制台测试
testTime.testActions()  // 自动测试各种动作
testTime.advance(60)    // 推进1小时
testTime.rest(30)       // 休息30分钟
testTime.sleep(8)       // 睡8小时
testTime.now()          // 查看当前时间
```
