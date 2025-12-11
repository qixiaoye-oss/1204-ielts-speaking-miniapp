const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
const audioListBehavior = require('../../../behaviors/audioListBehavior')

// 根据 type 配置不同的 API
const apiConfig = {
  1: {
    detail: '/v2/p1/detail',
    list: '/v2/p1/single/user/record',
    del: '/v2/p1/single/remove',
    listParam: (options) => ({ userId: api.getUserId(), questionId: options.id })
  },
  2: {
    detail: '/question/detailNoAnswer',
    list: '/recording/list',
    del: '/recording/del',
    listParam: (options) => ({ ...options })
  },
  3: {
    detail: '/question/detailNoAnswer',
    list: '/recording/list',
    del: '/recording/del',
    listParam: (options) => ({ ...options })
  }
}

Page({
  behaviors: [loadingProgress, audioListBehavior],
  data: {
    msg: "",
    type: 2
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.fetchRecordingList(false)
  },
  onLoad(options) {
    const type = parseInt(options.type) || 2
    this.setData({
      type: type,
      color: options.color,
      background: options.background
    })
    api.getUser(this)
    this.initAudioListBehavior()
    if (options.userId == this.data.user.id || this.data.user.isManager == 1) {
      this.fetchQuestionDetail(true)
      this.fetchRecordingList(false)
    } else {
      api.modal("提示", '暂无权限', false)
      return
    }
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
    const config = apiConfig[this.data.type]
    api.request(this, config.detail, {
      userId: api.getUserId(),
      ...this.options
    }, isPull)
  },
  fetchRecordingList(isPull) {
    const config = apiConfig[this.data.type]
    api.request(this, config.list, config.listParam(this.options), isPull).finally(() => {
      this.finishLoading()
    })
  },
  delRecording(id) {
    const _this = this
    const config = apiConfig[this.data.type]
    api.request(this, config.del, {
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
