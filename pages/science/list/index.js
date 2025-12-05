const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')

Page({
  behaviors: [loadingProgress],
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.listData()
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  // 去往答题
  toDetail(e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../detail/index?id=${item.id}`,
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  // 访问接口获取数据
  listData() {
    api.request(this, '/v2/popular/science/list', {}, true).finally(() => {
      this.finishLoading()
    })
  },
  // ===========数据获取 End===========
})