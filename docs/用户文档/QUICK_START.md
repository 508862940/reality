# 快速开始指南

## 🚀 项目概述
这是一个类似《Degrees of Lewdity》机制的互动小说游戏，使用HTML + CSS + JavaScript开发，支持AI集成和PWA部署。

## 📁 项目文件
- `index.html` - 主游戏页面
- `styles.css` - 样式文件  
- `game.js` - 基础游戏逻辑
- `ai-config.js` - AI配置和对话系统
- `advanced-game.js` - 高级游戏系统
- `PROJECT_REQUIREMENTS.md` - 详细需求文档
- `DEVELOPMENT_NOTES.md` - 开发笔记和进度

## 🎮 如何游玩

### 基础游玩
1. 打开 `index.html` 文件
2. 选择不同的地点进行探索
3. 与地点互动，影响角色属性
4. 享受游戏带来的乐趣！

### AI功能使用
1. 点击"AI设置"按钮
2. 选择AI服务（推荐本地AI或配置API密钥）
3. 点击"与AI对话"与NPC聊天
4. 点击"AI生成事件"获得随机剧情

## 🤖 AI配置

### 本地AI (推荐新手)
1. 安装 Ollama: https://ollama.ai/
2. 运行命令: `ollama run llama2`
3. 在游戏中选择"本地AI"即可

### 在线AI服务
1. 获取API密钥（OpenAI、Gemini、通义千问等）
2. 在AI设置中输入密钥
3. 选择对应的AI服务
4. 点击"测试连接"验证

## 🔧 开发环境

### 本地开发
```bash
# 克隆项目
git clone [你的仓库地址]
cd yozi

# 直接用浏览器打开
start index.html
# 或
open index.html
```

### 在线部署
1. 上传到GitHub仓库
2. 启用GitHub Pages
3. 访问 `https://你的用户名.github.io/仓库名`

## 📝 添加新内容

### 添加新地点
在 `game.js` 的 `locations` 对象中添加：
```javascript
newLocation: {
    name: '新地点',
    description: '地点描述',
    options: [
        { text: '选项1', target: 'targetLocation' },
        { text: '选项2', action: 'actionName' }
    ]
}
```

### 添加新事件
在 `game.js` 的 `events` 对象中添加：
```javascript
newEvent: {
    text: '事件描述',
    effects: { health: +10, mood: +5 }
}
```

### 添加新AI角色
在 `ai-config.js` 的 `npcPersonalities` 中添加：
```javascript
newNPC: {
    name: '角色名',
    personality: '性格描述',
    greeting: '问候语'
}
```

## 🎯 游戏机制

### 角色属性
- **体力**: 影响角色活动能力
- **心情**: 影响对话和事件
- **金钱**: 用于购买物品
- **精力**: 影响活动选择
- **饥饿**: 需要定期进食
- **卫生**: 影响社交互动

### 技能系统
- **智力**: 影响学习和解谜
- **力量**: 影响体力活动
- **魅力**: 影响社交互动
- **运动**: 影响体育活动

### 时间系统
- 游戏内时间自动流逝
- 不同时间有不同事件
- 时间影响角色状态

## 🐛 常见问题

### AI功能无法使用
1. 检查网络连接
2. 确认API密钥正确
3. 尝试不同的AI服务
4. 检查浏览器控制台错误

### 游戏运行缓慢
1. 关闭不必要的浏览器标签
2. 检查AI API响应时间
3. 减少同时运行的程序

### 界面显示异常
1. 刷新页面
2. 清除浏览器缓存
3. 检查CSS文件是否正确加载

## 📞 获取帮助

### 开发问题
- 查看 `DEVELOPMENT_NOTES.md`
- 检查浏览器控制台错误
- 参考代码注释

### 功能问题
- 查看 `PROJECT_REQUIREMENTS.md`
- 测试AI连接
- 检查游戏数据配置

### 部署问题
- 确认GitHub Pages设置
- 检查文件路径
- 验证HTML语法

## 🎉 下一步

1. **完善游戏内容** - 添加更多地点和事件
2. **优化AI功能** - 改进对话体验
3. **添加PWA支持** - 实现离线游玩
4. **性能优化** - 提升游戏体验

---

**开始你的游戏开发之旅吧！** 🎮✨
