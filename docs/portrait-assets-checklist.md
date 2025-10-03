# 🎨 Reality游戏 - 立绘美术素材完整清单

> **文档版本**：v1.0
> **创建日期**：2025-10-02
> **绘制风格**：分层PNG + 像素风Q版

---

## 📊 总览统计

| 阶段 | 素材数量 | 预估工时 | 优先级 |
|------|----------|----------|--------|
| **Phase 1 - MVP** | ~20张 | 2-3天 | ⭐⭐⭐ 必须完成 |
| **Phase 2 - 扩展** | ~50张 | 5-7天 | ⭐⭐ 推荐完成 |
| **Phase 3 - 完整** | ~150张 | 15-20天 | ⭐ 可选扩展 |

---

## 🖼️ 一、大立绘系统（A区主显示 - 支持大小立绘切换！）

### 🔄 ⭐新增功能：A区立绘切换模式⭐

```yaml
模式1 - 大立绘 (默认):
  - 尺寸: 400px × 800px (竖版半身) 或 300px × 1200px (全身)
  - 风格: 精美细致，适合欣赏角色细节
  - 使用场景: 默认显示，重要剧情，角色装扮展示
  - 优势: 展现角色魅力，情感表达细腻

模式2 - Q版小立绘:
  - 原始尺寸: 48px × 96px (Q版全身)
  - A区显示: 128px × 256px (CSS放大，保持像素锐利)
  - 风格: 可爱像素风，活泼动态
  - 使用场景: 战斗/探索/日常互动
  - 优势: 节省性能，动作生动，萌系风格

切换方式:
  - 点击A区右上角的切换按钮 [🎨/🎮]
  - 快捷键: Tab键快速切换
  - 记住玩家偏好（存入worldState）
  - 切换动画: 淡入淡出 0.3s
```

### 🎯 绘制策略调整

由于A区支持Q版显示，Q版立绘优先级提升：
- **大立绘**：用于剧情/对话/装扮展示
- **Q版立绘**：用于A区小立绘模式 + D区/F1区/地图显示
- **两套系统共享**：表情/服装/配饰数据同步

### 📐 大立绘基础规格

```yaml
画布尺寸: 400px × 800px (竖版半身) 或 300px × 1200px (全身)
文件格式: PNG-24 (透明背景)
分辨率: 72 DPI (网页用)
色彩模式: RGB
```

---

## 1️⃣ 身体基础层 (body/)

### 文件列表

| ✅ | 文件名 | 说明 | 优先级 | 备注 |
|----|--------|------|--------|------|
| ☐ | `body_base_nude.png` | 裸体基础线稿 | ⭐⭐⭐ | 参考你的人体模板 |
| ☐ | `body_female_slim.png` | 女性纤细体型 | ⭐⭐⭐ | 小胸，细腰，腿长 |
| ☐ | `body_female_normal.png` | 女性标准体型 | ⭐⭐⭐ | 中等胸围，均衡 |
| ☐ | `body_female_athletic.png` | 女性健壮体型 | ⭐⭐ | 肌肉线条，结实 |
| ☐ | `body_female_plump.png` | 女性丰满体型 | ⭐⭐ | 大胸，柔和曲线 |
| ☐ | `body_male_slim.png` | 男性纤细体型 | ⭐ | 后期扩展 |
| ☐ | `body_male_normal.png` | 男性标准体型 | ⭐ | 后期扩展 |
| ☐ | `body_futanari_normal.png` | 扶她体型 | ⭐ | 特殊选项 |

### 绘制要点

```
✏️ 肤色处理：
   - 只画一个基础肤色（fair 白皙）
   - 其他肤色由CSS滤镜生成（见附录）

✏️ 层级内容：
   - 身体轮廓
   - 基础肌肉/骨骼结构
   - 不包含：头部/手部细节（用表情层覆盖）

✏️ 姿势：
   - 站立正面，双手自然下垂或交叉
   - 保持轴对称（方便后续镜像）
```

### MVP最小集（Phase 1）

- [x] 只画 `body_female_normal.png` × 1个

---

## 2️⃣ 头发层 (hair_back/ + hair_front/)

### 📂 后发层 (hair_back/) - 在脸后面

| ✅ | 文件名 | 说明 | 优先级 | 参考图 |
|----|--------|------|--------|--------|
| ☐ | `hair_back_long.png` | 长发后层 | ⭐⭐⭐ | 披肩到腰，柔顺 |
| ☐ | `hair_back_short.png` | 短发后层 | ⭐⭐⭐ | 短到耳际，利落 |
| ☐ | `hair_back_ponytail.png` | 单马尾后层 | ⭐⭐ | 后脑勺扎起，马尾垂下 |
| ☐ | `hair_back_twintails.png` | 双马尾后层 | ⭐⭐ | 两侧扎起，可爱风 |
| ☐ | `hair_back_bob.png` | 波波头后层 | ⭐ | 齐脖短发，内扣 |
| ☐ | `hair_back_braid.png` | 麻花辫后层 | ⭐ | 编织长辫，精致 |

### 📂 前发层 (hair_front/) - 在脸前面

| ✅ | 文件名 | 说明 | 优先级 | 配合后发 |
|----|--------|------|--------|----------|
| ☐ | `hair_front_long.png` | 长发前层 | ⭐⭐⭐ | 刘海+两侧发丝 |
| ☐ | `hair_front_short.png` | 短发前层 | ⭐⭐⭐ | 碎刘海，露耳朵 |
| ☐ | `hair_front_ponytail.png` | 单马尾前层 | ⭐⭐ | 刘海+额前碎发 |
| ☐ | `hair_front_twintails.png` | 双马尾前层 | ⭐⭐ | 齐刘海+两侧发尾 |
| ☐ | `hair_front_bob.png` | 波波头前层 | ⭐ | 齐刘海+侧发 |
| ☐ | `hair_front_braid.png` | 麻花辫前层 | ⭐ | 刘海+辫子前段 |

### 绘制要点

```
✏️ 颜色处理：
   - 只画纯黑色 (#000000)
   - 其他发色（棕/金/红/紫/蓝/绿/白）由CSS滤镜生成

✏️ 层级关系：
   - 后发层(Z-index: 1) → 身体(2) → 脸(4) → 前发层(6)
   - 确保前后发能无缝衔接

✏️ 风格统一：
   - 发丝流向自然
   - 高光位置一致
   - 厚度/层次感统一
```

### MVP最小集（Phase 1）

- [x] `hair_back_long.png` + `hair_front_long.png`
- [x] `hair_back_short.png` + `hair_front_short.png`

---

## 3️⃣ 脸部/表情层 (face/)

### 方案A：整脸表情（推荐，简单）

| ✅ | 文件名 | 表情 | 优先级 | 描述 |
|----|--------|------|--------|------|
| ☐ | `face_normal.png` | 😐 平静 | ⭐⭐⭐ | 默认表情，放松 |
| ☐ | `face_happy.png` | 😊 开心 | ⭐⭐⭐ | 微笑，眼睛弯成月牙 |
| ☐ | `face_sad.png` | 😢 悲伤 | ⭐⭐ | 嘴角下垂，眼神低垂 |
| ☐ | `face_angry.png` | 😠 生气 | ⭐⭐ | 皱眉，嘴紧闭，瞪眼 |
| ☐ | `face_shy.png` | 😳 害羞 | ⭐⭐ | 脸红，眼神飘忽 |
| ☐ | `face_surprised.png` | 😮 惊讶 | ⭐⭐ | 张嘴，眼睛睁大 |
| ☐ | `face_scared.png` | 😨 恐惧 | ⭐ | 瞳孔缩小，冷汗 |
| ☐ | `face_crying.png` | 😭 哭泣 | ⭐ | 眼泪滚落 |
| ☐ | `face_smirk.png` | 😏 坏笑 | ⭐ | 邪魅一笑，眼神狡黠 |
| ☐ | `face_tired.png` | 😪 疲惫 | ⭐ | 半睁眼，黑眼圈 |

### 方案B：分离式（超级灵活，复杂）

如果想要更多组合（如"开心的眼睛+悲伤的嘴"），可分离绘制：

#### 眼睛层 (eyes/)

| ✅ | 文件名 | 说明 | 优先级 |
|----|--------|------|--------|
| ☐ | `eyes_normal_open.png` | 正常睁眼 | ⭐⭐ |
| ☐ | `eyes_normal_closed.png` | 闭眼（眨眼动画） | ⭐⭐ |
| ☐ | `eyes_happy.png` | 开心眯眼 | ⭐ |
| ☐ | `eyes_angry.png` | 生气瞪眼 | ⭐ |
| ☐ | `eyes_sad.png` | 悲伤低垂 | ⭐ |
| ☐ | `eyes_surprised.png` | 惊讶圆眼 | ⭐ |

#### 嘴巴层 (mouth/)

| ✅ | 文件名 | 说明 | 优先级 |
|----|--------|------|--------|
| ☐ | `mouth_closed.png` | 闭嘴 | ⭐⭐ |
| ☐ | `mouth_smile.png` | 微笑 | ⭐⭐ |
| ☐ | `mouth_open.png` | 张嘴说话 | ⭐ |
| ☐ | `mouth_sad.png` | 悲伤嘴型 | ⭐ |
| ☐ | `mouth_pout.png` | 撅嘴 | ⭐ |

### 绘制要点

```
✏️ 瞳色处理：
   - 画一个基础瞳色（棕色）
   - 其他瞳色（蓝/绿/红/紫/金）由CSS滤镜生成

✏️ 脸红效果：
   - 不要直接画在脸部层
   - 用单独的 effect_blush.png 叠加

✏️ 眨眼动画：
   - 需要 eyes_open 和 eyes_closed 两张
   - CSS自动循环播放
```

### MVP最小集（Phase 1）

- [x] `face_normal.png`
- [x] `face_happy.png`
- [x] `face_sad.png`

---

## 4️⃣ 服装层 (clothes/)

### 上装 (clothes/top/)

| ✅ | 文件名 | 说明 | 优先级 | 场景 |
|----|--------|------|--------|------|
| ☐ | `top_default_tshirt.png` | 默认T恤 | ⭐⭐⭐ | 日常穿着 |
| ☐ | `top_school_uniform.png` | 学院制服 | ⭐⭐ | 学校场景 |
| ☐ | `top_casual_shirt.png` | 休闲衬衫 | ⭐⭐ | 商业街 |
| ☐ | `top_hoodie.png` | 连帽卫衣 | ⭐ | 休闲风 |
| ☐ | `top_coat_winter.png` | 冬季外套 | ⭐ | 冬天叠加 |
| ☐ | `top_dress.png` | 连衣裙上半 | ⭐ | 正式场合 |
| ☐ | `top_underwear_bra.png` | 内衣（胸罩） | ⭐ | 私密场景 |
| ☐ | `top_nightgown.png` | 睡衣上半 | ⭐ | 家/旅馆 |

### 下装 (clothes/bottom/)

| ✅ | 文件名 | 说明 | 优先级 | 配合上装 |
|----|--------|------|--------|----------|
| ☐ | `bottom_default_jeans.png` | 牛仔裤 | ⭐⭐⭐ | 搭配T恤 |
| ☐ | `bottom_school_skirt.png` | 学院短裙 | ⭐⭐ | 搭配制服 |
| ☐ | `bottom_casual_shorts.png` | 休闲短裤 | ⭐⭐ | 夏天穿 |
| ☐ | `bottom_dress.png` | 连衣裙下半 | ⭐ | 配合上半 |
| ☐ | `bottom_underwear_panties.png` | 内裤 | ⭐ | 私密场景 |
| ☐ | `bottom_nightgown.png` | 睡衣下半 | ⭐ | 配合睡衣上半 |

### 绘制要点

```
✏️ 分层逻辑（DOL风格）：
   - 每件衣服单独一层
   - 可叠加穿戴（内衣+衬衫+外套）
   - 上下装分离（可自由组合）

✏️ 适配体型：
   - 画在 body_female_normal 基础上
   - 其他体型自动拉伸/缩放

✏️ 细节处理：
   - 褶皱/阴影/高光
   - 与身体贴合（胸部/腰部轮廓）
```

### MVP最小集（Phase 1）

- [x] `top_default_tshirt.png`
- [x] `bottom_default_jeans.png`

---

## 5️⃣ 配饰层 (accessories/)

| ✅ | 文件名 | 说明 | 优先级 | 叠加层 |
|----|--------|------|--------|--------|
| ☐ | `accessory_glasses.png` | 眼镜 | ⭐ | 脸部上方 |
| ☐ | `accessory_hairpin.png` | 发卡 | ⭐ | 头发前层 |
| ☐ | `accessory_earrings.png` | 耳环 | ⭐ | 脸部旁 |
| ☐ | `accessory_necklace.png` | 项链 | ⭐ | 脖子 |
| ☐ | `accessory_collar.png` | 颈圈 | ⭐ | 特殊剧情 |
| ☐ | `accessory_watch.png` | 手表 | ⭐ | 手腕 |
| ☐ | `accessory_ring.png` | 戒指 | ⭐ | 手指 |

### MVP最小集（Phase 1）

- [ ] 暂不需要，Phase 2添加

---

## 6️⃣ 状态特效层 (effects/)

### 手绘特效

| ✅ | 文件名 | 说明 | 优先级 | 用途 |
|----|--------|------|--------|------|
| ☐ | `effect_blush.png` | 脸红效果 | ⭐⭐ | 害羞/兴奋 |
| ☐ | `effect_sweat.png` | 汗滴 | ⭐ | 紧张/运动 |
| ☐ | `effect_tears.png` | 眼泪 | ⭐ | 哭泣 |
| ☐ | `effect_bruise.png` | 淤青 | ⭐ | 战斗后 |
| ☐ | `effect_bandage.png` | 绷带 | ⭐ | 受伤 |
| ☐ | `effect_dirt.png` | 污渍 | ⭐ | 脏污状态 |

### 程序生成特效（不需要画！）

以下由JavaScript生成：
- ❤️ 爱心冒出（好感度↑）
- ✨ 闪光特效（升级）
- 💔 心碎（关系破裂）
- 🌀 眩晕圈（受伤）
- 💧 水滴（下雨天）

### MVP最小集（Phase 1）

- [x] `effect_blush.png`

---

## 🎮 二、小立绘/像素系统（⭐A区小立绘模式/D区/F1区/地图）

### 🔄 ⭐新功能：A区也能显示Q版！

```yaml
A区Q版显示需求:
  - 原始绘制: 48px × 96px (标准Q版全身)
  - A区放大显示: 128px × 256px (CSS缩放)
  - 缩放方式: image-rendering: pixelated; (保持像素锐利)
  - 动画要求: 需要更丰富的待机动画（呼吸/眨眼/小动作）
  - 表情同步: 与大立绘表情数据联动
```

### 📐 基础规格

```yaml
画布尺寸:
  - 头像: 32px × 32px
  - 全身: 48px × 96px (重点！A区需要这个)
  - 精灵图: 192px × 96px (4帧横排)
文件格式: PNG-8 (索引色，减小文件)
分辨率: 72 DPI
风格: 像素风（参考你的像素头像图集）
```

---

## 7️⃣ Q版头像 (chibi/head/)

### 组合方式（智能生成）

```
总组合数 = 性别(3) × 发型(6) × 发色(8) × 表情(6) = 864种

实际绘制方式：
1. 画基础模板 → 导出图层
2. 用脚本自动组合生成
```

### 基础模板

| ✅ | 文件名 | 说明 | 优先级 |
|----|--------|------|--------|
| ☐ | `base_female.png` | 女性脸型基础 | ⭐⭐⭐ |
| ☐ | `base_male.png` | 男性脸型基础 | ⭐ |
| ☐ | `base_futanari.png` | 扶她脸型基础 | ⭐ |

### 发型变体（像素风）

| ✅ | 文件名 | 说明 | 优先级 |
|----|--------|------|--------|
| ☐ | `hair_long.png` | 长发 | ⭐⭐⭐ |
| ☐ | `hair_short.png` | 短发 | ⭐⭐⭐ |
| ☐ | `hair_ponytail.png` | 单马尾 | ⭐⭐ |
| ☐ | `hair_twintails.png` | 双马尾 | ⭐⭐ |
| ☐ | `hair_bob.png` | 波波头 | ⭐ |
| ☐ | `hair_braid.png` | 麻花辫 | ⭐ |

### 表情变体（像素风）

| ✅ | 文件名 | 表情 | 优先级 |
|----|--------|------|--------|
| ☐ | `expr_normal.png` | 😐 平静 | ⭐⭐⭐ |
| ☐ | `expr_happy.png` | 😊 开心 | ⭐⭐⭐ |
| ☐ | `expr_sad.png` | 😢 悲伤 | ⭐⭐ |
| ☐ | `expr_angry.png` | 😠 生气 | ⭐⭐ |
| ☐ | `expr_shy.png` | 😳 害羞 | ⭐⭐ |
| ☐ | `expr_surprised.png` | 😮 惊讶 | ⭐⭐ |

### 发色调色板（索引色替换）

只画黑色底，程序替换颜色：

```
#000000 → 黑色
#5C4033 → 棕色
#FFD700 → 金色
#DC143C → 红色
#9932CC → 紫色
#4169E1 → 蓝色
#32CD32 → 绿色
#F0F0F0 → 白色
```

### MVP最小集（Phase 1）

- [x] 1个性别 × 1个发型 × 1个发色 × 6个表情 = 6张

---

## 8️⃣ Q版全身像 (chibi/fullbody/)

### ⭐A区显示专用待机动画（新增）

由于A区支持Q版显示，需要更生动的待机动画：

| ✅ | 文件名 | 说明 | 帧数 | 优先级 |
|----|--------|------|------|--------|
| ☐ | `idle_breath_01~02.png` | 呼吸动画 | 2帧 | ⭐⭐⭐ |
| ☐ | `idle_blink_01~03.png` | 眨眼动画 | 3帧 | ⭐⭐⭐ |
| ☐ | `idle_sway_01~04.png` | 轻微摇摆 | 4帧 | ⭐⭐ |
| ☐ | `idle_look_around_01~04.png` | 左右张望 | 4帧 | ⭐ |
| ☐ | `idle_yawn_01~05.png` | 打哈欠（疲劳时） | 5帧 | ⭐ |

### 站立姿势（静态基础）

| ✅ | 文件名 | 说明 | 优先级 |
|----|--------|------|--------|
| ☐ | `idle_front.png` | 站立正面 | ⭐⭐⭐ |
| ☐ | `idle_back.png` | 站立背面 | ⭐⭐ |
| ☐ | `idle_side_L.png` | 站立左侧 | ⭐⭐ |
| ☐ | `idle_side_R.png` | 站立右侧 | ⭐⭐ |

### 行走动画（4帧循环）

#### 正面行走

| ✅ | 文件名 | 说明 | 优先级 |
|----|--------|------|--------|
| ☐ | `walk_front_01.png` | 左脚抬起 | ⭐⭐⭐ |
| ☐ | `walk_front_02.png` | 双脚平行 | ⭐⭐⭐ |
| ☐ | `walk_front_03.png` | 右脚抬起 | ⭐⭐⭐ |
| ☐ | `walk_front_04.png` | 双脚平行 | ⭐⭐⭐ |

#### 其他方向（后期扩展）

- [ ] `walk_back_01~04.png` - 背面行走
- [ ] `walk_side_L_01~04.png` - 侧面行走（左）
- [ ] `walk_side_R_01~04.png` - 侧面行走（右）

### 精灵图格式（推荐）

将4帧合并成一张：

```
┌────────┬────────┬────────┬────────┐
│ Frame1 │ Frame2 │ Frame3 │ Frame4 │
│ 48×48  │ 48×48  │ 48×48  │ 48×48  │
└────────┴────────┴────────┴────────┘
总尺寸：192×48px
```

### MVP最小集（Phase 1）

- [x] `idle_front.png` × 1张
- [x] `walk_front_01~04.png` × 4张

---

## 9️⃣ Q版互动动作 (chibi/action/)

### 后期扩展

| ✅ | 文件名 | 说明 | 帧数 | 优先级 |
|----|--------|------|------|--------|
| ☐ | `wave_01~03.png` | 挥手打招呼 | 3帧 | ⭐ |
| ☐ | `sit.png` | 坐下 | 1帧 | ⭐ |
| ☐ | `sleep_01~02.png` | 睡觉（呼吸） | 2帧 | ⭐ |
| ☐ | `eat_01~03.png` | 吃东西 | 3帧 | ⭐ |
| ☐ | `run_01~06.png` | 跑步 | 6帧 | ⭐ |
| ☐ | `jump_01~04.png` | 跳跃 | 4帧 | ⭐ |

### MVP最小集（Phase 1）

- [ ] 暂不需要

---

## 📂 文件组织结构

### 最终目录树

```
assets/portraits/
├── body/
│   ├── body_base_nude.png
│   ├── body_female_slim.png
│   ├── body_female_normal.png          ← MVP必画
│   ├── body_female_athletic.png
│   └── body_female_plump.png
│
├── hair_back/
│   ├── hair_back_long.png              ← MVP必画
│   ├── hair_back_short.png             ← MVP必画
│   ├── hair_back_ponytail.png
│   ├── hair_back_twintails.png
│   ├── hair_back_bob.png
│   └── hair_back_braid.png
│
├── hair_front/
│   ├── hair_front_long.png             ← MVP必画
│   ├── hair_front_short.png            ← MVP必画
│   ├── hair_front_ponytail.png
│   ├── hair_front_twintails.png
│   ├── hair_front_bob.png
│   └── hair_front_braid.png
│
├── face/
│   ├── face_normal.png                 ← MVP必画
│   ├── face_happy.png                  ← MVP必画
│   ├── face_sad.png                    ← MVP必画
│   ├── face_angry.png
│   ├── face_shy.png
│   ├── face_surprised.png
│   ├── face_scared.png
│   ├── face_crying.png
│   └── face_smirk.png
│
├── clothes/
│   ├── top/
│   │   ├── top_default_tshirt.png      ← MVP必画
│   │   ├── top_school_uniform.png
│   │   ├── top_casual_shirt.png
│   │   └── ...
│   └── bottom/
│       ├── bottom_default_jeans.png    ← MVP必画
│       ├── bottom_school_skirt.png
│       └── ...
│
├── accessories/
│   ├── accessory_glasses.png
│   ├── accessory_hairpin.png
│   └── ...
│
├── effects/
│   ├── effect_blush.png                ← MVP必画
│   ├── effect_sweat.png
│   └── ...
│
└── chibi/
    ├── head/
    │   ├── base_female.png             ← MVP必画
    │   ├── hair_long.png               ← MVP必画
    │   ├── expr_normal.png             ← MVP必画
    │   ├── expr_happy.png              ← MVP必画
    │   ├── expr_sad.png                ← MVP必画
    │   ├── expr_angry.png              ← MVP必画
    │   ├── expr_shy.png                ← MVP必画
    │   └── expr_surprised.png          ← MVP必画
    │
    └── fullbody/
        ├── idle_front.png              ← MVP必画
        ├── walk_front_01.png           ← MVP必画
        ├── walk_front_02.png           ← MVP必画
        ├── walk_front_03.png           ← MVP必画
        └── walk_front_04.png           ← MVP必画
```

---

## ⚙️ 附录：程序实现部分（无需绘制）

### ⭐ A区立绘切换功能实现

#### HTML结构
```html
<!-- A区容器 -->
<div class="area-a" id="characterSprite">
    <!-- 切换按钮 -->
    <button class="portrait-toggle-btn" onclick="togglePortraitMode()">
        <span class="mode-icon">🎨</span> <!-- 大立绘模式显示🎮，Q版模式显示🎨 -->
    </button>

    <!-- 大立绘容器 -->
    <div class="portrait-large" id="portraitLarge">
        <!-- 分层PNG组合 -->
    </div>

    <!-- Q版立绘容器 -->
    <div class="portrait-chibi hidden" id="portraitChibi">
        <!-- 像素画精灵 -->
    </div>
</div>
```

#### CSS样式
```css
/* Q版在A区的放大显示 */
.area-a .portrait-chibi img {
    width: 128px;
    height: 256px;
    image-rendering: pixelated; /* 保持像素锐利 */
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

/* 切换动画 */
.portrait-large,
.portrait-chibi {
    transition: opacity 0.3s ease;
}

.hidden {
    opacity: 0;
    pointer-events: none;
    position: absolute;
}

/* 切换按钮 */
.portrait-toggle-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.portrait-toggle-btn:hover {
    background: rgba(139, 92, 246, 0.4);
    transform: scale(1.1);
}
```

#### JavaScript控制
```javascript
// 立绘模式管理
class PortraitModeManager {
    constructor() {
        this.currentMode = localStorage.getItem('portraitMode') || 'large';
        this.init();
    }

    init() {
        this.applyMode(this.currentMode);

        // 监听Tab键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.toggleMode();
            }
        });
    }

    toggleMode() {
        this.currentMode = this.currentMode === 'large' ? 'chibi' : 'large';
        this.applyMode(this.currentMode);

        // 保存偏好
        localStorage.setItem('portraitMode', this.currentMode);
        if (window.worldState) {
            window.worldState.state.ui.portraitMode = this.currentMode;
        }

        // 播放切换音效
        playSound('switch.mp3');
    }

    applyMode(mode) {
        const largeEl = document.getElementById('portraitLarge');
        const chibiEl = document.getElementById('portraitChibi');
        const btnIcon = document.querySelector('.mode-icon');

        if (mode === 'large') {
            largeEl.classList.remove('hidden');
            chibiEl.classList.add('hidden');
            btnIcon.textContent = '🎮'; // 显示Q版图标（可切换到Q版）
        } else {
            largeEl.classList.add('hidden');
            chibiEl.classList.remove('hidden');
            btnIcon.textContent = '🎨'; // 显示画板图标（可切换到大立绘）

            // 启动Q版待机动画
            this.startChibiAnimation();
        }
    }

    startChibiAnimation() {
        // 呼吸动画循环
        setInterval(() => {
            // 切换 idle_breath_01.png 和 idle_breath_02.png
        }, 2000);

        // 眨眼动画（随机间隔）
        setTimeout(() => {
            // 播放 idle_blink_01~03.png
        }, Math.random() * 5000 + 3000);
    }
}

// 全局实例
window.portraitModeManager = new PortraitModeManager();
```

### A. CSS滤镜颜色方案

#### 发色调整

你只需画黑色底色，以下颜色由CSS生成：

```css
/* 发色CSS变量 */
.hair-black   { --hair-hue: 0deg;   --hair-sat: 100%; --hair-bright: 100%; }
.hair-brown   { --hair-hue: 20deg;  --hair-sat: 80%;  --hair-bright: 100%; }
.hair-blonde  { --hair-hue: 40deg;  --hair-sat: 120%; --hair-bright: 130%; }
.hair-red     { --hair-hue: 350deg; --hair-sat: 150%; --hair-bright: 100%; }
.hair-purple  { --hair-hue: 280deg; --hair-sat: 100%; --hair-bright: 100%; }
.hair-blue    { --hair-hue: 200deg; --hair-sat: 100%; --hair-bright: 100%; }
.hair-green   { --hair-hue: 120deg; --hair-sat: 100%; --hair-bright: 100%; }
.hair-white   { --hair-hue: 0deg;   --hair-sat: 0%;   --hair-bright: 150%; }

/* 应用到头发层 */
.layer-hair-back,
.layer-hair-front {
    filter: hue-rotate(var(--hair-hue))
            saturate(var(--hair-sat))
            brightness(var(--hair-bright));
}
```

#### 肤色调整

你只需画fair白皙肤色，其他由CSS生成：

```css
.skin-pale   { --skin-hue: 0deg;  --skin-sat: 100%; --skin-bright: 110%; }
.skin-fair   { --skin-hue: 0deg;  --skin-sat: 100%; --skin-bright: 100%; }
.skin-medium { --skin-hue: 10deg; --skin-sat: 90%;  --skin-bright: 90%;  }
.skin-tan    { --skin-hue: 15deg; --skin-sat: 80%;  --skin-bright: 75%;  }
.skin-dark   { --skin-hue: 20deg; --skin-sat: 70%;  --skin-bright: 60%;  }

.layer-body {
    filter: hue-rotate(var(--skin-hue))
            saturate(var(--skin-sat))
            brightness(var(--skin-bright));
}
```

### B. CSS动画效果

以下动画由程序自动生成，**无需绘制帧**：

```css
/* 呼吸动画 */
@keyframes breathing {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.02); }
}

/* 眨眼动画 */
@keyframes blinking {
    0%, 90%, 100% { opacity: 1; }
    95% { opacity: 0; }
}

/* 心跳闪烁 */
@keyframes heartbeat {
    0%, 100% { opacity: 0.5; scale: 1; }
    50% { opacity: 1; scale: 1.05; }
}

/* 抖动 */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
}
```

你只需画：
- 眼睛睁开 × 1张
- 眼睛闭上 × 1张

程序自动循环播放眨眼！

### C. JavaScript粒子特效

以下特效完全由程序生成，**不需要画**：

```javascript
// 爱心冒出（好感度提升）
createParticle('❤️', { count: 5, duration: 1s });

// 汗珠滚落（紧张时）
createParticle('💧', { gravity: true, speed: 2 });

// 闪光特效（等级提升）
createParticle('✨', { count: 10, spread: 360deg });

// 心碎特效（关系破裂）
createParticle('💔', { count: 3, explode: true });

// 眩晕圈（受伤/喝醉）
createAnimation('dizzy', { rotate: true, duration: 2s });
```

---

## 📋 Phase 1 MVP清单（优先绘制 - 更新版）

### ⭐ 调整说明
由于A区支持大小立绘切换，Q版立绘优先级提升，MVP阶段可以选择：
- **方案A**：先做Q版（快速原型）
- **方案B**：大立绘+Q版并行（推荐）
- **方案C**：先大立绘后Q版（传统）

### ✅ 方案B：平衡开发（推荐）

#### 大立绘系统（10张，简化版）
- [ ] `body_female_normal.png` × 1
- [ ] `hair_back_long.png` × 1
- [ ] `hair_front_long.png` × 1
- [ ] `face_normal.png` × 1
- [ ] `face_happy.png` × 1
- [ ] `face_sad.png` × 1
- [ ] `top_default_tshirt.png` × 1
- [ ] `bottom_default_jeans.png` × 1
- [ ] `effect_blush.png` × 1

#### Q版系统（15张，完整版）
- [ ] `base_female.png` × 1
- [ ] `hair_long.png` × 1
- [ ] `expr_normal.png` × 1
- [ ] `expr_happy.png` × 1
- [ ] `expr_sad.png` × 1
- [ ] `expr_angry.png` × 1
- [ ] `expr_shy.png` × 1
- [ ] `expr_surprised.png` × 1
- [ ] `idle_front.png` × 1
- [ ] `idle_breath_01~02.png` × 2 ⭐新增
- [ ] `idle_blink_01~03.png` × 3 ⭐新增
- [ ] `walk_front_01~04.png` × 4

### 📊 总计：25张图（略增加但效果更好）

预估工时：2-3天（包含调整时间）

---

## 🎨 绘制工具推荐

### 大立绘

- **Procreate**（iPad，最佳）
- **Photoshop**（PC，专业）
- **Clip Studio Paint**（漫画风格）
- **Krita**（免费开源）

### 像素画

- **Aseprite**（最佳，$19.99）
- **Pixel Studio**（移动端免费）
- **GraphicsGale**（免费）
- **Piskel**（网页版免费）

---

## 📝 导出规范

### 大立绘导出设置

```yaml
格式: PNG-24
颜色模式: RGB
透明背景: 是
抗锯齿: 是
分辨率: 72 DPI
压缩: 推荐使用 TinyPNG 压缩（减小50%体积）
```

### 像素画导出设置

```yaml
格式: PNG-8（索引色）
颜色数: 256色以内
透明背景: 是
抗锯齿: 否（保持像素锐利）
缩放: 最近邻插值（Nearest Neighbor）
```

---

## 🚀 交付流程

### Step 1：绘制

按照优先级完成绘制

### Step 2：命名

严格按照本文档命名规则

### Step 3：导出

按照导出规范设置

### Step 4：压缩

使用 [TinyPNG](https://tinypng.com/) 压缩

### Step 5：提交

放入对应文件夹，通知开发者集成

---

## 📞 疑问联系

如有任何疑问，随时联系！

- 颜色/风格不确定 → 提供参考图
- 文件命名困惑 → 查看目录树示例
- 尺寸/规格不清楚 → 查看基础规格部分
- 技术实现疑问 → 查看附录程序部分

---

**祝绘制顺利！ヾ(≧▽≦*)o**

---

*文档版本：v1.0*
*最后更新：2025-10-02*
*维护者：Claude + User*
