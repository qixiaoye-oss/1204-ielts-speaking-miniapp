const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
Page({
  behaviors: [loadingProgress],
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
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
    }, isPull).finally(() => {
      this.finishLoading()
    })
  }
  // ===========数据获取 End===========
})