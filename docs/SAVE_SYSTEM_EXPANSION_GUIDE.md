# 🎮 Reality游戏 - 存档系统扩展指南

## 📋 给AI的Prompt模板

当你需要为游戏添加新功能并集成到存档系统时，请使用以下模板告诉AI：

---

### 标准扩展请求格式：

**我要为Reality游戏添加 [功能名称] 系统，需要集成到现有的存档机制中。**

#### 1. 新系统基本信息
- **系统名称**：[例如：任务系统、成就系统、背包系统]
- **系统文件位置**：`js/core/[system-name].js`
- **系统的核心数据结构**：
```javascript
// 示例：
const newSystemData = {
    // 列出所有需要保存的数据字段
}
```

#### 2. 需要保存的数据
- **必须保存的数据**：[玩家进度、状态、统计等]
- **可选保存的数据**：[缓存、临时数据等]
- **不需要保存的数据**：[UI状态、动画状态等]

#### 3. 数据更新频率
- [ ] 实时更新（每次改变都要同步）
- [ ] 场景切换时更新
- [ ] 定时更新（如每分钟）
- [ ] 仅在特定事件时更新

#### 4. 与现有系统的关联
- **依赖的系统**：[如：依赖时间系统、关系系统]
- **影响的系统**：[如：会影响经济系统、战斗系统]
- **数据交互方式**：[描述如何与其他系统交互]

---

## 🔧 现有存档系统架构说明

### 核心文件结构
```
存档系统核心文件：
├── js/core/save-system.js      # 存档系统主文件
├── js/core/world-state.js      # 世界状态管理
├── js/core/game-bootstrap.js   # 游戏启动引导
├── js/core/database.js         # IndexedDB数据库
└── js/core/reactive-system.js  # 响应式系统
```

### 数据流程图
```
新系统集成流程：
1. 创建系统 → 2. 注册到worldState → 3. 实现save/load方法 → 4. 测试存档恢复
```

### 现有引擎系统
```javascript
// 当前已集成的系统（在world-state.js中）
const engineSystems = {
    weather: weatherSystem,      // 天气系统
    economy: economySystem,       // 经济系统
    farming: farmingSystem,       // 种植系统
    relationships: relationshipSystem, // 关系系统
    // 新系统添加在这里...
}
```

---

## 📝 扩展步骤清单

当添加新系统时，AI需要完成以下步骤：

### Step 1: 创建系统文件
```javascript
// js/core/[new-system].js
const NewSystem = {
    // 系统数据
    data: {},

    // 初始化
    init() {},

    // 获取存档数据
    getSaveData() {
        return {
            // 返回需要保存的数据
        };
    },

    // 恢复存档数据
    loadSaveData(data) {
        // 从存档恢复数据
    },

    // 重置系统
    reset() {}
};
```

### Step 2: 注册到WorldState
```javascript
// 在 world-state.js 的 getFullState() 中添加
engineStates[newSystem] = window.NewSystem?.getSaveData() || null;

// 在 loadFullState() 中添加
if (savedState.engineStates?.newSystem && window.NewSystem) {
    window.NewSystem.loadSaveData(savedState.engineStates.newSystem);
}
```

### Step 3: 添加响应式绑定（如需要）
```javascript
// 在 reactive-system.js 中添加
if (window.NewSystem) {
    bindNewSystemProperties();
}
```

### Step 4: 更新游戏启动流程
```javascript
// 在 game-bootstrap.js 中添加初始化
await NewSystem.init();
```

### Step 5: 创建测试脚本
```javascript
// js/test/test-new-system-save.js
// 测试新系统的存档和恢复功能
```

---

## 🎯 扩展示例

### 示例1：添加任务系统

```markdown
我要为Reality游戏添加**任务系统**，需要集成到存档机制中。

**系统信息**：
- 名称：QuestSystem
- 文件：js/core/quest-system.js

**需要保存的数据**：
- 当前任务列表（questList）
- 已完成任务（completedQuests）
- 任务进度（questProgress）
- 任务奖励领取状态（claimedRewards）

**更新频率**：任务接取、完成、放弃时更新

**关联系统**：
- 依赖：剧情标记系统（story-flags）
- 影响：奖励会影响经济系统和背包系统
```

### 示例2：添加背包系统

```markdown
我要为Reality游戏添加**背包系统**，需要集成到存档机制中。

**系统信息**：
- 名称：InventorySystem
- 文件：js/core/inventory-system.js

**需要保存的数据**：
- 物品列表（items）
- 背包容量（capacity）
- 装备栏（equipment）
- 快捷栏（quickSlots）

**更新频率**：实时更新（获得/使用物品时）

**关联系统**：
- 影响：战斗系统（装备属性）、经济系统（物品价值）
- 依赖：物品数据库（item-database）
```

---

## ⚠️ 注意事项

1. **版本兼容性**：新增数据字段要考虑旧存档兼容
2. **数据大小**：避免保存过大的数据（如图片、音频）
3. **性能考虑**：频繁更新的数据要优化存储频率
4. **数据验证**：加载存档时要验证数据完整性
5. **默认值**：新系统要有合理的默认值

---

## 🧪 测试要点

新系统集成后必须测试：

1. **创建新存档** - 包含新系统数据
2. **读取旧存档** - 兼容没有新系统的存档
3. **数据完整性** - 所有数据正确保存和恢复
4. **跨场景** - 切换场景后数据保持
5. **快速/手动/自动存档** - 三种存档方式都正常

---

## 💡 最佳实践

1. **模块化设计**：每个系统独立管理自己的存档数据
2. **懒加载**：只在需要时加载系统数据
3. **增量更新**：只保存变化的数据
4. **数据压缩**：对大量重复数据进行压缩
5. **错误处理**：存档损坏时的降级方案

---

## 📚 相关文档

- [世界状态管理](./world-state-guide.md)
- [响应式系统](./reactive-system-guide.md)
- [数据库设计](./database-design.md)
- [CLAUDE.md](../CLAUDE.md) - 项目整体说明

---

*最后更新：2024-12-26*
*当前存档系统版本：v1.1.0*