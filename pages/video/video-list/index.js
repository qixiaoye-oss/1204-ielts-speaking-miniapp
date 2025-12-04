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
  toChildPage({ currentTarget: { dataset: { id } } }) {
    const { setId } = this.data.options
    wx.navigateTo({
      url: `/pages/video/video-detail/index?id=${id}&setId=${setId}`
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/video/v2/list', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(res => {
      this.setData({
        options: this.options
      })
    }).finally(() => { this.finishLoading() })
  }
  // ===========数据获取 End===========
})