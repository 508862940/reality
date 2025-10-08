# 🌤️ Reality游戏 - 天气系统使用指南

> 更新时间：2025-10-03
> 版本：v1.2
> 状态：✅ RandomEngine集成完成，测试通过

---

## 📋 系统概览

Reality游戏的天气系统采用**三层架构**：

### 1. RandomEngine（随机引擎）- 基础层 ⭐新增
提供统一的随机算法
- 📍 文件：`js/core/random-engine.js`
- 🎯 功能：加权随机、概率计算、整数生成
- ✅ **Stage 4集成完成**：天气生成使用RandomEngine

### 2. WeatherSystem（天气系统）- 战术层
负责具体的天气表现和日常变化
- 📍 文件：`js/core/weather-system.js`
- 🎯 功能：天气类型、温度、预报、小时变化
- ✅ 使用`RandomEngine.weightedRandom()`生成天气
- ✅ 使用`RandomEngine.randomInt()`生成温度

### 3. ClimateManager（气候管理器）- 战略层
负责宏观的气候控制和特殊事件
- 📍 文件：`js/core/climate-manager.js`
- 🎯 功能：年份周期、季节活动、极端天气
- ✅ 修复降水修正bug（turbulenceLevel=0导致无雨）

---

## 🌦️ WeatherSystem - 天气系统

### 支持的天气类型

| 天气ID | 名称 | 图标 | 心情影响 | 精力影响 | 能见度 |
|--------|------|------|----------|----------|--------|
| `sunny` | 晴天 | ☀️ | +5 | 0 | 100% |
| `cloudy` | 多云 | ☁️ | 0 | 0 | 80% |
| `rainy` | 雨天 | 🌧️ | -5 | -5 | 60% |
| `stormy` | 暴雨 | ⛈️ | -10 | -10 | 30% |
| `snowy` | 雪天 | ❄️ | +3 | -5 | 50% |
| `foggy` | 雾天 | 🌫️ | -3 | 0 | 20% |

### 四季天气概率

#### 🌸 春季（3-5月）
- 晴天：30%，多云：30%，雨天：30%
- 暴雨：5%，雾天：5%
- 温度范围：10-25°C

#### ☀️ 夏季（6-8月）
- 晴天：50%，多云：20%，雨天：15%
- 暴雨：15%（季风期）
- 温度范围：20-35°C

#### 🍂 秋季（9-11月）
- 晴天：25%，多云：35%，雨天：25%
- 暴雨：5%，雾天：10%
- 温度范围：5-20°C

#### ❄️ 冬季（12-2月）
- 晴天：15%，多云：30%，雪天：30%
- 雨天：10%，雾天：15%
- 温度范围：-10-10°C

### 代码调用示例

```javascript
// 获取当前天气信息
const weatherInfo = window.weatherSystem.getCurrentWeatherInfo();
console.log(weatherInfo.weather);      // 天气名称
console.log(weatherInfo.temperature);  // 温度
console.log(weatherInfo.forecast);     // 未来3天预报

// 强制设置天气（用于剧情）
window.weatherSystem.forceWeather('rainy', 8); // 雨天持续8小时

// 检查天气条件
if (window.weatherSystem.checkWeatherCondition('is_raining')) {
    console.log('正在下雨');
}
```

### 自动机制

✅ **每小时检查**：30%概率改变天气
✅ **每日更新**：更新季节、重新生成预报
✅ **响应式监听**：季节变化时自动调整天气概率
✅ **音频联动**：天气变化自动更新环境音（雨声等）
✅ **存档支持**：完整保存/恢复天气状态

---

## 🌍 ClimateManager - 气候管理器

### 年份周期系统（3年一循环）

| 年份 | 类型 | 名称 | 动荡等级 | 特点 |
|------|------|------|----------|------|
| 1, 4, 7... | `peaceful` | 和平年 | 1.0 | 正常天气，无极端事件 |
| 2, 5, 8... | `turbulent_1` | 小动荡年 | 1.3 | 偶尔出现极端天气 |
| 3, 6, 9... | `turbulent_2` | 大动荡年 | 1.8 | 频繁极端天气 |

**特殊年份**：每9年一次"全面复写年"（剧情用）

### 季节活动

#### 🌸 春季活动

**樱花周**
- 时间：春季第2周（7天）
- 效果：心情+10，浪漫氛围+20
- 描述：全城樱花盛开，约会好时机

**清明雨**
- 时间：春季第4周（3天）
- 效果：强制雨天
- 描述：清明时节雨纷纷

#### ☀️ 夏季活动

**夏日祭**
- 时间：夏季第6周（3天）
- 效果：心情+15，特殊商贩出现
- 描述：传统夏日庆典，烟花大会

**三伏天**
- 时间：夏季第8周（10天）
- 效果：温度+5°C，精力-10
- 描述：一年中最热的时期

#### 🍂 秋季活动

**枫叶季**
- 时间：秋季第3周（14天）
- 效果：景色变化，摄影加成+30
- 描述：满山红叶，美不胜收

**丰收节**
- 时间：秋季第8周（3天）
- 效果：作物产量+20%，市场折扣10%
- 描述：庆祝丰收的传统节日

#### ❄️ 冬季活动

**初雪**
- 触发：当年第一次下雪
- 效果：心情+5，触发特殊对话
- 描述：今年的第一场雪

**新年**
- 时间：冬季第4周（7天）
- 效果：家庭活动，红包系统
- 描述：新年快乐，万象更新

### 极端天气事件（仅在动荡年）

#### 🔥 热浪
- 触发：夏季，小动荡年15%/大动荡年更高
- 持续：3-7天
- 效果：温度+15°C，作物生长-50%，精力消耗1.5倍
- 市场影响：水价×3，冰淇淋×5

#### 🥶 寒潮
- 触发：冬季
- 持续：2-5天
- 效果：温度-20°C，作物受损30%
- 市场影响：燃料×2，保暖衣物×1.5

#### 🏜️ 干旱
- 触发：夏秋季，仅大动荡年
- 持续：15-30天
- 效果：降水-80%，作物产量-60%
- 市场影响：水价×10，食物×2

#### 🌊 洪涝
- 触发：夏季，仅大动荡年
- 持续：3-5天
- 效果：降水×5，作物摧毁70%，交通-80%
- 市场影响：食物×2，药品×3

#### 🌀 台风
- 触发：夏秋季
- 持续：1-2天
- 效果：风速150km/h，建筑损坏30%，必须室内
- 市场影响：市场关闭，应急物资×5

### 代码调用示例

```javascript
// 获取当前气候信息
const climate = window.climateManager.getCurrentClimate();
console.log(climate.yearType);         // 年份类型
console.log(climate.seasonalEvent);    // 季节活动
console.log(climate.extremeEvent);     // 极端天气

// 获取市场价格修正
const modifiers = window.climateManager.getMarketModifiers();
// { water: 3.0, iceCream: 5.0 } 表示水价×3，冰淇淋×5

// 获取作物生长修正
const cropMod = window.climateManager.getCropGrowthModifiers();
console.log(cropMod.growthRate);    // 生长速率（1.0=正常）
console.log(cropMod.yieldModifier); // 产量修正（1.0=正常）
```

---

## 🔗 系统集成

### ✅ 与时间系统集成

**自动触发机制**：
- ⏰ **每小时**：weatherSystem.hourlyUpdate(hour)
- 📅 **每天**：weatherSystem.dailyUpdate() + climateManager.dailyUpdate()
- 🌸 **季节变化**：响应式监听 `gameTime.season`

**代码位置**：`js/core/time-system.js` 第670-698行

### ✅ 与世界快照集成

**存档内容**：
```javascript
worldState.engineStates = {
    weather: {
        currentWeather, currentSeason, currentTemperature,
        forecast, lastChangeHour, weatherDuration
    },
    climate: {
        currentState, seasonalEvents
    }
}
```

**代码位置**：`js/core/world-state.js` 第447-457行（保存），第662-672行（恢复）

### ✅ 与响应式系统集成

**监听器设置**：
```javascript
// 天气系统监听季节变化
window.reactiveSystem.watch('gameTime.season', (newSeason) => {
    // 自动调整天气概率
    this.currentSeason = newSeason;
    this.generateWeather();
});

// 天气系统通知UI更新
window.reactiveSystem.notify('environment.weather', newWeather, oldWeather);
```

**代码位置**：`js/core/weather-system.js` 第185-221行

### ✅ 与音频系统集成

**自动更新环境音**：
```javascript
// 天气变化时
window.audioSystem.updateAmbient(weatherType, null, null, intensity);

// 示例：
// rainy → 雨声 (强度0.4)
// stormy → 暴雨+雷声 (强度0.9)
// snowy → 雪地环境音 (强度0.3)
```

**代码位置**：`js/core/weather-system.js` 第351-364行

### ⚠️ 待集成系统

**经济系统**：
```javascript
// 需要在 economy-system.js 中调用
const modifiers = window.climateManager.getMarketModifiers();
// 应用到价格计算
```

**种植系统**：
```javascript
// 需要在 farming-system.js 中调用
const { growthRate, yieldModifier } = window.climateManager.getCropGrowthModifiers();
// 应用到作物生长
```

---

## 🧪 测试工具

### 快速测试命令

已创建专用测试工具：`js/test/test-weather-system.js`

```javascript
// 查看当前状态
testWeather.status()

// 强制设置天气
testWeather.setWeather('rainy', 8)    // 雨天8小时
testWeather.setSeason('winter')       // 切换到冬季

// 时间控制
testWeather.skipHours(5)              // 推进5小时
testWeather.skipToNextSeason()        // 跳到下一季节

// 测试特殊功能
testWeather.testAllWeathers()         // 循环测试所有天气
testWeather.testSakura()              // 触发樱花周
testWeather.testExtreme('heatWave')   // 触发热浪
testWeather.testSaveLoad()            // 测试存档恢复

// 完整测试流程
testWeather.fullTest()                // 自动测试所有功能

// 查看帮助
testWeather.help()
```

### 气候系统测试（使用内置工具）

```javascript
testClimate.status()              // 查看状态
testClimate.sakura()              // 触发樱花周
testClimate.festival()            // 触发夏日祭
testClimate.turbulent(1)          // 切换到小动荡年
testClimate.turbulent(2)          // 切换到大动荡年
testClimate.extreme('heatWave')   // 触发热浪
testClimate.nextDay()             // 推进一天
testClimate.help()                // 查看所有命令
```

---

## 📝 在game-main.html中启用测试工具

在 `game-main.html` 的script标签区域添加：

```html
<!-- 天气系统测试工具 -->
<script src="js/test/test-weather-system.js"></script>
```

---

## 🎮 实际使用示例

### 场景1：剧情触发强制天气

```javascript
// 在场景数据中
{
    id: 'rainy_encounter',
    onEnter: () => {
        // 开始下雨，持续到剧情结束
        window.weatherSystem.forceWeather('rainy', 4);
    },
    text: ['雨突然下起来了...'],
    // ...
}
```

### 场景2：天气条件判断

```javascript
// 在场景选项中
{
    text: '去公园散步',
    condition: () => {
        // 只有晴天才能选
        return window.weatherSystem.currentWeather === 'sunny';
    },
    next: 'park_walk'
}
```

### 场景3：检查季节活动

```javascript
// 在NPC对话中
if (window.climateManager.currentState.activeSeasonalEvent === 'sakura_week') {
    // 樱花周期间的特殊对话
    return '樱花开得真美呢！要不要一起去赏花？';
}
```

### 场景4：极端天气事件

```javascript
// 在每日更新中
if (window.climateManager.currentState.activeExtremeEvent?.id === 'typhoon') {
    // 台风期间禁止外出
    window.showNotification('⚠️ 台风警报！今天不能外出！', 'danger');
    // 禁用所有户外选项
}
```

---

## 🐛 常见问题

### Q: 天气不会自动变化？
**A**: 检查时间系统是否正常推进。天气每小时有30%概率变化。

### Q: 季节变化了但天气概率没变？
**A**: 2025-10-01已修复！现在季节变化会通过响应式系统自动通知天气系统。

### Q: 平和年完全不下雨？⭐ 已修复
**A**: 2025-10-03修复！ClimateManager的降水修正bug导致turbulenceLevel=0时降水修正为0。现在平和年修正为1.0（不修正）。

### Q: 存档后天气状态丢失？
**A**: ClimateManager已集成到worldState，现在会自动保存/恢复。

### Q: 极端天气一直不触发？
**A**: 极端天气只在动荡年触发。使用 `testClimate.turbulent(2)` 切换到大动荡年测试。

---

## 🎲 RandomEngine集成详解（Stage 4）

### 为什么要集成RandomEngine？

**问题**：原来天气系统手动计算累积概率，代码冗余且容易出错。

**解决方案**：使用统一的`RandomEngine.weightedRandom()`方法，代码更简洁、更可靠。

### 集成前后对比

#### ❌ 旧方法（手动累积概率）
```javascript
generateWeather() {
    const probabilities = season.weatherProbability;
    const random = Math.random();
    let cumulative = 0;

    for (const [weather, probability] of Object.entries(probabilities)) {
        cumulative += probability;
        if (random < cumulative) {
            this.setWeather(weather);
            break;
        }
    }
}
```

**问题**：
- 代码重复（温度生成也有类似逻辑）
- 气候修正难以应用
- 不支持权重为0的情况

#### ✅ 新方法（RandomEngine）
```javascript
generateWeather() {
    const probabilities = season.weatherProbability;

    // 1. 构建加权选项
    const weatherOptions = [];
    for (const [weather, probability] of Object.entries(probabilities)) {
        let adjustedWeight = probability;

        // 应用气候修正
        if ((weather === 'rainy' || weather === 'stormy') && rainfallModifier !== 1.0) {
            adjustedWeight = Math.min(1, probability * rainfallModifier);
        }

        weatherOptions.push({ value: weather, weight: adjustedWeight });
    }

    // 2. 使用RandomEngine选择
    const selectedWeather = window.RandomEngine.weightedRandom(weatherOptions);
    this.setWeather(selectedWeather);

    // 3. 生成温度（也使用RandomEngine）
    const temp = window.RandomEngine.randomInt(tempRange.min, tempRange.max);
}
```

**优势**：
- ✅ 代码更简洁
- ✅ 自动处理权重为0
- ✅ 自动归一化权重
- ✅ 更容易应用气候修正

### 性能表现

根据单元测试结果：
- **10000次weightedRandom调用**：5.20ms（平均0.0005ms/次）
- **1000次天气生成**：104.10ms（平均0.104ms/次）
- **结论**：性能优秀，完全满足游戏需求

### 边缘情况处理

RandomEngine经过完整测试，能正确处理：
1. ✅ 空数组/null/undefined → 返回null
2. ✅ 所有权重为0 → 返回第一个（降级）
3. ✅ 部分权重为0 → 只从非零选项中选择
4. ✅ 极端权重（0.1% vs 99.9%） → 精度极高
5. ✅ 非归一化权重（如2:3、0.1:0.2） → 自动处理
6. ✅ 负数范围、大范围 → 全部支持

---

## 📚 相关文件

### 核心文件
- `js/core/random-engine.js` - **随机引擎（新）**
- `js/core/weather-system.js` - 天气系统主文件（已集成RandomEngine）
- `js/core/climate-manager.js` - 气候管理器（已修复降水修正bug）
- `js/core/time-system.js` - 时间系统（含天气触发）
- `js/core/world-state.js` - 世界快照（含存档）

### BGM系统
- `js/core/daily-bgm-system.js` - **日常BGM系统（已修复响应式监听）**
- `js/core/audio-system.js` - 音频系统

### 测试文件
- `js/test/test-weather-random.js` - **RandomEngine集成测试（新）**
- `js/test/test-random-engine-unit.js` - **单元测试套件（新）**
- `js/test/test-weather-system.js` - 天气系统测试工具
- `天气随机引擎测试.html` - **RandomEngine测试页面（新）**
- `单元测试-RandomEngine.html` - **单元测试页面（新）**
- `测试-天气响应式v2.html` - **响应式集成测试（新）**
- `天气UI系统演示.html` - UI演示

### 文档
- `CLAUDE.md` - 主项目文档（天气UI系统说明）
- `docs/weather-system-guide.md` - 本文档

---

## 🔗 响应式集成说明（2025-10-03新增）

### 完整响应式链路

天气系统现在完全通过响应式系统工作，所有组件自动同步：

```
用户操作/时间推进
    ↓
WeatherSystem.setWeather()
    ↓
更新 worldState.environment.weather
    ↓
reactiveSystem.notify('environment.weather')
    ↓
自动触发所有监听者：
  ├─ UI更新（game-main.js）
  │   ├─ 更新天气图标
  │   ├─ 更新天气详情浮层
  │   └─ 触发天气特效
  ├─ BGM切换（daily-bgm-system.js）✅ 2025-10-03修复
  │   ├─ 雨天 → rain BGM
  │   ├─ 暴雨 → storm BGM
  │   ├─ 雪天 → snow BGM
  │   └─ 雾天 → 降低音量
  └─ 环境音效（audio-system.js）
      ├─ rain_medium.mp3
      ├─ storm.mp3
      ├─ snow_wind.mp3
      └─ fog_horn.mp3
```

### BGM系统响应式修复

**修复前问题**：
```javascript
// ❌ 旧代码：监听CustomEvent（但从未发送）
window.addEventListener('weatherChange', (e) => {
    this.onWeatherChange(e.detail);
});
```

**修复后**：
```javascript
// ✅ 新代码：使用响应式监听
window.reactiveSystem.watch('environment.weather', (newWeather, oldWeather) => {
    this.onWeatherChange({ weather: newWeather });
});
```

### 测试验证

使用`测试-天气响应式v2.html`可以验证：
1. 切换天气按钮
2. 观察日志中的响应式通知
3. 确认BGM/特效/UI同步更新

---

## ✅ 更新日志

### 2025-10-03 - v1.2
- ✅ 集成RandomEngine（天气生成、温度生成）
- ✅ 修复ClimateManager降水修正bug（turbulenceLevel=0导致无雨）
- ✅ 修复DailyBGM响应式监听（改用reactiveSystem.watch）
- ✅ 创建完整单元测试套件（8项测试全部通过）
- ✅ 性能测试（10000次调用5.20ms）
- ✅ 创建响应式集成测试页面

### 2025-10-01 - v1.1
- ✅ **UI完善**：天气浮层UI完整重构
  - 添加详细天气描述（晴空万里、细雨绵绵等）
  - 添加分区设计（📊当前状况 / 🌍世界状态 / 📅未来3天预报）
  - 添加完整占位符系统（年份周期、季节活动、天气预报）
  - 添加高亮样式（季节活动金色、极端天气红色）
- ✅ **样式优化**：CSS增强
  - 新增section分隔线和标题样式
  - 新增forecast预报项flex布局
  - 新增placeholder占位符样式
  - 新增highlight/danger高亮样式

### 2025-10-01 - v1.0
- ✅ 修复：添加季节变化响应式通知（time-system.js）
- ✅ 验证：ClimateManager存档集成已完成
- ✅ 新增：创建专用测试工具（test-weather-system.js）
- ✅ 文档：创建完整使用指南

---

## 📋 待完善项目

### ⏳ 待讨论
1. **天气粒子特效细化**
   - 🌧️ 雨天特效优化（普通雨/暴雨区分）
   - ❄️ 雪天特效优化
   - 🌸 樱花特效优化
   - 需要商讨特效强度、密度、动画细节

2. **响应权重系统**
   - 定义不同事件的优先级
   - 实现权重冲突处理机制

### ✅ 已完成
- 天气浮层UI设计
- 天气预报占位格子
- 世界状态展示（年份周期、季节活动）
- 极端天气高亮显示
- 完整占位符系统

---

## 🌸 特殊天气系统 (v1.3新增)

### 概述
特殊天气是基于条件触发的稀有天气类型，需要满足特定条件才会出现。

### 特殊天气类型

| 天气ID | 名称 | 图标 | 触发条件 | 特殊效果 |
|--------|------|------|----------|----------|
| `sakura` | 樱花飘落 | 🌸 | 春季 + 樱花周活动 | 心情+5, 精神+3, 浪漫值+10 |
| `rainbow` | 雨后彩虹 | 🌈 | 前一天是雨天 | 心情+15, 精神+10, 幸运值+20, 持续2小时 |
| `meteor_shower` | 流星雨 | 🌠 | 夜晚(20-4点) + 流星雨事件 | 心情+10, 精神+15, 幸运值+15, 解锁观星 |
| `polluted` | 污染雾霾 | ☢️ | 污染区域 或 污染危机事件 | 心情-5, 精神-10, 健康-3, 建议口罩 |

### 条件系统集成

特殊天气使用 `ConditionEngine` 进行条件检查：

```javascript
// 樱花天气定义示例
sakura: {
    id: 'sakura',
    name: '樱花飘落',
    icon: '🌸',
    isSpecial: true,  // 标记为特殊天气
    conditions: {     // 触发条件
        time: { season: 'spring' },
        climate: { event: 'SAKURA_WEEK' }
    },
    effects: {
        mood: 5,
        spirit: 3,
        romantic: 10
    }
}
```

### 如何触发特殊天气

#### 方法1: 手动触发（测试用）
```javascript
// 直接强制设置特殊天气
window.weatherSystem.forceWeather('sakura', 4);  // 樱花天持续4小时
```

#### 方法2: 气候事件触发（推荐）
```javascript
// 触发樱花周活动
window.climateManager.currentState.seasonActivity = 'SAKURA_WEEK';

// 重新生成天气，有概率出现樱花天
window.weatherSystem.generateWeather();
```

#### 方法3: 自动触发（游戏内）
- **樱花天** - 春季第X周自动触发樱花周
- **彩虹** - 雨天转晴时5%概率出现
- **流星雨** - 特定日期夜晚出现
- **污染天** - 进入污染区域时出现

### 条件检查机制

天气系统在 `generateWeather()` 中自动检查条件：

```javascript
// 检查特殊天气条件
checkSpecialWeatherConditions(weatherType) {
    const weather = this.weatherTypes[weatherType];

    if (!weather.isSpecial || !weather.conditions) {
        return true;  // 普通天气无条件限制
    }

    // 使用ConditionEngine检查
    const context = {
        weather: this.currentWeather,
        previousWeather: this.previousWeather,
        season: this.currentSeason,
        time: window.timeSystem?.currentTime,
        climate: window.climateManager?.currentState
    };

    return window.ConditionEngine.check(weather.conditions, context);
}
```

### 支持的条件类型

#### 1. 时间条件
```javascript
conditions: {
    time: {
        season: 'spring',              // 季节
        hour: { min: 20, max: 4 }      // 时间段
    }
}
```

#### 2. 气候条件
```javascript
conditions: {
    climate: {
        event: 'SAKURA_WEEK'           // 气候事件
    }
}
```

#### 3. 天气条件（上一次天气）
```javascript
conditions: {
    weather: {
        previous: ['rainy', 'stormy']  // 前一天是雨天或暴雨
    }
}
```

#### 4. 位置条件
```javascript
conditions: {
    OR: [
        { location: { zone: 'pollution_area' } },
        { climate: { event: 'POLLUTION_CRISIS' } }
    ]
}
```

---

## 🌡️ 温度系统 (v1.3新增)

### 系统概述

温度系统独立于天气系统，负责将**环境温度**转换为**体感温度**，并根据舒适度影响角色心情。

**系统架构**：
```
WeatherSystem（天气系统）
    ↓ 生成环境温度
TemperatureSystem（温度系统） ← 你在这里
    ↓ 计算体感温度 = 环境温度 + 衣服修正 + 食物buff
ComfortSystem（舒适度判定）
    ↓ 输出心情影响
```

### 核心文件
- 📍 `js/core/temperature-system.js` - 温度系统核心
- 🔗 集成到响应式系统，监听 `environment.temperature`

### 温度等级与舒适度

| 等级 | 体感温度 | 名称 | 图标 | 心情影响 |
|------|----------|------|------|----------|
| `freezing` | ≤-10°C | 严寒 | 🥶 | -15 |
| `cold` | -10~10°C | 寒冷 | 🧊 | -10 |
| `cool` | 10~18°C | 偏凉 | 😌 | -3 |
| `comfortable` | 18~26°C | 舒适 | 😊 | 0 |
| `warm` | 26~32°C | 偏热 | 😓 | -3 |
| `hot` | 32~40°C | 炎热 | 🥵 | -10 |
| `scorching` | ≥40°C | 酷热 | 🔥 | -15 |

### 基础使用

#### 初始化
```javascript
// 在game-main.html中加载
<script src="js/core/temperature-system.js"></script>

// 初始化（连接响应式监听）
window.temperatureSystem.init();
```

#### 获取当前状态
```javascript
const state = window.temperatureSystem.getState();

console.log(state);
// {
//     environment: 20,        // 环境温度
//     apparent: 25,           // 体感温度（穿冬装+喝热汤）
//     comfort: {              // 舒适度信息
//         level: 'warm',
//         name: '偏热',
//         icon: '😓',
//         temperature: 25,
//         moodModifier: -3,
//         suggestion: '建议穿着夏装'
//     },
//     modifiers: {
//         clothing: 10,        // 衣服修正
//         food: -5,            // 食物修正
//         total: 5
//     },
//     foodBuffs: [...]
// }
```

### 衣服系统（基础版）

#### 设置衣服保暖值
```javascript
// 夏装：降温-10°C
window.temperatureSystem.setClothingModifier(-10);

// 普通服装：无影响
window.temperatureSystem.setClothingModifier(0);

// 冬装：保暖+10°C
window.temperatureSystem.setClothingModifier(10);
```

#### 衣服建议（自动生成）
```javascript
const suggestion = window.temperatureSystem.getSuggestion();
// 返回："建议穿着秋冬装（外套、长袖）"
```

### 食物buff系统

#### 添加食物温度buff
```javascript
// 冰淇淋：降温-5°C，持续0.5天
window.temperatureSystem.addFoodBuff('ice_cream', -5, 0.5);

// 热汤：保暖+5°C，持续0.5天
window.temperatureSystem.addFoodBuff('hot_soup', 5, 0.5);
```

#### 食物buff设计理念
由于时间系统是**行动推进制**（类似DoL），食物buff持续时间使用**游戏天数**而非分钟：
- ✅ 0.5天 = 半天有效
- ✅ 1天 = 全天有效
- ❌ 不使用30分钟（时间不会自动流逝）

#### buff自动清理
```javascript
// 每次计算体感温度时自动清理过期buff
getFoodBuffModifier() {
    const currentDay = window.timeSystem?.currentTime?.day || 0;

    // 清理过期buff
    this.currentState.foodBuffs = this.currentState.foodBuffs.filter(buff => {
        return buff.expireDay > currentDay;
    });

    // 计算总修正
    let totalMod = 0;
    this.currentState.foodBuffs.forEach(buff => {
        totalMod += buff.tempModifier;
    });
    return totalMod;
}
```

### 响应式集成

#### 自动监听天气温度变化
```javascript
// 温度系统自动监听环境温度
init() {
    if (window.reactiveSystem) {
        // 监听天气变化 → 更新环境温度
        window.reactiveSystem.watch('environment.weather', () => {
            this.updateEnvironmentTemp();
        });

        // 监听温度变化 → 重新计算体感温度
        window.reactiveSystem.watch('environment.temperature', (newTemp) => {
            this.currentState.environmentTemp = newTemp;
            this.calculateApparentTemp();
        });
    }
}
```

#### 完整响应链
```
天气变化 → environment.temperature notify
    ↓
温度系统监听 → 更新环境温度
    ↓
计算体感温度 → temperature.apparent notify
    ↓
UI自动更新 → 显示新温度和舒适度
```

### 场景中使用

#### 检查是否需要更换衣服
```javascript
// 在场景选项中检查
{
    text: '外出探索',
    showConditions: {
        // 如果温度不适，隐藏此选项
        NOT: [
            { needClothingChange: true }
        ]
    },
    next: 'explore'
}
```

#### 应用温度影响
```javascript
// 每小时检查温度影响
function hourlyTemperatureCheck() {
    const effect = window.temperatureSystem.applyTemperatureEffects();

    if (effect) {
        // 应用心情影响
        window.gameState.character.mood += effect.mood;

        // 显示提示
        console.log(`${effect.reason}: 心情${effect.mood > 0 ? '+' : ''}${effect.mood}`);
    }
}
```

### 世界快照集成

#### 自动同步到worldState
```javascript
syncToWorldState() {
    if (window.worldState) {
        window.worldState.updateState({
            temperature: {
                environment: this.currentState.environmentTemp,
                apparent: this.currentState.apparentTemp,
                comfortLevel: this.currentState.comfortLevel,
                clothingModifier: this.currentState.clothingModifier,
                foodBuffs: this.currentState.foodBuffs
            }
        });
    }
}
```

#### 从存档加载
```javascript
loadFromWorldState() {
    if (window.worldState?.state?.temperature) {
        const data = window.worldState.state.temperature;
        this.currentState.environmentTemp = data.environment || 20;
        this.currentState.apparentTemp = data.apparent || 20;
        this.currentState.comfortLevel = data.comfortLevel || 'comfortable';
        this.currentState.clothingModifier = data.clothingModifier || 0;
        this.currentState.foodBuffs = data.foodBuffs || [];
    }
}
```

---

## 🔗 ConditionEngine扩展 (v1.3新增)

### 新增条件类型

#### 1. 气候条件检查
```javascript
// 检查气候事件
conditions: {
    climate: {
        event: 'SAKURA_WEEK'  // 单个事件
    }
}

conditions: {
    climate: {
        event: ['SAKURA_WEEK', 'SUMMER_FESTIVAL']  // 多个事件（任一符合）
    }
}

// 检查动荡等级
conditions: {
    climate: {
        turbulence: { min: 1 }  // 动荡年（≥1）
    }
}

// 检查年份类型
conditions: {
    climate: {
        yearType: 'turbulent_2'  // 二级动荡年
    }
}
```

#### 2. 上一次天气检查
```javascript
// 检查前一天天气
conditions: {
    weather: {
        previous: 'rainy'  // 前一天是雨天
    }
}

conditions: {
    weather: {
        previous: ['rainy', 'stormy']  // 前一天是雨天或暴雨
    }
}
```

### 实现方法

#### checkClimate() - 气候条件检查
```javascript
static checkClimate(climateCondition, context) {
    const climateState = context?.climate || window.climateManager?.currentState;

    // 检查气候事件
    if (climateCondition.event) {
        const targetEvents = Array.isArray(climateCondition.event) ?
                            climateCondition.event : [climateCondition.event];

        // 检查季节活动
        if (climateState.seasonActivity &&
            targetEvents.includes(climateState.seasonActivity)) {
            return true;
        }

        // 检查极端天气事件
        if (climateState.extremeWeather &&
            targetEvents.includes(climateState.extremeWeather)) {
            return true;
        }

        return false;
    }

    // 检查动荡等级
    if (climateCondition.turbulence) {
        const turbulence = climateState.turbulenceLevel || 0;
        const check = climateCondition.turbulence;

        if (check.min !== undefined && turbulence < check.min) return false;
        if (check.max !== undefined && turbulence > check.max) return false;
    }

    return true;
}
```

#### checkWeather() - 扩展上一次天气
```javascript
static checkWeather(weatherCondition, context) {
    const currentWeather = this.getCurrentWeather(context);

    // 支持数组格式（任一天气符合）
    if (Array.isArray(weatherCondition)) {
        return weatherCondition.includes(currentWeather);
    }

    if (typeof weatherCondition === 'string') {
        return currentWeather === weatherCondition;
    }

    // 🌸 新增：检查上一个天气
    if (weatherCondition.previous) {
        const previousWeather = context?.previousWeather || '';
        const targets = Array.isArray(weatherCondition.previous) ?
                        weatherCondition.previous : [weatherCondition.previous];
        return targets.includes(previousWeather);
    }

    return true;
}
```

---

## 📊 更新日志

### 2025-10-03 - v1.3 天气扩展系统 ⭐重大更新
- ✅ **新增TemperatureSystem（温度系统）**
  - 环境温度 → 体感温度转换
  - 衣服保暖值系统（-10°C ~ +10°C）
  - 食物温度buff系统（持续"游戏天数"）
  - 7级舒适度判定（严寒→酷热）
  - 完整响应式集成
  - 世界快照同步

- ✅ **新增4种特殊天气**
  - 🌸 樱花飘落 - 春季樱花周活动触发
  - 🌈 雨后彩虹 - 雨天转晴5%概率
  - 🌠 流星雨 - 夜晚天文事件
  - ☢️ 污染雾霾 - 污染区域/危机事件

- ✅ **ConditionEngine扩展**
  - 新增 `checkClimate()` - 气候事件/动荡年份检查
  - 扩展 `checkWeather()` - 支持 `previous` 上一次天气检查
  - 天气规则引擎集成 - 特殊天气条件驱动生成

- ✅ **WeatherSystem增强**
  - `checkSpecialWeatherConditions()` - 特殊天气条件检查
  - `forceWeather()` 修复 - 强制天气时自动生成对应温度
  - `generateWeather()` 增强 - 温度生成后通知响应式系统
  - 支持 `previousWeather` 记录 - 用于彩虹等条件判断

- ✅ **测试验证**
  - 创建综合测试页面 `测试-天气扩展系统.html`
  - 所有系统状态监控（7个系统）
  - 天气/温度实时响应测试
  - 衣服/食物buff测试
  - 气候事件触发测试

- ✅ **修复bug**
  - 修复 `getCurrentDay()` 不存在 → 改用 `timeSystem.currentTime.day`
  - 修复温度响应式通知缺失
  - 修复DOM加载顺序问题

### 2025-10-03 - v1.2
- ✅ **Stage 4-5完成**：天气系统RandomEngine集成
- ✅ **修复重要bug**：ClimateManager降水修正（平和年无雨）
- ✅ **修复BGM响应式**：DailyBGM系统改用reactiveSystem.watch监听天气
- ✅ **测试验证**：8项单元测试全部通过，性能优秀（10000次调用5.20ms）

### 2025-10-01 - v1.1
- ✅ **UI完善**：天气浮层UI完整重构

### 2025-10-01 - v1.0
- ✅ 初始版本发布

---

**天气扩展系统已完成，温度系统已集成，特殊天气已实现！** 🎉

如有问题或建议，请在开发文档中记录。
