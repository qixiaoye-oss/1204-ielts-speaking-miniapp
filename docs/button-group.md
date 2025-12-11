# 按钮组样式文档 (Button Group Style)

> 文件位置: `style/button-group.wxss`
> 版本: 2.0.0
> 更新日期: 2025-12-11

## 概述

按钮组件的 CSS 样式文件，用于管理按钮组、按钮等元素的样式。支持多种按钮类型、位置和状态。

## 主要特性

- 纯 CSS 实现，无需 js/json/wxml 文件
- data-icon 图标颜色自动映射
- 固定底部按钮组容器（含蒙版）
- 多种布局方式（split、inline-center）
- 按钮角标自动继承图标主色

---

## 1. 按钮组布局

### 1.1 底部固定按钮组

```html
<view class="btn-page-bottom">
  <view class="btn-group-layout-inline-center">
    <tap-action icon="controller" bind:tap="handleTap">
      <view>按钮文字</view>
      <image src="/images/v2/controller_bt.png"></image>
    </tap-action>
  </view>
</view>
```

### 1.2 单行居中布局

```html
<view class="btn-group-layout-inline-center">
  <tap-action icon="play">播放</tap-action>
  <tap-action icon="pause">暂停</tap-action>
</view>
```

### 1.3 双层结构布局 (split)

```html
<view class="btn-group-layout-split">
  <view class="btn-group-layout-split__header">
    <view class="btn-pos-left">左侧按钮</view>
    <view class="btn-pos-right">右侧按钮</view>
  </view>
  <view class="btn-group-layout-split__divider"></view>
  <view class="btn-group-layout-split__footer">
    底部内容
  </view>
</view>
```

---

## 2. tap-action 组件与 data-icon

`tap-action` 组件通过 `icon` 属性设置图标类型，自动映射对应颜色。

### 2.1 图标颜色映射表

| icon 值 | 颜色 | 色值 | 用途 |
|---------|------|------|------|
| `controller` | 紫色 | #433B6B | 练习/打卡 |
| `desktop_mic` | 黑色 | #212121 | 录音 |
| `play` / `pause` / `save` / `go` | 蓝色 | #00A6ED | 音频播放 |
| `correct` | 绿色 | #00D26A | 正确答案 |
| `flag` / `medal` | 红色 | #F8312F | 标记 |
| `list` | 橙色 | #FFB02E | 列表 |
| `setting` | 灰紫 | #998EA4 | 设置 |

### 2.2 使用示例

```html
<tap-action icon="controller" bind:tap="handleTap">
  <view>打卡/录音</view>
  <image src="/images/v2/controller_bt.png"></image>
</tap-action>
```

---

## 3. 按钮角标 (Corner Mark)

按钮角标用于显示数量提示（如录音数量）。

### 3.1 基础用法

```html
<tap-action icon="controller" bind:tap="handleTap">
  <view>打卡/录音</view>
  <image src="/images/v2/controller_bt.png"></image>
  <view class="btn-corner-mark" wx:if="{{count > 0}}">{{count}}</view>
</tap-action>
```

### 3.2 颜色自动继承

角标颜色会**自动继承**父元素 `data-icon` 的主色，无需手动指定颜色类或 inline style。

**CSS 规则：**

```css
/* 角标颜色 - 自动继承 data-icon 主色 */
[data-icon="controller"] .btn-corner-mark {
  color: #433B6B;
  border-color: #433B6B;
}

[data-icon="desktop_mic"] .btn-corner-mark {
  color: #212121;
  border-color: #212121;
}

[data-icon="save"] .btn-corner-mark,
[data-icon="play"] .btn-corner-mark,
[data-icon="go"] .btn-corner-mark {
  color: #00A6ED;
  border-color: #00A6ED;
}
```

### 3.3 角标颜色对照表

| 父元素 icon | 角标颜色 | 色值 |
|-------------|----------|------|
| `controller` | 紫色 | #433B6B |
| `desktop_mic` | 黑色 | #212121 |
| `save` / `play` / `go` | 蓝色 | #00A6ED |

### 3.4 兼容旧版（不推荐）

旧版通过添加颜色类实现，现已不推荐使用：

```html
<!-- 旧版写法 - 不推荐 -->
<view class="btn-corner-mark btn--recording-corner-mark">{{count}}</view>
<view class="btn-corner-mark btn--practice-corner-mark">{{count}}</view>
```

---

## 4. 按钮位置

```html
<view class="btn-group-layout-split__header">
  <view class="btn-pos-left">左侧按钮组</view>
  <view class="btn-pos-center">居中按钮组</view>
  <view class="btn-pos-right">右侧按钮组</view>
</view>
```

---

## 5. 按钮状态

### 5.1 禁用状态

```html
<tap-action icon="go" disabled="{{true}}">
  <image src="/images/v2/go_bt.png"></image>
</tap-action>
```

### 5.2 点击反馈

`tap-action` 组件内置点击反馈动画（opacity + scale）。

---

## 6. CSS 变量

可在 `app.wxss` 中覆盖以下变量自定义样式：

```css
page {
  --button-group-border-radius: 9px;
  --button-group-padding: 15px;
  --button-group-gap: 15px;
  --button-font-size: 15px;
  --button-icon-size: 25px;
  --button-group-bottom-distance: 20px;
}
```

---

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 2.0.0 | 2025-12-11 | 新增角标颜色自动继承 data-icon 主色 |
| 2.0.0 | 2025-12-10 | 迁移自参考项目，新增 data-icon 颜色映射 |
