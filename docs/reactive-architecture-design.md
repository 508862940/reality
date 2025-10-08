# 响应式计算架构设计 v1.0

## 📅 设计日期：2025-10-03

---

## 🧠 核心理念：神经网络式响应系统

### 类比理解
把响应式系统想象成**人的神经系统**：

```
感受器（输入） → 神经传导（依赖图） → 大脑处理（计算） → 运动神经（UI）
```

**工作流程：**
1. **感受器**：检测变化（衣服换了、食物吃了、天气变了）
2. **神经传导**：信号沿着依赖图传播
3. **大脑处理**：收集所有信号，统一计算（延迟到下一帧）
4. **运动神经**：更新UI显示

---

## 📊 依赖关系图（Dependency Graph）

### 核心依赖链

```
输入源（感受器）          计算节点（神经元）              输出（运动神经）
─────────────────         ─────────────────             ─────────────
environment.temperature ──┐
                          │
clothing.modifier ────────┼──→ temperature.apparent ──→ temperature.comfort ──→ character.mood ──→ UI更新
                          │
food.buff ────────────────┘

weather.current ──────────────→ weather.effects ──────────────────────────────────────────────────→ UI特效
```

### 详细依赖表

| 计算节点 | 依赖输入 | 计算公式 | 输出到 |
|---------|---------|---------|--------|
| `temperature.apparent` | `environment.temperature`<br>`clothing.modifier`<br>`food.buff` | env + clothing + food | `temperature.comfort` |
| `temperature.comfort` | `temperature.apparent` | 根据apparent判断舒适度等级 | `character.mood` |
| `character.mood` | `temperature.comfort`<br>`weather.current`<br>`character.personality` | 基础mood + 温度影响 + 天气影响 | UI显示 |
| `weather.effects` | `weather.current`<br>`weather.intensity` | 根据天气类型生成粒子特效 | UI特效层 |

---

## 🔗 系统架构（三层设计）

### Layer 1: 数据层（Data Layer）
**职责**：存储原始数据，不做计算

```javascript
// 环境数据
environment: {
    temperature: 20,      // 环境温度
    weather: 'sunny',     // 当前天气
    season: 'spring'      // 当前季节
}

// 角色数据
character: {
    clothingModifier: 0,  // 衣物修正
    foodBuffs: [],        // 食物buff列表
    baseMood: 50          // 基础心情
}
```

### Layer 2: 计算层（Computation Layer）
**职责**：管理计算属性，延迟计算，避免重复

```javascript
// 计算节点注册
computedValues: {
    'temperature.apparent': ComputedValue {
        dependencies: ['environment.temperature', 'clothing.modifier', 'food.buff'],
        compute: () => env + clothing + food,
        cache: null,
        dirty: true
    },

    'temperature.comfort': ComputedValue {
        dependencies: ['temperature.apparent'],
        compute: () => getComfortLevel(apparentTemp),
        cache: null,
        dirty: true
    }
}
```

### Layer 3: 响应层（Reactive Layer）
**职责**：监听变化，触发计算，通知UI

```javascript
// 依赖图
dependencyGraph: {
    'environment.temperature': ['temperature.apparent'],  // 环境温度变化影响体感温度
    'clothing.modifier': ['temperature.apparent'],        // 衣物变化影响体感温度
    'temperature.apparent': ['temperature.comfort'],      // 体感温度影响舒适度
    'temperature.comfort': ['character.mood']             // 舒适度影响心情
}
```

---

## ⚡ 执行流程（事件传播）

### 场景：玩家在同一帧内换衣服、吃东西、天气变化

#### 传统方式（立即计算 ❌）
```
第1ms: 换衣服
  → clothing.modifier = 8
  → 立即计算 temperature.apparent
  → 立即计算 temperature.comfort
  → 立即计算 character.mood
  → 立即更新 UI

第2ms: 吃东西
  → food.buff = 3
  → 立即计算 temperature.apparent（重复计算！）
  → 立即计算 temperature.comfort（重复计算！）
  → 立即计算 character.mood（重复计算！）
  → 立即更新 UI（重复刷新！）

第3ms: 天气变化
  → environment.temperature = 25
  → 立即计算 temperature.apparent（又重复！）
  → 立即计算 temperature.comfort（又重复！）
  → 立即计算 character.mood（又重复！）
  → 立即更新 UI（又重复！）

结果：3ms内计算了9次，UI刷新了3次
```

#### 优化方式（延迟计算 ✅）
```
第1ms: 换衣服
  → clothing.modifier = 8
  → 标记 temperature.apparent.dirty = true
  → 加入计算队列

第2ms: 吃东西
  → food.buff = 3
  → 检查 temperature.apparent.dirty（已经是true了，跳过）

第3ms: 天气变化
  → environment.temperature = 25
  → 检查 temperature.apparent.dirty（已经是true了，跳过）

第16ms: 浏览器下一帧（requestAnimationFrame）
  → 处理计算队列
  → 发现 temperature.apparent.dirty = true
  → 计算一次 temperature.apparent
  → 级联计算 temperature.comfort
  → 级联计算 character.mood
  → 更新一次 UI

结果：16ms后只计算了3次，UI刷新了1次
性能提升：66%！
```

---

## 🎯 核心类设计

### 1. ComputedValue（计算节点）

**职责**：代表一个计算属性，管理缓存和脏标记

```javascript
class ComputedValue {
    constructor(name, dependencies, computeFn) {
        this.name = name;              // 'temperature.apparent'
        this.dependencies = dependencies; // ['environment.temperature', ...]
        this.computeFn = computeFn;    // () => { 计算逻辑 }

        this.isDirty = true;           // 是否需要重算
        this.cachedValue = null;       // 缓存值
        this.isComputing = false;      // 防止循环依赖
        this.computeScheduled = false; // 是否已加入队列
    }

    // 标记为脏（需要重算）
    markDirty() {
        if (!this.isDirty) {
            this.isDirty = true;
            this.scheduleCompute();
        }
    }

    // 安排计算（下一帧执行）
    scheduleCompute() {
        if (!this.computeScheduled) {
            this.computeScheduled = true;
            requestAnimationFrame(() => {
                this.compute();
                this.computeScheduled = false;
            });
        }
    }

    // 执行计算
    compute() {
        if (!this.isDirty) return;

        if (this.isComputing) {
            console.error('❌ 循环依赖检测:', this.name);
            return;
        }

        this.isComputing = true;

        try {
            this.cachedValue = this.computeFn();
            this.isDirty = false;

            // 通知依赖这个值的其他节点
            if (window.reactiveSystem) {
                window.reactiveSystem.notify(this.name, this.cachedValue);
            }

            console.log(`✅ 计算完成: ${this.name} =`, this.cachedValue);
        } catch (error) {
            console.error(`❌ 计算错误: ${this.name}`, error);
        } finally {
            this.isComputing = false;
        }
    }

    // 获取值（智能判断）
    get value() {
        if (this.isDirty) {
            this.compute();
        }
        return this.cachedValue;
    }
}
```

---

### 2. DependencyGraph（依赖图）

**职责**：管理所有计算节点，处理依赖关系

```javascript
class DependencyGraph {
    constructor() {
        this.nodes = new Map();           // 所有计算节点
        this.dependencyMap = new Map();   // 依赖关系: key → [依赖它的节点]
    }

    // 注册计算节点
    register(computedValue) {
        // 存储节点
        this.nodes.set(computedValue.name, computedValue);

        // 建立依赖关系
        computedValue.dependencies.forEach(dep => {
            if (!this.dependencyMap.has(dep)) {
                this.dependencyMap.set(dep, []);
            }
            this.dependencyMap.get(dep).push(computedValue);
        });

        console.log(`📌 注册计算节点: ${computedValue.name}`);
        console.log(`   依赖: [${computedValue.dependencies.join(', ')}]`);
    }

    // 通知依赖变化
    notify(key) {
        const affectedNodes = this.dependencyMap.get(key) || [];

        if (affectedNodes.length > 0) {
            console.log(`🔔 依赖变化: ${key} → 影响 ${affectedNodes.length} 个节点`);
            affectedNodes.forEach(node => {
                node.markDirty();
            });
        }
    }

    // 获取受影响的节点
    getAffectedNodes(key) {
        return this.dependencyMap.get(key) || [];
    }

    // 打印依赖图（调试用）
    printGraph() {
        console.log('📊 依赖图:');
        this.dependencyMap.forEach((nodes, key) => {
            const nodeNames = nodes.map(n => n.name).join(', ');
            console.log(`   ${key} → [${nodeNames}]`);
        });
    }
}
```

---

### 3. ReactiveSystem 增强（集成计算图）

**职责**：原有功能 + 管理依赖图

```javascript
class ReactiveSystem {
    constructor() {
        this.listeners = new Map();
        this.dependencyGraph = new DependencyGraph(); // 新增
    }

    // 注册计算属性（新增）
    registerComputed(computedValue) {
        this.dependencyGraph.register(computedValue);
    }

    // 通知变化（增强）
    notify(key, value) {
        // 1. 原有逻辑：通知普通监听器
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => callback(value));
        }

        // 2. 新增逻辑：通知依赖图
        this.dependencyGraph.notify(key);
    }

    // 监听变化（原有功能保持不变）
    watch(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    // 调试工具（新增）
    debug() {
        console.log('🔍 ReactiveSystem 状态:');
        console.log('   监听器数量:', this.listeners.size);
        console.log('   计算节点数量:', this.dependencyGraph.nodes.size);
        this.dependencyGraph.printGraph();
    }
}
```

---

## 📝 使用示例

### 注册计算属性（初始化时）

```javascript
// 在 TemperatureSystem.init() 中
init() {
    // 1. 注册体感温度计算
    const apparentTemp = new ComputedValue(
        'temperature.apparent',
        ['environment.temperature', 'clothing.modifier', 'food.buff'],
        () => {
            const env = this.currentState.environmentTemp;
            const clothing = this.currentState.clothingModifier;
            const food = this.getFoodBuffModifier();
            return env + clothing + food;
        }
    );
    window.reactiveSystem.registerComputed(apparentTemp);

    // 2. 注册舒适度计算
    const comfortLevel = new ComputedValue(
        'temperature.comfort',
        ['temperature.apparent'],
        () => {
            const apparent = apparentTemp.value;
            if (apparent <= -10) return 'freezing';
            if (apparent <= 5) return 'cold';
            if (apparent <= 17) return 'cool';
            if (apparent <= 26) return 'comfortable';
            if (apparent <= 32) return 'warm';
            if (apparent <= 39) return 'hot';
            return 'scorching';
        }
    );
    window.reactiveSystem.registerComputed(comfortLevel);
}
```

### 触发变化（运行时）

```javascript
// 玩家换衣服
function changeClothing(modifier) {
    temperatureSystem.currentState.clothingModifier = modifier;

    // 通知响应式系统
    reactiveSystem.notify('clothing.modifier', modifier);
    // → 自动标记 temperature.apparent.dirty = true
    // → 下一帧自动重算
}

// 玩家吃食物
function eatFood(buffValue, duration) {
    temperatureSystem.addFoodBuff('food', buffValue, duration);

    // 通知响应式系统
    reactiveSystem.notify('food.buff', buffValue);
    // → 检查 temperature.apparent.dirty（已经是true了，跳过）
}

// 天气变化
function changeWeather(newTemp) {
    weatherSystem.currentTemperature = newTemp;

    // 通知响应式系统
    reactiveSystem.notify('environment.temperature', newTemp);
    // → 检查 temperature.apparent.dirty（已经是true了，跳过）
}

// 结果：下一帧（16ms后）只计算一次
```

---

## 🔍 调试功能

### 1. 依赖图可视化

```javascript
// 在控制台执行
window.reactiveSystem.debug();

// 输出：
// 🔍 ReactiveSystem 状态:
//    监听器数量: 5
//    计算节点数量: 2
// 📊 依赖图:
//    environment.temperature → [temperature.apparent]
//    clothing.modifier → [temperature.apparent]
//    food.buff → [temperature.apparent]
//    temperature.apparent → [temperature.comfort]
```

### 2. 计算日志

```javascript
// 自动输出到控制台：
// ✅ 计算完成: temperature.apparent = 23
// 🔔 依赖变化: temperature.apparent → 影响 1 个节点
// ✅ 计算完成: temperature.comfort = comfortable
```

### 3. 性能监控

```javascript
// 统计计算次数
let computeCount = 0;

class ComputedValue {
    compute() {
        computeCount++;
        console.log(`📊 总计算次数: ${computeCount}`);
        // ...
    }
}
```

---

## ⚠️ 潜在问题和解决方案

### 问题1: 循环依赖
```javascript
// 错误示例：A依赖B，B依赖A
A = new ComputedValue('A', ['B'], () => B.value + 1);
B = new ComputedValue('B', ['A'], () => A.value + 1);
```

**解决方案**：
- 计算时检测 `isComputing` 标志
- 发现循环立即报错并停止

### 问题2: 内存泄漏
**场景**：计算节点注册后不清理

**解决方案**：
```javascript
// 提供清理方法
unregister(computedValue) {
    this.nodes.delete(computedValue.name);
    // 清理依赖关系
    this.dependencyMap.forEach((nodes, key) => {
        const index = nodes.indexOf(computedValue);
        if (index !== -1) nodes.splice(index, 1);
    });
}
```

### 问题3: 计算顺序错误
**场景**：A依赖B，但A先算了

**解决方案**：
- 使用 `get value()` 获取依赖值
- 会自动触发依赖的计算（递归）

---

## 📊 性能对比预测

### 测试场景：同一帧3个变化

| 指标 | 旧系统（立即计算） | 新系统（延迟计算） | 提升 |
|------|-------------------|-------------------|------|
| 计算次数 | 9次 | 3次 | 66% ↓ |
| UI刷新次数 | 3次 | 1次 | 66% ↓ |
| 响应延迟 | 0ms | 16ms | 可接受 |
| 电量消耗 | 高 | 低 | 省电 |

### 测试场景：1000轮变化

| 指标 | 旧系统 | 新系统 | 提升 |
|------|-------|-------|------|
| 总计算次数 | 3000次 | 1000次 | 66% ↓ |
| 总耗时 | ~150ms | ~50ms | 66% ↓ |
| 平均延迟 | 0.15ms/次 | 0.05ms/次 | 快3倍 |

---

## ✅ 下一步实施

1. ✅ **Phase 3.1**：架构设计完成（本文档）
2. ⏳ **Phase 3.2**：实现 ComputedValue 类
3. ⏳ **Phase 3.3**：实现 DependencyGraph 类
4. ⏳ **Phase 3.4**：集成到 ReactiveSystem
5. ⏳ **Phase 3.5**：重构 TemperatureSystem
6. ⏳ **Phase 3.6**：性能测试验证

---

**文档版本：** v1.0
**创建日期：** 2025-10-03
**状态：** Phase 3.1 完成 ✅
