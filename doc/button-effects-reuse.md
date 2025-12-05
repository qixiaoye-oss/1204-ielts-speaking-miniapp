# 按钮与点击动效复用指南

## 概述

本项目实现了与参考项目 `ielts-listening-jijing-miniapp` 一致的按钮及卡片点击动效系统。

## 核心功能

1. **缩放 + 透明度变化**的触摸反馈效果
2. **三种点击效果类型**：按钮、卡片、列表项
3. **两个可复用组件**：`btn-action` 和 `btn-action-icon`
4. **9种功能色按钮**：audio、correct、label、recording、practice、exercise、visible、setting、list

## 文件结构

```
components/
  ├── btn-action/           # 带文字的按钮组件
  │   ├── index.js
  │   ├── index.json
  │   ├── index.wxml
  │   └── index.wxss
  ├── btn-action-icon/      # 纯图标按钮组件
  │   ├── index.js
  │   ├── index.json
  │   ├── index.wxml
  │   └── index.wxss
  └── styled/
      └── but-item/         # 封装的按钮组件（已集成动效）

style/
  └── theme.wxss            # 按钮样式和点击动效定义
```

## 点击效果样式

在 `style/theme.wxss` 中定义了三种点击效果：

```css
/* 按钮点击反馈效果 */
.tap-active {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.1s ease-out;
}

/* 卡片点击效果（适用于首页卡片等大元素） */
.card-active {
  opacity: 0.85;
  transform: scale(0.99);
  transition: all 0.1s ease-out;
}

/* 列表项点击效果 */
.list-active {
  opacity: 0.8;
  background-color: rgba(0, 0, 0, 0.03);
  transition: all 0.1s ease-out;
}
```

## 使用方式

### 方式一：直接使用类名（推荐简单场景）

在可点击元素上添加 `hover-class` 和 `hover-stay-time` 属性：

```html
<!-- 按钮 -->
<view class="btn-action btn--audio"
      hover-class="tap-active"
      hover-stay-time="100"
      bind:tap="onTap">
  <view>播放</view>
  <image src="/image/play.png"></image>
</view>

<!-- 卡片 -->
<view class="home-sub-item"
      hover-class="card-active"
      hover-stay-time="100"
      bind:tap="toDetail">
  <!-- 卡片内容 -->
</view>

<!-- 列表项 -->
<view class="chapter"
      hover-class="list-active"
      hover-stay-time="100"
      bind:tap="toUnit">
  <!-- 列表内容 -->
</view>
```

### 方式二：使用 btn-action 组件

**1. 在页面 JSON 中注册组件**

```json
{
  "usingComponents": {
    "btn-action": "/components/btn-action/index",
    "btn-action-icon": "/components/btn-action-icon/index"
  }
}
```

**2. 在 WXML 中使用**

```html
<!-- 带文字按钮 -->
<btn-action type="audio" bind:tap="playAudio">
  <view>播放音频</view>
  <image src="/image/play.png"></image>
</btn-action>

<!-- 纯图标按钮 -->
<btn-action-icon type="audio" bind:tap="playAudio">
  <image src="/image/play.png"></image>
</btn-action-icon>
```

### 方式三：使用封装的 but-item 组件

```html
<but text="播放" pattern="base" img-url="/image/play.png" bind:change="onPlay"></but>
<but text="确认" pattern="correct" img-url="/image/check.png" bind:change="onConfirm"></but>
<but text="开始录音" pattern="label" img-url="/image/talk.png" bind:change="startRecord"></but>
```

## 功能色按钮类型

| 类型 | 类名 | 颜色 | 用途 |
|------|------|------|------|
| audio | `.btn--audio` | #00A6ED (蓝色) | 音频播放相关 |
| correct | `.btn--correct` | #00D26A (绿色) | 确认/正确操作 |
| label | `.btn--label` | #F8312F (红色) | 标签/开始录音 |
| recording | `.btn--recording` | #212121 (深灰) | 录音相关 |
| practice | `.btn--practice` | #433B6B (紫色) | 练习相关 |
| exercise | `.btn--exercise` | #533566 (深紫) | 练习题目 |
| visible | `.btn--visible` | #7D4533 (棕色) | 显示/隐藏 |
| setting | `.btn--setting` | #998EA4 (灰紫) | 设置相关 |
| list | `.btn--list` | #FFB02D (橙色) | 列表相关 |

## 按钮组布局

### 上下结构布局

```html
<view class="btn-group-layout-split">
  <view class="btn-group-layout-split__header">
    <!-- 头部按钮 -->
  </view>
  <view class="btn-group-layout-split__divider"></view>
  <view class="btn-group-layout-split__footer">
    <!-- 底部按钮 -->
  </view>
</view>
```

### 单行居中布局

```html
<view class="btn-group-layout-inline-center">
  <btn-action type="audio">播放</btn-action>
  <btn-action type="correct">确认</btn-action>
</view>
```

## 注意事项

1. **hover-stay-time="100"**：设置 100ms 的保持时间，提供快速反馈
2. **组件路径**：确保组件路径正确，使用绝对路径 `/components/...`
3. **固定底部按钮**：使用 `.btn-page-bottom` 类，并设置 `z-index: 100` 避免层级冲突
4. **禁用状态**：使用 `.dis` 或 `.btn--dis` 类添加禁用样式

## 已应用的页面

- `pages/home/home.wxml` - 首页卡片
- `pages/question/recording-p1/index.wxml` - P1录音按钮
- `pages/question/recording-p2/index.wxml` - P2录音按钮
- `pages/practice/recording/recording.wxml` - 练习录音按钮
- `pages/question/set-p1-list/index.wxml` - P1题目列表
- `pages/question/set-p2p3-list/index.wxml` - P2/P3题目列表
- `components/styled/but-item/index.wxml` - 封装按钮组件
