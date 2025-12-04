const api = getApp().api
Page({
  data: {
    checked: false
  },
  onReady() {
    api.getUser(this)
  },
  onChooseAvatar(e) {
    const {
      avatarUrl
    } = e.detail
    const _this = this
    api.upload(avatarUrl, '/head/', this).then(res => {
      _this.setData({
        [`user.headUrl`]: res
      })
    })
  },
  formSubmit(e) {
    const {
      nickName,
      headUrl
    } = e.detail.value
    this.uploadHead(headUrl, nickName)
  },
  //上传头像
  uploadHead(headUrl, nickName) {
    if (api.isEmpty(headUrl)) {
      api.toast('请选择用户头像')
      return
    }
    if (api.isEmpty(nickName)) {
      api.toast('请填写用户昵称')
      return
    }
    const _this = this
    _this.updateUser(headUrl, nickName);
  },
  updateUser(headUrl, nickName) {
    api.request(this, '/user/updateUser', {
      uid: api.getUserId(),
      nickName: nickName,
      avatarUrl: headUrl
    }, true).then(res => {
      wx.setStorageSync('user', res.user)
      wx.navigateBack({
        delta: 1,
      })
    })
  }
})