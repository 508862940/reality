# AI配置使用说明

## 🚀 快速开始

### 1. 配置API密钥

打开 `api-config.js` 文件，找到以下部分并填入您的配置：

```javascript
const API_CONFIG = {
    // OpenAI兼容代理配置（推荐）
    OPENAI_PROXY: {
        // 在这里填入您的API密钥
        API_KEY: 'sk-你的密钥',
        // 在这里填入代理服务的地址
        BASE_URL: 'https://你的代理地址/v1/chat/completions',
        // 模型名称
        MODEL: 'gpt-3.5-turbo'
    }
};
```

### 2. 保存并刷新页面

保存文件后，刷新浏览器页面。打开开发者控制台（F12），您应该看到：
- ✅ OpenAI代理配置已加载
- ✅ 配置已同步到AI NPC系统

### 3. 测试AI对话

在游戏中与NPC对话，如果配置正确，AI将正常响应。

## ❗ 常见问题

### 问题：仍然显示"AI配置未找到: openai_proxy"

**解决方案：**

1. **检查配置是否正确填写**
   - 确保 `API_KEY` 不为空
   - 确保 `BASE_URL` 不为空
   - 两个值都必须填写才能启用

2. **检查控制台输出**
   - 打开浏览器控制台（F12）
   - 刷新页面
   - 查看是否有"✅ OpenAI代理配置已加载"的提示

3. **手动应用配置**
   - 在控制台输入：`applyAPIConfig()`
   - 然后输入：`syncAIServiceConfig()`

### 问题：网络请求失败

**可能原因：**
- API密钥错误
- 代理地址错误
- 网络连接问题
- CORS跨域限制

**解决方案：**
- 验证API密钥是否正确
- 确认代理服务是否正常运行
- 检查代理地址是否支持CORS

## 📝 支持的AI服务

1. **OpenAI兼容代理**（推荐）
   - 支持各种OpenAI兼容的代理服务
   - 配置灵活，成本较低

2. **原生OpenAI**
   - 需要官方API密钥
   - 直接调用OpenAI服务

3. **Google Gemini**
   - 免费额度较大
   - 中文支持良好

4. **Anthropic Claude**
   - 对话质量高
   - 需要官方API密钥

## 🔒 安全提醒

- `api-config.js` 文件已加入 `.gitignore`，不会被提交到Git
- 请勿将API密钥分享给他人
- 建议使用环境变量或加密存储敏感信息

## 💡 调试技巧

在浏览器控制台运行以下命令查看配置状态：

```javascript
// 查看当前AI配置
console.log(AIConfig.api.openai_proxy);

// 查看AI服务配置
console.log(AIServices.openai_proxy);

// 手动同步配置
syncAIServiceConfig();

// 检查配置是否启用
console.log('OpenAI代理启用状态:', AIConfig.api.openai_proxy.enabled);
```

## 📞 需要帮助？

如果问题仍未解决，请检查：
1. 浏览器控制台的具体错误信息
2. 网络请求的详细信息（Network标签）
3. API服务商的文档和状态