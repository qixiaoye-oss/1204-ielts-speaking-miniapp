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
  onUnload() {
    wx.removeStorageSync('questionIdArr')
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  toChildPage({ currentTarget: { dataset: { id, childTotal } } }) {
    if (childTotal == 0) {
      api.modal('', "本题暂无答案", false)
      return
    }
    let param = {
      setId: this.options.setId,
      id: id
    }
    wx.navigateTo({
      url: '/pages/question/question_p3_detail/index' + api.parseParams(param)
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/question/v2/p3/list', {
      userId: api.getUserId(),
      setType: 3,
      ...this.options
    }, isPull).then(res => {
      let idArr = []
      res.list.forEach(i => {
        idArr.push(i.id)
      })
      wx.setStorageSync('questionIdArr', idArr)
    }).finally(() => {
      this.finishLoading()
    })
  }
  // ===========数据获取 End===========
})