const api = getApp().api
Page({
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.listData()
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========

  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  // 访问接口获取数据
  listData() {
    api.request(this, `/v2/popular/science/${this.options.id}`, {}, true)
  },
  // ===========数据获取 End===========
})