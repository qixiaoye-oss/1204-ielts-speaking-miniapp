const api = getApp().api
Page({
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.listData(true)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  toQuestionPage(e) {
    wx.removeStorageSync('questionIdArr')
    let param = {
      userId: api.getUserId(),
      ...e.currentTarget.dataset
    }
    wx.navigateTo({
      url: '/pages/question/question-p3-detail/index' + api.parseParams(param),
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/material/v2/listLink', {
      userId: api.getUserId(),
      ...this.options
    }, isPull)
  }
  // ===========数据获取 End===========
})