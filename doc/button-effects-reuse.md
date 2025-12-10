# 按钮及卡片点击动效复用指南

## 概述

本文档说明按钮和卡片点击动效的实现方式，与参考项目 `1203-ielts-listening-training-miniapp` 保持一致。

## 核心实现

### 1. tap-action 组件 (推荐)

位置：`components/tap-action/`

这是统一的点击组件，支持两种模式：

- **button 模式**：带样式的按钮，支持 icon 颜色自动映射
- **card 模式**：仅提供点击效果，样式由父组件控制

### 2. 点击效果样式

在 `style/button-group.wxss` 中定义：

```css
.tap-active {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.1s ease-out;
}
```

## 使用方式

### 方式一：使用 tap-action 组件 (推荐)

1. 在页面 json 中注册组件：

```json
{
  "usingComponents": {
    "tap-action": "/components/tap-action/index"
  }
}
```

2. 在页面中使用：

```xml
<!-- 按钮模式 - 自动颜色映射 -->
<tap-action icon="play" bind:tap="onPlay">
  <view>播放</view>
  <image src="/image/v2/play_bt.png"></image>
</tap-action>

<!-- 按钮模式 - 禁用状态 -->
<tap-action icon="submit" disabled="{{isSubmitting}}" bind:tap="onSubmit">
  <view>提交</view>
  <image src="/image/v2/submit_bt.png"></image>
</tap-action>

<!-- 卡片模式 -->
<tap-action type="card" bind:tap="onCardClick">
  <view class="my-card">卡片内容</view>
</tap-action>
```

### 方式二：使用旧版组件 (兼容)

```xml
<btn-action type="audio" bind:tap="onPlay">
  <view>播放</view>
  <image src="/image/play.png"></image>
</btn-action>

<btn-action-icon type="setting" bind:tap="openSettings">
  <image src="/image/setting.png"></image>
</btn-action-icon>
```

### 方式三：直接使用类名

在 view 上直接应用样式类和 hover-class：

```xml
<view class="btn-action" data-icon="play" hover-class="tap-active" bind:tap="onPlay">
  <view>播放</view>
  <image src="/image/v2/play_bt.png"></image>
</view>

<view class="my-card" hover-class="tap-active" bind:tap="onCardClick">
  <!-- 卡片内容 -->
</view>
```

## tap-action 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | String | `'button'` | 模式：`'button'` 或 `'card'` |
| `icon` | String | `''` | 图标名称，自动映射颜色 |
| `disabled` | Boolean | `false` | 是否禁用 |
| `throttle` | Number | `300` | 节流间隔(ms)，0 表示不节流 |

## icon 颜色映射

| icon 值 | 颜色 | 用途 |
|---------|------|------|
| `play`, `pause`, `save`, `replay`, `restart`, `submit`, `next`, `goto`, `updown` | 蓝色 #00A6ED | 音频、导航 |
| `correct` | 绿色 #00D26A | 正确、确认 |
| `flag` | 红色 #F8312F | 标记、标签 |
| `visible`, `hidden` | 棕色 #7D4533 | 显示/隐藏 |
| `list` | 橙色 #FFB02E | 列表操作 |
| `setting` | 灰紫 #998EA4 | 设置 |
| `me` | 深紫 #533566 | 个人中心 |

## 旧版 type 属性 (兼容)

旧版 `btn-action` 组件支持的 type 值：

| type | 描述 | 颜色 |
|------|------|------|
| audio | 音频播放 | 蓝色 #00A6ED |
| correct | 正确确认 | 绿色 #00D26A |
| wrong | 错误删除 | 红色 #F92F60 |
| list | 列表导航 | 黄色 #FFB02D |
| setting | 设置配置 | 紫灰 #998EA4 |
| visible | 显示隐藏 | 棕色 #7D4533 |
| label | 标记标签 | 红色 #F8312F |
| recording | 录音相关 | 黑色 #212121 |
| practice | 练习模式 | 深紫 #433B6B |
| exercise | 习题练习 | 紫色 #533566 |

## 注意事项

1. **推荐使用 tap-action 组件**：获得内置防抖、icon 映射等功能
2. 在组件内部使用 hover-class 时，样式必须在组件的 wxss 中定义
3. 页面中直接使用时，确保已引入 `button-group.wxss`
4. 动效参数：opacity 0.7, scale 0.98, transition 0.1s ease-out
5. 防抖默认 300ms，可通过 `throttle` 属性调整
