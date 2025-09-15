# 🎮 游戏AI配置完整指南

## 📋 目录
1. [问题诊断](#问题诊断)
2. [配置步骤](#配置步骤)
3. [具体配置示例](#具体配置示例)
4. [测试方法](#测试方法)
5. [常见错误解决](#常见错误解决)

---

## 🔍 问题诊断

根据您的截图，当前问题是：
- 错误信息：`AI配置未找到: openai_proxy`
- 位置：`ai-config.js:141`
- 原因：API密钥和代理地址未正确配置

## ✅ 配置步骤

### 步骤1：打开配置文件

找到并打开 `api-config.js` 文件（不是 api-config-example.js）

### 步骤2：填写您的API配置

将以下内容中的占位符替换为您的实际值：

```javascript
const API_CONFIG = {
    // OpenAI兼容代理配置
    OPENAI_PROXY: {
        // 把下面的值替换成您的实际配置
        API_KEY: 'sk-xxxxxxxxxxxxxx',  // ← 在这里填入您的API密钥
        BASE_URL: 'https://api.example.com/v1/chat/completions',  // ← 在这里填入您的代理地址
        MODEL: 'gpt-3.5-turbo'
    }
};
```

### 步骤3：保存文件并刷新页面

1. 按 `Ctrl+S` 保存文件
2. 刷新浏览器页面（F5）
3. 打开开发者控制台（F12）查看是否成功

## 📝 具体配置示例

### 示例1：使用 OpenAI 官方API

```javascript
const API_CONFIG = {
    OPENAI_PROXY: {
        API_KEY: '',  // 留空
        BASE_URL: '',  // 留空
        MODEL: 'gpt-3.5-turbo'
    },
    OPENAI: {
        API_KEY: 'sk-proj-xxxxxxxxxxxxx',  // OpenAI官方密钥
        MODEL: 'gpt-3.5-turbo'
    }
};
```

### 示例2：使用第三方代理（推荐）

```javascript
const API_CONFIG = {
    OPENAI_PROXY: {
        API_KEY: 'sk-abc123def456',  // 代理服务提供的密钥
        BASE_URL: 'https://api.openai-proxy.com/v1/chat/completions',  // 代理地址
        MODEL: 'gpt-3.5-turbo'
    }
};
```

### 示例3：使用 Gemini

```javascript
const API_CONFIG = {
    OPENAI_PROXY: {
        API_KEY: '',  // 留空
        BASE_URL: '',  // 留空
        MODEL: 'gpt-3.5-turbo'
    },
    GEMINI: {
        API_KEY: 'AIzaSyxxxxxxxxxxxxxxxxx',  // Gemini API密钥
        MODEL: 'gemini-pro'
    }
};
```

## 🧪 测试方法

### 方法1：控制台测试

在浏览器控制台（F12）输入以下命令：

```javascript
// 检查配置是否加载
console.log('API密钥已配置:', !!AIConfig.api.openai_proxy.apiKey);
console.log('代理地址已配置:', !!AIConfig.api.openai_proxy.baseURL);
console.log('服务已启用:', AIConfig.api.openai_proxy.enabled);

// 手动应用配置
applyAPIConfig();

// 查看完整配置（密钥会显示）
console.log(AIConfig.api.openai_proxy);
```

### 方法2：游戏内测试

1. 进入游戏
2. 找到任意NPC
3. 点击"与NPC对话"
4. 输入消息并发送
5. 查看是否有AI响应

## ❌ 常见错误解决

### 错误1：AI配置未找到

**症状：** 控制台显示 `AI配置未找到: openai_proxy`

**解决方案：**
```javascript
// 在控制台运行以下命令
if (typeof applyAPIConfig === 'function') {
    applyAPIConfig();
    console.log('配置已重新应用');
}
```

### 错误2：网络请求失败（403/401）

**症状：** 控制台显示 401 或 403 错误

**原因：** API密钥无效或过期

**解决方案：**
1. 检查API密钥是否正确
2. 确认密钥是否有效
3. 检查账户余额

### 错误3：网络请求失败（CORS）

**症状：** 控制台显示 CORS 错误

**原因：** 代理服务器未正确配置CORS

**解决方案：**
1. 确认代理地址支持跨域请求
2. 考虑使用其他代理服务
3. 或部署到同源服务器

### 错误4：Failed to fetch

**症状：** 控制台显示 `Failed to fetch`

**可能原因：**
- 网络连接问题
- 代理地址错误
- 防火墙拦截

**解决方案：**
1. 检查网络连接
2. 验证代理地址是否可访问
3. 尝试在浏览器直接访问代理地址

## 🛠️ 高级调试

### 查看请求详情

1. 打开开发者工具（F12）
2. 切换到 Network（网络）标签
3. 发送AI对话
4. 查看请求详情：
   - 请求URL是否正确
   - 请求头是否包含Authorization
   - 响应状态码
   - 响应内容

### 手动测试API

在控制台运行：

```javascript
// 手动测试API调用
async function testAPI() {
    const config = AIConfig.api.openai_proxy;
    try {
        const response = await fetch(config.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    {role: 'user', content: '你好'}
                ],
                max_tokens: 50
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API测试成功:', data);
        } else {
            console.error('❌ API测试失败:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ 网络错误:', error);
    }
}

testAPI();
```

## 📌 重要提醒

1. **不要提交密钥到Git**
   - `api-config.js` 已在 `.gitignore` 中
   - 切勿将密钥硬编码在其他文件中

2. **密钥安全**
   - 定期更换密钥
   - 不要分享密钥给他人
   - 使用环境变量存储（生产环境）

3. **配置优先级**
   - 如果同时配置多个服务，系统会按以下优先级选择：
     1. OpenAI代理（如果配置）
     2. OpenAI官方
     3. Gemini
     4. Claude

## 💬 还是不行？

如果按照以上步骤操作后仍有问题：

1. **截图以下内容发给我：**
   - 浏览器控制台的完整错误信息
   - Network标签中失败请求的详情
   - 运行 `console.log(AIConfig.api)` 的输出

2. **提供以下信息：**
   - 使用的是哪个API服务？
   - 代理服务的提供商
   - 是否能在其他工具中正常使用该API？

3. **尝试最简配置：**
   ```javascript
   // 只配置最基本的信息
   const API_CONFIG = {
       OPENAI_PROXY: {
           API_KEY: '您的密钥',
           BASE_URL: '您的代理地址',
           MODEL: 'gpt-3.5-turbo'
       }
   };
   ```

---

**最后更新：2024年12月**
**文档版本：1.0**