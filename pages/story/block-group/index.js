const api = getApp().api
Page({
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.listData(true)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  toChildPage(e) {
    const item = e.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/story/block-detail/index' + api.parseParams(item),
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/story/v2/list', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(res => {
      this.setData({
        options: this.options
      })
    })
  }
  // ===========数据获取 End===========
})