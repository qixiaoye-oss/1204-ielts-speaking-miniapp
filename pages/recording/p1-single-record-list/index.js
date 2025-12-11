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
    this.fetchRecordingList(false)
  },
  onLoad(options) {
    api.getUser(this)
    this.initAudioListBehavior()
    if (options.userId == this.data.user.id || this.data.user.isManager == 1) {
      this.fetchQuestionDetail(true)
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
  // ===========生命周期 End===========
  // ===========数据获取 Start===========
  fetchQuestionDetail(isPull) {
    api.request(this, '/v2/p1/detail', {
      userId: api.getUserId(),
      ...this.options
    }, isPull)
  },
  fetchRecordingList(isPull) {
    api.request(this, '/v2/p1/single/user/record', {
      userId: api.getUserId(),
      questionId: this.options.id
    }, isPull).finally(() => {
      this.finishLoading()
    })
  },
  delRecording(id) {
    const _this = this
    api.request(this, '/v2/p1/single/remove', {
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
