/**
 * 统一单题录音页面
 * 支持 P1/P2/P3 三种类型，通过 type 参数区分
 */
const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')

// 页面配置表
const CONFIG = {
  1: {
    errorTag: 'P1',
    detailApi: '/v2/p1/detail',
    saveApi: '/v2/p1/single/save',
    uploadPath: '/oral/recording/',
    getSaveParam: (options, file, duration) => ({
      userId: api.getUserId(),
      questionId: options.id,
      audioUrl: '',
      recordingTime: file.time,
      duration: duration
    })
  },
  2: {
    errorTag: 'P2',
    detailApi: '/question/detailNoAnswer',
    saveApi: '/recording/save',
    uploadPath: '/oral/recording/',
    getSaveParam: (options, file, duration) => ({
      userId: api.getUserId(),
      type: options.type,
      setId: options.setId,
      resourceId: options.id,
      audioUrl: '',
      recordingTime: file.time,
      duration: duration
    })
  },
  3: {
    errorTag: 'P3',
    detailApi: '/question/v2/p3/audios',
    saveApi: '/recording/save',
    uploadPath: '/oral/continuousRecording/',
    getSaveParam: (options, file, duration) => ({
      userId: api.getUserId(),
      type: options.type,
      setId: options.setId,
      resourceId: options.id,
      audioUrl: '',
      recordingTime: file.time,
      duration: duration
    })
  }
}

// 录音配置（统一120秒）
const RECORDER_CONFIG = {
  duration: 120000,
  sampleRate: 48000,
  numberOfChannels: 1,
  encodeBitRate: 320000,
  format: 'mp3',
  frameSize: 50
}

let timer = null
let manager = null
let audio = null

Page({
  behaviors: [loadingProgress],

  data: {
    recordType: 1,
    nowTime: 0,
    status: 0,
    file: {
      time: '',
      url: '',
      duration: 0
    },
    audioStatus: 'stop',
    duration: 0
  },

  onLoad(options) {
    const recordType = parseInt(options.recordType) || 1
    this.setData({
      recordType,
      color: options.color,
      background: options.background
    })

    this.initAudio()
    this.initRecorder()

    wx.enableAlertBeforeUnload({
      message: '未保存录音退出将丢失录音文件，是否退出？'
    })
  },

  onShow() {
    this.startLoading()
    this.fetchQuestionDetail(true)
    this.checkRecordAuth()
  },

  onUnload() {
    if (audio) {
      audio.stop()
    }
    if (manager) {
      manager.stop()
    }
    if (timer) {
      clearInterval(timer)
    }
  },

  // =========== 初始化 ===========
  initAudio() {
    audio = wx.createInnerAudioContext()
    audio.onEnded(() => {
      this.stopAudio()
    })
    audio.onError((res) => {
      console.log('音频错误:', res)
    })
  },

  initRecorder() {
    const config = CONFIG[this.data.recordType]
    manager = wx.getRecorderManager()

    manager.onStop((res) => {
      audio.src = res.tempFilePath
      const time = api.formatTime(new Date())
      this.setData({
        duration: res.duration,
        'file.time': time,
        'file.url': res.tempFilePath,
        status: 2
      })
      clearInterval(timer)
    })

    manager.onError((res) => {
      api.recorderErr(config.errorTag, res.errMsg)
    })

    manager.onStart(() => {
      this.startRecording()
    })
  },

  checkRecordAuth() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({ scope: 'scope.record' })
        }
      }
    })
  },

  // =========== 录音操作 ===========
  checkRecordPermission() {
    const that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.record']) {
          manager.start(RECORDER_CONFIG)
        } else {
          api.toast('未开启麦克风权限无法进行录音')
        }
      }
    })
  },

  startRecording() {
    this.setData({
      status: 1,
      nowTime: Date.now()
    })
    this.recordingTimer()
    this.playQuestionAudio()
  },

  stopRecording() {
    this.setData({ status: 2 })
    manager.stop()
    clearInterval(timer)
  },

  recordingTimer() {
    timer = setInterval(() => {
      const { nowTime } = this.data
      const difference = Date.now() - nowTime
      this.setData({
        'file.duration': Math.round(difference / 1000)
      })
    }, 100)
  },

  // =========== 音频播放 ===========
  playQuestionAudio() {
    const { recordType, detail, list } = this.data
    let audioUrl = ''

    if (recordType === 3 && list && list.length > 0) {
      audioUrl = list[0].audioUrl
    } else if (detail && detail.audioUrl) {
      audioUrl = detail.audioUrl
    }

    if (audioUrl) {
      audio.src = audioUrl
      this.playAudio()
    }
  },

  playAudio() {
    audio.play()
    this.setData({ audioStatus: 'play' })
  },

  stopAudio() {
    if (audio && !audio.paused) {
      audio.stop()
    }
    this.setData({ audioStatus: 'stop' })
  },

  playRecordedAudio() {
    audio.src = this.data.file.url
    audio.play()
    this.setData({ audioStatus: 'play' })
  },

  // =========== 页面操作 ===========
  cancel() {
    wx.navigateBack()
  },

  confirm() {
    if (api.isEmpty(this.data.file.url)) {
      api.toast('没有录音需要保存')
      return
    }

    const config = CONFIG[this.data.recordType]
    api.upload(this.data.file.url, config.uploadPath, this).then(res => {
      this.save(res)
    })
  },

  // =========== 数据获取 ===========
  fetchQuestionDetail(isPull) {
    const config = CONFIG[this.data.recordType]
    api.request(this, config.detailApi, {
      userId: api.getUserId(),
      ...this.options
    }, isPull).finally(() => {
      this.finishLoading()
    })
  },

  save(audioUrl) {
    const config = CONFIG[this.data.recordType]
    const param = config.getSaveParam(this.options, this.data.file, this.data.duration)
    param.audioUrl = audioUrl

    api.request(this, config.saveApi, param, true, 'POST').then(() => {
      wx.disableAlertBeforeUnload()
      wx.navigateBack()
    })
  }
})
