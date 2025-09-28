# 📸 插图浮层系统使用指南

> Reality游戏插图系统完整文档 | 2024-12-28

## 目录
1. [系统概述](#系统概述)
2. [快速开始](#快速开始)
3. [配置说明](#配置说明)
4. [高级功能](#高级功能)
5. [扩展开发](#扩展开发)
6. [常见问题](#常见问题)

---

## 系统概述

### 什么是插图浮层系统？

插图浮层系统是Reality游戏的核心视觉展示组件，提供了两种灵活的插图显示方式：

1. **传统内嵌模式** - 小型插图直接在剧情区域（F1区）内显示
2. **全新浮层模式** - 大型插图以优雅的模态框形式展示

### 为什么需要浮层模式？

- **更好的视觉体验**：大图不会被压缩，可以展示更多细节
- **不影响阅读**：浮层独立显示，不挤占剧情文本空间
- **未来扩展性**：同样的框架可用于手机界面、日记本、地图等功能
- **移动端优化**：PWA应用中提供原生级别的交互体验

---

## 快速开始

### 1. 查看演示

打开 `插图浮层系统演示.html` 查看完整效果演示。

### 2. 基础使用

在场景数据中配置插图时，只需添加 `type: 'modal'` 即可启用浮层：

```javascript
// 文件：js/data/scene-illustrations.js

SceneIllustrations['my_scene'] = {
    default: {
        emoji: '🏥',
        caption: '神秘的房间',
        description: '详细的场景描述...',
        type: 'modal',  // 关键：启用浮层模式
        title: '场景标题'
    }
};
```

### 3. 触发显示

玩家可以通过以下方式查看插图：
- 点击F2区的 **放大镜按钮**（🔍）
- 当有插图时，按钮会显示小红点提示

---

## 配置说明

### 插图数据结构

```javascript
{
    // === 基础字段 ===
    emoji: '🏥',           // 显示的emoji或图标
    caption: '标题文字',    // 插图的简短说明
    description: '详细描述', // 更详细的描述文字

    // === 浮层控制 ===
    type: 'modal',         // 'modal' = 浮层显示，不设置则内嵌显示
    title: '模态框标题',    // 浮层窗口的标题
    isLarge: true,         // 标记为大型插图
    showInModal: true,     // 另一种启用浮层的方式

    // === 未来扩展 ===
    url: 'path/to/image.jpg',  // 真实图片路径（未来支持）
    width: 800,                 // 自定义宽度
    height: 600,                // 自定义高度
    animation: 'fadeIn'         // 动画效果
}
```

### 智能判断逻辑

IllustrationManager会根据以下条件自动选择显示模式：

```javascript
// 以下任一条件满足时使用浮层模式：
- type === 'modal'        // 明确指定
- showInModal === true    // 标记字段
- url存在                 // 有真实图片
- isLarge === true        // 标记为大图
```

---

## 高级功能

### 1. 图片缩放

点击浮层中的图片可以放大/缩小查看：
- 第一次点击：放大到1.5倍
- 再次点击：恢复原始大小

### 2. 快捷键支持

- **ESC键**：快速关闭浮层
- **空格键**：（未来）切换缩放

### 3. 触摸手势（PWA）

移动设备上支持：
- **下滑**：关闭浮层（未来实现）
- **双指缩放**：放大缩小图片（未来实现）
- **左右滑动**：切换多张图片（未来实现）

### 4. 条件显示

根据游戏进度动态显示不同插图：

```javascript
// 根据时间显示不同插图
if (gameTime.hour >= 18) {
    illustration.emoji = '🌙';  // 晚上显示月亮
} else {
    illustration.emoji = '☀️';   // 白天显示太阳
}
```

---

## 扩展开发

### 创建新的浮层类型

浮层框架设计为通用组件，可以轻松扩展为其他功能：

#### 示例1：手机界面

```javascript
class PhoneInterface extends IllustrationManager {
    showPhone(phoneData) {
        const modalData = {
            title: '手机',
            emoji: '📱',
            caption: phoneData.app,
            description: phoneData.content,
            type: 'modal'
        };
        this.showModal(modalData);
    }
}
```

#### 示例2：日记本系统

```javascript
class DiarySystem extends IllustrationManager {
    showDiary(page) {
        const modalData = {
            title: '日记本',
            emoji: '📔',
            caption: `第${page}页`,
            description: diaryContent[page],
            type: 'modal',
            isLarge: true
        };
        this.showModal(modalData);
    }
}
```

#### 示例3：烹饪界面

```javascript
class CookingSystem extends IllustrationManager {
    showRecipe(recipe) {
        const modalData = {
            title: '烹饪食谱',
            emoji: '🍳',
            caption: recipe.name,
            description: recipe.steps.join('\n'),
            type: 'modal'
        };
        this.showModal(modalData);
    }
}
```

### 添加真实图片支持

当前系统使用emoji占位，未来可以轻松添加真实图片：

```javascript
// 1. 在插图数据中添加url
{
    url: 'images/scenes/laboratory.jpg',
    type: 'modal',
    title: '实验室全景'
}

// 2. IllustrationManager会自动处理
if (illustration.url) {
    modalImage.innerHTML = `<img src="${illustration.url}" alt="${illustration.caption}">`;
}
```

### 自定义样式

可以通过CSS变量自定义浮层外观：

```css
/* 自定义主题色 */
.illustration-modal-overlay {
    --modal-bg: linear-gradient(135deg, #1e1e2e, #2a2a3e);
    --modal-border: rgba(139, 92, 246, 0.3);
    --modal-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
}

/* 自定义大小 */
.illustration-modal-content {
    max-width: 900px;  /* 更宽的模态框 */
    max-height: 90vh;  /* 更高的模态框 */
}
```

---

## 常见问题

### Q: 如何让所有插图都使用浮层模式？

修改 `IllustrationManager.shouldUseModal()` 方法：

```javascript
shouldUseModal(illustration) {
    return true;  // 始终使用浮层
}
```

### Q: 如何禁用缩放功能？

移除点击事件：

```javascript
// 在showModal方法中注释掉：
// onclick="window.illustrationManager?.toggleZoom()"
```

### Q: 如何添加加载动画？

在显示真实图片时添加loading状态：

```javascript
modalImage.innerHTML = '<div class="illustration-loading"></div>';
const img = new Image();
img.onload = () => {
    modalImage.innerHTML = '';
    modalImage.appendChild(img);
};
img.src = illustration.url;
```

### Q: 如何实现多图切换？

扩展现有系统：

```javascript
class MultiImageModal extends IllustrationManager {
    constructor() {
        super();
        this.images = [];
        this.currentIndex = 0;
    }

    showMultiple(images) {
        this.images = images;
        this.currentIndex = 0;
        this.showModal(images[0]);
        this.addNavigationButtons();
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateModalContent(this.images[this.currentIndex]);
    }
}
```

---

## 性能优化建议

1. **图片懒加载**：只在需要时加载图片
2. **预加载关键图片**：提前加载下一个场景的插图
3. **图片压缩**：使用WebP格式，提供降级方案
4. **缓存策略**：使用Service Worker缓存常用插图

---

## 调试技巧

### 开启调试日志

```javascript
// 在控制台执行
window.illustrationManager.debug = true;
```

### 手动触发浮层

```javascript
// 测试浮层显示
window.illustrationManager.showModal({
    emoji: '🎨',
    caption: '测试插图',
    description: '这是一个测试',
    type: 'modal',
    title: '调试'
});
```

### 查看当前插图

```javascript
console.log(window.illustrationManager.currentIllustration);
```

---

## 更新日志

### v1.0.0 (2024-12-28)
- ✅ 初始版本发布
- ✅ 支持emoji插图
- ✅ 浮层/内嵌双模式
- ✅ 缩放功能
- ✅ ESC键支持
- ✅ PWA优化

### 计划功能
- ⏳ 真实图片支持
- ⏳ 多图切换
- ⏳ 触摸手势
- ⏳ 动画效果
- ⏳ 主题自定义

---

## 相关链接

- [项目主文档](../CLAUDE.md)
- [场景系统指南](./reactive-system-guide.md)
- [立绘系统规划](./portrait-system-plan.md)
- [演示文件](../插图浮层系统演示.html)

---

*最后更新：2024-12-28*
*作者：Claude & User*
*版本：1.0.0*