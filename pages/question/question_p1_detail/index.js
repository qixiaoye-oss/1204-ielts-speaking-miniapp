const loadingProgress = require('../../../behaviors/loadingProgress')
const api = getApp().api
let audio = null
let timer = null
Page({
  behaviors: [loadingProgress],
  data: {
    audioPlayer: false,  // 全局音频播放状态
    showPopus: false,  // 打卡窗口
    idArr: [],
    animationData: '',
    itemList: ['打卡'],
    itemUrl: [''],
    seriesIndex: 0,
    menus: [],
    showUserRecord: false,
    userPublicRecords: []
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.setData({
      userPublicRecords: []
    })
    this.getData(true)
    if (!api.isEmpty(wx.getStorageSync('questionIdArr'))) {
      this.setData({
        idArr: wx.getStorageSync('questionIdArr')
      })
    }
  },
  onLoad(options) {
    this.setData({
      queryParam: options
    })
    audio = wx.createInnerAudioContext()
    audio.onPlay(() => {
      this.setData({
        audioPlayer: true
      })
    })
    audio.onEnded(() => {
      this.setData({
        audioPlayer: false,
      })
      this.resetSentenceAudioStatus()
      this.resetPublicAudioStatus()
    })
    audio.onError((err) => {
      api.audioErr(err, audio.src)
      // api.modal("", "本模块电脑版播放功能需要等待微信官方更新，目前手机/平板可以正常播放。", false)
    })
  },
  onUnload() {
    wx.removeStorageSync('questionIdArr')
    audio.destroy()
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  // 播放题目音频
  playMainAudio() {
    this.stopAudio()
    this.resetSentenceAudioStatus()
    this.resetPublicAudioStatus()
    const { audioUrl } = this.data.detail
    this.playAudio(audioUrl)
  },
  // 播放句子音频
  playSentenceAudio(e) {
    this.stopAudio()
    const { list } = this.data
    const { answerIndex, sentenceIndex } = e.currentTarget.dataset
    const audioUrl = list[answerIndex].list[sentenceIndex].audioUrl
    if (audioUrl) {
      this.playAudio(audioUrl)
      this.setData({
        [`list[${answerIndex}].list[${sentenceIndex}].playStatus`]: 'playing',
      })
    }
  },
  // 播放音频
  playAudio(path) {
    audio.src = path
    wx.nextTick(() => {
      audio.play()
      this.setData({
        audioPlayer: true
      })
    })
  },
  // 停止音频播放
  stopAudio() {
    if (this.data.audioPlayer) {
      audio.stop()
    }
    this.setData({
      audioPlayer: false,
    })
  },
  // 重置句子音频播放状态
  resetSentenceAudioStatus() {
    let list = this.data.list
    list.forEach((i) => {
      i.list.forEach((j) => {
        j.playStatus = 'none'
      })
    })
    this.setData({
      list: list
    })
  },
  resetPublicAudioStatus() {
    let { userPublicRecords } = this.data
    userPublicRecords.forEach(item => {
      item.player = 'stop'
    })
    this.setData({ userPublicRecords })
  },
  // 播放开放记录音频
  playUserAudio(e) {
    let { userPublicRecords } = this.data
    const { index } = e.currentTarget.dataset
    userPublicRecords.forEach(item => {
      item.player = 'stop'
    })
    this.setData({
      [`userPublicRecords[${index}].player`]: 'play'
    })
    this.playAudio(userPublicRecords[index].audioUrl)
  },

  // 录音并评分
  recordAndRate(e) {
    const { list, detail } = this.data
    let index = e.currentTarget.dataset.index
    let param = {
      type: 1,
      id: detail.id,
      childId: list[index].id
    }
    // 新版开始跟读
    wx.navigateTo({
      url: '/pages/question/ai_correction/index' + api.parseParams(param),
    })
  },
  //练习
  practice() {
    const _this = this
    const { menuNames, munuUrls } = this.data
    if (menuNames.length == 1) {
      _this.punching()
      return
    }
    wx.showActionSheet({
      itemList: menuNames,
      success: ((res) => {
        if (res.tapIndex == 0) {
          _this.punching()
        } else {
          wx.navigateTo({
            url: munuUrls[res.tapIndex]
          })
        }
      })
    })
  },
  // 打卡
  punching() {
    this.setData({
      showPopus: true
    })
  },
  popupCancel() {
    this.setData({
      showPopus: false
    })
  },
  // 上一题下一题
  changeQuestion(e) {
    let index = 0
    let animationData = ''
    if (e.detail.type === 'next') {
      index = this.data.index + 1
      animationData = 'right'
    } else {
      index = this.data.index - 1
      animationData = 'left'
    }
    this.setData({
      [`queryParam.id`]: this.data.idArr[index],
      animationData: animationData
    })
    this.stopAudio()
    wx.nextTick(() => {
      this.getData(true)
    })
  },
  switchChange(e) {
    const index = e.currentTarget.dataset.index
    const { list } = this.data
    for (let i = 0; i < list.length; i++) {
      list[i].isPreferred = i === index ? e.detail : false
    }
    this.setData({
      list: list
    })
    this.updatePin(index)
  },
  // 切换系列
  checkSeries(e) {
    let { seriesIndex, list, showUserRecord } = this.data
    const checkIndex = e.currentTarget.dataset.index
    list.forEach(item => {
      item.show = false
    })
    if (seriesIndex != checkIndex) {
      if (checkIndex <= (list.length - 1)) {
        list[checkIndex].show = true
        showUserRecord = false
      } else {
        showUserRecord = true
      }
      this.setData({
        showUserRecord: showUserRecord,
        seriesIndex: checkIndex,
        list: list
      })
    }
  },
  like(e) {
    const index = e.currentTarget.dataset.index
    const { userPublicRecords } = this.data
    let item = userPublicRecords[index]
    if (item.isLike) {
      item.isLike = false
      item.likeCount = item.likeCount - 1
    } else {
      item.isLike = true
      item.likeCount = item.likeCount + 1
    }
    this.setData({
      [`userPublicRecords[${index}].likeCount`]: item.likeCount,
      [`userPublicRecords[${index}].isLike`]: item.isLike
    })
    this.updateLike(item.id, 'like', item.isLike)
  },
  favorite(e) {
    const index = e.currentTarget.dataset.index
    const { userPublicRecords } = this.data
    let item = userPublicRecords[index]
    if (item.isFavorite) {
      item.isFavorite = false
      item.favoriteCount = item.favoriteCount - 1
    } else {
      item.isFavorite = true
      item.favoriteCount = item.favoriteCount + 1
    }
    this.setData({
      [`userPublicRecords[${index}].favoriteCount`]: item.favoriteCount,
      [`userPublicRecords[${index}].isFavorite`]: item.isFavorite
    })
    this.updateLike(item.id, 'favorite', item.isFavorite)
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    const _this = this
    api.request(this, '/question/v2/detail', {
      userId: api.getUserId(),
      setType: 1,
      ...this.data.queryParam
    }, isPull).then(res => {
      _this.createMenus()
      _this.createAnswerMenus()
      let idArr = this.data.idArr
      let index = idArr.indexOf(this.data.queryParam.id)
      this.setData({
        index: index,
        [`list[${this.data.seriesIndex}].show`]: true,
      })
      _this.listUserPublicAnswer()
    }).finally(() => { this.finishLoading() })
  },
  // 处理打卡菜单
  createMenus() {
    const { detail, list } = this.data
    let menuName = '打卡'
    let munuUrls = ['']
    let menuNames = ['打卡']
    if (detail.recordStatus === '1') {
      menuName = menuName + '/录音'
      munuUrls.push(`/pages/recording/single/p1/index?questionId=${detail.id}&setId=${this.options.setId}`)
      menuNames.push("录音")
      munuUrls.push(`/pages/recording/single/p1-history/index?questionId=${detail.id}&setId=${this.options.setId}`)
      menuNames.push("历史录音")
    }
    this.setData({
      menuName: menuName,
      munuUrls: munuUrls,
      menuNames: menuNames
    })
  },
  createAnswerMenus() {
    const { list } = this.data
    let menus = []
    list.forEach(item => {
      menus.push({
        title: item.title,
        isPreferred: item.isPreferred,
      })
    })
    menus.push({
      title: '用户回答',
      isPreferred: false
    })
    this.setData({
      menus: menus
    })
  },
  // 打卡请求
  popupConfirm(e) {
    api.request(this, '/question/signIn', {
      userId: api.getUserId(),
      setId: this.options.setId,
      resourceId: this.data.detail.id,
      type: 1,
    }, false, "POST").then(res => {
      api.toast("打卡成功")
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    })
  },
  // 保存P1答案选中
  updatePin(index) {
    const _this = this
    const { detail, list } = this.data
    api.request(this, '/v2/question/p1/answer/preferred', {
      userId: api.getUserId(),
      questionId: detail.id,
      answerId: list[index].id,
      isPreferred: list[index].isPreferred
    }, false, "GET").then(() => {
      _this.getData(false)
    })
  },
  // 获取公开用户回答
  listUserPublicAnswer() {
    const { userPublicRecords } = this.data
    api.request(this, '/v2/p1/single/public/record', {
      ...this.options,
      userId: api.getUserId(),
      pageNo: 1
    }, false, "GET").then(res => {
      this.setData({
        userPublicRecords: userPublicRecords.concat(res.records)
      })
    })
  },
  updateLike(id, operateType, flag) {
    api.request(this, '/v2/p1/single/public/update', {
      id: id,
      userId: api.getUserId(),
      operateType: operateType,
      functionType: flag ? 'add' : 'sub'
    }, false, "GET")
  },
  // ===========数据获取 End===========
})
