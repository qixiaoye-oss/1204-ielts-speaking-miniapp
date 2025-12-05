const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
let audio = null
let timer = null
let wordArr = []
Page({
  behaviors: [loadingProgress],
  data: {
    nowPlayIndex: 0,
    showPlayIndex: -1,
    nowPlayStatus: 'stop',
    progress: 0
  },
  // ===========生命周期 Start===========
  onShow() { },
  onLoad(options) {
    this.startLoading()
    api.getUser(this)
    audio = wx.createInnerAudioContext()
    audio.onPlay(() => {
      console.log('开始播放', new Date().getTime());
    })
    audio.onEnded(() => {
      clearInterval(timer)
      this.setData({
        nowPlayStatus: 'stop',
        showPlayIndex: -1,
      })
    })
    audio.onError((err) => {
      api.audioErr(err, audio.src)
      // api.modal("", "本模块电脑版播放功能需要等待微信官方更新，目前手机/平板可以正常播放。", false)
    })
    if (this.data.user.id == options.userId || this.data.user.isManager == '1') {
      this.getRecord(false)
    } else {
      api.modal("提示", '暂无权限', false)
      return
    }
  },
  onUnload() {
    audio.destroy()
  },
  onShareAppMessage() {
    return api.share(this.data.setTitle, this, '/image/record/share.png')
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  playRecording() {
    this.setData({
      nowPlayStatus: 'play'
    })
    audio.play()
    this.audioTimeUpdate()
  },
  playWord(e) {
    this.stopAduio()
    let nowPlayIndex = e.currentTarget.dataset.index
    // console.log(list[nowPlayIndex].wbg)
    audio.startTime = wordArr[nowPlayIndex].wbg
    audio.seek(wordArr[nowPlayIndex].wbg)
    wx.nextTick(() => {
      audio.play()
      this.audioTimeUpdate()
    })
    this.setData({
      nowPlayStatus: 'play'
    })
  },
  audioTimeUpdate() {
    timer = setInterval(() => {
      let showPlayIndex = -1
      for (let i = 0; i < wordArr.length; i++) {
        const item = wordArr[i];
        if (audio.currentTime > item.wbg && audio.currentTime < item.wed) {
          showPlayIndex = i
        }
      }
      this.setData({
        progress: (audio.currentTime / audio.duration) * 100,
        showPlayIndex: showPlayIndex
      })
    }, 10);
  },
  stopAduio() {
    for (let i = 0; i < 4; i++) {
      audio.currentTime
      audio.duration
    }
    if (!audio.paused) {
      audio.stop()
      clearInterval(timer)
      this.setData({
        nowPlayStatus: 'stop',
        showPlayIndex: -1,
      })
    }
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getRecord(isPull) {
    api.request(this, '/recording/getContinuousDetail', {
      ...this.options
    }, isPull).then(res => {
      wordArr = res.detail.list || []
      audio.src = res.detail.audioUrl
      wx.nextTick(() => {
        audio.duration
      })
    }).finally(() => {
      this.finishLoading()
    })
  }
  // ===========数据获取 End===========
})