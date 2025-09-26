# 🎨 立绘系统开发计划

## 📋 概述
Reality游戏的立绘系统采用分层渲染技术，支持高度自定义的角色外观。系统分为占位符阶段和正式立绘阶段。

## 🎯 当前阶段：占位符系统

### 占位符显示方案
```javascript
// A区大立绘占位
<div id="characterPortrait" class="portrait-placeholder">
    <div class="emoji-avatar">👧🏻</div>
    <div class="appearance-text">女性·黑色长发·纤细</div>
</div>

// D区/F1区小型显示
<span class="chibi-placeholder">👧🏻</span>
```

### 数据结构
```javascript
worldState.state.player.appearance = {
    // 基础属性
    gender: 'female',      // 'male' | 'female' | 'other'
    age: 18,

    // 身体
    bodyType: 'slim',      // 'slim' | 'normal' | 'athletic' | 'plump'
    skinTone: 'fair',      // 'pale' | 'fair' | 'medium' | 'tan' | 'dark' | 'deep'
    height: 'medium',      // 'short' | 'medium' | 'tall'

    // 头发
    hairStyle: 'long',     // 'long' | 'short' | 'twintails' | 'ponytail'
    hairColor: 'black',    // 'black' | 'brown' | 'blonde' | 'red' | 'purple' | 'blue' | 'green' | 'white'

    // 眼睛
    eyeShape: 'round',     // 'round' | 'narrow' | 'droopy'
    eyeColor: 'brown',     // 'brown' | 'blue' | 'green' | 'red' | 'purple' | 'gold'

    // 表情状态（动态）
    expression: 'normal',  // 'normal' | 'happy' | 'sad' | 'angry' | 'shy' | 'surprised'

    // 服装（未来扩展）
    clothes: 'default',
    accessories: []
}
```

## 🖼️ 正式立绘阶段（待实现）

### 文件命名规范
```
assets/portraits/
├── body/
│   ├── body_female_slim.png
│   ├── body_female_normal.png
│   ├── body_female_athletic.png
│   └── body_female_plump.png
├── hair_back/
│   ├── hair_long_back.png
│   ├── hair_short_back.png
│   ├── hair_twintails_back.png
│   └── hair_ponytail_back.png
├── hair_front/
│   ├── hair_long_front.png
│   ├── hair_short_front.png
│   ├── hair_twintails_front.png
│   └── hair_ponytail_front.png
├── face/
│   ├── face_normal.png
│   ├── face_happy.png
│   ├── face_sad.png
│   ├── face_angry.png
│   ├── face_shy.png
│   └── face_surprised.png
├── eyes/
│   ├── eyes_round.png
│   ├── eyes_narrow.png
│   └── eyes_droopy.png
└── chibi/
    ├── idle/
    │   ├── chibi_idle_front.png
    │   ├── chibi_idle_back.png
    │   └── chibi_idle_side.png
    └── walk/
        ├── chibi_walk_front_01.png
        ├── chibi_walk_front_02.png
        ├── chibi_walk_front_03.png
        └── chibi_walk_front_04.png
```

### 层级顺序（从底到顶）
1. **背景层**（可选）
2. **后发层** (hair_back)
3. **身体层** (body) - 包含基础身体和肤色
4. **服装层** (clothes) - 未来添加
5. **脸部层** (face) - 表情
6. **眼睛层** (eyes) - 眼型和瞳色
7. **前发层** (hair_front)
8. **配饰层** (accessories) - 未来添加
9. **特效层** (effects) - 临时效果

### 替换步骤

#### 第一步：替换A区大立绘
```javascript
// 原占位符代码
<div class="emoji-avatar">👧🏻</div>

// 替换为
<div class="portrait-container">
    <img class="layer layer-hair-back" src="assets/portraits/hair_back/hair_long_back.png">
    <img class="layer layer-body" src="assets/portraits/body/body_female_slim.png">
    <img class="layer layer-face" src="assets/portraits/face/face_normal.png">
    <img class="layer layer-eyes" src="assets/portraits/eyes/eyes_round.png">
    <img class="layer layer-hair-front" src="assets/portraits/hair_front/hair_long_front.png">
</div>
```

#### 第二步：添加CSS滤镜
```css
/* 发色调整 */
.layer-hair-back,
.layer-hair-front {
    filter: hue-rotate(var(--hair-hue))
            saturate(var(--hair-saturation))
            brightness(var(--hair-brightness));
}

/* 肤色调整 */
.layer-body {
    filter: hue-rotate(var(--skin-hue))
            saturate(var(--skin-saturation))
            brightness(var(--skin-brightness));
}

/* 瞳色调整 */
.layer-eyes {
    filter: hue-rotate(var(--eye-hue))
            saturate(var(--eye-saturation));
}
```

#### 第三步：动画系统
```javascript
// 呼吸动画
@keyframes breathing {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.02); }
}

// 眨眼动画
@keyframes blinking {
    0%, 90%, 100% { opacity: 1; }
    95% { opacity: 0.1; }
}

.layer-body {
    animation: breathing 4s ease-in-out infinite;
}

.layer-eyes {
    animation: blinking 5s infinite;
}
```

## 🎮 Q版精灵系统

### 动画控制器
```javascript
class ChibiAnimator {
    constructor() {
        this.currentAnimation = 'idle';
        this.direction = 'front';
        this.frame = 0;
    }

    playWalkAnimation(direction) {
        this.currentAnimation = 'walk';
        this.direction = direction;
        this.animateFrames();
    }

    animateFrames() {
        // 循环播放4帧行走动画
        this.frame = (this.frame + 1) % 4;
        const framePath = `chibi_${this.currentAnimation}_${this.direction}_${this.frame + 1}.png`;
        this.updateSprite(framePath);
    }
}
```

### 交互动作触发
```javascript
// 与NPC互动时
function onNPCInteraction(npcName) {
    if (npcName === 'Zero') {
        chibiAnimator.playAnimation('wave');  // 挥手
    } else if (relationship[npcName] > 50) {
        chibiAnimator.playAnimation('hug');   // 拥抱
    }
}
```

## 📝 动态文本系统

### 变量替换
```javascript
// 模板文本
const template = "${npcName}看着你的${player.hairColor}${player.hairStyle}，露出赞赏的神色。";

// 替换函数
function parseDialogue(text, context) {
    return text.replace(/\${([^}]+)}/g, (match, path) => {
        // 支持嵌套属性访问
        return path.split('.').reduce((obj, key) => obj?.[key], context) || match;
    });
}

// 实际输出
"Zero看着你的黑色长发，露出赞赏的神色。"
```

### 条件文本
```javascript
// 根据外观选择不同文本
function getAppearanceComment(appearance) {
    if (appearance.hairStyle === 'twintails') {
        return "你的双马尾真可爱！";
    } else if (appearance.hairColor === 'red') {
        return "火红的头发很适合你。";
    } else if (appearance.bodyType === 'athletic') {
        return "你看起来很健康。";
    }
    return "你今天看起来不错。";
}
```

## 🚀 实施优先级

### Phase 1 - 基础占位符（当前）
- [x] Emoji + 文字占位符
- [ ] 外观数据保存到WorldState
- [ ] 基础动态文本替换

### Phase 2 - 立绘框架
- [ ] 立绘管理器类
- [ ] 图层合成系统
- [ ] CSS滤镜颜色系统

### Phase 3 - 动画系统
- [ ] 呼吸、眨眼基础动画
- [ ] Q版精灵动画控制器
- [ ] 交互动作系统

### Phase 4 - 完整替换
- [ ] 导入所有立绘素材
- [ ] 替换占位符为真实立绘
- [ ] 性能优化

## 🎨 美术素材需求清单

### 优先级1（核心）
- [ ] 女性身体基础 × 1个体型
- [ ] 基础发型2-3个（前后层）
- [ ] 基础表情3-4个
- [ ] Q版站立3方向
- [ ] Q版行走正面4帧

### 优先级2（扩展）
- [ ] 更多体型（共4个）
- [ ] 更多发型（共6-8个）
- [ ] 完整表情集（6个）
- [ ] Q版全方向行走
- [ ] Q版互动动作3-5个

### 优先级3（进阶）
- [ ] 服装系统
- [ ] 配饰系统
- [ ] 战斗姿势
- [ ] 特殊效果

## 📌 技术备注

### 性能优化
1. 使用CSS transform代替position动画
2. 图片懒加载
3. 精灵图合并减少请求
4. WebP格式支持检测

### 兼容性
1. 降级方案：不支持filter时显示原色
2. 移动端适配：触摸交互
3. 低性能模式：关闭动画

### 扩展性
1. 支持MOD添加新发型/服装
2. 用户自定义颜色
3. 导出/导入外观配置

---

*最后更新：2024-01*
*作者：Claude & User*