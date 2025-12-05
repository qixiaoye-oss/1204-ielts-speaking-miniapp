const loadingProgress = require('../../../behaviors/loadingProgress')
const api = getApp().api
let audio = null
let timer = null
Page({
  behaviors: [loadingProgress],
  data: {
    showPopus: false,
    audioPlayer: false,
    seriesIndex: 0
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.getData(true)
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
    const { answerIndex, sentenceIndex } = e.currentTarget.dataset
    let sentence = list[answerIndex].list[sentenceIndex]
    if (sentence.audioUrl) {
      this.stopAudio()
      this.resetSentenceAudioStatus()
      this.playAudio(sentence.audioUrl)
      let path = `list[${answerIndex}].list[${sentenceIndex}].playStatus`;
      this.setData({
        [path]: 'playing',
      })
    }
  },
  // 录音并评分
  recordAndRate(e) {
    const { list, detail } = this.data
    let index = e.currentTarget.dataset.index
    let param = {
      type: 2,
      id: detail.id,
      childId: list[index].id
    }
    // 新版开始跟读
    wx.navigateTo({
      url: '/pages/question/reading/reading' + api.parseParams(param),
    })
  },
  gotoStoryBlock(e) {
    let item = {
      type: 4,
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/p2-block/block-group/index' + api.parseParams(item),
    })
  },
  recordingOrClocking() {
    const { detail, seriesIndex, seriesList, color, backgroundColor, recordId } = this.data
    let itemList = ['仅打卡']
    let itemUrl = ['']
    itemList.push('录音')
    itemList.push('历史录音（' + this.data.recordingCount + '）条')
    let param = {
      userId: api.getUserId(),
      type: 2,
      setId: this.options.setId,
      color: color,
      background: backgroundColor
    }
    itemUrl.push('/pages/recording/p2_record/index' + api.parseParams(param))
    itemUrl.push('/pages/recording/p2p3_record_list/index' + api.parseParams(param))
    const _this = this
    wx.showActionSheet({
      itemList: itemList,
      success: ((res) => {
        if (res.tapIndex === 0) {
          _this.punching()
        } else {
          wx.navigateTo({
            url: itemUrl[res.tapIndex],
          })
        }
      })
    })
  },
  toRecordList(param) {
    wx.navigateTo({
      url: '/pages/recording/p2p3_record_list/index' + api.parseParams(param),
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
  // 切换系列
  checkSeries(e) {
    const { seriesIndex } = this.data
    const checkIndex = e.currentTarget.dataset.index
    if (seriesIndex != checkIndex) {
      this.setData({
        seriesIndex: checkIndex
      })
      this.getStoryData()
    }
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    const _this = this
    api.request(this, '/question/v3/detail', {
      userId: api.getUserId(),
      setType: 2,
      ...this.data.queryParam
    }, isPull).then(() => {
      _this.getStoryData(true)
    }).finally(() => { this.finishLoading() })
  },
  getStoryData(isPull) {
    const { detail, seriesList, seriesIndex } = this.data
    let param = {
      userId: api.getUserId(),
      setId: this.options.setId,
      id: detail.id,
    }
    if (seriesList.length > 0) {
      param['seriesId'] = seriesList[seriesIndex].id
    }
    api.request(this, '/question/v3/detail/story', param, isPull)
  },
  popupConfirm(e) {
    api.request(this, '/question/signIn', {
      userId: api.getUserId(),
      resourceId: this.data.detail.id,
      type: 2,
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
