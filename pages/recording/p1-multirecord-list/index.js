const api = getApp().api
const loadingProgress = require('../../../behaviors/loadingProgress')
let audio = null
let timer = null
Page({
  behaviors: [loadingProgress],
  data: {
    msg: ""
  },
  // ===========生命周期 Start===========
  onShow() { },
  onLoad(options) {
    this.startLoading()
    api.getUser(this)
    audio = wx.createInnerAudioContext()
    audio.onPlay(() => {
      console.log('开始播放', new Date().getTime());
    })
    audio.onEnded(() => {
      this.stopAduio()
    })
    audio.onError((err) => {
      api.audioErr(err, audio.src)
      // api.modal("", "本模块电脑版播放功能需要等待微信官方更新，目前手机/平板可以正常播放。", false)
    })
    if (options.userId == this.data.user.id || this.data.user.isManager == 1) {
      this.listRecording(false)
    } else {
      api.modal("提示", '暂无权限', false)
      return
    }
  },
  onUnload() {
    audio.destroy()
  },
  onShareAppMessage() {
    return api.share('考雅狂狂说', this)
  },
  // ===========生命周期 End===========
  // ===========业务操作 Start===========
  playRecording(e) {
    this.stopAduio()
    let playIndex = e.currentTarget.dataset.index
    let list = this.data.list
    audio.src = list[playIndex].audioUrl
    wx.nextTick(() => {
      audio.play()
    })
    let path = `list[` + playIndex + `].playStatus`
    this.setData({
      [path]: 'play',
    })
  },
  stopAduio() {
    if (!audio.paused) {
      audio.stop()
    }
    let list = this.data.list
    list.forEach((i) => {
      i.playStatus = 'stop'
    })
    this.setData({
      list: list
    })
  },
  audioBtn(e) {
    let id = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除音频'],
      success: ((res) => {
        if (res.tapIndex === 0) {
          this.delRecording(id)
        }
      })
    })
  },
  toDetail(e) {
    wx.navigateTo({
      url: '../history-record-detail/index?id=' + e.currentTarget.dataset.id + '&userId=' + api.getUserId() + '&mode=continuous',
    })
  },
  // ===========业务操作 End===========
  // ===========数据获取 Start===========
  listRecording(isPull) {
    api.request(this, '/recording/list2Continuous', {
      ...this.options
    }, isPull).finally(() => {
      this.finishLoading()
    })
  },
  delRecording(id) {
    const _this = this
    api.request(this, '/recording/del2Continuous', {
      id: id
    }, true).then(() => {
      api.toast("删除成功")
      let timer = setTimeout(() => {
        _this.listRecording(false)
        clearTimeout(timer)
      }, 2000);
    })
  },
  // ===========数据获取 End===========
})