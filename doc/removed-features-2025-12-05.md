# 已移除功能记录 (2025-12-05)

本文档记录了 2025年12月5日 进行的代码清理工作，移除了暂时不用的页面和功能。

## 移除概览

| 类别 | 移除项目数 | 删除文件数 | 减少代码行数 |
|------|-----------|-----------|-------------|
| 视频功能 | 3个页面 | 12个文件 | ~600行 |
| 练习功能 | 4个页面 | 16个文件 | ~1100行 |
| 随机练习功能 | 2个页面 | 8个文件 | ~500行 |
| P1/P2练习录音 | 4个页面 | 16个文件 | ~1660行 |
| 素材块训练功能 | 4个页面 | 16个文件 | ~1140行 |
| **合计** | **17个页面** | **68个文件** | **~5000行** |

---

## 1. 视频功能 (pages/video)

### 移除的目录
```
pages/video/
├── set-list/          # 视频集列表
├── video-list/        # 视频列表
└── video-detail/      # 视频详情
```

### 移除的引用
- `app.json`: 移除3个页面注册
- `app.json`: 移除 t-video 插件配置
- `pages/home/home.js`: 移除 VIDEO 路由映射

### 原功能说明
视频学习功能，用户可以浏览视频集、查看视频列表、播放视频详情。

---

## 2. 练习功能 (pages/practice)

### 移除的目录
```
pages/practice/
├── set-list/          # 练习集列表
├── menu-list/         # 练习菜单
├── recording/         # 练习录音
└── record_detail/     # 练习记录详情
```

### 移除的引用
- `app.json`: 移除4个页面注册
- `pages/home/home.js`: 移除 BASIC 路由映射

### 原功能说明
基础练习功能，提供练习集浏览、练习菜单、录音练习和记录查看。

---

## 3. P3随机练习功能 (pages/random-practice)

### 移除的目录
```
pages/random-practice/
├── history-p3/        # P3随机练习历史
└── practice-p3/       # P3随机练习
```

### 移除的引用
- `app.json`: 移除2个页面注册
- `pages/question/set-p2p3-list/index.js`: 移除 randomPractice 函数
- `pages/question/set-p2p3-list/index.wxml`: 移除"P3随机练"按钮
- `pages/question/set-p2p3-list/index.wxss`: 移除 .random-practice 样式

### 原功能说明
P3部分的随机练习功能，用户可以随机抽取P3题目进行练习。

---

## 4. P1/P2练习录音功能 (pages/question/recording-*)

### 移除的目录
```
pages/question/
├── recording-p1/           # P1练习录音
├── recording-p1-record/    # P1练习录音记录
├── recording-p2/           # P2练习录音
└── recording-p2-record/    # P2练习录音记录
```

### 移除的引用
- `app.json`: 移除4个页面注册
- `pages/question/question-p1-detail/index.js`: 移除练习菜单入口代码
- `pages/question/question-p2-detail/index.js`: 移除练习菜单入口代码

### 原功能说明
P1/P2问题详情页中的"练习"功能，用户可以针对特定答案进行录音练习。
该功能已被 `pages/recording` 目录下的录音功能替代。

---

## 5. 素材块训练功能 (pages/p2-block & pages/p3-block)

### 移除的目录
```
pages/p2-block/
├── recording/         # P2素材块录音训练
└── record_detail/     # P2素材块训练记录

pages/p3-block/
├── recording/         # P3素材块录音训练
└── record_detail/     # P3素材块训练记录
```

### 移除的引用
- `app.json`: 移除4个页面注册
- `pages/p2-block/block-detail/index.js`: 移除 punching 函数
- `pages/p3-block/block-detail/index.js`: 移除 punching 和 toPracticePage 函数

### 功能替代
- `pages/p2-block/block-detail`: 底部按钮改为"返回"按钮
- `pages/p3-block/block-detail`: 底部按钮改为"返回"按钮

### 原功能说明
P2/P3素材块详情页中的"训练"功能，用户可以对素材块内容进行录音训练。

---

## 相关重命名

在本次清理中，同时对 `pages/recording` 目录进行了重命名以符合功能语义：

| 原目录名 | 新目录名 | 说明 |
|---------|---------|------|
| record_answer_p3 | p3_record | P3录音 |
| record | p2_record | P2录音 |
| questions_recording | p1_multirecord | P1多题录音 |
| questions_record_list | p1_multirecord_list | P1多题录音列表 |
| questions_record_detail | history_record_detail | 历史录音详情 |
| list | p2p3_record_list | P2/P3录音列表 |

---

## 恢复说明

如需恢复以上功能，可通过 Git 历史记录找回：

```bash
# 查看移除前的提交
git log --oneline

# 恢复特定目录
git checkout <commit-hash> -- pages/video/
```

---

## 更新日志

- **2025-12-05**: 初始文档创建，记录本次代码清理工作
