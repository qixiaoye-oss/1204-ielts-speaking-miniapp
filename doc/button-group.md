# 按钮组样式库 (Button Group Styles)

微信小程序通用按钮组 **CSS 样式工具类库**，提供固定底部容器、多种布局模式和蒙版功能。

> **注意**：这是一个纯 CSS 样式库，不是微信小程序自定义组件。
> 通过 `@import` 引入样式后，直接在 wxml 中使用 CSS 类名即可。

## 版本

**当前版本：** v1.6.0
**发布日期：** 2025-12-05

## 特性

- 纯 CSS 实现，无需 js/json/wxml 文件
- 高度灵活，自由组合结构和样式
- 固定底部按钮组容器（含蒙版A和蒙版B）
- 双层结构布局（split）
- 单行居中布局（inline-center）
- 三分式布局（tripartite）
- 基础按钮样式（带图标、纯图标）
- 10种功能色彩类
- 零外部依赖，开箱即用
- CSS变量配置，灵活自定义
- 完整的蒙版系统，平滑视觉过渡

---

## 快速开始

### 1. 引入样式

在 `app.wxss` 中已引入按钮组样式：

```css
@import "style/button-group.wxss";
```

### 2. 使用按钮组

#### 示例1：单层按钮组（1-3个按钮）

适用于按钮数量较少且同等重要的场景。

```xml
<view class="btn-page-bottom">
  <view class="btn-group-layout-inline-center">
    <view class="btn-action btn--correct" bindtap="submit">
      <view>提交</view>
      <image src="/images/submit.png"></image>
    </view>
  </view>
</view>
```

#### 示例2：双层按钮组（4个以上或需区分主次）

适用于按钮较多或需要区分主次操作的场景。

```xml
<view class="btn-page-bottom">
  <view class="btn-group-layout-split">
    <!-- 上层：主要操作 -->
    <view class="btn-group-layout-split__header">
      <view class="btn-action btn--audio" bindtap="play">
        <view>播放</view>
        <image src="/images/play.png"></image>
      </view>
      <view class="btn-action btn--correct" bindtap="submit">
        <view>提交</view>
        <image src="/images/submit.png"></image>
      </view>
    </view>

    <!-- 分割线 -->
    <view class="btn-group-layout-split__divider"></view>

    <!-- 下层：辅助操作 -->
    <view class="btn-group-layout-split__footer">
      <view class="btn-action-icon btn--setting" bindtap="openSettings">
        <image src="/images/setting.png"></image>
      </view>
      <view class="btn-action btn--list" bindtap="showList">
        <view>列表</view>
        <image src="/images/list.png"></image>
      </view>
    </view>
  </view>
</view>
```

---

## 布局选择指南

### 单层布局 vs 双层布局

| 布局类型 | 类名 | 适用场景 |
|---------|------|---------|
| **单层布局** | `btn-group-layout-inline-center` | 1-3个按钮，所有按钮同等重要 |
| **双层布局** | `btn-group-layout-split` | 4+个按钮，或需区分主次操作 |

### 常见错误

**错误用法**：使用 `btn-group-layout-split` 但只放 `__footer`

```xml
<!-- 错误：只有单层内容却用双层布局 -->
<view class="btn-group-layout-split">
  <view class="btn-group-layout-split__footer">
    <view class="btn-action btn--audio">播放</view>
  </view>
</view>
```

**正确用法**：

```xml
<!-- 正确：单层内容用单层布局 -->
<view class="btn-group-layout-inline-center">
  <view class="btn-action btn--audio">播放</view>
</view>
```

---

## 样式架构

### `.btn-page-bottom` - 固定底部容器

完整的固定底部按钮组容器，包含三个核心部分：

| 部分 | 实现 | 作用 |
|------|------|------|
| 容器 | `.btn-page-bottom` | 固定定位在视窗底部 |
| 蒙版A | `::before` | 白色背景，覆盖到视窗底部 |
| 蒙版B | `::after` | 白色渐变，平滑视觉过渡 |

### 按钮组布局

| 类名 | 用途 | 适用场景 |
|------|------|---------|
| `.btn-group-layout-split` | 双层结构 | 按钮数量 > 3 或需要区分层级 |
| `.btn-group-layout-inline-center` | 单行居中 | 按钮数量 ≤ 3 且同等重要 |
| `.btn-group-layout-tripartite` | 三分式 | 左/中/右 三段布局 |

### 按钮样式

| 类名 | 用途 | 包含内容 |
|------|------|---------|
| `.btn-action` | 带文字和图标的按钮 | 文字 + 图标 |
| `.btn-action-icon` | 纯图标按钮 | 仅图标 |

### 功能色彩类

| 类名 | 颜色 | 用途 |
|------|------|------|
| `.btn--audio` | 蓝色 #00A6ED | 音频播放相关 |
| `.btn--correct` | 绿色 #00D26A | 正确答案、确认 |
| `.btn--wrong` | 红色 #F92F60 | 错误答案、删除 |
| `.btn--list` | 黄色 #FFB02D | 列表、导航 |
| `.btn--setting` | 紫灰 #998EA4 | 设置、配置 |
| `.btn--visible` | 棕色 #7D4533 | 显示/隐藏切换 |
| `.btn--label` | 红色 #F8312F | 标记、标签 |
| `.btn--recording` | 黑色 #212121 | 录音相关 |
| `.btn--practice` | 深紫 #433B6B | 练习模式 |
| `.btn--exercise` | 紫色 #533566 | 习题练习 |
| `.btn--dis` | 透明度0.3 | 禁用状态 |

---

## 按钮组件

本项目提供了两个基础按钮组件，与参考项目保持一致：

### `<btn-action>` 组件

带文字和图标的按钮，通过 `type` 属性设置颜色样式。

```xml
<!-- 在页面 json 中引入 -->
{
  "usingComponents": {
    "btn-action": "/components/btn-action/index",
    "btn-action-icon": "/components/btn-action-icon/index"
  }
}

<!-- 在 wxml 中使用 -->
<view class="btn-page-bottom">
  <view class="btn-group-layout-inline-center">
    <btn-action type="practice" bindtap="onTap">
      <view>练习</view>
      <image src="/image/v2/practice.png"></image>
    </btn-action>
  </view>
</view>
```

**支持的 type 值**：
- `audio` - 蓝色（音频相关）
- `correct` - 绿色（确认）
- `wrong` - 红色（错误）
- `list` - 黄色（列表）
- `setting` - 紫灰（设置）
- `label` - 红色（标签）
- `recording` - 黑色（录音）
- `practice` - 深紫（练习）
- `exercise` - 紫色（习题）
- `quit` - 灰色边框（退出）

### `<btn-action-icon>` 组件

纯图标按钮，用法类似：

```xml
<btn-action-icon type="audio" bindtap="onTap">
  <image src="/image/v2/play.png"></image>
</btn-action-icon>
```

### 禁用状态

通过添加 `btn--dis` 类名实现禁用效果：

```xml
<btn-action type="audio" bindtap="onTap" class="{{disabled ? 'btn--dis' : ''}}">
  <view>播放</view>
  <image src="/image/v2/play.png"></image>
</btn-action>
```

### 角标徽章

使用 `btn-corner-mark` 类名：

```xml
<btn-action type="recording" bindtap="onTap">
  <view>录音</view>
  <image src="/image/v2/recording.png"></image>
  <view class="btn-corner-mark btn--recording-corner-mark">5</view>
</btn-action>
```

---

## 自定义配置

### 覆盖默认配置

在 `app.wxss` 或页面 `wxss` 中覆盖 CSS 变量：

```css
page {
  /* 修改边框颜色 */
  --button-group-border-color: #CCCCCC;

  /* 修改蒙版背景色 */
  --button-group-mask-bg: #F5F5F5;

  /* 修改按钮间距 */
  --button-group-gap: 20px;

  /* 修改功能色彩 */
  --button-color-audio: #0088CC;
}
```

### 可配置变量列表

```css
/* 基础配置 */
--button-group-border-width: 1px;
--button-group-border-color: rgba(0, 0, 0, 0.3);
--button-group-border-radius: 9px;
--button-group-padding: 15px;
--button-group-gap: 15px;

/* 按钮配置 */
--button-font-size: 15px;
--button-line-height: 15px;
--button-padding: 5px;
--button-border-radius: 3px;
--button-icon-size: 25px;
--button-icon-margin: 5px;

/* 固定底部配置 */
--button-group-bottom-distance: 20px;
--button-group-left-distance: 20px;
--button-group-right-distance: 20px;
--button-group-z-index: 1000;

/* 蒙版配置 */
--button-group-mask-bg: #FFFFFF;
--button-group-mask-gradient-height: 15px;
```

---

## 高度计算

为避免固定底部按钮组遮挡内容，需要为页面内容设置 `padding-bottom`：

| 布局类型 | 按钮组高度 | 推荐 padding-bottom |
|---------|-----------|---------------------|
| 单层按钮组 | ~67px | 82px (67 + 15) |
| 双层按钮组 | ~110px | 125px (110 + 15) |

---

## 文件结构

```
style/
  button-group.wxss    # 按钮组样式库（核心）

components/
  btn-action/          # 带文字图标的按钮组件
    index.wxml
    index.wxss
    index.js
    index.json
  btn-action-icon/     # 纯图标按钮组件
    index.wxml
    index.wxss
    index.js
    index.json

doc/
  button-group.md      # 本文档
```

---

## 更新日志

### v1.6.0 (2025-12-05)
- 完全对齐参考项目架构
- 移除 `but-list` 和 `but-item` 封装组件
- 页面直接使用原生样式类 + `btn-action`/`btn-action-icon` 组件
- 组件内直接 `@import` 样式文件，确保样式正确生效

### v1.5.1 (2025-12-04)
- 从参考项目迁移规范化样式
- 统一 CSS 变量命名
- 添加完整蒙版系统
- 按钮圆角调整为 3px
- 添加三分式布局支持
- 创建完整使用文档

---

## 许可证

内部项目使用
