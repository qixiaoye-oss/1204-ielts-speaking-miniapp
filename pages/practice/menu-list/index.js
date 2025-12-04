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
    const _this = this
    let { item } = e.currentTarget.dataset
    if (item.recordId) {
      wx.showActionSheet({
        itemList: ['重新开始练习', '查看练习记录（' + item.recordTotal + '）'],
        success: ((res) => {
          if (res.tapIndex === 0) {
            _this.gotoRecordingPage(item)
          }
          if (res.tapIndex === 1) {
            wx.navigateTo({
              url: '/pages/practice/record_detail/record_detail?recordId=' + item.recordId + "&id=" + item.id,
            })
          }
        })
      })
    } else {
      _this.gotoRecordingPage(item)
    }
  },
  gotoRecordingPage(item) {
    // 判断是否开启了学习模式，如果开启则给予选择，如果没有则直接跳转
    if (item.studyModeState === '1') {
      wx.showActionSheet({
        itemList: ['练习模式', '学习模式'],
        success: ((res) => {
          if (res.tapIndex === 0) {
            wx.navigateTo({
              url: `/pages/practice/recording/recording?id=${item.id}&model=practice`
            })
          }
          if (res.tapIndex === 1) {
            wx.navigateTo({
              url: `/pages/practice/recording/recording?id=${item.id}&model=study`
            })
          }
        })
      })
    } else {
      wx.navigateTo({
        url: `/pages/practice/recording/recording?id=${item.id}&model=practice`
      })
    }
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/practice/list', {
      userId: api.getUserId(),
      ...this.options
    }, isPull).then(res => {

    })
  }
  // ===========数据获取 End===========
})