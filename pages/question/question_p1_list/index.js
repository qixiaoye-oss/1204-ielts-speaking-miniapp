const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
Page({
  behaviors: [loadingProgress],
  data: {
    hasMastered: false
  },
  // ===========生命周期 Start===========
  onShow() {
    this.startLoading()
    this.listData(true)
  },
  onLoad(options) {
    this.setData({ hasMastered: options.hasMastered === 'true' })
  },
  onUnload() {
    wx.removeStorageSync('questionIdArr')
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  switchChange(e) {
    this.setData({
      hasMastered: e.detail.value
    })
    this.saveMastered()
  },
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
      url: '/pages/question/question_p1_detail/index' + api.parseParams(param)
    })
  },
  recordingOrClocking() {
    // 判断是否所有题目都存在题目音频
    var emptyAudioCount = this.data.list.filter(function (item) {
      return api.isEmpty(item.audioUrl)
    }).length
    if (emptyAudioCount != 0) {
      api.toast("请联系小助手补充数据")
      return
    }
    // 整理跳转选项
    let menu = []
    let menuUrl = []
    // 判断是否开启带练模式
    // if (true) {
    //   menu.push('带练')
    //   menuUrl.push(`../recording-p1/index?setId=${this.options.setId}&userId=${api.getUserId()}`)
    // }
    // if (this.data.practiceRecordId) {
    //   menu.push('带练结果')
    //   menuUrl.push(`../recording-p1-record/index?setId=${this.options.setId}&recordId=${this.data.practiceRecordId}`)
    // }
    let param = {
      type: 1,
      setId: this.options.setId,
      userId: api.getUserId(),
    }
    menu.push('录音')
    menuUrl.push('/pages/recording/p1_multirecord/index' + api.parseParams(param))
    menu.push('历史录音')
    menuUrl.push('/pages/recording/p1_multirecord_list/index' + api.parseParams(param))

    wx.showActionSheet({
      itemList: menu,
      success: ((res) => {
        wx.navigateTo({
          url: menuUrl[res.tapIndex],
        })
      })
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listData(isPull) {
    api.request(this, '/question/v2/p1/list', {
      userId: api.getUserId(),
      setType: 1,
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
  },
  saveMastered() {
    api.request(this, '/v2/unit/p1/update/mastered', {
      userId: api.getUserId(),
      unitId: this.options.setId,
      isMastered: this.data.hasMastered
    }, 'false')
  }
  // ===========数据获取 End===========
})