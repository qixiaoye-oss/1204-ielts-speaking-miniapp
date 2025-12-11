/**
 * 录音功能 Behavior
 * 用于录音页面的公共逻辑
 *
 * 使用方法：
 * 1. 在页面中引入: const recorderBehavior = require('../../behaviors/recorderBehavior')
 * 2. 添加到 behaviors: behaviors: [recorderBehavior]
 * 3. 在 onLoad 中调用 this.initRecorderBehavior() 初始化
 * 4. 在 onUnload 中调用 this.destroyRecorderBehavior() 销毁
 *
 * 提供的方法：
 * - checkRecordPermission(): 检查录音权限并开始录音
 * - stopRecording(): 停止录音
 * - playAudio(): 播放音频
 * - stopAudio(): 停止音频
 * - playRecordedAudio(): 播放已录制的音频
 * - cancel(): 返回上一页
 *
 * 需要页面实现的方法：
 * - getRecorderConfig(): 返回录音配置
 * - onRecordingStart(): 录音开始时的回调
 * - onRecordingStop(res): 录音结束时的回调
 * - confirm(): 确认保存录音
 */

const api = getApp().api

module.exports = Behavior({
  data: {
    // 录音状态: 0-未开始, 1-录音中, 2-录音完成
    status: 0,
    // 录音文件信息
    file: {
      time: "",
      url: "",
      duration: 0
    },
    // 音频播放状态
    audioStatus: "stop",
    // 录音开始时间戳
    nowTime: 0,
    // 录音时长(秒)
    recordingTime: 0
  },

  methods: {
    /**
     * 初始化录音 Behavior
     * 在页面 onLoad 中调用
     */
    initRecorderBehavior() {
      // 创建音频上下文
      this._audio = wx.createInnerAudioContext()
      this._audio.onEnded(() => {
        this.stopAudio()
      })
      this._audio.onError((res) => {
        console.log('Audio error:', res)
      })

      // 创建录音管理器
      this._manager = wx.getRecorderManager()
      this._manager.onStop((res) => {
        this._audio.src = res.tempFilePath
        const time = api.formatTime(new Date())
        this.setData({
          duration: res.duration,
          [`file.time`]: time,
          [`file.url`]: res.tempFilePath,
          [`file.duration`]: this.data.recordingTime,
          status: 2
        })
        this._clearTimer()
        // 调用页面的回调方法
        if (this.onRecordingStop) {
          this.onRecordingStop(res)
        }
      })
      this._manager.onError((res) => {
        const errType = this.getRecorderType ? this.getRecorderType() : '录音'
        api.recorderErr(errType, res.errMsg)
      })
      this._manager.onStart(() => {
        console.log("开始录音监听")
        this._startRecordingInternal()
        // 调用页面的回调方法
        if (this.onRecordingStart) {
          this.onRecordingStart()
        }
      })

      // 启用退出前提醒
      wx.enableAlertBeforeUnload({
        message: "未保存录音退出将丢失录音文件，是否退出？"
      })
    },

    /**
     * 销毁录音 Behavior
     * 在页面 onUnload 中调用
     */
    destroyRecorderBehavior() {
      if (this._audio) {
        this._audio.stop()
      }
      if (this._manager) {
        this._manager.stop()
      }
      this._clearTimer()
    },

    /**
     * 检查录音权限并开始录音
     */
    checkRecordPermission() {
      const that = this
      const config = this.getRecorderConfig ? this.getRecorderConfig() : this._getDefaultConfig()
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.record']) {
            console.log("权限验证通过，开始录音")
            that._manager.start(config)
          } else {
            api.toast("未开启麦克风权限无法进行录音")
          }
        }
      })
    },

    /**
     * 内部方法：开始录音后的处理
     */
    _startRecordingInternal() {
      this.setData({
        status: 1,
        nowTime: Date.now()
      })
      this._startTimer()
    },

    /**
     * 停止录音
     */
    stopRecording() {
      this.setData({
        status: 2
      })
      this._manager.stop()
      this._clearTimer()
    },

    /**
     * 开始录音计时器
     */
    _startTimer() {
      this._recordingTimer = setInterval(() => {
        const startTime = this.data.nowTime
        const difference = Date.now() - startTime
        this.setData({
          recordingTime: Math.round(difference / 1000)
        })
      }, 100)
    },

    /**
     * 清除录音计时器
     */
    _clearTimer() {
      if (this._recordingTimer) {
        clearInterval(this._recordingTimer)
        this._recordingTimer = null
      }
    },

    /**
     * 播放音频
     */
    playAudio() {
      this._audio.play()
      this._audio.duration
      this.setData({
        audioStatus: 'play'
      })
    },

    /**
     * 停止音频
     */
    stopAudio() {
      if (this._audio && !this._audio.paused) {
        this._audio.stop()
      }
      this.setData({
        audioStatus: 'stop'
      })
    },

    /**
     * 播放已录制的音频
     */
    playRecordedAudio() {
      this._audio.src = this.data.file.url
      this._audio.play()
      this.setData({
        audioStatus: 'play'
      })
    },

    /**
     * 返回上一页
     */
    cancel() {
      wx.navigateBack()
    },

    /**
     * 获取默认录音配置
     */
    _getDefaultConfig() {
      return {
        duration: 240000,
        sampleRate: 48000,
        numberOfChannels: 1,
        encodeBitRate: 320000,
        format: 'mp3',
        frameSize: 50
      }
    },

    /**
     * 设置音频源
     */
    setAudioSrc(src) {
      if (this._audio) {
        this._audio.src = src
      }
    },

    /**
     * 获取音频对象
     */
    getAudio() {
      return this._audio
    }
  }
})
