const loadingProgress = require('../../../behaviors/loadingProgress')
const api = getApp().api
Page({
  behaviors: [loadingProgress],
  data: {},
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.getData(true)
  },
  onLoad(options) {
    this.setData({
      queryParam: options
    })
  },
  onUnload() {},
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  getData(isPull) {
    api.request(this, '/recording/getWordDetail', {
      userId: api.getUserId(),
      ...this.data.queryParam
    }, isPull).then(res => {

    }).finally(() => { this.finishLoading() })
  },
  // ===========数据获取 End===========
})