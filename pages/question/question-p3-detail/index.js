const loadingProgress = require('../../../behaviors/loadingProgress')
const api = getApp().api
let audio = null
let timer = null
Page({
  behaviors: [loadingProgress],
  data: {
    showPopus: false,
    showReportModal: false,
    answerId: "",
    idArr: [],
    animationData: '',
    audioPlayer: false,
    tagLength: 0
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
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
      console.log('开始播放', new Date().getTime());
      this.setData({
        audioPlayer: true
      })
    })
    audio.onEnded(() => {
      this.resetSentenceAudioStatus()
      this.setData({
        audioPlayer: false,
      })
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
  playMainAudio() {
    this.stopAudio()
    this.resetSentenceAudioStatus()
    this.setData({
      audioPlayer: false,
    })
    this.playAudio(this.data.detail.audioUrl)
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
    const resetStatus = (data) => {
      return data.map(item => {
        if (item.list && item.list.length > 0) {
          return {
            ...item,
            list: resetStatus(item.list)
          };
        } else {
          return {
            ...item,
            playStatus: 'none'
          };
        }
      });
    };
    this.setData({
      list: resetStatus(this.data.list)
    })
  },
  // 点击句子播放
  playSentence(e) {
    const { list } = this.data
    const { answerIndex, groupIndex, sentenceIndex } = e.currentTarget.dataset
    let sentence = list[answerIndex].list[groupIndex].list[sentenceIndex]
    if (sentence.audioUrl) {
      this.stopAudio()
      this.resetSentenceAudioStatus()
      this.playAudio(sentence.audioUrl)
      let path = `list[${answerIndex}].list[${groupIndex}].list[${sentenceIndex}].playStatus`;
      this.setData({
        [path]: 'playing',
      })
    }
  },
  // 录音并评分
  recordAndRate(e) {
    let list = this.data.list
    let index = e.currentTarget.dataset.index
    let param = {
      type: 3,
      id: this.data.detail.id,
      childId: list[index].id
    }
    // 新版开始跟读
    wx.navigateTo({
      url: '/pages/question/ai-correction/index' + api.parseParams(param),
    })
  },
  gotoMaterialBlock(e) {
    wx.setStorageSync('materialIdBySort', [e.currentTarget.dataset.id])
    let item = {
      type: 5,
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/p3-block/block-detail/index' + api.parseParams(item),
    })
  },
  recordingOrClocking() {
    const _this = this
    wx.showActionSheet({
      itemList: ['仅打卡', '录音', '历史录音（' + this.data.recordingCount + '）条'],
      success: ((res) => {
        let param = {
          userId: api.getUserId(),
          type: 3,
          ...this.data.queryParam
        }
        if (res.tapIndex === 0) {
          _this.punching()
        }
        if (res.tapIndex === 1) {
          _this.toRecording(param)
        }
        if (res.tapIndex === 2) {
          _this.toRecordList(param)
        }
      })
    })
  },
  toRecording(param) {
    wx.navigateTo({
      url: '/pages/recording/p3-record/index' + api.parseParams(param),
    })
  },
  toRecordList(param) {
    wx.navigateTo({
      url: '/pages/recording/p1p2p3-record-list/index' + api.parseParams(param),
    })
  },
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
  audioBtn(e) {
    let id = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除音频'],
      success: ((res) => {
        if (res.tapIndex === 0) {
          this.delRecording(id)
        }
      })
    })
  },
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
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    api.request(this, '/question/v2/detail', {
      userId: api.getUserId(),
      setType: 3,
      ...this.data.queryParam
    }, isPull).then(() => {
      const { queryParam, idArr } = this.data
      this.setData({
        index: idArr.indexOf(queryParam.id),
      })
    }).finally(() => { this.finishLoading() })
  },
  popupConfirm(e) {
    api.request(this, '/question/signIn', {
      userId: api.getUserId(),
      resourceId: this.data.detail.id,
      type: 3,
      setId: this.options.setId
    }, false, "POST").then(res => {
      api.toast("打卡成功")
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    })
  },
  // ===========数据获取 End===========
})
