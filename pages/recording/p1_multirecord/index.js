const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
let timer
let manager
let audio
Page({
  behaviors: [loadingProgress],
  // ===========生命周期 Start===========
  data: {
    pageUnload: false,
    recorderManagerConfig: {
      duration: 240000,
      sampleRate: 48000,
      numberOfChannels: 1,
      encodeBitRate: 320000,
      format: 'mp3',
      frameSize: 50
    },
    nowTime: 0,
    status: 0,
    file: {
      time: "",
      url: "",
      duration: 0
    },
    audioStatus: "stop",
    duration: 0,
    nowPlayAudioIndex: 0,
    recordingTime: 0
  },
  onLoad(options) {
    // 音频控件
    audio = wx.createInnerAudioContext()
    audio.onEnded(() => {
      this.stopAduio()
    })
    audio.onError((res) => {
      console.log(res);
    })
    manager = wx.getRecorderManager()
    manager.onStop((res) => {
      audio.src = res.tempFilePath
      let time = api.formatTime(new Date())
      this.setData({
        duration: res.duration,
        [`file.time`]: time,
        [`file.url`]: res.tempFilePath,
        [`file.duration`]: this.data.recordingTime,
        status: 2,
      })
      clearInterval(timer)
      this.confirm()
    })
    manager.onError((res) => {
      // api.modal("录音模块启动失败", res.errMsg, false)
      api.recorderErr("连续录音", res.errMsg)
    })
    manager.onStart(() => {
      console.log("开始录音监听")
      this.updateData()
    })
    wx.enableAlertBeforeUnload({
      message: "未保存录音退出将丢失录音文件，是否退出？",
    });
  },
  onShow() {
    this.startLoading()
    this.listData(true)
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
   * 生命周期函数--监听页面隐藏
   */
  onHide() { },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.setData({ pageUnload: true })
    audio.stop()
    if (manager) {
      manager.stop()
    }
    clearInterval(timer)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  gatUserAuthor() {
    const { recorderManagerConfig } = this.data
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.record']) {
          console.log("权限验证通过，开始录音")
          manager.start(recorderManagerConfig)
        } else {
          api.toast("未开启麦克风权限无法进行录音")
        }
      }
    })
  },
  updateData() {
    this.setData({
      status: 1,
      nowTime: Date.now(),
      [`newList[0].finish`]: true
    })
    this.startTimer()
    this.startPlayingQuesionAudio()
  },
  nextRecoding() {
    let palyIndex = this.data.nowPlayAudioIndex + 1
    audio.src = this.data.list[palyIndex]
    let path = `newList[` + palyIndex + `].finish`
    this.setData({
      nowPlayAudioIndex: palyIndex,
      [path]: true
    })
    this.playAudio()
  },
  stopRecoding() {
    this.setData({ status: 2, pageUnload: false })
    manager.stop()
    clearInterval(timer)
  },
  startTimer() {
    timer = setInterval(() => {
      const startTime = this.data.nowTime
      const difference = Date.now() - startTime;
      this.setData({
        recordingTime: Math.round(difference / 1000)
      })
    }, 100);
  },
  startPlayingQuesionAudio() {
    audio.src = this.data.list[this.data.nowPlayAudioIndex]
    this.playAudio()
  },
  playAudio() {
    audio.play()
    audio.duration
    this.setData({
      audioStatus: 'play'
    })
  },
  stopAduio() {
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
    if (this.data.pageUnload) {
      return
    }
    if (api.isEmpty(this.data.file.url)) {
      api.toast("没有录音需要保存");
      return
    }
    api.upload(this.data.file.url, '/oral/continuousRecording/', this).then(res => {
      this.save(res)
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/question/listAudioUrl', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(({ list }) => {
      // 使用 map 方法来创建新的列表
      const newList = list.map(item => ({
        src: item,
        finish: false
      }));
      // 更新数据
      this.setData({ newList });
    }).finally(() => {
      this.finishLoading()
    })
  },
  save(audioUrl) {
    let param = {
      userId: api.getUserId(),
      type: this.options.type,
      setId: this.options.setId,
      audioUrl: audioUrl,
      recordingTime: this.data.file.time,
      duration: this.data.duration
    }
    api.request(this, '/recording/save2Continuous', param, true, "POST").then(res => {
      wx.disableAlertBeforeUnload()
      wx.navigateBack()
    })
  },
})