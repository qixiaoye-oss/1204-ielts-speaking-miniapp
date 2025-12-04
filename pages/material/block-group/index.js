const api = getApp().api
Page({
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.listData(true)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  toUnit(e) {
    // 判断是否开启了打卡权限
    const { item } = e.currentTarget.dataset
    this.toDetailPage(item)
    // let list = item.list || []
    // if (list.length > 0) {
    //   this.toPracticePage(item)
    // } else {
    //   this.toDetailPage(item)
    // }
  },
  // 去往详情页
  toDetailPage(item) {
    let param = api.parseParams({
      setId: this.options.setId,
      id: item.id,
    })
    wx.navigateTo({
      url: `/pages/material/block-detail/index${param}`
    })
  },
  toQuestionListPage(e) {
    const item = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/material/link-question/index?id=${item.id}&dateLabel=${this.options.dateLabel}`
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/material/v2/list', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(res => {
      let idBySort = res.list.flatMap(item => (item.list || []).map(subItem => subItem.id));
      wx.setStorageSync('materialIdBySort', idBySort)
    })
  }
  // ===========数据获取 End===========
})