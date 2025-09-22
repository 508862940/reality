# 🤖 AI对话功能测试指南

## 功能概述
F2区现在支持两种模式：
1. **场景模式** - 传统的按钮控制（继续/重置）
2. **AI对话模式** - 自由输入与NPC对话

## 如何测试

### 方法1：通过控制台测试
1. 打开游戏页面 `game-main.html`
2. 按 F12 打开开发者控制台
3. 输入以下命令：

```javascript
// 加载Zero的测试场景
loadAITestScene('meet_zero')

// 或加载观察者的测试场景
loadAITestScene('meet_observer')
```

4. 在场景中选择 "💬 与XXX对话（AI模式）" 选项
5. F2区会自动切换到AI输入模式

### 方法2：正常游戏流程
1. 正常进入游戏
2. 当遇到带有 💬 图标的选项时，选择它
3. 系统会自动切换到AI对话模式

## AI对话模式操作

### 发送消息
- 在输入框输入文字
- 按回车键或点击发送按钮

### 对话效果
- **玩家消息**：紫色渐变背景，右对齐
- **NPC回复**：暗色背景，左对齐
- **思考动画**：三个跳动的点表示NPC正在思考

### 结束对话
- 点击右上角的"结束对话"按钮
- 或在控制台输入：`aiDialogueManager.endAIDialogue()`

## 测试要点

### 1. Zero的对话测试
Zero会根据好感度有不同反应：
- 好感度 < 30：冷淡回应
- 好感度 30-70：正常交流
- 好感度 > 70：温柔态度

测试关键词：
- "狼"、"力量" - 触发警戒反应
- "喜欢"、"爱" - 根据好感度有不同回应
- "帮助"、"保护" - 触发保护欲
- "记忆"、"过去" - 触发回避反应

### 2. 响应式系统联动
```javascript
// 手动调整Zero的好感度
window.reactiveNPCs.Zero.affection = 80

// 再次对话会有不同反应
```

### 3. 状态实时更新
对话过程中，以下内容会自动更新：
- NPC好感度（根据对话内容）
- 玩家状态（精神值等）
- 立绘表情（如果已配置）

## 调试命令

```javascript
// 查看当前AI对话状态
console.log(aiDialogueManager)

// 查看NPC状态
console.log(window.reactiveNPCs)

// 手动触发AI对话
aiDialogueManager.startAIDialogue('Zero')

// 模拟发送消息
aiDialogueManager.sendMessage('你好')
```

## 常见问题

### Q: AI对话没有反应？
A: 检查控制台是否有错误，确保 `aiDialogueManager` 已初始化

### Q: 如何返回场景模式？
A: 点击"结束对话"按钮或调用 `aiDialogueManager.endAIDialogue()`

### Q: 对话内容会保存吗？
A: 当前版本对话历史保存在 `aiDialogueManager.dialogueHistory` 中

## 未来扩展

1. **API集成**：连接真实AI API生成智能回复
2. **语音输入**：支持语音转文字输入
3. **情感分析**：根据玩家语气调整NPC反应
4. **对话存档**：保存重要对话供回顾

---

*测试愉快！如有问题请查看控制台日志*