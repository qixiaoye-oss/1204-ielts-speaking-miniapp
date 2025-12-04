const api = getApp().api
Page({
  data: {
    tapIndex: 0
  },
  // ===========生命周期 Start===========
  onShow() {
    this.listData(true)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  toUnit(e) {
    const { item } = e.currentTarget.dataset
    if (item.isInside == '0') {
      api.modal('', '暂未开通，请关注通知~', false)
      return
    }
    wx.navigateTo({
      url: `/pages/video/video-list/index?setId=${item.id}`,
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/set/v2/list', {
      albumId: this.options.id,
      albumType: 7,
      userId: api.getUserId()
    }, isPull)
  },
  // ===========数据获取 End===========
})