# Twine 制作互动小说游戏教程

## 什么是Twine？
Twine是一个免费的互动小说制作工具，无需编程基础，适合制作类似《Degrees of Lewdity》的游戏。

## 安装和使用

### 1. 下载Twine
- 访问：https://twinery.org/
- 选择"Download"下载桌面版
- 或者直接使用网页版

### 2. 创建新故事
1. 打开Twine
2. 点击"New Story"
3. 输入故事名称
4. 选择格式（推荐Harlowe 3.x）

### 3. 基本操作
```
[[进入教室]] -> 创建链接到新页面
(if: $health > 50)[[去操场]] -> 条件链接
(set: $health to $health - 10) -> 修改变量
```

### 4. 游戏机制示例

#### 角色属性系统
```
(set: $health to 100)
(set: $mood to 50)
(set: $money to 100)
```

#### 条件选择
```
你的体力是 $health。

(if: $health > 70)[
  [[去运动|playground]]
]
(else-if: $health < 30)[
  [[休息一下|rest]]
]
(else)[
  [[随便走走|walk]]
]
```

#### 随机事件
```
(set: $random to (random: 1, 5))

(if: $random is 1)[
  你发现了一个神秘的小径！
  [[探索小径|mystery_path]]
]
(else-if: $random is 2)[
  一只友好的猫咪向你走来。
  [[摸摸猫咪|pet_cat]]
]
```

### 5. 导出和部署
1. 完成故事后，点击"Build"
2. 选择"Publish to File"
3. 得到HTML文件
4. 可以上传到GitHub Pages

## 优点
- ✅ 无需编程基础
- ✅ 可视化编辑
- ✅ 快速上手
- ✅ 专注故事创作

## 缺点
- ❌ 自定义能力有限
- ❌ 难以集成AI
- ❌ 主要是文本游戏
- ❌ 美术资源支持有限

## 适合场景
- 纯文本互动小说
- 快速原型制作
- 故事驱动的游戏
- 不需要复杂机制的简单游戏
