# 🎯 响应式系统开发指南

## 📖 系统概述

响应式系统是Reality游戏的核心数据管理机制，它让游戏数据的变化能够自动触发UI更新，无需手动操作DOM。这对PWA应用尤其重要，因为PWA无法刷新页面。

### 核心原理
```javascript
// 传统方式（繁琐）
character.mood = 80;
document.getElementById('moodBar').style.width = '80%';
document.getElementById('moodValue').textContent = '80';
updateMoodEmoji(80);

// 响应式方式（自动）
reactiveGameState.mood = 80;  // 一行代码，所有UI自动更新！
```

## 🏗️ 系统架构

### 1. 响应式核心 (`js/core/reactive-system.js`)
- **Proxy代理机制**：拦截数据变化
- **观察者模式**：通知所有监听器
- **自动UI绑定**：数据变化自动更新DOM

### 2. 场景管理器集成 (`js/core/scene-manager.js`)
- 场景切换时触发批量更新
- F2继续按钮触发实时更新
- 选项效果立即反映到UI

### 3. NPC响应式扩展 (`js/ai/reactive-npc-integration.js`)
- API驱动的NPC状态管理
- 好感度系统自动化
- 对话动态更新

### 4. 立绘系统 (`js/core/sprite-system.js`)
- 表情自动切换
- 服装状态管理
- 特殊效果触发

## 💡 使用方法

### 基础使用

#### 1. 创建响应式数据
```javascript
// 主角数据
window.reactiveGameState = window.reactiveSystem.createReactive({
    health: 100,
    mood: 50,
    money: 500,
    energy: 80
});

// NPC数据
const zero = window.createReactiveNPC('Zero', {
    affection: 30,
    mood: 'neutral',
    state: 'guarded'
});
```

#### 2. 设置监听器
```javascript
// 监听单个属性
window.reactiveSystem.watch('health', (newVal, oldVal) => {
    console.log(`体力从${oldVal}变为${newVal}`);
    // 自定义逻辑
    if (newVal < 20) {
        showWarning('体力过低！');
    }
});

// 监听所有变化
window.reactiveSystem.watch('*', (property, newVal, oldVal) => {
    console.log(`${property}发生变化`);
});
```

#### 3. 触发更新
```javascript
// 直接修改值，自动触发所有更新
reactiveGameState.mood += 10;  // UI自动更新
zero.affection += 5;            // 好感度条自动增长
```

## 🔧 扩展指南

### 添加新的响应式属性

#### 步骤1：在初始化时添加属性
```javascript
// 在 game-main.js 的 initializeGame() 中
window.gameState.character = {
    // 现有属性
    health: 100,
    mood: 50,
    // 新增属性
    reputation: 0,      // 声望
    knowledge: 0,       // 知识
    strength: 10        // 力量
};
```

#### 步骤2：创建UI更新绑定
```javascript
// 在 reactive-system.js 的 setupCharacterBindings() 中
this.watch('reputation', (newVal) => {
    this.updateStatBar('reputation', newVal);
    // 声望达到一定值解锁内容
    if (newVal >= 100) {
        unlockAchievement('famous');
    }
});
```

#### 步骤3：在HTML中添加显示元素
```html
<!-- 在 game-main.html 的状态区域 -->
<div class="stat-item">
    <span class="stat-label">声望</span>
    <div class="stat-bar">
        <div class="stat-fill reputation" id="reputationBar"></div>
    </div>
    <span class="stat-value" id="reputationValue">0</span>
</div>
```

### 添加新的NPC

#### 步骤1：创建NPC配置
```javascript
// 新NPC：观察者
const observer = await window.reactiveNPCManager.initializeAPILinkedNPC({
    name: 'Observer',
    apiEndpoint: '/api/npc/observer',
    personality: {
        traits: ['神秘', '善于观察', '知识渊博']
    },
    initialState: {
        affection: 0,
        mood: 'mysterious',
        state: 'watching',
        knowledgeShared: 0  // 特有属性
    }
});
```

#### 步骤2：设置特殊互动
```javascript
// 观察者的特殊机制
window.reactiveSystem.watch('npc_Observer_knowledgeShared', (knowledge) => {
    if (knowledge >= 5) {
        // 分享足够知识后解锁剧情
        triggerStoryEvent('observer_trust');
    }
});
```

### 添加新的立绘集

#### 步骤1：准备立绘文件
```
images/characters/observer/
├── moods/
│   ├── mysterious.png
│   ├── interested.png
│   └── revealing.png
├── special/
│   ├── analyzing.png
│   └── truth_reveal.png
└── outfits/
    ├── lab_coat/
    └── casual/
```

#### 步骤2：注册立绘配置
```javascript
window.spriteSystem.registerCharacterSprites('Observer', {
    moods: {
        mysterious: 'images/characters/observer/moods/mysterious.png',
        interested: 'images/characters/observer/moods/interested.png',
        revealing: 'images/characters/observer/moods/revealing.png'
    },
    special: {
        analyzing: 'images/characters/observer/special/analyzing.png',
        truthReveal: 'images/characters/observer/special/truth_reveal.png'
    }
});
```

#### 步骤3：连接响应式更新
```javascript
// 自动切换立绘
window.reactiveSystem.watch('npc_Observer_mood', (mood) => {
    window.spriteSystem.updateSprite('Observer', { mood: mood });
});
```

## 🎮 实际应用示例

### 场景1：战斗系统集成
```javascript
// 战斗中的实时状态更新
function takeDamage(damage) {
    reactiveGameState.health -= damage;  // 血条自动减少

    if (reactiveGameState.health <= 30) {
        reactiveGameState.mood = 'worried';  // 表情自动变化
    }

    if (reactiveGameState.health <= 0) {
        triggerGameOver();
    }
}
```

### 场景2：商店系统
```javascript
function buyItem(item) {
    if (reactiveGameState.money >= item.price) {
        reactiveGameState.money -= item.price;  // 金钱自动更新
        addToInventory(item);

        // 购买特定物品触发剧情
        if (item.id === 'mysterious_key') {
            zero.affection += 10;  // Zero好感度提升
        }
    }
}
```

### 场景3：时间系统联动
```javascript
// 时间流逝影响状态
window.timeSystem.onTimePass((newTime) => {
    // 每过一小时
    reactiveGameState.energy -= 5;   // 精力下降
    reactiveGameState.hunger += 10;  // 饥饿度上升

    // 深夜精神值下降
    if (newTime.hour >= 23 || newTime.hour <= 5) {
        reactiveGameState.spirit -= 2;
    }
});
```

## 🚀 性能优化建议

### 1. 批量更新
```javascript
// 不好的做法（触发多次更新）
reactiveGameState.health = 100;
reactiveGameState.mood = 80;
reactiveGameState.energy = 90;

// 好的做法（一次性更新）
window.reactiveSystem.batchUpdate({
    health: 100,
    mood: 80,
    energy: 90
});
```

### 2. 防抖处理
```javascript
// 频繁变化的值使用防抖
let debounceTimer;
function updateFrequentValue(value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        reactiveGameState.frequentValue = value;
    }, 100);  // 100ms防抖
}
```

### 3. 条件更新
```javascript
// 只在值真正改变时更新
function updateIfChanged(property, newValue) {
    if (reactiveGameState[property] !== newValue) {
        reactiveGameState[property] = newValue;
    }
}
```

## 🐛 调试技巧

### 1. 开启调试日志
```javascript
// 在控制台查看所有数据变化
window.reactiveSystem.debug = true;
```

### 2. 查看当前状态
```javascript
// 控制台命令
console.table(window.reactiveGameState);
console.table(window.reactiveNPCs.Zero);
```

### 3. 手动触发更新测试
```javascript
// 测试响应式系统
window.testReactive();

// 测试NPC系统
window.testReactiveNPC();

// 测试立绘切换
window.testSpriteChange();
```

## 📝 注意事项

### 1. 避免循环依赖
```javascript
// 错误：可能造成无限循环
this.watch('a', (val) => {
    reactiveGameState.b = val * 2;
});
this.watch('b', (val) => {
    reactiveGameState.a = val / 2;  // 危险！
});
```

### 2. 初始化顺序
```javascript
// 正确的初始化顺序
1. 加载HTML
2. 初始化数据库
3. 初始化游戏状态
4. 创建响应式代理
5. 设置监听器
6. 开始游戏循环
```

### 3. 内存管理
```javascript
// 清理不再需要的监听器
window.reactiveSystem.unwatch('propertyName', callbackFunction);
```

## 🔮 未来扩展方向

### 1. **存档系统集成**
- 自动保存响应式状态
- 加载存档时恢复所有绑定

### 2. **成就系统**
- 监听特定条件自动解锁成就
- 成就进度实时显示

### 3. **多语言支持**
- 响应式切换语言
- 文本自动更新

### 4. **模组系统**
- 允许模组注册新的响应式属性
- 提供API供模组使用

### 5. **AI对话深度集成**
- 根据所有状态生成动态对话
- 情感分析影响NPC反应

## 📚 相关文件

- `/js/core/reactive-system.js` - 核心响应式系统
- `/js/core/scene-manager.js` - 场景管理器
- `/js/ai/reactive-npc-integration.js` - NPC集成
- `/js/core/sprite-system.js` - 立绘系统
- `/js/pages/game-main.js` - 游戏主逻辑
- `/game-main.html` - 游戏界面

## 🤝 开发建议

1. **保持数据单向流动**：UI永远不直接修改数据，只通过响应式系统
2. **模块化设计**：每个系统独立，通过响应式系统通信
3. **渐进式增强**：先实现基础功能，再添加复杂特性
4. **注释清晰**：标注哪些属性会触发什么更新
5. **测试充分**：每个新功能都要测试响应式更新

---

*最后更新：2024年*
*作者：Reality游戏开发团队*