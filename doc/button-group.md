# 按钮组样式库 (Button Group Styles)

微信小程序通用按钮组 **CSS 样式工具类库**，提供固定底部容器、多种布局模式和蒙版功能。

> **注意**：这是一个纯 CSS 样式库，不是微信小程序自定义组件。
> 通过 `@import` 引入样式后，直接在 wxml 中使用 CSS 类名即可。

## 版本

**当前版本：** v2.0.0
**发布日期：** 2025-12-10

## 特性

- 纯 CSS 实现，无需 js/json/wxml 文件
- **data-icon 图标颜色自动映射** (v2.0 新增)
- **btn-pos-* 按钮位置类** (v2.0 新增)
- **tap-action 组件支持** (v2.0 新增)
- 固定底部按钮组容器（含蒙版A和蒙版B）
- 双层结构布局（split）
- 单行居中布局（inline-center）
- 基础按钮样式（带图标、纯图标）
- 10种功能色彩类
- 按钮动画（shake样式）
- 零外部依赖，开箱即用
- CSS变量配置，灵活自定义

---

## 快速开始

### 1. 引入样式

在 `app.wxss` 中已引入按钮组样式：

```css
@import "style/button-group.wxss";
```

### 2. 注册组件

在页面或全局 `app.json` 中注册 `tap-action` 组件：

```json
{
  "usingComponents": {
    "tap-action": "/components/tap-action/index"
  }
}
```

### 3. 使用示例

#### 示例1：使用 tap-action 组件 (推荐)

```xml
<view class="btn-page-bottom">
  <view class="btn-group-layout-inline-center">
    <tap-action icon="play" bind:tap="onPlay">
      <view>播放</view>
      <image src="/images/v2/play_bt.png"></image>
    </tap-action>
    <tap-action icon="correct" bind:tap="onSubmit">
      <view>提交</view>
      <image src="/images/v2/correct_bt.png"></image>
    </tap-action>
  </view>
</view>
```

#### 示例2：双层按钮组

```xml
<view class="btn-page-bottom">
  <view class="btn-group-layout-split">
    <!-- 上层：主要操作 -->
    <view class="btn-group-layout-split__header">
      <view class="btn-pos-left">
        <tap-action icon="play" bind:tap="onPlay">
          <view>播放</view>
          <image src="/images/v2/play_bt.png"></image>
        </tap-action>
      </view>
      <view class="btn-pos-right">
        <tap-action icon="correct" bind:tap="onSubmit">
          <view>提交</view>
          <image src="/images/v2/correct_bt.png"></image>
        </tap-action>
      </view>
    </view>

    <!-- 分割线 -->
    <view class="btn-group-layout-split__divider"></view>

    <!-- 下层：辅助操作 -->
    <view class="btn-group-layout-split__footer">
      <tap-action icon="setting" bind:tap="openSettings">
        <image src="/images/v2/setting_bt.png"></image>
      </tap-action>
      <tap-action icon="list" bind:tap="showList">
        <view>列表</view>
        <image src="/images/v2/list_bt.png"></image>
      </tap-action>
    </view>
  </view>
</view>
```

#### 示例3：卡片点击效果

```xml
<tap-action type="card" bind:tap="onCardClick">
  <view class="my-card">
    <!-- 卡片内容 -->
  </view>
</tap-action>
```

---

## tap-action 组件

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | String | `'button'` | 模式：`'button'` 或 `'card'` |
| `icon` | String | `''` | 图标名称，用于自动颜色映射 |
| `disabled` | Boolean | `false` | 是否禁用 |
| `throttle` | Number | `300` | 节流间隔(ms)，0 表示不节流 |

### icon 颜色映射

使用 `icon` 属性可自动应用对应的颜色样式：

| icon 值 | 颜色 | 用途 |
|---------|------|------|
| `play`, `pause`, `save`, `replay`, `restart`, `submit`, `next`, `goto`, `updown` | 蓝色 #00A6ED | 音频、导航操作 |
| `correct` | 绿色 #00D26A | 正确、确认 |
| `flag` | 红色 #F8312F | 标记、标签 |
| `visible`, `hidden` | 棕色 #7D4533 | 显示/隐藏 |
| `list` | 橙色 #FFB02E | 列表操作 |
| `setting` | 灰紫 #998EA4 | 设置 |
| `me` | 深紫 #533566 | 个人中心 |

---

## 按钮位置类

### 单层布局中使用

```xml
<view class="btn-group-layout-inline-center">
  <view class="btn-pos-left">
    <!-- 左侧按钮 -->
  </view>
  <view class="btn-pos-right">
    <!-- 右侧按钮 -->
  </view>
</view>
```

### 位置类说明

| 类名 | 说明 |
|------|------|
| `.btn-pos-left` | 左对齐，自动 `margin-right: auto` |
| `.btn-pos-right` | 右对齐，自动 `margin-left: auto` |
| `.btn-pos-center` | 居中对齐 |

---

## 布局选择指南

| 布局类型 | 类名 | 适用场景 |
|---------|------|---------|
| **单层布局** | `btn-group-layout-inline-center` | 1-3个按钮，所有按钮同等重要 |
| **双层布局** | `btn-group-layout-split` | 4+个按钮，或需区分主次操作 |

---

## 样式架构

### `.btn-page-bottom` - 固定底部容器

完整的固定底部按钮组容器，包含三个核心部分：

| 部分 | 实现 | 作用 |
|------|------|------|
| 容器 | `.btn-page-bottom` | 固定定位在视窗底部 |
| 蒙版A | `::before` | 白色背景，覆盖到视窗底部 |
| 蒙版B | `::after` | 白色渐变，平滑视觉过渡 |

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
--button-group-z-index: 100;

/* 蒙版配置 */
--button-group-mask-bg: #FFFFFF;
--button-group-mask-gradient-height: 15px;
```

---

## 兼容性

### 旧版组件

为保持向后兼容，旧版 `btn-action` 和 `btn-action-icon` 组件仍可使用：

```xml
<!-- 旧版用法（仍然有效） -->
<btn-action type="audio" bind:tap="onPlay">
  <view>播放</view>
  <image src="/images/v2/play_bt.png"></image>
</btn-action>
```

### 推荐迁移

建议逐步迁移到 `tap-action` 组件，以获得：
- 内置防抖机制
- icon 颜色自动映射
- card 模式支持
- disabled 属性支持

---

## 文件结构

```
style/
  button-group.wxss    # 按钮组样式库（核心）

components/
  tap-action/          # 统一点击组件（推荐）
    index.wxml
    index.wxss
    index.js
    index.json
  btn-action/          # 旧版按钮组件（兼容）
  btn-action-icon/     # 旧版图标按钮组件（兼容）

doc/
  button-group.md      # 本文档
```

---

## 更新日志

### v2.0.0 (2025-12-10)
- 完全迁移自参考项目 (1203-ielts-listening-training-miniapp)
- 新增 `tap-action` 组件，支持 button 和 card 两种模式
- 新增 `icon` 属性颜色自动映射功能
- 新增 `btn-pos-left/right/center` 位置类
- 新增内置防抖机制 (throttle)
- 新增 `disabled` 属性支持
- 保留旧版 `btn-action`/`btn-action-icon` 组件兼容性

### v1.6.0 (2025-12-05)
- 完全对齐参考项目架构
- 移除 `but-list` 和 `but-item` 封装组件

### v1.5.1 (2025-12-04)
- 从参考项目迁移规范化样式
- 统一 CSS 变量命名
- 添加完整蒙版系统

---

## 许可证

内部项目使用
