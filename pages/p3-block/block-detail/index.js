const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
let audio = null
let timer = null
Page({
  behaviors: [loadingProgress],
  data: {
    blockIndex: 0,
    audioStatus: 'stop',
    showReportModal: false,
    animationData: '',
    audioPlayer: false,
    tagLength: 0,
    idArr: [],
    maxWidth: ''
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.setData({ queryParam: this.options })
    this.getData(true)
    if (!api.isEmpty(wx.getStorageSync('materialIdBySort'))) {
      this.setData({
        idArr: wx.getStorageSync('materialIdBySort')
      })
    }
  },
  onLoad(options) {
    audio = wx.createInnerAudioContext()
    audio.onPlay(() => {
      console.log('开始播放', new Date().getTime());
    })
    audio.onEnded(() => {
      this.resetSentenceAudioStatus()
    })
    audio.onError((err) => {
      api.audioErr(err, audio.src)
      // api.modal("", "本模块电脑版播放功能需要等待微信官方更新，目前手机/平板可以正常播放。", false)
    })
  },
  onUnload() {
    wx.removeStorageSync('materialIdBySort')
    audio.stop()
    audio.destroy()
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  // 点击句子播放
  playSentence(e) {
    const { paragraphIndex, sentenceIndex } = e.currentTarget.dataset
    const { list } = this.data
    // 2、没有开启跟读则停止正在播放的音频，播放点击的句子，如果存在句子音频
    let sentence = list[paragraphIndex].list[sentenceIndex]
    if (sentence.audioUrl) {
      this.stopAudio()
      this.resetSentenceAudioStatus()
      this.playAudio(sentence.audioUrl)
      let path = `list[${paragraphIndex}].list[${sentenceIndex}].playStatus`;
      this.setData({
        [path]: 'playing',
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
  changeQuestion(e) {
    let index = 0
    let animationData = ''
    if (e.detail.type === 'next') {
      index = this.data.blockIndex + 1
      animationData = 'right'
    } else {
      index = this.data.blockIndex - 1
      animationData = 'left'
    }
    this.stopAudio()
    this.resetSentenceAudioStatus()
    this.setData({
      [`queryParam.id`]: this.data.idArr[index],
      blockIndex: index,
      animationData: animationData
    })
    wx.nextTick(() => {
      this.getData(true)
    })
  },
  goBack() {
    wx.navigateBack()
  },
  popupCancel() {
    this.setData({
      showPopus: false
    })
  },
  // 录音并评分
  recordAndRate() {
    const { detail } = this.data
    let param = {
      type: 5,
      id: detail.id,
      childId: detail.id
    }
    // 新版开始跟读
    wx.navigateTo({
      url: '/pages/question/ai-correction/index' + api.parseParams(param),
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    this.setData({ maxWidth: '' })
    api.request(this, '/material/v2/getDetail', {
      userId: api.getUserId(),
      ...this.data.queryParam
    }, isPull).then(() => {
      const { queryParam, idArr } = this.data
      this.setData({
        blockIndex: idArr.indexOf(queryParam.id),
      })
    }).finally(() => { this.finishLoading() })
  },
  popupConfirm(e) {
    api.request(this, '/question/signIn', {
      userId: api.getUserId(),
      setId: this.options.setId,
      resourceId: this.data.detail.id,
      type: 5
    }, false, "POST").then(res => {
      api.toast("打卡成功")
      // setTimeout(() => {
      //   wx.navigateBack()
      // }, 2000)
    })
  },
  // ===========数据获取 End===========
})