const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
let timer
let manager
let audio
Page({
  behaviors: [loadingProgress],
  // ===========生命周期 Start===========
  data: {
    nowTime: 0,
    status: 0,
    file: {
      time: "",
      url: "",
      duration: 0
    },
    audioStatus: "stop",
    duration: 0
  },
  onLoad(options) {
    audio = wx.createInnerAudioContext()
    audio.onEnded(() => {
      this.stopAudio()
    })
    audio.onError((res) => {
      console.log(res);
    })

    manager = wx.getRecorderManager()
    manager.onStop(res => {
      audio.src = res.tempFilePath
      let time = api.formatTime(new Date())
      this.setData({
        duration: res.duration,
        [`file.time`]: time,
        [`file.url`]: res.tempFilePath,
        status: 2,
      })
      clearInterval(timer)
    })
    manager.onError((res) => {
      api.recorderErr("P1单题", res.errMsg)
    })
    manager.onStart(() => {
      this.startRecording()
    })
    wx.enableAlertBeforeUnload({
      message: "未保存录音退出将丢失录音文件，是否退出？",
    });
  },
  onShow() {
    this.startLoading()
    this.fetchQuestionDetail(true)
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record'
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    audio.stop()
    manager.stop()
    clearInterval(timer)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  checkRecordPermission() {
    const that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.record']) {
          that.initRecorder()
        } else {
          api.toast("未开启麦克风权限无法进行录音")
        }
      }
    })
  },
  initRecorder() {
    manager.start({
      duration: 60000,
      sampleRate: 48000,
      numberOfChannels: 1,
      encodeBitRate: 320000,
      format: 'mp3',
      frameSize: 50
    })
  },
  startRecording() {
    this.setData({
      status: 1,
      nowTime: Date.now(),
    })
    this.recordingTimer()
    this.playQuestionAudio()
  },
  stopRecording() {
    this.setData({
      status: 2,
    })
    manager.stop()
    clearInterval(timer)
  },
  recordingTimer() {
    timer = setInterval(() => {
      const { nowTime } = this.data
      const difference = Date.now() - nowTime;
      this.setData({
        [`file.duration`]: Math.round(difference / 1000)
      })
    }, 100);
  },
  playQuestionAudio() {
    if (this.data.detail.audioUrl) {
      audio.src = this.data.detail.audioUrl
      this.playAudio()
    }
  },
  playAudio() {
    audio.play()
    audio.duration
    this.setData({
      audioStatus: 'play'
    })
  },
  stopAudio() {
    if (!audio.paused) {
      audio.stop()
    }
    this.setData({
      audioStatus: 'stop'
    })
  },
  cancel() {
    wx.navigateBack()
  },
  confirm() {
    if (api.isEmpty(this.data.file.url)) {
      api.toast("没有录音需要保存");
      return
    }
    api.upload(this.data.file.url, '/oral/recording/', this).then(res => {
      this.save(res)
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  fetchQuestionDetail(isPull) {
    api.request(this, '/v2/p1/detail', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).finally(() => {
      this.finishLoading()
    })
  },
  save(audioUrl) {
    let param = {
      userId: api.getUserId(),
      questionId: this.options.id,
      audioUrl: audioUrl,
      recordingTime: this.data.file.time,
      duration: this.data.duration
    }
    api.request(this, '/v2/p1/single/save', param, true, "POST").then(res => {
      wx.disableAlertBeforeUnload()
      wx.navigateBack()
    })
  },
})
