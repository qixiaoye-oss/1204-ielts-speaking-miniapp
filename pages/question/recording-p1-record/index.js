const api = getApp().api
let audioContext = null
Page({
  data: {
  },
  // ===========生命周期 Start===========
  onShow() {
    this.listData(true)
  },
  onLoad() {
    // 创建音频播放上下文
    audioContext = wx.createInnerAudioContext()
    audioContext.onEnded(() => {
      this.resetSentenceAudioStatus()
    })
    audioContext.onError((res) => {
      api.toast(res)
    })
  },
  cancel() {
    wx.navigateBack()
  },
  onUnload() {
    if (audioContext) {
      audioContext.destroy()
    }
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  playAudio({ currentTarget: { dataset: { groupIndex, practiceIndex } } }) {
    this.stopAudio()
    let { list } = this.data
    audioContext.src = list[groupIndex].list[practiceIndex].audioUrl
    wx.nextTick(() => {
      audioContext.play()
      this.setData({
        [`list[${groupIndex}].list[${practiceIndex}].playing`]: 'play'
      })
    })
  },
  playSample({ currentTarget: { dataset: { groupIndex, practiceIndex } } }) {
    let { list } = this.data
    let url = list[groupIndex].list[practiceIndex].sampleAudio
    if (url) {
      this.stopAudio()
      audioContext.src = url
      wx.nextTick(() => {
        audioContext.play()
      })
    } else {
      api.toast("暂无示例音频")
    }
  },
  stopAudio() {
    audioContext.stop()
    this.resetSentenceAudioStatus()
  },
  // 重置句子音频播放状态
  resetSentenceAudioStatus() {
    let { list } = this.data
    list.forEach((i) => {
      i.list.forEach((j) => {
        j.playing = 'stop'
      })
    })
    this.setData({
      list: list
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/v2/question/p1/practice/record', {
      userId: api.getUserId(),
      ...this.options
    }, isPull)
  }
  // ===========数据获取 End===========
})