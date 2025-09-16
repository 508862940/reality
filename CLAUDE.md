# 🎮 Reality游戏 - 快速参考

## 项目概述
一个中文互动小说游戏，具有AI驱动的NPC对话系统。

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
- ⏳ AI系统待完善