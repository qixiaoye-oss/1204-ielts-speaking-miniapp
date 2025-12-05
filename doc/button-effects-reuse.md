# 按钮及卡片点击动效复用指南

## 概述

本文档说明按钮和卡片点击动效的实现方式，与参考项目 `ielts-listening-jijing-miniapp` 保持一致。

## 核心实现

### 1. 点击效果样式

在 `style/button-group.wxss` 中定义了通用点击效果：

```css
/* 通用点击效果 - 用于按钮和卡片 */
.tap-active {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.1s ease-out;
}
```

### 2. 组件封装

#### btn-action 组件

位置：`components/btn-action/`

```
components/btn-action/
├── index.js
├── index.json
├── index.wxml
└── index.wxss
```

**index.wxml:**
```xml
<view class="btn-action btn--{{type}}" hover-class="tap-active" bindtap="onTap">
  <slot></slot>
</view>
```

**index.wxss:**
```css
@import "/style/button-group.wxss";

.tap-active {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.1s ease-out;
}
```

**index.js:**
```javascript
const app = getApp()

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    type: {
      type: String,
      value: ''
    }
  },
  data: {},
  methods: {
    onTap(e) {
      this.triggerEvent('tap', e.detail)
    }
  }
})
```

#### btn-action-icon 组件

位置：`components/btn-action-icon/`

结构与 `btn-action` 相同，使用 `btn-action-icon` 样式类。

## 使用方式

### 方式一：使用组件（推荐）

1. 在页面 json 中注册组件：

```json
{
  "usingComponents": {
    "btn-action": "/components/btn-action/index",
    "btn-action-icon": "/components/btn-action-icon/index"
  }
}
```

2. 在页面中使用：

```xml
<btn-action type="audio" bind:tap="play">
  <view>播放</view>
  <image src="/image/play.png"></image>
</btn-action>

<btn-action-icon type="setting" bind:tap="openSettings">
  <image src="/image/setting.png"></image>
</btn-action-icon>
```

### 方式二：直接使用类名

在 view 上直接应用样式类和 hover-class：

```xml
<view class="btn-action btn--audio" hover-class="tap-active" bind:tap="play">
  <view>播放</view>
  <image src="/image/play.png"></image>
</view>

<view class="btn-action-icon btn--setting" hover-class="tap-active" bind:tap="openSettings">
  <image src="/image/setting.png"></image>
</view>
```

### 方式三：卡片点击效果

为可点击的卡片添加 hover-class：

```xml
<view class="home-sub-item" hover-class="tap-active" bind:tap="onClick">
  <!-- 卡片内容 -->
</view>
```

## 按钮类型（type 属性）

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

## 已应用点击效果的文件

- `components/styled/but-item/index.wxml` - but-item 组件
- `pages/home/home.wxml` - 首页卡片
- `pages/practice/recording/recording.wxml` - 练习录音页
- `pages/question/recording-p1/index.wxml` - P1录音页
- `pages/question/recording-p2/index.wxml` - P2录音页

## 注意事项

1. 在组件内部使用 hover-class 时，样式必须在组件的 wxss 中定义
2. 页面中直接使用时，确保已引入 `button-group.wxss`
3. 动效参数：opacity 0.7, scale 0.98, transition 0.1s ease-out
