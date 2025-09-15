# Ren'Py 制作互动小说游戏教程

## 什么是Ren'Py？
Ren'Py是一个专业的视觉小说游戏引擎，使用Python语言，功能强大，适合制作复杂的互动游戏。

## 安装和设置

### 1. 下载Ren'Py
- 访问：https://www.renpy.org/
- 下载最新版本
- 安装后启动Ren'Py Launcher

### 2. 创建新项目
1. 启动Ren'Py Launcher
2. 点击"Create New Project"
3. 输入项目名称
4. 选择项目模板

### 3. 基本语法

#### 角色定义
```python
define e = Character("小明", color="#c8ffc8")
define teacher = Character("张老师", color="#c8c8ff")
```

#### 对话系统
```python
label start:
    e "你好！我是小明。"
    teacher "欢迎来到学校，小明。"
    e "谢谢老师！"
```

#### 选择分支
```python
menu:
    "你想去哪里？"
    
    "去教室":
        jump classroom
    
    "去操场":
        jump playground
    
    "去食堂":
        jump cafeteria
```

#### 角色属性
```python
# 在script.rpy中定义变量
default health = 100
default mood = 50
default money = 100

# 在游戏中修改属性
$ health -= 10
$ mood += 5
$ money -= 20
```

#### 条件判断
```python
if health > 70:
    e "我感觉很好！"
elif health < 30:
    e "我感觉很累..."
else:
    e "我感觉一般般。"
```

### 4. 游戏机制示例

#### 地图系统
```python
label school:
    scene bg school
    e "你来到了学校。"
    
    menu:
        "你想去哪里？"
        
        "进入教室" if True:
            jump classroom
            
        "去操场" if True:
            jump playground
            
        "去食堂" if True:
            jump cafeteria
```

#### 角色状态显示
```python
screen stats:
    frame:
        xalign 1.0
        yalign 0.0
        
        vbox:
            text "体力: [health]"
            text "心情: [mood]"
            text "金钱: [money]"

# 在游戏开始时显示状态栏
show screen stats
```

#### 随机事件
```python
label random_event:
    $ random_num = renpy.random.randint(1, 5)
    
    if random_num == 1:
        e "你发现了一个神秘的地方！"
        $ mood += 10
    elif random_num == 2:
        e "你遇到了一个朋友。"
        $ mood += 5
    else:
        e "什么都没发生。"
```

### 5. AI集成（高级功能）
```python
# 需要安装requests库
init python:
    import requests
    
    def call_ai_api(message):
        # 调用AI API的代码
        # 这里需要你自己实现
        pass

label ai_conversation:
    $ user_input = renpy.input("你想说什么？")
    $ ai_response = call_ai_api(user_input)
    ai_character "[ai_response]"
```

### 6. 导出和发布
1. 在Ren'Py Launcher中选择项目
2. 点击"Build Distributions"
3. 选择目标平台
4. 生成发布文件

## 优点
- ✅ 专业游戏引擎
- ✅ 功能强大
- ✅ 跨平台支持
- ✅ 内置UI系统
- ✅ 支持音效和动画

## 缺点
- ❌ 学习曲线较陡
- ❌ 需要学习Python
- ❌ 文件较大
- ❌ 部署相对复杂

## 适合场景
- 专业的视觉小说游戏
- 需要复杂机制的互动游戏
- 跨平台发布
- 有美术资源的项目

## 学习资源
- [Ren'Py中文教程](https://github.com/ZYKsslm/RenPy-Tutorial)
- [Ren'Py官方文档](https://www.renpy.org/doc/html/)
- [Ren'Py中文论坛](https://www.renpy.cn/)
