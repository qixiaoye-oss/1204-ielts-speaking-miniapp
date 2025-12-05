const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
Page({
  behaviors: [loadingProgress],
  data: {
    showMode: "full"
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
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
      url: `/pages/question/question_p1_list/index?setId=${item.id}&hasMastered=${item.hasMastered}`,
    })
  },
  changeShowMode(e) {
    this.setData({
      showMode: e.currentTarget.dataset.mode
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/set/v2/list', {
      albumId: this.options.id,
      albumType: 1,
      userId: api.getUserId()
    }, isPull).finally(() => { this.finishLoading() })
  },
  // ===========数据获取 End===========
})