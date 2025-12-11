const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
const audioListBehavior = require('../../../behaviors/audioListBehavior')

Page({
  behaviors: [loadingProgress, audioListBehavior],
  data: {
    msg: ""
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
  },
  onLoad(options) {
    this.setData({
      color: options.color,
      background: options.background
    })
    api.getUser(this)
    this.initAudioListBehavior()
    if (options.userId == this.data.user.id || this.data.user.isManager == 1) {
      this.fetchRecordingList(false)
    } else {
      api.modal("提示", '暂无权限', false)
      return
    }
    this.fetchQuestionDetail(true)
    this.fetchRecordingList(false)
  },
  onUnload() {
    this.destroyAudioListBehavior()
  },
  onShareAppMessage() {
    return api.share('考雅狂狂说', this)
  },
  toDetail(e) {
    wx.navigateTo({
      url: '../history-record-detail/index?id=' + e.currentTarget.dataset.id + '&userId=' + api.getUserId() + '&mode=single',
    })
  },
  // ===========生命周期 End===========
  // ===========数据获取 Start===========
  fetchQuestionDetail(isPull) {
    api.request(this, '/question/detailNoAnswer', {
      ...this.options
    }, isPull)
  },
  fetchRecordingList(isPull) {
    api.request(this, '/recording/list', {
      ...this.options
    }, isPull).finally(() => {
      this.finishLoading()
    })
  },
  delRecording(id) {
    const _this = this
    api.request(this, '/recording/del', {
      id: id
    }, true).then(() => {
      api.toast("删除成功")
      let timer = setTimeout(() => {
        _this.fetchRecordingList(false)
        clearTimeout(timer)
      }, 2000);
    })
  },
  // ===========数据获取 End===========
})
