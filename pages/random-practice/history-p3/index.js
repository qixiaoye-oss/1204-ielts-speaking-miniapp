const api = getApp().api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    audioContext: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.listData()
    const audioContext = wx.createInnerAudioContext()
    this.setData({ audioContext })
    audioContext.onEnded(() => {
      this.stopAduio()
    })
    audioContext.onError((err) => {
      api.audioErr(err, audioContext.src)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  // ===========业务操作 Start===========
  // 开始随机练习
  startPractice() {
    wx.navigateTo({
      url: '../practice-p3/index'
    })
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/recording/questions_record_detail/questions_record_detail?id=' + e.currentTarget.dataset.id + '&userId=' + api.getUserId() + '&mode=continuous',
    })
  },
  playRecording({ currentTarget: { dataset: { groupIndex, chapterIndex } } }) {
    this.stopAduio()
    const { audioContext, list } = this.data
    audioContext.src = list[groupIndex].list[chapterIndex].audioUrl
    wx.nextTick(() => {
      audioContext.play()
    })
    this.setData({
      [`list[${groupIndex}].list[${chapterIndex}].playStatus`]: 'play',
    })
  },
  stopAduio() {
    const { audioContext, list } = this.data
    if (!audioContext.paused) {
      audioContext.stop()
    }
    list.forEach((i) => {
      i.list.forEach(j => {
        j.playStatus = 'stop'
      })
    })
    this.setData({
      list: list
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData() {
    api.request(this, '/question/v2/p3/practice/random/record', { userId: api.getUserId() }, true).then(res => {

    })
  }
})